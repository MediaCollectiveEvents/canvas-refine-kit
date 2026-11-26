begin;
create function portal_private.mpts_gallery_allowed(p_path text,p_upload boolean) returns boolean
language plpgsql security definer set search_path='' as $$
declare image portal_private.gallery_images%rowtype; sponsor uuid;
begin
 select * into image from portal_private.gallery_images where event_id='mpts-reception-2027' and path=p_path;
 if not found then return false;end if;
 if p_upload and (image.uploaded_by is distinct from auth.uid() or image.published or image.created_at<=now()-interval '1 hour') then return false;end if;
 if exists(select 1 from portal_private.owners where user_id=auth.uid() and active) then
  perform portal_private.require_owner();
  return p_upload or image.published;
 end if;
 if (p_upload and image.kind<>'gallery') or (not p_upload and (not image.published or image.archived_at is not null)) then return false;end if;
 for sponsor in select sponsor_id from portal_private.memberships where user_id=auth.uid() and active loop
  begin
   perform portal_private.require_mpts_report(sponsor);
   return true;
  exception when insufficient_privilege then null;
  end;
 end loop;
 return false;
exception when insufficient_privilege then return false;
end $$;

revoke all on function portal_private.mpts_gallery_allowed(text,boolean) from public,anon,authenticated;
grant execute on function portal_private.mpts_gallery_allowed(text,boolean) to authenticated;
create policy "MPTS image upload" on storage.objects for insert to authenticated
 with check(bucket_id='event-gallery-private' and portal_private.mpts_gallery_allowed(name,true));
create policy "MPTS image read" on storage.objects for select to authenticated
 using(bucket_id='event-gallery-private' and portal_private.mpts_gallery_allowed(name,false));
create policy "MPTS image upload guard" on storage.objects as restrictive for insert to authenticated
 with check(bucket_id<>'event-gallery-private' or name not like 'mpts-reception-2027/%' or portal_private.mpts_gallery_allowed(name,true));
create policy "MPTS image read guard" on storage.objects as restrictive for select to authenticated
 using(bucket_id<>'event-gallery-private' or name not like 'mpts-reception-2027/%' or portal_private.mpts_gallery_allowed(name,false));

create function public.portal_mpts_media(p_action text,p_sponsor uuid default null,p_data jsonb default '{}'::jsonb) returns jsonb
language plpgsql security definer set search_path='' as $$
declare
 event_key constant text:='mpts-reception-2027';
 actor uuid;
 item uuid;
 destination text;
 kind_value text:=p_data->>'kind';
 mime text:=p_data->>'mime';
 filename_value text:=p_data->>'filename';
 caption_value text:=p_data->>'caption';
 size_value bigint;
 extension text;
begin
 actor:=portal_private.require_mpts_report(p_sponsor);
 if p_action='list' then
  return jsonb_build_object('images',coalesce((
   select jsonb_agg(jsonb_build_object('id',g.id,'path',g.path,'filename',g.filename,'caption',g.caption,
    'createdAt',g.created_at,'size',g.size_bytes,'archivedAt',g.archived_at) order by g.created_at desc)
   from portal_private.gallery_images g where g.event_id=event_key and g.published and g.kind=kind_value
    and (p_sponsor is null or g.archived_at is null)), '[]'::jsonb));
 elsif p_action='reserve' then
  if p_sponsor is not null and kind_value is distinct from 'gallery' then
   raise exception using errcode='42501',message='mpts_action_not_authorised';
  end if;
  size_value:=(p_data->>'size')::bigint;
  extension:=case mime when 'image/jpeg' then '.jpg' when 'image/png' then '.png' when 'image/webp' then '.webp' end;
  if extension is null or size_value is null or size_value not between 1 and 10485760
   or filename_value is null or length(filename_value) not between 1 and 180 or filename_value~'[[:cntrl:]/\\]'
   or caption_value is null or length(caption_value)>300 or kind_value is null or kind_value not in ('gallery','marketing') then
   raise exception 'invalid_gallery_image';
  end if;
  item:=gen_random_uuid();
  destination:=event_key||'/gallery/'||item::text||extension;
  insert into portal_private.gallery_images(id,event_id,path,filename,caption,content_type,size_bytes,uploaded_by,kind)
   values(item,event_key,destination,filename_value,caption_value,mime,size_value,actor,kind_value);
  return jsonb_build_object('id',item,'path',destination);
 elsif p_action='publish' then
  item:=(p_data->>'id')::uuid;
  update portal_private.gallery_images g set published=true
   where g.id=item and g.event_id=event_key and portal_private.mpts_gallery_allowed(g.path,true)
    and exists(select 1 from storage.objects o where o.bucket_id='event-gallery-private' and o.name=g.path
     and (o.metadata->>'size')::bigint=g.size_bytes and o.metadata->>'mimetype'=g.content_type);
  if not found then raise exception 'gallery_upload_incomplete';end if;
  insert into portal_private.audit(actor,event_id,action) values(actor,event_key,'gallery_image_published');
  return '{}'::jsonb;
 elsif p_action='archive' and p_sponsor is null then
  item:=(p_data->>'id')::uuid;
  if jsonb_typeof(p_data->'archived') is distinct from 'boolean' then raise exception 'invalid_gallery_image';end if;
  update portal_private.gallery_images set archived_at=case when (p_data->>'archived')::boolean then now() else null end
   where id=item and event_id=event_key and published;
  if not found then raise exception 'gallery_image_unavailable';end if;
  return '{}'::jsonb;
 end if;
 raise exception using errcode='42501',message='mpts_action_not_authorised';
end $$;
revoke all on function public.portal_mpts_media(text,uuid,jsonb) from public,anon;
grant execute on function public.portal_mpts_media(text,uuid,jsonb) to authenticated;
commit;
