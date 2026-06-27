// AfriversalAI — partner invite / set-password-link Edge Function.
//
// When an admin approves a partner, this provisions their auth account (if it
// doesn't exist) and returns a secure "set your password" link. The admin
// console then emails that link via the send-email function (and shows it as a
// copyable fallback). The partner clicks it, lands on reset-password.html, and
// sets their own password — no service-role key ever touches the browser.
//
// Verifies the caller is an admin (admins table) before doing anything.
//
// ── Deploy (Thando, one-time) ───────────────────────────────────────────────
//   supabase functions deploy partner-invite
// Supabase auto-injects SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY. Until deployed,
// the admin "invite partner" action is a safe no-op.

import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};
const json = (b: unknown, s = 200) =>
  new Response(JSON.stringify(b), { status: s, headers: { ...CORS, "Content-Type": "application/json" } });

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS });
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);

  const URL = Deno.env.get("SUPABASE_URL");
  const SERVICE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!URL || !SERVICE) return json({ error: "Not configured" }, 503);

  const token = (req.headers.get("Authorization") || "").replace(/^Bearer\s+/i, "");
  if (!token) return json({ error: "Missing authorization" }, 401);

  const admin = createClient(URL, SERVICE, { auth: { autoRefreshToken: false, persistSession: false } });

  // Caller must be an admin.
  const { data: caller, error: ue } = await admin.auth.getUser(token);
  if (ue || !caller?.user) return json({ error: "Invalid session" }, 401);
  const callerEmail = (caller.user.email || "").toLowerCase();
  const { data: adminRow } = await admin.from("admins").select("email").eq("email", callerEmail).maybeSingle();
  if (!adminRow) return json({ error: "Admins only" }, 403);

  let body: { email?: string; redirectTo?: string };
  try { body = await req.json(); } catch { body = {}; }
  const email = (body.email || "").trim().toLowerCase();
  const redirectTo = body.redirectTo;
  if (!email) return json({ error: "Missing email" }, 400);

  // Generate an invite link (creates the user if new). If the account already
  // exists, fall back to a recovery link so they can (re)set their password.
  const opts = redirectTo ? { redirectTo } : undefined;
  let link: string | null = null;
  let mode = "invite";

  let gen = await admin.auth.admin.generateLink({ type: "invite", email, options: opts });
  if (gen.error) {
    const msg = (gen.error.message || "").toLowerCase();
    if (msg.includes("already") || msg.includes("registered") || msg.includes("exists")) {
      mode = "recovery";
      gen = await admin.auth.admin.generateLink({ type: "recovery", email, options: opts });
    }
  }
  if (gen.error) return json({ error: gen.error.message }, 400);

  link = gen.data?.properties?.action_link || null;
  if (!link) return json({ error: "Could not generate link" }, 500);

  return json({ ok: true, action_link: link, mode });
});
