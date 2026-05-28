import { describe, it, expect } from "vitest";
import { buildArticleSchema } from "@/lib/seo/build-article";
import type { Candidato, Declaracao } from "@/types";

const fakeCandidato: Candidato = {
  id: "candidato-a",
  slug: "candidato-a",
  collection: "candidatos",
  data: {
    id: "candidato-a",
    slug: "candidato-a",
    nome: "Candidato A",
    partido: "Partido X",
    biografia_minima: "Bio.",
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
    atualizado_em: "2026-04-20T00:00:00Z",
  },
} as Declaracao;

describe("buildArticleSchema", () => {
  it("retorna Article com @context e @type", () => {
    const schema = buildArticleSchema(
      fakeDeclaracao,
      fakeCandidato,
      "https://atlas-2026.pages.dev",
    ) as unknown as Record<string, unknown>;
    expect(schema["@context"]).toBe("https://schema.org");
    expect(schema["@type"]).toBe("Article");
  });

  it("usa nome do candidato e texto truncado como headline", () => {
    const schema = buildArticleSchema(
      fakeDeclaracao,
      fakeCandidato,
      "https://atlas-2026.pages.dev",
    ) as unknown as Record<string, unknown>;
    expect(schema.headline).toBe(
      'Candidato A: "Vou reduzir o imposto de renda em 30% no primeiro ano."',
    );
  });

  it("trunca textos longos da declaração no headline (até 110 chars + reticências)", () => {
    const longText = "A".repeat(200);
    const declaracaoLonga = {
      ...fakeDeclaracao,
      data: { ...fakeDeclaracao.data, texto: longText },
    } as Declaracao;
    const schema = buildArticleSchema(
      declaracaoLonga,
      fakeCandidato,
      "https://atlas-2026.pages.dev",
    ) as unknown as Record<string, unknown>;
    const headline = schema.headline;
    expect(String(headline).length).toBeLessThanOrEqual(140);
    expect(headline).toContain("…");
  });

  it("inclui author como Organization Atlas", () => {
    const schema = buildArticleSchema(
      fakeDeclaracao,
      fakeCandidato,
      "https://atlas-2026.pages.dev",
    ) as unknown as Record<string, unknown>;
    expect(schema.author).toEqual({
      "@type": "Organization",
      name: "Atlas dos Candidatos 2026",
      url: "https://atlas-2026.pages.dev",
    });
  });

  it("usa criado_em como datePublished e atualizado_em como dateModified", () => {
    const schema = buildArticleSchema(
      fakeDeclaracao,
      fakeCandidato,
      "https://atlas-2026.pages.dev",
    ) as unknown as Record<string, unknown>;
    expect(schema.datePublished).toBe("2026-04-15T00:00:00Z");
    expect(schema.dateModified).toBe("2026-04-20T00:00:00Z");
  });

  it("inclui mainEntityOfPage com URL da declaração", () => {
    const schema = buildArticleSchema(
      fakeDeclaracao,
      fakeCandidato,
      "https://atlas-2026.pages.dev",
    ) as unknown as Record<string, unknown>;
    expect(schema.mainEntityOfPage).toEqual({
      "@type": "WebPage",
      "@id": "https://atlas-2026.pages.dev/declaracoes/2026-04-15-candidato-a-economia-imposto",
    });
  });
});
