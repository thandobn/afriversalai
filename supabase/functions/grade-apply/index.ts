import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: CORS })
  }

  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405, headers: CORS })
  }

  let body: { q1?: string; q2?: string; q3?: string }
  try {
    body = await req.json()
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid JSON' }), {
      status: 400, headers: { ...CORS, 'Content-Type': 'application/json' }
    })
  }

  const { q1, q2, q3 } = body
  if (!q1 || !q2 || !q3) {
    return new Response(JSON.stringify({ error: 'Missing answers' }), {
      status: 400, headers: { ...CORS, 'Content-Type': 'application/json' }
    })
  }

  const apiKey = Deno.env.get('ANTHROPIC_API_KEY')
  if (!apiKey) {
    return new Response(JSON.stringify({ error: 'Service not configured' }), {
      status: 500, headers: { ...CORS, 'Content-Type': 'application/json' }
    })
  }

  const prompt = `You are a learning assessor for AfriversalAI — an AI literacy course for South African working professionals (HR managers, government officials, financial advisors, healthcare workers, educators).

A learner has just completed Module 0: "What AI Is and Isn't" and answered three Apply questions that ask them to connect what they learned to their own workplace. Give specific, honest, and encouraging feedback on each answer.

Tone: direct, warm, collegial — like a senior colleague giving real feedback, not a chatbot being vague.

The three questions:
Q1: Name one AI tool you or your colleagues already use at work (or suspect might be AI-powered).
Q2: Which type of AI is it — Generative, Predictive/Decision, or Computer Vision? Explain your reasoning.
Q3: What's one failure mode or risk you can now see — that you couldn't see before this module?

The learner's answers:
Q1: ${q1.trim()}
Q2: ${q2.trim()}
Q3: ${q3.trim()}

Feedback rules:
- Q1: acknowledge their example, note if it's specific and workplace-grounded (good) or generic like just "ChatGPT" (nudge them to go deeper next time)
- Q2: check if they gave a classification AND reasoning — classification without reasoning is just a guess; call this out gently if so
- Q3: this is the most important — "AI can be biased" is too generic; a strong answer names a specific failure mode tied to their own context; reward specificity, push back on vagueness
- overall: one sentence — honest, not sycophantic

Respond ONLY with a valid JSON object, no explanation, no markdown:
{
  "q1_feedback": "1-2 sentences",
  "q2_feedback": "1-2 sentences",
  "q3_feedback": "2-3 sentences",
  "overall": "1 sentence"
}`

  let anthropicRes: Response
  try {
    anthropicRes = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 600,
        messages: [{ role: 'user', content: prompt }],
      }),
    })
  } catch {
    return new Response(JSON.stringify({ error: 'upstream_error' }), {
      status: 502, headers: { ...CORS, 'Content-Type': 'application/json' }
    })
  }

  if (!anthropicRes.ok) {
    return new Response(JSON.stringify({ error: 'api_error' }), {
      status: 502, headers: { ...CORS, 'Content-Type': 'application/json' }
    })
  }

  const data = await anthropicRes.json()
  const text: string = data?.content?.[0]?.text ?? ''

  let feedback: Record<string, string>
  try {
    feedback = JSON.parse(text)
  } catch {
    return new Response(JSON.stringify({ error: 'parse_error', raw: text }), {
      status: 500, headers: { ...CORS, 'Content-Type': 'application/json' }
    })
  }

  return new Response(JSON.stringify(feedback), {
    headers: { ...CORS, 'Content-Type': 'application/json' }
  })
})
