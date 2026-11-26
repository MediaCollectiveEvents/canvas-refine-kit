-- Prepared only. No user memberships or API execution grants are created here.
begin;
create function portal_private.require_sponsor(p_event text,p_sponsor uuid) returns uuid
language plpgsql security definer set search_path='' as $$
declare u uuid:=auth.uid(); sid text:=auth.jwt()->>'session_id'; seen timestamptz;
begin
 if u is null or sid is null or not exists(
  select 1 from auth.users a join auth.sessions se on se.user_id=a.id
  join portal_private.memberships m on m.user_id=a.id
  join portal_private.sponsors sp on sp.id=m.sponsor_id
  join portal_private.event_access ea on ea.sponsor_id=sp.id
  where a.id=u and se.id::text=sid and a.email_confirmed_at is not null
  and (a.banned_until is null or a.banned_until<now())
  and (se.not_after is null or se.not_after>now()) and se.created_at>now()-interval '8 hours'
  and m.active and sp.active and sp.id=p_sponsor and ea.event_id=p_event
  and ea.revoked_at is null and ea.expires_at>now()
 ) then raise exception using errcode='42501',message='sponsor_access_required';end if;
 insert into portal_private.session_activity(session_id) values(sid::uuid) on conflict do nothing;
 select last_seen into seen from portal_private.session_activity where session_id=sid::uuid for update;
 if seen<now()-interval '30 minutes' then raise exception using errcode='42501',message='session_expired';end if;
 update portal_private.session_activity set last_seen=now() where session_id=sid::uuid;
 return u;
end $$;
revoke all on function portal_private.require_sponsor(text,uuid) from public,anon,authenticated;

create function public.portal_sponsor_state(p_event text,p_sponsor uuid) returns jsonb
language plpgsql security definer set search_path='' as $$
declare actor uuid; accepted boolean; answer jsonb; emails boolean;
begin
 actor:=portal_private.require_sponsor(p_event,p_sponsor);
 select exists(select 1 from portal_private.terms_acceptance where user_id=actor and terms_version='sponsor-2026-11-13-v1') into accepted;
 select can_view_email into emails from portal_private.event_access where sponsor_id=p_sponsor and event_id=p_event;
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
revoke all on function public.portal_sponsor_state(text,uuid) from public,anon,authenticated;

create function public.portal_sponsor_accept(p_event text,p_sponsor uuid,p_version text,p_agreed boolean) returns jsonb
language plpgsql security definer set search_path='' as $$
declare actor uuid;
begin
 actor:=portal_private.require_sponsor(p_event,p_sponsor);
 if p_agreed is distinct from true or p_version is distinct from 'sponsor-2026-11-13-v1' then raise exception 'accept_current_terms';end if;
 insert into portal_private.terms_acceptance(user_id,terms_version) values(actor,p_version) on conflict do nothing;
 insert into portal_private.audit(actor,event_id,action) values(actor,p_event,'sponsor_terms_accepted');
 return public.portal_sponsor_state(p_event,p_sponsor);
end $$;
revoke all on function public.portal_sponsor_accept(text,uuid,text,boolean) from public,anon,authenticated;
commit;
