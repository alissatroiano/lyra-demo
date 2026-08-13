import express from "express";
import path from "path";
import dotenv from "dotenv";
import { GoogleGenAI, Type, LiveServerMessage, Modality, ThinkingLevel } from "@google/genai";
import { createServer as createViteServer } from "vite";
import { WebSocketServer } from "ws";
import * as pdfParseModule from "pdf-parse";
// @ts-ignore
const pdfParse = pdfParseModule.default || pdfParseModule;
import mammoth from "mammoth";

dotenv.config();

const app = express();
// Cloud Run injects PORT and routes traffic to it (8080 by default). A
// hardcoded port makes the container start but fail health checks; 3000 stays
// the local default.
const PORT = Number(process.env.PORT) || 3000;

/**
 * Server-side Firestore, used to grant access when Stripe says a payment
 * succeeded.
 *
 * Fulfilment used to depend entirely on the browser completing the redirect
 * back from Stripe. A customer who closed the tab was charged and never
 * upgraded, and nothing recorded that it had happened. The webhook is the only
 * party that hears about a payment regardless of what the browser does.
 *
 * Credentials come from the Cloud Run service account, so no key file is
 * needed — but that account lives in a different project from Firestore and
 * must be granted access to it explicitly.
 */
let firestore: any = null;
const getFirestore = async () => {
  if (firestore) return firestore;
  try {
    const { Firestore } = await import("@google-cloud/firestore");
    firestore = new Firestore({
      projectId: process.env.FIREBASE_PROJECT_ID || "gen-lang-client-0481032669",
      databaseId: process.env.FIRESTORE_DATABASE_ID || "ai-studio-lyra-4093db80-c113-4f0d-9b6e-ec52a27130c5",
    });
    return firestore;
  } catch (err: any) {
    console.error("Could not initialise Firestore admin client:", err?.message || err);
    return null;
  }
};

/** Mark a user as paid. Safe to call twice for the same checkout session. */
const grantAccess = async (uid: string, plan: string, source: string) => {
  if (!uid) {
    console.error(`Cannot grant access from ${source}: no uid on the session.`);
    return;
  }

  const db = await getFirestore();
  if (!db) return;

  try {
    await db.collection("users").doc(uid).set(
      {
        uid,
        isSubscribed: true,
        stripeSubscriptionPlan: plan,
        subscriptionSource: source,
        subscriptionDate: new Date(),
        updatedAt: new Date(),
      },
      { merge: true }
    );
    console.log(`Granted access to ${uid} (${plan}) via ${source}.`);
  } catch (err: any) {
    console.error(`Failed to grant access to ${uid}:`, err?.message || err);
  }
};

// Stripe Webhook Endpoint (requires raw body before express.json parsing)
app.post("/api/webhook/stripe", express.raw({ type: "application/json" }), async (req, res) => {
  const sig = req.headers["stripe-signature"];
  // No hardcoded fallback: a literal here is a published secret, and once it is
  // rotated it is also wrong. If the secret is not configured, the only safe
  // thing this endpoint can do is refuse.
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || process.env.STRIPE_WEBHOOK_SIGNING_SECRET;
  const stripeSecret = process.env.STRIPE_SECRET_KEY;

  if (!stripeSecret) {
    console.warn("Stripe webhook received, but STRIPE_SECRET_KEY is missing.");
    return res.status(200).json({ received: true, status: "stripe_not_configured" });
  }

  // Every event must carry a signature we can verify against the secret.
  // Parsing an unsigned body would let anyone POST a forged
  // checkout.session.completed and be treated as a paying customer.
  if (!webhookSecret) {
    console.error("Stripe webhook rejected: STRIPE_WEBHOOK_SECRET is not configured.");
    return res.status(500).send("Webhook secret is not configured.");
  }

  if (!sig) {
    console.error("Stripe webhook rejected: request carried no stripe-signature header.");
    return res.status(400).send("Missing stripe-signature header.");
  }

  try {
    const Stripe = (await import("stripe")).default;
    const stripe = new Stripe(stripeSecret);

    let event: any;
    try {
      event = stripe.webhooks.constructEvent(req.body, sig as string, webhookSecret);
    } catch (err: any) {
      console.error(`Stripe Webhook signature verification failed: ${err.message}`);
      return res.status(400).send(`Webhook Signature Error: ${err.message}`);
    }

    console.log(`Verified Stripe Webhook event: ${event.type}`);

    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object;
        console.log(`Checkout session completed for ${session.customer_email || session.customer}`);
        // The uid is put on the session at checkout precisely so this moment
        // does not depend on the customer's browser coming back.
        await grantAccess(
          session.client_reference_id || session.metadata?.uid,
          session.metadata?.plan || "summer_1299",
          "stripe_webhook"
        );
        break;
      }
      case "customer.subscription.created":
      case "customer.subscription.updated": {
        const sub = event.data.object;
        console.log(`Subscription event ${event.type} for customer ${sub.customer}`);
        break;
      }
      case "invoice.payment_succeeded": {
        const invoice = event.data.object;
        console.log(`Invoice paid for customer ${invoice.customer}`);
        break;
      }
      default:
        console.log(`Unhandled Stripe event type: ${event.type}`);
    }

    res.json({ received: true });
  } catch (err: any) {
    console.error("Stripe Webhook processing error:", err);
    res.status(500).send(`Webhook Error: ${err.message}`);
  }
});

app.use(express.json({ limit: "50mb" }));

// Initialize Gemini Client safely
// Set User-Agent as 'aistudio-build' for telemetry
let ai: GoogleGenAI | null = null;
try {
  const apiKey = process.env.GEMINI_API_KEY;
  if (apiKey) {
    ai = new GoogleGenAI({
      apiKey: apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  } else {
    console.warn("GEMINI_API_KEY environment variable is not defined. AI features will be unavailable.");
  }
} catch (error) {
  console.error("Failed to initialize GoogleGenAI client:", error);
}

/**
 * Pull the figures out of a .docx.
 *
 * Lesson plans carry photographs and diagrams of the finished build, and those
 * pictures are frequently clearer than the written steps. Generating an
 * illustration from the prose alone produced a plausible object rather than the
 * one the children make — a windmill of paper cups and a straw came back as a
 * wooden water wheel with spoons.
 *
 * Small images are skipped: logos, bullets and letterhead outnumber real
 * figures and cost tokens without adding anything. The cap keeps a document
 * with thirty screenshots from dominating the request.
 */
const MIN_FIGURE_BYTES = 25_000;
const MAX_FIGURES = 4;

const extractDocxFigures = async (buffer: Buffer): Promise<{ mimeType: string; data: string }[]> => {
  const found: { mimeType: string; data: string; bytes: number }[] = [];

  try {
    await mammoth.convertToHtml(
      { buffer },
      {
        convertImage: (mammoth as any).images.imgElement(async (image: any) => {
          try {
            const bytes = await image.readAsBuffer();
            if (bytes.length >= MIN_FIGURE_BYTES) {
              found.push({
                mimeType: image.contentType || "image/png",
                data: bytes.toString("base64"),
                bytes: bytes.length,
              });
            }
          } catch {
            /* one unreadable image should not lose the rest */
          }
          return { src: "" };
        }),
      }
    );
  } catch (err: any) {
    console.warn("Could not read figures from the document:", err?.message || err);
    return [];
  }

  // Biggest first: the full-page build photo matters more than a small inset.
  return found
    .sort((a, b) => b.bytes - a.bytes)
    .slice(0, MAX_FIGURES)
    .map(({ mimeType, data }) => ({ mimeType, data }));
};

// API endpoint to extract text from pdf, docx, or text files
app.post("/api/extract-text", async (req, res) => {
  const { fileBase64, fileName } = req.body;

  if (!fileBase64 || typeof fileBase64 !== "string") {
    return res.status(400).json({ error: "fileBase64 string is required" });
  }

  const extension = fileName?.split(".").pop()?.toLowerCase() || "";

  try {
    const buffer = Buffer.from(fileBase64, "base64");
    let extractedText = "";
    let figures: { mimeType: string; data: string }[] = [];

    if (extension === "pdf") {
      try {
        const pdfParseModule = await import("pdf-parse");
        const PDFParse = (pdfParseModule as any).PDFParse;
        if (PDFParse) {
          const parser = new PDFParse({ data: buffer });
          const textResult = await parser.getText();
          extractedText = textResult?.text || "";
        } else if (typeof (pdfParseModule as any).default === "function") {
          const data = await (pdfParseModule as any).default(buffer);
          extractedText = data.text || "";
        } else {
          throw new Error("PDFParse class not available in pdf-parse module");
        }
      } catch (pdfErr: any) {
        console.warn("PDF parser error, falling back to stream text extraction:", pdfErr?.message);
        const rawStr = buffer.toString("binary");
        const matches = rawStr.match(/\(([^()]+)\)\s*T[jJ]/g) || rawStr.match(/[\x20-\x7E\s]{10,}/g);
        if (matches && matches.length > 0) {
          extractedText = matches.map((m) => m.replace(/^[()]+|[()]+$/g, "")).join(" ");
        } else {
          throw new Error(`PDF extraction failed: ${pdfErr?.message || String(pdfErr)}`);
        }
      }
    } else if (extension === "docx") {
      const result = await mammoth.extractRawText({ buffer });
      extractedText = result.value || "";
      figures = await extractDocxFigures(buffer);
    } else if (["txt", "md", "csv", "rtf", "json", "doc"].includes(extension)) {
      extractedText = buffer.toString("utf-8");
    } else {
      return res.status(400).json({ error: `Unsupported file extension: .${extension}` });
    }

    res.json({ text: extractedText, figures });
  } catch (error: any) {
    console.error("Error extracting document text:", error);
    res.status(500).json({
      error: "Failed to extract text from document.",
      details: error?.message || String(error),
    });
  }
});

/**
 * Strip HTML formatting the model sometimes emits inside JSON string fields.
 *
 * Nothing in the UI renders lesson text as HTML, so a stray <p> or <strong>
 * reaches the instructor as literal visible markup. The system instruction asks
 * for plain text, but instructions are not a guarantee and a mangled lesson in
 * front of a classroom is not a recoverable error.
 *
 * Only a narrow list of formatting tags is removed. Anything else — an <svg>, a
 * code sample, or "5 < 10" — is left intact, because coding lessons legitimately
 * contain angle brackets and over-eager stripping would corrupt them.
 */
const FORMATTING_TAG = /<\/?(?:p|br|div|span|strong|b|em|i|u|ul|ol|h[1-6])(?:\s[^>]*)?\/?>/gi;

const stripMarkup = (value: string): string => {
  let out = value.replace(/<\/?li(?:\s[^>]*)?>/gi, " ").replace(FORMATTING_TAG, " ");

  // Undo entity escaping so "&amp;" and "&lt;" do not reach the instructor raw.
  out = out
    .replace(/&nbsp;/gi, " ")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/&amp;/gi, "&");

  // Tags become spaces, which otherwise strands a gap before punctuation
  // ("balloon rocket . Then measure").
  return out
    .replace(/[ \t]{2,}/g, " ")
    .replace(/\s+([.,;:!?)])/g, "$1")
    .trim();
};

const stripMarkupFromLesson = (node: any): any => {
  if (typeof node === "string") return stripMarkup(node);
  if (Array.isArray(node)) return node.map(stripMarkupFromLesson);
  if (node && typeof node === "object") {
    return Object.fromEntries(Object.entries(node).map(([k, v]) => [k, stripMarkupFromLesson(v)]));
  }
  return node;
};

// API endpoint to process lesson plan using Gemini
app.post("/api/process-lesson", async (req, res) => {
  if (!ai) {
    return res.status(500).json({
      error: "Gemini API client is not initialized. Please ensure GEMINI_API_KEY is configured in your secrets.",
    });
  }

  const { lessonContent, customPreferences, instructorMemory, figures } = req.body;

  if (!lessonContent || typeof lessonContent !== "string") {
    return res.status(400).json({ error: "lessonContent string is required" });
  }

  try {
    const memoryDirective = instructorMemory ? `\n\nINSTRUCTOR LEARNING & STYLE MEMORY:\nYou have learned the following personal teaching style and directives for this specific instructor across sessions:\n"${instructorMemory}"\nAdapt all pacing, difficulty, gamification narrative style, and software/hardware choices to honor these learned preferences.` : "";

    const systemInstruction = `You are Lyrah, an enthusiastic, creative, and highly organized AI teaching copilot for STEM/STEAM instructors.
Your mission is to help instructors transform standard, text-heavy, or dry lesson plans into immersive, gamified learning adventures for children (ages 5-14). You specialize in hands-on engineering challenges and block-based coding environments (Scratch, ScratchJr, EduBlocks, Code.org, Thunkable). You help instructors manage multi-session pacing and streamline heavy documentation into digestible, visually engaging student experiences.
${memoryDirective}

TIME AND SCOPE DISCIPLINE - THIS OUTRANKS EVERY OTHER INSTRUCTION:

The instructor reading your output has roughly thirty minutes of paid preparation for their entire week and forty-five to sixty minutes to actually teach. They are handed seven- and eight-page lesson plans and use one page of them. Your job is to CUT, not to add. A shorter plan that gets taught beats a thorough one that gets abandoned.

1. FIND THE LEARNING GOAL BEFORE ANYTHING ELSE. Read the "Learning Goal(s)", "Objectives" or "Standards" section first. If none is stated, decide the single thing students must be able to do by the end. Everything you produce serves that one goal. Anything that does not serve it is cut, however interesting it is.

   Where the source lists SEVERAL learning goals, it is describing a unit, not one class. Choose the one this session is actually about - the title and the main activity will tell you, so a lesson called "Discovery Lab: The Heart" is about the heart even when the goals also mention DNA, lungs and bones - and put the others in lessonScope.deferred as future sessions. Attempting four goals in one hour is how a plan becomes unteachable, and it is worst with the youngest children.

1b. ONE NEW WORD, NOT A GLOSSARY. These children have been in school all day. Ages 5-7 can hold one new word per session; ages 8-10, two. Choose the single word the activity cannot be done without, define it in language a child that age would use, and put every other term in lessonScope.reviewVocabulary as words to revisit if time allows. A vocabulary list of six terms is a list nobody teaches.

2. BUDGET REAL MINUTES, NOT IDEAL ONES. Subtract setup, transitions and cleanup from the stated duration before planning anything, then plan only what remains.

   Attention span by age, which caps how long you may talk:
   - Ages 5-7: about 10 minutes before hands must be on materials.
   - Ages 8-10: about 12-15 minutes.
   - Ages 11 and up: about 15-20 minutes.

   Setup and settling costs roughly 10 minutes with any group of children, and more with the youngest.

   Cleanup depends on BOTH the materials and the age, and instructors consistently underestimate it. Start from what the activity touches, then adjust for who is doing the tidying.

   Materials set the baseline:
   - Water, soil, sand, paint, liquid glue, plaster, food dye or anything that spills, stains, or sends children to a sink: 15 minutes. These lessons need a genuinely short activity, and saying so is more useful than pretending otherwise.
   - Glue sticks, scissors, tape, cardboard, string, small parts to collect and count back in: 8-10 minutes. Glue sticks are not paint - they make hands sticky, not floors.
   - Blocks, LEGO or kits that go back in a bin: 5-8 minutes.
   - Paper and pencils only, or screens only: 3-5 minutes.

   Age then adjusts that baseline, and it never drops to nothing:
   - Ages 5-7: add 5 minutes, and never budget less than 8 minutes whatever the materials. At this age tidying is a supervised activity you run, not an instruction you give, and it needs its own transition.
   - Ages 8-10: the baseline as stated. They can tidy to a clear instruction but need checking.
   - Ages 11 and up: subtract 2-3 minutes. They can be directed and largely left to it.

   State the figure you used and what drove it in lessonScope.cleanupMinutes and lessonScope.cleanupReason, naming both the messy material and the age where the age is what pushed it up.

   State the cleanup figure you used and what drove it in lessonScope.cleanupMinutes and lessonScope.cleanupReason. An instructor who sees "15 minutes, because of the water trays" can plan the sink run; one who is handed a plan assuming 5 minutes discovers the problem at the sink.

3. ONE HANDS-ON ACTIVITY. A forty-five to sixty minute class with young children has room for one build, not a warm-up plus a practice activity plus a main project. Choose the one that best serves the learning goal, and name the others briefly in lessonScope.deferred as later sessions. The instructor still has the original plan in front of them, so a short line is enough - they do not need it rewritten.

4. CUT OUT LOUD. Record what you removed and why. An instructor who can see what was dropped can put it back deliberately; one handed everything can find nothing.

4b. NEVER CHANGE THE AGE GROUP. The instructor cannot send these children away and get older ones. Where the source activity is beyond the stated age - fine motor work, reading demands, multi-step sequencing - keep the age and simplify the activity instead: pre-assemble the fiddly parts, use larger components, cut the number of steps, or make it a teacher demonstration the children take turns in. Then say what you simplified and why in lessonScope.warning. Recommending a different age band is not an adaptation, it is handing the problem back.

5. IF IT DOES NOT FIT, SAY SO. When the source cannot fit the stated duration for that age, say it plainly rather than compressing it into something unteachable. Instructors already know these plans are overstuffed; being told directly is a relief, not a failure.

6. SLIDES ARE FOR THE BOARD. Three to five, with a handful of words each. Nobody delivers twelve slides and a build in one hour.

OUTPUT FORMAT:
- Every string you return is displayed to the instructor exactly as written. Write plain prose.
- Never use HTML tags (<p>, <br>, <strong>, <li>) or Markdown syntax (**bold**, ## headings, - bullets) inside any field. The interface applies its own styling; your markup reaches the instructor as visible clutter in the middle of a lesson.
- Where a field takes a list, return separate array items rather than one string with bullet characters in it.

PROFILE & TONE:
- Tone & Style: Energetic, encouraging, imaginative, and highly collaborative. Speak like a seasoned, innovative educator who believes learning should feel like play.
- Core Philosophy: "Curriculum is the skeleton; imagination is the body." Never sacrifice academic rigor, but insist it be delivered through active, high-engagement narratives.
- Key Traits: Resourceful, child-centric, adaptive, structured, and proactive.

CORE INSTRUCTIONS & TASKS:
1. CONDENSE & MANAGE PACING: Turn walls of text into clean, high-impact key takeaways. Track heavy documentation and streamline deferred bloat/vocabulary for multi-session pacing.
2. GAMIFICATION TRANSLATION: Convert traditional engineering and coding objectives into quests, mysteries, or challenges (e.g., framing a catapult build as a "castle siege defense" or a Scratch script as "programming a robot's escape route").
3. BLOCK-BASED CODE ARCHITECT: Deconstruct programming logic into developmentally appropriate Scratch, ScratchJr, EduBlocks, Thunkable, or Code.org workflows. Translate instructions into exact text representations of blocks (e.g., \`[When Green Flag Clicked] -> [Repeat 10] -> [Move 10 Steps]\`).
4. PLATFORM-SPECIFIC GAMIFICATION & METAPHORS: Create fun metaphors for coding block categories (e.g., ScratchJr Triggering Blocks as "magic start buttons", Scratch Variables as "backpacks that hold secrets").
5. STEP-BY-STEP VISUAL LAYOUTS: Transform text-heavy instructions into child-friendly visual layouts, text-based block stacks, or structured storyboard prompts.
6. AUDIT LINKS & RESOURCES: Proactively scan lesson plans to identify broken, outdated, or missing video/slide deck links, and suggest high-quality relevant web replacements in mediaRecommendations.
7. ACTIVE LEARNING OPTIMIZATION: Create hands-on experiments, role-play scenarios, or collaborative team challenges to replace passive listening.
8. DIFFERENTIATED ADAPTATION: Offer quick modifications to scale complexity up or down based on student age, platform familiarity, or skill level.

SOFTWARE PLATFORMS & HARDWARE GUIDELINES (CRITICAL - DO NOT CONFUSE PLATFORMS):
- Scratch 3.0: 2D sprite/costume/stage environment with green flag events, broadcast messages, sprite motion, clones, and variables.
- ScratchJr (ages 5-7): Horizontal block grammar.
  * Triggering: Start on Green Flag, Start on Tap, Start on Bump, Start on Message, Send Message.
  * Motion: Move Right, Move Left, Move Up, Move Down, Turn Right, Turn Left, Hop, Go Home.
  * Looks: Say, Grow, Shrink, Reset Size, Hide, Show.
  * Sound: Pop, Play Recorded Sound.
  * Control: Wait, Stop, Set Speed, Repeat.
  * End: End, Repeat Forever, Go to Page.
- EduBlocks: Drag-and-drop block interface for Python / HTML text-based coding by Anaconda.
- Thunkable / Block-Based Canva: Event blocks (e.g., when Button clicked) and UI/sound blocks.
- NEVER SUBSTITUTE A PLATFORM THE LESSON DID NOT ASK FOR. If the lesson names Scratch, sprites, costumes, backdrops, green flag or ScratchJr, produce a Scratch / ScratchJr plan. If it names no software at all, produce a hands-on lesson using ordinary classroom materials rather than inventing a platform requirement.
- CHECK GOAL COMPATIBILITY: Verify whether goals work natively with identified software limits (e.g., ScratchJr lacks variables, so adapt score goals to page triggers or upgrade to Scratch 3.0; Code.org Game Lab has no persistent save between sessions, so multi-day builds need an export step).
- CIRCUITRY / HARDWARE: If the lesson involves Circuitry, Electronics, or Hardware (DC Motors, LEDs, Copper Tape, Breadboards, Alligator Clips, Micro:bit), specify exact components, polarity, and circuit configuration.

REAL-WORLD FEASIBILITY AUDIT & ALTERNATIVES:
- Evaluate whether the setup will work in a live classroom. In 'feasibilityAudit', explicitly state 'identifiedSoftwarePlatform' and 'softwareGoalCompatibility', evaluate potential failure points, and provide grounded 'recommendedAlternatives' and troubleshooting tips.

You must output a highly structured JSON object matching the defined responseSchema strictly. Do not deviate.`;

    const userPrompt = `Here is the raw lesson plan or topic to transform:
----------------------------------
${lessonContent}
----------------------------------

${customPreferences ? `Teacher's Custom Request & Available Supplies/Tools: ${customPreferences}` : ""}

Convert this into the shortest plan that still teaches the learning goal in the time available. Include slides, a worksheet, a quiz, one hands-on activity, media backup queries, and a feasibility audit - but only as much of each as fits the minutes and the age. Fill in lessonScope honestly, including what you cut.`;

    // PASS 1 - grounded research.
    //
    // Gemini will not accept googleSearch alongside responseMimeType/
    // responseSchema, so grounding cannot simply be switched on for the
    // structured call below. Instead we run a short grounded pass first and
    // feed its findings into the structured pass as context.
    //
    // Best effort by design: if this fails, times out, or the model returns
    // nothing, lesson generation proceeds ungrounded rather than erroring.
    let groundedFindings = "";
    let groundingCitations: string[] = [];

    try {
      const research = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: `Research this STEM lesson topic for a K-12 instructor and report only what you verify.

TOPIC / RAW LESSON:
${lessonContent.slice(0, 4000)}

${customPreferences ? `INSTRUCTOR CONTEXT: ${customPreferences}` : ""}

Report, in under 300 words:
1. Any factual corrections - dates, values, mechanisms, terminology - if the material states something outdated or wrong.
2. Two or three currently-working, classroom-appropriate resources (video, simulation, or activity guide) with their real URLs.
3. One current, concrete real-world example an instructor could reference this term.

If you cannot verify something, leave it out. Do not invent URLs.`,
        config: {
          tools: [{ googleSearch: {} }],
        },
      });

      groundedFindings = research.text || "";

      const chunks = research.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
      groundingCitations = chunks
        .map((c: any) => c.web?.uri)
        .filter((u: any): u is string => typeof u === "string" && u.length > 0);

      console.log(
        `Grounding pass: ${groundedFindings.length} chars, ${groundingCitations.length} sources`
      );
    } catch (groundErr: any) {
      console.warn("Grounding pass failed; generating ungrounded:", groundErr?.message);
    }

    const groundedContext = groundedFindings
      ? `

VERIFIED RESEARCH (from a Google Search grounded pass - prefer these facts and links over your own recollection, and do not contradict them):
${groundedFindings}`
      : "";

    // PASS 2 - structured generation, with the research folded in.
    // The figures from the source document go in alongside the text, so the
    // build described back is the one the instructor is actually holding.
    const sourceFigures = Array.isArray(figures) ? figures.slice(0, 4) : [];
    const figureDirective = sourceFigures.length
      ? `

[SOURCE FIGURES]
The ${sourceFigures.length} image(s) attached are the diagrams and photographs from this lesson document. They show the actual build. Read them before writing handsOnActivity and visualSuggestion.
- Describe the apparatus you can SEE, not one you infer from the prose. Where the pictures and the written steps disagree, the pictures are the lesson.
- Name the parts as they appear: their real shapes, how they join, what is on top of what.
- visualSuggestion.prompt must describe THIS object closely enough that an illustrator who has not seen the photograph would draw the same thing.`
      : "";

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: sourceFigures.length
        ? [
            {
              role: "user",
              parts: [
                ...sourceFigures.map((f: any) => ({
                  inlineData: { mimeType: f.mimeType || "image/png", data: f.data },
                })),
                { text: userPrompt + groundedContext + figureDirective },
              ],
            },
          ]
        : userPrompt + groundedContext,
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          required: [
            "lessonTitle",
            "duration",
            "summary",
            "keyTakeaways",
            "slides",
            "handsOnActivity",
            "worksheet",
            "quiz",
            "mediaRecommendations",
            "extractedStyleNotes",
            "feasibilityAudit",
          ],
          properties: {
            visualSuggestion: {
              type: Type.OBJECT,
              description: "Whether this lesson needs a generated illustration. This is a real decision with a wrong answer in both directions: a confusing picture in front of a class is worse than none, and a build with no picture leaves children guessing.",
              required: ["needed", "reason"],
              properties: {
                needed: {
                  type: Type.BOOLEAN,
                  description: "Judge this for a BRAND NEW INSTRUCTOR who has never run this activity before - not for an experienced one who could picture it from the steps. That person is the reason the picture exists. An experienced instructor can skip it; a new counsellor handed written steps alone ends up asking a colleague for a live demonstration. Answer true whenever children ASSEMBLE anything physical. Builds in engineering, circuitry and hands-on science are almost always true, including ones that look obvious to someone who has run them before - a balloon taped to a straw on a string still has a nozzle direction and a tape position a newcomer gets wrong. Answer false for everything else, and most lessons are everything else: discussion, reading, worksheets, observation, sorting, coding whose blocks are already written out as text, or a build so simple it is one obvious step (blow up a balloon and let it go). If the written steps already leave nothing ambiguous, the answer is false even for a hands-on lesson. Do not answer true because a picture would be nice, decorative or engaging - the only question is whether an instructor or a child would otherwise be unsure what the thing is supposed to look like. When genuinely torn, answer false.",
                },
                reason: {
                  type: Type.STRING,
                  description: "One short sentence for the instructor, naming what makes it ambiguous or what makes it obvious. Write 'The straw threads through the cup at a right angle, which is hard to picture from the steps' rather than 'a visual aid supports comprehension'.",
                },
                prompt: {
                  type: Type.STRING,
                  description: "Only when needed is true. Ask for a NUMBERED STEP-BY-STEP ASSEMBLY DIAGRAM - four to six panels showing the build coming together in order, each panel captioned with what happens in it and the parts labelled with plain arrows. A single picture of the finished object is what makes a new instructor ask for a live demonstration: they cannot see how it got there. Panel one starts with loose materials on a table; the last panel shows the completed build in use. Name the EXACT materials from handsOnActivity.materials in every panel they appear in, and forbid substituting similar-looking objects - a windmill of paper cups, a bendable straw and metal washers must never be drawn as a wooden water wheel with spoons. Ask for clean black line art on a white background, the style of a childrens how-to-draw guide. Omit when needed is false.",
                },
              },
            },
            lessonScope: {
              type: Type.OBJECT,
              description: "How the lesson was cut to fit the class. This is the instructor's evidence that the plan is teachable in the time they actually have.",
              required: ["mainGoal", "teachableMinutes", "cleanupMinutes", "cleanupReason", "segments", "cut"],
              properties: {
                mainGoal: {
                  type: Type.STRING,
                  description: "The single thing students must be able to do by the end, in one sentence, taken from the lesson's stated Learning Goals where present.",
                },
                teachableMinutes: {
                  type: Type.INTEGER,
                  description: "Minutes genuinely available for teaching, after subtracting setup, transitions and cleanup from the stated class duration.",
                },
                cleanupMinutes: {
                  type: Type.INTEGER,
                  description: "Minutes reserved for cleanup, chosen from what the materials actually require rather than from the age alone.",
                },
                cleanupReason: {
                  type: Type.STRING,
                  description: "What drove that figure, naming the messy material. E.g. 'Water trays and soil - 15 minutes including the sink run'.",
                },
                segments: {
                  type: Type.ARRAY,
                  description: "How those minutes are spent. Must sum to teachableMinutes or less. Usually two or three entries, not five.",
                  items: {
                    type: Type.OBJECT,
                    required: ["name", "minutes", "servesGoal"],
                    properties: {
                      name: { type: Type.STRING, description: "E.g. 'Build the windmill'." },
                      minutes: { type: Type.INTEGER, description: "Minutes for this segment." },
                      servesGoal: { type: Type.STRING, description: "One line on how this segment moves students toward the main goal." },
                    },
                  },
                },
                cut: {
                  type: Type.ARRAY,
                  description: "What was removed from the source material and why. Be specific and honest - an instructor can put something back only if they can see it was taken out.",
                  items: {
                    type: Type.OBJECT,
                    required: ["item", "reason"],
                    properties: {
                      item: { type: Type.STRING, description: "The activity, vocabulary set or section that was removed." },
                      reason: { type: Type.STRING, description: "Why it did not survive the time budget or the learning goal." },
                    },
                  },
                },
                keyVocabulary: {
                  type: Type.OBJECT,
                  description: "The one word this session teaches. One for ages 5-7, at most two for 8-10.",
                  required: ["word", "childDefinition"],
                  properties: {
                    word: { type: Type.STRING, description: "The single term the activity cannot be done without." },
                    childDefinition: { type: Type.STRING, description: "Defined the way a child of this age would say it, in one short sentence." },
                  },
                },
                reviewVocabulary: {
                  type: Type.ARRAY,
                  description: "Other terms from the source, kept aside to revisit if time allows rather than taught as new material.",
                  items: { type: Type.STRING },
                },
                deferred: {
                  type: Type.ARRAY,
                  description: "Activities from the source worth teaching in a later session rather than today. One short line each.",
                  items: { type: Type.STRING },
                },
                warning: {
                  type: Type.STRING,
                  description: "Present only when the source lesson genuinely cannot fit the stated duration for this age group. Say so plainly and name what would have to give.",
                },
              },
            },
            extractedStyleNotes: {
              type: Type.STRING,
              description: "A short, one-sentence observation about this instructor's style, preferences, or technical level based on their inputs. Write in 3rd person singular/plural (e.g., 'Instructor prefers...').",
            },
            lessonTitle: {
              type: Type.STRING,
              description: "A catchy, kid-friendly STEM title for the lesson.",
            },
            duration: {
              type: Type.STRING,
              description: "Total suggested teaching time, e.g., '45-60 minutes'.",
            },
            summary: {
              type: Type.STRING,
              description: "A concise 2-3 sentence overview of what students will explore and learn.",
            },
            keyTakeaways: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "3-5 high-impact bullet points summarizing the core scientific principles.",
            },
            slides: {
              type: Type.ARRAY,
              description: "Three to five slides. Fewer is better - these are read off a board by children, not by the instructor.",
              items: {
                type: Type.OBJECT,
                required: ["title", "content", "visualConcept", "instructorNotes"],
                properties: {
                  title: { type: Type.STRING, description: "Slide header or key question." },
                  content: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING },
                    description: "2-3 short, kid-friendly bullets of information.",
                  },
                  visualConcept: {
                    type: Type.STRING,
                    description: "Detailed description of what diagram, simulation, or graphic should be drawn/shown on screen to represent this slide.",
                  },
                  instructorNotes: {
                    type: Type.STRING,
                    description: "Crucial guidance for the teacher on how to present this concept playfully or what questions to ask students.",
                  },
                },
              },
            },
            handsOnActivity: {
              type: Type.OBJECT,
              description: "An engaging, safe, hands-on scientific demonstration or building project.",
              required: ["title", "materials", "steps", "scientificPrinciple"],
              properties: {
                title: { type: Type.STRING, description: "Exciting name of the activity." },
                materials: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                  description: "List of common household/afterschool materials needed.",
                },
                steps: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                  description: "Clear, step-by-step experiment instructions for students.",
                },
                scientificPrinciple: {
                  type: Type.STRING,
                  description: "Kid-friendly scientific explanation of why the activity works (the 'Magic behind the science').",
                },
                softwarePlatform: {
                  type: Type.STRING,
                  description: "If this lesson involves coding or software, specify the exact software (e.g. 'Scratch JR', 'Scratch 3.0', 'EduBlocks', 'Thunkable', 'Code.org', 'Python', 'Micro:bit').",
                },
              },
            },
            feasibilityAudit: {
              type: Type.OBJECT,
              description: "Evaluation of the technical, physical, or software feasibility of the lesson setup. Identifies potential failure points and provides realistic, search-grounded alternatives.",
              required: ["status", "originalSolutionEvaluation", "potentialFailurePoints", "recommendedAlternatives", "safetyAndTroubleshootingTips"],
              properties: {
                status: {
                  type: Type.STRING,
                  description: "E.g. 'Feasible & Grounded Solution', 'Scratch 3.0 Sprite Logic Verified', 'Scratch Jr Block Alternative Provided'.",
                },
                identifiedSoftwarePlatform: {
                  type: Type.STRING,
                  description: "Primary identified software platform, e.g. 'Scratch 3.0', 'Scratch JR', 'Roblox Studio', 'EduBlocks', 'Thunkable', 'Code.org', 'Python', 'Micro:bit'.",
                },
                softwareGoalCompatibility: {
                  type: Type.STRING,
                  description: "Evaluation of whether the lesson goals natively work with the identified software limits (e.g., '100% Native Scratch 3.0 Block Compatibility', 'Incompatible: Scratch JR lacks variables -> Adapted to Page Triggers').",
                },
                originalSolutionEvaluation: {
                  type: Type.STRING,
                  description: "Technical review of the proposed circuit, software block setup, or physical engineering model.",
                },
                potentialFailurePoints: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                  description: "List of specific things that might go wrong during the live classroom demo or build.",
                },
                recommendedAlternatives: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    required: ["title", "description", "whyItWorksBetter"],
                    properties: {
                      title: { type: Type.STRING, description: "Name of the realistic alternative solution." },
                      description: { type: Type.STRING, description: "Clear explanation of the tested, reliable setup or code approach." },
                      whyItWorksBetter: { type: Type.STRING, description: "Why this alternative guarantees a successful classroom outcome." },
                    },
                  },
                  description: "1-3 tested, realistic alternative setups or software platforms if the original solution is flawed or hard to obtain.",
                },
                safetyAndTroubleshootingTips: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                  description: "Practical troubleshooting tips for the instructor when students encounter bugs or hardware issues.",
                },
              },
            },
            worksheet: {
              type: Type.OBJECT,
              description: "A customized student worksheet to print or complete in class.",
              required: ["title", "instructions", "questions"],
              properties: {
                title: { type: Type.STRING },
                instructions: { type: Type.STRING, description: "Simple instructions for the student." },
                questions: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    required: ["id", "questionText", "answerType", "sampleAnswer"],
                    properties: {
                      id: { type: Type.STRING, description: "Q1, Q2, Q3, etc." },
                      questionText: { type: Type.STRING, description: "The question or prompt." },
                      answerType: {
                        type: Type.STRING,
                        description: "E.g., 'Fill in the Blank', 'Short Answer', 'Drawing Task'.",
                      },
                      options: {
                        type: Type.ARRAY,
                        items: { type: Type.STRING },
                        description: "Options if it is multiple-choice.",
                      },
                      sampleAnswer: { type: Type.STRING, description: "The correct or expected student response." },
                    },
                  },
                },
              },
            },
            quiz: {
              type: Type.ARRAY,
              description: "A fun 4-5 question multiple-choice checking quiz for smart-board review.",
              items: {
                type: Type.OBJECT,
                required: ["question", "options", "correctAnswerIndex", "explanation"],
                properties: {
                  question: { type: Type.STRING },
                  options: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING },
                    description: "Exactly 4 options.",
                  },
                  correctAnswerIndex: { type: Type.INTEGER, description: "0-based index of the correct answer." },
                  explanation: { type: Type.STRING, description: "Short explanation of why it is correct." },
                },
              },
            },
            mediaRecommendations: {
              type: Type.ARRAY,
              description: "Resolved backup search terms to prevent broken media link disruptions.",
              items: {
                type: Type.OBJECT,
                required: ["resourceType", "suggestedSearchQuery", "whyItHelps"],
                properties: {
                  resourceType: { type: Type.STRING, description: "E.g., 'Video Demonstration', 'Interactive Map', 'PhET Simulation'." },
                  suggestedSearchQuery: { type: Type.STRING, description: "Perfect search phrase for YouTube or Google Search." },
                  whyItHelps: { type: Type.STRING, description: "Explain what this visual shows and why it solves broken asset issues." },
                },
              },
            },
          },
        },
      },
    });

    const text = response.text;
    if (!text) {
      throw new Error("No text returned from Gemini API");
    }

    const processedData = stripMarkupFromLesson(JSON.parse(text.trim()));

    // Surface the grounding so the UI can cite sources and so the run leaves
    // an auditable trail of what was verified.
    res.json({
      ...processedData,
      grounding: {
        used: groundingCitations.length > 0 || groundedFindings.length > 0,
        sources: groundingCitations,
      },
    });
  } catch (error: any) {
    console.error("Gemini processing error:", error);
    res.status(500).json({
      error: "Failed to process the lesson plan.",
      details: error?.message || String(error),
    });
  }
});

// API endpoint to initiate Veo video generation
app.post("/api/generate-video", async (req, res) => {
  if (!ai) {
    return res.status(500).json({
      error: "Gemini client not initialized. Please ensure GEMINI_API_KEY is configured."
    });
  }
  const { prompt, aspectRatio, resolution, mode, customStyle } = req.body;
  if (!prompt) {
    return res.status(400).json({ error: "prompt is required" });
  }

  try {
    let enhancedPrompt = prompt;
    if (mode === "3d_animation") {
      enhancedPrompt = `Conceptual 3D scientific visualization, 3D animation style. ${prompt}. High clarity, detailed octane render, clean classroom presentation.`;
    } else if (mode === "cut_scene") {
      enhancedPrompt = `Cinematic video game cut scene style. ${prompt}. Dramatic camera angles, dynamic lighting, game engine cinematic, Unreal Engine 5 render style.`;
    } else if (mode === "cartoon") {
      enhancedPrompt = `Fun whimsical cartoon 2D animation style. ${prompt}. Bright friendly colors, clean lines, playful educational illustration.`;
    } else if (mode === "instructors_choice") {
      const styleName = customStyle || "Custom presentation style";
      enhancedPrompt = `${styleName}. ${prompt}. Playful and clean educational presentation.`;
    } else if (mode === "story_game") { // Fallbacks for old/loaded items if any
      enhancedPrompt = `A choice-driven educational adventure, animated story game style. ${prompt}. Professional 3D digital animation, friendly and bright classroom aesthetic.`;
    } else if (mode === "music_video") {
      enhancedPrompt = `Vibrant, highly synchronized educational music video, cartoon style. ${prompt}. Catchy motion graphics, rhythmic, clear visual beats for kids.`;
    } else if (mode === "presentation") {
      enhancedPrompt = `Conceptual 3D scientific visualization, educational classroom presentation slide background. ${prompt}. High clarity, explanatory diagram/animation style.`;
    }

    console.log(`Starting video generation for: "${enhancedPrompt}" with aspect ratio: ${aspectRatio || '16:9'}`);

    const operation = await ai.models.generateVideos({
      model: "veo-3.1-fast-generate-preview",
      prompt: enhancedPrompt,
      config: {
        numberOfVideos: 1,
        resolution: resolution || "720p",
        aspectRatio: aspectRatio || "16:9"
      }
    });

    res.json({ operationName: operation.name });
  } catch (error: any) {
    console.error("Video generation failed:", error);
    res.status(500).json({
      error: "Failed to initiate video generation.",
      details: error?.message || String(error)
    });
  }
});

// API endpoint to poll Veo video status
app.post("/api/video-status", async (req, res) => {
  if (!ai) {
    return res.status(500).json({ error: "Gemini client not initialized." });
  }
  const { operationName } = req.body;
  if (!operationName) {
    return res.status(400).json({ error: "operationName is required" });
  }

  try {
    const updated = await ai.operations.getVideosOperation({
      operation: { name: operationName } as any
    });
    res.json({
      done: updated.done,
      response: updated.response,
      error: updated.error
    });
  } catch (error: any) {
    console.error("Checking video status failed:", error);
    res.status(500).json({
      error: "Failed to fetch video status.",
      details: error?.message || String(error)
    });
  }
});

// API endpoint to download the generated video binary
app.post("/api/video-download", async (req, res) => {
  if (!ai) {
    return res.status(500).json({ error: "Gemini client not initialized." });
  }
  const { operationName } = req.body;
  if (!operationName) {
    return res.status(400).json({ error: "operationName is required" });
  }

  try {
    const updated = await ai.operations.getVideosOperation({
      operation: { name: operationName } as any
    });
    const uri = updated.response?.generatedVideos?.[0]?.video?.uri;
    if (!uri) {
      return res.status(400).json({ error: "Video URI not found in operation response." });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    const response = await fetch(uri, {
      headers: { "x-goog-api-key": apiKey || "" }
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch video stream from Google servers: ${response.statusText}`);
    }

    const arrayBuffer = await response.arrayBuffer();
    res.setHeader("Content-Type", "video/mp4");
    res.send(Buffer.from(arrayBuffer));
  } catch (error: any) {
    console.error("Video download failed:", error);
    res.status(500).json({
      error: "Failed to download generated video.",
      details: error?.message || String(error)
    });
  }
});

// API endpoint to generate music using Lyria models
app.post("/api/generate-music", async (req, res) => {
  if (!ai) {
    return res.status(500).json({
      error: "Gemini client not initialized. Ensure GEMINI_API_KEY is configured."
    });
  }
  const { prompt, length } = req.body;
  if (!prompt) {
    return res.status(400).json({ error: "prompt is required" });
  }

  try {
    const selectedModel = length === "pro" ? "lyria-3-pro-preview" : "lyria-3-clip-preview";
    console.log(`Starting music generation with model: ${selectedModel}, prompt: "${prompt}"`);

    const responseStream = await ai.models.generateContentStream({
      model: selectedModel,
      contents: prompt,
      config: {
        responseModalities: ["AUDIO"]
      }
    });

    let audioBase64 = "";
    let lyrics = "";
    let mimeType = "audio/wav";

    for await (const chunk of responseStream) {
      const parts = chunk.candidates?.[0]?.content?.parts;
      if (!parts) continue;
      for (const part of parts) {
        if (part.inlineData?.data) {
          if (!audioBase64 && part.inlineData.mimeType) {
            mimeType = part.inlineData.mimeType;
          }
          audioBase64 += part.inlineData.data;
        }
        if (part.text) {
          lyrics += part.text;
        }
      }
    }

    if (!audioBase64) {
      throw new Error("No audio content returned from Lyria model.");
    }

    res.json({
      audio: audioBase64,
      lyrics: lyrics,
      mimeType: mimeType
    });
  } catch (error: any) {
    console.error("Music generation failed:", error);
    res.status(500).json({
      error: "Failed to generate music.",
      details: error?.message || String(error)
    });
  }
});

// API endpoint for Co-Teacher multi-turn chat assistant
app.post("/api/chat", async (req, res) => {
  if (!ai) {
    return res.status(500).json({ error: "Gemini client not initialized." });
  }

  const { messages, model, systemInstruction, useSearch, thinkingLevel } = req.body;
  if (!messages || !Array.isArray(messages)) {
    return res.status(400).json({ error: "messages array is required" });
  }

  try {
    const contents = messages.map((m: any) => ({
      role: m.role === "assistant" ? "model" : "user",
      parts: [{ text: m.content }]
    }));

    const selectedModel = useSearch ? "gemini-3.5-flash" : (model || "gemini-3.5-flash");

    const tools: any[] = [];
    if (useSearch) {
      tools.push({ googleSearch: {} });
    }

    const defaultLyrahSysInst = `You are Lyrah, an enthusiastic, creative, and highly organized AI teaching copilot.
Your mission is to help STEM and STEAM instructors transform standard, text-heavy, or dry lesson plans into immersive, gamified learning adventures for children (ages 5-14). You specialize in hands-on engineering challenges and block-based coding environments (Scratch, ScratchJr, EduBlocks, Code.org, Thunkable). You help instructors manage multi-session pacing and streamline heavy documentation into digestible, visually engaging student experiences.

PROFILE & TONE:
- Tone & Style: Energetic, encouraging, imaginative, and highly collaborative. Speak like a seasoned, innovative educator who believes learning should feel like play.
- Core Philosophy: "Curriculum is the skeleton; imagination is the body." Never sacrifice academic rigor, but insist it be delivered through active, high-engagement narratives.
- Key Traits: Resourceful, child-centric, adaptive, structured, and proactive.

CORE TASKS & CAPABILITIES:
1. Maintain Multi-Session Memory & Pacing: Actively track what has been taught and what "bloat" vocabulary or material was deferred for each instructor across semesters/camps.
2. Apply Gamification Translation: Convert traditional engineering and coding objectives into quests, mysteries, or challenges (e.g., catapult -> castle siege defense, Scratch script -> robot's escape route).
3. Act as a Block-Based Code Architect: Deconstruct complex programming logic into Scratch, ScratchJr, EduBlocks, Thunkable, or Code.org workflows. Translate instructions into exact text representations of blocks: \`[When Green Flag Clicked] -> [Repeat 10] -> [Move 10 Steps]\`.
4. Design Platform-Specific Gamification: Create fun metaphors for coding block categories (e.g., ScratchJr "Triggering Blocks" as "magic start buttons" or Scratch "Variables" as "backpacks that hold secrets").
5. Create Visual Step-by-Step Layouts: Transform dry, text-heavy technical building or coding instructions into child-friendly visual layouts, text-based block stacks, or storyboard prompts.
6. Audit Links & Resources: Proactively scan lesson plans to identify broken, outdated, or missing video/slide deck links, and suggest high-quality relevant web replacements.
7. Optimize for Active Learning: Suggest hands-on experiments, role-play scenarios, or collaborative team challenges to replace passive listening.
8. Provide Differentiated Adaptation: Offer quick modifications to scale complexity up or down based on student age, platform familiarity, or skill level.

SOFTWARE PLATFORM KNOWLEDGE:
- Scratch / Scratch Blocks: 2D sprites, costumes, backdrops, green flag events, broadcast messages, clones, variables.
- ScratchJr (ages 5-7): Horizontal block grammar (Triggering: Green Flag, Tap, Bump, Message; Motion: Move Right/Left/Up/Down, Turn, Hop, Go Home; Looks: Say, Grow, Shrink, Reset Size, Hide, Show; Sound: Pop, Record; Control: Wait, Stop, Set Speed, Repeat; End: End, Repeat Forever, Go to Page).
- EduBlocks (Anaconda): Drag-and-drop block coding for Python and HTML.
`;

    const baseSysInst = systemInstruction || defaultLyrahSysInst;
    const fullSystemInstruction = `${baseSysInst}\n\n[SVG Diagram Rule]: Only generate or output raw inline SVG diagrams (<svg>...</svg>) if the user query or active demo path visibly depends on text-generated vector visuals. Otherwise, stick to clean Markdown text formatting and structured explanations.`;

    const config: any = {
      systemInstruction: fullSystemInstruction,
      tools: tools.length > 0 ? tools : undefined
    };

    if (selectedModel === "gemini-3.1-pro-preview" || thinkingLevel === "HIGH") {
      config.thinkingConfig = { thinkingLevel: ThinkingLevel.HIGH };
      // Do NOT set maxOutputTokens when high thinking mode is enabled
    }

    const response = await ai.models.generateContent({
      model: selectedModel,
      contents: contents,
      config: config
    });

    res.json({
      reply: response.text,
      groundingMetadata: response.candidates?.[0]?.groundingMetadata || null
    });
  } catch (error: any) {
    console.error("Chat failed:", error);
    res.status(500).json({
      error: "Chat request failed.",
      details: error?.message || String(error)
    });
  }
});

// API endpoint for image creation and editing (gemini-3.1-flash-image)
app.post("/api/generate-image", async (req, res) => {
  if (!ai) {
    return res.status(500).json({ error: "Gemini client not initialized." });
  }

  const { prompt, aspectRatio, base64Image, mimeType } = req.body;
  if (!prompt) {
    return res.status(400).json({ error: "prompt is required" });
  }

  try {
    const parts: any[] = [];
    if (base64Image) {
      parts.push({
        inlineData: {
          data: base64Image,
          mimeType: mimeType || "image/png"
        }
      });
    }
    // Ensure text legibility, correct spelling, and clean typography in generated images
    const textQualityInstruction = " RENDER ACCURATE TEXT: Ensure all written text, headings, speech bubbles, labels, and captions in the generated image are rendered in 100% correct, perfectly spelled English typography without typos, stuttered words, or garbled characters.";
    const finalPrompt = prompt.includes("spelled") ? prompt : `${prompt}.${textQualityInstruction}`;
    parts.push({ text: finalPrompt });

    console.log(`Starting image generation with gemini-3.1-flash-image, prompt: "${finalPrompt}"`);

    const response = await ai.models.generateContent({
      model: "gemini-3.1-flash-image",
      contents: { parts },
      config: {
        imageConfig: {
          aspectRatio: aspectRatio || "1:1",
          imageSize: "1K"
        }
      }
    });

    let imageBase64 = "";
    const responseParts = response.candidates?.[0]?.content?.parts || [];
    for (const part of responseParts) {
      if (part.inlineData?.data) {
        imageBase64 = part.inlineData.data;
        break;
      }
    }

    if (!imageBase64) {
      throw new Error("No image data returned from gemini-3.1-flash-image.");
    }

    res.json({
      image: imageBase64,
      mimeType: "image/png"
    });
  } catch (error: any) {
    console.error("Image generation failed:", error);
    res.status(500).json({
      error: "Failed to generate image.",
      details: error?.message || String(error)
    });
  }
});

// API endpoint for video content analysis (gemini-3.1-pro-preview with High Thinking)
app.post("/api/analyze-video", async (req, res) => {
  if (!ai) {
    return res.status(500).json({ error: "Gemini client not initialized." });
  }

  const { videoBase64, mimeType, prompt } = req.body;
  if (!videoBase64) {
    return res.status(400).json({ error: "videoBase64 is required" });
  }

  try {
    console.log("Analyzing video with gemini-3.1-pro-preview (ThinkingLevel.HIGH)...");
    const response = await ai.models.generateContent({
      model: "gemini-3.1-pro-preview",
      contents: [
        {
          inlineData: {
            data: videoBase64,
            mimeType: mimeType || "video/mp4"
          }
        },
        {
          text: prompt || "Analyze this video, summarize its contents, and provide pedagogical insights for a science/coding teacher."
        }
      ],
      config: {
        thinkingConfig: { thinkingLevel: ThinkingLevel.HIGH }
      }
    });

    res.json({ analysis: response.text });
  } catch (error: any) {
    console.error("Video analysis failed:", error);
    res.status(500).json({
      error: "Failed to analyze video.",
      details: error?.message || String(error)
    });
  }
});

// Secure Stripe Checkout Endpoint
app.post("/api/create-checkout-session", async (req, res) => {
  const { uid, email, plan, priceId: reqPriceId } = req.body;

  if (!uid || !email) {
    return res.status(400).json({ error: "User UID and Email are required for payment." });
  }

  const stripeSecret = process.env.STRIPE_SECRET_KEY;
  if (!stripeSecret) {
    return res.status(400).json({ error: "Stripe is not configured on the server. Missing STRIPE_SECRET_KEY." });
  }

  const priceId = reqPriceId || (
    (plan === "yearly" || plan === "annual")
      ? (process.env.STRIPE_PROD_KEY_2 || "price_yearly_educator_99")
      : (plan === "summer" || plan === "summer_1299" || plan === "summer_special")
      ? "price_1U2YXoKExpIuZ5d51zCqxK1f"
      : (process.env.STRIPE_PROD_KEY_1 || "price_1U2OwBKExpIuZ5d5bmfH68py")
  );

  const getProductIdForPrice = (pId: string) => {
    if (pId === "price_1U2YXoKExpIuZ5d51zCqxK1f") return "prod_V2dpA5jan6W2L7";
    return "prod_V2TrpJIKS5bF5O";
  };

  const protocol = req.headers["x-forwarded-proto"] || "https";
  const host = req.headers.host || "localhost:3000";
  const origin = `${protocol}://${host}`;

  try {
    const Stripe = (await import("stripe")).default;
    const stripe = new Stripe(stripeSecret);

    console.log(`Creating Stripe Checkout Session for ${email} (${uid}) using priceId: ${priceId}`);

    let session;
    const defaultMode = (plan === "yearly" || plan === "annual") ? "subscription" : "payment";

    try {
      session = await stripe.checkout.sessions.create({
        payment_method_types: ["card"],
        line_items: [
          {
            price: priceId,
            quantity: 1,
          },
        ],
        mode: defaultMode as any,
        // Lets instructors redeem a promotion code at checkout. Without this
        // Stripe renders no code box at all, so coupons created in the
        // dashboard would silently never apply.
        allow_promotion_codes: true,
        customer_email: email,
        client_reference_id: uid,
        success_url: `${origin}/?payment=success&session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${origin}/?payment=cancel`,
        metadata: {
          uid,
          plan: plan || "intro",
          priceId,
          productId: getProductIdForPrice(priceId)
        },
      });
    } catch (modeErr: any) {
      console.warn(`Stripe session creation failed with mode ${defaultMode}, retrying with alternate mode... Error:`, modeErr?.message);
      const altMode = defaultMode === "payment" ? "subscription" : "payment";
      session = await stripe.checkout.sessions.create({
        payment_method_types: ["card"],
        line_items: [
          {
            price: priceId,
            quantity: 1,
          },
        ],
        mode: altMode as any,
        // Lets instructors redeem a promotion code at checkout. Without this
        // Stripe renders no code box at all, so coupons created in the
        // dashboard would silently never apply.
        allow_promotion_codes: true,
        customer_email: email,
        client_reference_id: uid,
        success_url: `${origin}/?payment=success&session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${origin}/?payment=cancel`,
        metadata: {
          uid,
          plan: plan || "intro",
          priceId,
          productId: getProductIdForPrice(priceId)
        },
      });
    }

    res.json({ url: session.url, sessionId: session.id });
  } catch (error: any) {
    console.error("Stripe Checkout Session Error:", error);
    res.status(500).json({
      error: "Failed to create Stripe Checkout session.",
      details: error?.message || String(error)
    });
  }
});

// Verify Checkout Session status after Stripe redirect
app.get("/api/verify-checkout-session", async (req, res) => {
  const sessionId = req.query.session_id as string;
  if (!sessionId) {
    return res.status(400).json({ error: "Missing session_id query parameter." });
  }

  const stripeSecret = process.env.STRIPE_SECRET_KEY;
  if (!stripeSecret) {
    return res.status(400).json({ error: "STRIPE_SECRET_KEY not configured on server." });
  }

  try {
    const Stripe = (await import("stripe")).default;
    const stripe = new Stripe(stripeSecret);

    const session = await stripe.checkout.sessions.retrieve(sessionId);
    const isPaid = session.payment_status === "paid" || session.status === "complete";

    res.json({
      verified: isPaid,
      sessionId: session.id,
      paymentStatus: session.payment_status,
      customerEmail: session.customer_email || session.customer_details?.email,
      uid: session.client_reference_id || session.metadata?.uid,
      plan: session.metadata?.plan || "intro_999",
    });
  } catch (error: any) {
    console.error("Verify Stripe Checkout Session error:", error);
    res.status(500).json({
      error: "Failed to verify Stripe payment session.",
      details: error?.message || String(error)
    });
  }
});

/**
 * Stripe billing portal.
 *
 * Instructors on the recurring tiers need somewhere to update a card, see what
 * they were charged and cancel without emailing anyone. Stripe hosts all of
 * that; this only has to find the customer and hand back a link.
 *
 * Checkout is created with `customer_email`, so the customer is looked up by
 * email rather than requiring a stored customer ID.
 */
app.post("/api/billing-portal", async (req, res) => {
  const { email } = req.body || {};

  if (!email) {
    return res.status(400).json({ error: "An email address is required to open the billing portal." });
  }

  const stripeSecret = process.env.STRIPE_SECRET_KEY;
  if (!stripeSecret) {
    return res.status(400).json({ error: "STRIPE_SECRET_KEY not configured on server." });
  }

  const protocol = req.headers["x-forwarded-proto"] || "https";
  const host = req.headers.host || "localhost:3000";
  const origin = `${protocol}://${host}`;

  try {
    const Stripe = (await import("stripe")).default;
    const stripe = new Stripe(stripeSecret);

    const customers = await stripe.customers.list({ email, limit: 1 });
    const customer = customers.data[0];

    if (!customer) {
      // A one-time Summer Special buyer has no subscription to manage, and
      // saying so is more useful than dropping them into an empty portal.
      return res.status(404).json({
        error: "No billing record found for this account.",
        details: "If you paid the one-time Summer STEM Special there is no subscription to manage — nothing will be charged again.",
      });
    }

    const portal = await stripe.billingPortal.sessions.create({
      customer: customer.id,
      return_url: `${origin}/`,
    });

    res.json({ url: portal.url });
  } catch (error: any) {
    console.error("Stripe billing portal error:", error);
    res.status(500).json({
      error: "Could not open the billing portal.",
      details: error?.message || String(error),
    });
  }
});


// Configure Vite or Static Assets based on environment
async function setupServer() {
  if (process.env.NODE_ENV !== "production") {
    console.log("Starting server in development mode with Vite middleware...");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    console.log("Starting server in production mode...");
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  const server = app.listen(PORT, "0.0.0.0", () => {
    console.log(`Express server is successfully listening on port ${PORT}`);
  });

  // Attach WebSocket Server for Live voice connections
  const wss = new WebSocketServer({ noServer: true });

  wss.on("connection", async (clientWs) => {
    console.log("New client connected to Live Audio WS bridge!");
    if (!ai) {
      clientWs.send(JSON.stringify({ error: "Gemini AI client is not initialized on the server." }));
      clientWs.close();
      return;
    }

    try {
      console.log("Connecting to Gemini Live Session using gemini-3.1-flash-live-preview...");
      const session = await ai.live.connect({
        model: "gemini-3.1-flash-live-preview",
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: { prebuiltVoiceConfig: { voiceName: "Zephyr" } },
          },
          systemInstruction: "You are Lyrah, an enthusiastic, creative, and child-centric AI teaching copilot for STEM/STEAM instructors. Your motto is 'Curriculum is the skeleton; imagination is the body.' Respond directly, conversationally, warmly, and concisely as if you are talking live with an instructor in a classroom. Keep replies engaging and brief (1-2 sentences).",
        },
        callbacks: {
          onmessage: (message: LiveServerMessage) => {
            const audio = message.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data;
            if (audio) {
              clientWs.send(JSON.stringify({ audio }));
            }
            if (message.serverContent?.interrupted) {
              clientWs.send(JSON.stringify({ interrupted: true }));
            }
          },
        },
      });

      clientWs.on("message", (data) => {
        try {
          const parsed = JSON.parse(data.toString());
          if (parsed.audio) {
            session.sendRealtimeInput({
              audio: { data: parsed.audio, mimeType: "audio/pcm;rate=16000" },
            });
          }
        } catch (err) {
          console.error("Error receiving/parsing client audio data:", err);
        }
      });

      clientWs.on("close", () => {
        console.log("Client closed WS connection, cleaning up Gemini Live session.");
        session.close();
      });

    } catch (err: any) {
      console.error("Failed to connect to Gemini Live session:", err);
      clientWs.send(JSON.stringify({ error: "Failed to connect to Gemini Live API.", details: err?.message || String(err) }));
      clientWs.close();
    }
  });

  server.on("upgrade", (request, socket, head) => {
    try {
      const pathname = request.url ? new URL(request.url, `http://${request.headers.host}`).pathname : "";
      if (pathname === "/api/live-ws") {
        wss.handleUpgrade(request, socket, head, (ws) => {
          wss.emit("connection", ws, request);
        });
      } else {
        socket.destroy();
      }
    } catch (err) {
      console.error("WebSocket upgrade upgrade error:", err);
      socket.destroy();
    }
  });
}

setupServer();
