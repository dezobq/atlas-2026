import { describe, it, expect } from "vitest";
import { validarLog } from "@/../scripts/validate-log";
import type { DeclaracaoFrontmatter, LogLine } from "@/../scripts/lib/data-loaders";

const dec = (over: Partial<DeclaracaoFrontmatter> = {}): DeclaracaoFrontmatter => ({
  id: "01HZQ001",
  candidato_id: "candidato-x",
  tema_principal: "economia",
  tipo_estrutural: ["promessa"],
  fonte_primaria_tipo: "youtube_oficial",
  archive_url: "https://web.archive.org/web/2026/exemplo",
  ...over,
});

const log = (over: Partial<LogLine> = {}): LogLine => ({
  declaracao_id: "01HZQ001",
  candidato_id: "candidato-x",
  tema: "economia",
  tipo_estrutural: "promessa",
  fonte_tipo: "youtube_oficial",
  tem_veredito_externo: "false",
  motivo_inclusao: "cascata-1: única promessa de imposto na janela",
  curador: "Claude+André",
  validador: "André",
  data_inclusao: "2026-06-03T14:22:00-03:00",
  ...over,
});

describe("validarLog", () => {
  it("aceita FK match perfeito (1 declaração / 1 linha)", () => {
    const result = validarLog([dec()], [log()]);
    expect(result.errors).toEqual([]);
    expect(result.ok).toBe(true);
  });

  it("detecta log com declaracao_id que não existe em declarações", () => {
    const result = validarLog([dec()], [log({ declaracao_id: "01HZQ999" })]);
    expect(result.ok).toBe(false);
    expect(result.errors.some((e) => e.includes("01HZQ999"))).toBe(true);
  });

  it("detecta declaração sem entrada no log", () => {
    const result = validarLog([dec(), dec({ id: "01HZQ002" })], [log()]);
    expect(result.ok).toBe(false);
    expect(result.errors.some((e) => e.includes("01HZQ002"))).toBe(true);
  });

  it("detecta duplicidade no log (2 linhas para mesma declaracao_id)", () => {
    const result = validarLog([dec()], [log(), log()]);
    expect(result.ok).toBe(false);
    expect(result.errors.some((e) => e.includes("duplicada"))).toBe(true);
  });

  it("rejeita motivo_inclusao sem prefixo cascata-N:", () => {
    const result = validarLog([dec()], [log({ motivo_inclusao: "achei relevante" })]);
    expect(result.ok).toBe(false);
    expect(result.errors.some((e) => e.includes("cascata-"))).toBe(true);
  });

  it("rejeita tema fora do enum válido", () => {
    const result = validarLog([dec()], [log({ tema: "esportes" })]);
    expect(result.ok).toBe(false);
    expect(result.errors.some((e) => e.includes("tema"))).toBe(true);
  });

  it("rejeita tipo_estrutural fora do enum", () => {
    const result = validarLog([dec()], [log({ tipo_estrutural: "fofoca" })]);
    expect(result.ok).toBe(false);
    expect(result.errors.some((e) => e.includes("tipo_estrutural"))).toBe(true);
  });

  it("rejeita fonte_tipo fora do enum", () => {
    const result = validarLog([dec()], [log({ fonte_tipo: "boato_rua" })]);
    expect(result.ok).toBe(false);
    expect(result.errors.some((e) => e.includes("fonte_tipo"))).toBe(true);
  });
});
