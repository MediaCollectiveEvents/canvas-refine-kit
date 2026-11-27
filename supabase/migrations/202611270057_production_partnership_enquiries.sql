begin;

create table portal_private.partnership_enquiries (
  id uuid primary key default gen_random_uuid(),
  full_name text not null check (length(btrim(full_name)) between 1 and 100),
  company text not null check (length(btrim(company)) between 1 and 100),
  email text not null check (length(email) between 1 and 255 and email ~ '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$'),
  event_label text not null check (length(btrim(event_label)) between 1 and 1000),
  engagement text not null check (engagement in ('Co-host', 'Sponsor', 'Co-host, Sponsor')),
  fingerprint text not null,
  received_at timestamptz not null default now()
);
alter table portal_private.partnership_enquiries enable row level security;
revoke all on portal_private.partnership_enquiries from public, anon, authenticated;
create index on portal_private.partnership_enquiries (fingerprint, received_at);

create function public.portal_record_partnership_enquiry(
  p_name text, p_company text, p_email text, p_event text, p_engagement text
) returns uuid language plpgsql security definer set search_path = '' as $$
declare
  request_fingerprint text;
  request_id uuid;
begin
  request_fingerprint := encode(sha256(convert_to(
    jsonb_build_array(p_name, p_company, p_email, p_event, p_engagement)::text, 'UTF8'
  )), 'hex');
  perform pg_advisory_xact_lock(hashtextextended(request_fingerprint, 0));
  select id into request_id
  from portal_private.partnership_enquiries
  where fingerprint = request_fingerprint and received_at >= now() - interval '10 minutes'
  order by received_at desc
  limit 1;
  if request_id is not null then return request_id; end if;

  insert into portal_private.partnership_enquiries (full_name, company, email, event_label, engagement, fingerprint)
  values (p_name, p_company, p_email, p_event, p_engagement, request_fingerprint)
  returning id into request_id;
  return request_id;
end;
$$;

create function public.portal_owner_partnership_enquiries()
returns jsonb language plpgsql security definer set search_path = '' as $$
begin
  perform portal_private.require_owner();
  return coalesce((
    select jsonb_agg(jsonb_build_object(
      'id', id, 'fullName', full_name, 'company', company, 'email', email,
      'eventLabel', event_label, 'engagement', engagement, 'receivedAt', received_at
    ) order by received_at desc, id)
    from (select * from portal_private.partnership_enquiries order by received_at desc, id limit 100) recent
  ), '[]'::jsonb);
end;
$$;

revoke all on function public.portal_record_partnership_enquiry(text, text, text, text, text) from public, anon, authenticated;
grant execute on function public.portal_record_partnership_enquiry(text, text, text, text, text) to service_role;
revoke all on function public.portal_owner_partnership_enquiries() from public, anon, authenticated;
grant execute on function public.portal_owner_partnership_enquiries() to authenticated;

commit;
