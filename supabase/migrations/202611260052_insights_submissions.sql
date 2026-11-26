begin;
create table portal_private.insights_submissions(
 id uuid primary key default gen_random_uuid(),
 speaker_id uuid references portal_private.speaker_profiles(id),
 draft jsonb not null, revision integer not null default 0,
 status text not null default 'draft' check(status in ('draft','pending','changes_requested','approved')),
 feedback text not null default '', token_hash text unique, expires_at timestamptz,
 consented_at timestamptz, updated_at timestamptz not null default now()
);
alter table portal_private.insights_submissions enable row level security;
revoke all on portal_private.insights_submissions from public,anon,authenticated;
create function portal_private.insights_row(s portal_private.insights_submissions) returns jsonb language sql stable set search_path='' as $$
 select jsonb_build_object('id',s.id,'draft',s.draft,'revision',s.revision,'status',s.status,'feedback',s.feedback);
$$;
create function portal_private.insights_validate(d jsonb,submit boolean) returns jsonb language plpgsql set search_path='' as $$
declare p jsonb; im jsonb; k text;
begin
 if jsonb_typeof(d) is distinct from 'object' or octet_length(d::text)>8000000 then raise exception 'invalid_draft';end if;
 p:=d->'profile';
 if jsonb_typeof(p) is distinct from 'object' or octet_length(p::text)>400000 then raise exception 'invalid_profile';end if;
 foreach k in array array['name','company','jobTitle','companyUrl','linkedinUrl','bio','headshot'] loop
 if jsonb_typeof(p->k) is distinct from 'string' then raise exception 'invalid_profile';end if;
 end loop;
 if coalesce(p->>'headshot','')<>'' and p->>'headshot' !~ '^data:image/jpeg;base64,[A-Za-z0-9+/=]+$' then raise exception 'invalid_headshot';end if;
 foreach k in array array['title','standfirst','body','category','series','keywords','summary','logo'] loop
 if jsonb_typeof(d->k) is distinct from 'string' then raise exception 'invalid_draft';end if;
 end loop;
 if length(d->>'title')>250 or length(d->>'standfirst')>1000 or length(d->>'body')>60000 or length(d->>'summary')>10000 or length(d->>'series')>200 or length(d->>'keywords')>1000 or length(d->>'logo')>1500000 then raise exception 'invalid_length';end if;
 if d->>'category' not in ('Industry Analysis','Perspectives','Event Insights','Research & Intelligence','Community Stories') then raise exception 'invalid_category';end if;
 if d->>'logo'<>'' and d->>'logo' !~ '^data:image/png;base64,[A-Za-z0-9+/=]+$' then raise exception 'invalid_logo';end if;
 if jsonb_typeof(d->'images') is distinct from 'array' or jsonb_typeof(d->'selected') is distinct from 'array' or jsonb_typeof(d->'quick') is distinct from 'boolean' or jsonb_typeof(d->'permission') is distinct from 'boolean' then raise exception 'invalid_draft';end if;
 if jsonb_array_length(d->'images')>8 or jsonb_array_length(d->'selected')>30 then raise exception 'invalid_draft';end if;
 for im in select value from jsonb_array_elements(d->'images') loop
 if coalesce(im->>'src','') !~ '^data:image/jpeg;base64,[A-Za-z0-9+/=]+$' or length(im->>'src')>2000000 or coalesce(im->>'placement','') not in ('cover','inline','end') or length(coalesce(im->>'caption',''))>1000 or length(coalesce(im->>'credit',''))>500 or length(coalesce(im->>'alt',''))>1000 then raise exception 'invalid_image';end if;
 if submit and (im->'permission' is distinct from 'true'::jsonb or trim(coalesce(im->>'alt',''))='') then raise exception 'image_permission_or_alt_required';end if;
 end loop;
 if submit then
 if d->'permission' is distinct from 'true'::jsonb or trim(d->>'title')='' or trim(d->>'standfirst')='' or trim(d->>'body')='' or (d->'quick'='true'::jsonb and trim(d->>'summary')='') then raise exception 'incomplete_submission';end if;
 d:=jsonb_set(d,'{profile}',portal_private.validate_speaker(p));
 end if;
 return d;
end $$;
create function public.insights_contributor(p_action text,p_token text,p_data jsonb default '{}'::jsonb) returns jsonb language plpgsql security definer set search_path='' as $$
declare s portal_private.insights_submissions; d jsonb;
begin
 if p_token is null or p_token !~ '^[a-f0-9]{64}$' then raise exception 'invalid_link';end if;
 select * into s from portal_private.insights_submissions where token_hash=encode(sha256(convert_to(p_token,'UTF8')),'hex') and expires_at>now() for update;
 if not found then raise exception 'invalid_link';end if;
 if p_action='get' then return portal_private.insights_row(s);end if;
 if p_action not in ('save','submit') or s.status not in ('draft','changes_requested') or s.revision is distinct from (p_data->>'revision')::integer then raise exception 'stale_or_locked';end if;
 d:=portal_private.insights_validate(p_data->'draft',p_action='submit');
 update portal_private.insights_submissions set draft=d,revision=revision+1,status=case when p_action='submit' then 'pending' else 'draft' end,consented_at=case when p_action='submit' then now() else null end,updated_at=now() where id=s.id returning * into s;
 return portal_private.insights_row(s);
end $$;
create function public.insights_owner(p_action text,p_data jsonb default '{}'::jsonb) returns jsonb language plpgsql security definer set search_path='' as $$
declare actor uuid;s portal_private.insights_submissions;sp portal_private.speaker_profiles;sid uuid;p jsonb;d jsonb;token text;
begin
 actor:=portal_private.require_owner();
 if p_action='list' then return jsonb_build_object('rows',coalesce((select jsonb_agg(portal_private.insights_row(r) order by updated_at desc) from portal_private.insights_submissions r),'[]'::jsonb));end if;
 if p_action='invite' then
 sid:=nullif(p_data->>'speakerId','')::uuid;
 p:='{"name":"","company":"","jobTitle":"","companyUrl":"","linkedinUrl":"","bio":"","headshot":""}'::jsonb;
 if sid is not null then select * into sp from portal_private.speaker_profiles where id=sid;if not found then raise exception 'speaker_not_found';end if;p:=p||coalesce(sp.published,sp.draft);end if;
 d:=jsonb_build_object('profile',p,'logo','','title','','standfirst','','body','','category','Industry Analysis','series','','selected','[]'::jsonb,'keywords','','quick',false,'summary','','images','[]'::jsonb,'permission',false);
 token:=replace(gen_random_uuid()::text,'-','')||replace(gen_random_uuid()::text,'-','');
 insert into portal_private.insights_submissions(speaker_id,draft,token_hash,expires_at) values(sid,d,encode(sha256(convert_to(token,'UTF8')),'hex'),now()+interval '30 days');
 else
 select * into s from portal_private.insights_submissions where id=(p_data->>'id')::uuid for update;
 if not found or s.revision is distinct from (p_data->>'revision')::integer then raise exception 'stale_version';end if;
 if p_action='approve' and s.status='pending' and s.consented_at is not null then
 perform portal_private.insights_validate(s.draft,true);
 update portal_private.insights_submissions set status='approved',feedback='',revision=revision+1,updated_at=now() where id=s.id;
 elsif p_action='return' and s.status='pending' and length(trim(coalesce(p_data->>'feedback',''))) between 1 and 2000 then
 update portal_private.insights_submissions set status='changes_requested',feedback=trim(p_data->>'feedback'),revision=revision+1,updated_at=now() where id=s.id;
 elsif p_action='revoke' then update portal_private.insights_submissions set token_hash=null,expires_at=null,revision=revision+1 where id=s.id;
 elsif p_action='renew' then
 token:=replace(gen_random_uuid()::text,'-','')||replace(gen_random_uuid()::text,'-','');
 update portal_private.insights_submissions set token_hash=encode(sha256(convert_to(token,'UTF8')),'hex'),expires_at=now()+interval '30 days',revision=revision+1 where id=s.id;
 else raise exception 'invalid_action';end if;
 end if;
 insert into portal_private.audit(actor,action) values(actor,'insights_'||p_action);
 return jsonb_build_object('saved',true,'token',token);
end $$;
revoke all on function portal_private.insights_validate(jsonb,boolean),portal_private.insights_row(portal_private.insights_submissions) from public,anon,authenticated;
revoke all on function public.insights_contributor(text,text,jsonb),public.insights_owner(text,jsonb) from public,anon,authenticated;
grant execute on function public.insights_contributor(text,text,jsonb) to anon,authenticated;
grant execute on function public.insights_owner(text,jsonb) to authenticated;
commit;
