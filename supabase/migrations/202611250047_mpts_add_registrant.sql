begin;
create function public.portal_mpts_add_registrant(p_guest jsonb) returns void
language plpgsql security definer set search_path='' as $$
declare
 event_key constant text:='mpts-reception-2027';
 existing jsonb;
 revision bigint;
 email_address text:=lower(trim(p_guest->>'email'));
 guest jsonb;
begin
 perform portal_private.require_owner();
 if jsonb_typeof(p_guest) is distinct from 'object' or nullif(email_address,'') is null then
  raise exception 'invalid_fields';
 end if;
 perform 1 from portal_private.events where id=event_key for update;
 select v.records,v.revision into existing,revision
 from portal_private.report_current c join portal_private.report_versions v on v.id=c.version_id
 where c.event_id=event_key and c.source_kind='enriched';
 existing:=coalesce(existing,'[]'::jsonb);
 if exists(select 1 from jsonb_array_elements(existing) r where lower(trim(r->>'email'))=email_address) then
  raise exception 'duplicate_registrant';
 end if;
 guest:=jsonb_build_object(
  'firstName',trim(p_guest->>'firstName'),'lastName',trim(p_guest->>'lastName'),'email',email_address,
  'company',coalesce(trim(p_guest->>'company'),''),'jobTitle',coalesce(trim(p_guest->>'jobTitle'),''),
  'linkedin',coalesce(trim(p_guest->>'linkedin'),''),'attendeeId','',
  'sourceRow',jsonb_array_length(existing)+2,'registeredAt',clock_timestamp()
 );
 perform public.portal_owner_publish(event_key,existing||jsonb_build_array(guest),'Manual registrant addition',coalesce(revision,0),true);
end $$;
revoke all on function public.portal_mpts_add_registrant(jsonb) from public,anon;
grant execute on function public.portal_mpts_add_registrant(jsonb) to authenticated;
commit;
