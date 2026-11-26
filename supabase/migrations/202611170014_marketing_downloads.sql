begin;
create function portal_private.can_read_marketing(p_path text) returns boolean
language plpgsql security definer set search_path='' as $$
declare sp uuid;
begin
 if p_path not in ('off-air/marketing/off-air-logo.png','off-air/marketing/off-air-email-signature.png','off-air/marketing/off-air-social-media.png') then return false;end if;
 if exists(select 1 from portal_private.owners where user_id=auth.uid() and active) then
  perform portal_private.require_owner();return true;
 end if;
 if not exists(select 1 from portal_private.terms_acceptance where user_id=auth.uid() and terms_version='off-air-2026-11-16-v2') then return false;end if;
 for sp in select sponsor_id from portal_private.memberships where user_id=auth.uid() and active loop
  begin perform portal_private.require_sponsor('off-air',sp);return true;exception when insufficient_privilege then null;end;
 end loop;
 return false;
exception when insufficient_privilege then return false;
end $$;
revoke all on function portal_private.can_read_marketing(text) from public,anon,authenticated;
grant execute on function portal_private.can_read_marketing(text) to authenticated;
create policy "OFF AIR authorised marketing reads" on storage.objects for select to authenticated
using(bucket_id='sponsor-reports-private' and portal_private.can_read_marketing(name));
commit;
