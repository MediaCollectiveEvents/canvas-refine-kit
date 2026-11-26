begin;
create table portal_private.gallery_images(
 id uuid primary key default gen_random_uuid(),event_id text not null default 'off-air' references portal_private.events(id),
 path text unique not null,filename text not null check(length(filename) between 1 and 180),caption text not null default '' check(length(caption)<=300),
 content_type text not null check(content_type in ('image/jpeg','image/png','image/webp')),size_bytes bigint not null check(size_bytes between 1 and 10485760),
 uploaded_by uuid not null references auth.users(id),created_at timestamptz not null default now(),published boolean not null default false
);
alter table portal_private.gallery_images enable row level security;
revoke all on portal_private.gallery_images from public,anon,authenticated;
insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types) values('event-gallery-private','event-gallery-private',false,10485760,array['image/jpeg','image/png','image/webp']);
create function portal_private.require_gallery_reader(p_partner uuid) returns void language plpgsql security definer set search_path='' as $$
begin
 if p_partner is null then perform portal_private.require_owner();else
 perform portal_private.require_sponsor('off-air',p_partner);
 if not exists(select 1 from portal_private.terms_acceptance where user_id=auth.uid() and terms_version='off-air-2026-11-16-v2') then raise exception using errcode='42501',message='terms_required';end if;
 end if;
end $$;
revoke all on function portal_private.require_gallery_reader(uuid) from public,anon,authenticated;
create function public.portal_gallery_list(p_partner uuid default null) returns jsonb language plpgsql security definer set search_path='' as $$
begin
 perform portal_private.require_gallery_reader(p_partner);
 return jsonb_build_object('images',(select coalesce(jsonb_agg(jsonb_build_object('id',id,'path',path,'filename',filename,'caption',caption,'createdAt',created_at,'size',size_bytes) order by created_at desc),'[]') from portal_private.gallery_images where published and event_id='off-air'));
end $$;
create function public.portal_gallery_reserve(p_filename text,p_caption text,p_type text,p_size bigint) returns jsonb language plpgsql security definer set search_path='' as $$
declare actor uuid; item uuid:=gen_random_uuid(); dest text;ext text;
begin
 actor:=portal_private.require_owner();
 if p_type not in ('image/jpeg','image/png','image/webp') or p_size is null or p_size<1 or p_size>10485760 or p_filename is null or length(p_filename) not between 1 and 180 or p_filename~'[[:cntrl:]/\\]' or p_caption is null or length(p_caption)>300 then raise exception 'invalid_gallery_image';end if;
 ext:=case p_type when 'image/jpeg' then '.jpg' when 'image/png' then '.png' when 'image/webp' then '.webp' else null end;
 if ext is null then raise exception 'invalid_gallery_image';end if;
 dest:='off-air/gallery/'||item::text||ext;
 insert into portal_private.gallery_images(id,path,filename,caption,content_type,size_bytes,uploaded_by) values(item,dest,p_filename,p_caption,p_type,p_size,actor);
 return jsonb_build_object('id',item,'path',dest);
end $$;
create function portal_private.can_upload_gallery(p_path text) returns boolean language plpgsql security definer set search_path='' as $$
begin
 perform portal_private.require_owner();
 return exists(select 1 from portal_private.gallery_images where path=p_path and uploaded_by=auth.uid() and not published and created_at>now()-interval '1 hour');
exception when insufficient_privilege then return false;end $$;
create function portal_private.can_read_gallery(p_path text) returns boolean language plpgsql security definer set search_path='' as $$
declare partner uuid;
begin
 if not exists(select 1 from portal_private.gallery_images where path=p_path and published and event_id='off-air') then return false;end if;
 if exists(select 1 from portal_private.owners where user_id=auth.uid() and active) then perform portal_private.require_owner();return true;end if;
 for partner in select sponsor_id from portal_private.memberships where user_id=auth.uid() and active loop
 begin perform portal_private.require_gallery_reader(partner);return true;exception when insufficient_privilege then null;end;
 end loop;return false;
exception when insufficient_privilege then return false;end $$;
revoke all on function portal_private.can_upload_gallery(text),portal_private.can_read_gallery(text) from public,anon,authenticated;
grant execute on function portal_private.can_upload_gallery(text),portal_private.can_read_gallery(text) to authenticated;
create policy "Owner gallery uploads" on storage.objects for insert to authenticated with check(bucket_id='event-gallery-private' and portal_private.can_upload_gallery(name));
create policy "Authorised gallery downloads" on storage.objects for select to authenticated using(bucket_id='event-gallery-private' and portal_private.can_read_gallery(name));
create function public.portal_gallery_publish(p_id uuid) returns void language plpgsql security definer set search_path='' as $$
declare actor uuid;
begin
 actor:=portal_private.require_owner();
 update portal_private.gallery_images g set published=true where g.id=p_id and g.uploaded_by=actor and not g.published and exists(select 1 from storage.objects o where o.bucket_id='event-gallery-private' and o.name=g.path and (o.metadata->>'size')::bigint=g.size_bytes and o.metadata->>'mimetype'=g.content_type);
 if not found then raise exception 'gallery_upload_incomplete';end if;
 insert into portal_private.audit(actor,event_id,action) values(actor,'off-air','gallery_image_published');
end $$;
revoke all on function public.portal_gallery_list(uuid),public.portal_gallery_reserve(text,text,text,bigint),public.portal_gallery_publish(uuid) from public,anon,authenticated;
grant execute on function public.portal_gallery_list(uuid),public.portal_gallery_reserve(text,text,text,bigint),public.portal_gallery_publish(uuid) to authenticated;
create or replace function public.portal_owner_recovery_export() returns jsonb
language plpgsql security definer set search_path='' as $$
declare actor uuid;table_name text;content jsonb:='{}'::jsonb;records jsonb;
begin
 actor:=portal_private.require_owner();
 -- Only portal business records. Never export password hashes, MFA factors, sessions, tokens or bridge/job keys.
 foreach table_name in array array['events','owners','sponsors','memberships','event_access','terms_acceptance','report_versions','report_current','introduction_requests','collateral','audit','registration_links','invitation_requests','gallery_images'] loop
  execute format('select coalesce(jsonb_agg(to_jsonb(t)),''[]''::jsonb) from portal_private.%I t',table_name) into records;
  content:=content||jsonb_build_object(table_name,records);
 end loop;
 insert into portal_private.audit(actor,event_id,action) values(actor,'off-air','owner_recovery_export');
 return jsonb_build_object('format','media-collective-portal-recovery','version',1,'exportedAt',now(),'migration','202611170018',
 'tables',content,'identityMap',(select coalesce(jsonb_agg(jsonb_build_object('id',a.id,'email',a.email)),'[]') from auth.users a where exists(select 1 from portal_private.owners o where o.user_id=a.id) or exists(select 1 from portal_private.memberships m where m.user_id=a.id)),
 'limitations',jsonb_build_array('Portal recovery export, not a complete PostgreSQL or Auth backup.','Passwords, authenticators, session tokens, provider secrets and bridge keys are excluded.','Recover accounts and reconnect provider credentials separately after a total project loss.'));
end $$;
revoke all on function public.portal_owner_recovery_export() from public,anon,authenticated;
grant execute on function public.portal_owner_recovery_export() to authenticated;
commit;
