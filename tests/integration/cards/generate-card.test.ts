import { describe, it, expect } from "vitest";
import { generateCard } from "@/lib/cards/generate-card";
import type { CardData } from "@/lib/cards/card-template";

const sampleData: CardData = {
  declaracao: "Declaração mock para teste de geração de card visual.",
  candidato: "Candidato Teste",
  data: "12/04/2026",
  evento: "Evento Mock",
  vereditos: [{ veiculo: "Lupa", classificacao: "parcialmente falso" }],
  url: "https://atlas-2026.pages.dev/declaracoes/test",
  qrSvg: '<svg width="120" height="120"><rect width="120" height="120" fill="#0A0A0A"/></svg>',
};

describe("generateCard (integration)", () => {
  it("retorna PNG Buffer com dimensões corretas para 1200x630", async () => {
    const buffer = await generateCard(sampleData, "1200x630");
    expect(buffer).toBeInstanceOf(Buffer);
    expect(buffer[0]).toBe(0x89);
    expect(buffer[1]).toBe(0x50);
    expect(buffer[2]).toBe(0x4e);
    expect(buffer[3]).toBe(0x47);
    const width = buffer.readUInt32BE(16);
    const height = buffer.readUInt32BE(20);
    expect(width).toBe(1200);
    expect(height).toBe(630);
  }, 30000);
});
