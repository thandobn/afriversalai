// AfriversalAI — admin "create a user" Edge Function.
//
// Lets an admin create any account type (learner, partner, facilitator, admin)
// from the console. Verifies the caller is an admin, creates the auth user with
// the service role, attaches the role record, and (if no password is given)
// returns a set-password link to email the new user.
//
// ── Deploy (Thando, one-time) ───────────────────────────────────────────────
//   supabase functions deploy admin-create-user
// Supabase auto-injects SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY.

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

  // Input
  let b: {
    email?: string; role?: string; full_name?: string; password?: string;
    organisation_id?: string; sector?: string; level?: string; redirectTo?: string;
  };
  try { b = await req.json(); } catch { b = {}; }

  const email = (b.email || "").trim().toLowerCase();
  const role = (b.role || "learner").toLowerCase();
  const fullName = (b.full_name || "").trim();
  const password = b.password || "";
  if (!email) return json({ error: "Missing email" }, 400);
  if (password && password.length < 8) return json({ error: "Password must be at least 8 characters" }, 400);
  if (["learner", "partner", "facilitator", "admin"].indexOf(role) === -1) return json({ error: "Invalid role" }, 400);

  // 1. Create the auth user (email pre-confirmed so they can sign in / set a password).
  const createOpts: Record<string, unknown> = { email, email_confirm: true, user_metadata: { full_name: fullName } };
  if (password) createOpts.password = password;
  let userId: string | null = null;
  const created = await admin.auth.admin.createUser(createOpts);
  if (created.error) {
    const msg = (created.error.message || "").toLowerCase();
    if (msg.includes("already") || msg.includes("registered") || msg.includes("exists")) {
      // Account already exists — find it and continue attaching the role.
      const { data: list } = await admin.auth.admin.listUsers();
      const u = list?.users?.find((x) => (x.email || "").toLowerCase() === email);
      if (u) userId = u.id; else return json({ error: created.error.message }, 400);
    } else {
      return json({ error: created.error.message }, 400);
    }
  } else {
    userId = created.data.user?.id || null;
  }
  if (!userId) return json({ error: "Could not create user" }, 500);

  // 2. Profile row (holds name / cohort / sector for learners & facilitators).
  const profile: Record<string, unknown> = { id: userId, email: email, full_name: fullName || null };
  if (b.organisation_id) profile.organisation_id = b.organisation_id;
  if (b.sector) profile.sector = b.sector;
  await admin.from("profiles").upsert(profile, { onConflict: "id" });

  // 3. Role records.
  if (role === "partner") {
    const code = "AAP-" + new Date().getFullYear() + "-" + String(Date.now()).slice(-5);
    await admin.from("partners").upsert(
      { email, legal_name: fullName || null, level: b.level || "Associate", status: "onboarding", partner_code: code },
      { onConflict: "email", ignoreDuplicates: true }
    );
  } else if (role === "facilitator") {
    await admin.from("facilitators").upsert({ email, full_name: fullName || null }, { onConflict: "email", ignoreDuplicates: false });
  } else if (role === "admin") {
    await admin.from("admins").upsert({ email }, { onConflict: "email", ignoreDuplicates: true });
  }

  // 4. If no password was set, return a set-password link to email them.
  let action_link: string | null = null;
  if (!password) {
    const opts = b.redirectTo ? { redirectTo: b.redirectTo } : undefined;
    const gen = await admin.auth.admin.generateLink({ type: "recovery", email, options: opts });
    if (!gen.error) action_link = gen.data?.properties?.action_link || null;
  }

  return json({ ok: true, user_id: userId, role, action_link });
});
