import { describe, it, expect } from "vitest";
import { orderVereditos, type VereditoInput } from "@/lib/cards/order-vereditos";

const v = (veiculo: string, classificacao: string): VereditoInput => ({
  veiculo,
  classificacao,
  url: "https://x",
  data: "2026-04-15T00:00:00Z",
  citacao_curta: "x",
});

describe("orderVereditos", () => {
  it("ordena alfabeticamente por veículo", () => {
    const input = [v("Lupa", "falso"), v("Aos Fatos", "distorce"), v("Comprova", "verdadeiro")];
    const result = orderVereditos(input);
    expect(result.map((x) => x.veiculo)).toEqual(["Aos Fatos", "Comprova", "Lupa"]);
  });

  it("limita a 3 vereditos com bias para classificação útil", () => {
    const input = [
      v("Aos Fatos", "sem registro"),
      v("Comprova", "distorce"),
      v("Lupa", "falso"),
      v("Estadão Verifica", "verdadeiro"),
    ];
    const result = orderVereditos(input);
    expect(result).toHaveLength(3);
    expect(result.map((x) => x.veiculo)).not.toContain("Aos Fatos");
  });

  it("retorna array vazio para input vazio", () => {
    expect(orderVereditos([])).toEqual([]);
  });
});
