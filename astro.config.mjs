import { defineConfig } from "astro/config";
import { fileURLToPath } from "node:url";
import react from "@astrojs/react";
import sitemap, { ChangeFreqEnum } from "@astrojs/sitemap";
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
  integrations: [
    react(),
    sitemap({
      changefreq: "weekly",
      priority: 0.6,
      serialize(item) {
        if (/\/404/.test(item.url) || /\/buscar/.test(item.url)) {
          return undefined;
        }
        if (/\/declaracoes\//.test(item.url)) {
          item.priority = 0.9;
          item.changefreq = ChangeFreqEnum.MONTHLY;
        }
        if (/\/candidatos\/|\/eventos\//.test(item.url)) {
          item.priority = 0.8;
          item.changefreq = ChangeFreqEnum.WEEKLY;
        }
        if (item.url.endsWith("/") || /\/dataset|\/metodologia/.test(item.url)) {
          item.priority = 0.7;
        }
        return item;
      },
    }),
  ],
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
