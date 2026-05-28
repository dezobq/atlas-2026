import { describe, it, expect } from "vitest";
import { calcularDistribuicao } from "@/../scripts/audit-distribuicao";
import type { DeclaracaoFrontmatter } from "@/../scripts/lib/data-loaders";

const dec = (
  candidato: string,
  tipo: string,
  fonte: string,
  veredito = false,
): DeclaracaoFrontmatter => ({
  id: `id-${Math.random()}`,
  candidato_id: candidato,
  tema_principal: "economia",
  tipo_estrutural: [tipo],
  fonte_primaria_tipo: fonte,
  archive_url: "https://web.archive.org/x",
  ...(veredito ? { vereditos_externos: [{ veiculo: "Lupa" }] } : {}),
});

describe("calcularDistribuicao", () => {
  it("retorna 0% quando array vazio", () => {
    const r = calcularDistribuicao([]);
    expect(r.totalDeclaracoes).toBe(0);
    expect(r.percentComVereditoExterno).toBe(0);
  });

  it("calcula percentual de declarações com veredito externo", () => {
    const decs = [
      dec("a", "promessa", "youtube_oficial", true),
      dec("a", "promessa", "youtube_oficial", false),
      dec("a", "promessa", "youtube_oficial", false),
      dec("a", "promessa", "youtube_oficial", false),
    ];
    const r = calcularDistribuicao(decs);
    expect(r.percentComVereditoExterno).toBe(25);
  });

  it("conta tipos estruturais distintos por candidato", () => {
    const decs = [
      dec("a", "promessa", "youtube_oficial"),
      dec("a", "dado_numerico", "youtube_oficial"),
      dec("a", "promessa", "youtube_oficial"),
      dec("b", "compromisso_politico", "midia_consolidada"),
    ];
    const r = calcularDistribuicao(decs);
    expect(r.tiposPorCandidato.get("a")?.size).toBe(2);
    expect(r.tiposPorCandidato.get("b")?.size).toBe(1);
  });

  it("retorna distribuição de fonte_primaria_tipo", () => {
    const decs = [
      dec("a", "promessa", "youtube_oficial"),
      dec("a", "promessa", "midia_consolidada"),
      dec("a", "promessa", "midia_consolidada"),
      dec("a", "promessa", "rede_social_oficial"),
    ];
    const r = calcularDistribuicao(decs);
    expect(r.distribuicaoFonte.get("youtube_oficial")).toBe(25);
    expect(r.distribuicaoFonte.get("midia_consolidada")).toBe(50);
    expect(r.distribuicaoFonte.get("rede_social_oficial")).toBe(25);
  });
});
