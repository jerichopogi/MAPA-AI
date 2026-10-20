import { GoogleGenerativeAI, GoogleGenerativeAIFetchError, type ModelParams } from "@google/generative-ai";
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

/** Overloaded (429/503) or retired (404) model: worth trying the fallback model. */
function isRetryable(error: unknown) {
  return error instanceof GoogleGenerativeAIFetchError && [404, 429, 500, 503].includes(error.status ?? 0);
}

/** Run `call` on the primary model, then once on the fallback model if Gemini is busy or the model is gone. */
async function withFallback<T>(params: Omit<ModelParams, "model">, call: (model: ReturnType<GoogleGenerativeAI["getGenerativeModel"]>) => Promise<T>) {
  const models = [...new Set([config.gemini.model, config.gemini.fallbackModel].filter(Boolean))];
  for (let i = 0; ; i++) {
    try {
      return await call(getClient().getGenerativeModel({ ...params, model: models[i] }));
    } catch (error) {
      if (i + 1 >= models.length || !isRetryable(error)) throw error;
      console.warn(`[ai] ${models[i]} unavailable (${(error as GoogleGenerativeAIFetchError).status}); retrying with ${models[i + 1]}`);
    }
  }
}

/** Ask Gemini for a JSON response and parse it. */
export async function generateJson<T>(prompt: string): Promise<T> {
  return withFallback(
    { systemInstruction: SYSTEM_INSTRUCTION, generationConfig: { responseMimeType: "application/json", temperature: 0.7 } },
    async (model) => JSON.parse((await model.generateContent(prompt)).response.text()) as T,
  );
}

/** Multi-turn chat; returns plain text. */
export async function chat(messages: { role: "user" | "assistant"; content: string }[]) {
  return withFallback(
    { systemInstruction: SYSTEM_INSTRUCTION + " Answer concisely in plain text, using short bullet lists when helpful." },
    async (model) => {
      const result = await model.generateContent({
        contents: messages.map((m) => ({
          role: m.role === "assistant" ? "model" : "user",
          parts: [{ text: m.content }],
        })),
      });
      return result.response.text();
    },
  );
}
