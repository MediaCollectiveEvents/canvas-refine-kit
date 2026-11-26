begin;
create function portal_private.assert_report_download_window(p_now timestamptz default now()) returns void
language plpgsql set search_path='' as $$
begin
 if p_now is null or p_now<timestamptz '2026-11-25 00:00:00+00' then raise exception using errcode='42501',message='report_download_not_open';end if;
 if p_now>=timestamptz '2026-12-16 00:00:00+00' then raise exception using errcode='42501',message='report_download_closed';end if;
end $$;
revoke all on function portal_private.assert_report_download_window(timestamptz) from public,anon,authenticated;
create function portal_private.assert_partner_event_window(p_event text,p_now timestamptz default now()) returns void
language plpgsql set search_path='' as $$
begin
 if p_event='off-air' and (p_now is null or p_now>=timestamptz '2026-12-16 00:00:00+00') then raise exception using errcode='42501',message='event_access_closed';end if;
end $$;
revoke all on function portal_private.assert_partner_event_window(text,timestamptz) from public,anon,authenticated;
create or replace function portal_private.require_sponsor(p_event text,p_sponsor uuid) returns uuid
language plpgsql security definer set search_path='' as $$
declare u uuid:=auth.uid(); sid text:=auth.jwt()->>'session_id'; seen timestamptz;
begin
 perform portal_private.assert_partner_event_window(p_event);
 if u is null or sid is null or not exists(
  select 1 from auth.users a join auth.sessions se on se.user_id=a.id
  join portal_private.memberships m on m.user_id=a.id
  join portal_private.sponsors sp on sp.id=m.sponsor_id
  join portal_private.event_access ea on ea.sponsor_id=sp.id
  where a.id=u and se.id::text=sid and a.email_confirmed_at is not null
  and (a.banned_until is null or a.banned_until<now())
  and (se.not_after is null or se.not_after>now()) and se.created_at>now()-interval '8 hours'
  and m.active and (m.expires_at is null or m.expires_at>now()) and sp.active and sp.id=p_sponsor and ea.event_id=p_event
  and ea.revoked_at is null and ea.expires_at>now()
 ) then raise exception using errcode='42501',message='sponsor_access_required';end if;
 insert into portal_private.session_activity(session_id) values(sid::uuid) on conflict do nothing;
 select last_seen into seen from portal_private.session_activity where session_id=sid::uuid for update;
 if seen<now()-interval '30 minutes' then raise exception using errcode='42501',message='session_expired';end if;
 update portal_private.session_activity set last_seen=now() where session_id=sid::uuid;
 return u;
end $$;

create function public.portal_registrants_export(p_partner uuid default null) returns jsonb
language plpgsql security definer set search_path='' as $$
begin
 if p_partner is null then perform portal_private.require_owner();
 else
  perform portal_private.require_sponsor('off-air',p_partner);
  if not exists(select 1 from portal_private.terms_acceptance where user_id=auth.uid() and terms_version='off-air-2026-11-16-v2') then raise exception using errcode='42501',message='terms_required';end if;
 end if;
 perform portal_private.assert_report_download_window();
 insert into portal_private.audit(actor,event_id,action) values(auth.uid(),'off-air','registrants_export');
 return jsonb_build_object('rows',portal_private.sponsor_guest_rows('off-air'),'canViewEmail',false);
end $$;
revoke all on function public.portal_registrants_export(uuid) from public,anon,authenticated;
grant execute on function public.portal_registrants_export(uuid) to authenticated;
commit;
