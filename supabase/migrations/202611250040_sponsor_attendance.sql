begin;
create table portal_private.attendance_windows (
 event_id text primary key references portal_private.events(id),
 closes_at timestamptz not null
);
create table portal_private.attendance_checkins (
 event_id text not null,
 guest_ref uuid not null,
 status text not null check (status in ('attended','no_show')),
 primary key(event_id,guest_ref),
 foreign key(event_id,guest_ref) references portal_private.meeting_guest_refs(event_id,id)
);
create table portal_private.sponsor_attendance (
 event_id text not null,
 sponsor_id uuid not null references portal_private.sponsors(id),
 guest_ref uuid not null,
 status text not null check (status in ('attended','unable_to_attend','no_show','unconfirmed')),
 updated_by uuid not null references auth.users(id),
 updated_at timestamptz not null default now(),
 primary key(event_id,sponsor_id,guest_ref),
 foreign key(event_id,guest_ref) references portal_private.meeting_guest_refs(event_id,id)
);
alter table portal_private.attendance_windows enable row level security;
alter table portal_private.attendance_checkins enable row level security;
alter table portal_private.sponsor_attendance enable row level security;
revoke all on portal_private.attendance_windows,portal_private.attendance_checkins,portal_private.sponsor_attendance from public,anon,authenticated;

create function portal_private.require_attendance_sponsor(p_sponsor uuid) returns uuid
language plpgsql security definer set search_path='' as $$
declare actor uuid;
begin
 actor:=portal_private.require_sponsor('off-air',p_sponsor);
 if not exists(select 1 from portal_private.terms_acceptance where user_id=actor and terms_version='off-air-2026-11-16-v2') then
  raise exception using errcode='42501',message='terms_required';
 end if;
 return actor;
end $$;
revoke all on function portal_private.require_attendance_sponsor(uuid) from public,anon,authenticated;

create function public.portal_sponsor_attendance(p_sponsor uuid) returns jsonb
language plpgsql security definer set search_path='' as $$
begin
 perform portal_private.require_attendance_sponsor(p_sponsor);
 return jsonb_build_object(
  'closesAt',(select closes_at from portal_private.attendance_windows where event_id='off-air'),
  'statuses',coalesce((
   select jsonb_object_agg(coalesce(s.guest_ref,c.guest_ref),coalesce(s.status,c.status))
   from (select guest_ref,status from portal_private.attendance_checkins where event_id='off-air') c
   full join (select guest_ref,status from portal_private.sponsor_attendance where event_id='off-air' and sponsor_id=p_sponsor) s using(guest_ref)
  ),'{}'::jsonb)
 );
end $$;

create function public.portal_sponsor_attendance_set(p_sponsor uuid,p_guest uuid,p_status text) returns jsonb
language plpgsql security definer set search_path='' as $$
declare actor uuid; matches integer;
begin
 actor:=portal_private.require_attendance_sponsor(p_sponsor);
 if p_guest is null or p_status is null or p_status not in ('attended','unable_to_attend','no_show','unconfirmed') then
  raise exception 'invalid_attendance_status';
 end if;
 select count(*) into matches from jsonb_array_elements(portal_private.sponsor_guest_rows('off-air')) r
 where r->>'guestRef'=p_guest::text;
 if matches<>1 then raise exception 'guest_selection_unavailable'; end if;
 if not exists(select 1 from portal_private.attendance_windows where event_id='off-air' and closes_at>clock_timestamp()) then
  raise exception using errcode='42501',message='attendance_editing_closed';
 end if;
 insert into portal_private.sponsor_attendance(event_id,sponsor_id,guest_ref,status,updated_by)
 values('off-air',p_sponsor,p_guest,p_status,actor)
 on conflict(event_id,sponsor_id,guest_ref) do update
 set status=excluded.status,updated_by=excluded.updated_by,updated_at=clock_timestamp();
 return public.portal_sponsor_attendance(p_sponsor);
end $$;

revoke all on function public.portal_sponsor_attendance(uuid),public.portal_sponsor_attendance_set(uuid,uuid,text) from public,anon;
grant execute on function public.portal_sponsor_attendance(uuid),public.portal_sponsor_attendance_set(uuid,uuid,text) to authenticated;
commit;
