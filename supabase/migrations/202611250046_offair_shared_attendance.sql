begin;
create or replace function public.portal_sponsor_attendance(p_sponsor uuid) returns jsonb
language plpgsql security definer set search_path='' as $$
begin
 if p_sponsor is null then
  perform portal_private.require_owner();
 else
  perform portal_private.require_attendance_sponsor(p_sponsor);
 end if;
 return jsonb_build_object(
  'closesAt',(select closes_at from portal_private.attendance_windows where event_id='off-air'),
  'statuses',coalesce((
   with corrections as (
    select distinct on (guest_ref) guest_ref,status
    from portal_private.sponsor_attendance
    where event_id='off-air'
    order by guest_ref,updated_at desc,sponsor_id
   )
   select jsonb_object_agg(coalesce(s.guest_ref,c.guest_ref),coalesce(s.status,c.status))
   from (select guest_ref,status from portal_private.attendance_checkins where event_id='off-air') c
   full join corrections s using(guest_ref)
  ),'{}'::jsonb)
 );
end $$;

create or replace function public.portal_sponsor_attendance_set(p_sponsor uuid,p_guest uuid,p_status text) returns jsonb
language plpgsql security definer set search_path='' as $$
declare actor uuid; matches integer;
begin
 actor:=portal_private.require_attendance_sponsor(p_sponsor);
 if p_guest is null or p_status is null or p_status not in ('attended','unable_to_attend','no_show','unconfirmed') then
  raise exception 'invalid_attendance_status';
 end if;
 -- Resolve and lock the event's current guest references before ordering corrections.
 select count(*) into matches from jsonb_array_elements(portal_private.sponsor_guest_rows('off-air')) r
 where r->>'guestRef'=p_guest::text;
 if matches<>1 then raise exception 'guest_selection_unavailable';end if;
 if not exists(select 1 from portal_private.attendance_windows where event_id='off-air' and closes_at>clock_timestamp()) then
  raise exception using errcode='42501',message='attendance_editing_closed';
 end if;
 insert into portal_private.sponsor_attendance(event_id,sponsor_id,guest_ref,status,updated_by,updated_at)
 values('off-air',p_sponsor,p_guest,p_status,actor,clock_timestamp())
 on conflict(event_id,sponsor_id,guest_ref) do update
 set status=excluded.status,updated_by=excluded.updated_by,updated_at=excluded.updated_at;
 return public.portal_sponsor_attendance(p_sponsor);
end $$;
commit;
