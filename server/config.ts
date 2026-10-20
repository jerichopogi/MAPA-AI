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
    model: env.GEMINI_MODEL || "gemini-2.5-flash",
  },
};

export const isSupabaseConfigured = Boolean(config.supabase.url && config.supabase.anonKey);
export const isGeminiConfigured = Boolean(config.gemini.apiKey);
