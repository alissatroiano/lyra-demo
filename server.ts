import express from "express";
import path from "path";
import dotenv from "dotenv";
import { GoogleGenAI, Type } from "@google/genai";
import { createServer as createViteServer } from "vite";
// @ts-ignore
import pdfParse from "pdf-parse";
// @ts-ignore
import mammoth from "mammoth";

dotenv.config();

const app = express();
const PORT = 3000;

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

// API endpoint to extract text from pdf or docx files
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
      const data = await pdfParse(buffer);
      extractedText = data.text || "";
    } else if (extension === "docx") {
      const result = await mammoth.extractRawText({ buffer });
      extractedText = result.value || "";
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
    const systemInstruction = `You are an expert STEM Curriculum Developer and Instructional Designer. 
Your job is to take raw, verbose, long, or wordy lesson plans (or simple descriptions of topics) and transform them into an IMMERSIVE, highly interactive, and visually engaging educational lesson experience for Afterschool STEM Instructors and children (ages 6-14).

Core requirements for your response:
1. CONDENSE: Turn walls of text into clean, high-impact key takeaways.
2. ENGAGE: Design an elegant slide deck outline where each slide has a clear visual concept, bulleted core insights, and teacher tips (notes on how to explain it).
3. DEMONSTRATE: Create a exciting, safe, and highly visual hands-on scientific demonstration or experiment that instructors can easily run with common materials.
4. ASSESS: Generate an interactive, child-friendly worksheet and a multi-question quiz.
5. RESOLVE: Provide suggestions to resolve potentially broken links in the original document by suggesting precise YouTube/Google search queries and explaining why they are suitable.

You must output a highly structured JSON object matching the defined responseSchema strictly. Do not deviate.`;

    const userPrompt = `Here is the raw lesson plan or topic to transform:
----------------------------------
${lessonContent}
----------------------------------

${customPreferences ? `Teacher's Custom Request: ${customPreferences}` : ""}

Please convert this into a comprehensive, highly interactive lesson plan with slides, worksheets, quizzes, a hands-on activity, and media backup queries.`;

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
          ],
          properties: {
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

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Express server is successfully listening on port ${PORT}`);
  });
}

setupServer();
