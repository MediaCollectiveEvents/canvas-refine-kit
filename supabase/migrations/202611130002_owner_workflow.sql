begin;
create table portal_private.session_activity(session_id uuid primary key references auth.sessions(id) on delete cascade,last_seen timestamptz not null default now());
alter table portal_private.session_activity enable row level security;
revoke all on portal_private.session_activity from public,anon,authenticated;
-- Unexposed helper: validate the current account AND the revocable Auth session.
create function portal_private.require_owner() returns uuid
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
 insert into portal_private.session_activity(session_id) values(sid::uuid) on conflict do nothing;
 select last_seen into seen from portal_private.session_activity where session_id=sid::uuid for update;
 if seen<now()-interval '30 minutes' then raise exception using errcode='42501',message='session_expired';end if;
 update portal_private.session_activity set last_seen=now() where session_id=sid::uuid;
 return u;
end $$;
revoke all on function portal_private.require_owner() from public,anon,authenticated;

create function public.portal_owner_state(p_event text) returns jsonb
language plpgsql security definer set search_path='' as $$
declare actor uuid; answer jsonb;
begin
 actor:=portal_private.require_owner();
 if not exists(select 1 from portal_private.events where id=p_event) then raise exception 'event_not_found';end if;
 select jsonb_build_object(
  'current',coalesce((select v.revision from portal_private.report_current c join portal_private.report_versions v on v.id=c.version_id where c.event_id=p_event and c.source_kind='enriched'),0),
  'versions',coalesce((select jsonb_agg(jsonb_build_object('id',v.revision,'name',v.label,'at',v.created_at,'rows',v.records,'sha256',v.sha256) order by v.revision) from portal_private.report_versions v where v.event_id=p_event and v.source_kind='enriched'),'[]'::jsonb),
  'introductions',coalesce((select jsonb_agg(jsonb_build_object('guestName',r.guest_name,'sponsor',s.name,'requester',a.email,'requestedAt',extract(epoch from r.requested_at),'status',r.status) order by r.requested_at desc) from portal_private.introduction_requests r join portal_private.sponsors s on s.id=r.sponsor_id join auth.users a on a.id=r.requested_by where r.event_id=p_event),'[]'::jsonb)
 ) into answer;
 return answer;
end $$;
revoke all on function public.portal_owner_state(text) from public,anon,authenticated;

create function portal_private.validate_enriched(p_rows jsonb) returns void
language plpgsql set search_path='' as $$
declare r jsonb; f text;
begin
 if jsonb_typeof(p_rows) is distinct from 'array' then raise exception 'invalid_rows';end if;
 if jsonb_array_length(p_rows)<1 or jsonb_array_length(p_rows)>5000 or octet_length(p_rows::text)>2097152 then raise exception 'invalid_rows';end if;
 for r in select value from jsonb_array_elements(p_rows) loop
  foreach f in array array['attendeeId','firstName','lastName','email','company','jobTitle','linkedin'] loop
   if jsonb_typeof(r->f) is distinct from 'string' or length(r->>f)>1000 or (r->>f) ~ '[[:cntrl:]]' then raise exception 'invalid_fields';end if;
  end loop;
  if trim(r->>'firstName')='' or trim(r->>'lastName')='' or (trim(r->>'attendeeId')='' and trim(r->>'email')='') then raise exception 'missing_identity';end if;
  if (r->>'email')<>'' and (r->>'email') !~ '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$' then raise exception 'invalid_email';end if;
  if (r->>'linkedin')<>'' and (r->>'linkedin') !~* '^(https?://)?((www|[a-z]{2})\.)?linkedin\.com/in/[^/[:space:]?#]+/?(\?[^[:space:]#]*)?(#[^[:space:]]*)?$' then raise exception 'invalid_linkedin';end if;
 end loop;
 if exists(select 1 from jsonb_array_elements(p_rows) as entry where trim(entry.value->>'attendeeId')<>'' group by trim(entry.value->>'attendeeId') having count(*)>1)
 or exists(select 1 from jsonb_array_elements(p_rows) as entry where trim(entry.value->>'email')<>'' group by lower(trim(entry.value->>'email')) having count(*)>1) then raise exception 'duplicate_identity';end if;
end $$;
revoke all on function portal_private.validate_enriched(jsonb) from public,anon,authenticated;

create function public.portal_owner_publish(p_event text,p_rows jsonb,p_name text,p_base bigint,p_agreed boolean) returns jsonb
language plpgsql security definer set search_path='' as $$
declare actor uuid; old_id uuid; old_revision bigint; version uuid; previous jsonb; r jsonb; by_id jsonb; by_email jsonb; matched text[]:='{}';match_key text;
begin
 actor:=portal_private.require_owner();
 if p_agreed is distinct from true or p_base is null or p_base<0 or p_name is null or length(trim(p_name)) not between 1 and 255 then raise exception 'review_required';end if;
 perform portal_private.validate_enriched(p_rows);
 -- Lock the event even before the first report exists; concurrent first publishes cannot race.
 perform 1 from portal_private.events where id=p_event for update;
 if not found then raise exception 'event_not_found';end if;
 select c.version_id,v.revision,v.records into old_id,old_revision,previous from portal_private.report_current c join portal_private.report_versions v on v.id=c.version_id where c.event_id=p_event and c.source_kind='enriched';
 if coalesce(old_revision,0)<>p_base then raise exception using errcode='40001',message='stale_version';end if;
 if previous is not null then
  for r in select value from jsonb_array_elements(p_rows) loop
   by_id:=null;by_email:=null;
   if (r->>'attendeeId')<>'' then select value into by_id from jsonb_array_elements(previous) where value->>'attendeeId'=r->>'attendeeId' limit 1;end if;
   if (r->>'email')<>'' then select value into by_email from jsonb_array_elements(previous) where lower(value->>'email')=lower(r->>'email') limit 1;end if;
   if by_id is not null and by_email is not null and by_id<>by_email then raise exception 'identity_conflict';end if;
   if by_email is not null and (r->>'attendeeId')<>'' and (by_email->>'attendeeId')<>'' and (r->>'attendeeId')<>(by_email->>'attendeeId') then raise exception 'identity_conflict';end if;
   if coalesce(by_id,by_email) is not null then
    match_key:=coalesce(by_id,by_email)::text;
    if match_key=any(matched) then raise exception 'identity_conflict';end if;
    matched:=array_append(matched,match_key);
   end if;
  end loop;
 end if;
 insert into portal_private.report_versions(event_id,source_kind,label,report_date,records,sha256,created_by)
 values(p_event,'enriched',trim(p_name),current_date,p_rows,encode(sha256(convert_to(p_rows::text,'UTF8')),'hex'),actor) returning id into version;
 insert into portal_private.report_current(event_id,source_kind,version_id) values(p_event,'enriched',version)
 on conflict(event_id,source_kind) do update set version_id=excluded.version_id;
 insert into portal_private.audit(actor,event_id,action,version_id) values(actor,p_event,'publish_enriched',version);
 return public.portal_owner_state(p_event);
end $$;
revoke all on function public.portal_owner_publish(text,jsonb,text,bigint,boolean) from public,anon,authenticated;

create function public.portal_owner_restore(p_event text,p_revision bigint,p_base bigint) returns jsonb
language plpgsql security definer set search_path='' as $$
declare actor uuid; old_revision bigint; original portal_private.report_versions%rowtype; version uuid;
begin
 actor:=portal_private.require_owner();
 if p_base is null or p_base<0 then raise exception 'review_required';end if;
 perform 1 from portal_private.events where id=p_event for update;
 if not found then raise exception 'event_not_found';end if;
 select v.revision into old_revision from portal_private.report_current c join portal_private.report_versions v on v.id=c.version_id where c.event_id=p_event and c.source_kind='enriched';
 if coalesce(old_revision,0)<>p_base then raise exception using errcode='40001',message='stale_version';end if;
 select * into original from portal_private.report_versions where event_id=p_event and source_kind='enriched' and revision=p_revision;
 if not found then raise exception 'version_not_found';end if;
 insert into portal_private.report_versions(event_id,source_kind,label,report_date,records,sha256,created_by,restored_from)
 values(p_event,'enriched','Restored from version '||p_revision,original.report_date,original.records,original.sha256,actor,original.id) returning id into version;
 insert into portal_private.report_current(event_id,source_kind,version_id) values(p_event,'enriched',version)
 on conflict(event_id,source_kind) do update set version_id=excluded.version_id;
 insert into portal_private.audit(actor,event_id,action,version_id) values(actor,p_event,'restore_enriched',version);
 return public.portal_owner_state(p_event);
end $$;
revoke all on function public.portal_owner_restore(text,bigint,bigint) from public,anon,authenticated;
-- Keep all new API functions ungranted pending execution tests and owner provisioning.
commit;
