begin;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('offair-panel-recordings', 'offair-panel-recordings', false, 52428800,
  array['audio/mp4', 'audio/x-m4a', 'audio/m4a', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']);

create function portal_private.can_read_offair_recording(p_name text)
returns boolean language plpgsql security definer set search_path = '' as $$
declare
  partner uuid;
  panel text := split_part(p_name, '.', 1);
begin
  if p_name !~ '^(the-debrief|ai-survival-guide|faultline-futures)\.(m4a|docx)$' then
    return false;
  end if;
  if (select count(*) from storage.objects
      where bucket_id = 'offair-panel-recordings' and name in (panel || '.m4a', panel || '.docx')) <> 2 then
    return false;
  end if;
  if exists (select 1 from portal_private.owners where user_id = auth.uid() and active) then
    perform portal_private.require_gallery_reader(null);
    return true;
  end if;
  for partner in select sponsor_id from portal_private.memberships where user_id = auth.uid() and active loop
    begin
      perform portal_private.require_gallery_reader(partner);
      return true;
    exception when insufficient_privilege then
      continue;
    end;
  end loop;
  return false;
exception when insufficient_privilege then
  return false;
end;
$$;

revoke all on function portal_private.can_read_offair_recording(text) from public, anon, authenticated;
grant execute on function portal_private.can_read_offair_recording(text) to authenticated;

create policy "OFF AIR panel media readers" on storage.objects
for select to authenticated
using (bucket_id = 'offair-panel-recordings' and portal_private.can_read_offair_recording(name));

create function public.portal_offair_panel_recordings(p_partner uuid)
returns text[] language plpgsql security definer set search_path = '' as $$
begin
  perform portal_private.require_gallery_reader(p_partner);
  return array(
    select panel
    from unnest(array['the-debrief', 'ai-survival-guide', 'faultline-futures']) as panels(panel)
    where (select count(*) from storage.objects
      where bucket_id = 'offair-panel-recordings' and name in (panel || '.m4a', panel || '.docx')) = 2
  );
end;
$$;

revoke all on function public.portal_offair_panel_recordings(uuid) from public, anon, authenticated;
grant execute on function public.portal_offair_panel_recordings(uuid) to authenticated;

commit;
