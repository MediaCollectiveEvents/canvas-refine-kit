begin;
create function portal_private.validate_insights_taxonomy_write() returns trigger language plpgsql security definer set search_path='' as $$
declare field text; expected_kind text; assigned text; vals jsonb;
begin
  if (new.draft is not distinct from old.draft and new.status=old.status) or not (new.draft ? 'keywordIds') then return new;end if;
  foreach field in array array['selected','keywordIds'] loop
    expected_kind:=case field when 'selected' then 'theme' else 'keyword' end;
    vals:=new.draft->field;
    if jsonb_typeof(vals) is distinct from 'array' or jsonb_array_length(vals)>30 then raise exception 'invalid_taxonomy_selection';end if;
    for assigned in select jsonb_array_elements_text(vals) loop
      if not exists(select from portal_private.taxonomy_active_versions v where v.term_id=assigned and v.snapshot->>'kind'=expected_kind)
          and (new.status<>'draft' or not coalesce((old.draft->field) @> jsonb_build_array(assigned),false))
      then raise exception 'inactive_or_unknown_insights_term';end if;
    end loop;
  end loop;
  return new;
end $$;
revoke all on function portal_private.validate_insights_taxonomy_write() from public,anon,authenticated;
create trigger insights_taxonomy_write before update of draft on portal_private.insights_submissions
for each row execute function portal_private.validate_insights_taxonomy_write();

create function portal_private.taxonomy_assignment_layer() returns trigger language plpgsql set search_path='' as $$
declare term_kind text;
begin
  select t.kind into term_kind from portal_private.taxonomy_terms t where t.id=new.term_id;
  if new.relationship='professional_area' and term_kind<>'area' then raise exception 'functional_area_required';end if;
  if new.relationship in ('verified_expertise','declared_interest') and term_kind='area' then raise exception 'separate_functional_area_required';end if;
  return new;
end $$;
revoke all on function portal_private.taxonomy_assignment_layer() from public,anon,authenticated;
create trigger taxonomy_assignment_layer before insert or update on portal_private.taxonomy_assignments
for each row execute function portal_private.taxonomy_assignment_layer();

create function portal_private.insights_taxonomy_projection() returns trigger language plpgsql security definer set search_path='' as $$
declare draft jsonb;
begin
  if TG_OP='DELETE' then
    delete from portal_private.taxonomy_assignments where entity_type='article' and entity_id=old.slug and relationship='editorial_tag';
    return old;
  end if;
  select s.draft into draft from portal_private.insights_submissions s where s.id=new.submission_id;
  if draft ? 'keywordIds' then
    if exists(
      select from jsonb_array_elements_text(draft->'keywordIds') k
      where not exists(select from portal_private.taxonomy_active_versions v where v.term_id=k and v.snapshot->>'kind'='keyword')
    ) or exists(
      select from jsonb_array_elements_text(draft->'selected') k
      where not exists(select from portal_private.taxonomy_active_versions v where v.term_id=k and v.snapshot->>'kind'='theme')
    ) then raise exception 'inactive_or_unknown_insights_term';end if;
    new.article:=new.article||jsonb_build_object('keywordIds',draft->'keywordIds');
  end if;
  delete from portal_private.taxonomy_assignments where entity_type='article' and entity_id=new.slug and relationship='editorial_tag';
  insert into portal_private.taxonomy_assignments(term_id,entity_type,entity_id,relationship,created_by)
  select distinct t.id,'article',new.slug,'editorial_tag',auth.uid()
  from jsonb_array_elements_text(coalesce(draft->'keywordIds','[]'::jsonb)||coalesce(draft->'selected','[]'::jsonb)) tag
  join portal_private.taxonomy_terms t on t.id=tag and t.kind in ('keyword','theme');
  return new;
end $$;
revoke all on function portal_private.insights_taxonomy_projection() from public,anon,authenticated;
create trigger insights_taxonomy_projection before insert or update or delete on portal_private.insights_publications
for each row execute function portal_private.insights_taxonomy_projection();
commit;
