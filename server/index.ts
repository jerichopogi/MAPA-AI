import { config, isGeminiConfigured, isSupabaseConfigured, paymentProvider } from "./config";
import { createServer } from "http";
import { app } from "./app";
import { serveStatic } from "./static";
import { startReminderScheduler } from "./reminders";
import { log } from "./log";

const server = createServer(app);

if (config.isProd) {
  serveStatic(app);
} else {
  const { setupVite } = await import("./vite");
  await setupVite(app, server);
}

server.listen(config.port, () => {
  log(`MAPA AI running at http://localhost:${config.port}`);
  if (!isSupabaseConfigured) log("Supabase not configured — sign-in is disabled. See README.md.", "setup");
  log(isGeminiConfigured ? "AI: Gemini" : "AI: mock data (set GEMINI_API_KEY for live answers)", "setup");
  log(
    paymentProvider === "paypal"
      ? `Payments: PayPal (${config.paypal.env} mode)`
      : paymentProvider === "paymongo"
      ? `Payments: PayMongo (${config.paymongo.secretKey.startsWith("sk_live") ? "LIVE" : "test"} mode)`
      : paymentProvider === "mock"
        ? "Payments: local test checkout (set PAYPAL_CLIENT_ID and PAYPAL_CLIENT_SECRET for PayPal)"
        : "Payments: off (set SUPABASE_SERVICE_ROLE_KEY to enable plans)",
    "setup",
  );
  startReminderScheduler();
});
