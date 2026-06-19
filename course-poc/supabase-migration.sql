-- AfriversalAI — Supabase Migration
-- Run this in: Supabase dashboard → SQL Editor → New query → Paste → Run
-- ==========================================================================


-- 1. Organisations table
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


-- 2. Add organisation_id to profiles
--    Links a learner to the org that enrolled them.

alter table profiles
  add column if not exists organisation_id uuid references organisations(id);


-- ==========================================================================
-- EXAMPLE: Create your first test organisation
-- Uncomment and edit to add a real client:

-- insert into organisations (name, code, max_seats)
-- values ('Standard Bank', 'STDBANK-2026', 30);

-- insert into organisations (name, code, max_seats)
-- values ('Test Company', 'TESTCO-2026', 5);
-- ==========================================================================
