begin;
-- Sponsor projection only: prefer corrected details, retain original registration dates.
create function portal_private.sponsor_guest_rows(p_event text) returns jsonb
language sql stable security definer set search_path='' as $$
 with enriched as (
  select x.value,x.ordinality from portal_private.report_current c join portal_private.report_versions v on v.id=c.version_id
  cross join lateral jsonb_array_elements(v.records) with ordinality x(value,ordinality)
  where c.event_id=p_event and c.source_kind='enriched'
 ), registrations as (
  select x.value,x.ordinality from portal_private.report_current c join portal_private.report_versions v on v.id=c.version_id
  cross join lateral jsonb_array_elements(v.records) with ordinality x(value,ordinality)
  where c.event_id=p_event and c.source_kind='eventbrite_raw'
 ), guests as (
  select e.ordinality as position,jsonb_build_object('firstName',e.value->>'firstName','lastName',e.value->>'lastName','company',e.value->>'company','jobTitle',e.value->>'jobTitle','linkedin',e.value->>'linkedin',
   'registeredAt',coalesce((select r.value->>'registeredAt' from registrations r where
    (nullif(trim(e.value->>'attendeeId'),'') is not null and trim(e.value->>'attendeeId')=trim(r.value->>'attendeeId')) or
    (nullif(trim(e.value->>'email'),'') is not null and lower(trim(e.value->>'email'))=lower(trim(r.value->>'email'))) or
    (nullif(trim(e.value->>'firstName'),'') is not null and nullif(trim(e.value->>'lastName'),'') is not null and
     lower(regexp_replace(trim(e.value->>'firstName'),'[[:space:]]+',' ','g'))=lower(regexp_replace(trim(r.value->>'firstName'),'[[:space:]]+',' ','g')) and
     lower(regexp_replace(trim(e.value->>'lastName'),'[[:space:]]+',' ','g'))=lower(regexp_replace(trim(r.value->>'lastName'),'[[:space:]]+',' ','g'))) or
    exists(select 1 from portal_private.registration_links l where l.event_id=p_event and l.registration_id=r.value->>'attendeeId' and l.active and
     ((l.target_reference<>'' and l.target_reference=e.value->>'attendeeId') or (l.target_email<>'' and l.target_email=lower(trim(e.value->>'email')))))
   order by nullif(r.value->>'registeredAt','') asc nulls last,r.ordinality limit 1),'')) as guest
  from enriched e
  union all
  select 1000000+r.ordinality,jsonb_build_object('firstName',r.value->>'firstName','lastName',r.value->>'lastName','company',r.value->>'company','jobTitle',r.value->>'jobTitle','linkedin','','registeredAt',r.value->>'registeredAt')
  from registrations r where not portal_private.registration_is_enriched(p_event,r.value)
 ) select coalesce(jsonb_agg(guest order by position),'[]'::jsonb) from guests;
$$;
revoke all on function portal_private.sponsor_guest_rows(text) from public,anon,authenticated;
create function public.portal_sponsor_guests(p_event text,p_sponsor uuid) returns jsonb
language plpgsql security definer set search_path='' as $$
begin
 perform portal_private.require_sponsor(p_event,p_sponsor);
 if not exists(select 1 from portal_private.terms_acceptance where user_id=auth.uid() and terms_version='off-air-2026-11-16-v2') then raise exception using errcode='42501',message='terms_required';end if;
 return jsonb_build_object('rows',portal_private.sponsor_guest_rows(p_event),'canViewEmail',false,'scope','all_guests',
 'syncedAt',(select v.created_at from portal_private.report_current c join portal_private.report_versions v on v.id=c.version_id where c.event_id=p_event and c.source_kind='eventbrite_raw'));
end $$;
revoke all on function public.portal_sponsor_guests(text,uuid) from public,anon,authenticated;
grant execute on function public.portal_sponsor_guests(text,uuid) to authenticated;
create or replace function public.portal_owner_sponsor_preview() returns jsonb
language plpgsql security definer set search_path='' as $$
begin
 perform portal_private.require_owner();
 return jsonb_build_object('report',jsonb_build_object('sponsor','Owner preview','event',(select title from portal_private.events where id='off-air'),'accepted',true,'termsVersion','off-air-2026-11-16-v2','canViewEmail',false,'rows','[]'::jsonb),
 'raw',jsonb_build_object('rows',portal_private.sponsor_guest_rows('off-air'),'canViewEmail',false,'scope','all_guests','syncedAt',(select v.created_at from portal_private.report_current c join portal_private.report_versions v on v.id=c.version_id where c.event_id='off-air' and c.source_kind='eventbrite_raw')));
end $$;
commit;
