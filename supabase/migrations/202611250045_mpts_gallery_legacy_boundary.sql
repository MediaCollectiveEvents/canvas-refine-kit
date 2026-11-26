begin;
-- Legacy publication is only for OFF AIR reservations.
create or replace function public.portal_gallery_publish(p_id uuid) returns void language plpgsql security definer set search_path='' as $$
declare actor uuid;
begin
 actor:=auth.uid();
 if actor is null or not exists(select 1 from portal_private.gallery_images where id=p_id and event_id='off-air' and portal_private.can_upload_gallery(path)) then raise exception using errcode='42501',message='gallery_upload_not_authorised';end if;
 update portal_private.gallery_images g set published=true where g.id=p_id and g.event_id='off-air' and g.uploaded_by=actor and not g.published and exists(select 1 from storage.objects o where o.bucket_id='event-gallery-private' and o.name=g.path and (o.metadata->>'size')::bigint=g.size_bytes and o.metadata->>'mimetype'=g.content_type);
 if not found then raise exception 'gallery_upload_incomplete';end if;
 insert into portal_private.audit(actor,event_id,action) values(actor,'off-air','gallery_image_published');
end $$;
commit;
