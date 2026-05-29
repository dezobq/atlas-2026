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
});
