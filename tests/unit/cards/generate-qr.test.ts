import { describe, it, expect } from "vitest";
import { generateQrSvg } from "@/lib/cards/generate-qr";

describe("generateQrSvg", () => {
  it("gera string SVG não-vazia para URL", async () => {
    const svg = await generateQrSvg("https://atlas-2026.pages.dev/declaracoes/test");
    expect(svg).toMatch(/^<svg/);
    expect(svg).toContain("</svg>");
    expect(svg.length).toBeGreaterThan(100);
  });

  it("respeita opção de largura", async () => {
    const svg = await generateQrSvg("https://atlas-2026.pages.dev/", { width: 120 });
    expect(svg).toContain('width="120"');
  });
});
