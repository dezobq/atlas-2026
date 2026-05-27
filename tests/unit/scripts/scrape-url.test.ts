import { describe, it, expect } from "vitest";
import { sanitizeFilename, isLikelyUrl } from "../../../scripts/scrape-url";

describe("sanitizeFilename", () => {
  it("converte caracteres não-alfanuméricos em -", () => {
    expect(sanitizeFilename("Notícia: G1!")).toBe("noticia-g1");
  });

  it("remove diacríticos", () => {
    expect(sanitizeFilename("declaração")).toBe("declaracao");
  });

  it("limita comprimento a 40 chars", () => {
    const long = "a".repeat(100);
    expect(sanitizeFilename(long).length).toBeLessThanOrEqual(40);
  });
});

describe("isLikelyUrl", () => {
  it("aceita https", () => {
    expect(isLikelyUrl("https://exemplo.com")).toBe(true);
  });

  it("aceita http", () => {
    expect(isLikelyUrl("http://exemplo.com")).toBe(true);
  });

  it("rejeita strings sem protocolo", () => {
    expect(isLikelyUrl("exemplo.com")).toBe(false);
  });

  it("rejeita strings vazias", () => {
    expect(isLikelyUrl("")).toBe(false);
  });
});
