-- Sponsor view and registration CSV privacy. Owner editing remains private.
begin;
create or replace function public.portal_sponsor_state(p_event text,p_sponsor uuid) returns jsonb
language plpgsql security definer set search_path='' as $$
declare actor uuid; accepted boolean; answer jsonb; emails boolean;
begin
 actor:=portal_private.require_sponsor(p_event,p_sponsor);
 select exists(select 1 from portal_private.terms_acceptance where user_id=actor and terms_version='sponsor-2026-11-13-v1') into accepted;
 -- On-screen/pre-event registration feeds never expose guest email, even if an older grant allows it.
 emails:=false;
 -- Explicit projection: no historical versions, internal IDs or unapproved columns.
 select jsonb_build_object('sponsor',(select name from portal_private.sponsors where id=p_sponsor),
 'accepted',accepted,'termsVersion','sponsor-2026-11-13-v1','event',(select title from portal_private.events where id=p_event),
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
 if not exists(select 1 from portal_private.terms_acceptance where user_id=actor and terms_version='sponsor-2026-11-13-v1') then raise exception using errcode='42501',message='terms_required';end if;
 -- Guest email is reserved for a separately approved post-event attendance download.
 emails:=false;
 return coalesce((select jsonb_build_object('syncedAt',v.created_at,'scope','unenriched_only','rows',coalesce((select jsonb_agg(jsonb_build_object('firstName',x.value->>'firstName','lastName',x.value->>'lastName','company',x.value->>'company','jobTitle',x.value->>'jobTitle','ticketType',x.value->>'ticketType','status',x.value->>'status','registeredAt',x.value->>'registeredAt')||case when emails then jsonb_build_object('email',x.value->>'email') else '{}'::jsonb end order by x.ordinality) from jsonb_array_elements(v.records) with ordinality as x(value,ordinality)
 where not portal_private.registration_is_enriched(p_event,x.value)),'[]'::jsonb),'canViewEmail',emails) from portal_private.report_current c join portal_private.report_versions v on v.id=c.version_id where c.event_id=p_event and c.source_kind='eventbrite_raw'),jsonb_build_object('syncedAt',null,'rows','[]'::jsonb,'canViewEmail',emails));
end $$;


commit;
