import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";

describe("CardActions.astro", () => {
  const source = readFileSync(
    join(process.cwd(), "src/components/declaracoes/CardActions.astro"),
    "utf-8",
  );

  it("declara as 3 áreas de ação (Baixar / Copiar / Compartilhar)", () => {
    expect(source).toContain("Baixar card");
    expect(source).toContain("Copiar link da imagem");
    expect(source).toContain("Compartilhar");
  });

  it("inclui intents nativas das 4 plataformas", () => {
    expect(source).toMatch(/wa\.me/);
    expect(source).toMatch(/twitter\.com\/intent/);
    expect(source).toMatch(/threads\.net\/intent/);
    expect(source).toMatch(/t\.me\/share/);
  });

  it("usa navigator.clipboard para copy", () => {
    expect(source).toContain("navigator.clipboard.writeText");
  });
});
