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

## Email setup — Resend + Supabase SMTP (dashboard, no code)

Two layers share **one** Resend account + verified domain:
- **Auth emails** (signup confirmation, password reset) → Supabase sends them, via Resend as its SMTP.
- **Branded emails** (welcome, cohort code, partner credentials) → the `send-email` function, via Resend's API.

### A. Resend — verify the domain
1. resend.com → **Domains → Add Domain** → `afriversal.ai`.
2. Resend shows ~3 DNS records (MX + SPF TXT on a `send.` subdomain, and a DKIM TXT at
   `resend._domainkey`). Copy them **exactly as shown** (values vary by account/region).
3. Add them at whoever hosts `afriversal.ai` DNS (registrar / Cloudflare). Wait for "Verified".
4. **API Keys → Create** → copy the `re_...` key (used in two places below).

### B. Supabase — use Resend as SMTP (powers confirmation/reset emails)
Supabase → project `evxvsldwulqvowaaurxf` → **Authentication → Emails → SMTP Settings → Enable custom SMTP**:
- Host: `smtp.resend.com`   ·   Port: `465`
- Username: `resend`
- Password: *(the Resend API key)*
- Sender email: `noreply@afriversal.ai`   ·   Sender name: `AfriversalAI`

Then **Authentication → URL Configuration**: Site URL `https://afriversal.ai`, and add the
course-poc reset/confirm pages to **Redirect URLs** (e.g. `https://afriversal.ai/course-poc/reset-password.html`).

Decide **Authentication → Providers → Email → "Confirm email"**:
- ON  → users must click a confirmation link before signing in (more secure; native "email on signup").
- OFF → users sign in immediately; rely on the branded welcome email from `send-email`.

### C. Branded emails — the function
`supabase secrets set RESEND_API_KEY=re_...` + `EMAIL_FROM="AfriversalAI <noreply@afriversal.ai>"`
then `supabase functions deploy send-email` (already covered above).

### D. Verify
- Auth: trigger a password reset from the login page → confirm the email arrives.
- Branded: Admin → Students → *Email system* → **Send test email**.

## Security

- Never put any of these keys in the repo or in front-end code — only in `supabase secrets`.
- The Resend key shared in chat should be **rotated** in the Resend dashboard after first use, then
  re-set with `supabase secrets set RESEND_API_KEY=...`.
