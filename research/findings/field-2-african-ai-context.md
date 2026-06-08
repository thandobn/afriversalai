# Field 2 — African AI Context & Case Studies

> Status: 🟡 Draft (10 case studies documented — meets DoD minimum; more to add as research continues)
> Output artifact: African AI case study library — SA-specific documented examples by sector
> Enables: The differentiating course content; feeds all track-specific modules; makes "African-centered" claim operational

Last updated: 2026-06-07

---

## Why This Field Exists

Funda's primary competitive claim is "African-centered AI literacy." That claim is empty marketing unless the course contains:
- Real African AI deployments (not generic Western corporate examples)
- Documented African AI failures, biases, and blind spots
- Lessons drawn from African professional contexts

This library is what competitors cannot replicate. Every case study documented here is a teaching asset that compounds over time.

---

## Case Study Library

### CASE 001 — SA Government AI Policy Hallucination Scandal
**Sector:** Government / public administration
**Country:** South Africa
**Date:** April 2026
**Source:** The Conversation, CNBC Africa, African Business, The Register

**What happened:**
The Department of Communications and Digital Technologies (DCDT) published an 86-page Draft National AI Policy on April 10, 2026. Within 16 days, journalists discovered the document contained fabricated academic citations. Two categories of fabrication were found: (1) references to journals that do not exist, and (2) references to real journals where the cited articles were never actually published. The fabrications created "seemingly credible African scholarly authority" by falsely attributing work to respected African researchers and institutions. The Minister of Communications confirmed that generative AI was used in drafting without proper human verification. The policy was withdrawn. SA must now restart major portions of the consultation process with no new timeline set.

**Why it matters for the course:**
This is not an abstract risk — it happened at the highest level of SA government, to the very people responsible for governing AI. The professionals who drafted this document did not have the skills to verify AI output. They knew how to use the tool. They did not know when to question it.

**Teaching use:** Module on verifying AI outputs. Opening case study for the course — the SA government's own AI policy was compromised by unverified AI use. That's the stakes.

**Lesson for learners:** *"The problem was not a technical glitch but a failure of oversight. Generative AI was used without proper human verification."* — Minister of Communications. Using AI ≠ trusting AI.

---

### CASE 002 — SA Predictive Policing Bias
**Sector:** Law enforcement / public safety
**Country:** South Africa
**Date:** Ongoing (documented in 2024 PMC article)
**Source:** Frontiers in Research Metrics & Analytics / PMC

**What happened:**
Predictive policing algorithms deployed in South Africa targeted low-income communities, resulting in increased surveillance and harassment of innocent individuals. Systems trained on historical crime data reproduced historical patterns of policing, which in SA reflect decades of apartheid-era over-policing of Black townships and informal settlements.

**Why it matters:**
When a system learns from biased historical data, it treats those biases as objective facts. In SA, apartheid-era policing concentrated arrests in specific geographic and racial communities. An AI system trained on arrest records learns: "these areas and people are high risk." It then recommends more policing of those areas. More arrests happen. The model is "confirmed." This is a feedback loop that encodes structural racism into an algorithm.

**Teaching use:** Module on bias, data, and structural inequality. How AI inherits the biases of the world it learned from — even when no one intends discrimination.

**Lesson for learners:** AI systems don't create bias from nothing. They amplify patterns that already exist in data. In SA, data carries the history of apartheid. That means AI trained on SA data without careful bias auditing is likely to reproduce apartheid-era inequalities.

---

### CASE 003 — Facial Recognition Misidentification Across African Countries
**Sector:** Identity / biometrics / law enforcement
**Countries:** SA, Rwanda, Senegal (multi-country study)
**Date:** Buolamwini & Gebru 2018; ongoing commercial deployment through 2025
**Source:** PMC / Frontiers (citing Buolamwini & Gebru)

**What happened:**
A landmark study tested commercial facial recognition APIs (used by major technology companies) across 1,270 participants from Rwanda, Senegal, South Africa, Iceland, Finland, and Sweden. Finding: dark-skinned women were misclassified at substantially higher rates than light-skinned men. These same APIs are deployed in commercial applications across Africa — including banking KYC (Know Your Customer), border control, and law enforcement — despite never having been validated for African faces.

**Why it matters:**
SA uses facial recognition in multiple contexts: SARS (tax administration), Home Affairs (identity verification), banking sector KYC compliance. The tools used were predominantly built on datasets of Western faces and validated for Western populations.

**Teaching use:** Module on AI training data and who it represents. The principle that AI tools built for one population do not automatically work for others — and the risk of deploying them without validation.

**Lesson for learners:** An AI tool that "works" in general may not work for you specifically. Before trusting a system's outputs, ask: "Was this validated for people like my clients? My population? My context?"

---

### CASE 004 — African Fintech Credit Scoring: 37% Gender Penalty
**Sector:** Finance / lending
**Countries:** South Africa, Nigeria, Kenya
**Date:** 2025 (published study)
**Source:** Advanced Research Journal; PMC algorithmic bias article

**What happened:**
A 2025 audit of 10 credit scoring algorithms used by conventional banks and fintechs across SA, Nigeria, and Kenya found that women-led SMEs faced a 37% underfunding penalty compared to similarly-positioned male-led businesses. The bias operated through hidden proxies: (1) sector-based risk misclassification — industries where women are concentrated (care work, informal retail, hair care) were categorized as higher-risk than industries dominated by men with similar actual default rates; (2) linguistic bias — language associated with communal decision-making and relationship-based leadership (more common in women's business descriptions) was penalized versus language associated with individual authority and hierarchy.

**Why it matters:**
This is a real SA financial system case. The SA banking sector uses AI credit scoring. The banks did not intend to discriminate. No individual loan officer decided to deny women credit. The algorithm did it systematically, invisibly.

**Teaching use:** Module on AI bias in professional decisions. How discrimination can happen without discriminatory intent. What it means to "audit" an AI system.

**Lesson for learners:** When an AI system makes decisions that affect people, "the algorithm decided" is not a complete or acceptable explanation. Someone is accountable for the outcomes — and that someone works at the institution deploying the algorithm.

---

### CASE 005 — Kenya Mobile Lending: Digital Footprint Exclusion
**Sector:** Finance / digital lending
**Country:** Kenya (proximate to SA; relevant to Southern Africa context)
**Date:** Documented 2024
**Source:** PMC / Frontiers algorithmic bias article

**What happened:**
Kenya's digital lending apps (M-Shwari, Tala, Branch, and others) score creditworthiness using micro-behavioral data: browsing history, app usage, social media activity, contact list characteristics. Users with limited mobile data access or older phones accumulate less digital footprint and receive worse credit scores — regardless of their actual repayment behavior or financial position. Women, rural borrowers, and first-time smartphone users are disproportionately affected.

**Why it matters:**
The platform assumes that digital activity = credit behavior. But in Africa, digital activity = access to data, electricity, smartphones, and time. This means an AI system designed for "objective" credit assessment actually measures infrastructure inequality.

**Teaching use:** Module on what AI measures vs. what it's meant to measure. Proxy discrimination. The gap between a model's stated purpose and its actual function.

**Lesson for learners:** Every AI system measures something it can see in data and uses it as a proxy for something it cannot directly measure. The question is: does that proxy actually work? And does it work equally for everyone?

---

### CASE 006 — SA 2024 Election Deepfake Videos
**Sector:** Politics / media / public information
**Country:** South Africa
**Date:** May 2024 (SA general election)
**Source:** PMC algorithmic bias article; CIPESA State of Internet Freedom in Africa 2025

**What happened:**
During South Africa's May 2024 general elections, AI-generated deepfake videos were circulated across social media to manipulate voter perceptions and falsely endorse political entities. Videos appeared to show political figures making statements they never made. The content was indistinguishable from genuine footage for most ordinary viewers.

**Why it matters:**
SA voters exercised their democratic right in the context of AI-generated political manipulation. No specific deepfake regulation existed at the time. SA media organizations lacked the verification tools or protocols to systematically flag synthetic content.

**Teaching use:** Module on AI-generated content and verification. The skill of evaluating AI-produced media. Relevance to any professional context where you receive communications (email, video, audio) that may be AI-generated.

**Lesson for learners:** AI-generated content is not limited to text. It extends to images, video, and audio. The skill of "verifying AI outputs" now includes visual and audio media. This is not a future problem — it happened in SA in 2024.

---

### CASE 007 — AI Recruitment Algorithms and SA Employment Equity Act Exposure
**Sector:** Human resources / employment
**Country:** South Africa (legal context); global cases (analogous)
**Date:** 2025 (CDH legal alert)
**Source:** Cliffe Dekker Hofmeyr Employment Law Alert, September 2025

**What happened:**
SA law firm Cliffe Dekker Hofmeyr (CDH) issued a 2025 legal alert warning SA employers that AI recruitment tools expose them to liability under the Employment Equity Act 55 of 1998. The Act prohibits unfair discrimination in employment on grounds including race, gender, age, and disability. CDH's analysis: if an AI tool used in recruitment or employment decisions produces discriminatory outcomes, the employer is liable — even if the AI made the decision, not the human.

The global precedents cited: Amazon's AI recruitment tool (trained on historical male-dominated hiring data) systematically downgraded applications that included the word "women." University of Washington research found AI consistently favored names associated with White men.

**Why it matters:**
SA law has not yet produced specific AI bias cases in employment. But the legal framework exists. CDH's alert signals that SA is in a pre-litigation window — companies are using AI tools without understanding their Employment Equity Act exposure.

**Teaching use:** Module on AI governance and accountability in SA. Who is responsible when an AI makes a discriminatory decision. Why "the algorithm decided" is not a legal defense.

**Lesson for learners:** HR professionals using AI for shortlisting, performance assessment, or promotion decisions are personally and organizationally exposed if those systems produce discriminatory outcomes. You cannot outsource accountability to software.

---

### CASE 008 — SA MyBucks AI Credit Scoring: The "It Works" vs. "It's Fair" Problem
**Sector:** Finance / fintech
**Country:** South Africa
**Date:** 2025 documentation
**Source:** Research on AI credit systems for underserved populations

**What happened:**
MyBucks, a fintech operating in South Africa, deployed AI credit scoring that reduced loan default rates by 18% — a measurable business success. But the same analysis flagged ongoing challenges: algorithmic bias, lack of transparency in "black-box" models, and regulatory compliance gaps. The system produced better average outcomes but used opaque decision-making that could not be audited for individual fairness.

**Why it matters:**
This is the "it works on average" problem. When an AI system improves aggregate outcomes, it can simultaneously produce discriminatory outcomes for specific individuals or groups — and the black-box nature of the model makes it impossible to know. In a lending context, this means some individuals may be systematically denied credit they deserve, with no recourse because the decision is unexplainable.

**Teaching use:** Module on explainability and the right to an explanation. The difference between system-level performance and individual-level fairness. Why governance requires more than "it works."

**Lesson for learners:** Improving efficiency is not the same as improving fairness. When AI makes decisions that affect individual livelihoods — credit, hiring, healthcare — "it performs better on average" is not sufficient justification. Individuals deserve an explanation.

---

### CASE 009 — SA Healthcare AI: Above-Average Adoption, Below-Average Validation
**Sector:** Healthcare
**Country:** South Africa
**Date:** 2024–2025
**Source:** SA Medical Journal / South African Medical Journal (SAMJ); IT News Africa

**What happened:**
SA healthcare leaders report above-global-average AI adoption for treatment planning (61%), in-hospital monitoring (60%), preventive care (60%), and medication management (57%). Context: in early 2024, 800 newly qualified SA doctors were left unemployed due to budget cuts while simultaneously AI was filling clinical decision gaps in under-resourced public hospitals.

Expert analysis flagged the specific risk: "Success depends on interoperable data, bias-aware AI models trained on local datasets, and robust ethical frameworks." But SA clinical AI adoption is currently ahead of its validation infrastructure — models are deployed before they are validated for South African patient populations, disease presentations, and clinical contexts.

**Why it matters:**
Clinical AI errors are not just inefficiencies. They are misdiagnoses, incorrect medication dosages, missed conditions. When clinical AI is deployed on populations different from those it was trained on, the error rate increases disproportionately for patients who don't match the training profile (typically non-Western, lower-income, different disease burdens).

**Teaching use:** Module on high-stakes AI deployment and the responsibility to validate. When AI errors have human consequences. The gap between "deployed" and "validated."

**Lesson for learners:** The same AI judgment skills apply across sectors. The question "has this been validated for our specific context?" is relevant whether you're a clinician reviewing a diagnostic AI or an HR manager using a recruitment tool.

---

### CASE 010 — Dr Math: AI Education Success in Under-Resourced SA Schools
**Sector:** Education
**Country:** South Africa
**Date:** Ongoing (CSIR project)
**Source:** UNESCO case studies; government documentation

**What happened:**
The Council for Scientific and Industrial Research (CSIR) deployed an AI-powered mathematics tutoring system called "Dr Math" to assist students across South Africa — particularly in under-resourced schools without access to qualified mathematics tutors. The system uses conversational AI to provide after-hours support to learners who would otherwise have no access to tutoring.

**Why it matters:**
This is a success case — AI deployed thoughtfully, with a clear purpose (expanding access, not replacing teachers), in a context where the alternative was nothing. Dr Math illustrates that AI can genuinely extend access and opportunity in under-resourced African contexts when: (a) the purpose is clear, (b) the deployment context is understood, and (c) the system augments rather than replaces human judgment.

**Teaching use:** Counterpoint to the failure cases. What responsible AI deployment looks like. The difference between "AI as access expansion" and "AI as replacement." Also: AI that works in one SA context (urban, phone-based tutoring) would fail in a different context (rural, low-connectivity).

**Lesson for learners:** The question is not "AI: yes or no?" It's "AI: for what purpose, for whom, in what context, with what validation?" Dr Math answers these questions well. Many deployments don't.

---

## Case Study Coverage Map

| Sector | Cases | Failures | Successes | SA-Specific |
|--------|-------|----------|-----------|-------------|
| Government | 001 | 1 | 0 | ✅ SA |
| Law enforcement | 002 | 1 | 0 | ✅ SA |
| Biometrics/ID | 003 | 1 | 0 | ✅ SA incl. |
| Finance/credit | 004, 005, 008 | 3 | 0 | ✅ SA |
| Elections/media | 006 | 1 | 0 | ✅ SA |
| HR/employment | 007 | 1 | 0 | ✅ SA legal |
| Healthcare | 009 | 1 | 0 | ✅ SA |
| Education | 010 | 0 | 1 | ✅ SA |

**Current balance: 9 failure/risk cases, 1 success case.** Need 2-3 more success cases for balance. Research to continue.

---

## Key Themes Across Cases

**1. "It works" ≠ "It's fair"** (Cases 004, 008)
AI systems can improve aggregate outcomes while simultaneously producing discriminatory results for specific individuals or groups. Performance metrics and fairness metrics are different measurements.

**2. AI inherits the biases of the world it learned from** (Cases 002, 003, 004, 005)
In SA, data carries the history of apartheid, gender inequality, and unequal digital access. AI trained on SA data without bias auditing will reproduce SA's structural inequalities.

**3. Verification is a professional skill, not a technical one** (Cases 001, 006)
The SA government's AI policy hallucination scandal was not a technical failure — it was a governance failure. The skill of verifying AI outputs is what Funda is training.

**4. "The algorithm decided" is not an acceptable explanation** (Cases 004, 007, 008)
When AI makes decisions that affect people — credit, employment, healthcare, justice — someone is accountable. That someone works at the institution that deployed the AI.

**5. Context matters: what works elsewhere may not work here** (Cases 003, 009, 010)
AI tools built for Western populations, validated on Western data, deployed in African professional contexts without validation are a recurring risk pattern.

---

## Priority Cases for Core Track

For the core module that every learner takes regardless of sector track, the highest-priority cases are:

1. **Case 001** (DCDT Policy Scandal) — SA-specific, recent, relatable to any professional context, directly shows why AI judgment matters
2. **Case 004** (Credit Scoring Gender Bias) — SA-specific, quantified (37%), illustrates structural bias without visible discriminatory intent
3. **Case 006** (Election Deepfakes) — SA-specific, 2024, universally relatable as a citizen, expands AI awareness beyond work contexts
4. **Case 010** (Dr Math) — The success case; prevents course from feeling purely dystopian; shows thoughtful deployment works

---

## Sources

- The Conversation — [SA AI Policy fake citations](https://theconversation.com/south-africas-ai-policy-cited-fake-research-created-by-ai-what-lessons-need-to-be-learned-281671)
- CNBC Africa — [SA AI policy withdrawal](https://www.cnbcafrica.com/2026/south-africa-pulls-ai-policy-after-hallucinated-citations-expose-drafting-scandal)
- PMC / Frontiers — [Algorithmic bias in Africa](https://pmc.ncbi.nlm.nih.gov/articles/PMC11540688/)
- Advanced Research Journal — [37% gender penalty in credit scoring](https://ar-journal.com/index.php/pub/article/view/76)
- CDH Employment Law Alert — [SA AI bias and Employment Equity Act](https://www.cliffedekkerhofmeyr.com/en/news/publications/2025/Practice/Employment-Law/Combined-employment-law-and-knowledge-management-alert-26-sept-How-algorithmic-bias-in-AI-hurts-your-business-and-what-you-can-do)
- SA Medical Journal — [AI in SA healthcare](https://www.samajournals.co.za/index.php/samj/article/view/3672)
- CIPESA — [State of Internet Freedom in Africa 2025](https://cipesa.org/2025/09/state-of-internet-freedom-in-africa-report/)
