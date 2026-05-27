import { describe, it, expect } from "vitest";
import { truncateCitacao, ogImagePath } from "../../../scripts/generate-og-images";

describe("truncateCitacao", () => {
  it("não altera citação curta", () => {
    expect(truncateCitacao("texto curto", 100)).toBe("texto curto");
  });

  it("trunca em boundary de palavra com ellipsis", () => {
    const result = truncateCitacao("Vamos reduzir o imposto de renda da classe média", 20);
    expect(result.endsWith("…")).toBe(true);
    expect(result.length).toBeLessThanOrEqual(21);
  });

  it("respeita comprimento exato quando coincide com word boundary", () => {
    expect(truncateCitacao("um dois três", 12)).toBe("um dois três");
  });
});

describe("ogImagePath", () => {
  it("retorna path no diretório OG_DIR", () => {
    expect(ogImagePath("01J9XYZ123")).toMatch(/public[\\/]og[\\/]01J9XYZ123\.png$/);
  });
});
