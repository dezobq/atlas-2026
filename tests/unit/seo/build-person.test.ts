import { describe, it, expect } from "vitest";
import { buildPersonSchema } from "@/lib/seo/build-person";
import type { Candidato } from "@/types";

const fakeCandidato: Candidato = {
  id: "candidato-a",
  slug: "candidato-a",
  collection: "candidatos",
  data: {
    id: "candidato-a",
    slug: "candidato-a",
    nome: "Candidato A",
    partido: "Partido Demo",
    foto_url: "https://exemplo.com/foto.jpg",
    biografia_minima: "Biografia factual mínima do candidato fictício A.",
    contas_oficiais: [
      {
        plataforma: "x",
        handle: "@candidatoa",
        url: "https://x.com/candidatoa",
        verificada: true,
      },
    ],
    criado_em: "2026-01-01T00:00:00Z",
    atualizado_em: "2026-04-01T00:00:00Z",
  },
} as Candidato;

describe("buildPersonSchema", () => {
  it("retorna um Person com @context e @type", () => {
    const schema = buildPersonSchema(fakeCandidato, "https://atlas-2026.pages.dev") as unknown;
    expect((schema as Record<string, unknown>)["@context"]).toBe("https://schema.org");
    expect((schema as Record<string, unknown>)["@type"]).toBe("Person");
    expect((schema as Record<string, unknown>).name).toBe("Candidato A");
  });

  it("inclui url canônica do candidato no site", () => {
    const schema = buildPersonSchema(fakeCandidato, "https://atlas-2026.pages.dev") as unknown;
    expect((schema as Record<string, unknown>).url).toBe("https://atlas-2026.pages.dev/candidatos/candidato-a");
  });

  it("inclui memberOf com partido", () => {
    const schema = buildPersonSchema(fakeCandidato, "https://atlas-2026.pages.dev") as unknown;
    expect((schema as Record<string, unknown>).memberOf).toEqual({
      "@type": "PoliticalParty",
      name: "Partido Demo",
    });
  });

  it("inclui sameAs com contas oficiais verificadas", () => {
    const schema = buildPersonSchema(fakeCandidato, "https://atlas-2026.pages.dev") as unknown;
    expect((schema as Record<string, unknown>).sameAs).toEqual(["https://x.com/candidatoa"]);
  });

  it("omite sameAs quando não há contas verificadas", () => {
    const candidatoSemContas: Candidato = {
      ...fakeCandidato,
      data: { ...fakeCandidato.data, contas_oficiais: [] },
    };
    const schema = buildPersonSchema(candidatoSemContas, "https://atlas-2026.pages.dev") as unknown;
    expect((schema as Record<string, unknown>).sameAs).toBeUndefined();
  });

  it("inclui image quando foto_url existe", () => {
    const schema = buildPersonSchema(fakeCandidato, "https://atlas-2026.pages.dev") as unknown;
    expect((schema as Record<string, unknown>).image).toBe("https://exemplo.com/foto.jpg");
  });
});
