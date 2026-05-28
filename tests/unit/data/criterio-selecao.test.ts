import { describe, it, expect } from "vitest";
import { z } from "zod";

const criterioSelecaoSchema = z.object({
  data_corte: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  criado_em: z.string().datetime(),
  curador: z.string().min(1),
  pesquisas: z
    .array(
      z.object({
        instituto: z.enum(["Datafolha", "Quaest", "Genial-Quaest"]),
        url: z.string().url(),
        archive_url: z.string().url(),
        data_publicacao: z.string().datetime(),
        amostra: z.number().int().positive(),
        margem_erro_pp: z.number().positive(),
        metodologia: z.enum(["presencial domiciliar", "telefônica", "online"]),
        intencao_estimulada: z
          .array(
            z.object({
              candidato_nome: z.string().min(1),
              percentual: z.number().min(0).max(100),
            }),
          )
          .min(1),
      }),
    )
    .length(3),
  calculo: z
    .array(
      z.object({
        candidato_nome: z.string().min(1),
        media_simples: z.number().min(0).max(100),
      }),
    )
    .min(2),
  selecionados: z
    .array(
      z.object({
        posicao: z.number().int().min(1).max(2),
        candidato_id: z.string().regex(/^[a-z0-9-]+$/),
        nome: z.string().min(1),
        media: z.number().min(0).max(100),
      }),
    )
    .length(2),
  linha_de_empate: z.object({
    candidato_nome: z.string().min(1),
    media: z.number().min(0).max(100),
    distancia_pp: z.number().min(0),
    desempate_aplicado: z.boolean(),
    desempate_criterio: z.enum(["maior amostra", "menor margem", "tempo no cargo"]).nullable(),
  }),
  versao: z.number().int().positive(),
});

describe("criterio-selecao schema", () => {
  const validExample = {
    data_corte: "2026-05-15",
    criado_em: "2026-05-28T10:00:00.000Z",
    curador: "André Dezob",
    pesquisas: [
      {
        instituto: "Datafolha",
        url: "https://datafolha.folha.uol.com.br/exemplo",
        archive_url: "https://web.archive.org/web/2026/exemplo",
        data_publicacao: "2026-05-10T00:00:00.000Z",
        amostra: 2000,
        margem_erro_pp: 2,
        metodologia: "presencial domiciliar",
        intencao_estimulada: [
          { candidato_nome: "Candidato X", percentual: 30 },
          { candidato_nome: "Candidato Y", percentual: 25 },
        ],
      },
      {
        instituto: "Quaest",
        url: "https://www.quaest.com.br/exemplo",
        archive_url: "https://web.archive.org/web/2026/exemplo-q",
        data_publicacao: "2026-05-08T00:00:00.000Z",
        amostra: 2016,
        margem_erro_pp: 2,
        metodologia: "presencial domiciliar",
        intencao_estimulada: [
          { candidato_nome: "Candidato X", percentual: 32 },
          { candidato_nome: "Candidato Y", percentual: 24 },
        ],
      },
      {
        instituto: "Genial-Quaest",
        url: "https://www.quaest.com.br/genial-exemplo",
        archive_url: "https://web.archive.org/web/2026/exemplo-g",
        data_publicacao: "2026-05-12T00:00:00.000Z",
        amostra: 2000,
        margem_erro_pp: 2,
        metodologia: "presencial domiciliar",
        intencao_estimulada: [
          { candidato_nome: "Candidato X", percentual: 31 },
          { candidato_nome: "Candidato Y", percentual: 26 },
        ],
      },
    ],
    calculo: [
      { candidato_nome: "Candidato X", media_simples: 31 },
      { candidato_nome: "Candidato Y", media_simples: 25 },
    ],
    selecionados: [
      { posicao: 1, candidato_id: "candidato-x", nome: "Candidato X", media: 31 },
      { posicao: 2, candidato_id: "candidato-y", nome: "Candidato Y", media: 25 },
    ],
    linha_de_empate: {
      candidato_nome: "Candidato Z",
      media: 8,
      distancia_pp: 17,
      desempate_aplicado: false,
      desempate_criterio: null,
    },
    versao: 1,
  };

  it("aceita exemplo válido", () => {
    expect(() => criterioSelecaoSchema.parse(validExample)).not.toThrow();
  });

  it("rejeita data_corte fora do formato YYYY-MM-DD", () => {
    const invalido = { ...validExample, data_corte: "2026/05/15" };
    expect(() => criterioSelecaoSchema.parse(invalido)).toThrow();
  });

  it("rejeita pesquisas com menos de 3 entradas", () => {
    const invalido = { ...validExample, pesquisas: validExample.pesquisas.slice(0, 2) };
    expect(() => criterioSelecaoSchema.parse(invalido)).toThrow();
  });

  it("rejeita selecionados com mais ou menos de 2 entradas", () => {
    const invalido = { ...validExample, selecionados: [validExample.selecionados[0]] };
    expect(() => criterioSelecaoSchema.parse(invalido)).toThrow();
  });

  it("rejeita posicao fora do intervalo 1-2", () => {
    const invalido = {
      ...validExample,
      selecionados: [{ ...validExample.selecionados[0], posicao: 3 }, validExample.selecionados[1]],
    };
    expect(() => criterioSelecaoSchema.parse(invalido)).toThrow();
  });
});
