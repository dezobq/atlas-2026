import { describe, it, expect } from "vitest";
import {
  buildSaveUrl,
  extractArchiveUrl,
  hashUrl,
  buildAuthHeader,
  buildStatusUrl,
  buildArchiveUrl,
  parseJobId,
  parseStatus,
  requestSnapshot,
  type FetchLike,
  type FetchResponseLike,
} from "../../../scripts/archive";

describe("buildSaveUrl", () => {
  it("monta URL com encoding correto", () => {
    expect(buildSaveUrl("https://exemplo.com/post?id=1")).toBe(
      "https://web.archive.org/save/https://exemplo.com/post?id=1",
    );
  });

  it("aceita URL com unicode (acentos)", () => {
    expect(buildSaveUrl("https://exemplo.com/política")).toBe(
      "https://web.archive.org/save/https://exemplo.com/política",
    );
  });
});

describe("extractArchiveUrl", () => {
  it("extrai URL do header Content-Location quando presente", () => {
    const headers = new Headers();
    headers.set("Content-Location", "/web/20261102/https://exemplo.com");
    expect(extractArchiveUrl(headers)).toBe(
      "https://web.archive.org/web/20261102/https://exemplo.com",
    );
  });

  it("extrai do header Location quando Content-Location ausente", () => {
    const headers = new Headers();
    headers.set("Location", "https://web.archive.org/web/20261102/https://exemplo.com");
    expect(extractArchiveUrl(headers)).toBe(
      "https://web.archive.org/web/20261102/https://exemplo.com",
    );
  });

  it("retorna null quando nenhum header disponível", () => {
    expect(extractArchiveUrl(new Headers())).toBeNull();
  });
});

describe("hashUrl", () => {
  it("produz hash hex estável de 8 chars", () => {
    const h = hashUrl("https://exemplo.com/post");
    expect(h).toHaveLength(8);
    expect(h).toMatch(/^[a-f0-9]{8}$/);
  });

  it("produz mesmo hash para mesma URL", () => {
    expect(hashUrl("https://exemplo.com")).toBe(hashUrl("https://exemplo.com"));
  });

  it("produz hashes diferentes para URLs diferentes", () => {
    expect(hashUrl("https://a.com")).not.toBe(hashUrl("https://b.com"));
  });
});

describe("buildAuthHeader", () => {
  it("monta header LOW no formato access:secret", () => {
    expect(buildAuthHeader("KEY123", "SEC456")).toBe("LOW KEY123:SEC456");
  });
});

describe("buildStatusUrl", () => {
  it("monta a URL de status a partir do job_id", () => {
    expect(buildStatusUrl("ac58789b-f3ca")).toBe(
      "https://web.archive.org/save/status/ac58789b-f3ca",
    );
  });
});

describe("buildArchiveUrl", () => {
  it("monta o snapshot a partir de timestamp + original_url", () => {
    expect(buildArchiveUrl("20180326070330", "http://example.com/")).toBe(
      "https://web.archive.org/web/20180326070330/http://example.com/",
    );
  });
});

describe("parseJobId", () => {
  it("extrai job_id de uma resposta válida do POST /save", () => {
    expect(parseJobId({ url: "http://x/", job_id: "ac58789b" })).toBe("ac58789b");
  });

  it("lança quando job_id está ausente (ex.: resposta de auth)", () => {
    expect(() => parseJobId({ message: "You need to be logged in" })).toThrow(/job_id/);
  });

  it("lança quando o corpo não é objeto (ex.: HTML)", () => {
    expect(() => parseJobId("<html>")).toThrow();
  });
});

describe("parseStatus", () => {
  it("reconhece pending", () => {
    expect(parseStatus({ status: "pending", job_id: "x" })).toEqual({ state: "pending" });
  });

  it("reconhece success com timestamp e original_url", () => {
    expect(
      parseStatus({
        status: "success",
        timestamp: "20180326070330",
        original_url: "http://example.com/",
      }),
    ).toEqual({
      state: "success",
      timestamp: "20180326070330",
      originalUrl: "http://example.com/",
    });
  });

  it("reconhece error e usa a message do SPN2", () => {
    expect(
      parseStatus({
        status: "error",
        message: "Couldn't resolve host",
        status_ext: "error:invalid-host-resolution",
      }),
    ).toEqual({ state: "error", message: "Couldn't resolve host" });
  });

  it("trata resposta sem campo status como erro", () => {
    expect(parseStatus({}).state).toBe("error");
  });

  it("trata success sem timestamp/original_url como erro", () => {
    expect(parseStatus({ status: "success" }).state).toBe("error");
  });
});

function jsonResponse(body: unknown): FetchResponseLike {
  return {
    ok: true,
    status: 200,
    json: () => Promise.resolve(body),
    text: () => Promise.resolve(""),
  };
}

describe("requestSnapshot", () => {
  it("retorna o archive_url no caminho feliz (pending → success)", async () => {
    const queue: FetchResponseLike[] = [
      jsonResponse({ url: "http://x/", job_id: "job1" }), // POST /save
      jsonResponse({ status: "pending", job_id: "job1" }), // status 1
      jsonResponse({ status: "success", timestamp: "20260101000000", original_url: "http://x/" }),
    ];
    const fetchFn: FetchLike = () => {
      const next = queue.shift();
      if (!next) throw new Error("mock de fetch esgotado");
      return Promise.resolve(next);
    };
    const sleeps: number[] = [];
    const sleep = (ms: number): Promise<void> => {
      sleeps.push(ms);
      return Promise.resolve();
    };

    const result = await requestSnapshot("http://x/", {
      fetchFn,
      sleep,
      accessKey: "K",
      secret: "S",
      pollIntervalMs: 10,
      maxAttempts: 5,
    });

    expect(result).toBe("https://web.archive.org/web/20260101000000/http://x/");
    expect(sleeps).toEqual([10]); // dormiu 1× entre o pending e o success
  });

  it("lança quando o SPN2 retorna status error", async () => {
    const queue: FetchResponseLike[] = [
      jsonResponse({ url: "http://x/", job_id: "job1" }),
      jsonResponse({ status: "error", message: "host bloqueado" }),
    ];
    const fetchFn: FetchLike = () => {
      const next = queue.shift();
      if (!next) throw new Error("mock de fetch esgotado");
      return Promise.resolve(next);
    };

    await expect(
      requestSnapshot("http://x/", {
        fetchFn,
        sleep: () => Promise.resolve(),
        accessKey: "K",
        secret: "S",
        maxAttempts: 5,
      }),
    ).rejects.toThrow(/host bloqueado/);
  });

  it("lança timeout quando nunca sai de pending", async () => {
    const fetchFn: FetchLike = (u) =>
      Promise.resolve(
        u.includes("/status/")
          ? jsonResponse({ status: "pending", job_id: "job1" })
          : jsonResponse({ url: "http://x/", job_id: "job1" }),
      );

    await expect(
      requestSnapshot("http://x/", {
        fetchFn,
        sleep: () => Promise.resolve(),
        accessKey: "K",
        secret: "S",
        pollIntervalMs: 1,
        maxAttempts: 3,
      }),
    ).rejects.toThrow(/timeout/i);
  });

  it("lança mensagem diagnóstica quando o status poll retorna não-JSON", async () => {
    const queue: FetchResponseLike[] = [
      jsonResponse({ url: "http://x/", job_id: "job1" }), // POST /save OK
      {
        ok: false,
        status: 503,
        json: () => Promise.reject(new SyntaxError("Unexpected token <")),
        text: () => Promise.resolve("<html>503</html>"),
      },
    ];
    const fetchFn: FetchLike = () => {
      const next = queue.shift();
      if (!next) throw new Error("mock de fetch esgotado");
      return Promise.resolve(next);
    };

    await expect(
      requestSnapshot("http://x/", {
        fetchFn,
        sleep: () => Promise.resolve(),
        accessKey: "K",
        secret: "S",
        maxAttempts: 5,
      }),
    ).rejects.toThrow(/não-JSON|503/);
  });
});
