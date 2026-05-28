import { describe, it, expect } from "vitest";
import { buildEventSchema } from "@/lib/seo/build-event";
import type { Candidato, Evento } from "@/types";

const fakeCandidatos: Candidato[] = [
  {
    id: "candidato-a",
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
  },
  {
    id: "candidato-b",
    collection: "candidatos",
    data: {
      id: "candidato-b",
      slug: "candidato-b",
      nome: "Candidato B",
      partido: "Partido Y",
      biografia_minima: "Bio.",
      contas_oficiais: [],
      criado_em: "2026-01-01T00:00:00Z",
      atualizado_em: "2026-04-01T00:00:00Z",
    },
  },
] as Candidato[];

const fakeEvento: Evento = {
  id: "2026-04-15-debate-rede-tv",
  collection: "eventos",
  data: {
    id: "2026-04-15-debate-rede-tv",
    titulo: "Debate Presidencial - Rede TV 15/04/2026",
    data: "2026-04-15T20:00:00Z",
    tipo: "debate",
    local: { fisico: "Estúdio Rede TV - São Paulo", digital: null },
    duracao_minutos: 120,
    fonte_primaria_url: "https://youtube.com/watch?v=abc123",
    fonte_primaria_tipo: "youtube_oficial",
    archive_url: "https://web.archive.org/web/2026/https://youtube.com/watch?v=abc123",
    candidatos_envolvidos: [{ candidato_id: "candidato-a" }, { candidato_id: "candidato-b" }],
    descricao: "Debate entre candidatos sobre economia e saúde.",
    criado_em: "2026-04-15T00:00:00Z",
    atualizado_em: "2026-04-15T00:00:00Z",
  },
};

describe("buildEventSchema", () => {
  it("retorna Event com @context e @type", () => {
    const schema = buildEventSchema(
      fakeEvento,
      fakeCandidatos,
      "https://atlas-2026.pages.dev",
    ) as unknown as Record<string, unknown>;
    expect(schema["@context"]).toBe("https://schema.org");
    expect(schema["@type"]).toBe("Event");
  });

  it("usa título como name e descrição como description", () => {
    const schema = buildEventSchema(
      fakeEvento,
      fakeCandidatos,
      "https://atlas-2026.pages.dev",
    ) as unknown as Record<string, unknown>;
    expect(schema.name).toBe("Debate Presidencial - Rede TV 15/04/2026");
    expect(schema.description).toBe("Debate entre candidatos sobre economia e saúde.");
  });

  it("usa data como startDate", () => {
    const schema = buildEventSchema(
      fakeEvento,
      fakeCandidatos,
      "https://atlas-2026.pages.dev",
    ) as unknown as Record<string, unknown>;
    expect(schema.startDate).toBe("2026-04-15T20:00:00Z");
  });

  it("inclui location quando físico existe", () => {
    const schema = buildEventSchema(
      fakeEvento,
      fakeCandidatos,
      "https://atlas-2026.pages.dev",
    ) as unknown as Record<string, unknown>;
    expect(schema.location).toEqual({
      "@type": "Place",
      name: "Estúdio Rede TV - São Paulo",
    });
  });

  it("inclui performer com todos os candidatos envolvidos", () => {
    const schema = buildEventSchema(
      fakeEvento,
      fakeCandidatos,
      "https://atlas-2026.pages.dev",
    ) as unknown as Record<string, unknown>;
    expect(schema.performer).toEqual([
      {
        "@type": "Person",
        name: "Candidato A",
        url: "https://atlas-2026.pages.dev/candidatos/candidato-a",
      },
      {
        "@type": "Person",
        name: "Candidato B",
        url: "https://atlas-2026.pages.dev/candidatos/candidato-b",
      },
    ]);
  });

  it("inclui url canônica do evento", () => {
    const schema = buildEventSchema(
      fakeEvento,
      fakeCandidatos,
      "https://atlas-2026.pages.dev",
    ) as unknown as Record<string, unknown>;
    expect(schema.url).toBe("https://atlas-2026.pages.dev/eventos/2026-04-15-debate-rede-tv");
  });

  it("ignora candidatos_envolvidos que não estão na lista de candidatos passada", () => {
    const eventoComOrfao = {
      ...fakeEvento,
      data: {
        ...fakeEvento.data,
        candidatos_envolvidos: [
          { candidato_id: "candidato-a" },
          { candidato_id: "candidato-fantasma" },
        ],
      },
    } as Evento;
    const schema = buildEventSchema(
      eventoComOrfao,
      fakeCandidatos,
      "https://atlas-2026.pages.dev",
    ) as unknown as Record<string, unknown>;
    const performer = schema.performer as Array<{ name: string }>;
    expect(performer).toHaveLength(1);
    expect(performer[0]).toMatchObject({ name: "Candidato A" });
  });

  it("resolve performer por slug quando candidato.data.id (ULID) difere do slug", () => {
    // Reproduz produção: candidato.data.id = ULID, slug distinto; o evento
    // referencia o SLUG em candidato_id. As fixtures acima mascaram o bug com id===slug.
    const candidatosComUlid = [
      {
        id: "lula-luiz-inacio",
        collection: "candidatos",
        data: {
          id: "01KSQDGYBHGRTNYGSMCMPAAKH4",
          slug: "lula-luiz-inacio",
          nome: "Luiz Inácio Lula da Silva",
          partido: "PT",
          biografia_minima: "Bio.",
          contas_oficiais: [],
          criado_em: "2026-01-01T00:00:00Z",
          atualizado_em: "2026-04-01T00:00:00Z",
        },
      },
    ] as Candidato[];
    const eventoComSlug = {
      ...fakeEvento,
      data: {
        ...fakeEvento.data,
        candidatos_envolvidos: [{ candidato_id: "lula-luiz-inacio" }],
      },
    } as Evento;
    const schema = buildEventSchema(
      eventoComSlug,
      candidatosComUlid,
      "https://atlas-2026.pages.dev",
    ) as unknown as Record<string, unknown>;
    const performer = schema.performer as Array<{ name: string; url: string }>;
    expect(performer).toHaveLength(1);
    expect(performer[0]).toMatchObject({
      name: "Luiz Inácio Lula da Silva",
      url: "https://atlas-2026.pages.dev/candidatos/lula-luiz-inacio",
    });
  });
});
