-- Owner requested continuous opening through OFF AIR; retain bounded 72-hour window.
begin;
alter table portal_private.walk_in_settings drop constraint walk_in_settings_check;
alter table portal_private.walk_in_settings add constraint walk_in_settings_check check(closes_at>opens_at and closes_at<=opens_at+interval '72 hours');
create or replace function public.portal_owner_walk_in_settings(p_enabled boolean,p_opens timestamptz,p_closes timestamptz) returns jsonb language plpgsql security definer set search_path='' as $$
declare actor uuid;
begin
 actor:=portal_private.require_owner();
 if p_enabled is null or p_opens is null or p_closes is null or p_closes<=p_opens or p_closes>p_opens+interval '72 hours' then raise exception 'invalid_walk_in_window';end if;
 perform 1 from portal_private.events where id='off-air' for update;
 update portal_private.walk_in_settings set enabled=p_enabled,opens_at=p_opens,closes_at=p_closes,updated_at=now(),updated_by=actor where event_id='off-air';
 if not found then raise exception 'walk_in_not_configured';end if;
 insert into portal_private.audit(actor,event_id,action,details) values(actor,'off-air','walk_in_settings',jsonb_build_object('enabled',p_enabled,'opensAt',p_opens,'closesAt',p_closes));
 return public.portal_owner_walk_ins();
end $$;

commit;
