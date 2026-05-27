import { describe, it, expect } from "vitest";
import { buildSaveUrl, extractArchiveUrl, hashUrl } from "../../../scripts/archive";

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
