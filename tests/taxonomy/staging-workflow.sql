begin;
do $test$
declare
 owner_id uuid:=gen_random_uuid(); session_id uuid:=gen_random_uuid(); link_key text; item jsonb; sid uuid; created jsonb; keyword constant text:='staging-fixture-taxonomy-keyword';
begin
 if (select count(*) from portal_private.taxonomy_terms where kind='area')<>7
 or (select count(*) from portal_private.taxonomy_terms where kind='theme')<>16
 or (select count(*) from portal_private.taxonomy_terms where kind='keyword')<>66 then raise exception 'Seed counts differ';end if;
 if (select count(*) from portal_private.taxonomy_terms where original_status='recovered-pending-approval')<>30
 or (select count(*) from portal_private.taxonomy_terms where kind='keyword' and original_status='proposed')<>36 then raise exception 'Source statuses lost';end if;
 if (select count(*) from portal_private.taxonomy_active_versions)<>20 or jsonb_array_length(public.taxonomy_active())<>20 then raise exception 'Unapproved terms are selectable';end if;
 if public.taxonomy_resolve('ai-automation','keyword')->>'id' is distinct from 'ai-powered-automation'
 or public.taxonomy_resolve('ai-automation','theme')->>'id' is distinct from 'ai-automation' then raise exception 'Historical identifier collision';end if;
 if not exists(select from portal_private.taxonomy_historical_events where legacy_keyword='ai-automation') then raise exception 'Historical event mappings missing';end if;
 if exists(select from portal_private.taxonomy_relationships r join portal_private.taxonomy_terms k on k.id=r.keyword_id join portal_private.taxonomy_terms t on t.id=r.theme_id where k.kind<>'keyword' or t.kind<>'theme') then raise exception 'Invalid theme association';end if;
 if has_function_privilege('anon','public.taxonomy_owner(text,jsonb)','EXECUTE') or has_table_privilege('authenticated','portal_private.taxonomy_terms','UPDATE') then raise exception 'Unauthorised writes possible';end if;

 insert into auth.users(id,email,email_confirmed_at,aud,role) values(owner_id,owner_id||'@example.invalid',now(),'authenticated','authenticated');
 insert into auth.sessions(id,user_id,created_at,updated_at) values(session_id,owner_id,now(),now());
 insert into portal_private.owners(user_id) values(owner_id);
 perform set_config('request.jwt.claims',jsonb_build_object('sub',owner_id,'session_id',session_id,'role','authenticated','aal','aal2')::text,true);
 link_key:=public.insights_owner('invite')->>'token';
 item:=public.insights_contributor('get',link_key);
 sid:=(item->>'id')::uuid;
 perform set_config('request.jwt.claims','{}',true);
 begin
  perform public.taxonomy_owner('list');
  raise exception 'Unauthorised access';
 exception when insufficient_privilege then null;end;
 perform public.taxonomy_suggest(link_key,'Controlled proposed term','Staging synthetic evidence');
 if not exists(select from portal_private.taxonomy_suggestions where submission_id=sid and status='proposed')
 or exists(select from jsonb_array_elements(public.taxonomy_active()) v where v->>'label'='Controlled proposed term') then raise exception 'Suggestion leaked';end if;

 perform set_config('request.jwt.claims',jsonb_build_object('sub',owner_id,'session_id',session_id,'role','authenticated','aal','aal2')::text,true);
 created:=jsonb_build_object('id',keyword,'kind','keyword','label','Synthetic glossary term','description','Fixture definition','aliases',jsonb_build_array('synthetic alias'),'themeIds',jsonb_build_array('streaming'));
 begin
  perform public.taxonomy_owner('create',created||'{"themeIds":["production"]}');
  raise exception 'Area used as keyword theme';
 exception when raise_exception then if sqlerrm<>'invalid_keyword_themes' then raise;end if;end;
 perform public.taxonomy_owner('create',created);
 begin
  perform public.taxonomy_owner('create',created||'{"id":"fixture-duplicate","label":"Synthetic alias","aliases":[]}');
  raise exception 'Duplicate alias allowed';
 exception when raise_exception then if sqlerrm<>'duplicate_term_or_alias' then raise;end if;end;
 begin
  perform public.insights_contributor('save',link_key,jsonb_build_object('revision',0,'draft',item->'draft'||jsonb_build_object('keywordIds',jsonb_build_array(keyword))));
  raise exception 'Proposed keyword accepted in an article';
 exception when raise_exception then if sqlerrm<>'inactive_or_unknown_insights_term' then raise;end if;end;
 perform public.taxonomy_owner('approve_many',jsonb_build_object('terms',jsonb_build_array(jsonb_build_object('id',keyword,'revision',0))));
 if public.taxonomy_resolve(keyword,'keyword') is not null then raise exception 'Approval activated term';end if;
 begin
  perform public.taxonomy_owner('activate',jsonb_build_object('id',keyword,'revision',0));
  raise exception 'Stale revision accepted';
 exception when raise_exception then if sqlerrm<>'stale_taxonomy_revision' then raise;end if;end;
 perform public.taxonomy_owner('activate',jsonb_build_object('id',keyword,'revision',1));
 if public.taxonomy_resolve('synthetic alias','keyword')->>'id' is distinct from keyword then raise exception 'Alias did not resolve';end if;
 item:=public.insights_contributor('save',link_key,jsonb_build_object('revision',0,'draft',item->'draft'||jsonb_build_object('keywordIds',jsonb_build_array(keyword),'selected',jsonb_build_array('streaming'))));
 if item#>>'{draft,keywordIds,0}' is distinct from keyword then raise exception 'Selected keyword did not persist';end if;
 perform public.taxonomy_owner('edit',created||'{"revision":2,"label":"Changed draft label"}');
 if public.taxonomy_resolve(keyword,'keyword')->>'label' is distinct from 'Synthetic glossary term' then raise exception 'Unapproved draft edits went live';end if;
 perform public.taxonomy_owner('retire',jsonb_build_object('id',keyword,'revision',3));
 if public.taxonomy_resolve(keyword,'keyword')->>'status' is distinct from 'retired'
 or exists(select from jsonb_array_elements(public.taxonomy_active()) v where v->>'id'=keyword) then raise exception 'Retired term still selectable';end if;
 if jsonb_array_length(public.taxonomy_owner('history',jsonb_build_object('id',keyword))->'rows')<>5 then raise exception 'History missing';end if;
end $test$;
rollback;
select 'PASS: all 89 seed terms, provenance, compatibility, permissions, suggestions, approval, activation, concurrency, draft snapshot, retirement and Insights' as result;
