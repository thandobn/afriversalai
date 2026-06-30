#!/usr/bin/env bash
# Deploy all AfriversalAI Edge Functions. Run from the repo root after:
#   supabase login && supabase link --project-ref evxvsldwulqvowaaurxf
# and after setting secrets (see supabase/DEPLOY.md).
set -euo pipefail

FUNCTIONS=(
  admin-create-user
  admin-set-password
  partner-invite
  send-email
  tutor-review
  grade-apply
)

for fn in "${FUNCTIONS[@]}"; do
  echo "→ Deploying $fn"
  supabase functions deploy "$fn"
done

echo "✓ All functions deployed. Verify with the admin 'Send test email' and 'Add a partner' tools."
