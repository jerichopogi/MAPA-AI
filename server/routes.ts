import { Router, type Request, type Response } from "express";
import { ZodError, type ZodType, type ZodTypeDef } from "zod";
import { chatSchema, generateTripSchema, localSecretsQuerySchema, visaQuerySchema } from "@shared/schema";
import { isGeminiConfigured, isSupabaseConfigured } from "./config";
import { requireAuth } from "./middleware/auth";
import * as ai from "./ai";

export const api = Router();

api.get("/health", (_req, res) => {
  res.json({ ok: true, supabase: isSupabaseConfigured, ai: isGeminiConfigured ? "gemini" : "mock" });
});

/** Validate the body with `schema`, run `handler`, and map errors to JSON responses. */
function aiRoute<T>(schema: ZodType<T, ZodTypeDef, unknown>, handler: (input: T) => Promise<unknown>) {
  return async (req: Request, res: Response) => {
    try {
      res.json(await handler(schema.parse(req.body)));
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ message: "Invalid request", errors: error.flatten().fieldErrors });
      }
      console.error(`[ai] ${req.path} failed:`, error);
      res.status(502).json({ message: "The AI service couldn't answer right now. Please try again." });
    }
  };
}

api.post("/ai/generate-trip", requireAuth, aiRoute(generateTripSchema, ai.generateTrip));
api.post("/ai/visa", requireAuth, aiRoute(visaQuerySchema, ai.visaRequirements));
api.post("/ai/local-secrets", requireAuth, aiRoute(localSecretsQuerySchema, ai.localSecrets));
api.post("/ai/chat", requireAuth, aiRoute(chatSchema, ai.chat));

api.use((_req, res) => {
  res.status(404).json({ message: "Not found" });
});
