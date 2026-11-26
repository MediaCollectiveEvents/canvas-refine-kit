begin;
alter table portal_private.invitation_requests drop constraint invitation_requests_status_check;
alter table portal_private.invitation_requests add constraint invitation_requests_status_check check(status in ('Requested','Reviewed','Invited','Declined','Added to Eventbrite'));
alter table portal_private.invitation_requests add column status_before_eventbrite text;
create function public.portal_owner_invitation_status(p_ref text,p_added boolean,p_expected text) returns jsonb language plpgsql security definer set search_path='' as $$
declare actor uuid;current_status text;
begin
 actor:=portal_private.require_owner();
 if p_ref is null or p_ref !~ '^[a-f0-9]{64}$' or p_added is null or p_expected is null then raise exception 'invalid_invitation_status';end if;
 select status into current_status from portal_private.invitation_requests where event_id='off-air' and source_ref=p_ref for update;
 if not found then raise exception 'invitation_not_found';end if;
 if current_status<>p_expected then raise exception 'stale_version';end if;
 if p_added and current_status<>'Added to Eventbrite' then
 update portal_private.invitation_requests set status_before_eventbrite=status,status='Added to Eventbrite' where event_id='off-air' and source_ref=p_ref;
 elsif not p_added and current_status='Added to Eventbrite' then
 update portal_private.invitation_requests set status=coalesce(status_before_eventbrite,'Requested'),status_before_eventbrite=null where event_id='off-air' and source_ref=p_ref;
 end if;
 insert into portal_private.audit(actor,event_id,action) values(actor,'off-air',case when p_added then 'invitation_marked_added_eventbrite' else 'invitation_eventbrite_status_undone' end);
 return public.portal_owner_invitations();
end $$;
revoke all on function public.portal_owner_invitation_status(text,boolean,text) from public,anon,authenticated;
grant execute on function public.portal_owner_invitation_status(text,boolean,text) to authenticated;
commit;
