begin;
-- Resolve only the signed-in person's existing, currently usable OFF AIR memberships.
-- This does not create memberships, accept terms or expose registrant data.
create function public.portal_partner_access() returns jsonb
language plpgsql security definer set search_path='' as $$
declare target record; answer jsonb:='[]'::jsonb;
begin
 if auth.uid() is null then raise exception using errcode='42501',message='sponsor_access_required';end if;
 for target in select m.sponsor_id,s.name from portal_private.memberships m
 join portal_private.sponsors s on s.id=m.sponsor_id where m.user_id=auth.uid() and m.active order by s.name
 loop
  begin
   perform portal_private.require_sponsor('off-air',target.sponsor_id);
   answer:=answer||jsonb_build_array(jsonb_build_object('sponsorId',target.sponsor_id,'company',target.name));
  exception when insufficient_privilege then
   -- Revoked, expired, banned or stale sessions never resolve an event.
   null;
  end;
 end loop;
 return answer;
end $$;
revoke all on function public.portal_partner_access() from public,anon;
grant execute on function public.portal_partner_access() to authenticated;
commit;
