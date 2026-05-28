# Card Visual de Declarações — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** gerar PNG estático em 4 formatos (1200×630, 1080×1350, 1080×1920, 1200×1200) por declaração com cascata de vereditos atribuída ao fact-checker (não ao Atlas), QR code e UI de download/copy/share em `/declaracoes/[id]`.

**Architecture:** funções puras testáveis em `src/lib/cards/` orquestradas por `scripts/generate-cards.ts` que renderiza Satori → SVG → PNG via `@resvg/resvg-js`. Componente Astro `CardActions.astro` fornece 3 botões de interação. Build-time idempotente com cache por hash do conteúdo da declaração.

**Tech Stack:** Astro 5 · TypeScript · Vitest · Satori 0.26 · @resvg/resvg-js 2.6 · qrcode (a instalar) · Geist Sans (Regular + Medium em `assets/fonts/`).

**Specs e decisões pai:**

- Spec: `docs/superpowers/specs/2026-05-28-card-visual-declaracoes-design.md`
- Decisão de produto: `Vault/Decisoes/I4-Compartilhabilidade.md`
- Audiência: `Vault/Decisoes/Audiencia-Primaria.md`
- Postura editorial (não emitir veredito): `Vault/Decisoes/Sem-Veredito-Proprio.md`

---

## File Structure

**Criar:**

- `src/lib/cards/fact-checker-palette.ts` — paleta de cores dos veículos do enum `veiculoVeredito`
- `src/lib/cards/typography-scale.ts` — escala dinâmica 3 faixas por comprimento × multiplicador por formato
- `src/lib/cards/truncate.ts` — truncamento com "…" preservando última palavra completa
- `src/lib/cards/format-config.ts` — config dos 4 formatos (dimensões + multiplicador)
- `src/lib/cards/order-vereditos.ts` — ordenação alfabética + limite 3 com bias para classificação útil
- `src/lib/cards/generate-qr.ts` — wrapper de `qrcode` retornando SVG string
- `src/lib/cards/card-template.ts` — objeto JSX representativo (compatível com Satori) para renderização
- `src/lib/cards/generate-card.ts` — orquestrador: dado declaração + formato, retorna PNG Buffer
- `scripts/generate-cards.ts` — CLI build-time que itera declarações e gera 4 cards por id
- `src/components/declaracoes/CardActions.astro` — UI com 3 botões (Baixar / Copiar link / Compartilhar)

**Modificar:**

- `src/pages/declaracoes/[id].astro` — incluir `<CardActions />`
- `package.json` — adicionar script `generate:cards` e estender `build:full`

**Testar:**

- `tests/unit/cards/fact-checker-palette.test.ts`
- `tests/unit/cards/typography-scale.test.ts`
- `tests/unit/cards/truncate.test.ts`
- `tests/unit/cards/format-config.test.ts`
- `tests/unit/cards/order-vereditos.test.ts`
- `tests/unit/cards/generate-qr.test.ts`
- `tests/unit/cards/card-template.test.ts`
- `tests/integration/cards/generate-card.test.ts`

---

## Task 1: Paleta de cores dos fact-checkers

**Files:**

- Create: `src/lib/cards/fact-checker-palette.ts`
- Test: `tests/unit/cards/fact-checker-palette.test.ts`

- [ ] **Step 1: Write the failing test**

```typescript
// tests/unit/cards/fact-checker-palette.test.ts
import { describe, it, expect } from "vitest";
import { factCheckerColor, FALLBACK_COLOR } from "@/lib/cards/fact-checker-palette";

describe("factCheckerColor", () => {
  it("retorna cor da marca para cada veiculo do enum", () => {
    expect(factCheckerColor("Lupa")).toBe("#E20E0E");
    expect(factCheckerColor("Aos Fatos")).toBe("#1A9E5E");
    expect(factCheckerColor("Comprova")).toBe("#1E5AAF");
    expect(factCheckerColor("Estadão Verifica")).toBe("#3F3F3F");
    expect(factCheckerColor("Agência Pública")).toBe("#E67E22");
    expect(factCheckerColor("BBC Verify")).toBe("#B40000");
  });

  it("retorna fallback cinza neutro para 'outro'", () => {
    expect(factCheckerColor("outro")).toBe(FALLBACK_COLOR);
    expect(FALLBACK_COLOR).toBe("#737373");
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

```powershell
pnpm test -- tests/unit/cards/fact-checker-palette.test.ts
```

Expected: FAIL com `Cannot find module '@/lib/cards/fact-checker-palette'`.

- [ ] **Step 3: Write minimal implementation**

```typescript
// src/lib/cards/fact-checker-palette.ts
export const FALLBACK_COLOR = "#737373";

const PALETTE: Record<string, string> = {
  Lupa: "#E20E0E",
  "Aos Fatos": "#1A9E5E",
  Comprova: "#1E5AAF",
  "Estadão Verifica": "#3F3F3F",
  "Agência Pública": "#E67E22",
  "BBC Verify": "#B40000",
};

export function factCheckerColor(veiculo: string): string {
  return PALETTE[veiculo] ?? FALLBACK_COLOR;
}
```

- [ ] **Step 4: Run test to verify it passes**

```powershell
pnpm test -- tests/unit/cards/fact-checker-palette.test.ts
```

Expected: PASS — 2 tests pass.

- [ ] **Step 5: Commit**

```powershell
git add src/lib/cards/fact-checker-palette.ts tests/unit/cards/fact-checker-palette.test.ts
git commit -m "feat(cards): adicionar paleta de cores por fact-checker"
```

---

## Task 2: Escala dinâmica de tipografia

**Files:**

- Create: `src/lib/cards/typography-scale.ts`
- Test: `tests/unit/cards/typography-scale.test.ts`

- [ ] **Step 1: Write the failing test**

```typescript
// tests/unit/cards/typography-scale.test.ts
import { describe, it, expect } from "vitest";
import { titleFontSize } from "@/lib/cards/typography-scale";

describe("titleFontSize", () => {
  it("usa 72pt para declaração curta (≤120 chars)", () => {
    expect(titleFontSize(50, 1)).toBe(72);
    expect(titleFontSize(120, 1)).toBe(72);
  });

  it("usa 54pt para declaração média (120-300 chars)", () => {
    expect(titleFontSize(121, 1)).toBe(54);
    expect(titleFontSize(300, 1)).toBe(54);
  });

  it("usa 40pt para declaração longa (>300 chars)", () => {
    expect(titleFontSize(301, 1)).toBe(40);
    expect(titleFontSize(800, 1)).toBe(40);
  });

  it("aplica multiplicador do formato", () => {
    expect(titleFontSize(50, 0.9)).toBe(64.8);
    expect(titleFontSize(50, 0.95)).toBe(68.4);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

```powershell
pnpm test -- tests/unit/cards/typography-scale.test.ts
```

Expected: FAIL com `Cannot find module '@/lib/cards/typography-scale'`.

- [ ] **Step 3: Write minimal implementation**

```typescript
// src/lib/cards/typography-scale.ts
export function titleFontSize(declarationLength: number, multiplier: number): number {
  let base: number;
  if (declarationLength <= 120) base = 72;
  else if (declarationLength <= 300) base = 54;
  else base = 40;
  return base * multiplier;
}
```

- [ ] **Step 4: Run test to verify it passes**

```powershell
pnpm test -- tests/unit/cards/typography-scale.test.ts
```

Expected: PASS — 4 tests pass.

- [ ] **Step 5: Commit**

```powershell
git add src/lib/cards/typography-scale.ts tests/unit/cards/typography-scale.test.ts
git commit -m "feat(cards): adicionar escala dinâmica de tipografia em 3 faixas"
```

---

## Task 3: Truncamento de declaração

**Files:**

- Create: `src/lib/cards/truncate.ts`
- Test: `tests/unit/cards/truncate.test.ts`

- [ ] **Step 1: Write the failing test**

```typescript
// tests/unit/cards/truncate.test.ts
import { describe, it, expect } from "vitest";
import { truncateDeclaracao } from "@/lib/cards/truncate";

describe("truncateDeclaracao", () => {
  it("retorna texto integral se ≤ maxLength", () => {
    expect(truncateDeclaracao("texto curto", 280)).toBe("texto curto");
  });

  it("trunca em maxLength sem cortar palavra", () => {
    const long =
      "Lorem ipsum dolor sit amet consectetur adipiscing elit sed do eiusmod tempor".repeat(5);
    const result = truncateDeclaracao(long, 50);
    expect(result.length).toBeLessThanOrEqual(51);
    expect(result.endsWith("…")).toBe(true);
    expect(result).not.toMatch(/\w…$/);
  });

  it("usa 280 chars como default", () => {
    const long = "x".repeat(500);
    const result = truncateDeclaracao(long);
    expect(result.length).toBeLessThanOrEqual(281);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

```powershell
pnpm test -- tests/unit/cards/truncate.test.ts
```

Expected: FAIL com `Cannot find module '@/lib/cards/truncate'`.

- [ ] **Step 3: Write minimal implementation**

```typescript
// src/lib/cards/truncate.ts
export function truncateDeclaracao(text: string, maxLength = 280): string {
  if (text.length <= maxLength) return text;
  const cut = text.slice(0, maxLength);
  if (text[maxLength] === " ") return cut + "…";
  const lastSpace = cut.lastIndexOf(" ");
  return (lastSpace > 0 ? cut.slice(0, lastSpace) : cut) + "…";
}
```

- [ ] **Step 4: Run test to verify it passes**

```powershell
pnpm test -- tests/unit/cards/truncate.test.ts
```

Expected: PASS — 3 tests pass.

- [ ] **Step 5: Commit**

```powershell
git add src/lib/cards/truncate.ts tests/unit/cards/truncate.test.ts
git commit -m "feat(cards): adicionar truncamento com preservação de palavra"
```

---

## Task 4: Configuração de formatos

**Files:**

- Create: `src/lib/cards/format-config.ts`
- Test: `tests/unit/cards/format-config.test.ts`

- [ ] **Step 1: Write the failing test**

```typescript
// tests/unit/cards/format-config.test.ts
import { describe, it, expect } from "vitest";
import { CARD_FORMATS, type CardFormat } from "@/lib/cards/format-config";

describe("CARD_FORMATS", () => {
  it("define os 4 formatos com dimensões e multiplicadores", () => {
    expect(CARD_FORMATS["1200x630"]).toEqual({ width: 1200, height: 630, multiplier: 1.0 });
    expect(CARD_FORMATS["1200x1200"]).toEqual({ width: 1200, height: 1200, multiplier: 1.0 });
    expect(CARD_FORMATS["1080x1350"]).toEqual({ width: 1080, height: 1350, multiplier: 0.95 });
    expect(CARD_FORMATS["1080x1920"]).toEqual({ width: 1080, height: 1920, multiplier: 0.9 });
  });

  it("expõe lista de chaves para iteração", () => {
    const keys = Object.keys(CARD_FORMATS) as CardFormat[];
    expect(keys).toHaveLength(4);
    expect(keys).toContain("1200x630");
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

```powershell
pnpm test -- tests/unit/cards/format-config.test.ts
```

Expected: FAIL.

- [ ] **Step 3: Write minimal implementation**

```typescript
// src/lib/cards/format-config.ts
export type CardFormat = "1200x630" | "1200x1200" | "1080x1350" | "1080x1920";

export interface FormatSpec {
  width: number;
  height: number;
  multiplier: number;
}

export const CARD_FORMATS: Record<CardFormat, FormatSpec> = {
  "1200x630": { width: 1200, height: 630, multiplier: 1.0 },
  "1200x1200": { width: 1200, height: 1200, multiplier: 1.0 },
  "1080x1350": { width: 1080, height: 1350, multiplier: 0.95 },
  "1080x1920": { width: 1080, height: 1920, multiplier: 0.9 },
};
```

- [ ] **Step 4: Run test to verify it passes**

```powershell
pnpm test -- tests/unit/cards/format-config.test.ts
```

Expected: PASS — 2 tests pass.

- [ ] **Step 5: Commit**

```powershell
git add src/lib/cards/format-config.ts tests/unit/cards/format-config.test.ts
git commit -m "feat(cards): adicionar configuração dos 4 formatos do card"
```

---

## Task 5: Ordenação + limite de vereditos

**Files:**

- Create: `src/lib/cards/order-vereditos.ts`
- Test: `tests/unit/cards/order-vereditos.test.ts`

- [ ] **Step 1: Write the failing test**

```typescript
// tests/unit/cards/order-vereditos.test.ts
import { describe, it, expect } from "vitest";
import { orderVereditos, type VereditoInput } from "@/lib/cards/order-vereditos";

const v = (veiculo: string, classificacao: string): VereditoInput => ({
  veiculo,
  classificacao,
  url: "https://x",
  data: "2026-04-15T00:00:00Z",
  citacao_curta: "x",
});

describe("orderVereditos", () => {
  it("ordena alfabeticamente por veículo", () => {
    const input = [v("Lupa", "falso"), v("Aos Fatos", "distorce"), v("Comprova", "verdadeiro")];
    const result = orderVereditos(input);
    expect(result.map((x) => x.veiculo)).toEqual(["Aos Fatos", "Comprova", "Lupa"]);
  });

  it("limita a 3 vereditos com bias para classificação útil", () => {
    const input = [
      v("Aos Fatos", "sem registro"),
      v("Comprova", "distorce"),
      v("Lupa", "falso"),
      v("Estadão Verifica", "verdadeiro"),
    ];
    const result = orderVereditos(input);
    expect(result).toHaveLength(3);
    expect(result.map((x) => x.veiculo)).not.toContain("Aos Fatos");
  });

  it("retorna array vazio para input vazio", () => {
    expect(orderVereditos([])).toEqual([]);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

```powershell
pnpm test -- tests/unit/cards/order-vereditos.test.ts
```

Expected: FAIL.

- [ ] **Step 3: Write minimal implementation**

```typescript
// src/lib/cards/order-vereditos.ts
export interface VereditoInput {
  veiculo: string;
  classificacao: string;
  url: string;
  data: string;
  citacao_curta: string;
}

const SEM_REGISTRO_RE = /sem\s+registro/i;

export function orderVereditos(vereditos: VereditoInput[]): VereditoInput[] {
  if (vereditos.length === 0) return [];
  const useful = vereditos.filter((v) => !SEM_REGISTRO_RE.test(v.classificacao));
  const semRegistro = vereditos.filter((v) => SEM_REGISTRO_RE.test(v.classificacao));
  const prioritized = [...useful, ...semRegistro];
  return prioritized.slice(0, 3).sort((a, b) => a.veiculo.localeCompare(b.veiculo, "pt-BR"));
}
```

- [ ] **Step 4: Run test to verify it passes**

```powershell
pnpm test -- tests/unit/cards/order-vereditos.test.ts
```

Expected: PASS — 3 tests pass.

- [ ] **Step 5: Commit**

```powershell
git add src/lib/cards/order-vereditos.ts tests/unit/cards/order-vereditos.test.ts
git commit -m "feat(cards): adicionar ordenação alfabética e limite de 3 vereditos"
```

---

## Task 6: Wrapper de QR code

**Files:**

- Create: `src/lib/cards/generate-qr.ts`
- Test: `tests/unit/cards/generate-qr.test.ts`
- Modify: `package.json` (adicionar dependência `qrcode` e `@types/qrcode`)

- [ ] **Step 1: Install dependency**

```powershell
pnpm add qrcode
pnpm add -D @types/qrcode
```

Expected: `qrcode` added to dependencies; `@types/qrcode` added to devDependencies in `package.json`.

- [ ] **Step 2: Write the failing test**

```typescript
// tests/unit/cards/generate-qr.test.ts
import { describe, it, expect } from "vitest";
import { generateQrSvg } from "@/lib/cards/generate-qr";

describe("generateQrSvg", () => {
  it("gera string SVG não-vazia para URL", async () => {
    const svg = await generateQrSvg("https://atlas-2026.pages.dev/declaracoes/test");
    expect(svg).toMatch(/^<svg/);
    expect(svg).toContain("</svg>");
    expect(svg.length).toBeGreaterThan(100);
  });

  it("respeita opção de largura", async () => {
    const svg = await generateQrSvg("https://atlas-2026.pages.dev/", { width: 120 });
    expect(svg).toContain('width="120"');
  });
});
```

- [ ] **Step 3: Run test to verify it fails**

```powershell
pnpm test -- tests/unit/cards/generate-qr.test.ts
```

Expected: FAIL com `Cannot find module '@/lib/cards/generate-qr'`.

- [ ] **Step 4: Write minimal implementation**

```typescript
// src/lib/cards/generate-qr.ts
import QRCode from "qrcode";

export interface QrOptions {
  width?: number;
}

export async function generateQrSvg(url: string, options: QrOptions = {}): Promise<string> {
  const width = options.width ?? 120;
  return QRCode.toString(url, {
    type: "svg",
    width,
    margin: 0,
    errorCorrectionLevel: "M",
    color: { dark: "#0A0A0A", light: "#FAFAFA" },
  });
}
```

- [ ] **Step 5: Run test to verify it passes**

```powershell
pnpm test -- tests/unit/cards/generate-qr.test.ts
```

Expected: PASS — 2 tests pass.

- [ ] **Step 6: Commit**

```powershell
git add src/lib/cards/generate-qr.ts tests/unit/cards/generate-qr.test.ts package.json pnpm-lock.yaml
git commit -m "feat(cards): adicionar wrapper de QR code via qrcode library"
```

---

## Task 7: Template do card (objeto Satori)

**Files:**

- Create: `src/lib/cards/card-template.ts`
- Test: `tests/unit/cards/card-template.test.ts`

- [ ] **Step 1: Write the failing test**

```typescript
// tests/unit/cards/card-template.test.ts
import { describe, it, expect } from "vitest";
import { buildCardTemplate, type CardData } from "@/lib/cards/card-template";

const data: CardData = {
  declaracao: "Teste de declaração curta",
  candidato: "Candidato X",
  data: "12/04/2026",
  evento: "Evento Y",
  vereditos: [
    { veiculo: "Lupa", classificacao: "parcialmente falso" },
    { veiculo: "Aos Fatos", classificacao: "distorce" },
  ],
  url: "https://atlas-2026.pages.dev/declaracoes/test",
  qrSvg: "<svg></svg>",
};

describe("buildCardTemplate", () => {
  it("retorna objeto Satori-compatível com width e height do formato", () => {
    const tpl = buildCardTemplate(data, "1200x630");
    expect(tpl.type).toBe("div");
    expect(tpl.props.style.width).toBe(1200);
    expect(tpl.props.style.height).toBe(630);
  });

  it("inclui declaração no markup", () => {
    const tpl = buildCardTemplate(data, "1200x630");
    const serialized = JSON.stringify(tpl);
    expect(serialized).toContain("Teste de declaração curta");
    expect(serialized).toContain("Candidato X");
    expect(serialized).toContain("Lupa");
    expect(serialized).toContain("Aos Fatos");
  });

  it("inclui rodapé de não-veredito sempre", () => {
    const tpl = buildCardTemplate(data, "1080x1920");
    const serialized = JSON.stringify(tpl);
    expect(serialized).toContain("Não emite veredito");
    expect(serialized).toContain("CC-BY 4.0");
  });

  it("mostra mensagem alternativa quando vereditos vazios", () => {
    const tpl = buildCardTemplate({ ...data, vereditos: [] }, "1200x630");
    const serialized = JSON.stringify(tpl);
    expect(serialized).toContain("Sem veredito de fact-checker reconhecido");
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

```powershell
pnpm test -- tests/unit/cards/card-template.test.ts
```

Expected: FAIL.

- [ ] **Step 3: Write minimal implementation**

```typescript
// src/lib/cards/card-template.ts
import { CARD_FORMATS, type CardFormat } from "./format-config";
import { factCheckerColor } from "./fact-checker-palette";
import { titleFontSize } from "./typography-scale";
import { truncateDeclaracao } from "./truncate";

export interface VereditoSimple {
  veiculo: string;
  classificacao: string;
}

export interface CardData {
  declaracao: string;
  candidato: string;
  data: string;
  evento: string;
  vereditos: VereditoSimple[];
  url: string;
  qrSvg: string;
}

const BG = "#FAFAFA";
const TEXT_PRIMARY = "#0A0A0A";
const TEXT_SECONDARY = "#525252";
const DIVIDER = "#E5E5E5";
const ATLAS_MARK = "#171717";

export function buildCardTemplate(
  data: CardData,
  format: CardFormat,
): { type: string; props: Record<string, unknown> } {
  const cfg = CARD_FORMATS[format];
  const declarationTrimmed = truncateDeclaracao(data.declaracao);
  const titleSize = titleFontSize(declarationTrimmed.length, cfg.multiplier);
  const isVertical = cfg.height > cfg.width;
  const padding = isVertical ? 60 : 80;

  return {
    type: "div",
    props: {
      style: {
        width: cfg.width,
        height: cfg.height,
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        backgroundColor: BG,
        padding,
        fontFamily: "Geist",
        color: TEXT_PRIMARY,
      },
      children: [
        wordmark(),
        body(declarationTrimmed, titleSize, data),
        vereditosBlock(data.vereditos, cfg.multiplier),
        footer(data.url, data.qrSvg, cfg.multiplier),
      ],
    },
  };
}

function wordmark() {
  return {
    type: "div",
    props: {
      style: {
        display: "flex",
        flexDirection: "column",
        borderBottom: `1px solid ${DIVIDER}`,
        paddingBottom: 12,
      },
      children: {
        type: "span",
        props: {
          style: { fontSize: 24, fontWeight: 500, color: ATLAS_MARK },
          children: "Atlas dos Candidatos · 2026",
        },
      },
    },
  };
}

function body(declaracao: string, fontSize: number, data: CardData) {
  return {
    type: "div",
    props: {
      style: {
        display: "flex",
        flexDirection: "column",
        gap: 24,
        flex: 1,
        justifyContent: "center",
      },
      children: [
        {
          type: "div",
          props: {
            style: { fontSize, fontWeight: 500, lineHeight: 1.2, color: TEXT_PRIMARY },
            children: `"${declaracao}"`,
          },
        },
        {
          type: "div",
          props: {
            style: { fontSize: 22, fontWeight: 400, color: TEXT_SECONDARY },
            children: `— ${data.candidato} · ${data.data} · ${data.evento}`,
          },
        },
      ],
    },
  };
}

function vereditosBlock(vereditos: VereditoSimple[], multiplier: number) {
  if (vereditos.length === 0) {
    return {
      type: "div",
      props: {
        style: { fontSize: 22 * multiplier, color: TEXT_SECONDARY, fontWeight: 400 },
        children: `Sem veredito de fact-checker reconhecido até ${new Date().toLocaleDateString("pt-BR")}`,
      },
    };
  }

  return {
    type: "div",
    props: {
      style: { display: "flex", flexDirection: "column", gap: 8 },
      children: vereditos.map((v) => ({
        type: "div",
        props: {
          style: {
            display: "flex",
            alignItems: "center",
            gap: 16,
            borderLeft: `4px solid ${factCheckerColor(v.veiculo)}`,
            paddingLeft: 16,
            fontSize: 24 * multiplier,
          },
          children: [
            {
              type: "span",
              props: {
                style: {
                  color: factCheckerColor(v.veiculo),
                  fontSize: 28 * multiplier,
                  fontWeight: 500,
                },
                children: "●",
              },
            },
            {
              type: "span",
              props: { style: { fontWeight: 500, color: TEXT_PRIMARY }, children: v.veiculo },
            },
            {
              type: "span",
              props: {
                style: { fontWeight: 400, color: TEXT_SECONDARY },
                children: v.classificacao,
              },
            },
          ],
        },
      })),
    },
  };
}

function footer(url: string, qrSvg: string, multiplier: number) {
  return {
    type: "div",
    props: {
      style: { display: "flex", justifyContent: "space-between", alignItems: "flex-end" },
      children: [
        {
          type: "div",
          props: {
            style: { display: "flex", flexDirection: "column", gap: 8 },
            children: [
              {
                type: "span",
                props: {
                  style: { fontSize: 20 * multiplier, fontWeight: 500, color: TEXT_PRIMARY },
                  children: url.replace(/^https?:\/\//, ""),
                },
              },
              {
                type: "span",
                props: {
                  style: { fontSize: 18 * multiplier, color: TEXT_SECONDARY },
                  children: "Atlas dos Candidatos · 2026 · Não emite veredito · CC-BY 4.0",
                },
              },
            ],
          },
        },
        {
          type: "img",
          props: {
            src: `data:image/svg+xml;base64,${Buffer.from(qrSvg).toString("base64")}`,
            width: 120,
            height: 120,
          },
        },
      ],
    },
  };
}
```

- [ ] **Step 4: Run test to verify it passes**

```powershell
pnpm test -- tests/unit/cards/card-template.test.ts
```

Expected: PASS — 4 tests pass.

- [ ] **Step 5: Commit**

```powershell
git add src/lib/cards/card-template.ts tests/unit/cards/card-template.test.ts
git commit -m "feat(cards): adicionar template Satori do card visual"
```

---

## Task 8: Função `generateCard` (orquestrador Satori + Resvg)

**Files:**

- Create: `src/lib/cards/generate-card.ts`
- Test: `tests/integration/cards/generate-card.test.ts`

- [ ] **Step 1: Write the failing test**

```typescript
// tests/integration/cards/generate-card.test.ts
import { describe, it, expect } from "vitest";
import { generateCard } from "@/lib/cards/generate-card";
import type { CardData } from "@/lib/cards/card-template";

const sampleData: CardData = {
  declaracao: "Declaração mock para teste de geração de card visual.",
  candidato: "Candidato Teste",
  data: "12/04/2026",
  evento: "Evento Mock",
  vereditos: [{ veiculo: "Lupa", classificacao: "parcialmente falso" }],
  url: "https://atlas-2026.pages.dev/declaracoes/test",
  qrSvg: '<svg width="120" height="120"><rect width="120" height="120" fill="#0A0A0A"/></svg>',
};

describe("generateCard (integration)", () => {
  it("retorna PNG Buffer com dimensões corretas para 1200x630", async () => {
    const buffer = await generateCard(sampleData, "1200x630");
    expect(buffer).toBeInstanceOf(Buffer);
    // Header PNG: bytes 0-7 são "89 50 4E 47 0D 0A 1A 0A"
    expect(buffer[0]).toBe(0x89);
    expect(buffer[1]).toBe(0x50);
    expect(buffer[2]).toBe(0x4e);
    expect(buffer[3]).toBe(0x47);
    // Largura (bytes 16-19, big-endian)
    const width = buffer.readUInt32BE(16);
    const height = buffer.readUInt32BE(20);
    expect(width).toBe(1200);
    expect(height).toBe(630);
  }, 30000);
});
```

- [ ] **Step 2: Run test to verify it fails**

```powershell
pnpm test -- tests/integration/cards/generate-card.test.ts
```

Expected: FAIL com `Cannot find module '@/lib/cards/generate-card'`.

- [ ] **Step 3: Write minimal implementation**

```typescript
// src/lib/cards/generate-card.ts
import { readFileSync } from "node:fs";
import { join } from "node:path";
import satori from "satori";
import { Resvg } from "@resvg/resvg-js";
import { CARD_FORMATS, type CardFormat } from "./format-config";
import { buildCardTemplate, type CardData } from "./card-template";

const FONTS_DIR = join(process.cwd(), "assets", "fonts");
const FONT_REGULAR = readFileSync(join(FONTS_DIR, "Geist-Regular.ttf"));
const FONT_MEDIUM = readFileSync(join(FONTS_DIR, "Geist-Medium.ttf"));

export async function generateCard(data: CardData, format: CardFormat): Promise<Buffer> {
  const cfg = CARD_FORMATS[format];
  const tpl = buildCardTemplate(data, format);
  const svg = await satori(tpl as never, {
    width: cfg.width,
    height: cfg.height,
    fonts: [
      { name: "Geist", data: FONT_REGULAR, weight: 400, style: "normal" },
      { name: "Geist", data: FONT_MEDIUM, weight: 500, style: "normal" },
    ],
  });
  const resvg = new Resvg(svg, { fitTo: { mode: "width", value: cfg.width } });
  return resvg.render().asPng();
}
```

- [ ] **Step 4: Run test to verify it passes**

```powershell
pnpm test -- tests/integration/cards/generate-card.test.ts
```

Expected: PASS — 1 test passa em ~5-15 segundos (renderização real).

- [ ] **Step 5: Commit**

```powershell
git add src/lib/cards/generate-card.ts tests/integration/cards/generate-card.test.ts
git commit -m "feat(cards): adicionar orquestrador generate-card via Satori + Resvg"
```

---

## Task 9: Script CLI `generate-cards.ts`

**Files:**

- Create: `scripts/generate-cards.ts`
- Modify: `package.json` (adicionar `"generate:cards": "tsx scripts/generate-cards.ts"`)

- [ ] **Step 1: Write the script**

```typescript
// scripts/generate-cards.ts
import { readdirSync, readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import { createHash } from "node:crypto";
import { join, basename, extname } from "node:path";
import { pathToFileURL } from "node:url";
import matter from "gray-matter";
import { generateCard } from "../src/lib/cards/generate-card";
import { generateQrSvg } from "../src/lib/cards/generate-qr";
import { CARD_FORMATS, type CardFormat } from "../src/lib/cards/format-config";
import { orderVereditos } from "../src/lib/cards/order-vereditos";
import { logger } from "./lib/logger";

const DECLARACOES_DIR = join(process.cwd(), "data", "declaracoes");
const CARDS_DIR = join(process.cwd(), "public", "cards");
const TEMPLATE_VERSION = "v1.0.0";

interface DeclaracaoFrontmatter {
  id: string;
  texto: string;
  candidato_id: string;
  evento_id?: string;
  criado_em: string;
  vereditos_externos?: Array<{
    veiculo: string;
    classificacao: string;
    url: string;
    data: string;
    citacao_curta: string;
  }>;
}

function contentHash(fm: DeclaracaoFrontmatter): string {
  const payload = JSON.stringify({ ...fm, _tpl: TEMPLATE_VERSION });
  return createHash("sha256").update(payload).digest("hex").slice(0, 12);
}

async function main(): Promise<void> {
  if (!existsSync(DECLARACOES_DIR)) {
    logger.warn(`Sem declarações em ${DECLARACOES_DIR}; nada a gerar.`);
    return;
  }
  const files = readdirSync(DECLARACOES_DIR).filter((f) => extname(f) === ".md");
  logger.info(`Encontradas ${files.length} declarações.`);

  for (const file of files) {
    const id = basename(file, ".md");
    const raw = readFileSync(join(DECLARACOES_DIR, file), "utf-8");
    const { data } = matter(raw);
    const fm = data as DeclaracaoFrontmatter;
    const hash = contentHash(fm);
    const outDir = join(CARDS_DIR, id);
    const hashFile = join(outDir, `.hash-${hash}`);

    if (existsSync(hashFile)) {
      logger.debug(`[skip] ${id} (cache hit)`);
      continue;
    }

    mkdirSync(outDir, { recursive: true });
    const url = `https://atlas-2026.pages.dev/declaracoes/${id}`;
    const qrSvg = await generateQrSvg(url, { width: 120 });
    const vereditos = orderVereditos(fm.vereditos_externos ?? []).map((v) => ({
      veiculo: v.veiculo,
      classificacao: v.classificacao,
    }));
    const cardData = {
      declaracao: fm.texto,
      candidato: fm.candidato_id,
      data: new Date(fm.criado_em).toLocaleDateString("pt-BR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      }),
      evento: fm.evento_id ?? "",
      vereditos,
      url,
      qrSvg,
    };

    for (const fmt of Object.keys(CARD_FORMATS) as CardFormat[]) {
      const out = join(outDir, `${fmt}.png`);
      const buf = await generateCard(cardData, fmt);
      writeFileSync(out, buf);
      logger.info(`[ok] ${id}/${fmt}.png`);
    }

    writeFileSync(hashFile, hash);
  }

  logger.info("✅ Cards gerados.");
}

const isMain = process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href;
if (isMain) {
  main().catch((err) => {
    logger.error("Erro:", err);
    process.exit(1);
  });
}
```

- [ ] **Step 2: Add script command to `package.json`**

Modify `package.json` scripts section, adding immediately after `"generate:og"`:

```json
"generate:cards": "tsx scripts/generate-cards.ts",
```

- [ ] **Step 3: Run the script manually**

```powershell
pnpm generate:cards
```

Expected: se `data/declaracoes/` está vazio (estado atual pré-Sprint 5.2), saída "Sem declarações... nada a gerar". Se houver declarações, gera 4 PNGs por id em `public/cards/<id>/`.

- [ ] **Step 4: Verify cache idempotency**

```powershell
pnpm generate:cards
```

Expected na segunda execução: para cada id, log `[skip] <id> (cache hit)`.

- [ ] **Step 5: Commit**

```powershell
git add scripts/generate-cards.ts package.json
git commit -m "feat(cards): adicionar script generate-cards.ts build-time idempotente"
```

---

## Task 10: Componente `CardActions.astro`

**Files:**

- Create: `src/components/declaracoes/CardActions.astro`
- Test: `tests/unit/components/declaracoes/CardActions.test.ts` (limitado — componentes Astro testáveis via grep no build)

- [ ] **Step 1: Write the component**

```astro
---
// src/components/declaracoes/CardActions.astro
import { CARD_FORMATS, type CardFormat } from "@/lib/cards/format-config";

interface Props {
  id: string;
  declaracao: string;
}

const { id, declaracao } = Astro.props;
const formats = Object.keys(CARD_FORMATS) as CardFormat[];
const labels: Record<CardFormat, string> = {
  "1200x630": "Twitter/X · WhatsApp · OG (1200×630)",
  "1080x1350": "Instagram Feed (1080×1350)",
  "1080x1920": "Stories / Reels (1080×1920)",
  "1200x1200": "LinkedIn / Threads (1200×1200)",
};

const shortText = declaracao.length > 80 ? declaracao.slice(0, 77) + "…" : declaracao;
const url = `https://atlas-2026.pages.dev/declaracoes/${id}`;
const shareText = encodeURIComponent(`"${shortText}" — veja vereditos em ${url}`);
---

<section class="card-actions" aria-label="Compartilhar declaração">
  <details class="card-actions__group">
    <summary class="card-actions__button">Baixar card</summary>
    <ul class="card-actions__menu">
      {
        formats.map((fmt) => (
          <li>
            <a href={`/cards/${id}/${fmt}.png`} download={`atlas-${id}-${fmt}.png`}>
              {labels[fmt]}
            </a>
          </li>
        ))
      }
    </ul>
  </details>

  <details class="card-actions__group">
    <summary class="card-actions__button">Copiar link da imagem</summary>
    <ul class="card-actions__menu">
      {
        formats.map((fmt) => (
          <li>
            <button
              type="button"
              data-copy-url={`https://atlas-2026.pages.dev/cards/${id}/${fmt}.png`}
            >
              {labels[fmt]}
            </button>
          </li>
        ))
      }
    </ul>
  </details>

  <details class="card-actions__group">
    <summary class="card-actions__button">Compartilhar</summary>
    <ul class="card-actions__menu">
      <li>
        <a href={`https://wa.me/?text=${shareText}`} target="_blank" rel="noopener">WhatsApp</a>
      </li>
      <li>
        <a
          href={`https://twitter.com/intent/tweet?text=${shareText}`}
          target="_blank"
          rel="noopener">Twitter/X</a>
      </li>
      <li>
        <a
          href={`https://www.threads.net/intent/post?text=${shareText}`}
          target="_blank"
          rel="noopener">Threads</a>
      </li>
      <li>
        <a
          href={`https://t.me/share/url?url=${encodeURIComponent(url)}&text=${shareText}`}
          target="_blank"
          rel="noopener">Telegram</a>
      </li>
    </ul>
  </details>
</section>

<script>
  document.querySelectorAll<HTMLButtonElement>("[data-copy-url]").forEach((btn) => {
    btn.addEventListener("click", async () => {
      const url = btn.dataset.copyUrl ?? "";
      await navigator.clipboard.writeText(url);
      const original = btn.textContent;
      btn.textContent = "Copiado!";
      setTimeout(() => {
        btn.textContent = original;
      }, 1500);
    });
  });
</script>

<style>
  .card-actions {
    display: flex;
    gap: 12px;
    flex-wrap: wrap;
    margin: 24px 0;
  }
  .card-actions__group {
    position: relative;
  }
  .card-actions__button {
    cursor: pointer;
    padding: 8px 16px;
    border: 1px solid #e5e5e5;
    border-radius: 6px;
    background: #fafafa;
    font-size: 14px;
    list-style: none;
  }
  .card-actions__menu {
    position: absolute;
    top: 100%;
    left: 0;
    min-width: 280px;
    margin: 4px 0 0;
    padding: 8px 0;
    background: #fff;
    border: 1px solid #e5e5e5;
    border-radius: 6px;
    list-style: none;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
    z-index: 10;
  }
  .card-actions__menu li {
    padding: 0;
  }
  .card-actions__menu a,
  .card-actions__menu button {
    display: block;
    width: 100%;
    padding: 8px 16px;
    text-align: left;
    background: none;
    border: none;
    font-size: 14px;
    color: #0a0a0a;
    cursor: pointer;
  }
  .card-actions__menu a:hover,
  .card-actions__menu button:hover {
    background: #f5f5f5;
  }
</style>
```

- [ ] **Step 2: Write smoke test verifying component file structure**

```typescript
// tests/unit/components/declaracoes/CardActions.test.ts
import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";

describe("CardActions.astro", () => {
  const source = readFileSync(
    join(process.cwd(), "src/components/declaracoes/CardActions.astro"),
    "utf-8",
  );

  it("declara as 3 áreas de ação (Baixar / Copiar / Compartilhar)", () => {
    expect(source).toContain("Baixar card");
    expect(source).toContain("Copiar link da imagem");
    expect(source).toContain("Compartilhar");
  });

  it("inclui intents nativas das 4 plataformas", () => {
    expect(source).toMatch(/wa\.me/);
    expect(source).toMatch(/twitter\.com\/intent/);
    expect(source).toMatch(/threads\.net\/intent/);
    expect(source).toMatch(/t\.me\/share/);
  });

  it("usa navigator.clipboard para copy", () => {
    expect(source).toContain("navigator.clipboard.writeText");
  });
});
```

- [ ] **Step 3: Run test**

```powershell
pnpm test -- tests/unit/components/declaracoes/CardActions.test.ts
```

Expected: PASS — 3 tests pass.

- [ ] **Step 4: Commit**

```powershell
git add src/components/declaracoes/CardActions.astro tests/unit/components/declaracoes/CardActions.test.ts
git commit -m "feat(cards): adicionar componente CardActions com 3 botões"
```

---

## Task 11: Integração em `/declaracoes/[id].astro`

**Files:**

- Modify: `src/pages/declaracoes/[id].astro`

- [ ] **Step 1: Inspect current file**

Run:

```powershell
pnpm dlx -p ripgrep rg "^---|<.*[A-Z]" src/pages/declaracoes/[id].astro -n
```

Locate the import block (top frontmatter) and the area where the declaration content is rendered.

- [ ] **Step 2: Add import**

In the frontmatter section (top `---` block) of `src/pages/declaracoes/[id].astro`, add (next to other component imports):

```typescript
import CardActions from "@/components/declaracoes/CardActions.astro";
```

- [ ] **Step 3: Render CardActions after declaration text**

Locate the JSX section where the main declaration text is shown (likely inside a `<article>` or main content block). Add immediately after the declaration's title/body:

```astro
<CardActions id={entry.data.id} declaracao={entry.data.texto} />
```

The prop names match the variables already used in the page (verify exact local variable name; common pattern is `entry` from `astro:content`).

- [ ] **Step 4: Run typecheck**

```powershell
pnpm typecheck
```

Expected: 0 errors.

- [ ] **Step 5: Commit**

```powershell
git add src/pages/declaracoes/[id].astro
git commit -m "feat(cards): integrar CardActions na página /declaracoes/[id]"
```

---

## Task 12: Integração no build (`package.json`)

**Files:**

- Modify: `package.json`

- [ ] **Step 1: Adjust `build:full` to include cards**

In `package.json` scripts section, change:

```json
"build:full": "pnpm build && pnpm build:index"
```

to:

```json
"build:full": "pnpm generate:cards && pnpm build && pnpm build:index"
```

- [ ] **Step 2: Run full build**

```powershell
pnpm build:full
```

Expected: build completes successfully; `public/cards/` populated (if there are declarations); `dist/` contains everything.

- [ ] **Step 3: Verify cards reach `dist/`**

```powershell
Get-ChildItem dist/cards -Recurse -ErrorAction SilentlyContinue | Select-Object -First 5
```

Expected: pasta `dist/cards/` existe e tem subpastas por id quando há declarações. Caso `data/declaracoes/` esteja vazio, a pasta pode não existir — esperado.

- [ ] **Step 4: Commit**

```powershell
git add package.json
git commit -m "build(cards): incluir generate-cards no pipeline build:full"
```

---

## Task 13: Validação end-to-end

**Files:** none modified; gate de qualidade

- [ ] **Step 1: Run full quality suite**

```powershell
pnpm format:check; pnpm lint; pnpm typecheck; pnpm test; pnpm build:full
```

Expected: cada comando termina com exit code 0. Caso `format:check` falhe, rodar `pnpm format`. Caso outro falhe, abrir gsd:debug (skill systematic-debugging).

- [ ] **Step 2: Validate audit-paridade still passes**

```powershell
pnpm audit:paridade
```

Expected: PASS.

- [ ] **Step 3: Visual smoke test (com 1+ declaração mock se necessário)**

Create a sample declaration in `data/declaracoes/` (or use existing if Sprint 5.2 already added piloto):

If none exists, create `data/declaracoes/2026-04-15-mock-economia-imposto.md` with minimal valid frontmatter:

```markdown
---
id: 2026-04-15-mock-economia-imposto
texto: "Declaração mock para teste visual do card visual com tamanho médio que cabe na faixa de 54pt sem truncar."
candidato_id: lula-luiz-inacio
tema_principal: economia
temas_secundarios: []
criado_em: 2026-04-15T00:00:00Z
atualizado_em: 2026-04-15T00:00:00Z
versao: 1
vereditos_externos:
  - veiculo: Lupa
    classificacao: parcialmente falso
    url: https://lupa.uol.com.br/teste
    data: 2026-04-16T00:00:00Z
    citacao_curta: "teste"
---

Corpo da declaração de teste.
```

Run:

```powershell
pnpm generate:cards
```

Expected: 4 PNGs criados em `public/cards/2026-04-15-mock-economia-imposto/`.

Open one of them in your image viewer and verify:

- Background `#FAFAFA`
- Texto em Geist Sans com acentos PT-BR corretos
- Lupa com borda vermelha lateral + bullet vermelho
- Rodapé "Atlas dos Candidatos · 2026 · Não emite veredito · CC-BY 4.0"
- QR code scanneável no canto inferior direito

Open the dev server and navigate to `/declaracoes/2026-04-15-mock-economia-imposto`:

```powershell
pnpm dev
```

Verify the 3 buttons render and:

- "Baixar card" abre menu com 4 opções e dispara download ao clicar
- "Copiar link da imagem" copia URL e mostra "Copiado!" por 1.5s
- "Compartilhar" abre intent do WhatsApp em nova aba (e demais)

- [ ] **Step 4: Remove mock if it was created only for testing**

```powershell
Remove-Item data/declaracoes/2026-04-15-mock-economia-imposto.md
Remove-Item -Recurse public/cards/2026-04-15-mock-economia-imposto
```

(Skip this step if Sprint 5.2 declarations are already in place.)

- [ ] **Step 5: Final commit if any quality fixes were made**

```powershell
git status
# Se houver mudanças (e.g., prettier autoformat):
git add .
git commit -m "chore(cards): aplicar correções de qualidade pós-validação"
```

---

## Notas finais

- O plan assume Sprint 5.2 (piloto 12 declarações) já estará rodando ou poderá ser executado em paralelo. Se não, Task 13 usa declaração mock para validação visual.
- Cards são apenas a feature **1 de 3** do `I4-Compartilhabilidade.md`. Próximos sub-specs: API JSON pública e embed widget.
- O componente `CardActions.astro` usa `<details>` nativo HTML em vez de Radix Dropdown para evitar dependência adicional e manter compatibilidade com SSG. Caso o estilo de open/close exija JS mais sofisticado em iteração futura, considerar Radix.
- Telemetria de cards baixados (P6 de `I3-Metricas-de-Sucesso.md`) está **fora do escopo deste plan**. Sprint dedicado depois.
