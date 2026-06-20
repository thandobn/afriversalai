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
- Fully **multilingual**: English, Afrikaans, French, Zulu (EN/AF/FR/ZU) via a custom data-i18n system

---

## Current Status

**Phase: POC live — seeking first B2B pilots**

- Course POC deployed on GitHub Pages
- Module 0 (Foundation): complete — 4-phase learning cycle, multilingual, free access
- Module 1 (AI & Work): complete — auth-gated, sector-specific pathways
- Module 7 sector variants: built for Healthcare, Finance, Government, Corporate, Education
- Modules 2–6: placeholders, in development for Cohort 1
- Registration, auth, and dashboard: live (Supabase + Formspree)
- First external conversations: beginning July 2026

---

## Tech Stack

| Layer | Tech |
|-------|------|
| Hosting | GitHub Pages (static) |
| Auth | Supabase (anon key + RLS) |
| Forms | Formspree |
| i18n | Custom `data-i18n` system via `assets/lang.js` + `assets/translations.js` |
| Styles | Single shared `assets/style.css` |
| No backend | All logic is client-side JS — no server, no build step |

---

## Repository Structure

```
Funda/
├── README.md
├── VISION.md                          # Mission, model, differentiation
├── HANDOFF.md                         # Session-by-session working log
├── BACKLOG.md                         # Prioritised feature backlog
├── course-poc/                        # POC website
│   ├── index.html                     # Landing page
│   ├── course.html                    # Course overview
│   ├── course-outline.html            # Full curriculum outline
│   ├── module-0.html                  # Foundation module (free, 4-phase)
│   ├── module-1.html                  # Module 1: AI & Work (auth-gated)
│   ├── module-7-corporate.html        # Sector culminating module — Corporate
│   ├── module-7-education.html        # Sector culminating module — Education
│   ├── module-7-finance.html          # Sector culminating module — Finance
│   ├── module-7-government.html       # Sector culminating module — Government
│   ├── module-7-healthcare.html       # Sector culminating module — Healthcare
│   ├── funda-five.html                # The Funda Five framework
│   ├── certificate.html               # Assessment + certificate
│   ├── pricing.html                   # Pricing (individual + team)
│   ├── register.html                  # Registration form (Formspree)
│   ├── login.html                     # Auth login (Supabase)
│   ├── dashboard.html                 # Learner dashboard (auth-gated)
│   ├── settings.html                  # Account settings
│   ├── contact.html                   # Contact form
│   ├── privacy.html                   # Privacy policy
│   ├── glossary.html                  # AI glossary
│   ├── supabase-migration.sql         # DB schema and RLS policy definitions
│   ├── assets/
│   │   ├── style.css                  # Shared stylesheet
│   │   ├── lang.js                    # Language switcher (window.setLang)
│   │   ├── translations.js            # All strings in EN/AF/FR/ZU
│   │   ├── auth.js                    # Supabase auth helpers
│   │   ├── nav.js                     # Shared navigation
│   │   └── supabase-config.js         # Supabase client init
│   └── research/
│       └── learning-design-research.md # Learning science principles for module design
├── research/
│   ├── RESEARCH-TRACKER.md            # Status of all 6 research fields
│   ├── funda-research-report.html     # Full research summary (shareable)
│   ├── Landscape Analysis Report.html # SA AI literacy landscape (shareable)
│   └── findings/                      # All 6 research field files
└── curriculum/                        # Course materials (in development)
```

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
