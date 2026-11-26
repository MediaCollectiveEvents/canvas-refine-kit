-- Disabled review candidate. Never changes Eventbrite, existing reports or partner access.
begin;
create table portal_private.walk_in_settings(
 event_id text primary key references portal_private.events(id),enabled boolean not null default false,
 opens_at timestamptz not null,closes_at timestamptz not null,privacy_version text not null default 'off-air-walk-in-v1',
 updated_by uuid references auth.users(id),updated_at timestamptz not null default now(),
 check(closes_at>opens_at and closes_at<=opens_at+interval '24 hours')
);
insert into portal_private.walk_in_settings(event_id,opens_at,closes_at)
 select id,(event_date+time '13:30') at time zone 'Europe/London',(event_date+time '19:00') at time zone 'Europe/London' from portal_private.events where id='off-air';
create table portal_private.walk_in_registrations(
 id uuid primary key default gen_random_uuid(),event_id text not null references portal_private.events(id),
 request_id uuid not null unique,first_name text not null check(length(first_name) between 1 and 100),last_name text not null check(length(last_name) between 1 and 100),
 company text not null default '' check(length(company)<=200),email text not null check(length(email)<=254),
 email_key text generated always as(lower(btrim(email))) stored,source text not null default 'walk_in' check(source='walk_in'),
 privacy_version text not null,registered_at timestamptz not null default now(),updated_at timestamptz not null default now(),
 updated_by uuid references auth.users(id),deleted_at timestamptz,revision integer not null default 1,
 unique(event_id,email_key)
);
create table portal_private.event_update_signups(
 id uuid primary key default gen_random_uuid(),request_id uuid not null unique,origin_event text not null references portal_private.events(id),email text not null check(length(email)<=254),
 email_key text generated always as(lower(btrim(email))) stored unique,source text not null default 'walk_in_kiosk' check(source='walk_in_kiosk'),
 consent_version text not null,consent_text text not null,requested_at timestamptz not null default now(),status text not null default 'pending_owner_review'
);
alter table portal_private.event_update_signups enable row level security;
revoke all on portal_private.event_update_signups from public,anon,authenticated;
create table portal_private.walk_in_history(id bigint generated always as identity primary key,walk_in_id uuid not null references portal_private.walk_in_registrations(id),before_record jsonb not null,changed_by uuid not null references auth.users(id),changed_at timestamptz not null default now());
alter table portal_private.walk_in_history enable row level security;
revoke all on portal_private.walk_in_history from public,anon,authenticated;
create table portal_private.walk_in_attempts(id bigint generated always as identity primary key,event_id text not null,ip_hash text not null,email_hash text not null,attempted_at timestamptz not null default now());
create index on portal_private.walk_in_attempts(event_id,attempted_at);
alter table portal_private.walk_in_settings enable row level security;
alter table portal_private.walk_in_registrations enable row level security;
alter table portal_private.walk_in_attempts enable row level security;
revoke all on portal_private.walk_in_settings,portal_private.walk_in_registrations,portal_private.walk_in_attempts from public,anon,authenticated;
create function portal_private.walk_in_email_exists(p_email text) returns boolean language sql stable security definer set search_path='' as $$
 select exists(select 1 from portal_private.report_current c join portal_private.report_versions v on v.id=c.version_id cross join lateral jsonb_array_elements(v.records) r where c.event_id='off-air' and c.source_kind in ('enriched','eventbrite_raw') and lower(btrim(r->>'email'))=lower(btrim(p_email)))
 or exists(select 1 from portal_private.invitation_requests i where i.event_id='off-air' and i.status='Added to Eventbrite' and lower(btrim(i.email))=lower(btrim(p_email)));
$$;
create function public.portal_walk_in_status() returns jsonb language sql stable security definer set search_path='' as $$
 select jsonb_build_object('enabled',coalesce((select enabled and now()>=opens_at and now()<closes_at from portal_private.walk_in_settings where event_id='off-air'),false));
$$;
create function public.portal_walk_in_submit(p_request uuid,p_fields jsonb,p_ip_hash text,p_email_hash text) returns jsonb
language plpgsql security definer set search_path='' as $$
declare f text:=btrim(p_fields->>'firstName');l text:=btrim(p_fields->>'lastName');c text:=btrim(p_fields->>'company');e text:=lower(btrim(p_fields->>'email'));s portal_private.walk_in_settings;prior portal_private.walk_in_registrations;new_id uuid;
begin
 if p_request is null or jsonb_typeof(p_fields) is distinct from 'object' or p_ip_hash is null or p_email_hash is null or f is null or length(f) not between 1 and 100 or l is null or length(l) not between 1 and 100 or c is null or length(c)>200 or e is null or length(e)>254 or e !~ '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$' or p_ip_hash !~ '^[a-f0-9]{64}$' or p_email_hash !~ '^[a-f0-9]{64}$' then raise exception 'invalid_walk_in';end if;
 if (f||l||c||e) ~ '[[:cntrl:]]' then raise exception 'invalid_walk_in';end if;
 -- Serialize duplicate checks and limits with report publishing/ingestion on this event.
 perform 1 from portal_private.events where id='off-air' for update;
 select * into s from portal_private.walk_in_settings where event_id='off-air' for update;
 if s.event_id is null or not s.enabled or now()<s.opens_at or now()>=s.closes_at then raise exception 'walk_in_closed';end if;
 select * into prior from portal_private.walk_in_registrations where request_id=p_request;
 if found then
  if prior.email_key=e and prior.first_name=f and prior.last_name=l and prior.company=c and prior.deleted_at is null then return jsonb_build_object('status','registered');end if;
  return jsonb_build_object('status','refer_to_staff');
 end if;
 delete from portal_private.walk_in_attempts where attempted_at<now()-interval '48 hours';
 if (select count(*) from portal_private.walk_in_attempts where event_id='off-air' and attempted_at>now()-interval '1 minute')>=60
 or (select count(*) from portal_private.walk_in_attempts where event_id='off-air' and ip_hash=p_ip_hash and attempted_at>now()-interval '1 minute')>=20
 or (select count(*) from portal_private.walk_in_attempts where event_id='off-air' and email_hash=p_email_hash and attempted_at>now()-interval '15 minutes')>=3
 or (select count(*) from portal_private.walk_in_attempts where event_id='off-air' and attempted_at>now()-interval '24 hours')>=600
 then return jsonb_build_object('status','rate_limited');end if;
 insert into portal_private.walk_in_attempts(event_id,ip_hash,email_hash) values('off-air',p_ip_hash,p_email_hash);
 if portal_private.walk_in_email_exists(e) or exists(select 1 from portal_private.walk_in_registrations where event_id='off-air' and email_key=e) then return jsonb_build_object('status','refer_to_staff');end if;
 insert into portal_private.walk_in_registrations(event_id,request_id,first_name,last_name,company,email,privacy_version) values('off-air',p_request,f,l,c,e,s.privacy_version) returning id into new_id;
 insert into portal_private.audit(event_id,action,details) values('off-air','walk_in_registered',jsonb_build_object('walkInId',new_id));
 return jsonb_build_object('status','registered');
end $$;
create function public.portal_walk_in_updates_submit(p_request uuid,p_email text,p_agreed boolean,p_ip_hash text,p_email_hash text) returns jsonb
language plpgsql security definer set search_path='' as $$
declare e text:=lower(btrim(p_email));s portal_private.walk_in_settings;new_id uuid;
begin
 if p_request is null or p_agreed is distinct from true or e is null or length(e)>254 or e !~ '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$' or p_ip_hash is null or p_email_hash is null or p_ip_hash !~ '^[a-f0-9]{64}$' or p_email_hash !~ '^[a-f0-9]{64}$' then raise exception 'invalid_walk_in';end if;
 perform 1 from portal_private.events where id='off-air' for update;
 select * into s from portal_private.walk_in_settings where event_id='off-air' for update;
 if s.event_id is null or not s.enabled or now()<s.opens_at or now()>=s.closes_at then raise exception 'walk_in_closed';end if;
 if exists(select 1 from portal_private.event_update_signups where request_id=p_request) then return jsonb_build_object('status','received');end if;
 delete from portal_private.walk_in_attempts where attempted_at<now()-interval '48 hours';
 if (select count(*) from portal_private.walk_in_attempts where event_id='off-air' and attempted_at>now()-interval '1 minute')>=60
 or (select count(*) from portal_private.walk_in_attempts where event_id='off-air' and ip_hash=p_ip_hash and attempted_at>now()-interval '1 minute')>=20
 or (select count(*) from portal_private.walk_in_attempts where event_id='off-air' and email_hash=p_email_hash and attempted_at>now()-interval '15 minutes')>=3
 or (select count(*) from portal_private.walk_in_attempts where event_id='off-air' and attempted_at>now()-interval '24 hours')>=600 then return jsonb_build_object('status','rate_limited');end if;
 insert into portal_private.walk_in_attempts(event_id,ip_hash,email_hash) values('off-air',p_ip_hash,p_email_hash);
 insert into portal_private.event_update_signups(request_id,origin_event,email,consent_version,consent_text)
 values(p_request,'off-air',e,'future-events-kiosk-v1','I would like to receive emails from The Media Collective about future events. I can unsubscribe at any time.') on conflict(email_key) do nothing returning id into new_id;
 if new_id is not null then insert into portal_private.audit(event_id,action,details) values('off-air','event_updates_signup',jsonb_build_object('signupId',new_id));end if;
 return jsonb_build_object('status','received');
end $$;
revoke all on function public.portal_walk_in_updates_submit(uuid,text,boolean,text,text) from public,anon,authenticated;
grant execute on function public.portal_walk_in_updates_submit(uuid,text,boolean,text,text) to service_role;
create function public.portal_owner_walk_ins() returns jsonb language plpgsql security definer set search_path='' as $$
begin
 perform portal_private.require_owner();
 return jsonb_build_object('settings',(select jsonb_build_object('enabled',enabled,'opensAt',opens_at,'closesAt',closes_at,'privacyVersion',privacy_version) from portal_private.walk_in_settings where event_id='off-air'),
 'rows',coalesce((select jsonb_agg(jsonb_build_object('id',id,'firstName',first_name,'lastName',last_name,'company',company,'email',email,'registeredAt',registered_at,'updatedAt',updated_at,'deletedAt',deleted_at,'revision',revision,'source',source,'existingRegistration',portal_private.walk_in_email_exists(email)) order by registered_at desc) from portal_private.walk_in_registrations where event_id='off-air'),'[]'::jsonb),'updates',coalesce((select jsonb_agg(jsonb_build_object('id',id,'email',email,'requestedAt',requested_at,'consentVersion',consent_version,'status',status) order by requested_at desc) from portal_private.event_update_signups),'[]'::jsonb));
end $$;
create function public.portal_owner_walk_in_settings(p_enabled boolean,p_opens timestamptz,p_closes timestamptz) returns jsonb language plpgsql security definer set search_path='' as $$
declare actor uuid;
begin
 actor:=portal_private.require_owner();
 if p_enabled is null or p_opens is null or p_closes is null or p_closes<=p_opens or p_closes>p_opens+interval '24 hours' then raise exception 'invalid_walk_in_window';end if;
 perform 1 from portal_private.events where id='off-air' for update;
 update portal_private.walk_in_settings set enabled=p_enabled,opens_at=p_opens,closes_at=p_closes,updated_at=now(),updated_by=actor where event_id='off-air';
 if not found then raise exception 'walk_in_not_configured';end if;
 insert into portal_private.audit(actor,event_id,action,details) values(actor,'off-air','walk_in_settings',jsonb_build_object('enabled',p_enabled,'opensAt',p_opens,'closesAt',p_closes));
 return public.portal_owner_walk_ins();
end $$;
create function public.portal_owner_walk_in_update(p_id uuid,p_fields jsonb,p_deleted boolean,p_revision integer) returns jsonb language plpgsql security definer set search_path='' as $$
declare actor uuid;f text:=btrim(p_fields->>'firstName');l text:=btrim(p_fields->>'lastName');c text:=btrim(p_fields->>'company');e text:=lower(btrim(p_fields->>'email'));
begin
 actor:=portal_private.require_owner();
 if p_deleted is null or p_revision is null or f is null or length(f) not between 1 and 100 or l is null or length(l) not between 1 and 100 or c is null or length(c)>200 or e is null or length(e)>254 or e !~ '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$' or (f||l||c||e) ~ '[[:cntrl:]]' then raise exception 'invalid_walk_in';end if;
 perform 1 from portal_private.events where id='off-air' for update;
 insert into portal_private.walk_in_history(walk_in_id,before_record,changed_by) select id,to_jsonb(w),actor from portal_private.walk_in_registrations w where id=p_id and event_id='off-air' and revision=p_revision;
 update portal_private.walk_in_registrations set first_name=f,last_name=l,company=c,email=e,deleted_at=case when p_deleted then coalesce(deleted_at,now()) else null end,updated_by=actor,updated_at=now(),revision=revision+1 where id=p_id and event_id='off-air' and revision=p_revision;
 if not found then raise exception 'stale_walk_in';end if;
 insert into portal_private.audit(actor,event_id,action,details) values(actor,'off-air','walk_in_owner_update',jsonb_build_object('walkInId',p_id,'deleted',p_deleted));
 return public.portal_owner_walk_ins();
end $$;
revoke all on function portal_private.walk_in_email_exists(text),public.portal_walk_in_status(),public.portal_walk_in_submit(uuid,jsonb,text,text),public.portal_owner_walk_ins(),public.portal_owner_walk_in_settings(boolean,timestamptz,timestamptz),public.portal_owner_walk_in_update(uuid,jsonb,boolean,integer) from public,anon,authenticated;
grant execute on function public.portal_walk_in_status(),public.portal_walk_in_submit(uuid,jsonb,text,text) to service_role;
grant execute on function public.portal_owner_walk_ins(),public.portal_owner_walk_in_settings(boolean,timestamptz,timestamptz),public.portal_owner_walk_in_update(uuid,jsonb,boolean,integer) to authenticated;
commit;
