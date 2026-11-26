begin;
do $$
declare owner_id uuid:=gen_random_uuid(); partner_a uuid:=gen_random_uuid(); partner_b uuid:=gen_random_uuid(); owner_sid uuid:=gen_random_uuid(); sid_a uuid:=gen_random_uuid(); sid_b uuid:=gen_random_uuid(); company_a uuid:=gen_random_uuid(); company_b uuid:=gen_random_uuid(); before_rows jsonb; rows jsonb; guest uuid; result jsonb; saved_at timestamptz; n integer; test_event text:='meeting-test-'||gen_random_uuid(); raw_version uuid; enriched_version uuid; stable_ref text;
begin
 if has_function_privilege('anon','public.portal_meeting_interest_set(uuid,uuid,boolean)','EXECUTE') or has_table_privilege('authenticated','portal_private.meeting_interests','SELECT') then raise exception 'Private access boundary failed';end if;
 insert into auth.users(id,email,email_confirmed_at,aud,role) values(owner_id,owner_id||'@example.invalid',now(),'authenticated','authenticated'),(partner_a,partner_a||'@example.invalid',now(),'authenticated','authenticated'),(partner_b,partner_b||'@example.invalid',now(),'authenticated','authenticated');
 insert into auth.sessions(id,user_id,created_at,updated_at) values(owner_sid,owner_id,now(),now()),(sid_a,partner_a,now(),now()),(sid_b,partner_b,now(),now());
 insert into portal_private.owners(user_id) values(owner_id);
 insert into portal_private.sponsors(id,name) values(company_a,'Temporary test A'),(company_b,'Temporary test B');
 insert into portal_private.memberships(user_id,sponsor_id,expires_at) values(partner_a,company_a,now()+interval '1 day'),(partner_b,company_b,now()+interval '1 day');
 insert into portal_private.event_access(sponsor_id,event_id,expires_at) values(company_a,'off-air',now()+interval '1 day'),(company_b,'off-air',now()+interval '1 day');
 insert into portal_private.terms_acceptance(user_id,terms_version) values(partner_a,'off-air-2026-11-16-v2'),(partner_b,'off-air-2026-11-16-v2');
 insert into portal_private.events(id,title,event_date,venue,capacity) values(test_event,'Temporary meeting reference test',current_date,'Test only',1);
 insert into portal_private.report_versions(event_id,source_kind,label,report_date,records,sha256,created_by) values(test_event,'eventbrite_raw','Temporary raw',current_date,'[{"attendeeId":"999999999999","firstName":"Example","lastName":"Guest","email":"example@example.invalid","company":"Original","jobTitle":"Original role","registeredAt":"2026-11-18T10:00:00Z"}]',repeat('0',64),owner_id) returning id into raw_version;
 insert into portal_private.report_current(event_id,source_kind,version_id) values(test_event,'eventbrite_raw',raw_version);
 stable_ref:=portal_private.sponsor_guest_rows(test_event)->0->>'guestRef';
 insert into portal_private.report_versions(event_id,source_kind,label,report_date,records,sha256,created_by) values(test_event,'enriched','Temporary enrichment',current_date,'[{"attendeeId":"999999999999","firstName":"Example","lastName":"Guest","email":"corrected@example.invalid","company":"Corrected company","jobTitle":"Corrected title","linkedin":"https://www.linkedin.com/in/example"}]',repeat('1',64),owner_id) returning id into enriched_version;
 insert into portal_private.report_current(event_id,source_kind,version_id) values(test_event,'enriched',enriched_version);
 if portal_private.sponsor_guest_rows(test_event)->0->>'guestRef' is distinct from stable_ref then raise exception 'Reference lost on enrichment';end if;
 if jsonb_array_length(portal_private.sponsor_guest_rows(test_event))<>1 then raise exception 'Enrichment duplicated guest';end if;
 rows:=portal_private.sponsor_guest_rows('off-air');
 if rows is distinct from portal_private.sponsor_guest_rows('off-air') then raise exception 'Unstable guest references';end if;
 if exists(select 1 from jsonb_array_elements(rows) x where x?'email' or x?'_aliases') then raise exception 'Private identity data leaked';end if;
 select (x->>'guestRef')::uuid into guest from jsonb_array_elements(rows) x where x->>'guestRef' is not null group by x->>'guestRef' having count(*)=1 limit 1;
 if guest is null then raise exception 'No test guest reference';end if;
 perform set_config('request.jwt.claims',jsonb_build_object('sub',partner_a,'session_id',sid_a,'role','authenticated','aal','aal1')::text,true);
 result:=public.portal_meeting_interest_set(company_a,guest,true);
 if not result @> jsonb_build_array(guest) then raise exception 'Tick not persisted';end if;
 select selected_at into saved_at from portal_private.meeting_interests where user_id=partner_a and guest_ref=guest;
 perform public.portal_meeting_interest_set(company_a,guest,true);
 select count(*) into n from portal_private.meeting_interests where user_id=partner_a and guest_ref=guest and selected_at=saved_at;
 if n<>1 then raise exception 'Repeated tick was not idempotent';end if;
 begin
  perform public.portal_meeting_interest_set(company_a,gen_random_uuid(),true);
  raise exception 'Invented guest accepted';
 exception when raise_exception then if sqlerrm<>'guest_selection_unavailable' then raise;end if;end;
 perform set_config('request.jwt.claims',jsonb_build_object('sub',partner_b,'session_id',sid_b,'role','authenticated','aal','aal1')::text,true);
 if public.portal_meeting_interests(company_b)<>'[]'::jsonb then raise exception 'Other partner selections leaked';end if;
 begin
  perform public.portal_meeting_interests(company_a);raise exception 'Cross-partner read accepted';
 exception when insufficient_privilege then null;end;
 begin
  perform public.portal_meeting_interest_set(company_a,guest,true);raise exception 'Cross-partner write accepted';
 exception when insufficient_privilege then null;end;
 begin
  perform public.portal_owner_meeting_interests();raise exception 'Partner saw owner view';
 exception when insufficient_privilege then null;end;
 perform set_config('request.jwt.claims',jsonb_build_object('sub',owner_id,'session_id',owner_sid,'role','authenticated','aal','aal1')::text,true);
 begin
  perform public.portal_owner_meeting_interests();raise exception 'Owner MFA bypassed';
 exception when insufficient_privilege then null;end;
 perform set_config('request.jwt.claims',jsonb_build_object('sub',owner_id,'session_id',owner_sid,'role','authenticated','aal','aal2')::text,true);
 result:=public.portal_owner_meeting_interests();
 if not exists(select 1 from jsonb_array_elements(result) x where x->>'guestRef'=guest::text and x->>'partner'='Temporary test A') then raise exception 'Owner missing selection';end if;
 perform set_config('request.jwt.claims',jsonb_build_object('sub',partner_a,'session_id',sid_a,'role','authenticated','aal','aal1')::text,true);
 result:=public.portal_meeting_interest_set(company_a,guest,false);
 if result @> jsonb_build_array(guest) then raise exception 'Untick not persisted';end if;
 update portal_private.memberships set active=false where user_id=partner_a;
 begin
  perform public.portal_meeting_interest_set(company_a,guest,true);raise exception 'Revoked partner wrote selection';
 exception when insufficient_privilege then null;end;
end $$;
rollback;select 'PASS: partner isolation, MFA, revoked access, unchanged identity through enrichment, save/untick and idempotence. All test changes rolled back.' as result;