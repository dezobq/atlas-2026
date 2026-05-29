import { describe, it, expect } from "vitest";
import { validarProveniencia } from "@/../scripts/validate-proveniencia";
import type {
  CamadaProv,
  Proveniencia,
  DeclaracaoFrontmatter,
} from "@/../scripts/lib/data-loaders";

const cam = (over: Partial<CamadaProv> = {}): CamadaProv => ({
  id: "C0_texto",
  camada: 0,
  origem: "whisper-large-v3",
  ancora: [],
  verificacao: "adversarial-3/3",
  ...over,
});

const prov = (over: Partial<Proveniencia> = {}): Proveniencia => ({
  metodo: "atlas-pipeline@1.4.0",
  fonte_ancora: "youtube:UCxxxx@00:14:32",
  camadas: [cam()],
  humano_revisou: [],
  gerado_em: "2026-05-29T12:00:00.000Z",
  ...over,
});

const dec = (over: Partial<DeclaracaoFrontmatter> = {}): DeclaracaoFrontmatter => ({
  id: "01HZQ001",
  candidato_id: "candidato-x",
  tema_principal: "economia",
  tipo_estrutural: ["promessa"],
  fonte_primaria_tipo: "youtube_oficial",
  archive_url: "https://web.archive.org/web/2026/exemplo",
  proveniencia: prov(),
  ...over,
});

describe("validarProveniencia", () => {
  it("aceita declaração com 1 camada C0 válida", () => {
    const result = validarProveniencia([dec()]);
    expect(result.errors).toEqual([]);
    expect(result.ok).toBe(true);
  });

  it("aceita C0 + C1 com C1 ancorada em C0", () => {
    const p = prov({
      camadas: [
        cam(),
        cam({
          id: "C1_contexto",
          camada: 1,
          origem: "claude-opus-4-8",
          ancora: ["C0_texto"],
          verificacao: "adversarial-2/3",
        }),
      ],
    });
    const result = validarProveniencia([dec({ proveniencia: p })]);
    expect(result.ok).toBe(true);
  });

  it("rejeita declaração SEM bloco proveniencia", () => {
    const d = dec();
    delete d.proveniencia;
    const result = validarProveniencia([d]);
    expect(result.ok).toBe(false);
    expect(result.errors.some((e) => e.includes("sem bloco"))).toBe(true);
  });

  it("rejeita proveniencia sem nenhuma camada C0", () => {
    const p = prov({
      camadas: [cam({ id: "C1_x", camada: 1, ancora: ["C0_texto"] })],
    });
    const result = validarProveniencia([dec({ proveniencia: p })]);
    expect(result.ok).toBe(false);
    expect(result.errors.some((e) => e.includes("camada 0") || e.includes("factual"))).toBe(true);
  });

  it("rejeita C0 que tem ancora", () => {
    const p = prov({ camadas: [cam({ ancora: ["C0_texto"] })] });
    const result = validarProveniencia([dec({ proveniencia: p })]);
    expect(result.ok).toBe(false);
    expect(result.errors.some((e) => e.includes("C0"))).toBe(true);
  });

  it("rejeita camada derivada SEM ancora", () => {
    const p = prov({
      camadas: [cam(), cam({ id: "C1_x", camada: 1, ancora: [] })],
    });
    const result = validarProveniencia([dec({ proveniencia: p })]);
    expect(result.ok).toBe(false);
    expect(result.errors.some((e) => e.includes("precisa de ancora"))).toBe(true);
  });

  it("rejeita ancora para id de camada inexistente", () => {
    const p = prov({
      camadas: [cam(), cam({ id: "C1_x", camada: 1, ancora: ["NAO_EXISTE"] })],
    });
    const result = validarProveniencia([dec({ proveniencia: p })]);
    expect(result.ok).toBe(false);
    expect(result.errors.some((e) => e.includes("NAO_EXISTE"))).toBe(true);
  });

  it("rejeita ancora em camada de índice superior (C1 ancora em C2)", () => {
    const p = prov({
      camadas: [
        cam(),
        cam({ id: "C2_s", camada: 2, ancora: ["C0_texto"] }),
        cam({ id: "C1_x", camada: 1, ancora: ["C2_s"] }),
      ],
    });
    const result = validarProveniencia([dec({ proveniencia: p })]);
    expect(result.ok).toBe(false);
    expect(result.errors.some((e) => e.includes("superior"))).toBe(true);
  });

  it("rejeita humano_revisou referenciando id inexistente", () => {
    const p = prov({ humano_revisou: ["NAO_EXISTE"] });
    const result = validarProveniencia([dec({ proveniencia: p })]);
    expect(result.ok).toBe(false);
    expect(result.errors.some((e) => e.includes("humano_revisou"))).toBe(true);
  });

  it("rejeita id de camada duplicado", () => {
    const p = prov({ camadas: [cam(), cam()] });
    const result = validarProveniencia([dec({ proveniencia: p })]);
    expect(result.ok).toBe(false);
    expect(result.errors.some((e) => e.includes("duplicado"))).toBe(true);
  });

  it("rejeita camada que ancora em si mesma (auto-âncora)", () => {
    const p = prov({
      camadas: [cam(), cam({ id: "C1_x", camada: 1, ancora: ["C1_x"] })],
    });
    const result = validarProveniencia([dec({ proveniencia: p })]);
    expect(result.ok).toBe(false);
    expect(result.errors.some((e) => e.includes("si mesma"))).toBe(true);
  });

  it("rejeita ancora entre camadas de mesmo nível (C1 ancora em outro C1)", () => {
    const p = prov({
      camadas: [
        cam(),
        cam({ id: "C1_a", camada: 1, ancora: ["C0_texto"] }),
        cam({ id: "C1_b", camada: 1, ancora: ["C1_a"] }),
      ],
    });
    const result = validarProveniencia([dec({ proveniencia: p })]);
    expect(result.ok).toBe(false);
    expect(result.errors.some((e) => e.includes("mesma camada"))).toBe(true);
  });

  it("não crasha quando arrays do bloco vêm ausentes no frontmatter cru", () => {
    const c1 = cam({ id: "C1_x", camada: 1 });
    delete (c1 as Partial<CamadaProv>).ancora;
    const p = prov({ camadas: [cam(), c1] });
    delete (p as Partial<Proveniencia>).humano_revisou;
    const result = validarProveniencia([dec({ proveniencia: p })]);
    expect(result.ok).toBe(false);
    expect(result.errors.some((e) => e.includes("precisa de ancora"))).toBe(true);
  });

  it("reporta (sem crashar) quando camadas vem com tipo errado", () => {
    const p = { ...prov(), camadas: "nope" } as unknown as Proveniencia;
    const result = validarProveniencia([dec({ proveniencia: p })]);
    expect(result.ok).toBe(false);
    expect(result.errors.some((e) => e.includes("camadas precisa ser um array"))).toBe(true);
  });

  it("reporta (sem crashar) quando humano_revisou presente vem com tipo errado", () => {
    const p = { ...prov(), humano_revisou: 1 } as unknown as Proveniencia;
    const result = validarProveniencia([dec({ proveniencia: p })]);
    expect(result.ok).toBe(false);
    expect(result.errors.some((e) => e.includes("humano_revisou precisa ser um array"))).toBe(true);
  });
});
