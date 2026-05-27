import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { logger } from "../../../../scripts/lib/logger";

describe("logger", () => {
  let logSpy: ReturnType<typeof vi.spyOn>;
  let errorSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    logSpy = vi.spyOn(console, "log").mockImplementation(() => undefined);
    errorSpy = vi.spyOn(console, "error").mockImplementation(() => undefined);
  });

  afterEach(() => {
    logSpy.mockRestore();
    errorSpy.mockRestore();
  });

  it("info prefixa com ℹ", () => {
    logger.info("teste");
    expect(logSpy).toHaveBeenCalledWith("ℹ teste");
  });

  it("success prefixa com ✓", () => {
    logger.success("ok");
    expect(logSpy).toHaveBeenCalledWith("✓ ok");
  });

  it("warn prefixa com ⚠", () => {
    logger.warn("atenção");
    expect(logSpy).toHaveBeenCalledWith("⚠ atenção");
  });

  it("error prefixa com ✗ e usa console.error", () => {
    logger.error("falhou");
    expect(errorSpy).toHaveBeenCalledWith("✗ falhou");
  });

  it("error aceita objeto Error e mostra mensagem", () => {
    logger.error(new Error("boom"));
    expect(errorSpy).toHaveBeenCalledWith("✗ boom");
  });
});
