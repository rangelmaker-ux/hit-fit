import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

// Vercel-compatible build: pure React SPA, no Cloudflare/vinext dependencies.
// Tailwind v4 is picked up automatically via postcss.config.mjs at the root.
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./"),
    },
  },
  build: {
    outDir: "dist",
    emptyOutDir: true,
  },
});
