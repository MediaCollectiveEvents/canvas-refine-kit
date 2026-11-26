begin;
insert into portal_private.events(id,title,event_date,venue,capacity)
values('mpts-reception-2027','MPTS Reception 2027','2027-05-12','Olympia, London',120)
on conflict(id) do nothing;

create function portal_private.mpts_report_ends_at() returns timestamptz
language sql stable set search_path='' as $$
 select (event_date+1)::timestamp at time zone 'Europe/London'
 from portal_private.events where id='mpts-reception-2027';
$$;
create function portal_private.require_mpts_report(p_sponsor uuid,p_require_terms boolean default true) returns uuid
language plpgsql security definer set search_path='' as $$
declare actor uuid;
begin
 if p_sponsor is null then return portal_private.require_owner(); end if;
 actor:=portal_private.require_sponsor('mpts-reception-2027',p_sponsor);
 if p_require_terms and not exists(select 1 from portal_private.terms_acceptance
   where user_id=actor and terms_version='mpts-reception-2027-v1') then
  raise exception using errcode='42501',message='terms_required';
 end if;
 return actor;
end $$;

create function portal_private.mpts_report_rows() returns jsonb
language plpgsql volatile security definer set search_path='' as $$
declare projected jsonb; answer jsonb;
begin
 projected:=portal_private.sponsor_guest_rows('mpts-reception-2027');
 with published as materialized (
  select value from portal_private.report_current c join portal_private.report_versions v on v.id=c.version_id
  cross join lateral jsonb_array_elements(v.records)
  where c.event_id='mpts-reception-2027' and c.source_kind='enriched'
 ), dates as (
  select a.guest_ref,max(p.value->>'registeredAt') as registered_at
  from published p
  join portal_private.meeting_guest_aliases a on a.event_id='mpts-reception-2027'
   and a.identity=any(array['eb:'||nullif(trim(p.value->>'attendeeId'),''),'email:'||nullif(lower(trim(p.value->>'email')),'')])
  group by a.guest_ref
 ), guests as materialized (
  select value,ordinality from jsonb_array_elements(projected) with ordinality
 )
 select coalesce(jsonb_agg(g.value||jsonb_build_object('registeredAt',coalesce(d.registered_at,'')) order by g.ordinality),'[]')
 into answer from guests g left join dates d on d.guest_ref::text=g.value->>'guestRef';
 return answer;
end $$;

create function public.portal_mpts_report(p_action text,p_sponsor uuid default null,p_data jsonb default '{}'::jsonb) returns jsonb
language plpgsql security definer set search_path='' as $$
declare
 event_key constant text:='mpts-reception-2027';
 version_key constant text:='mpts-reception-2027-v1';
 actor uuid;
 sponsor uuid;
 guest uuid;
 result jsonb;
 guest_snapshot jsonb;
 selected boolean;
 state_value text;
 expiry timestamptz;
 source text;
begin
 if p_action='access' then
  if auth.uid() is null then raise exception using errcode='42501',message='sponsor_access_required';end if;
  result:='[]';
  for sponsor in select sponsor_id from portal_private.memberships where user_id=auth.uid() and active loop
   begin
    perform portal_private.require_mpts_report(sponsor,false);
    result:=result||jsonb_build_array(jsonb_build_object('sponsorId',sponsor,
     'company',(select name from portal_private.sponsors where id=sponsor)));
   exception when insufficient_privilege then null;
   end;
  end loop;
  return result;
 end if;

 actor:=portal_private.require_mpts_report(p_sponsor,p_action not in ('state','accept'));
 if p_action in ('state','accept') then
  if p_action='accept' and p_sponsor is not null then
   if p_data->'agreed' is distinct from 'true'::jsonb or p_data->>'version' is distinct from version_key then
    raise exception 'accept_current_terms';
   end if;
   insert into portal_private.terms_acceptance(user_id,terms_version) values(actor,version_key) on conflict do nothing;
  end if;
  return jsonb_build_object('sponsor',coalesce((select name from portal_private.sponsors where id=p_sponsor),'Owner'),
   'event','MPTS Reception 2027','accepted',p_sponsor is null or exists(
    select 1 from portal_private.terms_acceptance where user_id=actor and terms_version=version_key),
   'termsVersion',version_key,'rows','[]'::jsonb,'canViewEmail',false,
   'endsAt',portal_private.mpts_report_ends_at());

 elsif p_action in ('rows','export') then
  if p_action='export' and p_sponsor is not null and
   (clock_timestamp()<portal_private.mpts_report_ends_at() or clock_timestamp()>=portal_private.mpts_report_ends_at()+interval '21 days') then
   raise exception using errcode='42501',message='mpts_download_unavailable';
  end if;
  if p_action='export' then
   insert into portal_private.audit(actor,event_id,action) values(actor,event_key,'registrants_export');
  end if;
  return jsonb_build_object('rows',portal_private.mpts_report_rows(),'canViewEmail',false,
   'syncedAt',(select v.created_at from portal_private.report_current c join portal_private.report_versions v on v.id=c.version_id
    where c.event_id=event_key and c.source_kind='enriched'));

 elsif p_action in ('attendance','save_attendance') then
  if p_action='save_attendance' then
   if p_sponsor is null then raise exception using errcode='42501',message='sponsor_access_required';end if;
   guest:=(p_data->>'guest')::uuid;
   state_value:=p_data->>'status';
   if guest is null or state_value is null or state_value not in ('attended','unable_to_attend','no_show','unconfirmed') then
    raise exception 'invalid_attendance_status';
   end if;
   if (select count(*) from jsonb_array_elements(portal_private.mpts_report_rows()) r where r->>'guestRef'=guest::text)<>1 then
    raise exception 'guest_selection_unavailable';
   end if;
   if not exists(select 1 from portal_private.attendance_windows where event_id=event_key and closes_at>clock_timestamp()) then
    raise exception using errcode='42501',message='attendance_editing_closed';
   end if;
   insert into portal_private.sponsor_attendance(event_id,sponsor_id,guest_ref,status,updated_by)
   values(event_key,p_sponsor,guest,state_value,actor)
   on conflict(event_id,sponsor_id,guest_ref) do update set status=excluded.status,updated_by=excluded.updated_by,updated_at=clock_timestamp();
  end if;
  return jsonb_build_object('closesAt',(select closes_at from portal_private.attendance_windows where event_id=event_key),
   'statuses',coalesce((select jsonb_object_agg(coalesce(s.guest_ref,c.guest_ref),coalesce(s.status,c.status))
    from (select guest_ref,status from portal_private.attendance_checkins where event_id=event_key) c
    full join (select guest_ref,status from portal_private.sponsor_attendance where event_id=event_key and sponsor_id=p_sponsor) s
    using(guest_ref)),'{}'::jsonb));

 elsif p_action in ('selections','save_selection') then
  if p_sponsor is null then raise exception using errcode='42501',message='sponsor_access_required';end if;
  if p_action='save_selection' then
   guest:=(p_data->>'guest')::uuid;
   if guest is null or jsonb_typeof(p_data->'selected') is distinct from 'boolean' then raise exception 'invalid_meeting_selection';end if;
   selected:=(p_data->>'selected')::boolean;
   select case when count(*)=1 then (jsonb_agg(r)->0) end into guest_snapshot
    from jsonb_array_elements(portal_private.mpts_report_rows()) r where r->>'guestRef'=guest::text;
   if selected and guest_snapshot is null then raise exception 'guest_selection_unavailable'; end if;
   if selected then
    insert into portal_private.meeting_interests(event_id,sponsor_id,user_id,guest_ref,selected,guest_snapshot)
    values(event_key,p_sponsor,actor,guest,true,guest_snapshot)
    on conflict(event_id,sponsor_id,user_id,guest_ref) do update set selected=true,
     selected_at=case when portal_private.meeting_interests.selected then portal_private.meeting_interests.selected_at else now() end,
     updated_at=now(),guest_snapshot=excluded.guest_snapshot;
   else
    update portal_private.meeting_interests set selected=false,updated_at=now()
     where event_id=event_key and sponsor_id=p_sponsor and user_id=actor and guest_ref=guest;
   end if;
  end if;
  return coalesce((select jsonb_agg(guest_ref) from portal_private.meeting_interests i
   where i.event_id=event_key and i.sponsor_id=p_sponsor and i.user_id=actor and i.selected),'[]'::jsonb);

 elsif p_sponsor is null and p_action='owner_settings' then
  return jsonb_build_object(
   'revision',coalesce((select v.revision from portal_private.report_current c join portal_private.report_versions v on v.id=c.version_id
    where c.event_id=event_key and c.source_kind='enriched'),0),
   'teams',coalesce((select jsonb_agg(jsonb_build_object('id',s.id,'name',s.name,'expiresAt',a.expires_at,'approved',a.revoked_at is null and a.expires_at>now()) order by s.name)
    from portal_private.sponsors s left join portal_private.event_access a on a.sponsor_id=s.id and a.event_id=event_key
    where s.active and exists(select 1 from portal_private.memberships m where m.sponsor_id=s.id and m.active)),'[]'),
   'suggestions',coalesce((select jsonb_agg(jsonb_build_object('guest',i.guest_snapshot,'team',s.name,'selectedAt',i.selected_at) order by i.selected_at desc)
    from portal_private.meeting_interests i join portal_private.sponsors s on s.id=i.sponsor_id
    where i.event_id=event_key and i.selected),'[]'));

 elsif p_sponsor is null and p_action='grant_team' then
  sponsor:=(p_data->>'sponsor')::uuid;
  expiry:=(p_data->>'expiresAt')::timestamptz;
  if expiry is null or expiry<=now() or expiry>portal_private.mpts_report_ends_at()+interval '21 days'
    or not exists(select 1 from portal_private.sponsors where id=sponsor and active) then raise exception 'invalid_sponsor_details';end if;
  insert into portal_private.event_access(sponsor_id,event_id,expires_at) values(sponsor,event_key,expiry)
  on conflict(sponsor_id,event_id) do update set expires_at=excluded.expires_at,revoked_at=null;
  insert into portal_private.audit(actor,event_id,action) values(actor,event_key,'mpts_sponsor_access_granted');
  return '{}'::jsonb;

 elsif p_sponsor is null and p_action='revoke_team' then
  update portal_private.event_access set revoked_at=now() where event_id=event_key and sponsor_id=(p_data->>'sponsor')::uuid;
  insert into portal_private.audit(actor,event_id,action) values(actor,event_key,'mpts_sponsor_access_revoked');
  return '{}'::jsonb;

 elsif p_sponsor is null and p_action='publish' then
  source:=p_data->>'filename';
  perform public.portal_owner_publish(event_key,p_data->'rows',source,(p_data->>'revision')::bigint,(p_data->>'agreed')::boolean);
  return '{}'::jsonb;

 elsif p_sponsor is null and p_action='open_attendance' then
  if clock_timestamp()<portal_private.mpts_report_ends_at() then
   raise exception using errcode='42501',message='mpts_attendance_before_event';
  end if;
  insert into portal_private.attendance_windows(event_id,closes_at)
   values(event_key,clock_timestamp()+interval '72 hours') on conflict(event_id) do nothing;
  return public.portal_mpts_report('attendance');

 elsif p_sponsor is null and p_action='import_checkins' then
  if clock_timestamp()<portal_private.mpts_report_ends_at() or jsonb_typeof(p_data->'rows') is distinct from 'array'
   or jsonb_array_length(p_data->'rows') not between 1 and 5000 then raise exception 'invalid_rows';end if;
  -- Allocate stable references before joining to the private aliases.
  result:=portal_private.mpts_report_rows();
  with entries as (
   select row_number() over() as source_row, value from jsonb_array_elements(p_data->'rows')
  ), guests as materialized (
   select (r->>'guestRef')::uuid as guest_ref,r->>'firstName' as first_name,r->>'lastName' as last_name
   from jsonb_array_elements(result) r
   where r->>'guestRef' is not null
  ), candidates as (
   select distinct e.source_row,g.guest_ref,e.value->>'status' as status
   from entries e join portal_private.meeting_guest_aliases a on a.event_id=event_key
    and a.identity='email:'||lower(trim(e.value->>'email'))
   join guests g on g.guest_ref=a.guest_ref
   where lower(trim(g.first_name))=lower(trim(e.value->>'firstName'))
    and lower(trim(g.last_name))=lower(trim(e.value->>'lastName'))
    and e.value->>'status' in ('attended','no_show')
    and (select count(*) from guests other where other.guest_ref=g.guest_ref)=1
  ), resolved as (
   select guest_ref,case when bool_or(status='attended') then 'attended' else 'no_show' end as status,count(*) as records
   from candidates group by guest_ref
  ), saved as (
   insert into portal_private.attendance_checkins(event_id,guest_ref,status)
    select event_key,guest_ref,status from resolved
   on conflict(event_id,guest_ref) do update set status=excluded.status returning status
  )
  select jsonb_build_object('attended',count(*) filter(where status='attended'),
   'noShow',count(*) filter(where status='no_show'),
   'unmatched',jsonb_array_length(p_data->'rows')-coalesce((select sum(records) from resolved),0))
  into result from saved;
  return result;
 end if;
 raise exception using errcode='42501',message='mpts_action_not_authorised';
end $$;

revoke all on function portal_private.mpts_report_ends_at(),portal_private.require_mpts_report(uuid,boolean),portal_private.mpts_report_rows() from public,anon,authenticated;
revoke all on function public.portal_mpts_report(text,uuid,jsonb) from public,anon;
grant execute on function public.portal_mpts_report(text,uuid,jsonb) to authenticated;
commit;
