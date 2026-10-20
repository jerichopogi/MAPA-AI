import { config, isGeminiConfigured, isSupabaseConfigured, paymentProvider } from "./config";
import express, { type NextFunction, type Request, type Response } from "express";
import { createServer } from "http";
import { api } from "./routes";
import { serveStatic } from "./static";
import { log } from "./log";

const app = express();
app.use(
  express.json({
    limit: "1mb",
    // Keep the raw bytes for webhook signature verification.
    verify: (req, _res, buf) => {
      (req as typeof req & { rawBody?: Buffer }).rawBody = buf;
    },
  }),
);

// Log API calls (method, path, status, duration).
app.use("/api", (req, res, next) => {
  const start = Date.now();
  res.on("finish", () => log(`${req.method} /api${req.path} ${res.statusCode} in ${Date.now() - start}ms`));
  next();
});

app.use("/api", api);

app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  console.error(err);
  res.status(err.status || 500).json({ message: err.message || "Internal Server Error" });
});

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
});
