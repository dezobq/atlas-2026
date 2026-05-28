import { describe, it, expect } from "vitest";
import { buildCardTemplate, type CardData } from "@/lib/cards/card-template";

const data: CardData = {
  declaracao: "Teste de declaração curta",
  candidato: "Candidato X",
  data: "12/04/2026",
  evento: "Evento Y",
  vereditos: [
    { veiculo: "Lupa", classificacao: "parcialmente falso" },
    { veiculo: "Aos Fatos", classificacao: "distorce" },
  ],
  url: "https://atlas-2026.pages.dev/declaracoes/test",
  qrSvg: "<svg></svg>",
};

describe("buildCardTemplate", () => {
  it("retorna objeto Satori-compatível com width e height do formato", () => {
    const tpl = buildCardTemplate(data, "1200x630");
    expect(tpl.type).toBe("div");
    expect((tpl.props.style as Record<string, unknown>).width).toBe(1200);
    expect((tpl.props.style as Record<string, unknown>).height).toBe(630);
  });

  it("inclui declaração no markup", () => {
    const tpl = buildCardTemplate(data, "1200x630");
    const serialized = JSON.stringify(tpl);
    expect(serialized).toContain("Teste de declaração curta");
    expect(serialized).toContain("Candidato X");
    expect(serialized).toContain("Lupa");
    expect(serialized).toContain("Aos Fatos");
  });

  it("inclui rodapé de não-veredito sempre", () => {
    const tpl = buildCardTemplate(data, "1080x1920");
    const serialized = JSON.stringify(tpl);
    expect(serialized).toContain("Não emite veredito");
    expect(serialized).toContain("CC-BY 4.0");
  });

  it("mostra mensagem alternativa quando vereditos vazios", () => {
    const tpl = buildCardTemplate({ ...data, vereditos: [] }, "1200x630");
    const serialized = JSON.stringify(tpl);
    expect(serialized).toContain("Sem veredito de fact-checker reconhecido");
  });
});
