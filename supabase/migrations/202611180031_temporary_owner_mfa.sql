begin;
-- No exception is enabled by this migration. Activation requires a separate explicit owner-approved insert.
create table portal_private.owner_mfa_pauses(
 user_id uuid primary key references portal_private.owners(user_id),
 starts_at timestamptz not null,
 ends_at timestamptz not null,
 check(ends_at>starts_at and ends_at<=starts_at+interval '7 days')
);
alter table portal_private.owner_mfa_pauses enable row level security;
revoke all on portal_private.owner_mfa_pauses from public,anon,authenticated;
create function portal_private.owner_mfa_required(p_user uuid,p_at timestamptz default now()) returns boolean
language sql stable security definer set search_path='' as $$
 select not exists(select 1 from portal_private.owner_mfa_pauses p where p.user_id=p_user
 and p_user='50a047a3-600d-47ed-941f-140fd7058396'::uuid and p_at is not null and p.starts_at<=p_at and p.ends_at>p_at);
$$;
revoke all on function portal_private.owner_mfa_required(uuid,timestamptz) from public,anon,authenticated;
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
 if auth.jwt()->>'aal' is distinct from 'aal2' and portal_private.owner_mfa_required(u) then raise exception using errcode='42501',message='owner_mfa_required';end if;
 insert into portal_private.session_activity(session_id) values(sid::uuid) on conflict do nothing;
 select last_seen into seen from portal_private.session_activity where session_id=sid::uuid for update;
 if seen<now()-interval '30 minutes' then raise exception using errcode='42501',message='session_expired';end if;
 update portal_private.session_activity set last_seen=now() where session_id=sid::uuid;
 return u;
end $$;
commit;
