begin;
-- Private portal references only; source records and Contact Master IDs are unchanged.
create table portal_private.meeting_guest_refs(id uuid primary key default gen_random_uuid(),event_id text not null references portal_private.events(id),unique(event_id,id));
create table portal_private.meeting_guest_aliases(event_id text not null,identity text not null check(length(identity) between 1 and 1100),guest_ref uuid not null,primary key(event_id,identity),foreign key(event_id,guest_ref) references portal_private.meeting_guest_refs(event_id,id));
create table portal_private.meeting_interests(event_id text not null,sponsor_id uuid not null references portal_private.sponsors(id),user_id uuid not null references auth.users(id),guest_ref uuid not null,selected boolean not null,selected_at timestamptz not null default now(),updated_at timestamptz not null default now(),guest_snapshot jsonb not null,primary key(event_id,sponsor_id,user_id,guest_ref),foreign key(event_id,guest_ref) references portal_private.meeting_guest_refs(event_id,id));
alter table portal_private.meeting_guest_refs enable row level security;
alter table portal_private.meeting_guest_aliases enable row level security;
alter table portal_private.meeting_interests enable row level security;
revoke all on portal_private.meeting_guest_refs,portal_private.meeting_guest_aliases,portal_private.meeting_interests from public,anon,authenticated;
create function portal_private.meeting_guest_source_rows(p_event text) returns jsonb

language sql stable security definer set search_path='' as $$
 with enriched as (
  select x.value,x.ordinality from portal_private.report_current c join portal_private.report_versions v on v.id=c.version_id
  cross join lateral jsonb_array_elements(v.records) with ordinality x(value,ordinality)
  where c.event_id=p_event and c.source_kind='enriched'
 ), registrations as (
  select x.value,x.ordinality from portal_private.report_current c join portal_private.report_versions v on v.id=c.version_id
  cross join lateral jsonb_array_elements(v.records) with ordinality x(value,ordinality)
  where c.event_id=p_event and c.source_kind='eventbrite_raw' and not portal_private.registration_is_deleted(p_event,x.value)
 ), guests as (
  select e.ordinality as position,jsonb_build_object('firstName',e.value->>'firstName','lastName',e.value->>'lastName','company',e.value->>'company','jobTitle',e.value->>'jobTitle','linkedin',e.value->>'linkedin',
   'registeredAt',coalesce(m.value->>'registeredAt',''), '_aliases',to_jsonb(array_remove(array[nullif('eb:'||nullif(trim(m.value->>'attendeeId'),''),'eb:'),nullif('eb:'||nullif(trim(e.value->>'attendeeId'),''),'eb:'),nullif('email:'||nullif(lower(trim(m.value->>'email')),''),'email:'),nullif('email:'||nullif(lower(trim(e.value->>'email')),''),'email:')],null))) as guest
  from enriched e left join lateral(select r.value from registrations r where
    (nullif(trim(e.value->>'attendeeId'),'') is not null and trim(e.value->>'attendeeId')=trim(r.value->>'attendeeId')) or
    (nullif(trim(e.value->>'email'),'') is not null and lower(trim(e.value->>'email'))=lower(trim(r.value->>'email'))) or
    (nullif(trim(e.value->>'firstName'),'') is not null and nullif(trim(e.value->>'lastName'),'') is not null and
     lower(regexp_replace(trim(e.value->>'firstName'),'[[:space:]]+',' ','g'))=lower(regexp_replace(trim(r.value->>'firstName'),'[[:space:]]+',' ','g')) and
     lower(regexp_replace(trim(e.value->>'lastName'),'[[:space:]]+',' ','g'))=lower(regexp_replace(trim(r.value->>'lastName'),'[[:space:]]+',' ','g'))) or
    exists(select 1 from portal_private.registration_links l where l.event_id=p_event and l.registration_id=r.value->>'attendeeId' and l.active and
     ((l.target_reference<>'' and l.target_reference=e.value->>'attendeeId') or (l.target_email<>'' and l.target_email=lower(trim(e.value->>'email')))))
   order by nullif(r.value->>'registeredAt','') asc nulls last,r.ordinality limit 1) m on true
  union all
  select 1000000+r.ordinality,jsonb_build_object('firstName',r.value->>'firstName','lastName',r.value->>'lastName','company',r.value->>'company','jobTitle',r.value->>'jobTitle','linkedin','','registeredAt',r.value->>'registeredAt','_aliases',to_jsonb(array_remove(array[nullif('eb:'||nullif(trim(r.value->>'attendeeId'),''),'eb:'),nullif('email:'||nullif(lower(trim(r.value->>'email')),''),'email:')],null)))
  from registrations r where not portal_private.registration_is_enriched(p_event,r.value)
 ) select coalesce(jsonb_agg(guest order by position),'[]'::jsonb) from guests;
$$;
revoke all on function portal_private.meeting_guest_source_rows(text) from public,anon,authenticated;
create or replace function portal_private.sponsor_guest_rows(p_event text) returns jsonb
language plpgsql volatile security definer set search_path='' as $$
declare row_data jsonb; aliases text[]; refs uuid[]; ref uuid; result jsonb:='[]';
begin
 -- Serialise opaque reference allocation. Never expose private identity aliases.
 perform 1 from portal_private.events where id=p_event for update;
 for row_data in select value from jsonb_array_elements(portal_private.meeting_guest_source_rows(p_event)) loop
  select array_agg(distinct value) into aliases from jsonb_array_elements_text(row_data->'_aliases');
  select array_agg(distinct guest_ref) into refs from portal_private.meeting_guest_aliases where event_id=p_event and identity=any(aliases);
  ref:=null;
  if cardinality(refs)=1 then ref:=refs[1];
  elsif coalesce(cardinality(refs),0)=0 and cardinality(aliases)>0 then
   insert into portal_private.meeting_guest_refs(event_id) values(p_event) returning id into ref;
  end if;
  -- Conflicting aliases never silently merge; that registrant has no selectable reference.
  if ref is not null then
   insert into portal_private.meeting_guest_aliases(event_id,identity,guest_ref) select p_event,a,ref from unnest(aliases) a on conflict do nothing;
  end if;
  result:=result||jsonb_build_array((row_data-'_aliases')||jsonb_build_object('guestRef',ref));
 end loop;
 return result;
end $$;
revoke all on function portal_private.sponsor_guest_rows(text) from public,anon,authenticated;

create function public.portal_meeting_interests(p_sponsor uuid) returns jsonb
language plpgsql security definer set search_path='' as $$
declare actor uuid;
begin
 actor:=portal_private.require_sponsor('off-air',p_sponsor);
 if not exists(select 1 from portal_private.terms_acceptance where user_id=actor and terms_version='off-air-2026-11-16-v2') then raise exception using errcode='42501',message='terms_required';end if;
 return coalesce((select jsonb_agg(guest_ref) from portal_private.meeting_interests where event_id='off-air' and sponsor_id=p_sponsor and user_id=actor and selected),'[]');
end $$;
create function public.portal_meeting_interest_set(p_sponsor uuid,p_guest uuid,p_selected boolean) returns jsonb
language plpgsql security definer set search_path='' as $$
declare actor uuid; rows jsonb; snapshot jsonb; matches int;
begin
 actor:=portal_private.require_sponsor('off-air',p_sponsor);
 if not exists(select 1 from portal_private.terms_acceptance where user_id=actor and terms_version='off-air-2026-11-16-v2') then raise exception using errcode='42501',message='terms_required';end if;
 if p_selected is null or p_guest is null then raise exception 'invalid_meeting_selection';end if;
 rows:=portal_private.sponsor_guest_rows('off-air');
 select count(*) into matches from jsonb_array_elements(rows) x where x->>'guestRef'=p_guest::text;
 if p_selected then
  if matches<>1 then raise exception 'guest_selection_unavailable';end if;
  select value into snapshot from jsonb_array_elements(rows) where value->>'guestRef'=p_guest::text;
  insert into portal_private.meeting_interests(event_id,sponsor_id,user_id,guest_ref,selected,guest_snapshot) values('off-air',p_sponsor,actor,p_guest,true,snapshot)
  on conflict(event_id,sponsor_id,user_id,guest_ref) do update set selected=true,selected_at=case when portal_private.meeting_interests.selected then portal_private.meeting_interests.selected_at else now() end,updated_at=now(),guest_snapshot=excluded.guest_snapshot;
 else
  update portal_private.meeting_interests set selected=false,updated_at=now() where event_id='off-air' and sponsor_id=p_sponsor and user_id=actor and guest_ref=p_guest;
 end if;
 insert into portal_private.audit(actor,event_id,action,details) values(actor,'off-air','meeting_interest_changed',jsonb_build_object('sponsorId',p_sponsor,'guestRef',p_guest,'selected',p_selected));
 return public.portal_meeting_interests(p_sponsor);
end $$;
create function public.portal_owner_meeting_interests() returns jsonb
language plpgsql security definer set search_path='' as $$
declare guests jsonb;
begin
 perform portal_private.require_owner();
 guests:=portal_private.sponsor_guest_rows('off-air');
 return coalesce((select jsonb_agg(jsonb_build_object('guestRef',i.guest_ref,'guest',coalesce((select value from jsonb_array_elements(guests) where value->>'guestRef'=i.guest_ref::text limit 1),i.guest_snapshot),'current',exists(select 1 from jsonb_array_elements(guests) where value->>'guestRef'=i.guest_ref::text),'partner',s.name,'requester',a.email,'selectedAt',i.selected_at) order by i.selected_at desc) from portal_private.meeting_interests i join portal_private.sponsors s on s.id=i.sponsor_id join auth.users a on a.id=i.user_id where i.event_id='off-air' and i.selected),'[]');
end $$;
revoke all on function public.portal_meeting_interests(uuid),public.portal_meeting_interest_set(uuid,uuid,boolean),public.portal_owner_meeting_interests() from public,anon;
grant execute on function public.portal_meeting_interests(uuid),public.portal_meeting_interest_set(uuid,uuid,boolean),public.portal_owner_meeting_interests() to authenticated;
create or replace function public.portal_owner_recovery_export() returns jsonb
language plpgsql security definer set search_path='' as $$
declare actor uuid;table_name text;content jsonb:='{}'::jsonb;records jsonb;
begin
 actor:=portal_private.require_owner();
 -- Only portal business records. Never export password hashes, MFA factors, sessions, tokens or bridge/job keys.
 foreach table_name in array array['events','owners','sponsors','memberships','event_access','terms_acceptance','report_versions','report_current','introduction_requests','collateral','audit','registration_links','invitation_requests','gallery_images','speaker_profiles','speaker_revisions','speaker_talking_points','registration_exclusions','meeting_guest_refs','meeting_guest_aliases','meeting_interests'] loop
  if table_name='speaker_profiles' then
   select coalesce(jsonb_agg(to_jsonb(t)-'token_hash'-'expires_at'),'[]'::jsonb) into records from portal_private.speaker_profiles t;
  else
   execute format('select coalesce(jsonb_agg(to_jsonb(t)),''[]''::jsonb) from portal_private.%I t',table_name) into records;
  end if;
  content:=content||jsonb_build_object(table_name,records);
 end loop;
 insert into portal_private.audit(actor,event_id,action) values(actor,'off-air','owner_recovery_export');
 return jsonb_build_object('format','media-collective-portal-recovery','version',1,'exportedAt',now(),'migration','202611180030',
 'tables',content,'identityMap',(select coalesce(jsonb_agg(jsonb_build_object('id',a.id,'email',a.email)),'[]') from auth.users a where exists(select 1 from portal_private.owners o where o.user_id=a.id) or exists(select 1 from portal_private.memberships m where m.user_id=a.id)),
 'limitations',jsonb_build_array('Portal recovery export, not a complete PostgreSQL or Auth backup.','Passwords, authenticators, session tokens, provider secrets and bridge keys are excluded.','Recover accounts and reconnect provider credentials separately after a total project loss.'));
end $$;
revoke all on function public.portal_owner_recovery_export() from public,anon,authenticated;
grant execute on function public.portal_owner_recovery_export() to authenticated;
commit;
