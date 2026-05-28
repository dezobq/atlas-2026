import { describe, it, expect } from "vitest";
import { CARD_FORMATS, type CardFormat } from "@/lib/cards/format-config";

describe("CARD_FORMATS", () => {
  it("define os 4 formatos com dimensões e multiplicadores", () => {
    expect(CARD_FORMATS["1200x630"]).toEqual({ width: 1200, height: 630, multiplier: 1.0 });
    expect(CARD_FORMATS["1200x1200"]).toEqual({ width: 1200, height: 1200, multiplier: 1.0 });
    expect(CARD_FORMATS["1080x1350"]).toEqual({ width: 1080, height: 1350, multiplier: 0.95 });
    expect(CARD_FORMATS["1080x1920"]).toEqual({ width: 1080, height: 1920, multiplier: 0.9 });
  });

  it("expõe lista de chaves para iteração", () => {
    const keys = Object.keys(CARD_FORMATS) as CardFormat[];
    expect(keys).toHaveLength(4);
    expect(keys).toContain("1200x630");
  });
});
