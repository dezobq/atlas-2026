import { defineConfig } from "vitest/config";
import { fileURLToPath } from "node:url";

export default defineConfig({
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
      // astro:content é um módulo virtual resolvido pelo Astro Vite plugin,
      // indisponível no runtime do Vitest. Mapeamos para um mock local que
      // expõe vi.fn() para getCollection/getEntry, permitindo testes unitários
      // dos loaders sem precisar do Astro SSR completo.
      "astro:content": fileURLToPath(
        new URL("./tests/__mocks__/astro-content.ts", import.meta.url),
      ),
    },
  },
  test: {
    environment: "jsdom",
    globals: true,
    include: ["tests/**/*.test.{ts,tsx}"],
    coverage: {
      provider: "v8",
      reporter: ["text", "html", "lcov"],
      exclude: [
        "node_modules/",
        "dist/",
        ".astro/",
        "tests/",
        "scripts/",
        "**/*.config.*",
        "**/*.d.ts",
      ],
      thresholds: {
        lines: 80,
        functions: 80,
        branches: 75,
        statements: 80,
      },
    },
  },
});
