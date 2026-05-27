import { describe, it, expect } from "vitest";
import { truncate } from "@/lib/utils/truncate";

describe("truncate", () => {
  it("retorna texto curto sem alteração", () => {
    expect(truncate("abc", 10)).toBe("abc");
  });

  it("trunca texto longo e adiciona ellipsis", () => {
    expect(truncate("Lorem ipsum dolor sit amet", 11)).toBe("Lorem ipsum…");
  });

  it("não corta no meio de palavra", () => {
    expect(truncate("Lorem ipsum dolor sit amet", 13)).toBe("Lorem ipsum…");
  });

  it("respeita maxLength exato em limites de palavra", () => {
    expect(truncate("uma duas tres quatro", 8)).toBe("uma duas…");
  });

  it("retorna string vazia para entrada vazia", () => {
    expect(truncate("", 10)).toBe("");
  });
});
