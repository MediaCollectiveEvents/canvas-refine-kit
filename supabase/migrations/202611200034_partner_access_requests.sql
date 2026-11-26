-- Private, service-only notification queue. Does not grant portal access.
begin;
create table if not exists portal_private.partner_access_requests (
 id uuid primary key default gen_random_uuid(), email text not null, ip_hash text not null,
 requested_at timestamptz not null default now(), status text not null default 'pending' check(status in ('pending','sent','failed'))
);
alter table portal_private.partner_access_requests enable row level security;
revoke all on portal_private.partner_access_requests from public,anon,authenticated;
create or replace function public.portal_code_request_route(p_email text,p_ip_hash text) returns jsonb
language plpgsql security definer set search_path=pg_catalog,public,portal_private as $$
declare v_id uuid;
begin
 if p_email is null or length(p_email)>254 or p_email !~ '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$' or p_ip_hash !~ '^[a-f0-9]{64}$' then raise exception 'invalid_request'; end if;
 -- Serialise reservations to keep the daily/per-source limits effective under concurrency.
 perform pg_advisory_xact_lock(20261120,34);
 if exists(select 1 from auth.users where lower(email)=lower(p_email)) then return jsonb_build_object('registered',true,'confirmed',(select email_confirmed_at is not null from auth.users where lower(email)=lower(p_email) limit 1));end if;
 if exists(select 1 from portal_private.partner_access_requests where email=lower(p_email) and requested_at>now()-interval '24 hours' and status in ('sent','pending'))
 or (select count(*) from portal_private.partner_access_requests where ip_hash=p_ip_hash and requested_at>now()-interval '15 minutes')>=3
 or (select count(*) from portal_private.partner_access_requests where requested_at>now()-interval '24 hours')>=50
 then return jsonb_build_object('registered',false);end if;
 insert into portal_private.partner_access_requests(email,ip_hash) values(lower(p_email),p_ip_hash) returning id into v_id;
 return jsonb_build_object('registered',false,'requestId',v_id);
end $$;
create or replace function public.portal_code_request_result(p_id uuid,p_sent boolean) returns void
language sql security definer set search_path=pg_catalog,public,portal_private as $$
 update portal_private.partner_access_requests set status=case when p_sent then 'sent' else 'failed' end where id=p_id and status='pending';
$$;
revoke all on function public.portal_code_request_route(text,text),public.portal_code_request_result(uuid,boolean) from public,anon,authenticated;
grant execute on function public.portal_code_request_route(text,text),public.portal_code_request_result(uuid,boolean) to service_role;
commit;
