# AfriversalAI — Multilingual Roadmap

> Working reference for the path back to multilingual delivery. Each phase has one clear action. Read this at the start of any translation sprint.

Last updated: June 2026

---

## Current State

The language switcher is **hidden** until translations are reviewed by native speakers. The site runs in English only. The translation infrastructure is fully built — enabling a language requires one line change in `course-poc/assets/lang.js` (`ACTIVE_LANGS` array).

| Language | Keys complete | Quality assessment | Status |
|----------|--------------|-------------------|--------|
| English | 478 / 478 (100%) | Professional | **Live** |
| Afrikaans | 428 / 478 (~89%) | Appears professional; ~50 keys missing | Awaiting native speaker review |
| French | 463 / 478 (~97%) | Professional quality | Awaiting Francophone African review |
| isiZulu | 118 / 478 (~25%) | UI strings only; all course content falls back to English | Needs full commission |

---

## How to Re-Enable a Language (When Ready)

Open `course-poc/assets/lang.js` and add the language code to `ACTIVE_LANGS`:

```js
// Current (English only):
var ACTIVE_LANGS = ['en'];

// Example: re-enabling Afrikaans after review:
var ACTIVE_LANGS = ['en', 'af'];
```

The switcher reappears site-wide automatically. No HTML changes needed.

---

## Phase 0 — Hide Switcher (Done ✓)

**Status:** Complete — June 2026  
**What was done:** Language switcher hidden via CSS default. `ACTIVE_LANGS = ['en']`. Translations infrastructure kept intact for future use.  
**Why:** Afrikaans was 89% complete but unreviewed; Zulu was 25% complete; French needed African-context check.

---

## Phase 1 — Afrikaans (1–2 months)

**Goal:** Enable Afrikaans for all learners.

**Why Afrikaans first:** 89% complete, appears professionally translated, shortest path to a second language.

**Action items:**
1. **Post a brief on Upwork or PNet** (South African job board) for:
   > "Afrikaans native speaker, ~1–2 days of work, reviewing AI literacy educational content. Task: quality-check ~430 translation strings in a JSON-like file, flag anything unnatural, awkward, or technically incorrect, suggest corrections. R1,500–R3,000 estimated budget."
2. **Share the reviewer:** `course-poc/assets/translations.js` — the `af: { ... }` block only
3. **Fill the ~50 missing keys** — reviewer to draft; Thando to cross-check with Claude before adding
4. **Test:** Add `'af'` to `ACTIVE_LANGS`, open the site, switch to AF, walk through course.html, about.html, and one module page end-to-end
5. **Commit and deploy**

**Owner:** Thando (post brief) → reviewer → Thando (QA) → deploy

---

## Phase 2 — French (2–4 months)

**Goal:** Enable French for Francophone African learners.

**Why French second:** 97% complete — highest completeness of any non-English language. Primary audience: DRC, Cameroon, Côte d'Ivoire, Rwanda — not European French.

**Action items:**
1. **Post a brief** for:
   > "Francophone African native speaker (DRC, Cameroon, or SA preferred), ~1–2 days of work, reviewing AI literacy course content in French. Task: check ~460 translation strings for accuracy AND African contextual fit (phrasing, professional register, cultural resonance). Avoid European French idioms where African alternatives exist. R2,000–R4,000 estimated budget."
2. **Share the reviewer:** `translations.js` — the `fr: { ... }` block only
3. **Test:** Same as Phase 1 — walk all key pages in French after enabling
4. **Commit and deploy**

**Owner:** Thando (post brief) → reviewer → Thando (QA) → deploy

**Note:** The existing French translation was done carefully (97% complete, professional quality) but has not been reviewed by a Francophone African — some phrasing may read as European French. The reviewer's job is primarily context and register, not accuracy.

---

## Phase 3 — isiZulu (3–6 months)

**Goal:** Full isiZulu translation of all course content.

**Why isiZulu is harder:** Only 25% complete. The remaining 75% (~360 keys) includes all module content, assessments, and long-form explanatory text. This is a substantive translation commission, not a review.

**Action items:**
1. **Identify a qualified isiZulu translator** with educational content experience. Options:
   - UCT African Language Studies department (translation services or student referral)
   - South African Translators' Institute (SATI) — sati.org.za — certified member directory
   - Upwork with isiZulu + education filter
2. **Brief:** Full translation of ~360 AI literacy education strings, including module content, case studies, assessment rubrics, and UI text. Professional register, adult learner audience. Budget: R8,000–R15,000 estimated (5–10 days of work).
3. **Provide context:** Share the English module content alongside the existing 25% ZU translation as reference for style and register
4. **Human QA:** Have a second isiZulu speaker (different from translator) spot-check 20% of strings before publishing
5. **Test and deploy**

**Owner:** Thando (source translator, brief) → translator → QA reviewer → Thando (final check) → deploy

---

## Phase 4 — MzansiLM Integration (6–12 months)

**Goal:** Use South African AI research to assist translation and add academic credibility.

**What MzansiLM is:** A 125M-parameter open-source LLM from UCT covering all 11 official SA written languages (CC BY 4.0 license). Available free on HuggingFace. Too small for general conversation but well-suited to narrow structured tasks like translation drafting.

**Potential uses:**
- **Translation drafting pipeline:** Fine-tune MzansiLM on bilingual SA educational content to generate first-draft translations for human review. Reduces Phase 3 costs and speeds up future language additions (Sesotho, Sepedi, etc.)
- **Curriculum reference:** Add MzansiLM as a case study in Module 5 or 6 (African AI context / responsible AI). A real, citable example of African AI research that substantiates the "African-centered" positioning.

**Pre-requisites before starting Phase 4:**
- Phases 1–3 complete (all reviewed translations live)
- Technical resource available (fine-tuning requires a GPU or cloud compute budget)
- Clear use case defined (translation drafting is the most practical starting point)

**Owner:** Thando + technical collaborator (TBD)

---

## Notes

- **Don't rush isiZulu:** A partially translated course where learners switch mid-sentence to English is worse than English-only. Only enable ZU when 100% of course content is translated and reviewed.
- **Sesotho, Sepedi, and other languages** are Phase 5+ — not in scope until Phase 3 is complete and the translation pipeline is proven.
- **MzansiLM reference in curriculum** (Phase 4 curriculum step) can happen independently of the translation work — adding a paragraph about MzansiLM to Module 5/6 costs nothing and can be done any time.
