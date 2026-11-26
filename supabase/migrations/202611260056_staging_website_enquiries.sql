begin;

create table portal_private.staging_website_enquiries (
  id uuid primary key default gen_random_uuid(),
  kind text not null check (kind in ('contact', 'commercial')),
  full_name text not null,
  email text not null,
  message text,
  company text,
  event_label text,
  engagement text,
  received_at timestamptz not null default now(),
  fingerprint text not null
);
alter table portal_private.staging_website_enquiries enable row level security;
revoke all on portal_private.staging_website_enquiries from public, anon, authenticated;
create index on portal_private.staging_website_enquiries (fingerprint, received_at);

create function public.portal_record_staging_website_enquiry(
  p_kind text, p_name text, p_email text, p_message text, p_company text, p_event text, p_engagement text
) returns boolean language plpgsql security definer set search_path = '' as $$
declare
  fingerprint_value text;
begin
  if p_kind is null or p_kind not in ('contact', 'commercial')
    or coalesce(length(btrim(p_name)), 0) not between 1 and 100
    or coalesce(length(p_email), 0) not between 1 and 255
    or p_email !~ '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$'
    or (p_kind = 'contact' and (
      coalesce(length(btrim(p_message)), 0) not between 1 and 5000
      or p_company is not null or p_event is not null or p_engagement is not null))
    or (p_kind = 'commercial' and (
      p_message is not null or coalesce(length(btrim(p_company)), 0) not between 1 and 100
      or coalesce(length(btrim(p_event)), 0) not between 1 and 1000
      or coalesce(length(btrim(p_engagement)), 0) not between 1 and 500))
  then raise exception 'invalid_website_enquiry';
  end if;

  fingerprint_value := encode(sha256(convert_to(
    jsonb_build_array(p_kind, p_name, p_email, p_message, p_company, p_event, p_engagement)::text, 'UTF8'
  )), 'hex');
  perform pg_advisory_xact_lock(hashtextextended(fingerprint_value, 0));
  if not exists (
    select 1 from portal_private.staging_website_enquiries e
    where e.fingerprint = fingerprint_value and e.received_at >= now() - interval '10 minutes'
  ) then
    insert into portal_private.staging_website_enquiries
      (kind, full_name, email, message, company, event_label, engagement, fingerprint)
    values (p_kind, p_name, p_email, p_message, p_company, p_event, p_engagement, fingerprint_value);
  end if;
  return true;
end;
$$;

create function public.portal_owner_staging_website_enquiries()
returns jsonb language plpgsql security definer set search_path = '' as $$
begin
  perform portal_private.require_owner();
  return coalesce((
    select jsonb_agg(jsonb_build_object(
      'id', id, 'kind', kind, 'fullName', full_name, 'email', email, 'message', message,
      'company', company, 'eventLabel', event_label, 'engagement', engagement, 'receivedAt', received_at
    ) order by received_at desc, id)
    from (select * from portal_private.staging_website_enquiries order by received_at desc, id limit 100) recent
  ), '[]'::jsonb);
end;
$$;

revoke all on function public.portal_record_staging_website_enquiry(text, text, text, text, text, text, text) from public, anon, authenticated;
grant execute on function public.portal_record_staging_website_enquiry(text, text, text, text, text, text, text) to service_role;
revoke all on function public.portal_owner_staging_website_enquiries() from public, anon, authenticated;
grant execute on function public.portal_owner_staging_website_enquiries() to authenticated;

commit;
