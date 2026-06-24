import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY || "",
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    }
  }
});

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Express configuration
  app.use(express.json());

  // API Route - Health Check
  app.get("/api/health", (req, res) => {
    res.json({ 
      status: "ok", 
      time: new Date().toISOString(),
      geminiConfigured: !!process.env.GEMINI_API_KEY 
    });
  });

  // API Route - Agent Core Sandbox (For parsing commitments)
  app.post("/api/agent/extract", async (req, res) => {
    try {
      const { text } = req.body;
      if (!text) {
        res.status(400).json({ error: "Missing 'text' inside request body" });
        return;
      }

      if (!process.env.GEMINI_API_KEY) {
        // Safe mock fallback for evaluation without API key
        res.json({
          mocked: true,
          title: text.substring(0, 40),
          extractedDeadline: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
          urgency: "medium",
          importance: "high",
          effort: "medium",
          reasoning: "Operating in mock sandbox mode as GEMINI_API_KEY is not configured.",
          plan: [
            { title: "Define scope and key goals", effortEstimateMinutes: 60 },
            { title: "Draft core deliverables", effortEstimateMinutes: 120 },
            { title: "Review and refine final product", effortEstimateMinutes: 45 }
          ]
        });
        return;
      }

      // Query Gemini 3.5 Flash using structured output
      const prompt = `Analyze this commitment description and extract structured meta-data. Draft a multi-step execution plan based on the deadline provided.
      
      Commitment: "${text}"
      Current Time: ${new Date().toISOString()}
      `;

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING, description: "A concise, actionable title for the commitment" },
              extractedDeadline: { type: Type.STRING, description: "ISO 8601 Timestamp of the absolute deadline as implied" },
              urgency: { type: Type.STRING, enum: ["low", "medium", "high"] },
              importance: { type: Type.STRING, enum: ["low", "medium", "high"] },
              effort: { type: Type.STRING, enum: ["low", "medium", "high"] },
              reasoning: { type: Type.STRING, description: "Detailed thought process of why these ratings were given" },
              plan: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    title: { type: Type.STRING, description: "Actionable execution step description" },
                    effortEstimateMinutes: { type: Type.INTEGER, description: "Estimated time in minutes to complete this step" }
                  },
                  required: ["title", "effortEstimateMinutes"]
                }
              }
            },
            required: ["title", "extractedDeadline", "urgency", "importance", "effort", "reasoning", "plan"]
          }
        }
      });

      const resultText = response.text;
      if (!resultText) {
        throw new Error("No response text received from Gemini server");
      }

      res.setHeader("Content-Type", "application/json");
      res.send(resultText);
    } catch (error) {
      console.error("Gemini Extraction Error:", error);
      res.status(500).json({ error: error instanceof Error ? error.message : "Internal server error" });
    }
  });

  // Vite integration
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    // Use vite's connect instance as middleware
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Kairos Full-Stack Dev Server running on port ${PORT}`);
  });
}

startServer();
