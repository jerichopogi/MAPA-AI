import { readFile } from "node:fs/promises";
import path from "node:path";
import { app } from "./app";
import { config } from "./config";
import { withShareMeta } from "./share-meta";

// Vercel invokes this app per request; it must not open a listening socket
// or start the persistent server's background reminder timers.
app.get("/s/:shareId", async (req, res, next) => {
  try {
    const html = await readFile(path.join(process.cwd(), "dist/public/index.html"), "utf8");
    const origin = config.appUrl || `https://${req.get("host")}`;
    res.type("html").send(await withShareMeta(req.originalUrl, html, origin));
  } catch (error) {
    next(error);
  }
});

export default app;
