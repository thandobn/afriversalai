# AfriversalAI — Project Rules

> Project-specific context. Layers on top of my global rules in `~/.claude/CLAUDE.md`. The global file covers who I am and how I work; this file covers *this project*.

## What this is

**AfriversalAI** — a B2B AI-literacy training program for South African working professionals. It teaches people how to *think with* AI tools safely and accountably, not just how to use them. A 6-module online course with live facilitated cohorts as the premium offering, built around 18 assessable competencies and a proprietary decision framework (the **Funda Five**: Task → Data → Tool → Trust → Human).

**Status:** POC live on GitHub Pages, seeking first B2B pilots (first external conversations from July 2026).

## Tech stack — important constraints

- **Static site, no backend, no build step.** All logic is client-side JS. Don't introduce a build pipeline, framework, or server without asking.
- **Hosting:** GitHub Pages. **Auth:** Supabase (anon key + RLS). **Forms:** Formspree.
- **i18n is custom and mandatory.** Every user-facing string must work in EN/AF/FR/ZU via the `data-i18n` system in `course-poc/assets/lang.js` + `translations.js`. New copy needs translations added, not just English.
- **One shared stylesheet:** `course-poc/assets/style.css`. Reuse existing classes; don't add per-page CSS unless necessary.
- **DB schema + RLS:** `course-poc/supabase-migration.sql` is the source of truth.

## Where things live

- `course-poc/` — the POC website (modules, pricing, register/login, dashboard).
- `course-poc/assets/` — shared `style.css`, `lang.js`, `translations.js`, `auth.js`, `nav.js`, `supabase-config.js`.
- `research/` — research tracker, findings, shareable reports.
- `VISION.md` — mission, model, differentiation. `BACKLOG.md` — prioritised features. `STRATEGIC-NOTES.md` — strategy.

## Working docs (the session skills read/write these)

- **`HANDOFF.md`** — session-by-session log. `/get-up-to-speed` reads it; `/wrap-up` appends to it.
- **`MISTAKES.md`** — recurring mistakes to avoid. Check it before non-trivial work; `/wrap-up` updates it.

## Conventions

- Match the voice and structure of existing modules — read a sibling module file before building a new one.
- This is a **private repo** for a real product going to paying B2B clients. Keep copy polished, SA-specific, and POPIA-aware.
- Prices and accreditation claims are commercially sensitive — don't change them without confirming.
