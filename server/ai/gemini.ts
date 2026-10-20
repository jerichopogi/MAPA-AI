import { GoogleGenerativeAI } from "@google/generative-ai";
import { config } from "../config";

const SYSTEM_INSTRUCTION =
  "You are MAPA AI, a friendly travel planner for Filipino travelers. " +
  "Use Philippine-passport context for visa questions, quote prices realistically, " +
  "and keep advice practical and current.";

let client: GoogleGenerativeAI | null = null;
function getClient() {
  client ??= new GoogleGenerativeAI(config.gemini.apiKey);
  return client;
}

/** Ask Gemini for a JSON response and parse it. */
export async function generateJson<T>(prompt: string): Promise<T> {
  const model = getClient().getGenerativeModel({
    model: config.gemini.model,
    systemInstruction: SYSTEM_INSTRUCTION,
    generationConfig: { responseMimeType: "application/json", temperature: 0.7 },
  });
  const result = await model.generateContent(prompt);
  return JSON.parse(result.response.text()) as T;
}

/** Multi-turn chat; returns plain text. */
export async function chat(messages: { role: "user" | "assistant"; content: string }[]) {
  const model = getClient().getGenerativeModel({
    model: config.gemini.model,
    systemInstruction: SYSTEM_INSTRUCTION + " Answer concisely in plain text, using short bullet lists when helpful.",
  });
  const result = await model.generateContent({
    contents: messages.map((m) => ({
      role: m.role === "assistant" ? "model" : "user",
      parts: [{ text: m.content }],
    })),
  });
  return result.response.text();
}
