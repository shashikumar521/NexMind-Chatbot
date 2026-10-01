import { AnalysisResult, EmailMetadata, InputType } from "../types/nlp";
import { analyzeTextLocally, chatLocally } from "./localNlpEngine";

export interface AnalyzePayload {
  text: string;
  inputType?: InputType;
  metadata?: EmailMetadata;
}

// Local mode flag - currently runs 100% locally in browser without external APIs or keys
export const IS_LOCAL_MODE = true;

/**
 * Clean service abstraction:
 * Runs in local offline-demo mode by default with zero external dependencies.
 * Easily swappable to cloud backend endpoints (/api/analyze) when an external AI provider is connected later.
 */
export async function analyzeTextAPI(payload: AnalyzePayload): Promise<AnalysisResult> {
  // Simulate a micro-tick to allow the UI loading pipeline to advance smoothly
  await new Promise((resolve) => setTimeout(resolve, 80));

  try {
    return analyzeTextLocally(payload.text, payload.inputType || "text", payload.metadata);
  } catch (err: any) {
    throw new Error(err.message || "NexMind couldn't complete the analysis. Please check your text.");
  }
}

/**
 * Conversational Chatbot API abstraction:
 * Runs completely in local mode, handling both casual dialogue and text analysis tasks.
 */
export async function sendChatMessageAPI(
  messages: Array<{ role: "user" | "assistant"; content: string }>
): Promise<{ replyText: string; analysis?: AnalysisResult }> {
  await new Promise((resolve) => setTimeout(resolve, 100));

  try {
    return chatLocally(messages);
  } catch (err: any) {
    throw new Error(err.message || "NexMind couldn't complete the response.");
  }
}

export async function checkServerHealth(): Promise<boolean> {
  return true;
}
