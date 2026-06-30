# AfriversalAI — Supabase Edge Functions deployment

The static site is fully wired to these functions, but they must be **deployed once** (and a
few secrets set) before they do anything. Until then:

- ✅ **Self-service signup works** — `register.html` creates the user directly via Supabase Auth.
- ❌ **Admin "Add a partner" / "Create a user"** → "Failed to fetch" (needs `admin-create-user`).
- ❌ **Signup / invite / cohort emails** are silently skipped (needs `send-email` + Resend).
- ❌ **Facilitator answer feedback** falls back to a generic note (needs `tutor-review`).

Do this from the **repo root** (`afriversalai/`) in a terminal.

## 1. One-time setup

```bash
# Install the CLI if needed:  brew install supabase/tap/supabase
supabase login
supabase link --project-ref evxvsldwulqvowaaurxf
```

## 2. Set the secrets

```bash
# Email (Resend) — verify the afriversal.ai domain in Resend first, then:
supabase secrets set RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxx
supabase secrets set EMAIL_FROM="AfriversalAI <noreply@afriversal.ai>"

# AI facilitator feedback + Module 0 grading (Anthropic / Claude)
supabase secrets set ANTHROPIC_API_KEY=sk-ant-xxxxxxxx
```

`SUPABASE_URL`, `SUPABASE_ANON_KEY` and `SUPABASE_SERVICE_ROLE_KEY` are injected automatically by
Supabase — you do **not** set those yourself.

## 3. Deploy the functions

```bash
supabase functions deploy admin-create-user   # admin creates learners/partners/facilitators/admins
supabase functions deploy admin-set-password   # admin sets/resets a password
supabase functions deploy partner-invite        # provision a partner login + set-password link
supabase functions deploy send-email            # transactional email via Resend
supabase functions deploy tutor-review          # facilitator answer feedback
supabase functions deploy grade-apply           # Module 0 apply feedback
```

…or just run `bash supabase/deploy.sh`.

## 4. Make sure your admin email is recognised

The admin functions only run for an email listed in the `admins` table. Confirm yours is there
(Supabase → Table editor → `admins`), or insert it:

```sql
insert into admins (email) values ('gorentaride@gmail.com') on conflict do nothing;
```

## 5. Verify

- **Email:** Admin → Students tab → *Email system* → **Send test email** → check the inbox.
- **Create user:** Admin → Partners tab → **Add a partner** with a password → the success box
  shows the credentials and a Partner Portal link.

## Security

- Never put any of these keys in the repo or in front-end code — only in `supabase secrets`.
- The Resend key shared in chat should be **rotated** in the Resend dashboard after first use, then
  re-set with `supabase secrets set RESEND_API_KEY=...`.
