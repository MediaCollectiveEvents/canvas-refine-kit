begin;

create table portal_private.taxonomy_terms (
  id text primary key check(id ~ '^[a-z0-9]+(-[a-z0-9]+)*$' and length(id)<=80),
  kind text not null check(kind in ('area','theme','keyword')),
  label text not null check(length(trim(label)) between 1 and 200),
  description text not null check(length(trim(description)) between 1 and 4000),
  status text not null default 'proposed' check(status in ('proposed','under_review','approved','active','retired')),
  original_status text,
  evidence_locator text,
  replaced_by text references portal_private.taxonomy_terms(id),
  revision integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  modified_by uuid references auth.users(id),
  first_activated_at timestamptz,
  approved_at timestamptz,
  approved_by uuid references auth.users(id),
  check(replaced_by is null or (status='retired' and replaced_by<>id))
);
create unique index taxonomy_unique_label on portal_private.taxonomy_terms(kind,lower(trim(label))) where status<>'retired';
create table portal_private.taxonomy_aliases (
  term_id text not null references portal_private.taxonomy_terms(id),
  alias text not null check(length(trim(alias)) between 1 and 200),
  primary key(term_id,alias)
);
create table portal_private.taxonomy_relationships (
  keyword_id text not null references portal_private.taxonomy_terms(id),
  theme_id text not null references portal_private.taxonomy_terms(id),
  primary key(keyword_id,theme_id), check(keyword_id<>theme_id)
);
create table portal_private.taxonomy_sources (id text primary key, evidence jsonb not null);
create table portal_private.taxonomy_term_sources (
  term_id text not null references portal_private.taxonomy_terms(id),
  source_id text not null references portal_private.taxonomy_sources(id),
  primary key(term_id,source_id)
);
create table portal_private.taxonomy_legacy_ids (
  legacy_id text primary key,
  keyword_id text not null references portal_private.taxonomy_terms(id)
);
create table portal_private.taxonomy_historical_events (
  event_ref text not null,
  legacy_theme text not null,
  legacy_keyword text not null references portal_private.taxonomy_legacy_ids(legacy_id),
  primary key(event_ref,legacy_theme,legacy_keyword)
);
create table portal_private.taxonomy_assignments (
  term_id text not null references portal_private.taxonomy_terms(id),
  entity_type text not null check(entity_type in ('article','contributor','speaker','community_member','event','session','partner','sponsor')),
  entity_id text not null check(length(entity_id) between 1 and 200),
  relationship text not null check(relationship in ('professional_area','verified_expertise','declared_interest','editorial_tag')),
  created_at timestamptz not null default now(),
  created_by uuid references auth.users(id),
  primary key(entity_type,entity_id,relationship,term_id)
);
create table portal_private.taxonomy_revisions (
  term_id text not null references portal_private.taxonomy_terms(id),
  revision integer not null,
  snapshot jsonb not null,
  recorded_at timestamptz not null default now(),
  actor uuid references auth.users(id),
  primary key(term_id,revision)
);
create table portal_private.taxonomy_active_versions (
  term_id text primary key references portal_private.taxonomy_terms(id),
  snapshot jsonb not null,
  activated_at timestamptz not null default now(),
  activated_by uuid references auth.users(id)
);
create table portal_private.taxonomy_suggestions (
 id uuid primary key default gen_random_uuid(),
 submission_id uuid not null references portal_private.insights_submissions(id),
 label text not null check(length(trim(label)) between 1 and 200),
 reason text not null default '' check(length(reason)<=1000),
 status text not null default 'proposed' check(status in ('proposed','reviewed')),
 reviewed_by uuid references auth.users(id),
 reviewed_at timestamptz,
 created_at timestamptz not null default now()
);
create unique index taxonomy_suggestion_unique on portal_private.taxonomy_suggestions(submission_id,lower(trim(label)));

alter table portal_private.taxonomy_terms enable row level security;
revoke all on portal_private.taxonomy_terms from public,anon,authenticated;
alter table portal_private.taxonomy_aliases enable row level security;
revoke all on portal_private.taxonomy_aliases from public,anon,authenticated;
alter table portal_private.taxonomy_relationships enable row level security;
revoke all on portal_private.taxonomy_relationships from public,anon,authenticated;
alter table portal_private.taxonomy_sources enable row level security;
revoke all on portal_private.taxonomy_sources from public,anon,authenticated;
alter table portal_private.taxonomy_term_sources enable row level security;
revoke all on portal_private.taxonomy_term_sources from public,anon,authenticated;
alter table portal_private.taxonomy_legacy_ids enable row level security;
revoke all on portal_private.taxonomy_legacy_ids from public,anon,authenticated;
alter table portal_private.taxonomy_historical_events enable row level security;
revoke all on portal_private.taxonomy_historical_events from public,anon,authenticated;
alter table portal_private.taxonomy_assignments enable row level security;
revoke all on portal_private.taxonomy_assignments from public,anon,authenticated;
alter table portal_private.taxonomy_revisions enable row level security;
revoke all on portal_private.taxonomy_revisions from public,anon,authenticated;
alter table portal_private.taxonomy_active_versions enable row level security;
revoke all on portal_private.taxonomy_active_versions from public,anon,authenticated;
alter table portal_private.taxonomy_suggestions enable row level security;
revoke all on portal_private.taxonomy_suggestions from public,anon,authenticated;

create function portal_private.taxonomy_record(term portal_private.taxonomy_terms) returns jsonb
language sql stable set search_path='' as $$
  select to_jsonb(term) || jsonb_build_object(
    'aliases',array(select a.alias from portal_private.taxonomy_aliases a where a.term_id=term.id order by a.alias),
    'themeIds',array(select r.theme_id from portal_private.taxonomy_relationships r where r.keyword_id=term.id order by r.theme_id),
    'sourceIds',array(select s.source_id from portal_private.taxonomy_term_sources s where s.term_id=term.id order by s.source_id),
    'serving',exists(select from portal_private.taxonomy_active_versions v where v.term_id=term.id),
    'legacyIds',array(select l.legacy_id from portal_private.taxonomy_legacy_ids l where l.keyword_id=term.id order by l.legacy_id)
  );
$$;
revoke all on function portal_private.taxonomy_record(portal_private.taxonomy_terms) from public,anon,authenticated;

create function portal_private.taxonomy_public_record(term portal_private.taxonomy_terms) returns jsonb
language sql stable set search_path='' as $$
 select jsonb_build_object('id',term.id,'kind',term.kind,'label',term.label,'description',term.description,
  'aliases',array(select a.alias from portal_private.taxonomy_aliases a where a.term_id=term.id order by a.alias),
  'themeIds',array(select r.theme_id from portal_private.taxonomy_relationships r where r.keyword_id=term.id order by r.theme_id));
$$;
revoke all on function portal_private.taxonomy_public_record(portal_private.taxonomy_terms) from public,anon,authenticated;
create function public.taxonomy_active() returns jsonb
language sql stable security definer set search_path='' as $$
  select coalesce(jsonb_agg(v.snapshot || jsonb_build_object('themeIds',array(
   select id from jsonb_array_elements_text(v.snapshot->'themeIds') id
   where exists(select from portal_private.taxonomy_active_versions theme where theme.term_id=id)
  )) order by v.snapshot->>'kind',v.snapshot->>'label'),'[]'::jsonb)
  from portal_private.taxonomy_active_versions v;
$$;

create function public.taxonomy_snapshot() returns jsonb
language sql stable security definer set search_path='' as $$
  select public.taxonomy_active() || coalesce(jsonb_agg(portal_private.taxonomy_public_record(t) || '{"active":false}'::jsonb),'[]'::jsonb)
  from portal_private.taxonomy_terms t where t.first_activated_at is not null
  and not exists(select from portal_private.taxonomy_active_versions v where v.term_id=t.id);
$$;

create function public.taxonomy_resolve(p_id text,p_kind text) returns jsonb
language sql stable security definer set search_path='' as $$
  select jsonb_build_object('id',t.id,'kind',t.kind,'label',coalesce(v.snapshot->>'label',t.label),'status',case when v.term_id is not null then 'active' else t.status end,'replacement',t.replaced_by)
  from portal_private.taxonomy_terms t left join portal_private.taxonomy_active_versions v on v.term_id=t.id
  where t.kind=p_kind and (
    t.id=p_id or
    (p_kind='keyword' and exists(select from portal_private.taxonomy_legacy_ids l where l.legacy_id=p_id and l.keyword_id=t.id)) or
    exists(select from jsonb_array_elements_text(v.snapshot->'aliases') alias where lower(alias)=lower(p_id))
  ) and (v.term_id is not null or t.status='retired' or exists(select from portal_private.taxonomy_legacy_ids l where l.legacy_id=p_id and l.keyword_id=t.id))
  order by (t.id=p_id) desc,t.id limit 1;
$$;

create function public.taxonomy_suggest(p_token text,p_label text,p_reason text default '') returns jsonb
language plpgsql security definer set search_path='' as $$
declare submission uuid;
begin
  if p_token is null or p_token !~ '^[a-f0-9]{64}$' then raise exception 'invalid_link'; end if;
  select id into submission from portal_private.insights_submissions
  where token_hash=encode(sha256(convert_to(p_token,'UTF8')),'hex') and expires_at>now()
        and status in ('draft','changes_requested') for update;
  if not found then raise exception 'invalid_link';end if;
  if p_label is null or length(trim(p_label)) not between 1 and 200 or length(coalesce(p_reason,''))>1000 then raise exception 'invalid_suggestion';end if;
  if (select count(*) from portal_private.taxonomy_suggestions where submission_id=submission)>=20 then raise exception 'suggestion_limit_reached';end if;
  if exists(select from portal_private.taxonomy_active_versions v
   where v.snapshot->>'kind'='keyword' and (lower(v.snapshot->>'label')=lower(trim(p_label)) or
   exists(select from jsonb_array_elements_text(v.snapshot->'aliases') a where lower(a)=lower(trim(p_label))))) then
   raise exception 'term_already_active';
  end if;
  insert into portal_private.taxonomy_suggestions(submission_id,label,reason)
  values(submission,trim(p_label),trim(coalesce(p_reason,''))) on conflict do nothing;
  return jsonb_build_object('saved',true);
end $$;

create function public.taxonomy_owner(p_action text,p_data jsonb default '{}'::jsonb) returns jsonb
language plpgsql security definer set search_path='' as $$
declare
  actor uuid; term portal_private.taxonomy_terms; current_id text; current_kind text;
  next_status text; next_label text; next_description text; replacement text;
  aliases text[]; themes text[]; item record; saved_count int:=0;
begin
  actor:=portal_private.require_owner();
  if p_action='list' then
    return jsonb_build_object(
      'terms',(select coalesce(jsonb_agg(portal_private.taxonomy_record(t) order by t.kind,t.label),'[]'::jsonb) from portal_private.taxonomy_terms t),
      'sources',(select coalesce(jsonb_agg(evidence order by id),'[]'::jsonb) from portal_private.taxonomy_sources),
      'historicalEvents',(select coalesce(jsonb_agg(to_jsonb(m) order by event_ref,legacy_theme,legacy_keyword),'[]'::jsonb) from portal_private.taxonomy_historical_events m),
      'suggestions',(select coalesce(jsonb_agg(to_jsonb(s)-'submission_id' order by created_at desc),'[]'::jsonb) from portal_private.taxonomy_suggestions s)
    );
  elsif p_action='history' then
    return jsonb_build_object('rows',(select coalesce(jsonb_agg(to_jsonb(r) order by revision desc),'[]'::jsonb) from portal_private.taxonomy_revisions r where term_id=p_data->>'id'));
  elsif p_action='review_suggestion' then
    update portal_private.taxonomy_suggestions set status='reviewed',reviewed_at=now(),reviewed_by=actor where id=(p_data->>'id')::uuid and status='proposed';
    if not found then raise exception 'stale_suggestion';end if;
    return jsonb_build_object('saved',true);
  end if;

  perform pg_advisory_xact_lock(hashtext('media-collective-taxonomy'));
  if p_action='approve_many' then
    if jsonb_typeof(p_data->'terms') is distinct from 'array' or jsonb_array_length(p_data->'terms') not between 1 and 100 then raise exception 'invalid_bulk_request';end if;
    for item in select distinct value from jsonb_array_elements(p_data->'terms') loop
      perform public.taxonomy_owner('approve',item.value);
      saved_count:=saved_count+1;
    end loop;
    return jsonb_build_object('saved',saved_count);
  end if;

  current_id:=p_data->>'id';
  select * into term from portal_private.taxonomy_terms t where t.id=current_id for update;
  if p_action='create' then
    if found or current_id is null or current_id !~ '^[a-z0-9]+(-[a-z0-9]+)*$' or length(current_id)>80 then raise exception 'duplicate_or_invalid_id';end if;
    current_kind:=p_data->>'kind';
    if current_kind is null or current_kind not in ('area','theme','keyword') then raise exception 'invalid_layer';end if;
  else
    if not found or term.revision is distinct from (p_data->>'revision')::integer then raise exception 'stale_taxonomy_revision';end if;
    current_kind:=term.kind;
  end if;

  if p_action in ('create','edit') then
    next_label:=trim(coalesce(p_data->>'label',''));
    next_description:=trim(coalesce(p_data->>'description',''));
    if length(next_label) not between 1 and 200 or length(next_description) not between 1 and 4000 or
       jsonb_typeof(p_data->'aliases') is distinct from 'array' or jsonb_typeof(p_data->'themeIds') is distinct from 'array' then raise exception 'invalid_term';end if;
    if jsonb_array_length(p_data->'aliases')>40 or jsonb_array_length(p_data->'themeIds')>40 then raise exception 'invalid_term';end if;
    aliases:=array(select min(trim(value)) from jsonb_array_elements_text(p_data->'aliases') where trim(value)<>'' group by lower(trim(value)));
    themes:=array(select distinct value from jsonb_array_elements_text(p_data->'themeIds'));
    if exists(select from unnest(aliases) a where length(a)>200 or lower(a)=lower(next_label)) then raise exception 'duplicate_or_invalid_alias';end if;
    if exists(select from portal_private.taxonomy_terms t left join portal_private.taxonomy_aliases a on a.term_id=t.id
      where t.kind=current_kind and t.id<>current_id and t.status<>'retired' and (
       lower(t.label)=lower(next_label) or lower(a.alias)=lower(next_label) or
       exists(select from unnest(aliases) v where lower(v) in (lower(t.label),lower(a.alias))))
    ) then raise exception 'duplicate_term_or_alias';end if;
    if (current_kind='keyword' and cardinality(themes)=0) or (current_kind<>'keyword' and cardinality(themes)>0) or
       exists(select from unnest(themes) as chosen(theme_id) where not exists(select from portal_private.taxonomy_terms t where t.id=chosen.theme_id and t.kind='theme' and t.status<>'retired'))
    then raise exception 'invalid_keyword_themes';end if;
    if p_action='create' then
      insert into portal_private.taxonomy_terms(id,kind,label,description,modified_by)
      values(current_id,current_kind,next_label,next_description,actor);
    else
      if term.status='retired' then raise exception 'reactivate_before_editing';end if;
      update portal_private.taxonomy_terms set label=next_label,description=next_description,
        status=case when status in ('approved','active') then 'under_review' else status end,
        approved_at=null,approved_by=null,revision=revision+1,updated_at=now(),modified_by=actor where id=current_id;
      delete from portal_private.taxonomy_aliases where term_id=current_id;
      delete from portal_private.taxonomy_relationships where keyword_id=current_id;
    end if;
    insert into portal_private.taxonomy_aliases select current_id,a from unnest(aliases) a;
    insert into portal_private.taxonomy_relationships select current_id,t from unnest(themes) t;
  else
    next_status:=case
      when p_action='review' and term.status='proposed' then 'under_review'
      when p_action='approve' and term.status in ('proposed','under_review') then 'approved'
      when p_action='activate' and term.status='approved' then 'active'
      when p_action='retire' and term.status<>'retired' then 'retired'
      when p_action='reactivate' and term.status='retired' then 'approved'
      when p_action='merge' and term.kind='keyword' and term.status<>'retired' then 'retired'
    end;
    if next_status is null then raise exception 'invalid_taxonomy_transition';end if;
    if p_action='merge' then
      replacement:=p_data->>'replacement';
      if replacement is null or replacement=current_id or not exists(select from portal_private.taxonomy_terms where id=replacement and kind='keyword' and exists(select from portal_private.taxonomy_active_versions v where v.term_id=id))
      then raise exception 'invalid_replacement';end if;
    end if;
    if next_status='active' and term.kind='keyword' and not exists(select from portal_private.taxonomy_relationships r join portal_private.taxonomy_active_versions t on t.term_id=r.theme_id where r.keyword_id=current_id)
    then raise exception 'active_theme_required';end if;
    update portal_private.taxonomy_terms set status=next_status,replaced_by=replacement,revision=revision+1,updated_at=now(),modified_by=actor,
      first_activated_at=case when next_status='active' then coalesce(first_activated_at,now()) else first_activated_at end,
      approved_at=case when next_status='approved' then now() else approved_at end,
      approved_by=case when next_status='approved' then actor else approved_by end
    where id=current_id;
    if next_status='retired' then
      delete from portal_private.taxonomy_active_versions where term_id=current_id;
    elsif next_status='active' then
      select * into term from portal_private.taxonomy_terms where id=current_id;
      insert into portal_private.taxonomy_active_versions(term_id,snapshot,activated_by)
      values(current_id,portal_private.taxonomy_public_record(term),actor)
      on conflict(term_id) do update set snapshot=excluded.snapshot,activated_at=now(),activated_by=actor;
    end if;
  end if;
  select * into term from portal_private.taxonomy_terms where id=current_id;
  insert into portal_private.taxonomy_revisions values(current_id,term.revision,portal_private.taxonomy_record(term),now(),actor);
  return portal_private.taxonomy_record(term);
end $$;

revoke all on function public.taxonomy_owner(text,jsonb),public.taxonomy_snapshot(),public.taxonomy_active(),public.taxonomy_resolve(text,text),public.taxonomy_suggest(text,text,text) from public,anon,authenticated;
grant execute on function public.taxonomy_owner(text,jsonb) to authenticated;
grant execute on function public.taxonomy_snapshot(),public.taxonomy_active(),public.taxonomy_resolve(text,text),public.taxonomy_suggest(text,text,text) to anon,authenticated;
commit;
