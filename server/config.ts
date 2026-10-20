// Load .env from the project root before anything reads process.env.
// (Node >= 20.12; a missing file is fine — real env vars still apply.)
try {
  process.loadEnvFile();
} catch {
  // no .env file
}

const env = process.env;

export const config = {
  isProd: env.NODE_ENV === "production",
  port: Number(env.PORT) || 5000,
  supabase: {
    url: env.VITE_SUPABASE_URL || env.SUPABASE_URL || "",
    anonKey: env.VITE_SUPABASE_ANON_KEY || env.SUPABASE_ANON_KEY || "",
  },
  gemini: {
    // GOOGLE_GEMINI_API_KEY is accepted for backwards compatibility.
    apiKey: env.GEMINI_API_KEY || env.GOOGLE_GEMINI_API_KEY || "",
    // Flash-Lite answers in seconds; full Flash models can take minutes per itinerary.
    model: env.GEMINI_MODEL || "gemini-3.5-flash-lite",
    // Tried once when the primary model is overloaded or retired.
    fallbackModel: env.GEMINI_FALLBACK_MODEL || "gemini-flash-lite-latest",
  },
};

export const isSupabaseConfigured = Boolean(config.supabase.url && config.supabase.anonKey);
export const isGeminiConfigured = Boolean(config.gemini.apiKey);
