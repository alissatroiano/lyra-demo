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
// Cloud Run injects PORT and expects the container to listen on it; 3000 is the
// local default.
const PORT = Number(process.env.PORT) || 3000;

// Stripe Webhook Endpoint (requires raw body before express.json parsing)
app.post("/api/webhook/stripe", express.raw({ type: "application/json" }), async (req, res) => {
  const sig = req.headers["stripe-signature"];
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || process.env.STRIPE_WEBHOOK_SIGNING_SECRET;
  const stripeSecret = process.env.STRIPE_SECRET_KEY;

  if (!stripeSecret) {
    console.warn("Stripe webhook received, but STRIPE_SECRET_KEY is missing.");
    return res.status(200).json({ received: true, status: "stripe_not_configured" });
  }

  // Fail closed: an unverifiable webhook is an untrusted webhook. Without this,
  // anyone who can reach the endpoint can forge Stripe events.
  if (!webhookSecret) {
    console.error("Stripe webhook rejected: STRIPE_WEBHOOK_SECRET is not configured.");
    return res.status(500).send("Webhook secret not configured.");
  }

  if (!sig) {
    console.error("Stripe webhook rejected: missing stripe-signature header.");
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
    } else if (["txt", "md", "csv", "rtf", "json", "doc"].includes(extension)) {
      extractedText = buffer.toString("utf-8");
    } else {
      return res.status(400).json({ error: `Unsupported file extension: .${extension}` });
    }

    res.json({ text: extractedText });
  } catch (error: any) {
    console.error("Error extracting document text:", error);
    res.status(500).json({
      error: "Failed to extract text from document.",
      details: error?.message || String(error),
    });
  }
});

// API endpoint to process lesson plan using Gemini
app.post("/api/process-lesson", async (req, res) => {
  if (!ai) {
    return res.status(500).json({
      error: "Gemini API client is not initialized. Please ensure GEMINI_API_KEY is configured in your secrets.",
    });
  }

  const { lessonContent, customPreferences } = req.body;

  if (!lessonContent || typeof lessonContent !== "string") {
    return res.status(400).json({ error: "lessonContent string is required" });
  }

  try {
    const systemInstruction = `You are Lyrah, an enthusiastic, creative, and highly organized AI teaching copilot for STEM/STEAM instructors.
Your mission is to help instructors transform standard, text-heavy, or dry lesson plans into immersive, gamified learning adventures for children (ages 5-14). You specialize in hands-on engineering challenges and block-based coding environments (Scratch, ScratchJr, EduBlocks, Code.org, Thunkable, Minecraft Education). You help instructors manage multi-session pacing and streamline heavy documentation into digestible, visually engaging student experiences.

PROFILE & TONE:
- Tone & Style: Energetic, encouraging, imaginative, and highly collaborative. Speak like a seasoned, innovative educator who believes learning should feel like play.
- Core Philosophy: "Curriculum is the skeleton; imagination is the body." Never sacrifice academic rigor, but insist it be delivered through active, high-engagement narratives.
- Key Traits: Resourceful, child-centric, adaptive, structured, and proactive.

CORE INSTRUCTIONS & TASKS:
1. CONDENSE & MANAGE PACING: Turn walls of text into clean, high-impact key takeaways. Track heavy documentation and streamline deferred bloat/vocabulary for multi-session pacing.
2. GAMIFICATION TRANSLATION: Convert traditional engineering and coding objectives into quests, mysteries, or challenges (e.g., framing a catapult build as a "castle siege defense" or a Scratch script as "programming a robot's escape route").
3. BLOCK-BASED CODE ARCHITECT: Deconstruct programming logic into developmentally appropriate Scratch, ScratchJr, EduBlocks, Thunkable, Code.org, or Minecraft Education workflows. Translate instructions into exact text representations of blocks (e.g., \`[When Green Flag Clicked] -> [Repeat 10] -> [Move 10 Steps]\`).
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
- Minecraft Education: 3D voxel sandbox with MakeCode Code Builder (Blocks or JavaScript), classroom tools (chalkboards, cameras, NPCs), agent loops, and redstone. Supports spatial geometry, 3D manipulation, computational thinking, and neurodiversity/inclusivity.
- NEVER CONFUSE SCRATCH AND MINECRAFT EDUCATION:
  * If the lesson mentions Scratch, sprites, costumes, backdrops, green flag, or ScratchJr, produce a Scratch / ScratchJr lesson plan. DO NOT mention or substitute Minecraft!
  * If the lesson mentions Minecraft, blocks, agent, redstone, Steve, or Minecraft Education, produce a Minecraft Education lesson plan.
- CHECK GOAL COMPATIBILITY: Verify whether goals work natively with identified software limits (e.g., ScratchJr lacks variables, so adapt score goals to page triggers or upgrade to Scratch 3.0; 2D frame animation in 3D Minecraft requires agent loops or NPC dialogue).
- CIRCUITRY / HARDWARE: If the lesson involves Circuitry, Electronics, or Hardware (DC Motors, LEDs, Copper Tape, Breadboards, Alligator Clips, Micro:bit), specify exact components, polarity, and circuit configuration.

REAL-WORLD FEASIBILITY AUDIT & ALTERNATIVES:
- Evaluate whether the setup will work in a live classroom. In 'feasibilityAudit', explicitly state 'identifiedSoftwarePlatform' and 'softwareGoalCompatibility', evaluate potential failure points, and provide grounded 'recommendedAlternatives' and troubleshooting tips.

You must output a highly structured JSON object matching the defined responseSchema strictly. Do not deviate.`;

    const userPrompt = `Here is the raw lesson plan or topic to transform:
----------------------------------
${lessonContent}
----------------------------------

${customPreferences ? `Teacher's Custom Request & Available Supplies/Tools: ${customPreferences}` : ""}

Please convert this into a comprehensive, highly interactive lesson plan with slides, worksheets, quizzes, a hands-on activity, media backup queries, and a technical feasibility audit with realistic alternatives.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: userPrompt,
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
              description: "A series of 4-6 slide definitions for a presentation.",
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
                  description: "If this lesson involves coding or software, specify the exact software (e.g. 'Scratch JR', 'Scratch 3.0', 'Minecraft Education', 'EduBlocks', 'Thunkable', 'Code.org', 'Python', 'Micro:bit').",
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
                  description: "Primary identified software platform, e.g. 'Scratch 3.0', 'Scratch JR', 'Minecraft Education', 'Roblox Studio', 'EduBlocks', 'Thunkable', 'Code.org', 'Python', 'Micro:bit'.",
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

    const processedData = JSON.parse(text.trim());
    res.json(processedData);
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
Your mission is to help STEM and STEAM instructors transform standard, text-heavy, or dry lesson plans into immersive, gamified learning adventures for children (ages 5-14). You specialize in hands-on engineering challenges and block-based coding environments (Scratch, ScratchJr, EduBlocks, Code.org, Thunkable, Minecraft Education). You help instructors manage multi-session pacing and streamline heavy documentation into digestible, visually engaging student experiences.

PROFILE & TONE:
- Tone & Style: Energetic, encouraging, imaginative, and highly collaborative. Speak like a seasoned, innovative educator who believes learning should feel like play.
- Core Philosophy: "Curriculum is the skeleton; imagination is the body." Never sacrifice academic rigor, but insist it be delivered through active, high-engagement narratives.
- Key Traits: Resourceful, child-centric, adaptive, structured, and proactive.

CORE TASKS & CAPABILITIES:
1. Maintain Multi-Session Memory & Pacing: Actively track what has been taught and what "bloat" vocabulary or material was deferred for each instructor across semesters/camps.
2. Apply Gamification Translation: Convert traditional engineering and coding objectives into quests, mysteries, or challenges (e.g., catapult -> castle siege defense, Scratch script -> robot's escape route).
3. Act as a Block-Based Code Architect: Deconstruct complex programming logic into Scratch, ScratchJr, EduBlocks, Thunkable, Code.org, or Minecraft Education workflows. Translate instructions into exact text representations of blocks: \`[When Green Flag Clicked] -> [Repeat 10] -> [Move 10 Steps]\`.
4. Design Platform-Specific Gamification: Create fun metaphors for coding block categories (e.g., ScratchJr "Triggering Blocks" as "magic start buttons" or Scratch "Variables" as "backpacks that hold secrets").
5. Create Visual Step-by-Step Layouts: Transform dry, text-heavy technical building or coding instructions into child-friendly visual layouts, text-based block stacks, or storyboard prompts.
6. Audit Links & Resources: Proactively scan lesson plans to identify broken, outdated, or missing video/slide deck links, and suggest high-quality relevant web replacements.
7. Optimize for Active Learning: Suggest hands-on experiments, role-play scenarios, or collaborative team challenges to replace passive listening.
8. Provide Differentiated Adaptation: Offer quick modifications to scale complexity up or down based on student age, platform familiarity, or skill level.

SOFTWARE PLATFORM KNOWLEDGE:
- Scratch / Scratch Blocks: 2D sprites, costumes, backdrops, green flag events, broadcast messages, clones, variables.
- ScratchJr (ages 5-7): Horizontal block grammar (Triggering: Green Flag, Tap, Bump, Message; Motion: Move Right/Left/Up/Down, Turn, Hop, Go Home; Looks: Say, Grow, Shrink, Reset Size, Hide, Show; Sound: Pop, Record; Control: Wait, Stop, Set Speed, Repeat; End: End, Repeat Forever, Go to Page).
- EduBlocks (Anaconda): Drag-and-drop block coding for Python and HTML.
- Minecraft Education: 3D voxel sandbox with MakeCode Code Builder (Blocks or JavaScript), classroom tools (chalkboards, cameras, NPCs), agent loops, redstone, spatial geometry, and neurodiversity benefits.`;

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
  const { uid, email, plan } = req.body;

  if (!uid || !email) {
    return res.status(400).json({ error: "User UID and Email are required for payment." });
  }

  const stripeSecret = process.env.STRIPE_SECRET_KEY;
  if (!stripeSecret) {
    return res.status(400).json({ error: "Stripe is not configured on the server. Missing STRIPE_SECRET_KEY." });
  }

  // Prices are resolved server-side from the plan. Never from the request body:
  // a client-supplied priceId lets anyone check out against a price of their
  // choosing. An env override only wins if it actually looks like a price id —
  // STRIPE_PROD_KEY_1 has been set to a prod_... product id before, and
  // line_items[].price rejects those, so a bad value falls back rather than
  // breaking live checkout.
  const priceOverride = (envValue: string | undefined, fallback: string) => {
    if (envValue && envValue.startsWith("price_")) return envValue;
    if (envValue) {
      console.warn(`Ignoring non-price id "${envValue}" (expected price_...); using configured default.`);
    }
    return fallback;
  };

  const PLAN_PRICES: Record<string, string> = {
    // Educator Pro — $9.99
    intro: priceOverride(process.env.STRIPE_PROD_KEY_1, "price_1U2OwBKExpIuZ5d5bmfH68py"),
    // Camp Director Pro — $49.99
    director: priceOverride(process.env.STRIPE_PROD_KEY_2, "price_1U2YXSKExpIuZ5d54aTeLf1u"),
    // Summer Special — temporary offer
    summer: priceOverride(process.env.STRIPE_PRICE_SUMMER, "price_1U2YXoKExpIuZ5d51zCqxK1f"),
  };

  const PRODUCT_IDS: Record<string, string> = {
    intro: "prod_V2TrpJIKS5bF5O",
    director: "prod_V2dpawIOFYkack",
    summer: "prod_V2dpA5jan6W2L7",
  };

  const planKey =
    plan === "summer" || plan === "summer_1299" || plan === "summer_special"
      ? "summer"
      : plan === "yearly" || plan === "annual" || plan === "director"
      ? "director"
      : "intro";

  const priceId = PLAN_PRICES[planKey];

  const protocol = req.headers["x-forwarded-proto"] || "https";
  const host = req.headers.host || "localhost:3000";
  const origin = `${protocol}://${host}`;

  try {
    const Stripe = (await import("stripe")).default;
    const stripe = new Stripe(stripeSecret);

    console.log(`Creating Stripe Checkout Session for ${email} (${uid}) using priceId: ${priceId}`);

    // Instructor retention incentive. Stripe owns the discount itself so the
    // offer can change mid-school-year without a redeploy:
    //   - STRIPE_COUPON_ID set  -> that coupon is applied automatically
    //   - otherwise             -> the promo code field is shown at checkout
    // The two are mutually exclusive in the Checkout API; sending both is an error.
    const autoCoupon = process.env.STRIPE_COUPON_ID;
    const discountOptions = autoCoupon
      ? { discounts: [{ coupon: autoCoupon }] }
      : { allow_promotion_codes: true };

    // Ask Stripe what kind of price this is rather than guessing from the plan
    // name. A price with `recurring` set must use subscription mode; a one-time
    // price must use payment mode, and sending the wrong one is an API error.
    // This replaces the old retry-with-the-other-mode fallback, which fired on
    // any failure (including a bad price id) and reported whichever error came
    // second.
    const price = await stripe.prices.retrieve(priceId);
    const mode = price.recurring ? "subscription" : "payment";

    const session = await stripe.checkout.sessions.create({
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode,
      customer_email: email,
      client_reference_id: uid,
      success_url: `${origin}/?payment=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/?payment=cancel`,
      metadata: {
        uid,
        plan: plan || "intro",
        priceId,
        productId: PRODUCT_IDS[planKey],
        coupon: autoCoupon || "promo_code_field",
      },
      ...discountOptions,
    });

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

// Removed: POST /api/subscribe
//
// The former "direct subscription fallback" was unsafe on two counts and was
// never called by the client (SubscriptionModal uses /api/create-checkout-session):
//
//   1. It accepted raw cardNumber/expDate/cvc in the request body. Card data must
//      never touch this server — that pulls the whole app into PCI-DSS SAQ-D
//      scope. Stripe Checkout keeps the PAN on Stripe's side, which is the point.
//   2. It returned { success: true, isSubscribed: true } unconditionally — even
//      when the Stripe call threw, and even with no STRIPE_SECRET_KEY set. It
//      created a Customer but never charged anything, so any POST with a uid and
//      email granted Pro for free.
//
// Use /api/create-checkout-session instead.

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
