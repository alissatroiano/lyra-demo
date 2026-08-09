# Lyrah — Business Model

**Category:** Education & Human Potential
**Live product:** https://lyra-6050696394.us-east1.run.app
**Built by:** Alissa Troiano

> **DRAFT.** Items in `[BRACKETS]` need real numbers before submission. Everything outside brackets
> is verifiable in this repository or the live deployment.

---

## 1. How Lyrah uses AI to impact Education & Human Potential

Teachers don't have a knowledge problem. They have a preparation problem.

A STEM instructor with a solid lesson outline still faces hours of unpaid conversion work before it
can be taught: building slides, typing worksheets, writing an answer key, inventing a review game,
and hunting down replacements for the video links that died two years ago. That work is
administrative, repetitive, and almost entirely invisible — it happens at night, after the teaching
day is over.

It falls hardest on the people with the least institutional support. A district teacher has a
curriculum team. An afterschool STEM coordinator, a homeschool pod leader, a freelance enrichment
instructor — they have a text document and a Sunday evening.

**Lyrah converts curriculum into a taught lesson.** Paste in wordy material and it produces five
artifacts ready for a classroom:

1. **Smart Slideshow** — conceptual slides with instructor scripts and teaching guidance
2. **Hands-On Science Lab** — staggered, kid-safe experiment checklists with material tracking
3. **Printable Worksheets** — typeset, with a teacher answer-key toggle
4. **Smart Board Quiz** — a Jeopardy-style team review board with explanations
5. **Media Link Fixer** — detects dead or private links and generates high-yield replacement search terms

That last one matters more than it sounds. Broken media is the single most common reason a
perfectly good older lesson gets abandoned, and it's the least interesting problem to fix by hand.

**Gemini is the product, not a feature.** Two models do the work in the deployed application:
`gemini-3.5-flash` for curriculum transformation and pedagogical structuring, and
`gemini-3.1-flash-image` for classroom visuals. Without them there is no product — there is a text
box.

The impact claim is deliberately narrow: **Lyrah doesn't teach anyone. It gives the person who does
the teaching their evenings back**, and makes high-quality materials reachable for instructors
without a curriculum department behind them.

---

## 2. How we measure impact

The thing we claim to change is preparation time, so that's what we measure.

| Signal | What it tells us |
|---|---|
| **Time from input to usable lesson** | Instrumented directly — the core claim, measured not estimated |
| **Self-reported prep time saved** | Asked at generation: "how long would this have taken you?" |
| **Artifacts actually taught** | Generation is vanity; a printed worksheet or a run quiz board is real |
| **Repeat generations per instructor** | The honest retention signal — people don't return to tools that didn't help |
| **Modules used per lesson** | Whether the bundle matters, or one module carries the product |

The headline claims — **5.2 hours saved weekly, 82% reduction in prep time** — are currently
estimates. `[Replace with measured data from instructor testing: N instructors, before/after prep
time, artifacts taught.]`

**Longer-horizon signal we don't own yet:** whether richer materials change classroom outcomes.
That requires partner programs tracking their own results, and it's a year-two question, not a
hackathon claim.

**Stated limitation:** we measure instructor time and instructor judgment. Student learning
outcomes are downstream of this product and we don't claim them.

---

## 3. The business model

**B2C self-serve today, with a direct path into B2B.**

### Live now

**Lyrah Educator Pro — $19.99/month or $159/year** (a 34% annual discount). Unlimited curriculum
transformation across all five modules. Stripe checkout, live in the deployed application.

### Planned tiers

| Tier | Price | Buyer |
|---|---|---|
| **Creator Pro** | $15/mo | Independent educators, homeschool pods |
| **Enterprise Core** | $120/mo | Multi-site franchises, districts, community organisations — team collaboration, custom branding, bulk licensing |
| **Publisher API** | Contract | Educational publishers turning static textbooks into interactive activities |

`[Reconcile the shipped $19.99 price against the tier table before submission — pick one and make
the product and README agree.]`

### Acquisition

- **Direct, warm.** The initial channel is instructors reached personally — the fastest route to
  real usage data, and the only one that yields conversation as well as conversion.
- **Artifact-led growth.** Every worksheet and quiz board is shared with other teachers. Materials
  carry attribution; the product markets itself through its own output.
- **Community.** Afterschool and STEM enrichment networks are densely connected and share resources
  constantly. This category spreads by recommendation, not advertising.
- **B2C → B2B.** An instructor using Lyrah weekly is the warm introduction to the organisation that
  employs them. Individual adoption is the wedge; the site licence is the revenue.

### Value created

For the instructor: hours returned, and materials better than they had time to make.
For the organisation: consistent quality across sites without hiring a curriculum team.
For the publisher: static content becomes interactive without rebuilding it.

### Retention

Retention is seasonal by nature — teaching runs in terms, and summer is quiet. We design for that
rather than pretending otherwise: annual billing at a real discount, and a library that accumulates
so returning users find their previous work waiting.

The durable retention is organisational. Once a program's materials are produced in Lyrah, switching
means rebuilding a term's worth of content.

---

## 4. Sustaining operations

### Resource allocation

Solo founder, no outside capital, no salary drawn. Costs are hosting and model inference.

Priority order:

1. **Inference cost per lesson** — the only cost that scales with usage
2. **Instructor acquisition** — the source of both revenue and evidence
3. Everything else

### The margin question

A lesson generation is several Gemini calls, including image generation, which is the expensive
part. **Gross margin is a function of generations per subscriber per month.**

At $19.99 with a target ~80% margin, that's roughly `[$N]` of inference per subscriber. `[Insert:
measured cost per full lesson generation, and implied generations before margin inverts.]`

Two mitigations already in the codebase: **image compression** on upload, and **graceful fallback
to preloaded lessons** when keys are absent — so a cost spike degrades the experience rather than
the balance sheet.

### Threats, named plainly

- **Inference cost is someone else's pricing page.** Image generation dominates. Mitigations:
  caching generated assets, and moving text-heavy diagrams to deterministic SVG rendering rather
  than generated raster — cheaper, and text renders correctly.
- **Seasonality.** Revenue will dip in summer. Annual plans and camp/enrichment programs — which run
  precisely when schools don't — are the hedge.
- **Platform dependency.** Built on Gemini and Cloud Run. The abstraction is thin enough to move,
  but the quality bar is currently Gemini's.
- **Solo founder.** The real constraint. Everything routes through one person, and this project has
  already demonstrated what happens when that person's attention is divided.
- **Incumbents.** Large platforms could add lesson generation. Defensibility is not the model — it's
  the specific artifact set that afterschool STEM instructors actually need, which general tools
  don't produce.

### What changes after the hackathon

**Consolidation, and it's already happened.**

I built Lyrah, then spent several weeks on a second product — an AI interview-practice platform —
before recognising it was splitting my focus across two early-stage products with different buyers,
different infrastructure, and different failure modes. I've consolidated onto Lyrah: it has clearer
demand, a simpler operating model, and it's entirely mine to move on.

That decision cost time. It also produced the more useful conclusion: **an early product does not
fail from lack of ideas, it fails from divided attention.** The plan after the hackathon is
deliberately narrow — one product, one buyer, one metric. Instructors using Lyrah weekly, and the
measured hours it gives them back.

---

## 5. AI tools leveraged

**In the product:**

| Tool | Role |
|---|---|
| **Gemini 3.5 Flash** (`@google/genai`) | Curriculum transformation, pedagogical structuring, worksheets, quiz generation, dead-link analysis |
| **Gemini 3.1 Flash Image** | Classroom visuals and lesson illustrations |

Both run server-side through an Express proxy so the API key never reaches the browser.

**Building it:**

**Claude Code** as the primary development environment — architecture, implementation, and debugging
across the full stack. Also used for structured technical review: auditing this project's rules
compliance against the hackathon requirements, and reasoning through cost and pricing structure.

The most valuable use wasn't generating code. It was **being argued with** — having a decision
questioned before committing days to it, which is the thing a solo founder otherwise doesn't get.

---

## 6. Why this model is sustainable and viable

### Market

**1.5 million+ venues** in the United States alone — afterschool programs, summer camps, Boys &
Girls Clubs, STEM enrichment networks. `[Cite the source; judges will check.]`

The structural gap: districts have curriculum teams and textbooks. **Extracurricular programs run on
fluid, self-made outlines** — continuous demand for rapid material adaptation, and no institutional
support to meet it.

`[Insert: TAM calculation and five-year revenue target.]`

### Path to profitability

Solo, no salary drawn, no capital raised. Fixed costs are hosting; variable cost is inference.
Profitability is therefore a function of **subscriber count against per-lesson inference cost** —
not of scale, headcount, or a funding round.

`[Reference P&L: monthly operating cost, break-even subscriber count, projected month.]`

### What exists today, stated plainly

- **Working product deployed on Cloud Run**, publicly reachable
- **Gemini in the critical path** — two models, no product without them
- **Five distinct output modules**, not a single-trick demo
- **Stripe subscriptions integrated and live**
- **Firebase auth, Firestore, and Storage** in production use

What does **not** exist yet, and won't be claimed: paying subscribers, revenue, or validated
product-market fit. `[Update with instructor testing results — that data is being gathered this
week.]`

### Evidence toward product-market fit

`[This section is where instructor testing goes. The strongest possible content: N instructors, what
they generated, measured prep time before and after, and whether they taught the output. One
instructor saying "this saved me Sunday night" is worth more than every projection above — and
unlike a projection, it can't be argued with.]`

### How resources are preserved

Serverless architecture that scales to zero between sessions. Image compression on upload. Graceful
degradation to preloaded content when inference is unavailable, so a provider problem is a quality
event rather than an outage. Annual billing to smooth seasonal revenue.

And a scope discipline learned the expensive way: one product, built properly, beats two built
halfway.
