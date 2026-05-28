import { describe, it, expect } from "vitest";
import { factCheckerColor, FALLBACK_COLOR } from "@/lib/cards/fact-checker-palette";

describe("factCheckerColor", () => {
  it("retorna cor da marca para cada veiculo do enum", () => {
    expect(factCheckerColor("Lupa")).toBe("#E20E0E");
    expect(factCheckerColor("Aos Fatos")).toBe("#1A9E5E");
    expect(factCheckerColor("Comprova")).toBe("#1E5AAF");
    expect(factCheckerColor("Estadão Verifica")).toBe("#3F3F3F");
    expect(factCheckerColor("Agência Pública")).toBe("#E67E22");
    expect(factCheckerColor("BBC Verify")).toBe("#B40000");
  });

  it("retorna fallback para 'outro' (sentinel canônico de sem fact-checker)", () => {
    expect(factCheckerColor("outro")).toBe(FALLBACK_COLOR);
  });

  it("retorna fallback para veículo desconhecido (defensivo)", () => {
    expect(factCheckerColor("Inventado")).toBe(FALLBACK_COLOR);
  });

  it("FALLBACK_COLOR é cinza neutro #737373", () => {
    expect(FALLBACK_COLOR).toBe("#737373");
  });
});
