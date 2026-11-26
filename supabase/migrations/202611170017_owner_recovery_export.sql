begin;
create function public.portal_owner_recovery_export() returns jsonb
language plpgsql security definer set search_path='' as $$
declare actor uuid;table_name text;content jsonb:='{}'::jsonb;records jsonb;
begin
 actor:=portal_private.require_owner();
 -- Only portal business records. Never export password hashes, MFA factors, sessions, tokens or bridge/job keys.
 foreach table_name in array array['events','owners','sponsors','memberships','event_access','terms_acceptance','report_versions','report_current','introduction_requests','collateral','audit','registration_links','invitation_requests'] loop
  execute format('select coalesce(jsonb_agg(to_jsonb(t)),''[]''::jsonb) from portal_private.%I t',table_name) into records;
  content:=content||jsonb_build_object(table_name,records);
 end loop;
 insert into portal_private.audit(actor,event_id,action) values(actor,'off-air','owner_recovery_export');
 return jsonb_build_object('format','media-collective-portal-recovery','version',1,'exportedAt',now(),'migration','202611170017',
 'tables',content,'identityMap',(select coalesce(jsonb_agg(jsonb_build_object('id',a.id,'email',a.email)),'[]') from auth.users a where exists(select 1 from portal_private.owners o where o.user_id=a.id) or exists(select 1 from portal_private.memberships m where m.user_id=a.id)),
 'limitations',jsonb_build_array('Portal recovery export, not a complete PostgreSQL or Auth backup.','Passwords, authenticators, session tokens, provider secrets and bridge keys are excluded.','Recover accounts and reconnect provider credentials separately after a total project loss.'));
end $$;
revoke all on function public.portal_owner_recovery_export() from public,anon,authenticated;
grant execute on function public.portal_owner_recovery_export() to authenticated;
commit;
