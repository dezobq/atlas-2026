import { describe, it, expect } from "vitest";
import { truncateDeclaracao } from "@/lib/cards/truncate";

describe("truncateDeclaracao", () => {
  it("retorna texto integral se ≤ maxLength", () => {
    expect(truncateDeclaracao("texto curto", 280)).toBe("texto curto");
  });

  it("trunca em maxLength sem cortar palavra", () => {
    const long =
      "Lorem ipsum dolor sit amet consectetur adipiscing elit sed do eiusmod tempor".repeat(5);
    const result = truncateDeclaracao(long, 50);
    expect(result.length).toBeLessThanOrEqual(51);
    expect(result.endsWith("…")).toBe(true);
    expect(result).not.toMatch(/\w…$/);
  });

  it("usa 280 chars como default", () => {
    const long = "x".repeat(500);
    const result = truncateDeclaracao(long);
    expect(result.length).toBeLessThanOrEqual(281);
  });
});
