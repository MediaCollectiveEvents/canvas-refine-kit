begin;

create table portal_private.website_invitation_key (
  singleton boolean primary key default true check (singleton),
  key_hash bytea not null
);

create table portal_private.website_invitation_requests (
  source_ref text primary key check (source_ref ~ '^[a-f0-9]{64}$'),
  full_name text not null,
  company text not null,
  email text not null,
  event_label text not null,
  engagement text not null,
  processing_consent_at timestamptz not null default now()
);

alter table portal_private.website_invitation_key enable row level security;
alter table portal_private.website_invitation_requests enable row level security;
revoke all on portal_private.website_invitation_key, portal_private.website_invitation_requests from public, anon, authenticated;

create function public.portal_record_website_invitation(
  p_key text, p_source_ref text, p_name text, p_company text, p_email text,
  p_event text, p_engagement text
) returns boolean
language plpgsql security definer set search_path = '' as $$
begin
  if p_key is null or p_key !~ '^[a-f0-9]{64}$' or not exists (
    select 1 from portal_private.website_invitation_key
    where key_hash = sha256(convert_to(p_key, 'UTF8'))
  ) then
    raise exception using errcode = '42501', message = 'invitation intake authorization required';
  end if;

  if p_source_ref is null or p_source_ref !~ '^[a-f0-9]{64}$'
    or coalesce(length(btrim(p_name)), 0) not between 1 and 100
    or coalesce(length(btrim(p_company)), 0) not between 1 and 100
    or coalesce(length(p_email), 0) not between 1 and 255
    or p_email !~ '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$'
    or coalesce(length(btrim(p_event)), 0) not between 1 and 1000
    or coalesce(length(p_engagement), 0) not between 1 and 500
    or not ('Attend' = any(string_to_array(p_engagement, ', ')))
  then
    raise exception 'invalid invitation';
  end if;

  insert into portal_private.website_invitation_requests
    (source_ref, full_name, company, email, event_label, engagement)
  values (p_source_ref, p_name, p_company, p_email, p_event, p_engagement)
  on conflict (source_ref) do nothing;

  if p_event ~* '\mOFF[[:space:]]+AIR\M[^,]*2026' then
    insert into portal_private.invitation_requests
      (event_id, source_ref, full_name, company, email, event_label, engagement, requested_at)
    values ('off-air', p_source_ref, p_name, p_company, p_email, p_event, p_engagement, now())
    on conflict (event_id, source_ref) do nothing;
  end if;
  return true;
end;
$$;

revoke all on function public.portal_record_website_invitation(text, text, text, text, text, text, text) from public, anon, authenticated;
grant execute on function public.portal_record_website_invitation(text, text, text, text, text, text, text) to anon;

commit;
