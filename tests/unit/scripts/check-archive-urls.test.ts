import { describe, it, expect, vi, beforeEach } from "vitest";
import { verificarArchiveUrls } from "@/../scripts/check-archive-urls";

describe("verificarArchiveUrls", () => {
  beforeEach(() => {
    vi.unstubAllGlobals();
  });

  it("retorna ok=true quando todas URLs retornam 200", async () => {
    const mockFetch = vi.fn().mockResolvedValue({ status: 200, ok: true });
    vi.stubGlobal("fetch", mockFetch);

    const { ok, failures } = await verificarArchiveUrls([
      "https://web.archive.org/web/2026/a",
      "https://web.archive.org/web/2026/b",
    ]);

    expect(ok).toBe(true);
    expect(failures).toEqual([]);
    expect(mockFetch).toHaveBeenCalledTimes(2);
  });

  it("retorna ok=false quando alguma URL retorna 4xx/5xx", async () => {
    const mockFetch = vi
      .fn()
      .mockResolvedValueOnce({ status: 200, ok: true })
      .mockResolvedValueOnce({ status: 404, ok: false });
    vi.stubGlobal("fetch", mockFetch);

    const { ok, failures } = await verificarArchiveUrls([
      "https://web.archive.org/web/2026/a",
      "https://web.archive.org/web/2026/b",
    ]);

    expect(ok).toBe(false);
    expect(failures).toEqual([
      { url: "https://web.archive.org/web/2026/b", status: 404, error: null },
    ]);
  });

  it("captura erros de rede como falha", async () => {
    const mockFetch = vi.fn().mockRejectedValue(new Error("ETIMEDOUT"));
    vi.stubGlobal("fetch", mockFetch);

    const { ok, failures } = await verificarArchiveUrls(["https://web.archive.org/x"]);

    expect(ok).toBe(false);
    expect(failures).toHaveLength(1);
    expect(failures[0]?.error).toContain("ETIMEDOUT");
  });

  it("usa método HEAD por padrão", async () => {
    const mockFetch = vi.fn().mockResolvedValue({ status: 200, ok: true });
    vi.stubGlobal("fetch", mockFetch);

    await verificarArchiveUrls(["https://web.archive.org/x"]);

    expect(mockFetch).toHaveBeenCalledWith(
      "https://web.archive.org/x",
      expect.objectContaining({ method: "HEAD" }),
    );
  });
});
