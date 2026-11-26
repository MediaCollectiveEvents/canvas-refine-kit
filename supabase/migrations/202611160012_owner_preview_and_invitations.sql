begin;
create table portal_private.invitation_bridge(
 event_id text primary key references portal_private.events(id),
 key_hash text not null,
 active boolean not null default true,
 issued_by uuid not null references auth.users(id),
 issued_at timestamptz not null default now()
);
create table portal_private.invitation_requests(
 event_id text not null references portal_private.events(id),
 source_ref text not null check(source_ref ~ '^[a-f0-9]{64}$'),
 full_name text not null,
 company text not null,
 email text not null,
 event_label text not null,
 engagement text not null,
 requested_at timestamptz not null,
 received_at timestamptz not null default now(),
 status text not null default 'Requested' check(status in ('Requested','Reviewed','Invited','Declined')),
 primary key(event_id,source_ref)
);
alter table portal_private.invitation_bridge enable row level security;
alter table portal_private.invitation_requests enable row level security;
revoke all on portal_private.invitation_bridge,portal_private.invitation_requests from public,anon,authenticated;
create function public.portal_owner_invitations() returns jsonb
language plpgsql security definer set search_path='' as $$
begin
 perform portal_private.require_owner();
 return jsonb_build_object('configured',exists(select 1 from portal_private.invitation_bridge where event_id='off-air' and active),
 'rows',coalesce((select jsonb_agg(jsonb_build_object('sourceRef',source_ref,'fullName',full_name,'company',company,'email',email,'requestedAt',requested_at,'status',status) order by requested_at desc) from portal_private.invitation_requests where event_id='off-air'),'[]'));
end $$;
revoke all on function public.portal_owner_invitations() from public,anon,authenticated;
create function public.portal_owner_invitation_key() returns jsonb
language plpgsql security definer set search_path='' as $$
declare actor uuid; token text;
begin
 actor:=portal_private.require_owner();
 token:=replace(gen_random_uuid()::text,'-','')||replace(gen_random_uuid()::text,'-','');
 insert into portal_private.invitation_bridge(event_id,key_hash,issued_by) values('off-air',encode(sha256(convert_to(token,'UTF8')),'hex'),actor)
 on conflict(event_id) do update set key_hash=excluded.key_hash,active=true,issued_by=actor,issued_at=now();
 insert into portal_private.audit(actor,event_id,action) values(actor,'off-air','rotate_invitation_bridge_key');
 return jsonb_build_object('key',token);
end $$;
revoke all on function public.portal_owner_invitation_key() from public,anon,authenticated;
create function public.portal_record_invitations(p_key text,p_requests jsonb) returns jsonb
language plpgsql security definer set search_path='' as $$
declare r jsonb; k text; received integer:=0; added integer;
begin
 if p_key is null or p_key !~ '^[a-f0-9]{64}$' or not exists(select 1 from portal_private.invitation_bridge where event_id='off-air' and active and key_hash=encode(sha256(convert_to(p_key,'UTF8')),'hex')) then raise exception using errcode='42501',message='bridge_access_required';end if;
 if jsonb_typeof(p_requests) is distinct from 'array' then raise exception 'invalid_requests';end if;
 if jsonb_array_length(p_requests)>100 or octet_length(p_requests::text)>262144 then raise exception 'invalid_requests';end if;
 for r in select value from jsonb_array_elements(p_requests) loop
  foreach k in array array['sourceRef','fullName','company','email','event','engagement','requestedAt'] loop
   if jsonb_typeof(r->k) is distinct from 'string' then raise exception 'invalid_fields';end if;
  end loop;
  if r->>'sourceRef' !~ '^[a-f0-9]{64}$' or length(trim(r->>'fullName')) not between 1 and 100 or length(trim(r->>'company')) not between 1 and 100 or length(r->>'email')>255 or r->>'email' !~ '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$' or length(r->>'event')>1000 or length(r->>'engagement')>500 then raise exception 'invalid_fields';end if;
  if r->>'event' !~* '\mOFF[[:space:]]+AIR\M[^,]*2026' or not ('Attend'=any(string_to_array(r->>'engagement',', '))) then raise exception 'off_air_attendance_only';end if;
  if (r->>'requestedAt')::timestamptz>now()+interval '1 day' then raise exception 'invalid_date';end if;
  insert into portal_private.invitation_requests(event_id,source_ref,full_name,company,email,event_label,engagement,requested_at)
  values('off-air',r->>'sourceRef',trim(r->>'fullName'),trim(r->>'company'),trim(r->>'email'),r->>'event',r->>'engagement',(r->>'requestedAt')::timestamptz)
  on conflict(event_id,source_ref) do nothing;
  get diagnostics added=row_count;received:=received+added;
 end loop;
 return jsonb_build_object('success',true,'added',received);
end $$;
revoke all on function public.portal_record_invitations(text,jsonb) from public,anon,authenticated;
-- The receiver key only permits verified-source request writes; it grants no read access.
grant execute on function public.portal_record_invitations(text,jsonb) to anon,authenticated;
create or replace function public.portal_owner_sponsor_preview() returns jsonb
language plpgsql security definer set search_path='' as $$
declare owner_id uuid; report jsonb; raw jsonb;
begin
 owner_id:=portal_private.require_owner();
 select jsonb_build_object('sponsor','Owner preview','event',e.title,'accepted',true,'termsVersion','off-air-2026-11-16-v2','canViewEmail',false,
 'rows',coalesce((select jsonb_agg(jsonb_build_object('firstName',x.value->>'firstName','lastName',x.value->>'lastName','company',x.value->>'company','jobTitle',x.value->>'jobTitle','linkedin',x.value->>'linkedin') order by x.ordinality)
 from portal_private.report_current c join portal_private.report_versions v on v.id=c.version_id cross join lateral jsonb_array_elements(v.records) with ordinality x(value,ordinality) where c.event_id=e.id and c.source_kind='enriched'),'[]')) into report from portal_private.events e where e.id='off-air';
 select jsonb_build_object('syncedAt',v.created_at,'canViewEmail',false,'rows',coalesce((select jsonb_agg(jsonb_build_object('firstName',x.value->>'firstName','lastName',x.value->>'lastName','company',x.value->>'company','jobTitle',x.value->>'jobTitle','ticketType',x.value->>'ticketType','status',x.value->>'status','registeredAt',x.value->>'registeredAt') order by x.ordinality) from jsonb_array_elements(v.records) with ordinality x(value,ordinality) where not portal_private.registration_is_enriched('off-air',x.value)),'[]')) into raw
 from portal_private.report_current c join portal_private.report_versions v on v.id=c.version_id where c.event_id='off-air' and c.source_kind='eventbrite_raw';
 return jsonb_build_object('report',report,'raw',coalesce(raw,jsonb_build_object('syncedAt',null,'canViewEmail',false,'rows','[]'::jsonb)));
end $$;
revoke all on function public.portal_owner_sponsor_preview() from public,anon,authenticated;
grant execute on function public.portal_owner_invitations() to authenticated;
grant execute on function public.portal_owner_invitation_key() to authenticated;
grant execute on function public.portal_owner_sponsor_preview() to authenticated;
commit;
