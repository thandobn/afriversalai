// AfriversalAI — admin "set a user's password" Edge Function.
//
// Lets an AfriversalAI admin set/reset any user's password from the admin
// console WITHOUT exposing the service-role key in the browser. The function:
//   1. verifies the caller's JWT belongs to an email in the `admins` table,
//   2. resolves the target user (by user_id, or by email),
//   3. sets the new password via the Auth admin API.
//
// Supabase injects SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY into deployed
// functions automatically — no manual secrets needed.
//
// ── Deploy (Thando, one-time) ───────────────────────────────────────────────
//   supabase functions deploy admin-set-password
// Until deployed, the admin "Set password" button is a safe no-op.

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};
const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { ...CORS, "Content-Type": "application/json" } });

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS });
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);

  const URL = Deno.env.get("SUPABASE_URL");
  const SERVICE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!URL || !SERVICE) return json({ error: "Not configured" }, 503);

  // 1. Authenticate the caller and confirm they are an admin.
  const token = (req.headers.get("Authorization") || "").replace(/^Bearer\s+/i, "");
  if (!token) return json({ error: "Missing authorization" }, 401);

  const admin = createClient(URL, SERVICE, { auth: { autoRefreshToken: false, persistSession: false } });

  const { data: caller, error: ue } = await admin.auth.getUser(token);
  if (ue || !caller?.user) return json({ error: "Invalid session" }, 401);
  const callerEmail = (caller.user.email || "").toLowerCase();

  const { data: adminRow } = await admin.from("admins").select("email").eq("email", callerEmail).maybeSingle();
  if (!adminRow) return json({ error: "Admins only" }, 403);

  // 2. Resolve the target user.
  let body: { user_id?: string; email?: string; password?: string };
  try { body = await req.json(); } catch { body = {}; }
  const { user_id, email, password } = body;
  if (!password || password.length < 8) return json({ error: "Password must be at least 8 characters" }, 400);

  let targetId = user_id;
  if (!targetId && email) {
    const lower = email.toLowerCase();
    const { data: p } = await admin.from("profiles").select("id").eq("email", lower).maybeSingle();
    if (p?.id) targetId = p.id;
    else {
      // fall back to scanning auth users (covers partners with no profile row)
      const { data: list } = await admin.auth.admin.listUsers();
      const u = list?.users?.find((x) => (x.email || "").toLowerCase() === lower);
      if (u) targetId = u.id;
    }
  }
  if (!targetId) return json({ error: "User not found" }, 404);

  // 3. Set the password.
  const { error: upe } = await admin.auth.admin.updateUserById(targetId, { password });
  if (upe) return json({ error: upe.message }, 400);

  return json({ ok: true });
});
