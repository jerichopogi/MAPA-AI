import { Router, type Request, type Response } from "express";
import { ZodError, type ZodType, type ZodTypeDef } from "zod";
import { chatSchema, destinationIdeasSchema, generateTripSchema, localSecretsQuerySchema, visaQuerySchema, type Lang } from "@shared/schema";
import { isGeminiConfigured, isSupabaseConfigured, paymentProvider } from "./config";
import { requireAuth } from "./middleware/auth";
import { aiRateLimit } from "./middleware/rate-limit";
import * as ai from "./ai";
import { billing } from "./billing/routes";
import { quota } from "./billing/usage";

export const api = Router();

api.get("/health", (_req, res) => {
  res.json({ ok: true, supabase: isSupabaseConfigured, ai: isGeminiConfigured ? "gemini" : "mock", payments: paymentProvider ?? "off" });
});

/** The client sends its interface language; AI answers follow it. */
const langOf = (req: Request): Lang => (req.get("X-Lang") === "tl" ? "tl" : "en");

/** Validate the body with `schema`, run `handler`, and map errors to JSON responses. */
function aiRoute<T>(schema: ZodType<T, ZodTypeDef, unknown>, handler: (input: T, lang: Lang) => Promise<unknown>) {
  return async (req: Request, res: Response) => {
    try {
      res.json(await handler(schema.parse(req.body), langOf(req)));
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ message: "Invalid request", errors: error.flatten().fieldErrors });
      }
      console.error(`[ai] ${req.path} failed:`, error);
      res.status(502).json({ message: "The AI service couldn't answer right now. Please try again." });
    }
  };
}

api.post("/ai/generate-trip", requireAuth, aiRateLimit, quota("trip"), aiRoute(generateTripSchema, ai.generateTrip));
api.post("/ai/visa", requireAuth, aiRateLimit, quota("visa"), aiRoute(visaQuerySchema, ai.visaRequirements));
api.post("/ai/local-secrets", requireAuth, aiRateLimit, quota("local"), aiRoute(localSecretsQuerySchema, ai.localSecrets));
api.post("/ai/chat", requireAuth, aiRateLimit, quota("chat"), aiRoute(chatSchema, ai.chat));
api.post("/ai/destination-ideas", requireAuth, aiRateLimit, quota("ideas"), aiRoute(destinationIdeasSchema, ai.destinationIdeas));

api.use("/billing", billing);

api.use((_req, res) => {
  res.status(404).json({ message: "Not found" });
});
