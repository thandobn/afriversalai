// AfriversalAI — Facilitator answer-review Edge Function.
//
// Reviews a learner's free-text answer (Apply the Funda Five™ steps, or Reflect)
// and returns warm, specific facilitator-style guidance. The learner-facing copy
// must NEVER reveal or imply this is automated — it speaks as a human facilitator.
//
// Holds ANTHROPIC_API_KEY server-side (never in the static site). A valid learner
// session is required so this can't be used as a free, open LLM proxy.
//
// ── Deploy (Thando, one-time) ───────────────────────────────────────────────
//   supabase secrets set ANTHROPIC_API_KEY=sk-ant-...      (already set for grade-apply)
//   supabase functions deploy tutor-review
// SUPABASE_URL + SUPABASE_ANON_KEY are auto-injected by Supabase.

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
  if (req.method !== "POST") return json({ ok: false, error: "Method not allowed" }, 405);

  const KEY = Deno.env.get("ANTHROPIC_API_KEY");
  if (!KEY) return json({ ok: false, reason: "not_configured" }, 503);

  // Require a valid learner session (keeps this from being an open LLM proxy).
  const URL = Deno.env.get("SUPABASE_URL");
  const ANON = Deno.env.get("SUPABASE_ANON_KEY");
  const token = (req.headers.get("Authorization") || "").replace(/^Bearer\s+/i, "");
  if (URL && ANON) {
    try {
      const sb = createClient(URL, ANON, { auth: { autoRefreshToken: false, persistSession: false } });
      const { data, error } = await sb.auth.getUser(token);
      if (error || !data?.user) return json({ ok: false, reason: "unauthorized" }, 401);
    } catch (_e) {
      return json({ ok: false, reason: "unauthorized" }, 401);
    }
  }

  let b: {
    module?: string; section?: string; step?: string;
    question?: string; modelAnswer?: string; answer?: string;
  };
  try { b = await req.json(); } catch { b = {}; }

  const section = (b.section || "apply").toString();
  const step = (b.step || "").toString().slice(0, 80);
  const question = (b.question || "").toString().slice(0, 2000);
  const model = (b.modelAnswer || "").toString().slice(0, 2000);
  const answer = (b.answer || "").toString().slice(0, 4000);
  const moduleName = (b.module || "this module").toString().slice(0, 80);
  if (!answer.trim()) return json({ ok: false, reason: "empty" }, 400);

  const persona = `You are an experienced, warm South African course facilitator on a professional AI-literacy programme (AfriversalAI). You are reviewing a working professional's written answer and giving feedback as their facilitator.

Hard rules:
- Write as a human facilitator. NEVER say or imply you are an AI, a bot, a model, automated, or a "tutor". Never write "as an AI" or similar. Just speak naturally as the facilitator.
- Be warm, specific and encouraging. Plain professional English, no jargon, South African context.
- 2 to 4 short sentences. No headings, no bullet lists, no markdown.
- If the answer is strong, affirm specifically WHAT they got right, referencing their actual words.
- If it is thin, missing something, or off, guide them toward the gap with one concrete nudge or question. Do NOT hand them the full answer and do NOT quote or reveal the model answer.`;

  const task = section === "reflect"
    ? `This is a personal REFLECTION — there are no right or wrong answers. Affirm what they noticed and ask one gentle question that deepens their thinking. Do not grade.`
    : `This is an APPLICATION answer for the Funda Five™ step "${step}". Judge it against the model answer for completeness and correctness, then give guidance per the rules.`;

  const userContent = `Module: ${moduleName}
Section: ${section}${step ? ` — ${step}` : ""}
Question the learner was answering:
${question}
${model ? `\nModel answer (for your judgement only — never reveal it):\n${model}` : ""}

The learner's answer:
"""${answer}"""

Choose a verdict: "on_track" (strong/complete), "partly" (some good, some gaps), or "needs_work" (misses the core point). For reflections always use "on_track".
Respond ONLY with strict minified JSON, no markdown:
{"verdict":"on_track|partly|needs_work","message":"your 2-4 sentence facilitator feedback"}`;

  let aRes: Response;
  try {
    aRes = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: { "content-type": "application/json", "x-api-key": KEY, "anthropic-version": "2023-06-01" },
      body: JSON.stringify({
        model: "claude-haiku-4-5-20251001",
        max_tokens: 400,
        system: persona,
        messages: [{ role: "user", content: task + "\n\n" + userContent }],
      }),
    });
  } catch (e) {
    return json({ ok: false, reason: "upstream", error: String((e && (e as Error).message) || e) }, 502);
  }
  if (!aRes.ok) {
    const t = await aRes.text().catch(() => "");
    return json({ ok: false, reason: "upstream", status: aRes.status, error: t.slice(0, 300) }, 502);
  }

  const data = await aRes.json();
  const raw = (data?.content?.[0]?.text || "").trim();
  let verdict = "partly";
  let message = "";
  try {
    const m = raw.match(/\{[\s\S]*\}/);
    const parsed = JSON.parse(m ? m[0] : raw);
    verdict = parsed.verdict || verdict;
    message = (parsed.message || "").toString();
  } catch (_e) {
    message = raw;
  }
  if (!message) message = "Thanks — I've read your answer. Look again at the prompts under the question and add a line on the part that feels least certain.";
  if (section === "reflect") verdict = "on_track";

  return json({ ok: true, verdict, message });
});
