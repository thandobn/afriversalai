// AfriversalAI — public "become a partner" self-signup Edge Function.
//
// Lets a prospective partner create their own Partner Portal account instantly:
// they choose a password on the public become-a-partner page, this creates the
// auth user (service role) and the `partners` row so the portal grants access.
// No admin/approval step — instant self-service (status defaults to 'onboarding').
//
// Public by design: anyone can create a partner account here, mirroring the old
// public application form. A honeypot field blocks basic bots.
//
// ── Deploy ───────────────────────────────────────────────────────────────────
//   supabase functions deploy partner-signup
// Supabase auto-injects SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY.

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};
const json = (b: unknown, s = 200) =>
  new Response(JSON.stringify(b), { status: s, headers: { ...CORS, "Content-Type": "application/json" } });

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS });
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);

  const URL = Deno.env.get("SUPABASE_URL");
  const SERVICE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!URL || !SERVICE) return json({ error: "Not configured" }, 503);

  let b: {
    email?: string; password?: string; full_name?: string;
    organisation?: string; country?: string; hp?: string;
  };
  try { b = await req.json(); } catch { b = {}; }

  // Honeypot — real users never fill this.
  if (b.hp) return json({ ok: true });

  const email = (b.email || "").trim().toLowerCase();
  const password = b.password || "";
  const fullName = (b.full_name || "").trim();
  if (!email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return json({ error: "Enter a valid email." }, 400);
  if (!password || password.length < 8) return json({ error: "Password must be at least 8 characters." }, 400);

  const admin = createClient(URL, SERVICE, { auth: { autoRefreshToken: false, persistSession: false } });

  // 1. Create the auth user with their chosen password (pre-confirmed so they
  //    can sign in immediately).
  const created = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { full_name: fullName },
  });
  if (created.error) {
    const msg = (created.error.message || "").toLowerCase();
    if (msg.includes("already") || msg.includes("registered") || msg.includes("exists")) {
      return json({ error: "An account with this email already exists. Please sign in instead." }, 409);
    }
    return json({ error: created.error.message }, 400);
  }
  const userId = created.data.user?.id || null;
  if (!userId) return json({ error: "Could not create account." }, 500);

  // 2. Profile row.
  await admin.from("profiles").upsert(
    { id: userId, email, full_name: fullName || null },
    { onConflict: "id" }
  );

  // 3. Partner row — this is what grants Portal access (status 'onboarding').
  const code = "AAP-" + new Date().getFullYear() + "-" + String(Date.now()).slice(-5);
  const { error: pe } = await admin.from("partners").upsert(
    {
      email,
      legal_name: fullName || null,
      trading_name: (b.organisation || "").trim() || null,
      country: (b.country || "").trim() || null,
      level: "Associate",
      status: "onboarding",
      partner_code: code,
    },
    { onConflict: "email", ignoreDuplicates: true }
  );
  if (pe) return json({ error: pe.message }, 400);

  return json({ ok: true, partner_code: code });
});
