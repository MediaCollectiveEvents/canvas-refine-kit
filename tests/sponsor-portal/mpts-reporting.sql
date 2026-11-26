begin;
do $$
declare
 owner_id uuid:=gen_random_uuid(); owner_session uuid:=gen_random_uuid();
 a uuid:=gen_random_uuid(); a_session uuid:=gen_random_uuid(); a_team uuid:=gen_random_uuid();
 b uuid:=gen_random_uuid(); b_session uuid:=gen_random_uuid(); b_team uuid:=gen_random_uuid();
 guest uuid; snapshot jsonb; image_path text; close_at timestamptz;
begin
 if has_function_privilege('anon','public.portal_mpts_report(text,uuid,jsonb)','EXECUTE')
 or has_function_privilege('anon','public.portal_mpts_media(text,uuid,jsonb)','EXECUTE') then raise exception 'Anonymous MPTS RPC';end if;
 insert into auth.users(id,email,email_confirmed_at,aud,role)
 values(owner_id,owner_id||'@example.invalid',now(),'authenticated','authenticated'),
       (a,a||'@example.invalid',now(),'authenticated','authenticated'),
       (b,b||'@example.invalid',now(),'authenticated','authenticated');
 insert into auth.sessions(id,user_id,created_at,updated_at) values(owner_session,owner_id,now(),now()),
  (a_session,a,now(),now()),(b_session,b,now(),now());
 insert into portal_private.owners(user_id) values(owner_id);
 insert into portal_private.sponsors(id,name) values(a_team,'MPTS test A '||a_team),(b_team,'MPTS test B '||b_team);
 insert into portal_private.memberships(user_id,sponsor_id) values(a,a_team),(b,b_team);
 insert into portal_private.event_access(sponsor_id,event_id,expires_at) values(b_team,'off-air',now()+interval '1 day');

 perform set_config('request.jwt.claims',jsonb_build_object('sub',owner_id,'session_id',owner_session,'role','authenticated','aal','aal2')::text,true);
 perform public.portal_mpts_report('grant_team',null,jsonb_build_object('sponsor',a_team,'expiresAt',now()+interval '1 day'));
 perform public.portal_mpts_report('publish',null,jsonb_build_object('filename','Synthetic test CSV','revision',0,'agreed',true,'rows',
  '[{"attendeeId":"mpts-test-1","firstName":"Synthetic","lastName":"Guest","email":"guest@example.invalid","company":"Example","jobTitle":"Director","linkedin":"","registeredAt":"2026-11-24T14:00:00Z"}]'::jsonb));
 begin
  perform public.portal_mpts_report('open_attendance');raise exception 'Opened before the reception';
 exception when insufficient_privilege then if sqlerrm<>'mpts_attendance_before_event' then raise;end if;
 end;
 update portal_private.events set event_date=current_date-2 where id='mpts-reception-2027';
 snapshot:=public.portal_mpts_report('open_attendance');
 close_at:=(snapshot->>'closesAt')::timestamptz;
 if close_at<clock_timestamp()+interval '71 hours 59 minutes' then raise exception 'Edit window is too short';end if;
 snapshot:=public.portal_mpts_report('import_checkins',null,'{"rows":[{"firstName":"Synthetic","lastName":"Guest","email":"guest@example.invalid","status":"attended"}]}');
 if snapshot->>'attended' is distinct from '1' then raise exception 'Check-in failed to match';end if;
 snapshot:=public.portal_mpts_media('reserve',null,'{"kind":"marketing","mime":"image/png","filename":"test.png","caption":"","size":100}');
 image_path:=snapshot->>'path';
 if not portal_private.mpts_gallery_allowed(image_path,true) then raise exception 'Owner could not prepare marketing upload';end if;
 begin
  perform public.portal_gallery_publish((snapshot->>'id')::uuid);raise exception 'Legacy publisher accepted an MPTS reservation';
 exception when insufficient_privilege then null;
 end;

 perform set_config('request.jwt.claims',jsonb_build_object('sub',b,'session_id',b_session,'role','authenticated','aal','aal1')::text,true);
 if public.portal_mpts_report('access')<>'[]'::jsonb then raise exception 'OFF AIR access leaked into MPTS';end if;
 begin
  perform public.portal_mpts_report('rows',a_team);raise exception 'Cross-team read succeeded';
 exception when insufficient_privilege then null;
 end;

 perform set_config('request.jwt.claims',jsonb_build_object('sub',a,'session_id',a_session,'role','authenticated','aal','aal1')::text,true);
 if jsonb_array_length(public.portal_mpts_report('access'))<>1 then raise exception 'Approved team could not sign in';end if;
 if not (public.portal_code_request_route(a||'@example.invalid',repeat('a',64))->>'registered')::boolean then raise exception 'Approved team could not request a code';end if;
 begin
  perform public.portal_mpts_report('rows',a_team);raise exception 'Terms check failed';
 exception when insufficient_privilege then if sqlerrm<>'terms_required' then raise;end if;
 end;
 insert into portal_private.terms_acceptance(user_id,terms_version) values(a,'off-air-2026-11-16-v2');
 begin
  perform public.portal_sponsor_guests('mpts-reception-2027',a_team);raise exception 'Legacy terms disclosed MPTS rows';
 exception when insufficient_privilege then null;
 end;
 perform public.portal_mpts_report('accept',a_team,'{"agreed":true,"version":"mpts-reception-2027-v1"}');
 snapshot:=public.portal_mpts_report('rows',a_team);
 if jsonb_array_length(snapshot->'rows')<>1 or (snapshot->'rows'->0) ? 'email'
  or snapshot->'rows'->0->>'registeredAt' is distinct from '2026-11-24T14:00:00Z' then raise exception 'MPTS row projection failed';end if;
 guest:=(snapshot->'rows'->0->>'guestRef')::uuid;
 if public.portal_mpts_report('attendance',a_team)->'statuses'->>guest::text is distinct from 'attended' then raise exception 'Check-in missing';end if;
 if public.portal_mpts_report('save_attendance',a_team,jsonb_build_object('guest',guest,'status','unable_to_attend'))->'statuses'->>guest::text is distinct from 'unable_to_attend' then raise exception 'Attendance update missing';end if;
 if public.portal_mpts_report('save_selection',a_team,jsonb_build_object('guest',guest,'selected',true))<>jsonb_build_array(guest) then raise exception 'Invitation suggestion not saved';end if;
 if jsonb_array_length(public.portal_mpts_report('export',a_team)->'rows')<>1 then raise exception 'Export missing';end if;
 if portal_private.mpts_gallery_allowed(image_path,true) or portal_private.mpts_gallery_allowed(image_path,false) then raise exception 'Draft marketing asset exposed';end if;
 begin
  perform public.portal_mpts_media('reserve',a_team,'{"kind":"marketing","mime":"image/png","filename":"test.png","caption":"","size":100}');
  raise exception 'Sponsor marketing upload allowed';
 exception when insufficient_privilege then null;
 end;
 update portal_private.attendance_windows set closes_at=clock_timestamp() where event_id='mpts-reception-2027';
 begin
  perform public.portal_mpts_report('save_attendance',a_team,jsonb_build_object('guest',guest,'status','attended'));
  raise exception 'Closed edit window allowed a save';
 exception when insufficient_privilege then if sqlerrm<>'attendance_editing_closed' then raise;end if;
 end;
end $$;
rollback;
select 'PASS: MPTS isolation, terms, CSV publish and dates, attendance cutoff, invitations and media access' as result;
