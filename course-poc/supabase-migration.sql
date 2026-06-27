-- AfriversalAI — Supabase Migration
-- Run this in: Supabase dashboard → SQL Editor → New query → Paste → Run
-- Tables must be created in order: profiles → organisations → progress
-- ==========================================================================


-- 1. Profiles table
--    One row per registered learner. id matches auth.users.id (set on signup via afSignUp).
--    Columns mirror what auth.js getProfile() and dashboard.html expect.

create table if not exists profiles (
  id            uuid primary key references auth.users(id) on delete cascade,
  full_name     text,
  email         text,
  organisation  text,
  sector        text,
  org_code      text,
  created_at    timestamptz default now()
);

-- RLS: learners can only read and update their own profile row.
alter table profiles enable row level security;

create policy "Users can read own profile"
  on profiles for select
  to authenticated
  using (id = auth.uid());

create policy "Users can update own profile"
  on profiles for update
  to authenticated
  using (id = auth.uid());

create policy "Users can insert own profile"
  on profiles for insert
  to authenticated
  with check (id = auth.uid());


-- 2. Progress table
--    One row per (user, module, phase) tuple. Unique constraint enables upsert
--    in saveProgress() so re-completing a phase never creates duplicate rows.

create table if not exists progress (
  id            bigint generated always as identity primary key,
  user_id       uuid not null references auth.users(id) on delete cascade,
  module_id     text not null,
  phase         integer not null,
  completed_at  timestamptz default now(),
  constraint progress_unique unique (user_id, module_id, phase)
);

-- Index for the common query: all progress rows for a user
create index if not exists progress_user_idx on progress (user_id);

-- RLS: learners can only read and insert their own progress rows.
-- No delete/update: progress is append-only — completion is permanent.
alter table progress enable row level security;

create policy "Users can read own progress"
  on progress for select
  to authenticated
  using (user_id = auth.uid());

create policy "Users can insert own progress"
  on progress for insert
  to authenticated
  with check (user_id = auth.uid());


-- 3. Organisations table
--    Each row = one company/client that has purchased access.
--    You create these manually in the Supabase dashboard (or via SQL below).
--    The `code` is what you hand to the client to give to their employees.

create table if not exists organisations (
  id          uuid default gen_random_uuid() primary key,
  name        text not null,
  code        text not null unique,          -- uppercase, e.g. NEDBANK-2026
  max_seats   integer not null default 50,  -- how many employees can use this code
  active      boolean not null default true,
  created_at  timestamptz default now()
);

-- RLS: any authenticated user can read active organisations (needed for code validation).
-- Nobody can write from the browser — only service role (you, via dashboard).
alter table organisations enable row level security;

create policy "Authenticated users can read active organisations"
  on organisations for select
  to authenticated
  using (active = true);


-- 4. Add organisation_id to profiles
--    Links a learner to the org that enrolled them.

alter table profiles
  add column if not exists organisation_id uuid references organisations(id);

create index if not exists profiles_organisation_id_idx on profiles (organisation_id);


-- 5. Add role (job title) to profiles
--    Stores the learner's job title as entered in Account Settings.

alter table profiles
  add column if not exists role text;


-- ==========================================================================
-- ROLLBACK (run manually if needed — never run automatically)
-- drop index if exists profiles_organisation_id_idx;
-- alter table profiles drop column if exists role;
-- alter table profiles drop column if exists organisation_id;
-- drop table if exists organisations;
-- drop table if exists progress;
-- drop table if exists profiles;
-- ==========================================================================

-- ==========================================================================
-- EXAMPLE: Create your first test organisation
-- Uncomment and edit to add a real client:

-- insert into organisations (name, code, max_seats)
-- values ('Standard Bank', 'STDBANK-2026', 30);

-- insert into organisations (name, code, max_seats)
-- values ('Test Company', 'TESTCO-2026', 5);
-- ==========================================================================
