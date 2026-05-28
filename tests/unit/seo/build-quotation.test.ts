import { describe, it, expect } from "vitest";
import { buildQuotationSchema } from "@/lib/seo/build-quotation";
import type { Candidato, Declaracao } from "@/types";

const fakeCandidato: Candidato = {
  id: "candidato-a",
  slug: "candidato-a",
  collection: "candidatos",
  data: {
    id: "candidato-a",
    slug: "candidato-a",
    nome: "Candidato A",
    partido: "Partido Demo",
    biografia_minima: "Biografia mínima.",
    contas_oficiais: [],
    criado_em: "2026-01-01T00:00:00Z",
    atualizado_em: "2026-04-01T00:00:00Z",
  },
} as Candidato;

const fakeDeclaracao: Declaracao = {
  id: "2026-04-15-candidato-a-economia-imposto",
  slug: "2026-04-15-candidato-a-economia-imposto",
  collection: "declaracoes",
  data: {
    id: "2026-04-15-candidato-a-economia-imposto",
    slug: "2026-04-15-candidato-a-economia-imposto",
    candidato_id: "candidato-a",
    evento_id: "2026-04-15-debate-rede-tv",
    texto: "Vou reduzir o imposto de renda em 30% no primeiro ano.",
    timestamp_no_evento: "00:23:15",
    contexto: "Resposta sobre política fiscal durante o debate.",
    tema_principal: "economia",
    temas_secundarios: [],
    tipo_estrutural: ["promessa", "dado_numerico"],
    fonte_primaria_url: "https://youtube.com/watch?v=abc123",
    fonte_primaria_tipo: "youtube_oficial",
    archive_url: "https://web.archive.org/web/2026/https://youtube.com/watch?v=abc123",
    snapshot_interno_path: null,
    contexto_adicional: null,
    vereditos_externos: [],
    versao: 1,
    criado_em: "2026-04-15T00:00:00Z",
    atualizado_em: "2026-04-15T00:00:00Z",
  },
} as Declaracao;

describe("buildQuotationSchema", () => {
  it("retorna Quotation com @context e @type", () => {
    const schema = buildQuotationSchema(fakeDeclaracao, fakeCandidato, "https://atlas-2026.pages.dev") as unknown as Record<string, unknown>;
    expect(schema["@context"]).toBe("https://schema.org");
    expect(schema["@type"]).toBe("Quotation");
  });

  it("usa o texto da declaração como text", () => {
    const schema = buildQuotationSchema(fakeDeclaracao, fakeCandidato, "https://atlas-2026.pages.dev") as unknown as Record<string, unknown>;
    expect(schema.text).toBe("Vou reduzir o imposto de renda em 30% no primeiro ano.");
  });

  it("inclui spokenByCharacter referenciando o candidato", () => {
    const schema = buildQuotationSchema(fakeDeclaracao, fakeCandidato, "https://atlas-2026.pages.dev") as unknown as Record<string, unknown>;
    expect(schema.spokenByCharacter).toEqual({
      "@type": "Person",
      name: "Candidato A",
      url: "https://atlas-2026.pages.dev/candidatos/candidato-a",
    });
  });

  it("inclui citation com URL da fonte primária", () => {
    const schema = buildQuotationSchema(fakeDeclaracao, fakeCandidato, "https://atlas-2026.pages.dev") as unknown as Record<string, unknown>;
    expect(schema.citation).toBe("https://youtube.com/watch?v=abc123");
  });

  it("inclui url canônica da declaração no site", () => {
    const schema = buildQuotationSchema(fakeDeclaracao, fakeCandidato, "https://atlas-2026.pages.dev") as unknown as Record<string, unknown>;
    expect(schema.url).toBe(
      "https://atlas-2026.pages.dev/declaracoes/2026-04-15-candidato-a-economia-imposto",
    );
  });

  it("inclui dateCreated com criado_em", () => {
    const schema = buildQuotationSchema(fakeDeclaracao, fakeCandidato, "https://atlas-2026.pages.dev") as unknown as Record<string, unknown>;
    expect(schema.dateCreated).toBe("2026-04-15T00:00:00Z");
  });
});
