import express from "express";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import { analyzeTextWithNexMind, chatWithNexMind } from "./server/nlpEngine.ts";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const isProduction = process.env.NODE_ENV === "production";
const PORT = Number(process.env.PORT) || 3000;

async function startServer() {
  const app = express();
  app.use(express.json({ limit: "10mb" }));

  // API Health Check
  app.get("/api/health", (_req, res) => {
    res.json({
      status: "online",
      version: "2.4.0",
      engine: "NexMind Deep Neural Synthesizer",
      model: "Transformer-NLP-v2.4e + Gemini 3.8 Flash",
      timestamp: new Date().toISOString(),
    });
  });

  // NLP Analysis Endpoint
  app.post("/api/analyze", async (req, res) => {
    try {
      const { text, inputType = "text", metadata } = req.body;
      if (!text || typeof text !== "string" || !text.trim()) {
        res.status(400).json({ error: "Please enter some text for NexMind to analyze." });
        return;
      }
      if (text.length > 30000) {
        res.status(400).json({ error: "Your text is too long. Please shorten it and try again." });
        return;
      }

      const result = await analyzeTextWithNexMind(text, inputType, metadata);
      res.json(result);
    } catch (err: any) {
      console.error("Error in /api/analyze:", err);
      res.status(500).json({
        error: err.message || "NexMind couldn't complete the analysis. Please try again.",
      });
    }
  });

  // Chat Endpoint
  app.post("/api/chat", async (req, res) => {
    try {
      const { messages } = req.body;
      if (!Array.isArray(messages) || messages.length === 0) {
        res.status(400).json({ error: "Messages array is required." });
        return;
      }

      const response = await chatWithNexMind(messages);
      res.json(response);
    } catch (err: any) {
      console.error("Error in /api/chat:", err);
      res.status(500).json({
        error: err.message || "NexMind couldn't complete the response. Please try again.",
      });
    }
  });

  // Client Frontend Routing
  if (!isProduction) {
    const vite = await import("vite");
    const viteDevServer = await vite.createServer({
      server: {
        middlewareMode: true,
      },
      appType: "spa",
    });
    app.use(viteDevServer.middlewares);
  } else {
    const distPath = path.resolve(__dirname, "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`NexMind Neural Server running at http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error("Failed to start NexMind server:", err);
  process.exit(1);
});
