import express, { type Express } from "express";
import fs from "fs";
import path from "path";

/** Production: serve the built client from dist/public with SPA fallback. */
export function serveStatic(app: Express) {
  const distPath = path.resolve(import.meta.dirname, "public");
  if (!fs.existsSync(distPath)) {
    throw new Error(`Build output not found at ${distPath}. Run "npm run build" first.`);
  }

  app.use(express.static(distPath));
  app.use("*", (_req, res) => {
    res.sendFile(path.resolve(distPath, "index.html"));
  });
}
