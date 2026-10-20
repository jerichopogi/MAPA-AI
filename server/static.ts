import express, { type Express } from "express";
import fs from "fs";
import path from "path";
import { config } from "./config";
import { withShareMeta } from "./share-meta";

/** Production: serve the built client from dist/public with SPA fallback. */
export function serveStatic(app: Express) {
  const distPath = path.resolve(import.meta.dirname, "public");
  if (!fs.existsSync(distPath)) {
    throw new Error(`Build output not found at ${distPath}. Run "npm run build" first.`);
  }
  const indexHtml = fs.readFileSync(path.resolve(distPath, "index.html"), "utf-8");

  app.use(express.static(distPath, { index: false }));
  app.use("*", async (req, res) => {
    const origin = config.appUrl || `${req.protocol}://${req.get("host")}`;
    res.status(200).set({ "Content-Type": "text/html" }).end(await withShareMeta(req.originalUrl, indexHtml, origin));
  });
}
