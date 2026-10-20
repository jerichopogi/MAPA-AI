// Development only: serves the client through Vite's dev middleware with HMR.
// Imported dynamically so production builds never load Vite.
import type { Express } from "express";
import type { Server } from "http";
import fs from "fs";
import path from "path";
import { createServer as createViteServer } from "vite";
import viteConfig from "../vite.config";
import { config } from "./config";
import { withShareMeta } from "./share-meta";

export async function setupVite(app: Express, server: Server) {
  const vite = await createViteServer({
    ...viteConfig,
    configFile: false,
    server: { middlewareMode: true, hmr: { server }, allowedHosts: true },
    appType: "custom",
  });

  app.use(vite.middlewares);
  app.use("*", async (req, res, next) => {
    try {
      const templatePath = path.resolve(import.meta.dirname, "..", "client", "index.html");
      // Re-read on every request so edits to index.html show up without a restart.
      const template = await fs.promises.readFile(templatePath, "utf-8");
      const origin = config.appUrl || `${req.protocol}://${req.get("host")}`;
      const page = await vite.transformIndexHtml(req.originalUrl, await withShareMeta(req.originalUrl, template, origin));
      res.status(200).set({ "Content-Type": "text/html" }).end(page);
    } catch (e) {
      vite.ssrFixStacktrace(e as Error);
      next(e);
    }
  });
}
