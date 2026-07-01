# AfriversalAI — Backlog

Items that require external action, outreach, production work, or legal/operational decisions. These stay here until resolved — do not delete until confirmed complete.

Last updated: July 2026

---

## How to use this file

- **Owner** = who needs to take the action (Thando, Mom, or Both)
- **Effort** = rough time estimate
- **Blocks** = what can't happen until this is resolved
- Status: `[ ]` = open · `[x]` = done · `[~]` = in progress

---

## URGENT — Cohort 1 launches August 1 (4 weeks)

Cohort 1 has a real corporate client. Invoice due July 29. These must be resolved before learners arrive.

| # | Item | Owner | Effort | Blocks |
|---|------|-------|--------|--------|
| U1 | **Domain categorization submission** — submit `afriversal.ai` and `app.afriversal.ai` to Cisco Umbrella, Zscaler, McAfee SiteAdvisor, Fortiguard. Takes 24–72hrs to propagate. Corporate learners on enterprise networks will hit "Web Page Blocked" without this (already happened with mom's UniFi). `.com` would reduce risk long-term but submit `.ai` now. | Thando | 1–2 hrs | All corporate learner access |
| U2 | **Corporate learner flow smoke test** — log in as a provisioned corporate learner, navigate M0–M6 + M7-corporate, confirm access code works, confirm signing is complete, confirm progress tracking. End-to-end walkthrough, not a code review. This is the dress rehearsal before the real cohort shows up. | Thando | 1–2 hrs | Proving the product works for the paying client |
| U3 | **Confirm Formspree endpoints are live** — verify form IDs in `register.html` and `contact.html` are the real live endpoints, not dev placeholders. New registrations from the cohort landing must reach you. | Thando | 15 min | Registration + contact forms |
| U4 | **Welcome video** — mom records a 2–3 min founder intro on her phone. Script is already in `course-outline.html`. Thando uploads and embeds in the course landing page. This is the first thing the paying cohort sees. | Mom + Thando | 2 hrs | First impression |
| U5 | **Lead follow-up process** — confirm who owns inbound form replies, write a 3-sentence response template, confirm the 2-business-day SLA is achievable with current capacity. Cohort 1 client is live — inbound must not go cold. | Thando | 1 hr | Lead conversion and client comms |

---

## Critical — Before public launch

| # | Item | Owner | Effort | Blocks |
|---|------|-------|--------|--------|
| C1 | **CIPC trademark check on "AfriversalAI"** — search cipc.co.za to confirm name is available before investing further in brand | Thando | 15 min | Everything |
| C2 | **Terms of service adequacy check** — `terms.html` exists; verify it covers: refund window, what happens if a learner fails the capstone, cohort cancellation policy, and B2B vs consumer terms distinction. The corporate contract (MSA, SOW) is in the publication system — this is about the individual learner-facing T&C. | Thando | Half day (review) | Payments going live at scale |
| C3 | **Named SA educator or practitioner to co-validate curriculum** — someone with standing in SA adult education or AI policy whose name appears on the site or course outline. Council flagged this as critical for credibility with L&D buyers who will ask "who validated this?" | Thando | Outreach + relationship | Credibility with enterprise buyers |

---

## Major — Before Cohort 2

| # | Item | Owner | Effort | Blocks |
|---|------|-------|--------|--------|
| M1 | **Module 7 formatting parity** — all 5 sector variants (corporate, education, finance, government, healthcare) exist with real content but are not formatted to match M0–M6 (progress tracker, phase structure, nav style). Need a format pass to bring them in line. | Both | Design sprint (1–2 sessions) | Professional look for the paying cohort's sector module |
| M2 | **Formative assessment checkpoints (M1–M6)** — brief written judgment prompts at end of each module that an assessor can review, before the capstone. Module content reviews (M1, M4 done; M5, M6 pending) are separate — this is about adding the assessor-visible checkpoint artifact. | Both | Curriculum sprint | Pedagogical soundness; SETA accreditation |
| M3 | **Module 5 + 6 content reviews** — M1 and M4 went through Ntando's full brief process (M4 was an 854-line doc + full remediation sprint). M5 and M6 need the same treatment before they're at the same standard. | Mom + Thando | 2 × curriculum sprints | Course quality parity across all modules |
| M4 | **Assessor governance document** — who does the capstone assessment, what are their qualifications, what is the moderation process if a learner disputes a grade | Thando | Half day | Certificate integrity; SETA accreditation prep |
| M5 | **Local facilitator pathway** — in the 12-month plan, is there a pathway to train local facilitators? Needed for scale and SETA accreditation narrative | Both | Roadmap doc | 12-month credibility |

---

## Tech — Code improvements

| # | Item | Owner | Effort | Notes |
|---|------|-------|--------|-------|
| T1 | **Answer persistence for M2, M3, M7 variants** — `initAnswerPersistence` was added to M1/M4/M5/M6 by mom. M2, M3, and the 5 M7-sector variants still use in-memory only (answers clear on nav). Low priority since those phases are shorter, but worth adding before Cohort 2. | Claude | 1 hr | Answer persistence parity |
| T2 | **DEPLOY.md cleanup** — `supabase/DEPLOY.md` shows `tutor-review` as not deployed (stale). Also confirm whether `admin-provision-user` and `admin-create-user` are both needed or one is superseded. | Thando | 30 min | Documentation accuracy |

---

## Minor — Before going fully public

| # | Item | Owner | Effort | Blocks |
|---|------|-------|--------|--------|
| mn1 | **Multilingual content translations** — i18n architecture is implemented; M1, M4, and all M7 sector content (heavily revised or new) needs native speaker translation for AF/FR/ZU before the language switcher is promoted | Thando | Translator outreach | Full multilingual claim |
| mn2 | **SETA accreditation application** — begin formal MICT SETA accreditation application; SDL rebate claim on pricing page is pending this. First step is QCTO Letter of Intent. | Both | Weeks–months (external process) | SETA rebate for corporate learners |
| mn3 | **Course-outline.html PDF version** — L&D buyers want to download/print the stakeholder document; PDF export or print stylesheet needed | Thando | Half day | B2B sales process |

---

## Research & Documentation

| # | Item | Owner | Effort | Notes |
|---|------|-------|--------|-------|
| RD1 | **CITATIONS.md — source tracking log** — single file logging every statistic, case study, and external claim used across the course and marketing pages. Each entry: claim, source, validation status (confirmed / qualified / unverified), where it appears, evidence-tier notes. Seed with: 37% gender penalty (Dzreke & Dzreke 2025 — validated, synthetic audit profiles), 1.4M Microsoft SA training figure, 5–15% self-paced completion rate, Vumacam SA deployment docs. Purpose: instant response when a pilot client asks "where does that number come from?" | Thando | Half day to seed; ongoing | Credibility with B2B buyers; legal/compliance |

---

## Done / Superseded

| # | Item | Notes |
|---|------|-------|
| T-old | Knowledge check answer persistence (M1/M4/M5/M6) | Done — commit b24b5fb |
| T-old | DocuSign migration | Superseded — mom built in-house signing (`partner-sign-inline.js`), ECTA 2002 compliant |
| T-old | Deploy `tutor-review` Edge Function | Done — confirmed ACTIVE; all 9 Edge Functions live |
| T-old | Module engine extraction (T6) | Done — 234 lines removed from modules, 6 functions in `module-engine.js` |
| CM1 | Module 7 sector-specific modules | Done — all 5 variants shipped (corporate, education, finance, government, healthcare); need formatting pass (see M1 above) |
| M-old | Named external pilot partner | Done — Cohort 1 corporate client confirmed (invoice issued, August 1 start date) |

---

## Notes

- **SETA disclaimer** is live on `pricing.html` and `certificate.html` — correct language until accreditation is confirmed.
- **Privacy policy** is live and POPIA-compliant. Review annually.
- **Module 0** is live and free — no registration required.
- **Corporate workflow** is live end-to-end: signing (6 publication docs), tax invoice, POP upload, admin approval, access code provisioning.
- **Partner workflow** is live: signup, opportunity registration, commission tiers (Y1/Y2/Y3+), commission statement, corporate invoices in partner view.
