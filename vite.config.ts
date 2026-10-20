import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

const root = import.meta.dirname;

export default defineConfig({
  plugins: [react()],
  // .env lives in the project root, not in client/.
  envDir: root,
  resolve: {
    alias: {
      "@": path.resolve(root, "client", "src"),
      "@shared": path.resolve(root, "shared"),
    },
  },
  root: path.resolve(root, "client"),
  build: {
    outDir: path.resolve(root, "dist/public"),
    emptyOutDir: true,
  },
});
