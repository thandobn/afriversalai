# AfriversalAI

**AI Literacy for South African Workplaces**

AfriversalAI is a B2B AI literacy training program for South African working professionals. The problem: SA professionals are already using AI tools at work without the judgment to use them safely, critically, or accountably. Existing training teaches how to use the tools. AfriversalAI teaches how to think with them.

---

## What AfriversalAI Is

- A **6-module online course** with live facilitated cohorts as the premium B2B offering
- Built around **18 assessable competencies** at Bloom's Apply level or above
- Grounded in **SA-specific case studies** — including the 2026 government AI policy hallucination scandal, the 37% fintech gender penalty, SA election deepfakes, and Employment Equity Act AI liability
- Differentiated by a **proprietary decision framework** (the Funda Five) and a competency-based certificate backed by a real performance assessment
- Priced to become SDL-recoverable once QCTO-accredited — targeting the first SA provider accreditation for AI training at this level
- **Multilingual roadmap**: English live; Afrikaans (89% complete), French (97% complete), isiZulu (25% complete) — language switcher hidden pending native-speaker QA

---

## Current Status

**Phase: POC live — seeking first B2B pilots**

- Course POC deployed via AWS Amplify (GitHub → auto-deploy on push to master)
- Modules 0–6: all built, auth-gated, and content-complete
- Module 7 sector variants: built for Healthcare, Finance, Government, Corporate, Education
- Admin console: facilitator login, learner progress view, messaging (localStorage bus)
- Registration, auth, profile, and dashboard: live (Supabase + RLS)
- Glossary: full AI term library with tag filters and search
- First external conversations: beginning July 2026

---

## Tech Stack

| Layer | Tech |
|-------|------|
| Hosting | AWS Amplify (auto-deploy from GitHub master) |
| Auth | Supabase (anon key + RLS) |
| Forms | Formspree |
| i18n | Custom `data-i18n` system via `assets/lang.js` + `assets/translations.js` |
| Styles | Single shared `assets/style.css` |
| No backend | All logic is client-side JS — no server, no build step |

---

## Repository Structure

```
afriversalai/
├── README.md
├── VISION.md                          # Mission, model, differentiation
├── HANDOFF.md                         # Session-by-session working log
├── BACKLOG.md                         # Prioritised feature backlog
├── course-poc/                        # POC website (Amplify root)
│   ├── index.html                     # Landing page
│   ├── course-outline.html            # Full curriculum outline
│   ├── about.html                     # About page
│   ├── module-0.html                  # Foundation module (free, 4-phase)
│   ├── module-1.html                  # Module 1: AI & Work
│   ├── module-2.html                  # Module 2: How AI Learns & Fails
│   ├── module-3.html                  # Module 3: Bias & Discrimination
│   ├── module-4.html                  # Module 4: Verification & Judgment
│   ├── module-5.html                  # Module 5: Accountability & Governance
│   ├── module-6.html                  # Module 6: When AI Works
│   ├── module-7-corporate.html        # Sector module — Corporate
│   ├── module-7-education.html        # Sector module — Education
│   ├── module-7-finance.html          # Sector module — Finance
│   ├── module-7-government.html       # Sector module — Government
│   ├── module-7-healthcare.html       # Sector module — Healthcare
│   ├── admin.html                     # Facilitator console (auth-gated)
│   ├── admin-login.html               # Facilitator login (separate from learner login)
│   ├── dashboard.html                 # Learner dashboard (auth-gated)
│   ├── settings.html                  # Account settings (profile, password)
│   ├── glossary.html                  # AI glossary with tag filters + search
│   ├── login.html                     # Learner login (Supabase)
│   ├── register.html                  # Registration + org code validation
│   ├── certificate.html               # Assessment + certificate info
│   ├── pricing.html                   # Pricing (individual + team)
│   ├── contact.html                   # Contact form
│   ├── privacy.html                   # Privacy policy
│   ├── supabase-migration.sql         # DB schema, RLS policies, rollback notes
│   └── assets/
│       ├── style.css                  # Shared stylesheet
│       ├── auth.js                    # Supabase auth helpers (getProfile, updateProfile, etc.)
│       ├── admins.js                  # Admin allowlist stub — list managed in Supabase admins table
│       ├── module-engine.js           # Shared module navigation (showPhase, showScreen, updateTracker)
│       ├── messaging.js               # Shared localStorage messaging bus (dashboard + admin)
│       ├── nav.js                     # Shared navigation + mobile hamburger
│       ├── lang.js                    # Language switcher (hidden until translations QA'd)
│       ├── translations.js            # All strings in EN/AF/FR/ZU
│       └── supabase-config.js         # Supabase client init (anon key + URL)
├── research/
│   ├── RESEARCH-TRACKER.md            # Status of all 6 research fields
│   ├── funda-research-report.html     # Full research summary (shareable)
│   ├── Landscape Analysis Report.html # SA AI literacy landscape (shareable)
│   └── findings/                      # All 6 research field files
└── curriculum/                        # Course materials (in development)
```

## Supabase Setup

Three tables required — run `course-poc/supabase-migration.sql` in the Supabase SQL editor:

| Table | Purpose |
|-------|---------|
| `profiles` | One row per learner — name, org, sector, role |
| `progress` | Append-only phase completions per learner per module |
| `organisations` | Client orgs with access codes and seat limits |

RLS is enabled on all tables. Admins are managed in the Supabase `admins` table (not in code).

## Adding an Admin

Supabase dashboard → Table Editor → `admins` → Insert row → enter email. No code deploy needed.

---

## The Funda Five

The core decision framework every learner carries out of the program:

| Step | Name | Question |
|------|------|----------|
| 1 | Task | What am I trying to do? Is this right for AI? |
| 2 | Data | What information is involved? Is any of it sensitive or POPIA-protected? |
| 3 | Tool | What type of AI fits? Is it approved by my organisation? |
| 4 | Trust | How reliable is AI for this task? How would I detect an error? |
| 5 | Human | Who checks the output? Who is accountable if it's wrong? |

---

## Pricing (Pilot Cohort)

| Tier | Price |
|------|-------|
| Individual | R2,995 per learner |
| Team (5+ seats) | R2,295 per learner |

SDL-recoverable upon QCTO accreditation. B-BBEE Skills Development spend applicable.

---

*Private repository — AfriversalAI · Thandolwenkosi Nkala · 2026*
