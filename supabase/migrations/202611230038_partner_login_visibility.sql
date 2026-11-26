-- Owner-only visibility of successful authentication and current event terms.
-- No authentication changes, new tracking, emails, or partner permissions.
begin;
create or replace function public.portal_owner_sponsors() returns jsonb
language plpgsql security definer set search_path='' as $$
begin
 perform portal_private.require_owner();
 return coalesce((
 with first_logins as (
  select l.payload->>'actor_id' as user_id,min(l.created_at) as signed_in_at
  from auth.audit_log_entries l
  where l.payload->>'action'='login'
   and exists(select 1 from portal_private.memberships m where m.user_id::text=l.payload->>'actor_id')
  group by l.payload->>'actor_id'
 )
 select jsonb_agg(jsonb_build_object(
  'sponsorId',s.id,'company',s.name,'email',a.email,'userId',a.id,
  'confirmed',a.email_confirmed_at is not null,'deletedAt',m.deleted_at,
  'active',m.active and s.active and ea.revoked_at is null and least(coalesce(m.expires_at,ea.expires_at),ea.expires_at)>now(),
  'expiresAt',least(coalesce(m.expires_at,ea.expires_at),ea.expires_at),'canViewEmail',ea.can_view_email,
  'firstSignInAt',f.signed_in_at,'lastSignInAt',a.last_sign_in_at,
  'termsAcceptedAt',t.accepted_at,'termsVersion','off-air-2026-11-16-v2'
 ) order by lower(s.name),lower(a.email))
 from portal_private.memberships m join auth.users a on a.id=m.user_id
 join portal_private.sponsors s on s.id=m.sponsor_id
 join portal_private.event_access ea on ea.sponsor_id=s.id and ea.event_id='off-air'
 left join first_logins f on f.user_id=a.id::text
 left join portal_private.terms_acceptance t on t.user_id=a.id and t.terms_version='off-air-2026-11-16-v2'
 ),'[]');
end $$;
revoke all on function public.portal_owner_sponsors() from public,anon;
grant execute on function public.portal_owner_sponsors() to authenticated;
commit;
