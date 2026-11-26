-- Initial empty staging schema. No contact data, credentials or user grants.
-- Apply to the separate Frankfurt staging project only.
begin;
create schema if not exists portal_private;
revoke all on schema portal_private from public, anon, authenticated;
alter default privileges in schema portal_private revoke all on tables from public, anon, authenticated;
alter default privileges in schema portal_private revoke all on sequences from public, anon, authenticated;
alter default privileges in schema portal_private revoke execute on functions from public, anon, authenticated;

create table portal_private.events (
 id text primary key check (id ~ '^[a-z0-9-]{1,80}$'),
 title text not null,
 event_date date not null,
 venue text not null,
 capacity integer not null check(capacity>0),
 created_at timestamptz not null default now()
);
create table portal_private.owners (
 user_id uuid primary key references auth.users(id) on delete restrict,
 active boolean not null default true,
 created_at timestamptz not null default now()
);
create table portal_private.sponsors (
 id uuid primary key default gen_random_uuid(),
 name text not null check(length(name) between 1 and 200),
 active boolean not null default true,
 created_at timestamptz not null default now()
);
create table portal_private.memberships (
 user_id uuid not null references auth.users(id) on delete restrict,
 sponsor_id uuid not null references portal_private.sponsors(id) on delete restrict,
 active boolean not null default true,
 primary key(user_id,sponsor_id)
);
create table portal_private.event_access (
 sponsor_id uuid not null references portal_private.sponsors(id) on delete restrict,
 event_id text not null references portal_private.events(id) on delete restrict,
 expires_at timestamptz not null,
 revoked_at timestamptz,
 can_view_email boolean not null default false,
 primary key(sponsor_id,event_id)
);
create table portal_private.terms_acceptance (
 user_id uuid not null references auth.users(id) on delete restrict,
 terms_version text not null check(length(terms_version) between 1 and 80),
 accepted_at timestamptz not null default now(),
 primary key(user_id,terms_version)
);
create table portal_private.report_versions (
 id uuid primary key default gen_random_uuid(),
 event_id text not null references portal_private.events(id) on delete restrict,
 revision bigint generated always as identity unique,
 source_kind text not null check(source_kind in ('invitation_requests','eventbrite_raw','enriched')),
 label text not null check(length(label) between 1 and 255),
 report_date date not null,
 records jsonb not null check(jsonb_typeof(records)='array' and jsonb_array_length(records)<=5000),
 sha256 text not null check(sha256 ~ '^[a-f0-9]{64}$'),
 created_by uuid not null references auth.users(id) on delete restrict,
 restored_from uuid references portal_private.report_versions(id) on delete restrict,
 created_at timestamptz not null default now(),
 unique(event_id,source_kind,id)
);
create table portal_private.report_current (
 event_id text not null references portal_private.events(id) on delete restrict,
 source_kind text not null check(source_kind in ('invitation_requests','eventbrite_raw','enriched')),
 version_id uuid not null,
 primary key(event_id,source_kind),
 foreign key(event_id,source_kind,version_id) references portal_private.report_versions(event_id,source_kind,id) on delete restrict
);
create table portal_private.introduction_requests (
 id uuid primary key default gen_random_uuid(),
 sponsor_id uuid not null references portal_private.sponsors(id) on delete restrict,
 event_id text not null references portal_private.events(id) on delete restrict,
 requested_by uuid not null references auth.users(id) on delete restrict,
 report_version_id uuid not null,
 source_kind text not null default 'enriched' check(source_kind='enriched'),
 guest_key text not null check(length(guest_key) between 1 and 1100),
 guest_name text not null check(length(guest_name) between 1 and 255),
 status text not null default 'requested' check(status in ('requested','in_progress','introduced','cancelled')),
 requested_at timestamptz not null default now(),
 updated_at timestamptz not null default now(),
 unique(sponsor_id,event_id,guest_key),
 foreign key(event_id,source_kind,report_version_id) references portal_private.report_versions(event_id,source_kind,id) on delete restrict
);
create table portal_private.collateral (
 id uuid primary key default gen_random_uuid(),
 event_id text not null references portal_private.events(id) on delete restrict,
 sponsor_id uuid references portal_private.sponsors(id) on delete restrict,
 bucket_id text not null check(bucket_id='sponsor-reports-private'),
 object_path text not null unique,
 label text not null,
 created_at timestamptz not null default now()
);
create table portal_private.audit (
 id bigint generated always as identity primary key,
 actor uuid references auth.users(id) on delete restrict,
 event_id text references portal_private.events(id) on delete restrict,
 action text not null check(length(action) between 1 and 80),
 version_id uuid references portal_private.report_versions(id) on delete restrict,
 happened_at timestamptz not null default now()
);

-- Immutable snapshots and access records. Any future RPC still cannot overwrite history.
create function portal_private.prevent_history_mutation() returns trigger
language plpgsql set search_path='' as $$
begin raise exception 'Historical records are immutable; create a new version'; end;
$$;
revoke execute on function portal_private.prevent_history_mutation() from public, anon, authenticated;
create trigger immutable_report_versions before update or delete on portal_private.report_versions for each row execute function portal_private.prevent_history_mutation();
create trigger immutable_terms before update or delete on portal_private.terms_acceptance for each row execute function portal_private.prevent_history_mutation();
create trigger immutable_audit before update or delete on portal_private.audit for each row execute function portal_private.prevent_history_mutation();

-- Default deny at both SQL privilege and RLS layers. No broad client policies.
do $$
declare t record;
begin
 for t in select tablename from pg_tables where schemaname='portal_private' loop
  execute format('alter table portal_private.%I enable row level security',t.tablename);
  execute format('revoke all on table portal_private.%I from public, anon, authenticated',t.tablename);
 end loop;
end $$;
revoke all on all sequences in schema portal_private from public, anon, authenticated;

-- Private bucket; no storage.objects policies or download grants are created here.
insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types)
values ('sponsor-reports-private','sponsor-reports-private',false,5242880,array['application/vnd.openxmlformats-officedocument.spreadsheetml.sheet','text/csv','image/png','image/jpeg','application/pdf']);
insert into portal_private.events(id,title,event_date,venue,capacity)
values ('off-air','OFF AIR — The Unfiltered Future of Media','2026-11-24','White City House',120);
commit;
