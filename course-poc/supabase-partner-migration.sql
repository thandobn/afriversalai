-- AfriversalAI — Supabase Migration: ENTERPRISE PARTNER DASHBOARD
-- Run this in: Supabase dashboard → SQL Editor → New query → Paste → Run
-- Safe to re-run (idempotent). Run AFTER the main supabase-migration.sql
-- (it relies on the existing `admins` table for admin read-all policies).
--
-- Tables created:
--   partners              — approved partner directory + profile (email = key, like `admins`)
--   partner_customers     — opportunity / customer pipeline tracking
--   partner_signatures    — signed documents + verification record
--   partner_applications  — "Become a Partner" applications (optional; replaces Formspree)
--
-- Access model (RLS):
--   • A partner can read/write ONLY their own rows (matched on auth.email()).
--   • A partner cannot enumerate the partner list or see other partners' data.
--   • Admins/facilitators (rows in `admins`) can READ all partner data for the console.
--   • Anyone may submit a partner application; only admins can read applications.
-- ==========================================================================


-- 0. ELECTRONIC-SIGNATURE CONSENT — every user records when they agreed that
--    their electronic signature is legally binding (ECTA 25 of 2002). Augments
--    the existing profiles table from the main migration.
alter table profiles add column if not exists esign_consent_at timestamptz;


-- 1. PARTNERS — approved partner directory + profile
--    email is the key (mirrors the `admins` allowlist pattern). A partner is
--    "approved / has portal access" iff a row exists here for their email.
--    To approve a partner: Table Editor → partners → Insert row (no code deploy).
create table if not exists partners (
  email         text primary key,
  legal_name    text,
  trading_name  text,
  partner_code  text unique,                       -- AAP-YYYY-#####
  level         text not null default 'Associate'
                  check (level in ('Associate','Professional','Strategic')),
  status        text not null default 'onboarding'
                  check (status in ('onboarding','active','suspended')),
  country       text,
  relationship_manager text,
  created_at    timestamptz default now()
);

alter table partners enable row level security;

drop policy if exists "Partners read own row" on partners;
create policy "Partners read own row"
  on partners for select to authenticated
  using (email = auth.email());

drop policy if exists "Partners update own row" on partners;
create policy "Partners update own row"
  on partners for update to authenticated
  using (email = auth.email());

drop policy if exists "Admins read all partners" on partners;
create policy "Admins read all partners"
  on partners for select to authenticated
  using (exists (select 1 from admins a where a.email = auth.email()));

-- Admins approve / manage partners from the console (insert on approval,
-- update level & status, remove a partner).
drop policy if exists "Admins insert partners" on partners;
create policy "Admins insert partners"
  on partners for insert to authenticated
  with check (exists (select 1 from admins a where a.email = auth.email()));

drop policy if exists "Admins update all partners" on partners;
create policy "Admins update all partners"
  on partners for update to authenticated
  using (exists (select 1 from admins a where a.email = auth.email()));

drop policy if exists "Admins delete partners" on partners;
create policy "Admins delete partners"
  on partners for delete to authenticated
  using (exists (select 1 from admins a where a.email = auth.email()));


-- 2. PARTNER_CUSTOMERS — opportunity / customer pipeline (the tracking table)
create table if not exists partner_customers (
  id            uuid default gen_random_uuid() primary key,
  partner_email text not null references partners(email) on delete cascade,
  name          text not null,
  sector        text,
  country       text,
  acv           numeric not null default 0,        -- Annual Contract Value (ZAR)
  stage         text not null default 'Registered'
                  check (stage in ('Registered','Proposal','Signed','Onboarded')),
  created_at    timestamptz default now(),
  updated_at    timestamptz default now()
);

create index if not exists partner_customers_email_idx on partner_customers (partner_email);

alter table partner_customers enable row level security;

drop policy if exists "Partners manage own customers (select)" on partner_customers;
create policy "Partners manage own customers (select)"
  on partner_customers for select to authenticated using (partner_email = auth.email());
drop policy if exists "Partners manage own customers (insert)" on partner_customers;
create policy "Partners manage own customers (insert)"
  on partner_customers for insert to authenticated with check (partner_email = auth.email());
drop policy if exists "Partners manage own customers (update)" on partner_customers;
create policy "Partners manage own customers (update)"
  on partner_customers for update to authenticated using (partner_email = auth.email());
drop policy if exists "Partners manage own customers (delete)" on partner_customers;
create policy "Partners manage own customers (delete)"
  on partner_customers for delete to authenticated using (partner_email = auth.email());
drop policy if exists "Admins read all customers" on partner_customers;
create policy "Admins read all customers"
  on partner_customers for select to authenticated
  using (exists (select 1 from admins a where a.email = auth.email()));


-- 3. PARTNER_SIGNATURES — signed documents with verification record
--    One row per (partner, document). Unique constraint enables upsert / re-sign.
create table if not exists partner_signatures (
  id            uuid default gen_random_uuid() primary key,
  partner_email text not null references partners(email) on delete cascade,
  doc_key       text not null
                  check (doc_key in ('nda','agreement','schedule','handbook','welcome')),
  signer_name   text not null,
  capacity      text,
  signed_at     timestamptz not null default now(),
  verify_id     text not null,                     -- AAI-SIG-XXXX
  fingerprint   text,                              -- FP-XXXXXXXX
  fields        jsonb,                             -- captured form fields
  constraint partner_signatures_unique unique (partner_email, doc_key)
);

create index if not exists partner_signatures_email_idx on partner_signatures (partner_email);

alter table partner_signatures enable row level security;

drop policy if exists "Partners read own signatures" on partner_signatures;
create policy "Partners read own signatures"
  on partner_signatures for select to authenticated using (partner_email = auth.email());
drop policy if exists "Partners insert own signatures" on partner_signatures;
create policy "Partners insert own signatures"
  on partner_signatures for insert to authenticated with check (partner_email = auth.email());
drop policy if exists "Partners update own signatures" on partner_signatures;
create policy "Partners update own signatures"
  on partner_signatures for update to authenticated using (partner_email = auth.email());
drop policy if exists "Admins read all signatures" on partner_signatures;
create policy "Admins read all signatures"
  on partner_signatures for select to authenticated
  using (exists (select 1 from admins a where a.email = auth.email()));


-- 4. PARTNER_APPLICATIONS — "Become a Partner" submissions (optional; replaces Formspree)
--    Anyone (anon) may submit; only admins can read. No one can read others' rows.
create table if not exists partner_applications (
  id              uuid default gen_random_uuid() primary key,
  name            text,
  organisation    text,
  email           text,
  country_sectors text,
  about           text,
  qualifiers      jsonb,                            -- 5 opportunity-qualifying answers
  status          text not null default 'new'
                    check (status in ('new','reviewing','approved','declined')),
  created_at      timestamptz default now()
);

-- Ensure the qualifiers column exists on databases created before it was added.
alter table partner_applications add column if not exists qualifiers jsonb;

alter table partner_applications enable row level security;

drop policy if exists "Anyone can submit an application" on partner_applications;
create policy "Anyone can submit an application"
  on partner_applications for insert to anon, authenticated with check (true);
drop policy if exists "Admins read applications" on partner_applications;
create policy "Admins read applications"
  on partner_applications for select to authenticated
  using (exists (select 1 from admins a where a.email = auth.email()));

-- Admins move applications through new → reviewing → approved/declined.
drop policy if exists "Admins update applications" on partner_applications;
create policy "Admins update applications"
  on partner_applications for update to authenticated
  using (exists (select 1 from admins a where a.email = auth.email()));


-- 4b. CORPORATE COHORTS — extend the existing `organisations` table (from the
--     main migration) into the partner-owned cohort entity. A partner onboards a
--     corporate, which creates a cohort with an enrolment code; the corporate's
--     staff register with that code and roll up to the partner for revenue + tracking.
alter table organisations add column if not exists partner_email  text references partners(email) on delete set null;
alter table organisations add column if not exists customer_id    uuid references partner_customers(id) on delete set null;
alter table organisations add column if not exists price_per_seat numeric default 14995;
alter table organisations add column if not exists sector         text;
alter table organisations add column if not exists start_date     date;
alter table organisations add column if not exists status         text default 'active';
alter table organisations add column if not exists contact_name   text;
alter table organisations add column if not exists contact_email  text;

create index if not exists organisations_partner_idx on organisations (partner_email);

-- Partners create & manage their own cohorts; admins manage all.
drop policy if exists "Partners create own organisations" on organisations;
create policy "Partners create own organisations"
  on organisations for insert to authenticated
  with check (partner_email = auth.email()
              or exists (select 1 from admins a where a.email = auth.email()));

drop policy if exists "Partners update own organisations" on organisations;
create policy "Partners update own organisations"
  on organisations for update to authenticated
  using (partner_email = auth.email()
         or exists (select 1 from admins a where a.email = auth.email()));

-- Partners may read the profiles & progress of learners enrolled in THEIR cohorts;
-- admins may read all. (Learners' own-row policies from the main migration remain.)
drop policy if exists "Partners read own cohort learners" on profiles;
create policy "Partners read own cohort learners"
  on profiles for select to authenticated
  using (exists (select 1 from organisations o
                 where o.id = profiles.organisation_id and o.partner_email = auth.email()));

drop policy if exists "Admins read all profiles" on profiles;
create policy "Admins read all profiles"
  on profiles for select to authenticated
  using (exists (select 1 from admins a where a.email = auth.email()));

drop policy if exists "Partners read own cohort progress" on progress;
create policy "Partners read own cohort progress"
  on progress for select to authenticated
  using (exists (select 1 from profiles p
                 join organisations o on o.id = p.organisation_id
                 where p.id = progress.user_id and o.partner_email = auth.email()));

drop policy if exists "Admins read all progress" on progress;
create policy "Admins read all progress"
  on progress for select to authenticated
  using (exists (select 1 from admins a where a.email = auth.email()));


-- 4c. COHORT REGISTRATIONS — learners register interest in Layer 3 specialist
--     cohorts (AI Policy, Governance, Regulation). Shows on the learner dashboard
--     and the admin console.
create table if not exists cohort_registrations (
  id          uuid default gen_random_uuid() primary key,
  user_email  text not null,
  cohort_key  text not null,                       -- e.g. 'ai-policy'
  cohort_name text,
  status      text not null default 'interested'
                check (status in ('interested','enrolled','completed','withdrawn')),
  created_at  timestamptz default now(),
  constraint cohort_registrations_unique unique (user_email, cohort_key)
);

create index if not exists cohort_registrations_email_idx on cohort_registrations (user_email);

alter table cohort_registrations enable row level security;

drop policy if exists "Users read own cohort registrations" on cohort_registrations;
create policy "Users read own cohort registrations"
  on cohort_registrations for select to authenticated using (user_email = auth.email());
drop policy if exists "Users insert own cohort registrations" on cohort_registrations;
create policy "Users insert own cohort registrations"
  on cohort_registrations for insert to authenticated with check (user_email = auth.email());
drop policy if exists "Users update own cohort registrations" on cohort_registrations;
create policy "Users update own cohort registrations"
  on cohort_registrations for update to authenticated using (user_email = auth.email());
drop policy if exists "Admins read all cohort registrations" on cohort_registrations;
create policy "Admins read all cohort registrations"
  on cohort_registrations for select to authenticated
  using (exists (select 1 from admins a where a.email = auth.email()));


-- 5. SEED — admins (console access) + initial / demo partners (idempotent)
-- Grant Instructor Console / admin access. Add more emails here as needed.
insert into admins (email) values
  ('ntandodavis@gmail.com'),
  ('gorentaride@gmail.com')
on conflict do nothing;

insert into partners (email, legal_name, level, status, partner_code) values
  ('partner@afriversal.ai', 'Demo Partner',     'Professional', 'active',     'AAP-2026-00001'),
  ('gorentaride@gmail.com', 'Founding Partner',  'Associate',    'onboarding', 'AAP-2026-00002')
on conflict (email) do nothing;


-- ==========================================================================
-- ROLLBACK (run manually if ever needed — never run automatically)
-- drop table if exists partner_applications;
-- drop table if exists partner_signatures;
-- drop table if exists partner_customers;
-- drop table if exists partners;
-- ==========================================================================
