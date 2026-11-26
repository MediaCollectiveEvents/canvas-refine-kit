begin;
alter table portal_private.audit add column details jsonb not null default '{}'::jsonb;
alter table portal_private.memberships add column expires_at timestamptz;
-- Extend the existing access check with individual expiry; shared-company access is still checked.
create or replace function portal_private.require_sponsor(p_event text,p_sponsor uuid) returns uuid
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
  and m.active and (m.expires_at is null or m.expires_at>now()) and sp.active and sp.id=p_sponsor and ea.event_id=p_event
  and ea.revoked_at is null and ea.expires_at>now()
 ) then raise exception using errcode='42501',message='sponsor_access_required';end if;
 insert into portal_private.session_activity(session_id) values(sid::uuid) on conflict do nothing;
 select last_seen into seen from portal_private.session_activity where session_id=sid::uuid for update;
 if seen<now()-interval '30 minutes' then raise exception using errcode='42501',message='session_expired';end if;
 update portal_private.session_activity set last_seen=now() where session_id=sid::uuid;
 return u;
end $$;
create function public.portal_owner_sponsors() returns jsonb
language plpgsql security definer set search_path='' as $$
begin
 perform portal_private.require_owner();
 return coalesce((select jsonb_agg(jsonb_build_object('sponsorId',s.id,'company',s.name,'email',a.email,'userId',a.id,'confirmed',a.email_confirmed_at is not null,
 'active',m.active and s.active and ea.revoked_at is null and least(coalesce(m.expires_at,ea.expires_at),ea.expires_at)>now(),
 'expiresAt',least(coalesce(m.expires_at,ea.expires_at),ea.expires_at),'canViewEmail',ea.can_view_email) order by lower(s.name),lower(a.email))
 from portal_private.memberships m join auth.users a on a.id=m.user_id join portal_private.sponsors s on s.id=m.sponsor_id
 join portal_private.event_access ea on ea.sponsor_id=s.id and ea.event_id='off-air'),'[]');
end $$;
revoke all on function public.portal_owner_sponsors() from public,anon,authenticated;
create function public.portal_owner_sponsor_lookup(p_email text) returns jsonb
language plpgsql security definer set search_path='' as $$
declare target record;
begin
 perform portal_private.require_owner();
 select id,email,email_confirmed_at,banned_until into target from auth.users where lower(email)=lower(trim(p_email));
 if not found then return jsonb_build_object('userId',null);end if;
 if exists(select 1 from portal_private.owners where user_id=target.id) then raise exception 'owner_account_protected';end if;
 if target.banned_until>now() then raise exception 'account_disabled';end if;
 return jsonb_build_object('userId',target.id,'email',target.email,'confirmed',target.email_confirmed_at is not null);
end $$;
revoke all on function public.portal_owner_sponsor_lookup(text) from public,anon,authenticated;
create function public.portal_owner_sponsor_save(p_email text,p_company text,p_expires timestamptz,p_agreed boolean) returns jsonb
language plpgsql security definer set search_path='' as $$
declare actor uuid; target uuid; sp uuid; n integer;
begin
 actor:=portal_private.require_owner();
 if p_agreed is distinct from true then raise exception 'access_approval_required';end if;
 if p_email is null or p_email !~ '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$' or length(p_email)>254 or p_company is null or length(trim(p_company)) not between 1 and 200 then raise exception 'invalid_sponsor_details';end if;
 if p_expires is null or p_expires<=now() or p_expires>now()+interval '1 year' then raise exception 'invalid_expiry';end if;
 -- Serialise provisioning so two owner tabs cannot create conflicting company mappings.
 perform 1 from portal_private.events where id='off-air' for update;
 select id into target from auth.users where lower(email)=lower(trim(p_email));
 if target is null then raise exception 'account_not_created';end if;
 if exists(select 1 from portal_private.owners where user_id=target) then raise exception 'owner_account_protected';end if;
 select count(*),min(id::text)::uuid into n,sp from portal_private.sponsors where lower(trim(name))=lower(trim(p_company));
 if n>1 then raise exception 'ambiguous_company';end if;
 if n=0 then insert into portal_private.sponsors(name) values(trim(p_company)) returning id into sp;end if;
 if not exists(select 1 from portal_private.sponsors where id=sp and active) then raise exception 'company_disabled';end if;
 if exists(select 1 from portal_private.memberships where user_id=target and sponsor_id<>sp) then raise exception 'existing_company_mapping_protected';end if;
 -- Avoid changing permissions for other events, or silently exposing emails to a new member.
 if exists(select 1 from portal_private.event_access where sponsor_id=sp and event_id<>'off-air') then raise exception 'multi_event_company_requires_review';end if;
 if exists(select 1 from portal_private.event_access where sponsor_id=sp and event_id='off-air' and (can_view_email or revoked_at is not null)) then raise exception 'company_access_requires_review';end if;
 insert into portal_private.memberships(user_id,sponsor_id,active,expires_at) values(target,sp,true,p_expires)
 on conflict(user_id,sponsor_id) do update set active=true,expires_at=excluded.expires_at;
 insert into portal_private.event_access(sponsor_id,event_id,expires_at,can_view_email) values(sp,'off-air',p_expires,false)
 on conflict(sponsor_id,event_id) do update set expires_at=greatest(portal_private.event_access.expires_at,excluded.expires_at);
 insert into portal_private.audit(actor,event_id,action,details) values(actor,'off-air','owner_saved_sponsor_access',jsonb_build_object('userId',target,'sponsorId',sp,'expiresAt',p_expires,'canViewEmail',false));
 return jsonb_build_object('sponsorId',sp,'email',lower(trim(p_email)),'expiresAt',p_expires);
end $$;
revoke all on function public.portal_owner_sponsor_save(text,text,timestamptz,boolean) from public,anon,authenticated;
create function public.portal_owner_sponsor_revoke(p_user uuid,p_sponsor uuid) returns void
language plpgsql security definer set search_path='' as $$
declare actor uuid;
begin
 actor:=portal_private.require_owner();
 if exists(select 1 from portal_private.owners where user_id=p_user) then raise exception 'owner_account_protected';end if;
 if not exists(select 1 from portal_private.event_access where sponsor_id=p_sponsor and event_id='off-air') then raise exception 'sponsor_not_found';end if;
 update portal_private.memberships set active=false where user_id=p_user and sponsor_id=p_sponsor;
 if not found then raise exception 'sponsor_not_found';end if;
 insert into portal_private.audit(actor,event_id,action,details) values(actor,'off-air','owner_revoked_sponsor_access',jsonb_build_object('userId',p_user,'sponsorId',p_sponsor));
end $$;
revoke all on function public.portal_owner_sponsor_revoke(uuid,uuid) from public,anon,authenticated;
-- Guarded RPCs are activated after rollback tests.
commit;
