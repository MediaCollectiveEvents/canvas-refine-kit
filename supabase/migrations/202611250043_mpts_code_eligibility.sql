begin;
create or replace function public.portal_code_request_route(p_email text,p_ip_hash text) returns jsonb
language plpgsql security definer set search_path='' as $$
declare
 v_user auth.users%rowtype;
 v_request_id uuid;
begin
 if p_email is null or length(p_email)>254
    or p_email !~ '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$'
    or p_ip_hash is null or p_ip_hash !~ '^[a-f0-9]{64}$' then
  raise exception 'invalid_request';
 end if;

 select * into v_user from auth.users where lower(email)=lower(p_email) limit 1;
 if found then
  if (v_user.banned_until is null or v_user.banned_until<now()) and exists (
   select 1 from portal_private.memberships m
   join portal_private.sponsors s on s.id=m.sponsor_id
   join portal_private.event_access ea on ea.sponsor_id=s.id
   where m.user_id=v_user.id and m.active and s.active
    and (m.expires_at is null or m.expires_at>now())
    and ea.revoked_at is null and ea.expires_at>now()
    and (
      (ea.event_id='off-air' and now()<timestamptz '2026-12-16 00:00:00+00')
      or ea.event_id='mpts-reception-2027'
    )
  ) then
   return jsonb_build_object('registered',true,'confirmed',v_user.email_confirmed_at is not null);
  end if;
  return jsonb_build_object('registered',false);
 end if;

 -- Retain the existing throttled owner notification for unknown addresses.
 perform pg_advisory_xact_lock(20261120,34);
 if exists(select 1 from portal_private.partner_access_requests where email=lower(p_email) and requested_at>now()-interval '24 hours' and status in ('sent','pending'))
 or (select count(*) from portal_private.partner_access_requests where ip_hash=p_ip_hash and requested_at>now()-interval '15 minutes')>=3
 or (select count(*) from portal_private.partner_access_requests where requested_at>now()-interval '24 hours')>=50
 then return jsonb_build_object('registered',false);end if;
 insert into portal_private.partner_access_requests(email,ip_hash)
 values(lower(p_email),p_ip_hash) returning id into v_request_id;
 return jsonb_build_object('registered',false,'requestId',v_request_id);
end $$;
commit;
