import { defineConfig } from "astro/config";
import { fileURLToPath } from "node:url";
import react from "@astrojs/react";

const srcDir = fileURLToPath(new URL("./src", import.meta.url));

export default defineConfig({
  site: "https://atlas2026.example.com",
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
    resolve: {
      alias: {
        "@": srcDir,
        "@components": fileURLToPath(new URL("./src/components", import.meta.url)),
        "@lib": fileURLToPath(new URL("./src/lib", import.meta.url)),
        "@styles": fileURLToPath(new URL("./src/styles", import.meta.url)),
        "@types": fileURLToPath(new URL("./src/types/index.ts", import.meta.url)),
      },
    },
  },
});
