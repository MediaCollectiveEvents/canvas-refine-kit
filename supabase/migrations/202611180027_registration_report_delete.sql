begin;
-- Recoverable owner-only report exclusions. Original Eventbrite source versions remain intact.
create table portal_private.registration_exclusions(
 event_id text not null references portal_private.events(id),
 registration_id text not null check(registration_id ~ '^[0-9]{1,40}$'),
 record jsonb not null,
 active boolean not null default true,
 decided_by uuid not null references auth.users(id),
 decided_at timestamptz not null default now(),
 primary key(event_id,registration_id)
);
alter table portal_private.registration_exclusions enable row level security;
revoke all on portal_private.registration_exclusions from public,anon,authenticated;
create function portal_private.registration_is_deleted(p_event text,p_registration jsonb) returns boolean
language sql stable security definer set search_path='' as $$
 select exists(select 1 from portal_private.registration_exclusions e where e.event_id=p_event and e.registration_id=p_registration->>'attendeeId' and e.active);
$$;
revoke all on function portal_private.registration_is_deleted(text,jsonb) from public,anon,authenticated;
create function public.portal_owner_registration_delete(p_registration text,p_deleted boolean) returns jsonb
language plpgsql security definer set search_path='' as $$
declare actor uuid; source_record jsonb;
begin
 actor:=portal_private.require_owner();
 if p_deleted is null or p_registration is null or p_registration !~ '^[0-9]{1,40}$' then raise exception 'invalid_registration';end if;
 perform 1 from portal_private.events where id='off-air' for update;
 if p_deleted then
  select x.value into source_record from portal_private.report_current c join portal_private.report_versions v on v.id=c.version_id cross join lateral jsonb_array_elements(v.records) x(value) where c.event_id='off-air' and c.source_kind='eventbrite_raw' and x.value->>'attendeeId'=p_registration limit 1;
  if source_record is null then raise exception 'registration_not_found';end if;
  insert into portal_private.registration_exclusions(event_id,registration_id,record,decided_by) values('off-air',p_registration,source_record,actor)
  on conflict(event_id,registration_id) do update set active=true,record=excluded.record,decided_by=actor,decided_at=now();
 else
  update portal_private.registration_exclusions set active=false,decided_by=actor,decided_at=now() where event_id='off-air' and registration_id=p_registration and active;
  if not found then raise exception 'deleted_registration_not_found';end if;
 end if;
 insert into portal_private.audit(actor,event_id,action,details) values(actor,'off-air',case when p_deleted then 'delete_registration_from_report' else 'restore_registration_to_report' end,jsonb_build_object('registrationId',p_registration));
 return jsonb_build_object('deleted',p_deleted);
end $$;
revoke all on function public.portal_owner_registration_delete(text,boolean) from public,anon,authenticated;
grant execute on function public.portal_owner_registration_delete(text,boolean) to authenticated;
create or replace function public.portal_owner_unenriched() returns jsonb
language plpgsql security definer set search_path='' as $$
declare raw jsonb; enriched jsonb; synced timestamptz;
begin
 perform portal_private.require_owner();
 select v.records,v.created_at into raw,synced from portal_private.report_current c join portal_private.report_versions v on v.id=c.version_id where c.event_id='off-air' and c.source_kind='eventbrite_raw';
 select v.records into enriched from portal_private.report_current c join portal_private.report_versions v on v.id=c.version_id where c.event_id='off-air' and c.source_kind='enriched';
 return jsonb_build_object('syncedAt',synced,'rawCount',jsonb_array_length(coalesce(raw,'[]')),'enrichedCount',jsonb_array_length(coalesce(enriched,'[]')),'deletedRows',coalesce((select jsonb_agg(e.record||jsonb_build_object('deletedAt',e.decided_at) order by e.decided_at desc) from portal_private.registration_exclusions e where e.event_id='off-air' and e.active),'[]'::jsonb),'rows',coalesce((
 select jsonb_agg(x.value order by x.ordinality) from jsonb_array_elements(coalesce(raw,'[]')) with ordinality as x(value,ordinality)
 where not portal_private.registration_is_deleted('off-air',x.value) and not portal_private.registration_is_enriched('off-air',x.value)),'[]'));
end $$;
create or replace function portal_private.sponsor_guest_rows(p_event text) returns jsonb
language sql stable security definer set search_path='' as $$
 with enriched as (
  select x.value,x.ordinality from portal_private.report_current c join portal_private.report_versions v on v.id=c.version_id
  cross join lateral jsonb_array_elements(v.records) with ordinality x(value,ordinality)
  where c.event_id=p_event and c.source_kind='enriched'
 ), registrations as (
  select x.value,x.ordinality from portal_private.report_current c join portal_private.report_versions v on v.id=c.version_id
  cross join lateral jsonb_array_elements(v.records) with ordinality x(value,ordinality)
  where c.event_id=p_event and c.source_kind='eventbrite_raw' and not portal_private.registration_is_deleted(p_event,x.value)
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
create or replace function public.portal_sponsor_eventbrite(p_event text,p_sponsor uuid) returns jsonb
language plpgsql security definer set search_path='' as $$
declare actor uuid; emails boolean;
begin
 actor:=portal_private.require_sponsor(p_event,p_sponsor);
 if not exists(select 1 from portal_private.terms_acceptance where user_id=actor and terms_version='off-air-2026-11-16-v2') then raise exception using errcode='42501',message='terms_required';end if;
 -- Guest email is reserved for a separately approved post-event attendance download.
 emails:=false;
 return coalesce((select jsonb_build_object('syncedAt',v.created_at,'scope','unenriched_only','rows',coalesce((select jsonb_agg(jsonb_build_object('firstName',x.value->>'firstName','lastName',x.value->>'lastName','company',x.value->>'company','jobTitle',x.value->>'jobTitle','ticketType',x.value->>'ticketType','status',x.value->>'status','registeredAt',x.value->>'registeredAt')||case when emails then jsonb_build_object('email',x.value->>'email') else '{}'::jsonb end order by x.ordinality) from jsonb_array_elements(v.records) with ordinality as x(value,ordinality)
 where not portal_private.registration_is_deleted(p_event,x.value) and not portal_private.registration_is_enriched(p_event,x.value)),'[]'::jsonb),'canViewEmail',emails) from portal_private.report_current c join portal_private.report_versions v on v.id=c.version_id where c.event_id=p_event and c.source_kind='eventbrite_raw'),jsonb_build_object('syncedAt',null,'rows','[]'::jsonb,'canViewEmail',emails));
end $$;


commit;
