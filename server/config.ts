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
    // Server-only. Needed to activate plans and record AI usage.
    serviceRoleKey: env.SUPABASE_SERVICE_ROLE_KEY || "",
  },
  paymongo: {
    secretKey: env.PAYMONGO_SECRET_KEY || "",
    webhookSecret: env.PAYMONGO_WEBHOOK_SECRET || "",
    methods: (env.PAYMONGO_METHODS || "gcash,paymaya,card").split(",").map((m) => m.trim()).filter(Boolean),
  },
  /** Public URL of the app, used for payment redirect links. */
  appUrl: env.APP_URL || "",
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
export const isBillingConfigured = isSupabaseConfigured && Boolean(config.supabase.serviceRoleKey);

/** Real PayMongo when a key is set; otherwise a local test checkout, but never in production. */
export const paymentProvider: "paymongo" | "mock" | null = !isBillingConfigured
  ? null
  : config.paymongo.secretKey
    ? "paymongo"
    : config.isProd
      ? null
      : "mock";
