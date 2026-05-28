import { describe, it, expect } from "vitest";
import { auditarParidade, type AuditMode } from "@/../scripts/audit-paridade";
import type {
  DeclaracaoFrontmatter,
  CandidatoYaml,
  EventoYaml,
} from "@/../scripts/lib/data-loaders";

const cand = (slug: string): CandidatoYaml => ({ id: slug, slug, nome: slug });

const ev = (id: string, data: string): EventoYaml => ({ id, data });

const dec = (
  id: string,
  candidato_id: string,
  tema: string,
  archive = "https://web.archive.org/web/x",
): DeclaracaoFrontmatter => ({
  id,
  candidato_id,
  tema_principal: tema,
  tipo_estrutural: ["promessa"],
  fonte_primaria_tipo: "youtube_oficial",
  archive_url: archive,
});

describe("auditarParidade", () => {
  const setup = (mode: AuditMode) => ({
    declaracoes: [] as DeclaracaoFrontmatter[],
    candidatos: [] as CandidatoYaml[],
    eventos: [] as EventoYaml[],
    eventoDeDeclaracao: new Map<string, string>(),
    mode,
  });

  it("setup-mode: aceita 0 ou 2 candidatos, 0 declarações", () => {
    const { errors, ok } = auditarParidade({
      ...setup("setup"),
      candidatos: [cand("a"), cand("b")],
    });
    expect(ok).toBe(true);
    expect(errors).toEqual([]);
  });

  it("setup-mode: rejeita 1 candidato (esperado 0 ou 2)", () => {
    const { ok, errors } = auditarParidade({
      ...setup("setup"),
      candidatos: [cand("a")],
    });
    expect(ok).toBe(false);
    expect(errors.some((e) => e.includes("candidato"))).toBe(true);
  });

  it("setup-mode: rejeita 3+ candidatos", () => {
    const { ok } = auditarParidade({
      ...setup("setup"),
      candidatos: [cand("a"), cand("b"), cand("c")],
    });
    expect(ok).toBe(false);
  });

  it("final-mode: aceita 60 declarações distribuídas 5×6×2", () => {
    const candidatos = [cand("a"), cand("b")];
    const temas = [
      "economia",
      "saude",
      "educacao",
      "seguranca-publica",
      "meio-ambiente",
      "politica-externa",
    ];
    const declaracoes: DeclaracaoFrontmatter[] = [];
    let n = 0;
    for (const c of candidatos) {
      for (const t of temas) {
        for (let i = 0; i < 5; i++) {
          declaracoes.push(dec(`d${n++}`, c.id, t));
        }
      }
    }
    const eventoDeDeclaracao = new Map(declaracoes.map((d) => [d.id, "ev1"]));
    const eventos = [ev("ev1", "2025-12-01T00:00:00.000Z")];
    const { ok, errors } = auditarParidade({
      mode: "final",
      candidatos,
      declaracoes,
      eventos,
      eventoDeDeclaracao,
    });
    expect(ok).toBe(true);
    expect(errors).toEqual([]);
  });

  it("final-mode: rejeita se faltam declarações em algum tema", () => {
    const candidatos = [cand("a"), cand("b")];
    const declaracoes = [dec("d1", "a", "economia")];
    const eventos = [ev("ev1", "2025-12-01T00:00:00.000Z")];
    const eventoDeDeclaracao = new Map([["d1", "ev1"]]);
    const { ok, errors } = auditarParidade({
      mode: "final",
      candidatos,
      declaracoes,
      eventos,
      eventoDeDeclaracao,
    });
    expect(ok).toBe(false);
    expect(errors.some((e) => e.toLowerCase().includes("60"))).toBe(true);
  });

  it("final-mode: rejeita archive_url vazio", () => {
    const candidatos = [cand("a"), cand("b")];
    const declaracoes = [dec("d1", "a", "economia", "")];
    const eventos = [ev("ev1", "2025-12-01T00:00:00.000Z")];
    const eventoDeDeclaracao = new Map([["d1", "ev1"]]);
    const { ok, errors } = auditarParidade({
      mode: "final",
      candidatos,
      declaracoes,
      eventos,
      eventoDeDeclaracao,
    });
    expect(ok).toBe(false);
    expect(errors.some((e) => e.includes("archive_url"))).toBe(true);
  });

  it("final-mode: rejeita evento fora da janela [2025-05-15, 2026-05-15]", () => {
    const candidatos = [cand("a"), cand("b")];
    const declaracoes = [dec("d1", "a", "economia")];
    const eventos = [ev("ev1", "2024-01-01T00:00:00.000Z")];
    const eventoDeDeclaracao = new Map([["d1", "ev1"]]);
    const { ok, errors } = auditarParidade({
      mode: "final",
      candidatos,
      declaracoes,
      eventos,
      eventoDeDeclaracao,
    });
    expect(ok).toBe(false);
    expect(errors.some((e) => e.toLowerCase().includes("janela"))).toBe(true);
  });

  it("piloto-mode: aceita 12 declarações, 1 por (tema, candidato)", () => {
    const candidatos = [cand("a"), cand("b")];
    const temas = [
      "economia",
      "saude",
      "educacao",
      "seguranca-publica",
      "meio-ambiente",
      "politica-externa",
    ];
    const declaracoes: DeclaracaoFrontmatter[] = [];
    let n = 0;
    for (const c of candidatos) {
      for (const t of temas) {
        declaracoes.push(dec(`d${n++}`, c.id, t));
      }
    }
    const eventos = [ev("ev1", "2025-12-01T00:00:00.000Z")];
    const eventoDeDeclaracao = new Map(declaracoes.map((d) => [d.id, "ev1"]));
    const { ok } = auditarParidade({
      mode: "piloto",
      candidatos,
      declaracoes,
      eventos,
      eventoDeDeclaracao,
    });
    expect(ok).toBe(true);
  });

  it("piloto-mode: rejeita 13 declarações (uma a mais)", () => {
    const candidatos = [cand("a"), cand("b")];
    const declaracoes = Array.from({ length: 13 }).map((_, i) => dec(`d${i}`, "a", "economia"));
    const eventos = [ev("ev1", "2025-12-01T00:00:00.000Z")];
    const eventoDeDeclaracao = new Map(declaracoes.map((d) => [d.id, "ev1"]));
    const { ok, errors } = auditarParidade({
      mode: "piloto",
      candidatos,
      declaracoes,
      eventos,
      eventoDeDeclaracao,
    });
    expect(ok).toBe(false);
    expect(errors.some((e) => e.toLowerCase().includes("12"))).toBe(true);
  });

  it("setup-mode: aceita 0 candidatos (estado inicial pré-Sprint 5.1)", () => {
    const { ok, errors } = auditarParidade(setup("setup"));
    expect(ok).toBe(true);
    expect(errors).toEqual([]);
  });

  it("rejeita declaração sem evento_id mapeado", () => {
    const candidatos = [cand("a"), cand("b")];
    const declaracoes = [dec("d1", "a", "economia")];
    const eventos = [ev("ev1", "2025-12-01T00:00:00.000Z")];
    const eventoDeDeclaracao = new Map<string, string>(); // sem mapeamento
    const { ok, errors } = auditarParidade({
      mode: "final",
      candidatos,
      declaracoes,
      eventos,
      eventoDeDeclaracao,
    });
    expect(ok).toBe(false);
    expect(errors.some((e) => e.includes("sem evento_id mapeado"))).toBe(true);
  });

  it("rejeita declaração com evento_id inexistente", () => {
    const candidatos = [cand("a"), cand("b")];
    const declaracoes = [dec("d1", "a", "economia")];
    const eventos: EventoYaml[] = []; // nenhum evento
    const eventoDeDeclaracao = new Map([["d1", "ev-fantasma"]]);
    const { ok, errors } = auditarParidade({
      mode: "final",
      candidatos,
      declaracoes,
      eventos,
      eventoDeDeclaracao,
    });
    expect(ok).toBe(false);
    expect(errors.some((e) => e.includes("ev-fantasma") && e.includes("inexistente"))).toBe(true);
  });

  it("rejeita evento com data ISO inválida", () => {
    const candidatos = [cand("a"), cand("b")];
    const declaracoes = [dec("d1", "a", "economia")];
    const eventos = [ev("ev1", "data-quebrada-nao-iso")];
    const eventoDeDeclaracao = new Map([["d1", "ev1"]]);
    const { ok, errors } = auditarParidade({
      mode: "final",
      candidatos,
      declaracoes,
      eventos,
      eventoDeDeclaracao,
    });
    expect(ok).toBe(false);
    expect(errors.some((e) => e.toLowerCase().includes("data inválida"))).toBe(true);
  });

  it("rejeita mais de 60 declarações (limite máximo da Fase 4)", () => {
    const candidatos = [cand("a"), cand("b")];
    const declaracoes = Array.from({ length: 61 }).map((_, i) => dec(`d${i}`, "a", "economia"));
    const eventos = [ev("ev1", "2025-12-01T00:00:00.000Z")];
    const eventoDeDeclaracao = new Map(declaracoes.map((d) => [d.id, "ev1"]));
    const { ok, errors } = auditarParidade({
      mode: "setup",
      candidatos,
      declaracoes,
      eventos,
      eventoDeDeclaracao,
    });
    expect(ok).toBe(false);
    expect(errors.some((e) => e.toLowerCase().includes("excesso"))).toBe(true);
  });
});

describe("auditarParidade — FK candidato_id resolve por slug (regressão id≠slug)", () => {
  // Reproduz o cenário de PRODUÇÃO: candidato tem id=ULID e slug distinto
  // (ex: data/candidatos/lula-luiz-inacio.yaml), e as declarações referenciam
  // o SLUG em candidato_id. O helper `cand` do bloco acima mascara o bug ao
  // forçar id===slug. Aqui id≠slug, como nos dados reais.
  const candComUlid = (slug: string, id: string): CandidatoYaml => ({ id, slug, nome: slug });
  const TEMAS = [
    "economia",
    "saude",
    "educacao",
    "seguranca-publica",
    "meio-ambiente",
    "politica-externa",
  ];

  it("piloto-mode: aceita 12 declarações quando candidato.id (ULID) ≠ candidato_id (slug)", () => {
    const candidatos = [
      candComUlid("lula-luiz-inacio", "01KSQDGYBHGRTNYGSMCMPAAKH4"),
      candComUlid("bolsonaro-flavio", "01KSQDGYBJK8N8YJAWXHXSPA33"),
    ];
    const declaracoes: DeclaracaoFrontmatter[] = [];
    let n = 0;
    for (const c of candidatos) {
      for (const t of TEMAS) {
        declaracoes.push(dec(`d${n++}`, c.slug, t)); // candidato_id = SLUG (como na produção)
      }
    }
    const eventos = [ev("ev1", "2025-12-01T00:00:00.000Z")];
    const eventoDeDeclaracao = new Map(declaracoes.map((d) => [d.id, "ev1"]));
    const { ok, errors } = auditarParidade({
      mode: "piloto",
      candidatos,
      declaracoes,
      eventos,
      eventoDeDeclaracao,
    });
    expect(errors).toEqual([]);
    expect(ok).toBe(true);
  });

  it("final-mode: aceita 60 declarações quando candidato.id (ULID) ≠ candidato_id (slug)", () => {
    const candidatos = [
      candComUlid("lula-luiz-inacio", "01KSQDGYBHGRTNYGSMCMPAAKH4"),
      candComUlid("bolsonaro-flavio", "01KSQDGYBJK8N8YJAWXHXSPA33"),
    ];
    const declaracoes: DeclaracaoFrontmatter[] = [];
    let n = 0;
    for (const c of candidatos) {
      for (const t of TEMAS) {
        for (let i = 0; i < 5; i++) {
          declaracoes.push(dec(`d${n++}`, c.slug, t));
        }
      }
    }
    const eventos = [ev("ev1", "2025-12-01T00:00:00.000Z")];
    const eventoDeDeclaracao = new Map(declaracoes.map((d) => [d.id, "ev1"]));
    const { ok, errors } = auditarParidade({
      mode: "final",
      candidatos,
      declaracoes,
      eventos,
      eventoDeDeclaracao,
    });
    expect(errors).toEqual([]);
    expect(ok).toBe(true);
  });
});
