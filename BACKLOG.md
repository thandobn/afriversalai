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
| T2 | **DocuSign (or equivalent) e-signature migration** — current internal e-sign system (`esign.js` + `partner_signatures` table) is legally grounded under ECTA 25 of 2002 and appropriate for pilot. Migrate to DocuSign or a recognised third-party platform before scaling to enterprise clients — procurement teams at large corporates expect a named provider for audit trails and compliance sign-off. Decision point: DocuSign (enterprise standard, pricey), HelloSign/Dropbox Sign (mid-market), or BoldSign/SignWell (more affordable). Current system stays in place until then. | Thando | Research + integration sprint | Enterprise procurement credibility — not a pilot blocker |
| T1 | **Knowledge check answer persistence** — answers entered in module knowledge checks are held in JS memory only; navigating away (e.g. to dashboard mid-phase) clears them. Phase completion itself saves correctly to Supabase. Fix: save answers to localStorage on each selection so returning mid-phase restores state. Low risk, self-contained change per module file. | Thando/Dev | 1–2 hrs per module | UX friction only — does not affect data integrity or progress tracking |

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
