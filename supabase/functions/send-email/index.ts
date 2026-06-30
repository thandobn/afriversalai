// AfriversalAI — transactional email Edge Function.
//
// Sends email via Resend (https://resend.com) so the static site can trigger
// emails without ever exposing an API key in the browser. The front-end calls
// this through assets/email.js → afSendEmail({ to, subject, html, text }).
//
// ── Deploy (Thando, one-time) ───────────────────────────────────────────────
//   1. Create a Resend account, verify the afriversal.ai domain, get an API key.
//   2. In the repo root:  supabase functions deploy send-email
//   3. Set secrets:
//        supabase secrets set RESEND_API_KEY=re_xxx
//        supabase secrets set EMAIL_FROM="AfriversalAI <noreply@afriversal.ai>"
//   Until deployed, afSendEmail() is a safe no-op — nothing breaks.
//
// CORS is open to the site origin; invocation is authorised with the anon key
// (sent by email.js), so only your front-end can call it in practice.


const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS });
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), { status: 405, headers: { ...CORS, "Content-Type": "application/json" } });
  }

  const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
  const EMAIL_FROM = Deno.env.get("EMAIL_FROM") || "AfriversalAI <noreply@afriversal.ai>";
  if (!RESEND_API_KEY) {
    return new Response(JSON.stringify({ error: "Email provider not configured" }), { status: 503, headers: { ...CORS, "Content-Type": "application/json" } });
  }

  let body: {
    to?: string | string[]; subject?: string; html?: string; text?: string; replyTo?: string;
    cc?: string | string[]; bcc?: string | string[];
    attachments?: Array<{ filename?: string; content?: string }>;
  };
  try { body = await req.json(); } catch { body = {}; }

  const { to, subject, html, text, replyTo, cc, bcc, attachments } = body;
  if (!to || !subject || (!html && !text)) {
    return new Response(JSON.stringify({ error: "Missing to, subject, or html/text" }), { status: 400, headers: { ...CORS, "Content-Type": "application/json" } });
  }

  const payload: Record<string, unknown> = {
    from: EMAIL_FROM,
    to: Array.isArray(to) ? to : [to],
    subject,
  };
  if (html) payload.html = html;
  if (text) payload.text = text;
  if (replyTo) payload.reply_to = replyTo;
  if (cc) payload.cc = Array.isArray(cc) ? cc : [cc];
  if (bcc) payload.bcc = Array.isArray(bcc) ? bcc : [bcc];
  // attachments: [{ filename, content }] where content is base64 (Resend format).
  if (Array.isArray(attachments) && attachments.length) {
    payload.attachments = attachments
      .filter((a) => a && a.filename && a.content)
      .map((a) => ({ filename: a.filename, content: a.content }));
  }

  const resp = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { "Authorization": `Bearer ${RESEND_API_KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  const result = await resp.text();
  return new Response(result, { status: resp.status, headers: { ...CORS, "Content-Type": "application/json" } });
});
