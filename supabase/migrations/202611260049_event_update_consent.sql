begin;

create table portal_private.event_update_consents (
  request_id uuid primary key,
  email text not null,
  consent_version text not null,
  consent_text text not null,
  received_at timestamptz not null default now(),
  status text not null default 'pending' check (status in ('pending', 'accepted', 'review_required')),
  provider_status integer,
  processed_at timestamptz
);

alter table portal_private.event_update_consents enable row level security;
revoke all on portal_private.event_update_consents from public, anon, authenticated;

create function public.portal_begin_event_update_consent(p_request_id uuid, p_email text, p_version text)
returns text language plpgsql security definer set search_path = '' as $$
begin
  if p_request_id is null or p_email is null or length(p_email) > 255
    or p_email !~ '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$'
    or p_version is distinct from 'event-updates-v1' then
    raise exception 'invalid event update consent';
  end if;

  insert into portal_private.event_update_consents (request_id, email, consent_version, consent_text)
  values (p_request_id, lower(p_email), p_version, 'I agree to receive emails about new Media Collective events and to the processing of my details for this purpose. I can withdraw consent at any time.')
  on conflict (request_id) do nothing;

  if found then return 'started'; end if;
  if exists (
    select 1 from portal_private.event_update_consents
    where request_id = p_request_id and email = lower(p_email)
      and consent_version = p_version and status = 'accepted'
  ) then return 'accepted'; end if;

  return 'review_required';
end;
$$;

create function public.portal_finish_event_update_consent(p_request_id uuid, p_provider_status integer)
returns boolean language plpgsql security definer set search_path = '' as $$
begin
  update portal_private.event_update_consents
  set status = case when p_provider_status = 200 then 'accepted' else 'review_required' end,
      provider_status = p_provider_status, processed_at = now()
  where request_id = p_request_id and status = 'pending';
  return found;
end;
$$;

revoke all on function public.portal_begin_event_update_consent(uuid, text, text) from public, anon, authenticated;
revoke all on function public.portal_finish_event_update_consent(uuid, integer) from public, anon, authenticated;
grant execute on function public.portal_begin_event_update_consent(uuid, text, text) to service_role;
grant execute on function public.portal_finish_event_update_consent(uuid, integer) to service_role;

commit;
