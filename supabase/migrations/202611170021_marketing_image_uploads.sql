begin;
alter table portal_private.gallery_images add column kind text not null default 'gallery' check(kind in ('gallery','marketing'));
create function public.portal_marketing_reserve(p_filename text,p_caption text,p_type text,p_size bigint) returns jsonb language plpgsql security definer set search_path='' as $$
declare item jsonb;
begin
 perform portal_private.require_owner();
 item:=public.portal_gallery_reserve(p_filename,p_caption,p_type,p_size);
 update portal_private.gallery_images set kind='marketing' where id=(item->>'id')::uuid;
 return item;
end $$;
create function public.portal_marketing_list(p_partner uuid default null) returns jsonb language plpgsql security definer set search_path='' as $$
begin
 perform portal_private.require_gallery_reader(p_partner);
 return jsonb_build_object('images',(select coalesce(jsonb_agg(jsonb_build_object('id',id,'path',path,'filename',filename,'caption',caption,'createdAt',created_at,'size',size_bytes,'archivedAt',archived_at) order by created_at desc),'[]') from portal_private.gallery_images where published and event_id='off-air' and kind='marketing' and (archived_at is null or p_partner is null)));
end $$;
create or replace function public.portal_gallery_list(p_partner uuid default null) returns jsonb language plpgsql security definer set search_path='' as $$
begin
 perform portal_private.require_gallery_reader(p_partner);
 return jsonb_build_object('images',(select coalesce(jsonb_agg(jsonb_build_object('id',id,'path',path,'filename',filename,'caption',caption,'createdAt',created_at,'size',size_bytes,'archivedAt',archived_at) order by created_at desc),'[]') from portal_private.gallery_images where published and kind='gallery' and event_id='off-air' and (archived_at is null or p_partner is null)));
end $$;
create or replace function portal_private.can_upload_gallery(p_path text) returns boolean language plpgsql security definer set search_path='' as $$
declare partner uuid;
begin
 if not exists(select 1 from portal_private.gallery_images where path=p_path and uploaded_by=auth.uid() and not published and created_at>now()-interval '1 hour') then return false;end if;
 if exists(select 1 from portal_private.owners where user_id=auth.uid() and active) then perform portal_private.require_owner();return true;end if;
 if exists(select 1 from portal_private.gallery_images where path=p_path and kind='marketing') then return false;end if;
 for partner in select sponsor_id from portal_private.memberships where user_id=auth.uid() and active loop
 begin perform portal_private.require_gallery_reader(partner);return true;exception when insufficient_privilege then null;end;
 end loop;return false;
exception when insufficient_privilege then return false;end $$;
revoke all on function public.portal_marketing_list(uuid),public.portal_marketing_reserve(text,text,text,bigint) from public,anon,authenticated;
grant execute on function public.portal_marketing_list(uuid),public.portal_marketing_reserve(text,text,text,bigint) to authenticated;
commit;
