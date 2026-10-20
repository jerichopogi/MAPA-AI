// AI service: one entry point per feature. Uses Gemini when GEMINI_API_KEY is
// set and falls back to realistic mock data otherwise.
import type {
  AiResult,
  ChatInput,
  GenerateTripInput,
  GeneratedTrip,
  LocalPlace,
  LocalSecretsQueryInput,
  VisaQueryInput,
  VisaRequirement,
} from "@shared/schema";
import { isGeminiConfigured } from "../config";
import * as gemini from "./gemini";
import * as mock from "./mock";
import { localSecretsPrompt, tripPrompt, visaPrompt } from "./prompts";

async function run<T>(live: () => Promise<T>, fallback: () => T): Promise<AiResult<T>> {
  if (!isGeminiConfigured) {
    // Small delay so loading states are visible in demos.
    await new Promise((r) => setTimeout(r, 600));
    return { source: "mock", data: fallback() };
  }
  return { source: "gemini", data: await live() };
}

export const generateTrip = (input: GenerateTripInput) =>
  run<GeneratedTrip>(() => gemini.generateJson(tripPrompt(input)), () => mock.mockTrip(input));

export const visaRequirements = (input: VisaQueryInput) =>
  run<VisaRequirement>(() => gemini.generateJson(visaPrompt(input)), () => mock.mockVisa(input));

export const localSecrets = (input: LocalSecretsQueryInput) =>
  run<LocalPlace[]>(
    async () => (await gemini.generateJson<{ places: LocalPlace[] }>(localSecretsPrompt(input))).places,
    () => mock.mockLocalSecrets(input),
  );

export const chat = (input: ChatInput) =>
  run<string>(
    () => gemini.chat(input.messages),
    () => mock.mockChat(input.messages[input.messages.length - 1].content),
  );
