# How Lyrah is built and run — AI-native operations

> Word count target: 500–1000. Current draft: ~830. `[BRACKETS]` need a decision or a real number before submission.

Lyrah is built and operated by one person, using two AI systems for two different jobs: Gemini builds the product for instructors, and Claude Code builds the product itself. Neither is decorative. Removing either one stops the business, not just slows it down.

## How the product uses AI, day to day

An instructor pastes in a lesson plan — routinely seven or eight pages for a class they have thirty minutes a week to prepare. Gemini reads it the way an experienced co-teacher would: finds the stated learning goal, budgets backward from the class length minus setup and cleanup, and cuts everything that doesn't serve the goal, naming what it removed and why. Where the source document contains photographs of the actual build, those go to Gemini alongside the text, so an illustration describes the object in the photograph rather than a plausible guess from the prose — the difference between a windmill drawn as a wooden water wheel and one drawn as the paper cup and bendable straw the child is actually holding. Lessons are grounded in Google Search in a separate pass, so material is checked against current sources rather than model recall alone.

None of this is a chatbot bolted onto a form. The judgment — that a Pre-K lesson listing four learning goals is really a unit and not one class, that sealing a bottle cap with clay is beyond a four-year-old's motor control, that a balloon rocket still needs a diagram because a new instructor has never seen one assembled — is Gemini's, made new for every document, not a template with blanks filled in.

## What humans do versus what AI does

The instructor decides. Lyrah proposes a shortened plan and shows its reasoning; the instructor teaches, adapts, or overrides it — the interface exists specifically so a cut can be disagreed with rather than silently accepted, because a plan the instructor cannot interrogate is not one they can trust in front of children.

On the building side, I decide what the product should refuse to do, and Claude Code writes and tests the code that enforces it. Every rule now shaping the product — that a lesson keeps its stated age band instead of quietly moving to older children, that access is billed and granted honestly, that a picture is offered only when it would materially help — started as something I said in plain language after watching a real instructor use it, not as a spec I wrote in advance.

## Jobs and economic opportunity beyond the founding team

There is no founding *team*; there is a founder and two AI systems, which is the more useful fact for this question. The jobs this creates are not inside the company, and that is deliberate.

**Instructors get their evenings back rather than a wage**, which is the actual value proposition — hours of unpaid Sunday preparation returned as time, not as income. **Camp directors and programme coordinators get a way to raise curriculum quality across every instructor they run without hiring a curriculum team**, which is a real cost several afterschool programmes currently carry and Lyrah substitutes for. Selling by seat count rather than by site — ten instructors at $12.99 rather than one flat programme licence — is deliberately structured so growth in the customer base does not require growth in the founding team; it is the mechanism by which this scales without hiring.

`[If any coworker or instructor has taken on referral, onboarding, or informal support work around Lyrah, name them and the actual hours here — that is real, attributable economic activity and belongs in this section rather than as a hypothetical.]`

The honest long-horizon opportunity is the **Publisher API**: educational publishers turning static textbook content into interactive activities. That is B2B contract work, and it is the path by which this product would eventually employ people directly — support, partnerships, account management — rather than remaining a one-person operation. It is not built. It is the reason the product was built API-first rather than as a single consumer app.

## The story of building it this way

I built this because I teach afterschool STEM myself, and I know exactly what a Sunday night of unpaid prep costs. The first version of Lyrah made the underlying problem worse: it generated five polished artifacts from every document, which is impressive and exactly backwards for someone drowning in pages. A colleague told me so, directly, and the product changed because of it — not because a metric moved, because a person said it plainly.

That loop — a real instructor finds something wrong, the product changes within a day — is the actual operating model, and it only works at this speed because Claude Code is inside it. I can describe a bug or a bad decision in plain language on the same day it is reported and ship a tested fix before the next class runs. Two instructors paid and could not tell whether the payment had worked, because access depended entirely on the customer's browser completing a redirect that had no fallback. That is now fixed with server-side fulfilment through Stripe's own webhook, discovered and shipped within the same day it was reported, by two people and no meeting.

Building it this way is not a novelty. It is why a business this small can respond to instructors this fast, and why a solo founder can compete on responsiveness against products built by teams.
