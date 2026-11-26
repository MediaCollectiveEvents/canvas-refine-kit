begin;
create or replace function portal_private.validate_speaker(p jsonb) returns jsonb language plpgsql set search_path='' as $$
declare result jsonb;h text;b bytea;k text;v text;
begin
 if p is null or jsonb_typeof(p)<>'object' or octet_length(p::text)>400000 then raise exception 'invalid_profile';end if;
 foreach k in array array['name','company','jobTitle','bio'] loop
 v:=trim(coalesce(p->>k,''));if v='' or length(v)>(case when k='bio' then 4000 else 200 end) then raise exception 'invalid_profile';end if;
 end loop;
 if cardinality(regexp_split_to_array(trim(p->>'bio'),'\s+'))>70 then raise exception 'bio_word_limit';end if;
 foreach k in array array['companyUrl','linkedinUrl'] loop
 v:=trim(coalesce(p->>k,''));
 if v ~* '^https://' then v:='https://'||substr(v,9);end if;
 -- An HTTPS authority, with no credentials, controls or backslashes. Paths may contain encoded international characters.
 if length(v)>1000 or (v<>'' and (v !~ '^https://[^/?#[:space:]<>@]+([/?#][^[:space:]<>]*)?$' or position(chr(92) in v)>0)) then
  if k='companyUrl' then raise exception 'invalid_company_url';else raise exception 'invalid_linkedin_url';end if;
 end if;
 p:=jsonb_set(p,array[k],to_jsonb(v));
 end loop;
 if coalesce(p->>'linkedinUrl','')<>'' and p->>'linkedinUrl' !~ '^https://(www\.)?linkedin\.com/in/[A-Za-z0-9%_-]+/?$' then raise exception 'invalid_linkedin';end if;
 h:=p->>'headshot';if h is null or h !~ '^data:image/jpeg;base64,[A-Za-z0-9+/=]+$' then raise exception 'invalid_headshot';end if;
 b:=decode(substr(h,24),'base64');if octet_length(b)>280000 or octet_length(b)<4 or substring(b from 1 for 3)<>decode('ffd8ff','hex') or substring(b from octet_length(b)-1 for 2)<>decode('ffd9','hex') then raise exception 'invalid_headshot';end if;
 result:=jsonb_build_object('name',trim(p->>'name'),'company',trim(p->>'company'),'jobTitle',trim(p->>'jobTitle'),'bio',trim(p->>'bio'),'companyUrl',coalesce(p->>'companyUrl',''),'linkedinUrl',coalesce(p->>'linkedinUrl',''),'headshot',h);
 return result;
end $$;
revoke all on function portal_private.validate_speaker(jsonb) from public,anon,authenticated;
commit;
