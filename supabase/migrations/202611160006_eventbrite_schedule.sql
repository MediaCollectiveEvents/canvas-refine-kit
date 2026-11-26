begin;
create extension if not exists pg_cron;
create extension if not exists pg_net;
revoke all on table net.http_request_queue,net._http_response from public,anon,authenticated;
-- Short-lived, single-use job credentials. They grant raw OFF AIR sync only, never owner access.
create table portal_private.eventbrite_jobs(
 token_hash text primary key,
 actor uuid not null references auth.users(id),
 created_at timestamptz not null default now(),
 expires_at timestamptz not null default now()+interval '5 minutes',
 claimed boolean not null default false,
 used boolean not null default false,
 request_id bigint
);
alter table portal_private.eventbrite_jobs enable row level security;
revoke all on portal_private.eventbrite_jobs from public,anon,authenticated;
create function public.portal_eventbrite_job_state(p_token text) returns jsonb
language plpgsql security definer set search_path='' as $$
declare h text:=encode(sha256(convert_to(p_token,'UTF8')),'hex');
begin
 if p_token !~ '^ebcron_[a-f0-9]{64}$' then raise exception using errcode='42501',message='invalid_job';end if;
 update portal_private.eventbrite_jobs j set claimed=true where j.token_hash=h and not j.claimed and not j.used and j.expires_at>now() and exists(select 1 from portal_private.owners o where o.user_id=j.actor and o.active);
 if not found then raise exception using errcode='42501',message='invalid_job';end if;
 return jsonb_build_object('revision',coalesce((select v.revision from portal_private.report_current c join portal_private.report_versions v on v.id=c.version_id where c.event_id='off-air' and c.source_kind='eventbrite_raw'),0));
end $$;
revoke all on function public.portal_eventbrite_job_state(text) from public,anon,authenticated;
create function public.portal_eventbrite_job_ingest(p_token text,p_rows jsonb,p_base bigint) returns jsonb
language plpgsql security definer set search_path='' as $$
declare h text:=encode(sha256(convert_to(p_token,'UTF8')),'hex'); actor uuid; answer jsonb;
begin
 if p_token !~ '^ebcron_[a-f0-9]{64}$' then raise exception using errcode='42501',message='invalid_job';end if;
 select j.actor into actor from portal_private.eventbrite_jobs j where j.token_hash=h and j.claimed and not j.used and j.expires_at>now() for update;
 if not found then raise exception using errcode='42501',message='invalid_job';end if;
 answer:=portal_private.ingest_eventbrite(p_rows,p_base,'1999093084229',actor);
 update portal_private.eventbrite_jobs set used=true where token_hash=h;
 return answer;
end $$;
revoke all on function public.portal_eventbrite_job_ingest(text,jsonb,bigint) from public,anon,authenticated;
-- pg_cron executes this private function as postgres; no client can mint a job credential.
create function portal_private.queue_eventbrite_refresh() returns bigint
language plpgsql security definer set search_path='' as $$
declare token text; actor uuid; request bigint;
begin
 select user_id into actor from portal_private.owners where active and user_id='50a047a3-600d-47ed-941f-140fd7058396';
 if actor is null then raise exception 'scheduled_owner_disabled';end if;
 token:='ebcron_'||replace(gen_random_uuid()::text,'-','')||replace(gen_random_uuid()::text,'-','');
 delete from portal_private.eventbrite_jobs where created_at<now()-interval '7 days';
 insert into portal_private.eventbrite_jobs(token_hash,actor) values(encode(sha256(convert_to(token,'UTF8')),'hex'),actor);
 select net.http_post(url:='https://qtmbioguefmtwtngbava.supabase.co/functions/v1/eventbrite-sync',
 headers:=jsonb_build_object('Content-Type','application/json','Authorization','Bearer '||token),
 body:='{}'::jsonb,timeout_milliseconds:=120000) into request;
 update portal_private.eventbrite_jobs set request_id=request where token_hash=encode(sha256(convert_to(token,'UTF8')),'hex');
 return request;
end $$;
revoke all on function portal_private.queue_eventbrite_refresh() from public,anon,authenticated;
-- These endpoints require an unguessable, expiring database-minted job credential.
grant execute on function public.portal_eventbrite_job_state(text) to anon,authenticated;
grant execute on function public.portal_eventbrite_job_ingest(text,jsonb,bigint) to anon,authenticated;
-- Schedule is enabled separately after tests and Edge Function deployment.
commit;
