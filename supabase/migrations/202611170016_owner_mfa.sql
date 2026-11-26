begin;
create or replace function portal_private.require_owner() returns uuid
language plpgsql security definer set search_path='' as $$
declare u uuid:=auth.uid(); sid text:=auth.jwt()->>'session_id'; seen timestamptz;
begin
 if u is null or sid is null or not exists(
  select 1 from auth.users a join auth.sessions s on s.user_id=a.id
  join portal_private.owners o on o.user_id=a.id
  where a.id=u and s.id::text=sid and o.active and a.email_confirmed_at is not null
  and (a.banned_until is null or a.banned_until<now())
  and (s.not_after is null or s.not_after>now()) and s.created_at>now()-interval '8 hours'
 ) then raise exception using errcode='42501',message='owner_access_required'; end if;
 if auth.jwt()->>'aal' is distinct from 'aal2' then raise exception using errcode='42501',message='owner_mfa_required';end if;
 insert into portal_private.session_activity(session_id) values(sid::uuid) on conflict do nothing;
 select last_seen into seen from portal_private.session_activity where session_id=sid::uuid for update;
 if seen<now()-interval '30 minutes' then raise exception using errcode='42501',message='session_expired';end if;
 update portal_private.session_activity set last_seen=now() where session_id=sid::uuid;
 return u;
end $$;
commit;
