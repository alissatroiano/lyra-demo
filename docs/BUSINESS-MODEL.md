# Lyrah — Business Model

**Category:** Education & Human Potential
**Live product:** https://lyrah.io
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

**But the thing instructors actually asked for was less, not more.** The complaint that shaped this
product was not "I need materials" — it was that a forty-five minute class arrives as a seven-page
plan, and an instructor with thirty minutes of paid prep for their entire week teaches one page of
it. So Lyrah reads the lesson's stated learning goals first, budgets backwards from the clock —
subtracting setup, transitions and a cleanup estimate driven by the materials and the age of the
children — and then **cuts**, keeping one hands-on activity rather than three and one new
vocabulary word rather than a glossary.

It says what it removed and why. A shortened plan an instructor cannot interrogate is lossy; one
that shows its reasoning is a colleague's judgment they can overrule. Given a real Pre-K lesson
carrying four separate learning goals — DNA, the heart, lungs and bones, in one hour — Lyrah keeps
the heart, defers the rest, and reserves fifteen minutes for cleanup because the activity uses
water and food dye. Told to run a build too fine-motor for four-year-olds, it does not quietly move
the lesson to an older age band; it keeps the age and tells the instructor to pre-drill the caps.

That is the difference between a generator and a co-teacher, and it is the part of the product that
came directly from instructors using it.

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

Two tiers are live in Stripe, and the pricing page shows only these two.

| Tier | Price | Buyer |
|---|---|---|
| **Summer STEM Special** | $12.99 one-time | The individual instructor. The offer being put in front of real instructors now, and the lead position on the pricing page |
| **Instructor Monthly** | $9.99/month | The same instructor, once they are running new material every week through the school year |

They are deliberately different shapes rather than a ladder. The one-time price is for a teacher
paying out of pocket mid-season, where a recurring charge is a harder yes than the product has yet
earned. The monthly price is for the same person once Lyrah is part of how their week works.
Subscribers reach Stripe's hosted billing portal from their dashboard to change a card, pull a
receipt or cancel without emailing anyone.

**$12.99 once is not a revenue model and is not presented as one.** It is priced against a Sunday
evening, not against cost. The scarce thing at this stage is not money but evidence — instructors
who have run a Lyrah-generated lesson in front of children and will say whether it held up. A price
low enough to be an impulse decision buys that evidence faster than a free tier does, because a
$12.99 charge still filters for genuine intent in a way "sign up free" does not.

**The honest risk:** a one-time payment against ongoing inference cost has no natural ceiling. One
instructor generating weekly all year can consume more than $12.99 of inference alone. That is
acceptable while the goal is evidence rather than margin, and it is why the offer is framed as a
season pass rather than a lifetime one — but it is a real exposure, bounded only by how long this
pricing stays live. It closes 31 August 2026.

### The bet: acquire before the bell rings, convert once the term starts

The sequence is the strategy, and the one-time tier is deliberately short-lived rather than
open-ended.

Late summer is the one window where both halves of this market are reachable at once — camp and
enrichment instructors are still teaching, school-year staff are already preparing for the fall.
The Summer STEM Special exists to make that decision an impulse rather than a deliberation, and it
closes **31 August 2026**, right as the school year begins: it is priced to acquire during the
window, not to be the plan someone is still on in November.

Instructor Monthly is what carries a subscriber through the actual school year, and it is the
tier the retention argument is really about — an instructor in November has a semester of
materials and pacing decisions inside Lyrah that they cannot rebuild elsewhere. Instructors who
buy the one-time offer keep the option to move to monthly afterward at the standard price; the
one-time tier is not repriced or extended once it closes. This is framed as founding pricing, not
as a discount: a discount says the product is worth less, and it is not.

### Held back for a later launch

One tier is designed and priced but deliberately not shown.

| Tier | Price | Buyer |
|---|---|---|
| **Camp Director Special** | $49.99/month | Multi-site programmes, summer camps and franchises running several instructors |

It was briefly live and was removed. Two reasons, both worth stating because both were learned
rather than planned. A second tier splits the decision of an individual instructor who is the only
buyer this product currently has. And selling to a programme is not a pricing question but a
different sale — a budget line, a conversation, an invoice — for which a self-serve button on a
pricing page is the wrong instrument.

**The programme sale needs no new tier and is already possible.** Ten instructors at $12.99 is
$129.90, which is both more than the removed tier charged and an honest description of what is
being bought: access for ten people, not a premium version for one. That is the B2C-to-B2B wedge
below, working with the machinery that already exists.

A **Publisher API** contract tier — educational publishers turning static textbooks into
interactive activities — remains the B2B end state, not a shipped product.

### Retention is the hard part, and it is seasonal

Instructor demand is not flat. It spikes in August and January, collapses over summer for
school-year staff and inverts for camp staff. A subscription bought in September is at its most
fragile in December, when the material an instructor already generated still works and the next
unit has not started.

Two mechanisms are built for exactly that:

- **Promo codes at checkout.** Stripe holds the discount, so an offer can be created, changed or
  retired mid-school-year without a redeploy. This is what makes "stay subscribed through the
  term" a campaign rather than an engineering task.
- **`STRIPE_COUPON_ID` for automatic application**, when a discount should apply to every checkout
  rather than to instructors holding a code.

The retention argument is not the discount, though. It is **multi-session memory** — the product
tracks what an instructor deferred in September so it can resurface it in November. One-off
generation is a utility an instructor can churn from. Remembering a semester is a product they
cannot rebuild themselves, and it is why pacing is a paid feature rather than a nice-to-have.

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

While the individual tier is a one-time $12.99, margin on it is **negative by design over a long
enough horizon** — there is no recurring revenue to offset recurring inference. The relevant
question is therefore not margin but *runway per acquired instructor*: how many generations $12.99
buys before that instructor costs more than they paid. `[Insert: measured cost per full lesson
generation, and the implied number of generations before the one-time price is exhausted.]`

That number decides two things: how long this acquisition pricing can responsibly stay live, and
where the school-year recurring price has to land. At the future $9.99/mo tier, a target ~80%
margin puts the ceiling at roughly **$2.00 of inference per subscriber per month** — which is the
figure the product has to be engineered against, and the single most important unmeasured number in
this document.

At any low price point a heavy user is the risk, not the win. This is the main argument for pricing
programmes per instructor rather than per site: a programme running ten instructors generates
roughly ten times the inference, and a flat site price would hide that until it hurt.

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

- **Working product deployed on Cloud Run** at https://lyrah.io, publicly reachable
- **Gemini in the critical path** — two models, no product without them
- **Google Search grounding** on lesson generation, so material is checked against current sources
  rather than model recall alone
- **Five distinct output modules**, not a single-trick demo
- **Scope discipline** — lessons are planned against the minutes the instructor actually has, with
  the cuts shown and justified rather than made silently
- **Server-side payment fulfilment** — access is granted by the Stripe webhook, so a customer who
  closes the tab mid-redirect is still upgraded
- **Stripe live in production**, taking real payments — hosted Checkout, promotion codes, and a
  self-serve billing portal for subscribers
- **Firebase auth, Firestore, and Storage** in production use

Live payments have been processed through Stripe in production. `[State the honest number of
instructor purchases and the revenue, and report any purchases by colleagues separately — a
related-party sale is evidence the checkout works, not evidence of market demand, and conflating
the two is the fastest way to lose a judge's trust.]`

What does **not** exist yet, and won't be claimed: a subscriber base, meaningful revenue, renewal
data, or validated product-market fit. `[Update with instructor testing results — that data is
being gathered this week.]`

### Evidence toward product-market fit

What exists is not usage volume. It is a short, documented loop: instructors used Lyrah, said what
was wrong, and the product changed within a day. `docs/USER-STORIES.md` carries the dated table —
what was reported, by whom, and what shipped in response.

Three of those are worth naming here because each changed the product rather than the copy:

- **Maia** generated a lesson that came back full of visible HTML tags, and separately found a
  cardboard-and-string pulley build rendered as a block-coding exercise. Both were fixed the same
  day; the second required rewriting how lesson type is detected, because the word "prevents"
  contained "event".
- **Mosi** said he did not know what to do once he arrived. The guided walkthrough exists because
  of that sentence.
- **Two instructors paid** and could not tell whether it had worked, because access was being
  granted by the browser after checkout and failing silently. That is the most valuable report of
  the three precisely because it is not flattering: real users, doing a real thing, finding a real
  failure that no amount of internal testing had surfaced.

`[Add: measured prep time before and after, for however many instructors will give it. One
instructor saying "this saved me Sunday night" is worth more than every projection above — and
unlike a projection, it cannot be argued with.]`

**Responsiveness is the claim this project can support right now. Usage volume is not**, and
reaching for it invites a question with no good answer.

### How resources are preserved

Serverless architecture that scales to zero between sessions. Image compression on upload. Graceful
degradation to preloaded content when inference is unavailable, so a provider problem is a quality
event rather than an outage. Annual billing to smooth seasonal revenue.

And a scope discipline learned the expensive way: one product, built properly, beats two built
halfway.
