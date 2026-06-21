# AfriversalAI — Strategic Notes

> Captured from a conversation with Arona Sarr (2026-06-21). These are directional ideas, not decisions. Read this before any major course restructure or product planning session.

---

## What This File Is

A running log of strategic ideas, product directions, and big-picture thoughts that came out of a conversation with Thando's dad. Organized by scope/horizon so nothing gets lost and nothing gets confused with what's actually on the table right now.

**Rule:** Course 1 stays the focus. Nothing in this file should distract from shipping Cohort 1.

---

## Scope Horizons

### Horizon 0 — Course 1 Changes (In Scope Now)

Things that should affect the current course, but need a proper plan before touching:

**H0.1 — Widen the case study lens**
Currently the case study library (Field 2 research) is 10 studies, 9 of which are SA-specific. This is correct for grounding, but Thando's point is valid: if we *only* use SA examples we pigeonhole learners and deprive them of pan-African and global context that makes them citizens of the world, not just SA professionals.

**Direction:** Keep SA as the center (the professional context, the laws, the employer). Expand the supporting material to include:
- 3-5 pan-African case studies (not just SA) — e.g., Rwanda's facial recognition rollout, Kenya's M-Pesa AI fraud detection, Nigeria fintech AI adoption, Ghana's digital government push
- 1-2 global cases where the lesson is universal (e.g., Amazon's recruitment AI, EU AI Act as a governance model)
- Frame it as: "This is not just a SA problem. Here's how it's playing out across Africa and the world — and what we can learn from it."

The Field 2 research file already notes it needs 2-3 more success cases. This is the moment to add pan-African successes.

**Action:** Research sprint on pan-African + 2 global case studies. Add to Field 2 before finalizing Module 7 sector content.

---

**H0.2 — Module flow restructure question**
Thando's concern: modules need to build on each other in a logical linear way. "What is an LLM, what is a neural network" needs to be taught before you can talk about failure modes or bias intelligently.

Current proposed 7-module structure is:
- Module 0: AI Fundamentals (free preview) — already covers what AI is, types, etc.
- Module 1: What AI Actually Is (LLM case study)
- Module 2: How AI Learns and Fails
- Module 3: Bias and Discrimination
- Module 4: Verification and Trust
- Module 5: Ethics and Governance
- Module 6: AI and Your Work
- Module 7: Sector Track

**Assessment:** The flow is already fairly linear. Module 0 introduces fundamentals. Module 1-2 go deeper on what AI is and how it learns. The question is whether the conceptual depth (LLM internals, neural networks at a conceptual level) is sufficient in Modules 0-2, or whether learners are expected to engage with ethical/governance implications before they fully understand the mechanism.

**Action before restructuring:** Map each module against the 18-competency framework (Field 3) and confirm which competencies are met where. If there's a gap in conceptual grounding before critical evaluation starts, that's where to add depth — not by adding a whole new module, but by strengthening Module 1-2 content. Do this as a review task before Cohort 2 curriculum sprint.

---

**H0.3 — Ethics and governance needs to be front and center, not an afterthought**
Currently Domain 4 (Ethics & Governance) is in the competency framework but it's module 5. Thando's instinct from the call: the "AI Hippocratic oath" idea signals that ethics shouldn't feel like a separate module — it should be woven through every module as a thread.

**Direction:** Keep Module 5 as the dedicated governance module. But add an ethics thread to every module — a recurring prompt: "Who is accountable for this? What happens when this goes wrong for a person?" This is already implicit in the Funda Five (step 5: "Who checks the output before it matters?") — make it explicit.

---

**H0.4 — Africa's unique AI use case as a differentiator: make it explicit**
The insight from the call: US/Europe is using AI for automation and efficiency. Africa is using AI to close knowledge gaps, connect communities, and solve structural problems that wealthy countries solved differently. This is a meaningfully different relationship with AI — and it belongs in the course framing.

**Direction:** In Module 0 or the course introduction, add a framing section: "How Africa uses AI — and why it's different." Not to be Afrocentric in a defensive way — to be accurate. Rwanda's healthcare diagnostic AI, Kenya's mobile lending, SA's electricity grid optimization — these are not the same as replacing a call center worker in Ohio. This gives learners pride of context, not just caution about risk.

---

**H0.5 — Technology adoption cycles — give learners historical grounding**
Thando's dad's point: "This is not new. We did this with phones. With computers." The anxiety around AI is real but it echoes every major technology shift. People who survived and thrived through the introduction of ATMs, the internet, smartphones — those skills are the same skills that will help them with AI.

**Direction:** Add a 2-3 paragraph framing in Module 0 or the course introduction that situates AI in the history of technology adoption. Not to minimize AI's distinctiveness — but to reduce the paralysis that comes from thinking "this is unprecedented."

---

### Horizon 1 — Course 2 (Future Product, Not Now)

A second course: deeper, tool-focused, builds on Course 1 literacy foundation.

**Working name:** "AI in Practice" or "Working with AI" (find a good name later — don't let naming block planning)

**What goes in it:**
- Deep dive on 3-4 key tools:
  - **NotebookLM** — research synthesis, knowledge management
  - **Claude / Claude Code** — building with AI, advanced prompting, vibe coding
  - **Copilot Studio** — enterprise AI automation, workflow building
- **Prompt engineering** as a standalone module — how to actually communicate with AI effectively, not just ask questions
- **Vibe coding** — non-technical people using AI to build things (Thando and Claude building this site is the proof of concept)
- **Resources library** — curated reading lists, podcasts, YouTube channels, newsletters for people who want to go deeper
- This course = the "how to work alongside AI" course; Course 1 = the "how to think about AI" course

**Prerequisite:** Course 1 (or equivalent demonstrated literacy)

**Note:** Some of the resources library (podcasts, reading) could launch as a bonus for Course 1 registered learners — low effort, high value, builds community. Separate from Course 2.

---

### Horizon 2 — Side Quests (Long-Term, Not For Now)

**H2.1 — Ndebele LLM / AI for language preservation**
The idea: if endangered African languages lack training data, they get left behind by AI. A language that isn't in AI systems effectively disappears from the digital world. Building a Ndebele LLM — or more broadly contributing to African language AI datasets — is a genuine cultural preservation act.

**Status:** Thando flagged this as a side quest. Someone is probably already working on this (Masakhane project in SA does exactly this — research it). But it's worth knowing and potentially partnering with rather than reinventing.

**Next step if/when revisiting:** Search Masakhane, Lacuna Fund, and Mozilla Common Voice for existing Ndebele/Ndau/Shona corpus work before scoping anything.

---

**H2.2 — AI Hippocratic Oath / AI governance advocacy**
The idea: AI is powerful enough that the people who build and deploy it need an ethical oath analogous to medicine's Hippocratic Oath. This is a real policy conversation happening globally — the EU AI Act, UNESCO's AI Ethics Recommendation, NIST AI Risk Management Framework are all steps in this direction.

**Why this matters for AfriversalAI:** The ethics and governance thread in Course 1 (Domain 4) positions graduates to participate in these conversations. Over time, if AfriversalAI builds credibility and alumni, there's a role to play in African AI governance advocacy — graduates who can articulate what responsible AI deployment looks like in African professional contexts.

**Status:** Background thought. Not actionable now. Park it and revisit at 500 alumni.

---

**H2.3 — Pan-continental scope beyond SA**
Thando's instinct: "I don't want to limit us and deprive us of continent-wide opportunities." SA is the right starting market (regulatory environment, SETA system, professional development culture, English + major African languages). But the course content, the brand, and the eventual geographic footprint should always have been designed for Africa, not just SA.

**What this means practically:**
- Case studies: Africa-wide (already being addressed in H0.1)
- Brand: "AI Literacy for African Professionals" — already present in tagline
- Future markets: Nigeria (large professional class, fast AI adoption), Kenya (tech-forward, English-dominant), Ghana (growing corporate sector), Rwanda (government AI commitment)
- Partnerships: pan-African professional associations (ACCA Africa, HRCI Africa, etc.) rather than only SA-specific

**Status:** Plant the flag now, execute later. Make sure nothing built for Cohort 1 is hard-coded to SA in a way that prevents expansion.

---

## Key Questions Before Touching Course 1 Structure

These need answers before any module restructure happens. Don't restructure without deciding these first.

1. **Is the current module order actually broken, or does it just need deeper content in Modules 0-2?** The flow (fundamentals → learning mechanism → bias → verification → ethics → application) is defensible. Before restructuring, confirm whether the issue is *order* or *depth*.

2. **When does the module restructure happen?** Before Cohort 1 (risky — delays launch) or after Cohort 1 uses it as a test (safer — real learner data informs the change)?

3. **Is "AI Literacy 101" a rename of Course 1, or a lighter course that comes before Course 1?** If Course 1 is already the 101-level course, the name makes sense. If Thando means there should be something even more entry-level before Course 1, that's a different product decision.

---

## Research Gaps Raised by This Conversation

| Gap | Why It Matters | Priority |
|-----|----------------|----------|
| Pan-African AI adoption landscape — what is happening continent-wide, not just SA? | Feeds H0.1 case study expansion; makes "African-centered" claim continent-wide, not SA-narrow | High |
| Asia/China/Japan AI leadership — what should African professionals know about global AI power dynamics? | Positions learners as global citizens, not just SA/African professionals | Medium |
| Masakhane + African language AI datasets — is Ndebele LLM already being worked on? | Avoids reinventing; potential partner/reference | Low (when H2.1 becomes active) |
| Existing pan-African AI literacy courses — are there continent-wide competitors we haven't mapped? | Field 6 research was SA-only; expand for Horizon 1 expansion planning | Medium |

---

## What Thando Said About Her Own Learning

"I'm realizing just how out of my depth with this AI thing I might be... even me trying to build this course I have so much to learn."

This is worth noting not as a vulnerability — it's an asset. The people who build the best learning experiences for something are often the people who are in the middle of learning it themselves. You know exactly what the learner needs because you are the learner. The mistakes you make building this are exactly what your learners will encounter. Don't try to be ahead of where you actually are — teach from honest experience.

---

*Last updated: 2026-06-21 — captured from conversation with Arona Sarr*
