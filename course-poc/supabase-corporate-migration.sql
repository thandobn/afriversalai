-- AfriversalAI — Corporate entities, invoicing, and commission-payment tracking.
-- Idempotent. Apply in the Supabase SQL editor (or via the management API).
--
--   corporates       — a corporate customer (belongs to AfriversalAI), created by
--                      a partner, approved by an admin, then logs into its own
--                      Corporate Portal (managed by the L&D / HR rep).
--   invoices         — issued by an admin once the corporate signs its contract;
--                      visible to the corporate and the linked partner.
--   partner_payments — tracks each partner commission: amount, status, paid date,
--                      and the proof-of-payment evidence the admin uploads.
-- Storage bucket 'pops' holds proof-of-payment files (private, RLS-guarded).

-- ── corporates ───────────────────────────────────────────────────────────────
create table if not exists corporates (
  id              uuid default gen_random_uuid() primary key,
  company_name    text not null,
  contact_name    text,
  contact_role    text,                         -- 'L&D' | 'HR' | etc.
  email           text unique not null,         -- registered email = portal login
  partner_email   text,                         -- linked partner (creator)
  organisation_id uuid,                          -- linked cohort (organisations.id)
  sector          text,
  country         text,
  seats           integer default 0,
  price_per_seat  numeric,
  status          text not null default 'pending'
                    check (status in ('pending','approved','active','suspended')),
  contract_signed boolean default false,
  created_by      text default 'partner',
  created_at      timestamptz default now(),
  approved_at     timestamptz
);
alter table corporates enable row level security;

drop policy if exists "Partners create corporates" on corporates;
create policy "Partners create corporates" on corporates for insert to authenticated
  with check (partner_email = auth.email()
              or exists (select 1 from admins a where a.email = auth.email()));

drop policy if exists "Partners read own corporates" on corporates;
create policy "Partners read own corporates" on corporates for select to authenticated
  using (partner_email = auth.email());

drop policy if exists "Corporate reads own row" on corporates;
create policy "Corporate reads own row" on corporates for select to authenticated
  using (email = auth.email());

drop policy if exists "Corporate updates own row" on corporates;
create policy "Corporate updates own row" on corporates for update to authenticated
  using (email = auth.email());

drop policy if exists "Admins manage corporates (select)" on corporates;
create policy "Admins manage corporates (select)" on corporates for select to authenticated
  using (exists (select 1 from admins a where a.email = auth.email()));
drop policy if exists "Admins manage corporates (update)" on corporates;
create policy "Admins manage corporates (update)" on corporates for update to authenticated
  using (exists (select 1 from admins a where a.email = auth.email()));
drop policy if exists "Admins manage corporates (delete)" on corporates;
create policy "Admins manage corporates (delete)" on corporates for delete to authenticated
  using (exists (select 1 from admins a where a.email = auth.email()));

-- ── invoices ─────────────────────────────────────────────────────────────────
create table if not exists invoices (
  id              uuid default gen_random_uuid() primary key,
  invoice_number  text unique,
  corporate_email text,
  partner_email   text,
  organisation_id uuid,
  description     text,
  amount          numeric default 0,            -- subtotal
  vat             numeric default 0,
  total           numeric default 0,
  currency        text default 'ZAR',
  status          text not null default 'issued'
                    check (status in ('issued','paid','void')),
  issued_at       timestamptz default now(),
  paid_at         timestamptz,
  pop_path        text,                          -- corporate proof-of-payment (storage)
  pop_uploaded_at timestamptz,
  pop_approved_at timestamptz,
  created_by      text
);
alter table invoices enable row level security;

drop policy if exists "Corporate reads own invoices" on invoices;
create policy "Corporate reads own invoices" on invoices for select to authenticated
  using (corporate_email = auth.email());
drop policy if exists "Corporate uploads POP on own invoices" on invoices;
create policy "Corporate uploads POP on own invoices" on invoices for update to authenticated
  using (corporate_email = auth.email());

drop policy if exists "Partner reads own invoices" on invoices;
create policy "Partner reads own invoices" on invoices for select to authenticated
  using (partner_email = auth.email());

drop policy if exists "Admins manage invoices (select)" on invoices;
create policy "Admins manage invoices (select)" on invoices for select to authenticated
  using (exists (select 1 from admins a where a.email = auth.email()));
drop policy if exists "Admins manage invoices (insert)" on invoices;
create policy "Admins manage invoices (insert)" on invoices for insert to authenticated
  with check (exists (select 1 from admins a where a.email = auth.email()));
drop policy if exists "Admins manage invoices (update)" on invoices;
create policy "Admins manage invoices (update)" on invoices for update to authenticated
  using (exists (select 1 from admins a where a.email = auth.email()));

-- ── partner_payments (commissions) ───────────────────────────────────────────
create table if not exists partner_payments (
  id              uuid default gen_random_uuid() primary key,
  partner_email   text not null,
  invoice_id      uuid references invoices(id) on delete set null,
  corporate_email text,
  organisation_id uuid,
  amount          numeric default 0,
  currency        text default 'ZAR',
  status          text not null default 'pending'
                    check (status in ('pending','paid')),
  due_terms       text default 'Within 15 days of confirmed & cleared corporate funds',
  paid_at         timestamptz,
  pop_path        text,                          -- admin-uploaded POP for the partner
  marked_by       text,
  created_at      timestamptz default now()
);
alter table partner_payments enable row level security;

drop policy if exists "Partner reads own payments" on partner_payments;
create policy "Partner reads own payments" on partner_payments for select to authenticated
  using (partner_email = auth.email());

drop policy if exists "Admins manage payments (select)" on partner_payments;
create policy "Admins manage payments (select)" on partner_payments for select to authenticated
  using (exists (select 1 from admins a where a.email = auth.email()));
drop policy if exists "Admins manage payments (insert)" on partner_payments;
create policy "Admins manage payments (insert)" on partner_payments for insert to authenticated
  with check (exists (select 1 from admins a where a.email = auth.email()));
drop policy if exists "Admins manage payments (update)" on partner_payments;
create policy "Admins manage payments (update)" on partner_payments for update to authenticated
  using (exists (select 1 from admins a where a.email = auth.email()));

-- ── proof-of-payment storage bucket ──────────────────────────────────────────
insert into storage.buckets (id, name, public) values ('pops','pops', false)
  on conflict (id) do nothing;

drop policy if exists "Corporate uploads own POP" on storage.objects;
create policy "Corporate uploads own POP" on storage.objects for insert to authenticated
  with check (bucket_id = 'pops' and (storage.foldername(name))[1] = auth.uid()::text);
drop policy if exists "Corporate updates own POP" on storage.objects;
create policy "Corporate updates own POP" on storage.objects for update to authenticated
  using (bucket_id = 'pops' and (storage.foldername(name))[1] = auth.uid()::text);
drop policy if exists "Read own or admin POP" on storage.objects;
create policy "Read own or admin POP" on storage.objects for select to authenticated
  using (bucket_id = 'pops' and ((storage.foldername(name))[1] = auth.uid()::text
         or exists (select 1 from admins a where a.email = auth.email())));
drop policy if exists "Admins upload any POP" on storage.objects;
create policy "Admins upload any POP" on storage.objects for insert to authenticated
  with check (bucket_id = 'pops' and exists (select 1 from admins a where a.email = auth.email()));
drop policy if exists "Admins update any POP" on storage.objects;
create policy "Admins update any POP" on storage.objects for update to authenticated
  using (bucket_id = 'pops' and exists (select 1 from admins a where a.email = auth.email()));
