import { describe, it, expect } from "vitest";
import { slugify } from "@/lib/utils/slugify";

describe("slugify", () => {
  it("converte string simples para slug", () => {
    expect(slugify("Hello World")).toBe("hello-world");
  });

  it("remove acentos portugueses", () => {
    expect(slugify("São Paulo")).toBe("sao-paulo");
    expect(slugify("educação")).toBe("educacao");
    expect(slugify("açúcar e atenção")).toBe("acucar-e-atencao");
  });

  it("remove caracteres especiais", () => {
    expect(slugify("R$ 1.000,00!")).toBe("r-1-000-00");
    expect(slugify("E-mail@domínio.com")).toBe("e-mail-dominio-com");
  });

  it("colapsa múltiplos espaços e hifens", () => {
    expect(slugify("a  b   c")).toBe("a-b-c");
    expect(slugify("a---b")).toBe("a-b");
  });

  it("remove hifens das pontas", () => {
    expect(slugify("--abc--")).toBe("abc");
    expect(slugify("   xyz   ")).toBe("xyz");
  });

  it("retorna string vazia para entrada vazia", () => {
    expect(slugify("")).toBe("");
    expect(slugify("   ")).toBe("");
  });

  it("preserva números", () => {
    expect(slugify("Sprint 2026")).toBe("sprint-2026");
  });
});
