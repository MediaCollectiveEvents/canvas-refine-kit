begin;
create function public.portal_eventbrite_sync_state() returns jsonb
language plpgsql security definer set search_path='' as $$
begin
 perform portal_private.require_owner();
 return jsonb_build_object('revision',coalesce((select v.revision from portal_private.report_current c join portal_private.report_versions v on v.id=c.version_id where c.event_id='off-air' and c.source_kind='eventbrite_raw'),0));
end $$;
revoke all on function public.portal_eventbrite_sync_state() from public,anon,authenticated;
create function public.portal_eventbrite_ingest(p_rows jsonb,p_base bigint,p_eventbrite_event text) returns jsonb
language plpgsql security definer set search_path='' as $$
declare actor uuid; prior_revision bigint; prior_rows jsonb; version uuid; revision_number bigint; r jsonb; k text;
begin
 actor:=portal_private.require_owner();
 if p_eventbrite_event is distinct from '1999093084229' or p_base is null or p_base<0 then raise exception 'invalid_event';end if;
 if jsonb_typeof(p_rows) is distinct from 'array' then raise exception 'invalid_rows';end if;
 if jsonb_array_length(p_rows)>5000 or octet_length(p_rows::text)>2097152 then raise exception 'invalid_rows';end if;
 for r in select value from jsonb_array_elements(p_rows) loop
  if jsonb_typeof(r) is distinct from 'object' then raise exception 'invalid_fields';end if;
  foreach k in array array['attendeeId','firstName','lastName','email','company','jobTitle','ticketType','status','registeredAt'] loop
   if jsonb_typeof(r->k) is distinct from 'string' or length(r->>k)>1000 then raise exception 'invalid_fields';end if;
  end loop;
  if r->>'attendeeId' !~ '^[0-9]{1,40}$' or exists(select 1 from jsonb_object_keys(r) as x(key) where x.key not in ('attendeeId','firstName','lastName','email','company','jobTitle','ticketType','status','registeredAt')) then raise exception 'invalid_fields';end if;
 end loop;
 if exists(select 1 from jsonb_array_elements(p_rows) as x group by x->>'attendeeId' having count(*)>1) then raise exception 'duplicate_attendee';end if;
 perform 1 from portal_private.events where id='off-air' for update;
 select v.revision,v.records into prior_revision,prior_rows from portal_private.report_current c join portal_private.report_versions v on v.id=c.version_id where c.event_id='off-air' and c.source_kind='eventbrite_raw';
 if coalesce(prior_revision,0)<>p_base then raise exception using errcode='40001',message='stale_version';end if;
 if prior_rows=p_rows then return jsonb_build_object('revision',prior_revision,'count',jsonb_array_length(p_rows),'unchanged',true);end if;
 insert into portal_private.report_versions(event_id,source_kind,label,report_date,records,sha256,created_by) values('off-air','eventbrite_raw','Eventbrite OFF AIR sync',current_date,p_rows,encode(sha256(convert_to(p_rows::text,'UTF8')),'hex'),actor) returning id,revision into version,revision_number;
 insert into portal_private.report_current(event_id,source_kind,version_id) values('off-air','eventbrite_raw',version) on conflict(event_id,source_kind) do update set version_id=excluded.version_id;
 insert into portal_private.audit(actor,event_id,action,version_id) values(actor,'off-air','sync_eventbrite_raw',version);
 return jsonb_build_object('revision',revision_number,'count',jsonb_array_length(p_rows),'unchanged',false);
end $$;
revoke all on function public.portal_eventbrite_ingest(jsonb,bigint,text) from public,anon,authenticated;
create function public.portal_sponsor_eventbrite(p_event text,p_sponsor uuid) returns jsonb
language plpgsql security definer set search_path='' as $$
declare actor uuid; emails boolean;
begin
 actor:=portal_private.require_sponsor(p_event,p_sponsor);
 if not exists(select 1 from portal_private.terms_acceptance where user_id=actor and terms_version='sponsor-2026-11-13-v1') then raise exception using errcode='42501',message='terms_required';end if;
 select can_view_email into emails from portal_private.event_access where sponsor_id=p_sponsor and event_id=p_event;
 return coalesce((select jsonb_build_object('syncedAt',v.created_at,'rows',coalesce((select jsonb_agg(jsonb_build_object('firstName',x.value->>'firstName','lastName',x.value->>'lastName','company',x.value->>'company','jobTitle',x.value->>'jobTitle','ticketType',x.value->>'ticketType','status',x.value->>'status','registeredAt',x.value->>'registeredAt')||case when emails then jsonb_build_object('email',x.value->>'email') else '{}'::jsonb end order by x.ordinality) from jsonb_array_elements(v.records) with ordinality as x(value,ordinality)),'[]'::jsonb),'canViewEmail',emails) from portal_private.report_current c join portal_private.report_versions v on v.id=c.version_id where c.event_id=p_event and c.source_kind='eventbrite_raw'),jsonb_build_object('syncedAt',null,'rows','[]'::jsonb,'canViewEmail',emails));
end $$;
revoke all on function public.portal_sponsor_eventbrite(text,uuid) from public,anon,authenticated;
-- Enable only after the rollback tests pass.
commit;
