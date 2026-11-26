begin;
do $$
declare
 partner_a uuid:=gen_random_uuid(); partner_b uuid:=gen_random_uuid();
 session_a uuid:=gen_random_uuid(); session_b uuid:=gen_random_uuid();
 sponsor_a uuid:=gen_random_uuid(); sponsor_b uuid:=gen_random_uuid();
 owner_id uuid:=gen_random_uuid(); owner_session uuid:=gen_random_uuid();
 guest uuid; snapshot jsonb;
begin
 if has_function_privilege('anon','public.portal_sponsor_attendance_set(uuid,uuid,text)','EXECUTE')
    or has_table_privilege('authenticated','portal_private.sponsor_attendance','UPDATE') then
  raise exception 'Attendance permissions are too broad';
 end if;

 insert into auth.users(id,email,email_confirmed_at,aud,role)
 values(partner_a,partner_a||'@example.invalid',now(),'authenticated','authenticated'),
       (partner_b,partner_b||'@example.invalid',now(),'authenticated','authenticated'),
       (owner_id,owner_id||'@example.invalid',now(),'authenticated','authenticated');
 insert into portal_private.owners(user_id) values(owner_id);
 insert into auth.sessions(id,user_id,created_at,updated_at)
 values(session_a,partner_a,now(),now()),(session_b,partner_b,now(),now()),(owner_session,owner_id,now(),now());
 insert into portal_private.sponsors(id,name) values(sponsor_a,'Attendance test A'),(sponsor_b,'Attendance test B');
 insert into portal_private.memberships(user_id,sponsor_id) values(partner_a,sponsor_a),(partner_b,sponsor_b);
 insert into portal_private.event_access(sponsor_id,event_id,expires_at)
 values(sponsor_a,'off-air',now()+interval '1 day'),(sponsor_b,'off-air',now()+interval '1 day');
 insert into portal_private.terms_acceptance(user_id,terms_version)
 values(partner_a,'off-air-2026-11-16-v2'),(partner_b,'off-air-2026-11-16-v2');

 select (r->>'guestRef')::uuid into strict guest
 from jsonb_array_elements(portal_private.sponsor_guest_rows('off-air')) r
 where r->>'guestRef' is not null and not exists(select 1 from portal_private.sponsor_attendance s where s.event_id='off-air' and s.guest_ref::text=r->>'guestRef') group by r->>'guestRef' having count(*)=1 limit 1;
 insert into portal_private.attendance_checkins(event_id,guest_ref,status)
 values('off-air',guest,'attended') on conflict(event_id,guest_ref) do update set status=excluded.status;
 insert into portal_private.attendance_windows(event_id,closes_at)
 values('off-air',clock_timestamp()+interval '72 hours') on conflict(event_id) do update set closes_at=excluded.closes_at;

 perform set_config('request.jwt.claims',jsonb_build_object('sub',partner_a,'session_id',session_a,'role','authenticated','aal','aal1')::text,true);
 snapshot:=public.portal_sponsor_attendance(sponsor_a);
 if snapshot->'statuses'->>guest::text is distinct from 'attended' then raise exception 'Imported check-in was unavailable'; end if;
 snapshot:=public.portal_sponsor_attendance_set(sponsor_a,guest,'unable_to_attend');
 if snapshot->'statuses'->>guest::text is distinct from 'unable_to_attend' then raise exception 'Sponsor update was not saved'; end if;
 begin
  perform public.portal_sponsor_attendance_set(sponsor_a,gen_random_uuid(),'attended');
  raise exception 'Invalid guest accepted';
 exception when raise_exception then
  if sqlerrm<>'guest_selection_unavailable' then raise; end if;
 end;

 perform set_config('request.jwt.claims',jsonb_build_object('sub',partner_b,'session_id',session_b,'role','authenticated','aal','aal1')::text,true);
 snapshot:=public.portal_sponsor_attendance(sponsor_b);
 if snapshot->'statuses'->>guest::text is distinct from 'unable_to_attend' then raise exception 'Sponsor update was not shared'; end if;
 snapshot:=public.portal_sponsor_attendance_set(sponsor_b,guest,'no_show');
 if snapshot->'statuses'->>guest::text is distinct from 'no_show' then raise exception 'Latest correction did not win';end if;
 begin
  perform public.portal_sponsor_attendance(null);raise exception 'Sponsor could use owner view';
 exception when insufficient_privilege then null;
 end;
 begin
  perform public.portal_sponsor_attendance_set(sponsor_a,guest,'no_show');
  raise exception 'Cross-sponsor write accepted';
 exception when insufficient_privilege then null;
 end;

 update portal_private.attendance_windows set closes_at=clock_timestamp() where event_id='off-air';
 begin
  perform public.portal_sponsor_attendance_set(sponsor_b,guest,'unconfirmed');
  raise exception 'Closed window accepted an update';
 exception when insufficient_privilege then
  if sqlerrm<>'attendance_editing_closed' then raise; end if;
 end;
 snapshot:=public.portal_sponsor_attendance(sponsor_b);
 if snapshot->'statuses'->>guest::text is distinct from 'no_show' then raise exception 'Closed window prevented reading the shared record'; end if;
 perform set_config('request.jwt.claims',jsonb_build_object('sub',owner_id,'session_id',owner_session,'role','authenticated','aal','aal2')::text,true);
 if public.portal_sponsor_attendance(null)->'statuses'->>guest::text is distinct from 'no_show' then raise exception 'Owner could not read the latest correction';end if;
end $$;
rollback;
select 'PASS: check-in defaults, shared sponsor updates, owner visibility, authorisation and 72-hour cutoff' as result;
