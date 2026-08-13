# Instructor User Stories

> **These are drafts for real instructors to revise, not testimonials.**
>
> Names, program names, and identifying details are placeholders in `[BRACKETS]`. Every number is
> also bracketed, because none of it has been measured yet — the instructor supplies the real figure
> or strikes the claim. Nothing in this document should be published, quoted in the submission, or
> shown to a judge until the named instructor has read it and confirmed it in their own words.
>
> Suggested workflow: send each instructor their own story, ask them to rewrite it however they like,
> and keep whatever comes back. A worse-written sentence that's actually theirs beats a polished one
> that isn't.

---

## What instructor feedback changed, 11–12 August 2026

Three instructors is not a usage statistic, and this project does not yet have one. What it does
have is a short loop: instructors used it, said what was wrong, and the product changed within a
day. That loop is the honest evidence available at this stage, so it is recorded here rather than
implied.

Every row below is a change that shipped to https://lyrah.io. Named sources are instructors who
reported the problem directly; rows marked `[AUTHOR TESTING]` came from the author's own use and
are labelled as such, because presenting internal QA as user feedback is not worth the credibility
it costs. Surnames and roles still need filling in, and each instructor should confirm the
description of their report before this is shown to anyone.

| What was reported | Source | What changed |
|---|---|---|
| A generated lesson arrived full of visible HTML tags — `<p>`, `<strong>` — in the middle of the text | **Maia**, `[ROLE]` — testing in Microsoft Edge | The model is now instructed to return plain prose, and the server strips formatting tags from every lesson field before it reaches the instructor. Angle brackets in code samples and maths are deliberately preserved. |
| Instructors were reaching the pricing page and stopping, saying they had not really made an account because they were never asked for a password | `[INSTRUCTOR NAMES — the two who stalled at the pricing page]` | The passwordless sign-in is now explained rather than left implicit, and the payment step names the account being charged. |
| Engineering and LEGO build lessons were being rendered as block-coding exercises, with "Copy Code" buttons on a lesson about a cardboard pulley | **Maia** | Lesson-type detection was rewritten. It had been matching bare substrings, so the word "pre**vent**s" matched "event" and flipped a hands-on build into a coding lab. DIY lessons now get a materials checklist. |
| Lessons were being tagged as Minecraft when they had nothing to do with Minecraft | **Maia** | Minecraft support was removed entirely rather than tuned. Its vocabulary — redstone, agent, block — overlaps too heavily with ordinary science and engineering language to disambiguate reliably. It is shelved for a later release. |
| The grade level chosen in the toolbar was not the grade level the generation plan used | `[AUTHOR TESTING]` | The two controls had been storing different values for the same grade, so the plan could never match the instructor's choice. They now share one set of values, and a manual choice is no longer overwritten by auto-detection. |
| One free lesson was not enough to judge whether the tool was useful | `[AUTHOR TESTING]` | Raised to three. |
| There was no way to cancel or change a card without emailing the author | `[AUTHOR TESTING]` | Subscribers now reach Stripe's billing portal from their dashboard. |
| "I don't know what to do once I'm here" — landing in the studio meant facing an empty text box with no indication of what belonged in it | **Mosi**, `[ROLE]` | A cursor-led walkthrough was added to the landing page. It drives the real controls — types a sample lesson into the real input and presses the real Generate button — so it ends on a genuinely generated lesson. No sign-in required. |
| After paying, the "Unlock Full Access" banner stayed on screen and there was no confirmation the payment had worked | `[THE TWO PAYING INSTRUCTORS — CONFIRM WHETHER TO NAME THEM]` | Two separate faults. Access was granted before Firebase had restored the session, so the upgrade silently failed and the error went only to the browser console. And nothing ever told the customer the charge had succeeded. Verification now waits for sign-in, and the outcome — confirmed, pending, or failed — is stated on screen. |

### The instructor who said no

One co-instructor was shown Lyrah and did not sign up. His reason, as reported: he would rather
stick with what he is already comfortable with, and he identified a "risk" in adopting it.

`[Ask him to name the risk in his own words before this is quoted anywhere. Do not paraphrase it —
the specific wording is the whole value of this entry. Candidates worth ruling out: trusting AI
output in front of children, losing his own lesson materials, being seen to use AI by a supervisor,
or the time cost of learning another tool mid-season. Each implies a different response, and
guessing wrong is worse than leaving it blank.]`

This is recorded because it is the most useful single data point available. Three instructors
liking something is not evidence of a market; one declining it, for a reason he can articulate, is
the beginning of understanding who this is not for — and a submission that reports a refusal reads
as more credible than one reporting only enthusiasm.

**What it likely is not:** the passwordless sign-in. That confusion was reported separately and by
different people, and he named a risk rather than a confusion. Attributing his answer to the thing
already fixed would be the comfortable reading, not the honest one.

**What it may legitimately mean:** the switching cost is real and this product does not yet beat it
for an instructor who has a working system. That is a market boundary, not a bug, and pretending
otherwise in a business plan invites the judge's obvious question.

**What has not been fixed yet, and should be said plainly:** access is still granted by the
browser after payment rather than by the server, so a customer who closes the tab mid-redirect is
charged without being upgraded. No instructor has hit this. It is known, not discovered.

---

## Story 1 — The Sunday night conversion

**Instructor:** `[NAME]`, `[ROLE — e.g. afterschool STEM coordinator]` at `[PROGRAM]`
**Teaches:** `[GRADE BAND]`, `[N]` students per session, `[SESSION LENGTH]`

> The curriculum binder I get for the spring robotics unit is `[N]` pages for what's supposed to be
> a one-hour class. It's not bad material. It's just written for someone with a prep period, and I
> don't have one — I'm setting up the room fifteen minutes before kids walk in.
>
> What I actually did every Sunday was retype it. Pull the three things that fit in an hour, make
> slides, write a worksheet, make an answer key so my `[assistant / co-teacher]` could run a table
> without me. `[N]` hours, unpaid, every week.
>
> Now I paste the unit in and get the slides, the lab checklist, and the worksheet with the key
> already toggled. I still change things — `[describe what you always change]` — but I'm editing
> instead of starting from a blank document.
>
> `[What would you tell another coordinator about it? Be honest, including what it doesn't do.]`

**What this story is meant to evidence:** the core prep-time claim, and that the output is a
starting point an experienced instructor edits rather than a finished artifact they accept.

**Ask this instructor for:** actual page count, actual hours before and after, and one specific
thing they always have to fix. The last one matters most — a story with no criticism reads as
marketing.

---

## Story 2 — The links that died

**Instructor:** `[NAME]`, `[ROLE]` at `[PROGRAM]`
**Teaches:** `[SUBJECT]`, `[GRADE BAND]`

> Half my `[SUBJECT]` lessons are inherited. Somebody built them `[N]` years ago and they're good,
> but every third slide points at a video that's gone — deleted, made private, or on a district
> intranet I can't reach from `[WHERE]`.
>
> That's the part nobody warns you about. The lesson isn't broken, it's just got holes in it, and
> you don't find out until you're standing in front of `[N]` kids clicking a dead link.
>
> I used to `[what you did before — pre-check every link? improvise?]`. Now the tool flags them and
> gives me search terms that actually find a replacement, instead of me typing the video title into
> YouTube and getting `[what you got instead]`.
>
> `[Did it ever suggest something wrong or unusable? Say so.]`

**What this story is meant to evidence:** the Media Link Fixer solves a real, specific, unglamorous
failure that keeps good material in circulation. This is the most differentiated module and the
least obvious from a product description.

**Ask this instructor for:** roughly how many inherited lessons they run, and one concrete example of
a link that died and what replaced it.

---

## Story 3 — Pacing a unit that doesn't fit

**Instructor:** `[NAME]`, `[ROLE]` at `[PROGRAM]`
**Teaches:** block-based coding (`[Scratch / ScratchJr / Code.org / other]`), `[GRADE BAND]`

> The `[UNIT]` curriculum assumes the kids show up knowing `[PREREQUISITE]`. Mine don't, and I've
> got `[N]` sessions, not `[N]` weeks. So every year I make the same judgment call: what gets cut,
> what moves to session four, and what vocabulary I'm quietly not going to teach.
>
> The hard part isn't deciding. It's remembering in November what I deferred in September, and
> whether I ever came back to it.
>
> `[Describe how you track this now — notebook? memory? nothing?]`
>
> What's useful to me is `[what actually helps: the pacing across sessions? the block-by-block
> translation? the gamified framing?]`. `[Be specific about which module you actually use — if you
> only use one, say that.]`

**What this story is meant to evidence:** multi-session pacing and deferred-content tracking, which
is the retention argument. One-off generation is a utility; remembering across a semester is a
product.

**Ask this instructor for:** the real unit name, the real session count, and — most valuable — whether
they'd keep paying for this in month four. That answer belongs in the business plan whether it's yes
or no.

---

## Notes for the submission

**Do not aggregate these into a statistic.** Three instructors is a qualitative signal. "3 of 3
instructors reported time savings" invites exactly the scrutiny it can't survive. Quote them
individually, attributed, with their real constraints intact.

**The `[BRACKETS]` in `docs/BUSINESS-MODEL.md` and the empty product-market-fit section are what
these stories are for.** When the revised versions come back, the measured prep-time figures replace
the `5.2 hours / 82%` estimates currently carried as claims.

**Ask at least one instructor what made them stop using it**, if any did. A submission that names a
real limitation reads as more credible than one that doesn't, and judges ask.

**Use the feedback table as the answer to "how many users do you have?"** The honest answer is: not
many, and not for long enough to measure retention. The stronger answer is that the ones there are
have already changed the product nine times in two days, each change traceable to something
someone said. Responsiveness is the claim this project can actually support right now; usage volume
is not, and reaching for it invites a question with no good answer.

**Confirm every attribution in that table before showing it to anyone.** The rows marked
`[AUTHOR TESTING]` are the author's own findings, not instructor feedback, and should stay labelled
that way. Ask Maia and Mosi to confirm the description of what they reported — both are quoted in
substance, and neither has read it yet.

**The payment-confirmation row is the most valuable one in the table**, and the least comfortable.
Two instructors paid and could not tell whether it had worked. That is a failure found by real
users doing a real thing, which is exactly the evidence a submission with no usage volume needs —
and it reads as credible precisely because it is not flattering.
