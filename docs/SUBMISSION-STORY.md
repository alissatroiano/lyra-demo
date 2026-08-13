# Lyrah — Submission Story

**Category:** Education & Human Potential
**Live:** https://lyrah.io
**Built by:** Alissa Troiano, solo

> **DRAFT.** `[BRACKETS]` need real figures or a decision before submission. Everything outside
> brackets is verifiable in this repository or the live deployment.

---

## The story

I teach afterschool STEM. So I know what the job actually is.

A lesson plan arrives from a coordinator. It is seven or eight pages. The class is forty-five
minutes. I am paid for thirty minutes of preparation — not per class, for the *week*. And the plan
assumes a warm-up, then a practice activity, then the real build, for children who are seven years
old and have already been in school since eight in the morning.

So every instructor I know does the same thing. We read all eight pages, we find the one page we
can actually teach, and we throw the rest away on a Sunday night. Unpaid. Every week.

**That is the problem Lyrah solves, and it took me a while to understand that it was a subtraction
problem, not an addition one.**

The first version of Lyrah made more things. Slides, worksheets, a quiz, a lab guide — five
artifacts from one paste. It was impressive and it was wrong. An instructor drowning in pages does
not want more pages. When I put it in front of a colleague she told me it was still generating too
much, and that a sixty-minute class with seven-year-olds cannot contain a warm-up and a DIY and a
main activity no matter how nicely each one is written.

So Lyrah now reads the lesson the way an experienced instructor reads it.

It finds the stated learning goal first. It budgets backwards from the clock — subtracting the ten
minutes it takes to settle a room, and a cleanup estimate driven by what the activity actually
touches and how old the children are, because water and food dye with four-year-olds is fifteen
minutes and a bin of LEGO with eleven-year-olds is five. Then it **cuts**. One hands-on activity
instead of three. One new vocabulary word instead of a glossary, because a child who has been in
school all day can hold one.

And it says what it removed, and why.

That last part is the whole thing. A shortened plan you cannot interrogate is lossy — you do not
know what you lost. A shortened plan that shows its reasoning is a colleague's judgment, and you
can overrule it.

**A real example, from a real lesson a real instructor dreaded.** A Pre-K discovery lab on the
human body, sixty minutes, carrying four separate learning goals: DNA, the heart, the lungs, and
bones. Lyrah keeps the heart — the title says heart, the build is a heart pump — and defers the
rest to other sessions. It reserves fifteen minutes for cleanup and says why: red food dye and
water. It teaches one word. And when it noticed the build required sealing bottle caps with clay,
which four-year-olds cannot do, it did not quietly move the lesson to eight-year-olds. It kept the
age and told the instructor to pre-drill the caps before class.

That is the difference between a generator and a co-teacher.

## Why this needs Gemini

`gemini-3.5-flash` does the curriculum reasoning and `gemini-3.1-flash-image` draws the build
diagrams. Without them there is no product — there is a text box.

The judgment above is not a template. Deciding that a Pre-K lesson listing four goals is really a
unit rather than a class, that the heart is the one this session is for, and that clay-sealed caps
are beyond four-year-old motor control, is reasoning about children and time and materials
together. Structured output keeps that reasoning in a shape the interface can render.

Lessons are also grounded in **Google Search**, in a deliberate two-pass call: a grounded research
pass first, then structured generation informed by it. Gemini rejects search grounding combined
with a strict response schema, so the split is the design rather than a workaround — and it means
material is checked against current sources rather than model recall.

## What is real

- **Deployed and public** at https://lyrah.io on Cloud Run
- **Live payments** through Stripe — hosted checkout, promotion codes, self-serve billing portal
- **Instructors using it**, and their feedback shipped: `docs/USER-STORIES.md` carries the dated log
- `[N]` **paying instructors** `[state colleague purchases separately — related party]`

## What is not

No subscriber base. No renewal data. No measured prep-time figures yet — the "5.2 hours saved"
number in circulation is an estimate and is labelled as one everywhere it appears.

And one instructor was shown Lyrah and **declined**. He would rather use what he is comfortable
with, and he named a risk in adopting it. `[Get his wording.]` I am reporting that because three
people liking something is not a market, and because the switching cost for an instructor with a
working system is real and this product does not yet beat it.

What I can evidence is a loop: instructors used it, told me what was wrong, and it changed within a
day. Two of them paid and could not tell whether the payment had worked — access was being granted
by the browser after checkout and failing silently. They found a bug no amount of my own testing
had. That is the least flattering thing in this submission and the most valuable.

---

# 3-minute video script

**Total: 3:00.** Spoken word count ~430. Read at a normal pace, not rushed. Screen recording of the
live site with voiceover — no slides, no talking head beyond the open if you want one.

---

### 0:00 – 0:22 — The problem, in your own words

> **On screen:** the printed lesson plan. Physically fan the pages. Then the clock on the wall.

"I teach afterschool STEM. This is one lesson plan, for one forty-five minute class. It's eight
pages. I'm paid for thirty minutes of prep — for the whole week. So every Sunday night I read all
eight pages, find the one I can actually teach, and throw the rest away."

> Hold on the pages a beat before cutting. The physical stack does more work than any statistic.

---

### 0:22 – 0:40 — What Lyrah is

> **On screen:** lyrah.io landing page, then the upload box.

"Lyrah is an AI co-teacher built on Gemini. You give it the plan you were handed. It gives you back
the lesson you can actually teach — and it tells you what it cut."

---

### 0:40 – 1:50 — The demo. This is the film.

> **On screen:** upload the windmill lesson. Let the compile messages run — don't cut them.

"This is a real engineering lesson. Sixty minutes, third to fifth grade, build a windmill."

> **On screen:** the plan appears. Point at the goal line.

"First it finds the one thing this class is for — from the lesson's own learning goals."

> **On screen:** the time budget chips.

"Then it does the arithmetic instructors do in their heads. Sixty minutes, minus settling the room,
minus cleanup — and cleanup depends on what you're using and how old they are. Forty-two minutes
left. Here's how it spends them."

> **On screen:** expand "Lyrah cut 2 things to fit the hour."

"And here's the part I care about. It cut the four-station rotation and the filler games, and it
says why. I can disagree with it. I can't disagree with a plan that just quietly dropped things."

> **On screen:** the lab tab, then the generated build diagram.

"Then the materials checklist, and a step-by-step build diagram — because in an engineering class,
the picture is the lesson."

---

### 1:50 – 2:25 — Evidence

> **On screen:** the user-stories doc, or plain text over the app.

"Instructors are using this. `[Maia]` found it turning a cardboard-and-string pulley build into a
coding exercise — fixed the same day. `[Mosi]` said he didn't know what to do when he landed —
that's why there's a walkthrough now."

"Two paid, and couldn't tell whether the payment worked. Access was being granted by the browser
and failing silently. They found a bug my own testing never did. That's the most useful thing
anyone has told me."

> Say the failure without flinching. It is the most credible thirty seconds in the video.

---

### 2:25 – 2:45 — Why Gemini

> **On screen:** a lesson generating, grounding sources visible.

"Gemini does the reasoning — reading the goals, judging what a four-year-old can physically do,
deciding what goes. It's grounded in Google Search, so it's checked against current sources, not
just what the model remembers."

---

### 2:45 – 3:00 — Close

> **On screen:** back to the printed stack. Set it down.

"I built this because I needed it. Eight pages, one class, thirty minutes of prep. Lyrah gives me
back the evening — and tells me exactly what it decided so I stay the teacher."

---

## Notes for filming

- **Use a real lesson, not the preloaded sample.** The windmill or the Pre-K heart lab. Judges can
  tell the difference between a demo and a demonstration.
- **Do not speed up the generation.** It takes what it takes, and the compile lines say what it is
  doing. Cutting it implies you are hiding the wait.
- **Do not narrate the interface.** No "and then I click here." Say what it decided and why.
- **The cut list is the money shot.** Every product in this category generates content. Almost none
  of them show their reasoning and invite disagreement. Give it real screen time.
- **Say the payment bug out loud.** Every instinct will say to remove it. Keep it.
- `[Decide before filming whether to name Maia and Mosi. Ask them first — attribution in a public
  video is a different consent to attribution in a doc.]`
