-- Display filtering only: no source records or identities are merged.
begin;
create or replace function portal_private.registration_is_enriched(p_event text,p_registration jsonb) returns boolean
language sql stable security definer set search_path='' as $$
 select exists(
 select 1 from portal_private.report_current ec join portal_private.report_versions ev on ev.id=ec.version_id
 cross join lateral jsonb_array_elements(ev.records) as e(value)
 where ec.event_id=p_event and ec.source_kind='enriched' and (
 (nullif(trim(p_registration->>'firstName'),'') is not null and nullif(trim(p_registration->>'lastName'),'') is not null
 and lower(regexp_replace(trim(p_registration->>'firstName'),'[[:space:]]+',' ','g'))=lower(regexp_replace(trim(e.value->>'firstName'),'[[:space:]]+',' ','g'))
 and lower(regexp_replace(trim(p_registration->>'lastName'),'[[:space:]]+',' ','g'))=lower(regexp_replace(trim(e.value->>'lastName'),'[[:space:]]+',' ','g'))) or
 (nullif(trim(p_registration->>'attendeeId'),'') is not null and trim(p_registration->>'attendeeId')=trim(e.value->>'attendeeId')) or
 (nullif(trim(p_registration->>'email'),'') is not null and lower(trim(p_registration->>'email'))=lower(trim(e.value->>'email'))) or
 exists(select 1 from portal_private.registration_links l where l.event_id=p_event and l.registration_id=trim(p_registration->>'attendeeId') and l.active and (
 (l.target_email<>'' and l.target_email=lower(trim(e.value->>'email'))) or
 (l.target_reference<>'' and l.target_reference=trim(e.value->>'attendeeId'))))
 ));
$$;

create or replace function public.portal_sponsor_state(p_event text,p_sponsor uuid) returns jsonb
language plpgsql security definer set search_path='' as $$
declare actor uuid; accepted boolean; answer jsonb; emails boolean;
begin
 actor:=portal_private.require_sponsor(p_event,p_sponsor);
 select exists(select 1 from portal_private.terms_acceptance where user_id=actor and terms_version='off-air-2026-11-16-v2') into accepted;
 -- On-screen/pre-event registration feeds never expose guest email, even if an older grant allows it.
 emails:=false;
 -- Explicit projection: no historical versions, internal IDs or unapproved columns.
 select jsonb_build_object('sponsor',(select name from portal_private.sponsors where id=p_sponsor),
 'accepted',accepted,'termsVersion','off-air-2026-11-16-v2','event',(select title from portal_private.events where id=p_event),
 'rows',case when accepted then coalesce((select jsonb_agg(jsonb_build_object(
 'firstName',entry.value->>'firstName','lastName',entry.value->>'lastName','company',entry.value->>'company',
 'jobTitle',entry.value->>'jobTitle','linkedin',entry.value->>'linkedin') ||
 case when emails then jsonb_build_object('email',entry.value->>'email') else '{}'::jsonb end order by entry.ordinality)
 from portal_private.report_current c join portal_private.report_versions v on v.id=c.version_id
 cross join lateral jsonb_array_elements(v.records) with ordinality as entry(value,ordinality)
 where c.event_id=p_event and c.source_kind='enriched'),'[]'::jsonb) else '[]'::jsonb end,
 'canViewEmail',emails) into answer;
 return answer;
end $$;

create or replace function public.portal_sponsor_eventbrite(p_event text,p_sponsor uuid) returns jsonb
language plpgsql security definer set search_path='' as $$
declare actor uuid; emails boolean;
begin
 actor:=portal_private.require_sponsor(p_event,p_sponsor);
 if not exists(select 1 from portal_private.terms_acceptance where user_id=actor and terms_version='off-air-2026-11-16-v2') then raise exception using errcode='42501',message='terms_required';end if;
 -- Guest email is reserved for a separately approved post-event attendance download.
 emails:=false;
 return coalesce((select jsonb_build_object('syncedAt',v.created_at,'scope','unenriched_only','rows',coalesce((select jsonb_agg(jsonb_build_object('firstName',x.value->>'firstName','lastName',x.value->>'lastName','company',x.value->>'company','jobTitle',x.value->>'jobTitle','ticketType',x.value->>'ticketType','status',x.value->>'status','registeredAt',x.value->>'registeredAt')||case when emails then jsonb_build_object('email',x.value->>'email') else '{}'::jsonb end order by x.ordinality) from jsonb_array_elements(v.records) with ordinality as x(value,ordinality)
 where not portal_private.registration_is_enriched(p_event,x.value)),'[]'::jsonb),'canViewEmail',emails) from portal_private.report_current c join portal_private.report_versions v on v.id=c.version_id where c.event_id=p_event and c.source_kind='eventbrite_raw'),jsonb_build_object('syncedAt',null,'rows','[]'::jsonb,'canViewEmail',emails));
end $$;


create or replace function public.portal_sponsor_accept(p_event text,p_sponsor uuid,p_version text,p_agreed boolean) returns jsonb
language plpgsql security definer set search_path='' as $$
declare actor uuid;
begin
 actor:=portal_private.require_sponsor(p_event,p_sponsor);
 if p_agreed is distinct from true or p_version is distinct from 'off-air-2026-11-16-v2' then raise exception 'accept_current_terms';end if;
 insert into portal_private.terms_acceptance(user_id,terms_version) values(actor,p_version) on conflict do nothing;
 insert into portal_private.audit(actor,event_id,action) values(actor,p_event,'sponsor_terms_accepted');
 return public.portal_sponsor_state(p_event,p_sponsor);
end $$;

commit;
