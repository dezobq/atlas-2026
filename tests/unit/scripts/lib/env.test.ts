import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { requireEnv } from "../../../../scripts/lib/env";

describe("requireEnv", () => {
  const originalEnv = { ...process.env };

  beforeEach(() => {
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = { ...originalEnv };
  });

  it("retorna valor quando env var existe", () => {
    process.env.TEST_VAR = "valor-teste";
    expect(requireEnv("TEST_VAR")).toBe("valor-teste");
  });

  it("lança erro com mensagem clara quando env var falta", () => {
    delete process.env.MISSING_VAR;
    expect(() => requireEnv("MISSING_VAR")).toThrow(/MISSING_VAR.*\.env/i);
  });

  it("lança erro quando env var é string vazia", () => {
    process.env.EMPTY_VAR = "";
    expect(() => requireEnv("EMPTY_VAR")).toThrow();
  });
});
