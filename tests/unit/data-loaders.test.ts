// NOTE: These tests rely on `astro:content`'s virtual module, which is
// not resolvable in vitest's default runtime. They are skipped until
// we either (a) configure vitest to use astro's getViteConfig
// (with Vite version compatibility resolved), or (b) refactor loaders
// to use a testable abstraction. Tracked in memory: bugs-do-plano-fase1.md (Bug 5)
//
// Validation strategy meanwhile: `pnpm typecheck` proves the loaders
// satisfy the generated CollectionEntry types from src/content/config.ts,
// and `pnpm build` exercises the loaders in the real Astro runtime.

import { describe, it } from "vitest";

describe.skip("temas loader (requires astro:content runtime)", () => {
  it("retorna todos os temas primários", async () => {
    const { getAllTemas } = await import("@/lib/data/temas");
    const temas = await getAllTemas();
    if (temas.length < 6) throw new Error("Esperado ao menos 6 temas");
    if (!temas.every((t) => t.data.nivel === "primario")) {
      throw new Error("Esperado nivel='primario' em todos os temas");
    }
  });

  it("retorna tema por slug", async () => {
    const { getTemaBySlug } = await import("@/lib/data/temas");
    const economia = await getTemaBySlug("economia");
    if (!economia) throw new Error("Esperado encontrar tema economia");
    if (economia.data.nome !== "Economia") {
      throw new Error("Esperado nome='Economia'");
    }
  });

  it("retorna undefined para slug inexistente", async () => {
    const { getTemaBySlug } = await import("@/lib/data/temas");
    const fake = await getTemaBySlug("tema-inexistente");
    if (fake !== undefined) throw new Error("Esperado undefined");
  });

  it("temas ordenados por nome", async () => {
    const { getAllTemas } = await import("@/lib/data/temas");
    const temas = await getAllTemas();
    const nomes = temas.map((t) => t.data.nome);
    const sorted = [...nomes].sort((a, b) => a.localeCompare(b, "pt-BR"));
    if (JSON.stringify(nomes) !== JSON.stringify(sorted)) {
      throw new Error("Esperado temas ordenados por nome");
    }
  });
});
