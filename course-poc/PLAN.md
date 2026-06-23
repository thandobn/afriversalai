# Plan: Apply Module-0 Architecture to All Modules + Build Modules 2–6

_Last updated: 2026-06-23_

## Context

Module-0 is the gold standard: 4-phase structure (Encounter → Reflect → Concept → Apply), phase-screen system within each phase, sticky progress tracker, lesson dot tracker, knowledge checks (multiple-choice), interactive exercises, glossary links, model-answer reveal, auth-aware restoration.

Current state:
- Module-1: Has real content (DCDT hallucination case + Funda Five Apply) but uses simpler advance() JS, no knowledge check, no lesson dots, no interactive exercises
- Modules 2–6: **Do not exist** — outlines only, full content must be authored
- Sector modules (7): Partial stubs with content, use advancePhase() pattern, no knowledge checks, no lesson dots

The user wants: module-0 architecture applied consistently, no content repetition across modules, knowledge checks + glossary terms introduced where they fit naturally.

---

## What "Module-0 Architecture" Means for Each Module

These are the elements to carry forward (not all are mandatory for every phase):

| Element | Required | Notes |
|---------|----------|-------|
| 4-phase structure | Always | Encounter → Reflect → Concept → Apply |
| Phase-screen system (showScreen) | Concept + quiz only | Only where a phase has 2+ screens |
| Sticky progress tracker | Always | prog-0 through prog-3 |
| Lesson dot tracker | Long reading phases only | Only if Concept has 4+ distinct sections |
| Interactive Encounter (not just read) | Always | Artifact + action, not passive reading |
| Reflection textareas | Always | Branching question optional |
| Multiple-choice knowledge check | After Concept | 3–5 questions, all-correct to advance |
| Funda Five Apply | Always | 5 textareas (TASK/DATA/TOOL/TRUST/HUMAN) |
| Model answer reveal | Always | On Apply submit |
| Inline glossary links | Where terms introduced | Link to glossary.html#term |
| External resources section | Concept phase | 2–3 curated links |
| saveProgress calls | Always | Phase 0–3, 0-indexed |
| Auth restore on revisit | Always | Restore completed phases + completion state |
| Teaser gate (guests after Phase 1) | Module-0 only | Others require auth (requireAuth pattern) |

---

## Module Content Arc (No Repetition)

Module-0 covers: AI definition, 4 AI types, limitations (hallucination, bias), prediction concept, AI/not-AI identification.

Each module builds — never re-explains:

| Module | New Concept | Builds On | SA Case |
|--------|-------------|-----------|---------|
| 1 | Hallucination in depth, citation signals, Funda Five intro | M0: hallucination named | DCDT Policy Scandal (Apr 2026) |
| 2 | How AI learns from data, training bias, proxy discrimination, feedback loops | M0: bias named; M1: data quality | African Fintech Credit Scoring Bias |
| 3 | Algorithmic bias definition, disparate impact, SA EEA/POPIA in AI context | M2: bias introduced | SA Predictive Policing |
| 4 | Deepfakes + synthetic media, verification methods, personal checklist | M1: Trust step of Funda Five | SA 2024 Election Deepfakes |
| 5 | Accountability chain mapping, organisational channels, governance structures | M3: accountability mentioned | AI Recruitment + EEA Liability |
| 6 | Full Funda Five synthesis, professional AI judgment statement | All prior modules | Dr Math vs Clinical AI |

Glossary terms to introduce per module (link inline on first use):
- M1: Hallucination, LLM, Generative AI (review), Prompt
- M2: Training Data, Bias (AI Bias), Machine Learning, Feedback Loop, Proxy Discrimination
- M3: Algorithmic Bias, Disparate Impact, Protected Characteristic
- M4: Deepfake, Synthetic Media, RAG
- M5: Accountability, Governance, POPIA, EEA
- M6: Responsible AI (synthesis term)

---

## Build Status

### Phase A — Sector modules 7 (architecture upgrade)

| Module | Status |
|--------|--------|
| module-7-corporate.html | DONE — committed 1229a26 |
| module-7-education.html | In progress (agent running) |
| module-7-finance.html | In progress (agent running) |
| module-7-government.html | In progress (agent running) |
| module-7-healthcare.html | In progress (agent running) |

### Phase B — Core modules 1 upgrade

| Module | Status |
|--------|--------|
| module-1.html | DONE — Concept phase-screen + knowledge check added |

### Phase C — Core modules 2–6 (full authoring needed)

| Module | Status |
|--------|--------|
| module-2.html | Not started — CREATE (Fintech credit bias case) |
| module-3.html | Not started — CREATE (Predictive policing + EEA) |
| module-4.html | Not started — CREATE (Election deepfakes) |
| module-5.html | Not started — CREATE (AI recruitment accountability) |
| module-6.html | Not started — CREATE (Dr Math synthesis) |

---

## Module Template for Modules 2–6

Each module follows this exact structure (HTML IDs standardized):

```
Phase 0 (Encounter): phase-0, prog-0
  Screen: ps-0-content (artifact + 1 reaction textarea + advance button)

Phase 1 (Reflect): phase-1, prog-1
  Screen: ps-1-reflect (2-3 reflection textareas + advance to Concept)

Phase 2 (Concept): phase-2, prog-2
  Screen: ps-2-content (3-5 concept sections + glossary links + resources + "Take quiz →")
  Screen: ps-2-quiz (3-5 MC questions, all-correct to advance)

Phase 3 (Apply): phase-3, prog-3
  Screen: ps-3-content (Funda Five 5 textareas + submit)
  → On submit: model answers appear + completion block

Module-complete: module-complete div (hidden, shown on Apply submit)
```

JS functions per module:
- `showPhase(n)` — same as module-0
- `showScreen(phaseNum, screenId)` — same as module-0
- `advancePhase(fromPhase)` — saves progress, unlocks next phase
- `submitQuiz()` — validates MC, shows feedback, unlocks Apply on all-correct
- `completeModule()` — saves final phase, shows model answers, shows completion block
- Auth IIFE at bottom: requireAuth + progress restore pattern

---

## Verification Checklist (Per Module)

1. Guest view: requireAuth gate working correctly
2. Logged-in flow: phase unlocks sequentially, progress saves to Supabase
3. Return visit: phases restore correctly, completion screen shows alone
4. Knowledge check: all-correct required, retry works, feedback per question
5. Apply submit: model answers appear, completion block shown, progress saved
6. Dashboard: module card shows correct badge (In progress / Complete)

---

## Open Question for Modules 2–6

Content authoring: all scenario text, concept explanations, quiz questions, and model answers need to be written from scratch. The outlines give topic + SA case + learning objectives. Claude can author this content — confirm at start of next session whether user has additional notes or drafts.
