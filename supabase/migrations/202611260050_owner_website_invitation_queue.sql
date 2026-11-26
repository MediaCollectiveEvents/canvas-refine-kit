begin;

alter table portal_private.website_invitation_requests
  add column status text not null default 'Requested'
    check (status in ('Requested', 'Reviewed', 'Invited', 'Declined')),
  add column decision_version integer not null default 0,
  add column decided_by uuid references auth.users(id),
  add column decided_at timestamptz;

create or replace function public.portal_owner_invitations()
returns jsonb language plpgsql security definer set search_path = '' as $$
begin
  perform portal_private.require_owner();

  return jsonb_build_object(
    'configured', exists(
      select 1 from portal_private.invitation_bridge where event_id = 'off-air' and active
    ),
    'rows', coalesce((
      select jsonb_agg(jsonb_build_object(
        'sourceRef', source_ref, 'fullName', full_name, 'company', company, 'email', email,
        'requestedAt', requested_at, 'status', status
      ) order by requested_at desc, source_ref)
      from portal_private.invitation_requests
      where event_id = 'off-air'
    ), '[]'::jsonb),
    'websiteRows', coalesce((
      select jsonb_agg(jsonb_build_object(
        'sourceRef', request.source_ref, 'fullName', request.full_name,
        'company', request.company, 'email', request.email, 'eventLabel', request.event_label,
        'requestedAt', request.processing_consent_at, 'status', request.status,
        'decisionVersion', request.decision_version
      ) order by request.processing_consent_at desc, request.source_ref)
      from portal_private.website_invitation_requests request
      where not exists (
        select 1 from portal_private.invitation_requests legacy
        where legacy.event_id = 'off-air' and legacy.source_ref = request.source_ref
      )
    ), '[]'::jsonb)
  );
end;
$$;

create function public.portal_owner_website_invitation_status(
  p_ref text, p_status text, p_expected_version integer
)
returns jsonb language plpgsql security definer set search_path = '' as $$
declare
  owner_id uuid;
begin
  owner_id := portal_private.require_owner();
  if p_ref is null or p_ref !~ '^[a-f0-9]{64}$'
    or p_status is null or p_status not in ('Requested', 'Reviewed', 'Invited', 'Declined')
    or p_expected_version is null or p_expected_version < 0 then
    raise exception 'invalid_invitation_status';
  end if;

  update portal_private.website_invitation_requests request
  set status = p_status, decision_version = decision_version + 1,
      decided_by = owner_id, decided_at = now()
  where request.source_ref = p_ref and request.decision_version = p_expected_version
    and not exists (
      select 1 from portal_private.invitation_requests legacy
      where legacy.event_id = 'off-air' and legacy.source_ref = request.source_ref
    );
  if not found then raise exception 'stale_website_invitation'; end if;

  return public.portal_owner_invitations();
end;
$$;

revoke all on function public.portal_owner_website_invitation_status(text, text, integer) from public, anon, authenticated;
grant execute on function public.portal_owner_website_invitation_status(text, text, integer) to authenticated;

commit;
