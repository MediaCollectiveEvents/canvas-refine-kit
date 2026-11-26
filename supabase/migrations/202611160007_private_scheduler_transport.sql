begin;
create extension if not exists http with schema extensions;
alter table portal_private.eventbrite_jobs add column dispatch_token text;
alter table portal_private.eventbrite_jobs add column http_status integer;
-- Credentials stay in the private RLS table; never in pg_net's shared request queue.
create function portal_private.prepare_eventbrite_job() returns void
language plpgsql security definer set search_path='' as $$
declare token text; actor uuid;
begin
 select o.user_id into actor from portal_private.owners o join auth.users a on a.id=o.user_id where o.active and o.user_id='50a047a3-600d-47ed-941f-140fd7058396' and a.email_confirmed_at is not null and (a.banned_until is null or a.banned_until<now());
 if actor is null then raise exception 'scheduled_owner_disabled';end if;
 token:='ebcron_'||replace(gen_random_uuid()::text,'-','')||replace(gen_random_uuid()::text,'-','');
 insert into portal_private.eventbrite_jobs(token_hash,actor,dispatch_token,expires_at) values(encode(sha256(convert_to(token,'UTF8')),'hex'),actor,token,now()+interval '30 minutes');
end $$;
revoke all on function portal_private.prepare_eventbrite_job() from public,anon,authenticated;
create or replace function portal_private.queue_eventbrite_refresh() returns bigint
language plpgsql security definer set search_path='' as $$
declare token text; status_code integer; h text;
begin
 -- Only credentials committed by the preceding run are used: the Edge Function must see the row.
 select j.dispatch_token,j.token_hash into token,h from portal_private.eventbrite_jobs j where not j.claimed and not j.used and j.expires_at>now() and j.dispatch_token is not null order by j.created_at limit 1;
 perform portal_private.prepare_eventbrite_job();
 if token is null then return 202;end if;
 perform extensions.http_set_curlopt('CURLOPT_TIMEOUT_MS','120000');
 select response.status into status_code from extensions.http((
 'POST','https://qtmbioguefmtwtngbava.supabase.co/functions/v1/eventbrite-sync',
 array[row('Authorization','Bearer '||token)::extensions.http_header],
 'application/json','{}')::extensions.http_request) as response;
 update portal_private.eventbrite_jobs set http_status=status_code,dispatch_token=null where token_hash=h;
 if status_code<>200 then raise warning 'Eventbrite scheduled refresh returned HTTP %',status_code;end if;
 return status_code;
end $$;
revoke all on function portal_private.queue_eventbrite_refresh() from public,anon,authenticated;
commit;
