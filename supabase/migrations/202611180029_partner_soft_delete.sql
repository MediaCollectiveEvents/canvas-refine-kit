begin;
alter table portal_private.memberships add column deleted_at timestamptz;
alter table portal_private.memberships add constraint deleted_membership_is_inactive check (deleted_at is null or not active);
-- Deletion is recoverable membership archival, never deletion of Auth identities or history.
create or replace function public.portal_owner_sponsors() returns jsonb
language plpgsql security definer set search_path='' as $$
begin
 perform portal_private.require_owner();
 return coalesce((select jsonb_agg(jsonb_build_object('sponsorId',s.id,'company',s.name,'email',a.email,'userId',a.id,'confirmed',a.email_confirmed_at is not null,
 'deletedAt',m.deleted_at,'active',m.active and s.active and ea.revoked_at is null and least(coalesce(m.expires_at,ea.expires_at),ea.expires_at)>now(),
 'expiresAt',least(coalesce(m.expires_at,ea.expires_at),ea.expires_at),'canViewEmail',ea.can_view_email) order by lower(s.name),lower(a.email))
 from portal_private.memberships m join auth.users a on a.id=m.user_id join portal_private.sponsors s on s.id=m.sponsor_id
 join portal_private.event_access ea on ea.sponsor_id=s.id and ea.event_id='off-air'),'[]');
end $$;

create or replace function public.portal_owner_sponsor_save(p_email text,p_company text,p_expires timestamptz,p_agreed boolean) returns jsonb
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
 on conflict(user_id,sponsor_id) do update set active=true,expires_at=excluded.expires_at,deleted_at=null;
 insert into portal_private.event_access(sponsor_id,event_id,expires_at,can_view_email) values(sp,'off-air',p_expires,false)
 on conflict(sponsor_id,event_id) do update set expires_at=greatest(portal_private.event_access.expires_at,excluded.expires_at);
 insert into portal_private.audit(actor,event_id,action,details) values(actor,'off-air','owner_saved_sponsor_access',jsonb_build_object('userId',target,'sponsorId',sp,'expiresAt',p_expires,'canViewEmail',false));
 return jsonb_build_object('sponsorId',sp,'email',lower(trim(p_email)),'expiresAt',p_expires);
end $$;


create function public.portal_owner_sponsor_delete(p_user uuid,p_sponsor uuid,p_deleted boolean default true) returns jsonb
language plpgsql security definer set search_path='' as $$
declare actor uuid;
begin
 actor:=portal_private.require_owner();
 if p_deleted is null then raise exception 'invalid_delete_action';end if;
 if exists(select 1 from portal_private.owners where user_id=p_user) then raise exception 'owner_account_protected';end if;
 if not exists(select 1 from portal_private.event_access where sponsor_id=p_sponsor and event_id='off-air') then raise exception 'sponsor_not_found';end if;
 -- Memberships are shared by company; never affect another event through this event's UI.
 if exists(select 1 from portal_private.event_access where sponsor_id=p_sponsor and event_id<>'off-air') then raise exception 'multi_event_company_requires_review';end if;
 if p_deleted then
  update portal_private.memberships set active=false,deleted_at=coalesce(deleted_at,now()) where user_id=p_user and sponsor_id=p_sponsor;
 else
  -- Restore to the management list only. Re-enabling access requires explicit Edit access.
  update portal_private.memberships set active=false,deleted_at=null where user_id=p_user and sponsor_id=p_sponsor and deleted_at is not null;
 end if;
 if not found then raise exception 'sponsor_not_found';end if;
 insert into portal_private.audit(actor,event_id,action,details) values(actor,'off-air',case when p_deleted then 'owner_archived_partner' else 'owner_restored_partner' end,jsonb_build_object('userId',p_user,'sponsorId',p_sponsor,'accessEnabled',false));
 return public.portal_owner_sponsors();
end $$;
revoke all on function public.portal_owner_sponsor_delete(uuid,uuid,boolean) from public,anon;
grant execute on function public.portal_owner_sponsor_delete(uuid,uuid,boolean) to authenticated;
commit;
