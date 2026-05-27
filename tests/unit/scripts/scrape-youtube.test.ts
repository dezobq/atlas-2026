import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { extractVideoId, summarizeMetadata } from "../../../scripts/scrape-youtube";

const fixturePath = resolve(__dirname, "../../fixtures/youtube-metadata.json");
const fixture = JSON.parse(readFileSync(fixturePath, "utf-8")) as Record<string, unknown>;

describe("extractVideoId", () => {
  it("extrai ID de URL watch?v=", () => {
    expect(extractVideoId("https://www.youtube.com/watch?v=dQw4w9WgXcQ")).toBe(
      "dQw4w9WgXcQ",
    );
  });

  it("extrai ID de URL youtu.be/", () => {
    expect(extractVideoId("https://youtu.be/dQw4w9WgXcQ")).toBe("dQw4w9WgXcQ");
  });

  it("extrai ID de URL com query params extras", () => {
    expect(
      extractVideoId("https://www.youtube.com/watch?v=dQw4w9WgXcQ&t=120s"),
    ).toBe("dQw4w9WgXcQ");
  });

  it("retorna null para URL inválida", () => {
    expect(extractVideoId("https://exemplo.com/video")).toBeNull();
  });
});

describe("summarizeMetadata", () => {
  it("formata duração como HH:MM:SS", () => {
    const summary = summarizeMetadata(fixture);
    expect(summary).toContain("Debate Band 02-11-2026");
    expect(summary).toContain("02:00:34");
    expect(summary).toContain("Band Jornalismo");
  });
});
