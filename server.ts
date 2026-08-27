import express from "express";
import path from "path";
import dotenv from "dotenv";
import { GoogleGenAI, Type } from "@google/genai";
import { createServer as createViteServer } from "vite";

dotenv.config();

// Lazy / Safe initialization of Gemini Client
function getGeminiClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return null;
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build",
      },
    },
  });
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: "30mb" }));
  app.use(express.urlencoded({ extended: true, limit: "30mb" }));

  // API Health Endpoint
  app.get("/api/health", (_req, res) => {
    res.json({
      status: "ok",
      hasGeminiKey: !!process.env.GEMINI_API_KEY,
      timestamp: new Date().toISOString(),
    });
  });

  // 1. Process Study Material (Smart Notes, Flashcards, Quiz, Terms)
  app.post("/api/ai/process-material", async (req, res) => {
    try {
      const { subject, topic, notesText, imageBase64, mimeType } = req.body;

      if (!subject || !topic) {
        return res.status(400).json({ error: "Subject and topic are required." });
      }

      if (!notesText && !imageBase64) {
        return res.status(400).json({ error: "Please provide either notes text or an uploaded image." });
      }

      const ai = getGeminiClient();
      if (!ai) {
        return res.status(503).json({
          error: "GEMINI_API_KEY is not configured on the server. Please add GEMINI_API_KEY in the Secrets settings.",
        });
      }

      const promptText = `You are an expert Grade 12 educational tutor aligned with high school matric curricula (CAPS/IEB).
Analyze the learner's uploaded study material for Subject: "${subject}", Topic: "${topic}".

Uploaded Material Notes/Content:
${notesText || "See attached image of notes/textbook/handwritten material."}

Generate comprehensive, clear, high-yield study material strictly based on the content provided (do NOT hallucinate unrelated facts).
Return ONLY a valid JSON object matching this schema:
{
  "summary": "Clear, engaging Grade 12 level topic summary explaining the core intuition and exam significance",
  "keyConcepts": [
    {
      "title": "Concept Name",
      "explanation": "Clear explanation of how it works with bullet points or step-by-step logic",
      "tag": "Core" | "Formula" | "Process" | "Theory"
    }
  ],
  "definitions": [
    {
      "term": "Key Term",
      "definition": "Precise, exam-standard definition"
    }
  ],
  "keyFacts": [
    "Crucial fact or exam rule 1",
    "Crucial fact or exam rule 2"
  ],
  "rememberThis": [
    "Mnemonic or memory trick or common student pitfall to avoid"
  ],
  "importantExamples": [
    {
      "title": "Typical Exam Question/Problem",
      "problem": "Question scenario or calculation",
      "solution": "Step-by-step worked solution",
      "examTip": "Examiner's tip for scoring full marks"
    }
  ],
  "flashcards": [
    {
      "front": "Question or term on front of card",
      "back": "Answer, definition, or explanation on back of card",
      "difficulty": "easy" | "medium" | "hard",
      "topic": "${topic}"
    }
  ],
  "quizQuestions": [
    {
      "question": "Question text",
      "type": "multiple_choice" | "true_false" | "fill_blank",
      "options": ["Option A", "Option B", "Option C", "Option D"], // Provide 4 options for multiple_choice, 2 for true_false (["True", "False"]), or 3-4 plausible choices for fill_blank
      "correctAnswer": "Exact string of correct option",
      "explanation": "Why this answer is correct and why other options are wrong",
      "difficulty": "easy" | "medium" | "hard"
    }
  ],
  "keyTerms": [
    {
      "word": "SINGLE_WORD_OR_SHORT_TERM",
      "clue": "Short clue for crossword or word search game"
    }
  ]
}
Provide at least 8-12 high-quality flashcards, 6-8 quiz questions, and 8-12 key terms for games.`;

      let contentsPayload: any;
      if (imageBase64) {
        contentsPayload = {
          parts: [
            {
              inlineData: {
                data: imageBase64.replace(/^data:[^;]+;base64,/, ""),
                mimeType: mimeType || "image/jpeg",
              },
            },
            {
              text: promptText,
            },
          ],
        };
      } else {
        contentsPayload = promptText;
      }

      const response = await ai.models.generateContent({
        model: "gemini-3.7-flash",
        contents: contentsPayload,
        config: {
          responseMimeType: "application/json",
          temperature: 0.3,
        },
      });

      const responseText = response.text || "{}";
      const parsedData = JSON.parse(responseText);

      return res.json({
        success: true,
        data: parsedData,
      });
    } catch (err: any) {
      console.error("Error processing study material with Gemini:", err);
      const isQuotaError = err?.status === 429 || err?.message?.includes("quota") || err?.message?.includes("RESOURCE_EXHAUSTED");
      return res.status(isQuotaError ? 429 : 500).json({
        error: isQuotaError
          ? "AI processing is currently experiencing high demand. Please try again in a moment."
          : "Could not process study material right now. " + (err?.message || ""),
      });
    }
  });

  // 2. AI Study Coach Chat
  app.post("/api/ai/coach", async (req, res) => {
    try {
      const { message, history, context } = req.body;

      if (!message) {
        return res.status(400).json({ error: "Message is required." });
      }

      const ai = getGeminiClient();
      if (!ai) {
        return res.status(503).json({
          error: "GEMINI_API_KEY is not configured.",
        });
      }

      const systemInstruction = `You are MatricAce AI Study Coach, an encouraging, sharp, and patient Grade 12 tutor who specializes in helping high school students understand complex concepts, memorize key definitions, master exam techniques, and prepare for matric exams.
Always format your answers with clean markdown (bullet points, bold key terms, short readable sections).
Current learner context:
- Current Subject: ${context?.subject || "General Grade 12"}
- Current Topic: ${context?.topic || "General"}
- Current Notes Snippet: ${context?.notesSnippet ? context.notesSnippet.slice(0, 1500) : "None provided"}
${context?.weakTopics?.length ? `- Weak Topics needing practice: ${context.weakTopics.join(", ")}` : ""}

Be encouraging, concise, direct, and pedagogically sound. If the student asks for a quiz or practice question, give them one at a time and ask them to answer.`;

      const contents: any[] = [];
      if (Array.isArray(history) && history.length > 0) {
        for (const msg of history.slice(-8)) {
          contents.push({
            role: msg.role === "user" ? "user" : "model",
            parts: [{ text: msg.content || msg.text || "" }],
          });
        }
      }
      contents.push({
        role: "user",
        parts: [{ text: message }],
      });

      const response = await ai.models.generateContent({
        model: "gemini-3.7-flash",
        contents,
        config: {
          systemInstruction,
          temperature: 0.7,
        },
      });

      return res.json({
        reply: response.text || "I am here to help you study! What would you like to review?",
      });
    } catch (err: any) {
      console.error("AI Coach Error:", err);
      return res.status(500).json({
        error: "Study Coach is momentarily unavailable. Please try again.",
      });
    }
  });

  // 3. School Timetable Parser (OCR / Image / Text extraction)
  app.post("/api/ai/parse-timetable", async (req, res) => {
    try {
      const { imageBase64, mimeType, rawText } = req.body;

      const ai = getGeminiClient();
      if (!ai) {
        return res.status(503).json({ error: "GEMINI_API_KEY is missing." });
      }

      const prompt = `You are a school schedule extractor. Analyze this school timetable image or text and extract the weekly schedule for Monday to Friday.
Extract each period with startTime (e.g. "08:00"), endTime (e.g. "08:50"), subject (e.g. "Mathematics", "Physical Sciences", "Life Sciences", "English", "Break", "Life Orientation"), and optional room/teacher.
Return ONLY valid JSON matching this schema:
{
  "schoolName": "Optional detected school name or Grade 12 Timetable",
  "days": {
    "Monday": [
      { "period": 1, "time": "08:00 - 08:50", "subject": "Mathematics", "room": "Room 12" }
    ],
    "Tuesday": [],
    "Wednesday": [],
    "Thursday": [],
    "Friday": []
  }
}`;

      let contents: any;
      if (imageBase64) {
        contents = {
          parts: [
            {
              inlineData: {
                data: imageBase64.replace(/^data:[^;]+;base64,/, ""),
                mimeType: mimeType || "image/jpeg",
              },
            },
            { text: prompt },
          ],
        };
      } else {
        contents = `${prompt}\n\nRaw Timetable text:\n${rawText || ""}`;
      }

      const response = await ai.models.generateContent({
        model: "gemini-3.7-flash",
        contents,
        config: {
          responseMimeType: "application/json",
        },
      });

      const parsed = JSON.parse(response.text || "{}");
      return res.json({ success: true, data: parsed });
    } catch (err: any) {
      console.error("Timetable parse error:", err);
      return res.status(500).json({
        error: "Failed to parse timetable. " + (err?.message || ""),
      });
    }
  });

  // 4. AI Study Schedule & Plan Generator
  app.post("/api/ai/generate-study-plan", async (req, res) => {
    try {
      const { enrolledSubjects, weakTopics, upcomingTests, dailyTargetMinutes } = req.body;

      const ai = getGeminiClient();
      if (!ai) {
        return res.status(503).json({ error: "GEMINI_API_KEY is missing." });
      }

      const prompt = `Create an intelligent, realistic, balanced weekly study schedule (Monday to Sunday) for a Grade 12 learner.
Enrolled Subjects: ${JSON.stringify(enrolledSubjects || ["Mathematics", "Physical Sciences", "Life Sciences", "English"])}
Identified Weak Topics needing prioritized practice: ${JSON.stringify(weakTopics || [])}
Upcoming Tests & Exams: ${JSON.stringify(upcomingTests || [])}
Daily Study Target: ${dailyTargetMinutes || 60} minutes per day.

Rules:
1. Allocate more time to weak topics and subjects with tests approaching in the next 7-14 days.
2. Break study time into 25-45 minute focused sessions with 5-10 min breaks.
3. Vary subjects throughout the week to prevent fatigue.
4. Include active recall techniques (e.g. Flashcards, Quiz, Problem Solving, Smart Notes review).

Return ONLY valid JSON matching:
{
  "recommendationSummary": "Brief motivating 2-sentence rationale for this week's study focus",
  "weeklyPlan": [
    {
      "day": "Monday",
      "sessions": [
        {
          "id": "session-1",
          "subject": "Mathematics",
          "topic": "Functions & Inverses",
          "durationMinutes": 30,
          "activity": "Solve 5 past paper function questions & review Smart Notes",
          "completed": false,
          "scheduledTime": "16:30 - 17:00"
        }
      ]
    },
    ... (for Tuesday, Wednesday, Thursday, Friday, Saturday, Sunday)
  ]
}`;

      const response = await ai.models.generateContent({
        model: "gemini-3.7-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
        },
      });

      const parsed = JSON.parse(response.text || "{}");
      return res.json({ success: true, data: parsed });
    } catch (err: any) {
      console.error("Plan generator error:", err);
      return res.status(500).json({ error: "Failed to generate study plan." });
    }
  });

  // Vite middleware setup
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`MatricAce Server running on port ${PORT}`);
  });
}

startServer();
