# AfriversalAI — Backlog

Items that require external action, outreach, production work, or legal/operational decisions. These stay here until resolved — do not delete until confirmed complete.

Last updated: June 2026

---

## How to use this file

- **Owner** = who needs to take the action (Thando, Mom, or Both)
- **Effort** = rough time estimate
- **Blocks** = what can't happen until this is resolved
- Status: `[ ]` = open · `[x]` = done · `[~]` = in progress

---

## Critical — Must resolve before public launch

| # | Item | Owner | Effort | Blocks |
|---|------|-------|--------|--------|
| C1 | **CIPC trademark check on "AfriversalAI"** — search cipc.co.za to confirm name is available before investing further in brand | Thando | 15 min | Everything |
| C2 | **Terms of service + refund policy** — needed before any payment is taken; at minimum: refund window, what happens if learner fails capstone, cohort cancellation policy | Thando | Half day (draft) | Payments going live |
| C3 | **Named SA educator or practitioner to co-validate curriculum** — someone with standing in SA adult education or AI policy who can speak to the "African-centered" claim; their name should appear on the site or course outline | Thando | Outreach + relationship | Credibility with L&D buyers; council raised this as Critical |

---

## Major — Fix before Cohort 1

| # | Item | Owner | Effort | Blocks |
|---|------|-------|--------|--------|
| M1 | **Formative assessment checkpoints (Modules 1–5)** — brief check-in activity at end of each module before the capstone (not just a quiz — should be a short written judgment prompt that the assessor can see) | Both | Curriculum sprint | Pedagogical soundness |
| M2 | **Record welcome video** — script already exists in course-outline.html; short (2–3 min) founder intro from mom, recorded on phone is fine for pilot | Mom (+ Thando for upload) | 2 hrs production | First impression for registrants |
| M3 | **Named external pilot partner** — at least one organisation that isn't friends/family who has agreed to send learners; L&D manager name and org name preferred | Thando | Outreach | Credibility; needed to test the team registration flow with a real client |
| M4 | **Assessor governance document** — who does the capstone assessment, what are their qualifications, what is the moderation process if a learner disputes a grade | Thando | Half day (light doc) | Certificate integrity; SETA accreditation prep |
| M5 | **Lead follow-up process** — response template for registration form submissions, confirm who owns replies, confirm 2-business-day SLA is achievable | Thando | 1 hr | Lead conversion |
| M6 | **Local facilitator pathway** — in the 12-month plan, is there a pathway to train local facilitators? Needed for scale; relevant for SETA accreditation | Both | Roadmap doc | 12-month plan credibility |

---

## Content — Future modules

| # | Item | Owner | Effort | Notes |
|---|------|-------|--------|-------|
| CM1 | **Module 7: Sector-specific module** — one additional module per sector trajectory (Healthcare, Finance, HR, Public Sector, etc.) bringing total to 8 modules per cohort; this is what makes the B2B sector pitch credible — learners get a module that speaks directly to their job | Both | Major content sprint | Not blocking Cohort 1; build before Cohort 2 |

---

## Tech — Code improvements

| # | Item | Owner | Effort | Notes |
|---|------|-------|--------|-------|
| T4 | **Deploy `tutor-review` Edge Function** — AI tutor (`tutor.js` + `supabase/functions/tutor-review/`) is built and wired to Module 1 Apply + Reflect but not yet deployed to Supabase. One command: `supabase functions deploy tutor-review` (ANTHROPIC_API_KEY already set in Supabase secrets). Until deployed, tutor falls back to a "compare with the example" note — learners don't break, but don't get live feedback either. | Thando | 5 min | Tutor feedback live for M1 learners |
| T3 | **Domain categorization submission** — `.ai` TLD is treated as uncategorized by many corporate content filters (UniFi, Cisco Umbrella, Zscaler, Palo Alto etc.), causing "Web Page Blocked" on strict enterprise/government networks. Submit `afriversal.ai` and `app.afriversal.ai` to the major categorization portals: Cisco Umbrella (umbrella.com), Zscaler, McAfee SiteAdvisor, Fortiguard. Takes 24–72hrs to propagate. Do this before first corporate pilot demo. Note: switching primary to `afriversalai.com` would reduce (not eliminate) the risk since `.com` has higher default trust — worth considering before Series A / government pilots. | Thando | 1–2 hrs submission | Must do before first corporate pilot |
| ~~T2~~ | ~~**DocuSign migration**~~ — **SUPERSEDED.** Mom built in-house fillable in-document signing (`partner-sign-inline.js`) — partners sign all 5 docs directly in-browser, captured and archived to Supabase Storage. Legally grounded under ECTA 25 of 2002. Revisit only if a major enterprise client's procurement team specifically requires a named third-party provider. | — | — | No longer blocking |
| ~~T1~~ | ~~**Knowledge check answer persistence**~~ — **DONE** (commit b24b5fb). Mom shipped localStorage persistence for M1, M4, M5, M6 free-text answers. M0, M2, M3 still use in-memory only — low priority since those are shorter phases. | — | — | Done |

---

## Minor — Do before going fully public

| # | Item | Owner | Effort | Blocks |
|---|------|-------|--------|--------|
| mn1 | **Multilingual content translations** — i18n architecture is implemented (EN/AF/FR/ZU nav and UI strings); full body content translations (module text, course outline) need native speaker review | Thando | Translator outreach | Full multilingual claim |
| mn2 | **Formspree endpoint confirmation** — confirm the Formspree form IDs in register.html and contact.html are the correct live endpoints (not placeholders) | Thando | 15 min | Forms working in production |
| mn3 | **SETA accreditation application** — begin formal MICT SETA accreditation application; SDL rebate claim on pricing page is pending this | Both | Weeks–months (external process) | SETA rebate for corporate learners |
| mn4 | **Course-outline.html PDF version** — L&D buyers will want to download/print the stakeholder document; PDF export or print stylesheet needed | Thando | Half day | B2B sales process |

---

## Research & Documentation

| # | Item | Owner | Effort | Notes |
|---|------|-------|--------|-------|
| RD1 | **CITATIONS.md — source tracking log** — create a single file that logs every statistic, case study, and external claim used across the course and marketing pages. Each entry: the claim, the source, validation status (confirmed / qualified / unverified), where it appears in the course, and any evidence-tier notes (e.g. synthetic profiles, methodology caveats). Purpose: instant response when a pilot client or L&D buyer asks "where does that number come from?" Known entries to seed it with: 37% gender penalty (Dzreke & Dzreke 2025 — validated, synthetic audit profiles), 1.4M Microsoft SA training figure, 5–15% self-paced completion rate, Vumacam SA deployment docs. | Thando | Half day to seed; ongoing | Credibility with B2B buyers; legal/compliance due diligence |

---

## Notes

- **SETA disclaimer** is already live on pricing.html and certificate.html — both say "application in preparation, SDL rebate pending accreditation approval." This language is correct and protects you until accreditation is confirmed.
- **Privacy policy** is live and POPIA-compliant (Section 18 + Section 72 cross-border transfer notice for Formspree). Review annually or if data practices change.
- **Module 0 (AI Fundamentals)** is now live and free — no registration required. This addresses council feedback about assuming too much AI foundation from learners.
