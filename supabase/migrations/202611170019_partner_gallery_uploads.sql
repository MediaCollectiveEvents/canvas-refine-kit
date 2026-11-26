begin;
create function public.portal_gallery_reserve_partner(p_partner uuid,p_filename text,p_caption text,p_type text,p_size bigint) returns jsonb language plpgsql security definer set search_path='' as $$
declare actor uuid; item uuid:=gen_random_uuid(); dest text;ext text;
begin
 perform portal_private.require_gallery_reader(p_partner);
 actor:=auth.uid();
 if p_type not in ('image/jpeg','image/png','image/webp') or p_size is null or p_size<1 or p_size>10485760 or p_filename is null or length(p_filename) not between 1 and 180 or p_filename~'[[:cntrl:]/\\]' or p_caption is null or length(p_caption)>300 then raise exception 'invalid_gallery_image';end if;
 ext:=case p_type when 'image/jpeg' then '.jpg' when 'image/png' then '.png' when 'image/webp' then '.webp' else null end;
 if ext is null then raise exception 'invalid_gallery_image';end if;
 dest:='off-air/gallery/'||item::text||ext;
 insert into portal_private.gallery_images(id,path,filename,caption,content_type,size_bytes,uploaded_by) values(item,dest,p_filename,p_caption,p_type,p_size,actor);
 return jsonb_build_object('id',item,'path',dest);
end $$;
create or replace function portal_private.can_upload_gallery(p_path text) returns boolean language plpgsql security definer set search_path='' as $$
declare partner uuid;
begin
 if not exists(select 1 from portal_private.gallery_images where path=p_path and uploaded_by=auth.uid() and not published and created_at>now()-interval '1 hour') then return false;end if;
 if exists(select 1 from portal_private.owners where user_id=auth.uid() and active) then perform portal_private.require_owner();return true;end if;
 for partner in select sponsor_id from portal_private.memberships where user_id=auth.uid() and active loop
 begin perform portal_private.require_gallery_reader(partner);return true;exception when insufficient_privilege then null;end;
 end loop;return false;
exception when insufficient_privilege then return false;end $$;
create or replace function public.portal_gallery_publish(p_id uuid) returns void language plpgsql security definer set search_path='' as $$
declare actor uuid;
begin
 actor:=auth.uid();
 if actor is null or not exists(select 1 from portal_private.gallery_images where id=p_id and portal_private.can_upload_gallery(path)) then raise exception using errcode='42501',message='gallery_upload_not_authorised';end if;
 update portal_private.gallery_images g set published=true where g.id=p_id and g.uploaded_by=actor and not g.published and exists(select 1 from storage.objects o where o.bucket_id='event-gallery-private' and o.name=g.path and (o.metadata->>'size')::bigint=g.size_bytes and o.metadata->>'mimetype'=g.content_type);
 if not found then raise exception 'gallery_upload_incomplete';end if;
 insert into portal_private.audit(actor,event_id,action) values(actor,'off-air','gallery_image_published');
end $$;
revoke all on function public.portal_gallery_reserve_partner(uuid,text,text,text,bigint) from public,anon,authenticated;
grant execute on function public.portal_gallery_reserve_partner(uuid,text,text,text,bigint) to authenticated;
commit;
