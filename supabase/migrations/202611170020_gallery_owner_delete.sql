begin;
alter table portal_private.gallery_images add column archived_at timestamptz;
create or replace function public.portal_gallery_list(p_partner uuid default null) returns jsonb language plpgsql security definer set search_path='' as $$
begin
 perform portal_private.require_gallery_reader(p_partner);
 return jsonb_build_object('images',(select coalesce(jsonb_agg(jsonb_build_object('id',id,'path',path,'filename',filename,'caption',caption,'createdAt',created_at,'size',size_bytes,'archivedAt',archived_at) order by created_at desc),'[]') from portal_private.gallery_images where published and event_id='off-air' and (archived_at is null or p_partner is null)));
end $$;
create or replace function portal_private.can_read_gallery(p_path text) returns boolean language plpgsql security definer set search_path='' as $$
declare partner uuid;archived timestamptz;
begin
 select archived_at into archived from portal_private.gallery_images where path=p_path and published and event_id='off-air';
 if not found then return false;end if;
 if exists(select 1 from portal_private.owners where user_id=auth.uid() and active) then perform portal_private.require_owner();return true;end if;
 if archived is not null then return false;end if;
 for partner in select sponsor_id from portal_private.memberships where user_id=auth.uid() and active loop
 begin perform portal_private.require_gallery_reader(partner);return true;exception when insufficient_privilege then null;end;
 end loop;return false;
exception when insufficient_privilege then return false;end $$;
create function public.portal_gallery_archive(p_id uuid,p_remove boolean default true) returns void language plpgsql security definer set search_path='' as $$
declare actor uuid;
begin
 actor:=portal_private.require_owner();
 if p_remove is null then raise exception 'invalid_archive_action';end if;
 update portal_private.gallery_images set archived_at=case when p_remove then now() else null end where id=p_id and published and event_id='off-air';
 if not found then raise exception 'gallery_image_not_found';end if;
 insert into portal_private.audit(actor,event_id,action) values(actor,'off-air',case when p_remove then 'gallery_image_archived' else 'gallery_image_restored' end);
end $$;
revoke all on function public.portal_gallery_archive(uuid,boolean) from public,anon,authenticated;
grant execute on function public.portal_gallery_archive(uuid,boolean) to authenticated;
commit;
