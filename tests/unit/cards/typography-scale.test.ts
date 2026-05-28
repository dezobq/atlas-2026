import { describe, it, expect } from "vitest";
import { titleFontSize } from "@/lib/cards/typography-scale";

describe("titleFontSize", () => {
  it("usa 72pt para declaração curta (≤120 chars)", () => {
    expect(titleFontSize(50, 1)).toBe(72);
    expect(titleFontSize(120, 1)).toBe(72);
  });

  it("usa 54pt para declaração média (120-300 chars)", () => {
    expect(titleFontSize(121, 1)).toBe(54);
    expect(titleFontSize(300, 1)).toBe(54);
  });

  it("usa 40pt para declaração longa (>300 chars)", () => {
    expect(titleFontSize(301, 1)).toBe(40);
    expect(titleFontSize(800, 1)).toBe(40);
  });

  it("aplica multiplicador do formato", () => {
    expect(titleFontSize(50, 0.9)).toBe(64.8);
    expect(titleFontSize(50, 0.95)).toBe(68.4);
  });
});
