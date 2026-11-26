begin;
-- Drafts, edit-link hashes and keywords never have direct browser table access.
create table portal_private.speaker_profiles(
 id uuid primary key default gen_random_uuid(), events text[] not null,
 draft jsonb not null default '{}'::jsonb,published jsonb,
 revision integer not null default 0,status text not null default 'invited' check(status in('invited','pending','changes_requested','approved')),
 keywords text not null default '',feedback text not null default '',
 token_hash text,expires_at timestamptz,consented_at timestamptz,
 updated_at timestamptz not null default now()
);
alter table portal_private.speaker_profiles enable row level security;
revoke all on portal_private.speaker_profiles from public,anon,authenticated;
create table portal_private.speaker_revisions(
 id bigint generated always as identity primary key,speaker_id uuid not null references portal_private.speaker_profiles(id),
 revision integer not null,profile jsonb not null,consented_at timestamptz not null,created_at timestamptz not null default now(),unique(speaker_id,revision)
);
alter table portal_private.speaker_revisions enable row level security;
revoke all on portal_private.speaker_revisions from public,anon,authenticated;
create table portal_private.speaker_talking_points(
 id uuid primary key default gen_random_uuid(),speaker_id uuid not null references portal_private.speaker_profiles(id),
 note_date date not null,body text not null check(length(trim(body)) between 1 and 6000),
 actor uuid not null references auth.users(id),created_at timestamptz not null default now()
);
alter table portal_private.speaker_talking_points enable row level security;
revoke all on portal_private.speaker_talking_points from public,anon,authenticated;
create function portal_private.validate_speaker(p jsonb) returns jsonb language plpgsql set search_path='' as $$
declare result jsonb;h text;b bytea;k text;v text;
begin
 if p is null or jsonb_typeof(p)<>'object' or octet_length(p::text)>400000 then raise exception 'invalid_profile';end if;
 foreach k in array array['name','company','jobTitle','bio'] loop
 v:=trim(coalesce(p->>k,''));if v='' or length(v)>(case when k='bio' then 4000 else 200 end) then raise exception 'invalid_profile';end if;
 end loop;
 if cardinality(regexp_split_to_array(trim(p->>'bio'),'\s+'))>70 then raise exception 'bio_word_limit';end if;
 foreach k in array array['companyUrl','linkedinUrl'] loop
 v:=coalesce(p->>k,'');if length(v)>1000 or (v<>'' and (v !~ '^https://[A-Za-z0-9]([A-Za-z0-9.-]*[A-Za-z0-9])?([/:?#][^[:space:]<>]*)?$' or v ~ '^https://[^/]*@')) then raise exception 'invalid_url';end if;
 end loop;
 if coalesce(p->>'linkedinUrl','')<>'' and p->>'linkedinUrl' !~ '^https://(www\.)?linkedin\.com/in/[A-Za-z0-9%_-]+/?$' then raise exception 'invalid_linkedin';end if;
 h:=p->>'headshot';if h is null or h !~ '^data:image/jpeg;base64,[A-Za-z0-9+/=]+$' then raise exception 'invalid_headshot';end if;
 b:=decode(substr(h,24),'base64');if octet_length(b)>280000 or octet_length(b)<4 or substring(b from 1 for 3)<>decode('ffd8ff','hex') or substring(b from octet_length(b)-1 for 2)<>decode('ffd9','hex') then raise exception 'invalid_headshot';end if;
 result:=jsonb_build_object('name',trim(p->>'name'),'company',trim(p->>'company'),'jobTitle',trim(p->>'jobTitle'),'bio',trim(p->>'bio'),'companyUrl',coalesce(p->>'companyUrl',''),'linkedinUrl',coalesce(p->>'linkedinUrl',''),'headshot',h);
 return result;
end $$;
create function public.speaker_edit_get(p_token text) returns jsonb language plpgsql security definer set search_path='' as $$
declare s portal_private.speaker_profiles;
begin
 if p_token is null or p_token !~ '^[a-f0-9]{64}$' then raise exception 'invalid_link';end if;
 select * into s from portal_private.speaker_profiles where token_hash=encode(sha256(convert_to(p_token,'UTF8')),'hex') and expires_at>now();
 if not found then raise exception 'invalid_link';end if;
 return jsonb_build_object('profile',s.draft,'revision',s.revision,'status',s.status,'feedback',s.feedback,'events',s.events);
end $$;
create function public.speaker_edit_submit(p_token text,p_profile jsonb,p_revision integer,p_consent boolean) returns jsonb language plpgsql security definer set search_path='' as $$
declare s portal_private.speaker_profiles;clean jsonb;
begin
 if p_consent is distinct from true or p_token is null or p_token !~ '^[a-f0-9]{64}$' then raise exception 'invalid_submission';end if;
 select * into s from portal_private.speaker_profiles where token_hash=encode(sha256(convert_to(p_token,'UTF8')),'hex') and expires_at>now() for update;
 if not found then raise exception 'invalid_link';end if;
 if p_revision is distinct from s.revision then raise exception 'stale_version';end if;
 if s.updated_at>now()-interval '10 seconds' and s.revision>0 then raise exception 'please_wait';end if;
 clean:=portal_private.validate_speaker(p_profile);
 update portal_private.speaker_profiles set draft=clean,revision=revision+1,status='pending',feedback='',consented_at=now(),updated_at=now() where id=s.id;
 insert into portal_private.speaker_revisions(speaker_id,revision,profile,consented_at) values(s.id,s.revision+1,clean,now());
 return public.speaker_edit_get(p_token);
end $$;
-- Explicit projection: publication never returns draft, token, feedback, or keywords.
create function public.speaker_public(p_event text default null,p_id uuid default null) returns jsonb language sql stable security definer set search_path='' as $$
 select coalesce(jsonb_agg(jsonb_build_object('id',id,'events',events,'profile',published) order by published->>'name'),'[]'::jsonb) from portal_private.speaker_profiles where published is not null and (p_event is null or p_event=any(events)) and (p_id is null or id=p_id);
$$;
create function public.speaker_owner(p_action text,p_id uuid default null,p_revision integer default null,p_events text[] default null,p_keywords text default '',p_feedback text default '',p_profile jsonb default null,p_consent boolean default false,p_note_date date default null) returns jsonb language plpgsql security definer set search_path='' as $$
declare actor uuid;s portal_private.speaker_profiles;token text;outcome jsonb;
begin
 actor:=portal_private.require_owner();
 if p_action='list' then
 return coalesce((select jsonb_agg(jsonb_build_object('id',id,'events',events,'profile',draft,'published',published,'revision',revision,'status',status,'keywords',keywords,'feedback',feedback,'expiresAt',expires_at,'talkingPoints',coalesce((select jsonb_agg(jsonb_build_object('id',n.id,'date',n.note_date,'body',n.body,'createdAt',n.created_at) order by n.note_date desc,n.created_at desc) from portal_private.speaker_talking_points n where n.speaker_id=sp.id),'[]'::jsonb)) order by updated_at desc) from portal_private.speaker_profiles sp),'[]'::jsonb);
 end if;
 if p_action='create' then
 if p_events is null or cardinality(p_events)<1 or cardinality(p_events)>30 or exists(select 1 from unnest(p_events) e where e !~ '^[0-9]{1,10}$') then raise exception 'invalid_events';end if;
 insert into portal_private.speaker_profiles(events) values(p_events) returning * into s;
 else
 select * into s from portal_private.speaker_profiles where id=p_id for update;
 if not found then raise exception 'speaker_not_found';end if;
 if s.revision is distinct from p_revision then raise exception 'stale_version';end if;
 end if;
 if p_action in ('create','link') then
 token:=replace(gen_random_uuid()::text,'-','')||replace(gen_random_uuid()::text,'-','');
 update portal_private.speaker_profiles set token_hash=encode(sha256(convert_to(token,'UTF8')),'hex'),expires_at=now()+interval '30 days' where id=s.id;
 outcome:=jsonb_build_object('token',token,'id',s.id);
 elsif p_action='save' then
 if p_consent is distinct from true then raise exception 'permission_required';end if;
 p_profile:=portal_private.validate_speaker(p_profile);
 update portal_private.speaker_profiles set draft=p_profile,status='pending',revision=revision+1,consented_at=now(),updated_at=now() where id=s.id;
 insert into portal_private.speaker_revisions(speaker_id,revision,profile,consented_at) values(s.id,s.revision+1,p_profile,now());
 elsif p_action='note' then
 if p_note_date is null or length(trim(p_feedback)) not between 1 and 6000 then raise exception 'invalid_talking_points';end if;
 insert into portal_private.speaker_talking_points(speaker_id,note_date,body,actor) values(s.id,p_note_date,trim(p_feedback),actor);
 elsif p_action='approve' then
 if s.status<>'pending' or s.consented_at is null then raise exception 'submission_required';end if;
 perform portal_private.validate_speaker(s.draft);
 update portal_private.speaker_profiles set published=draft,status='approved',feedback='',updated_at=now(),revision=revision+1 where id=s.id;
 elsif p_action='reject' then
 if length(trim(p_feedback)) not between 1 and 2000 then raise exception 'feedback_required';end if;
 update portal_private.speaker_profiles set status='changes_requested',feedback=trim(p_feedback),revision=revision+1 where id=s.id;
 elsif p_action='unpublish' then
 update portal_private.speaker_profiles set published=null,revision=revision+1 where id=s.id;
 elsif p_action='revoke' then
 update portal_private.speaker_profiles set token_hash=null,expires_at=null,revision=revision+1 where id=s.id;
 elsif p_action='details' then
 if p_events is null or cardinality(p_events)<1 or cardinality(p_events)>30 or exists(select 1 from unnest(p_events) e where e !~ '^[0-9]{1,10}$') or length(p_keywords)>2000 then raise exception 'invalid_details';end if;
 update portal_private.speaker_profiles set events=p_events,keywords=p_keywords,revision=revision+1 where id=s.id;
 else raise exception 'invalid_action';end if;
 insert into portal_private.audit(actor,action) values(actor,'speaker_'||p_action);
 return coalesce(outcome,jsonb_build_object('saved',true));
end $$;
revoke all on function portal_private.validate_speaker(jsonb) from public,anon,authenticated;
revoke all on function public.speaker_edit_get(text),public.speaker_edit_submit(text,jsonb,integer,boolean),public.speaker_public(text,uuid),public.speaker_owner(text,uuid,integer,text[],text,text,jsonb,boolean,date) from public,anon,authenticated;
grant execute on function public.speaker_edit_get(text),public.speaker_edit_submit(text,jsonb,integer,boolean),public.speaker_public(text,uuid) to anon,authenticated;
grant execute on function public.speaker_owner(text,uuid,integer,text[],text,text,jsonb,boolean,date) to authenticated;
commit;
