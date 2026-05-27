import { defineConfig } from "astro/config";
import { fileURLToPath } from "node:url";
import react from "@astrojs/react";
import tailwindcss from "@tailwindcss/vite";

const srcDir = fileURLToPath(new URL("./src", import.meta.url));

export default defineConfig({
  site: "https://atlas-2026.pages.dev",
  output: "static",
  trailingSlash: "never",
  build: {
    format: "directory",
    assets: "_assets",
  },
  integrations: [react()],
  prefetch: {
    prefetchAll: false,
    defaultStrategy: "viewport",
  },
  vite: {
    plugins: [tailwindcss()],
    resolve: {
      alias: {
        "@": srcDir,
      },
    },
  },
});
