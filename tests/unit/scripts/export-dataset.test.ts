import { describe, it, expect } from "vitest";
import { flattenDeclaracao, toJsonl, toCsv } from "../../../scripts/export-dataset";

const sample = {
  id: "01J9XYZ123",
  slug: "exemplo",
  candidato_id: "cand-a",
  evento_id: "evt-1",
  texto: "Vamos reduzir",
  timestamp_no_evento: "00:15:30",
  contexto: "contexto",
  tema_principal: "economia",
  temas_secundarios: ["impostos", "renda"],
  tipo_estrutural: ["promessa", "dado_numerico"],
  fonte_primaria_url: "https://example.com",
  fonte_primaria_tipo: "youtube_oficial",
  archive_url: "https://web.archive.org/web/20261102/...",
  snapshot_interno_path: null,
  contexto_adicional: null,
  vereditos_externos: [
    {
      veiculo: "Lupa",
      classificacao: "Falso",
      url: "https://lupa.example/x",
      data: "2026-11-03T10:00:00.000Z",
      citacao_curta: "trecho",
    },
  ],
  versao: 1,
  criado_em: "2026-11-02T21:34:00.000Z",
  atualizado_em: "2026-11-02T21:34:00.000Z",
};

describe("flattenDeclaracao", () => {
  it("achata arrays string em CSV-friendly format", () => {
    const flat = flattenDeclaracao(sample);
    expect(flat.temas_secundarios).toBe("impostos;renda");
    expect(flat.tipo_estrutural).toBe("promessa;dado_numerico");
  });

  it("achata vereditos_externos com count", () => {
    const flat = flattenDeclaracao(sample);
    expect(flat.vereditos_externos_count).toBe(1);
    expect(flat.vereditos_externos_veiculos).toBe("Lupa");
  });

  it("substitui contexto_adicional null por string vazia", () => {
    const flat = flattenDeclaracao(sample);
    expect(flat.contexto_adicional_texto).toBe("");
  });
});

describe("toJsonl", () => {
  it("produz uma linha por objeto", () => {
    const out = toJsonl([{ a: 1 }, { a: 2 }]);
    const lines = out.split("\n").filter(Boolean);
    expect(lines).toHaveLength(2);
    expect(JSON.parse(lines[0]!)).toEqual({ a: 1 });
  });

  it("termina com newline", () => {
    expect(toJsonl([{ a: 1 }])).toBe('{"a":1}\n');
  });

  it("retorna string vazia para array vazio", () => {
    expect(toJsonl([])).toBe("");
  });
});

describe("toCsv", () => {
  it("inclui header com nomes das colunas", () => {
    const out = toCsv([{ a: 1, b: "x" }]);
    expect(out.split("\n")[0]).toBe("a,b");
  });

  it("escapa vírgulas e aspas corretamente", () => {
    const out = toCsv([{ a: 'tem, vírgula e "aspas"' }]);
    expect(out).toContain('"tem, vírgula e ""aspas"""');
  });
});
