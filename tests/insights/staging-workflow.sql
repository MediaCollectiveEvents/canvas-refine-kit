-- Staging only. All fixture users, drafts and publications roll back.
begin;
do $$
declare
 owner_id uuid:=gen_random_uuid();session_id uuid:=gen_random_uuid();
 first_link text;second_link text;renewed text;submission jsonb;article jsonb;
 first_id uuid;second_id uuid;draft jsonb;slug text;
 jpeg text:='data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAgGBgcGBQgHBwcJCQgKDBQNDAsLDBkSEw8UHRofHh0aHBwgJC4nICIsIxwcKDcpLDAxNDQ0Hyc5PTgyPC4zNDL/2wBDAQkJCQwLDBgNDRgyIRwhMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjL/wAARCAAIAAgDASIAAhEBAxEB/8QAHwAAAQUBAQEBAQEAAAAAAAAAAAECAwQFBgcICQoL/8QAtRAAAgEDAwIEAwUFBAQAAAF9AQIDAAQRBRIhMUEGE1FhByJxFDKBkaEII0KxwRVS0fAkM2JyggkKFhcYGRolJicoKSo0NTY3ODk6Q0RFRkdISUpTVFVWV1hZWmNkZWZnaGlqc3R1dnd4eXqDhIWGh4iJipKTlJWWl5iZmqKjpKWmp6ipqrKztLW2t7i5usLDxMXGx8jJytLT1NXW19jZ2uHi4+Tl5ufo6erx8vP09fb3+Pn6/8QAHwEAAwEBAQEBAQEBAQAAAAAAAAECAwQFBgcICQoL/8QAtREAAgECBAQDBAcFBAQAAQJ3AAECAxEEBSExBhJBUQdhcRMiMoEIFEKRobHBCSMzUvAVYnLRChYkNOEl8RcYGRomJygpKjU2Nzg5OkNERUZHSElKU1RVVldYWVpjZGVmZ2hpanN0dXZ3eHl6goOEhYaHiImKkpOUlZaXmJmaoqOkpaanqKmqsrO0tba3uLm6wsPExcbHyMnK0tPU1dbX2Nna4uPk5ebn6Onq8vP09fb3+Pn6/9oADAMBAAIRAxEAPwDLooor1DxD/9k=';
begin
 if has_table_privilege('anon','portal_private.insights_submissions','select')
 or has_table_privilege('authenticated','portal_private.insights_revisions','select')
 or has_table_privilege('anon','portal_private.insights_publications','select')
 or has_function_privilege('anon','public.insights_owner(text,jsonb)','execute') then raise exception 'Private access grant'; end if;
 begin
  perform public.insights_contributor('get',repeat('a',64));
  raise exception 'Unexpected successful anonymous access';
 exception when raise_exception then if sqlerrm<>'invalid_link' then raise; end if;
 end;

 insert into auth.users(id,email,email_confirmed_at,aud,role) values(owner_id,owner_id||'@example.invalid',now(),'authenticated','authenticated');
 insert into auth.sessions(id,user_id,created_at,updated_at) values(session_id,owner_id,now(),now());
 insert into portal_private.owners(user_id) values(owner_id);
 perform set_config('request.jwt.claims',jsonb_build_object('sub',owner_id,'session_id',session_id,'role','authenticated','aal','aal2')::text,true);
 first_link:=public.insights_owner('invite')->>'token';
 second_link:=public.insights_owner('invite')->>'token';
 submission:=public.insights_contributor('get',first_link);
 first_id:=(submission->>'id')::uuid;
 second_id:=(public.insights_contributor('get',second_link)->>'id')::uuid;
 draft:=submission->'draft'||jsonb_build_object('title','Synthetic staging only','standfirst','Verification fixture','body','A private article.',
 'quick',true,'summary','A short version.','permission',true,'privateTestField','never expose',
 'profile',jsonb_build_object('name','Staging test','company','Example','jobTitle','Editor','bio','An example biography.','companyUrl','','linkedinUrl','','headshot',jpeg),
 'images',jsonb_build_array(jsonb_build_object('src',jpeg,'alt','Synthetic image','caption','Testing','credit','Example','placement','cover','permission',true)));
 perform set_config('request.jwt.claims','{}',true);
 begin
  perform public.insights_owner('list');
  raise exception 'Unauthorised contributor opened editorial tools';
 exception when insufficient_privilege then null;
 end;
 submission:=public.insights_contributor('save',first_link,jsonb_build_object('revision',0,'id',second_id,'draft',draft));
 if (submission->>'id')::uuid<>first_id or public.insights_contributor('get',second_link)#>>'{draft,title}'<>'' then raise exception 'Invitation isolation failed'; end if;
 if public.insights_contributor('get',first_link)#>>'{draft,images,0,alt}' is distinct from 'Synthetic image' then raise exception 'Draft image was not persisted'; end if;
 begin
  perform public.insights_contributor('save',first_link,jsonb_build_object('revision',0,'draft',draft));
  raise exception 'Stale revision accepted';
 exception when raise_exception then if sqlerrm<>'stale_or_locked' then raise; end if;
 end;
 perform public.insights_contributor('submit',first_link,jsonb_build_object('revision',1,'draft',draft));
 perform set_config('request.jwt.claims',jsonb_build_object('sub',owner_id,'session_id',session_id,'role','authenticated','aal','aal2')::text,true);
 perform public.insights_owner('return',jsonb_build_object('id',first_id,'revision',2,'feedback','Please clarify the introduction.'));
 if public.insights_contributor('get',first_link)->>'feedback' is distinct from 'Please clarify the introduction.' then raise exception 'Feedback missing'; end if;
 perform public.insights_contributor('submit',first_link,jsonb_build_object('revision',3,'draft',draft));
 perform public.insights_owner('approve',jsonb_build_object('id',first_id,'revision',4));
 slug:='contributor-'||first_id;
 if public.insights_published(slug)<>'[]'::jsonb then raise exception 'Approval published article'; end if;
 perform public.insights_owner('publish',jsonb_build_object('id',first_id,'revision',5));
 article:=public.insights_published(slug)->0;
 if article->>'title' is distinct from 'Synthetic staging only' or article ?| array['privateTestField','token','feedback','permission'] or article->'images'->0 ? 'permission' then raise exception 'Public projection failed'; end if;
 perform public.insights_owner('unpublish',jsonb_build_object('id',first_id,'revision',6));
 if public.insights_published(slug)<>'[]'::jsonb then raise exception 'Unpublication failed'; end if;
 perform public.insights_owner('revoke',jsonb_build_object('id',first_id,'revision',7));
 begin
  perform public.insights_contributor('get',first_link);
  raise exception 'Revoked invitation accepted';
 exception when raise_exception then if sqlerrm<>'invalid_link' then raise; end if;
 end;
 update portal_private.insights_submissions set expires_at=now()-interval '1 minute' where id=second_id;
 begin
  perform public.insights_contributor('get',second_link);
  raise exception 'Expired invitation accepted';
 exception when raise_exception then if sqlerrm<>'invalid_link' then raise; end if;
 end;
 renewed:=public.insights_owner('renew',jsonb_build_object('id',second_id,'revision',0))->>'token';
 if (public.insights_contributor('get',renewed)->>'id')::uuid<>second_id then raise exception 'Renewal changed the record'; end if;
 if (select count(*) from portal_private.insights_revisions where submission_id=first_id)<>9 then raise exception 'Revision history incomplete'; end if;
end $$;
rollback;
select 'PASS: grant isolation, separate invitations, draft with image, stale revision, amendments, explicit publish and unpublish, public projection, revoke, expire, renew, history' as result;
