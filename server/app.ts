import express, { type NextFunction, type Request, type Response } from "express";
import { api } from "./routes";
import { log } from "./log";

export const app = express();
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

