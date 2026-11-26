begin;
create table portal_private.registration_links(
 event_id text not null references portal_private.events(id),
 registration_id text not null,
 target_email text not null default '',
 target_reference text not null default '',
 enriched_version uuid not null references portal_private.report_versions(id),
 active boolean not null default true,
 decided_by uuid not null references auth.users(id),
 decided_at timestamptz not null default now(),
 primary key(event_id,registration_id),
 check(target_email<>'' or target_reference<>'')
);
alter table portal_private.registration_links enable row level security;
revoke all on portal_private.registration_links from public,anon,authenticated;
create function portal_private.registration_is_enriched(p_event text,p_registration jsonb) returns boolean
language sql stable security definer set search_path='' as $$
 select exists(
 select 1 from portal_private.report_current ec join portal_private.report_versions ev on ev.id=ec.version_id
 cross join lateral jsonb_array_elements(ev.records) as e(value)
 where ec.event_id=p_event and ec.source_kind='enriched' and (
 (nullif(trim(p_registration->>'attendeeId'),'') is not null and trim(p_registration->>'attendeeId')=trim(e.value->>'attendeeId')) or
 (nullif(trim(p_registration->>'email'),'') is not null and lower(trim(p_registration->>'email'))=lower(trim(e.value->>'email'))) or
 exists(select 1 from portal_private.registration_links l where l.event_id=p_event and l.registration_id=trim(p_registration->>'attendeeId') and l.active and (
 (l.target_email<>'' and l.target_email=lower(trim(e.value->>'email'))) or
 (l.target_reference<>'' and l.target_reference=trim(e.value->>'attendeeId'))))
 ));
$$;
revoke all on function portal_private.registration_is_enriched(text,jsonb) from public,anon,authenticated;
create function public.portal_owner_link_registration(p_registration text,p_email text,p_reference text,p_remove boolean default false) returns jsonb
language plpgsql security definer set search_path='' as $$
declare actor uuid; target_version uuid; matches integer;
begin
 actor:=portal_private.require_owner();
 if p_remove is null or p_registration is null or p_registration !~ '^[0-9]{1,40}$' then raise exception 'invalid_link';end if;
 perform 1 from portal_private.events where id='off-air' for update;
 if p_remove then
  update portal_private.registration_links set active=false,decided_by=actor,decided_at=now() where event_id='off-air' and registration_id=p_registration;
  if not found then raise exception 'link_not_found';end if;
 else
  if not exists(select 1 from portal_private.report_current c join portal_private.report_versions v on v.id=c.version_id cross join lateral jsonb_array_elements(v.records) as r(value) where c.event_id='off-air' and c.source_kind='eventbrite_raw' and r.value->>'attendeeId'=p_registration) then raise exception 'registration_not_found';end if;
  select version_id into target_version from portal_private.report_current where event_id='off-air' and source_kind='enriched';
  select count(*) into matches from portal_private.report_versions v cross join lateral jsonb_array_elements(v.records) as e(value) where v.id=target_version and (
   (nullif(trim(p_email),'') is not null and lower(trim(e.value->>'email'))=lower(trim(p_email))) or
   (nullif(trim(p_reference),'') is not null and trim(e.value->>'attendeeId')=trim(p_reference)));
  if matches<>1 then raise exception 'choose_one_existing_guest';end if;
  -- Both supplied references must belong to the same selected record.
  if not exists(select 1 from portal_private.report_versions v cross join lateral jsonb_array_elements(v.records) as e(value) where v.id=target_version and
   (coalesce(trim(p_email),'')='' or lower(trim(e.value->>'email'))=lower(trim(p_email))) and
   (coalesce(trim(p_reference),'')='' or trim(e.value->>'attendeeId')=trim(p_reference))) then raise exception 'identity_conflict';end if;
  insert into portal_private.registration_links(event_id,registration_id,target_email,target_reference,enriched_version,decided_by)
  values('off-air',p_registration,lower(trim(coalesce(p_email,''))),trim(coalesce(p_reference,'')),target_version,actor)
  on conflict(event_id,registration_id) do update set target_email=excluded.target_email,target_reference=excluded.target_reference,enriched_version=excluded.enriched_version,active=true,decided_by=actor,decided_at=now();
 end if;
 insert into portal_private.audit(actor,event_id,action,details) values(actor,'off-air',case when p_remove then 'unlink_registration' else 'link_registration' end,jsonb_build_object('registrationId',p_registration,'enrichedVersion',target_version));
 return jsonb_build_object('linked',not p_remove);
end $$;
revoke all on function public.portal_owner_link_registration(text,text,text,boolean) from public,anon,authenticated;
-- This changes a report cross-reference only; it grants no sponsor access and changes no source data.
grant execute on function public.portal_owner_link_registration(text,text,text,boolean) to authenticated;
create or replace function public.portal_sponsor_eventbrite(p_event text,p_sponsor uuid) returns jsonb
language plpgsql security definer set search_path='' as $$
declare actor uuid; emails boolean;
begin
 actor:=portal_private.require_sponsor(p_event,p_sponsor);
 if not exists(select 1 from portal_private.terms_acceptance where user_id=actor and terms_version='sponsor-2026-11-13-v1') then raise exception using errcode='42501',message='terms_required';end if;
 select can_view_email into emails from portal_private.event_access where sponsor_id=p_sponsor and event_id=p_event;
 return coalesce((select jsonb_build_object('syncedAt',v.created_at,'scope','unenriched_only','rows',coalesce((select jsonb_agg(jsonb_build_object('firstName',x.value->>'firstName','lastName',x.value->>'lastName','company',x.value->>'company','jobTitle',x.value->>'jobTitle','ticketType',x.value->>'ticketType','status',x.value->>'status','registeredAt',x.value->>'registeredAt')||case when emails then jsonb_build_object('email',x.value->>'email') else '{}'::jsonb end order by x.ordinality) from jsonb_array_elements(v.records) with ordinality as x(value,ordinality)
 where not portal_private.registration_is_enriched(p_event,x.value)),'[]'::jsonb),'canViewEmail',emails) from portal_private.report_current c join portal_private.report_versions v on v.id=c.version_id where c.event_id=p_event and c.source_kind='eventbrite_raw'),jsonb_build_object('syncedAt',null,'rows','[]'::jsonb,'canViewEmail',emails));
end $$;

create or replace function public.portal_owner_unenriched() returns jsonb
language plpgsql security definer set search_path='' as $$
declare raw jsonb; enriched jsonb; synced timestamptz;
begin
 perform portal_private.require_owner();
 select v.records,v.created_at into raw,synced from portal_private.report_current c join portal_private.report_versions v on v.id=c.version_id where c.event_id='off-air' and c.source_kind='eventbrite_raw';
 select v.records into enriched from portal_private.report_current c join portal_private.report_versions v on v.id=c.version_id where c.event_id='off-air' and c.source_kind='enriched';
 return jsonb_build_object('syncedAt',synced,'rawCount',jsonb_array_length(coalesce(raw,'[]')),'enrichedCount',jsonb_array_length(coalesce(enriched,'[]')),'rows',coalesce((
 select jsonb_agg(x.value order by x.ordinality) from jsonb_array_elements(coalesce(raw,'[]')) with ordinality as x(value,ordinality)
 where not portal_private.registration_is_enriched('off-air',x.value)),'[]'));
end $$;
commit;
