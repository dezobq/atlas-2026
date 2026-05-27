import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { formatSegmentsAsTimestamps } from "../../../scripts/transcribe";

type WhisperResponse = {
  text: string;
  duration: number;
  segments: Array<{ id: number; start: number; end: number; text: string }>;
};

const fixturePath = resolve(__dirname, "../../fixtures/whisper-response.json");
const fixture = JSON.parse(readFileSync(fixturePath, "utf-8")) as WhisperResponse;

describe("formatSegmentsAsTimestamps", () => {
  it("formata segments como [HH:MM:SS] texto", () => {
    const formatted = formatSegmentsAsTimestamps(fixture.segments);
    expect(formatted).toContain("[00:00:00] Vamos reduzir o imposto de renda");
    expect(formatted).toContain("[00:00:05]");
  });

  it("formata duração em segundos corretamente", () => {
    const segments = [{ id: 0, start: 3665, end: 3700, text: "teste" }];
    expect(formatSegmentsAsTimestamps(segments)).toBe("[01:01:05] teste");
  });

  it("retorna string vazia para array vazio", () => {
    expect(formatSegmentsAsTimestamps([])).toBe("");
  });
});
