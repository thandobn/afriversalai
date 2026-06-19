# Learning Design Research — AfriversalAI
*Compiled 2026-06-19. For use when enhancing module design.*

## Source platforms studied
Crash Course, Khan Academy, Duolingo, Brilliant.org, Coursera/edX MOOC research.

---

## Top 3 highest-ROI changes (implement first)

1. **Mid-Phase-3 retrieval question** — after explaining the first 2 Funda Five concepts, pause with: "Using Task and Data — how would you classify the Phase 1 scenario?" Testing mid-lesson outperforms end-of-lesson quizzes for long-term retention (Roediger & Karpicke 2006).

2. **12–15 minute hard cap per module + time shown at top** — Professionals have ~24 min/week for learning (Bersin/Deloitte). Completion rates: under 5 min → 74%, over 15 min → 36%. Module they finish in one sitting beats a comprehensive one they abandon.

3. **Phase 1 prediction prompt** — one sentence before the artifact: "Before you read — what do you predict is happening here?" Generation effect: wrong attempts deepen encoding 40–60% more than no attempt. Costs nothing to implement.

---

## Full enhancement table (within/between phases)

| When | What | Why |
|------|------|-----|
| Phase 1 start | Single prediction prompt | Generation effect |
| Phase 1 start | 3-option emotional check ("Unsurprised / Uncertain / Concerned") | Activates emotional stance; revisit at end |
| Phase 2 | Free recall first ("What did you notice?") then guided questions | More effortful processing before prompts |
| Phase 2 | Confidence rating (1–5) on each reflection | Primes calibration awareness |
| Phase 3 | Mid-concept retrieval question after 2 Funda Five steps | Testing effect — mid-lesson >> post-lesson |
| Phase 3→4 | "Earlier you noticed X. Here's what's actually happening." | Narrative tension → release |
| Phase 4 | Compare-back: show model response, ask "What did you miss?" | Corrective feedback without live instructor |
| Module end | "Compare your Phase 1 reaction to now. Has your thinking shifted?" | Closes narrative loop; learner feels progress |
| Module start | Progress bar with Phase 1 pre-marked as "visited" | Endowed progress effect (34% vs 19% completion) |
| Cross-module | Module 2 opens with 3-question recap of Module 1 | Spaced repetition in content sequence — no backend needed |

---

## Key learning science principles

1. **Retrieval Practice (Testing Effect)** — Testing mid-lesson beats post-lesson. Roediger & Karpicke 2006: tested groups retained 61% vs 40% after one week.
2. **Spaced Repetition** — Re-present material just before the forgetting threshold. Build into content sequence (Module N+1 opens with Module N recap) since no backend.
3. **Interleaving** — Mix sectors across modules; don't group all corporate then all healthcare. 63% vs 20% on delayed tests.
4. **Desirable Difficulty (Bjork)** — Easy learning evaporates. Tell learners: "this is meant to feel slightly hard."
5. **Generation Effect** — Attempting an answer before seeing it, even incorrectly, deepens encoding of the subsequent explanation.
6. **Worked Examples for Novices** — Show the Funda Five applied to Phase 1 artifact before learners attempt Phase 4. Expertise reversal: once learners advance, flip to problem-first.
7. **Cognitive Load / Mayer's Principles** — One concept per screen. If narration added: don't show the same text on screen (redundancy effect hurts).
8. **Narrative + Emotional Engagement** — Narrative activates language + emotion + memory simultaneously. The Phase 3 callback to Phase 1 is the tension→release beat that keeps people reading.

---

## Red flags — looks engaging, hurts learning

- **Seductive details**: SA cultural narrative is valuable WHEN it IS the case study. It's a distraction when attached to it. Multiple studies show it reduces recall of relevant content.
- **Extrinsic gamification for professionals**: Hanus & Fox (2015) — adding badges/leaderboards *reduced* motivation vs. control. Progress bars (informational) = fine. Competitive leagues = not for HR managers/government officials.
- **Redundant text + audio**: if narration ever added, don't also show the full transcript. Forces two channels on the same content.
- **Post-lesson quiz as only retrieval**: current Module 0 quiz is good; Phase 3 needs mid-concept retrieval too.

---

## Completion rate research

- Raw MOOCs: 5–10% completion
- Professional certs without support: 30–40%
- With cohort/social accountability: 70–85%+ (Harvard Business School Online: 85%+)
- Module length: <5 min → 74% completion; >15 min → 36%
- Videos >12 min: dropout accelerates sharply regardless of quality

### What actually moves the needle for professionals
1. **Perceived relevance** — sector-specific Phase 4 is AfriversalAI's strongest retention mechanism
2. **Time clarity upfront** — "12 min · 4 phases" at module top reduces abandonment
3. **Accountability** — even a simple opt-in email reminder (Formspree) doubles engagement
4. **Endowed progress** — pre-mark Phase 1 as "started" on arrival (Zeigarnik effect)
5. **Short and complete** — self-contained episodes in one sitting beat serial chapters
6. **Social proof** — "87% of healthcare workers who completed this applied a concept within one week"

---

## What AfriversalAI already does RIGHT (don't change)

- **Encounter before Concept** = generation effect in practice (same as Brilliant.org)
- **Sector-specific Phase 4** = perceived relevance, strongest completion driver
- **Funda Five as a repeating framework** = natural interleaving and retrieval across modules
- **SA case studies** = authentic context, not seductive details (they ARE the learning)

---

*Sources: Roediger & Karpicke 2006, Mayer multimedia principles, Hanus & Fox 2015, Bersin/Deloitte L&D research, Nunes/Dreze endowed progress study, Bjork desirable difficulty framework, Khan Academy efficacy reports 2024, Duolingo engagement research 2026.*
