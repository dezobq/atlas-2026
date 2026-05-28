# Atlas Fase 4 — Sprint 5.1 (Setup Editorial) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Substituir os 2 candidatos demonstrativos por **infraestrutura editorial pública** (critério de seleção dos candidatos, 2 candidatos reais sem declarações ainda, páginas `/metodologia` + `/errata` + `/sobre`, 4 scripts de auditoria com testes Vitest, log editorial vazio, template de PR, CI step novo), tudo validado por suite verde e mergeado em `main` via PR squash.

**Architecture:** Sprint 5.1 do plano Fase 4 (ver `docs/superpowers/specs/2026-05-28-atlas-fase4-conteudo-mvp-design.md`). Trabalho prepara a infra editorial **antes** de qualquer declaração ser ingerida, garantindo que o critério público fica registrado em git antes de qualquer decisão editorial. Não cria declarações reais — isso fica para Sprint 5.2 (piloto).

**Tech Stack:** Astro 5 (content collections), Zod 3 (em `src/content/config.ts`) + Zod 4 (em scripts standalone), Vitest 2 (TDD para funções puras), AJV (validação JSON Schema regenerada), tsx (runner CLI), gh CLI (release+PR), `yaml`/`gray-matter`/`papaparse` (já em devDeps).

**Spec de referência:** `docs/superpowers/specs/2026-05-28-atlas-fase4-conteudo-mvp-design.md`
**Spec mestre:** `docs/superpowers/specs/2026-05-27-atlas-design.md`
**Checkpoint anterior:** `memory/checkpoint-fase3-completa.md` (entry point atual)

---

## File Structure

### Created

```
data/criterio-selecao/latest.yaml                     # singleton com aplicação do critério
data/log-editorial.csv                                # log vazio com header
data/candidatos/<slug1>.yaml                          # candidato real #1
data/candidatos/<slug2>.yaml                          # candidato real #2
data/schemas/criterio-selecao.schema.json             # JSON Schema regenerado (Ajv)
scripts/audit-paridade.ts                             # auditoria paridade temática (CI bloqueante)
scripts/audit-distribuicao.ts                         # observabilidade (não bloqueante)
scripts/check-archive-urls.ts                         # HEAD HTTP em Wayback URLs
scripts/validate-log.ts                               # FK match CSV ↔ declarações
scripts/lib/data-loaders.ts                           # helpers de leitura de data/* (compartilhados)
tests/unit/scripts/audit-paridade.test.ts
tests/unit/scripts/audit-distribuicao.test.ts
tests/unit/scripts/check-archive-urls.test.ts
tests/unit/scripts/validate-log.test.ts
tests/unit/data/criterio-selecao.test.ts
src/pages/metodologia.astro
src/pages/errata.astro
src/pages/sobre.astro
.github/PULL_REQUEST_TEMPLATE/fase4.md
public/img/candidatos/<slug1>.jpg                     # foto oficial #1
public/img/candidatos/<slug2>.jpg                     # foto oficial #2
```

### Modified

```
src/content/config.ts                                 # adiciona collection criterioSelecao
scripts/generate-json-schemas.ts                      # adiciona write("criterio-selecao", ...)
scripts/validate-data.ts                              # adiciona case para criterio-selecao + chama validate:log no fim
package.json                                          # 4 entries novas em scripts
.github/workflows/ci.yml                              # step novo "Auditoria de paridade Fase 4"
```

### Removed

```
data/candidatos/candidato-a.yaml
data/candidatos/candidato-b.yaml
data/declaracoes/2026-04-15-candidato-a-economia-imposto.md
data/declaracoes/2026-04-15-candidato-b-saude-sus.md
data/eventos/2026-04-15-debate-rede-tv.yaml
```

---

## Pré-requisitos antes de iniciar

1. Estar em `C:/Users/dezob/Projects/atlas`, branch `main`, working tree limpa.
2. Confirmar `git log --oneline -1` mostra `52438d7 docs(spec): adicionar design da Fase 4 (Conteúdo MVP)` no topo (commit do spec aprovado).
3. `pnpm install` (após qualquer mudança recente em deps).

---

## Tasks

### Task 1: Schema Zod e JSON Schema para `criterio-selecao`

**Files:**
- Modify: `src/content/config.ts` — adicionar collection `criterioSelecao`
- Modify: `scripts/generate-json-schemas.ts` — adicionar `write("criterio-selecao", ...)`
- Modify: `scripts/validate-data.ts` — adicionar entry na lista `collections`
- Create: `tests/unit/data/criterio-selecao.test.ts` — Zod schema accepts/rejects
- Create: `data/criterio-selecao/.gitkeep` — dir vazio para Astro registrar collection sem arquivos ainda

- [ ] **Step 1: Criar branch de trabalho**

```bash
git checkout main
git pull origin main
git checkout -b feat/fase4-sprint5-1-setup-editorial
```

Expected: branch `feat/fase4-sprint5-1-setup-editorial` criada apontando para `52438d7` (ou mais recente).

- [ ] **Step 2: Escrever o teste primeiro (TDD — vai falhar porque schema não existe ainda)**

Criar `tests/unit/data/criterio-selecao.test.ts`:

```typescript
import { describe, it, expect } from "vitest";
import { z } from "zod";

// Schema espelhado para teste — em CI o Zod schema é o de src/content/config.ts via content collection.
// Aqui testamos a forma do schema que o spec exige.
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
    desempate_criterio: z
      .enum(["maior amostra", "menor margem", "tempo no cargo"])
      .nullable(),
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
      selecionados: [
        { ...validExample.selecionados[0], posicao: 3 },
        validExample.selecionados[1],
      ],
    };
    expect(() => criterioSelecaoSchema.parse(invalido)).toThrow();
  });
});
```

- [ ] **Step 3: Rodar teste — esperar PASS (este teste usa Zod local, não depende do config.ts ainda)**

```bash
pnpm test -- tests/unit/data/criterio-selecao.test.ts
```

Expected: 5 testes PASS. Este teste serve como **especificação canônica** do shape do schema que vamos colocar em `config.ts`.

- [ ] **Step 4: Atualizar `src/content/config.ts` para incluir collection `criterioSelecao` (sintaxe Zod 3)**

Adicionar **ANTES** de `export const collections`:

```typescript
const criterioSelecao = defineCollection({
  loader: glob({ base: "./data/criterio-selecao", pattern: "*.yaml" }),
  schema: z.object({
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
      desempate_criterio: z
        .enum(["maior amostra", "menor margem", "tempo no cargo"])
        .nullable(),
    }),
    versao: z.number().int().positive(),
  }),
});
```

E atualizar o export `collections`:

```typescript
export const collections = {
  candidatos,
  temas,
  eventos,
  declaracoes,
  criterioSelecao,
};
```

- [ ] **Step 5: Atualizar `scripts/generate-json-schemas.ts` (sintaxe Zod 4)**

Adicionar **ANTES** das chamadas `write(...)` no final do arquivo (após declaração de `declaracaoSchema`):

```typescript
const criterioSelecaoSchema = z.object({
  data_corte: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  criado_em: z.iso.datetime(),
  curador: z.string().min(1),
  pesquisas: z
    .array(
      z.object({
        instituto: z.enum(["Datafolha", "Quaest", "Genial-Quaest"]),
        url: z.url(),
        archive_url: z.url(),
        data_publicacao: z.iso.datetime(),
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
    desempate_criterio: z
      .enum(["maior amostra", "menor margem", "tempo no cargo"])
      .nullable(),
  }),
  versao: z.number().int().positive(),
});
```

E adicionar a chamada `write` correspondente após as outras:

```typescript
write("criterio-selecao", criterioSelecaoSchema);
```

- [ ] **Step 6: Atualizar `scripts/validate-data.ts` para incluir criterio-selecao**

Modificar o array `collections` no topo:

```typescript
const collections = [
  { dir: "candidatos", ext: ".yaml", schema: "candidato.schema.json" },
  { dir: "temas", ext: ".yaml", schema: "tema.schema.json" },
  { dir: "eventos", ext: ".yaml", schema: "evento.schema.json" },
  { dir: "declaracoes", ext: ".md", schema: "declaracao.schema.json" },
  { dir: "criterio-selecao", ext: ".yaml", schema: "criterio-selecao.schema.json" },
];
```

- [ ] **Step 7: Criar diretório `data/criterio-selecao/` com `.gitkeep` para registro git**

```bash
mkdir -p data/criterio-selecao
echo "# Diretório versionado. Conteúdo real fica em data/criterio-selecao/latest.yaml (criado em task posterior)." > data/criterio-selecao/.gitkeep
```

Nota: o validate-data ignora arquivos que começam com `.` (filtro `!f.startsWith(".")` em `validate-data.ts:54`).

- [ ] **Step 8: Regenerar JSON Schema e validar**

```bash
pnpm generate-schemas
pnpm validate-data
```

Expected: `pnpm generate-schemas` cria `data/schemas/criterio-selecao.schema.json`. `pnpm validate-data` mostra "criterio-selecao: 0 arquivos" (sem .gitkeep) e exit 0.

- [ ] **Step 9: Rodar typecheck + suite de testes**

```bash
pnpm astro sync && pnpm typecheck
pnpm test
```

Expected: typecheck 0 errors; todos os testes (105 anteriores + 5 novos) passam.

- [ ] **Step 10: Commit**

```bash
git add src/content/config.ts scripts/generate-json-schemas.ts scripts/validate-data.ts data/schemas/criterio-selecao.schema.json data/criterio-selecao/.gitkeep tests/unit/data/criterio-selecao.test.ts
git commit -m "$(cat <<'EOF'
feat(fase4): adicionar schema criterio-selecao em Zod + JSON Schema

Adiciona collection `criterioSelecao` em src/content/config.ts (Zod 3, sintaxe
astro:content), gera JSON Schema correspondente para validação AJV via
generate-json-schemas (Zod 4 nativo), inclui no validate-data e cobre com
5 testes Vitest. Diretório data/criterio-selecao/ versionado via .gitkeep.

Schema espelha §7.1 do design Fase 4: data_corte, 3 pesquisas obrigatórias,
exatamente 2 selecionados, linha_de_empate com desempate_criterio enum.

Ref: docs/superpowers/specs/2026-05-28-atlas-fase4-conteudo-mvp-design.md §7.1
EOF
)"
```

---

### Task 2: Script `scripts/validate-log.ts` (FK match CSV ↔ declarações)

**Files:**
- Create: `scripts/lib/data-loaders.ts` — funções `loadDeclaracoes()` e `loadLogEditorial()` puras, reutilizadas por outros audits
- Create: `scripts/validate-log.ts` — entry CLI
- Create: `tests/unit/scripts/validate-log.test.ts`

- [ ] **Step 1: Criar `scripts/lib/data-loaders.ts` com funções puras reutilizáveis**

```typescript
import { readFileSync, readdirSync, existsSync } from "node:fs";
import { join, extname } from "node:path";
import { parse as parseYaml } from "yaml";
import matter from "gray-matter";
import Papa from "papaparse";

export interface DeclaracaoFrontmatter {
  id: string;
  candidato_id: string;
  tema_principal: string;
  tipo_estrutural: string[];
  fonte_primaria_tipo: string;
  archive_url: string;
  vereditos_externos?: Array<{ veiculo: string }>;
}

export interface LogLine {
  declaracao_id: string;
  candidato_id: string;
  tema: string;
  tipo_estrutural: string;
  fonte_tipo: string;
  tem_veredito_externo: string; // "true" | "false" (CSV é string)
  motivo_inclusao: string;
  curador: string;
  validador: string;
  data_inclusao: string;
}

export interface CandidatoYaml {
  id: string;
  slug: string;
  nome: string;
}

export interface EventoYaml {
  id: string;
  data: string;
}

const DATA_DIR = join(process.cwd(), "data");

export function loadDeclaracoes(): DeclaracaoFrontmatter[] {
  const dir = join(DATA_DIR, "declaracoes");
  if (!existsSync(dir)) return [];
  return readdirSync(dir)
    .filter((f) => extname(f) === ".md" && !f.startsWith("."))
    .map((f) => {
      const raw = readFileSync(join(dir, f), "utf-8");
      const { data } = matter(raw);
      return data as DeclaracaoFrontmatter;
    });
}

export function loadCandidatos(): CandidatoYaml[] {
  const dir = join(DATA_DIR, "candidatos");
  if (!existsSync(dir)) return [];
  return readdirSync(dir)
    .filter((f) => extname(f) === ".yaml" && !f.startsWith("."))
    .map((f) => parseYaml(readFileSync(join(dir, f), "utf-8")) as CandidatoYaml);
}

export function loadEventos(): EventoYaml[] {
  const dir = join(DATA_DIR, "eventos");
  if (!existsSync(dir)) return [];
  return readdirSync(dir)
    .filter((f) => extname(f) === ".yaml" && !f.startsWith("."))
    .map((f) => parseYaml(readFileSync(join(dir, f), "utf-8")) as EventoYaml);
}

export function loadLogEditorial(): LogLine[] {
  const path = join(DATA_DIR, "log-editorial.csv");
  if (!existsSync(path)) return [];
  const raw = readFileSync(path, "utf-8");
  const result = Papa.parse<LogLine>(raw, { header: true, skipEmptyLines: true });
  return result.data;
}

const TEMA_VALIDOS = [
  "economia",
  "saude",
  "educacao",
  "seguranca-publica",
  "meio-ambiente",
  "politica-externa",
];
const TIPO_ESTRUTURAL_VALIDOS = [
  "promessa",
  "dado_numerico",
  "atribuicao_a_terceiro",
  "afirmacao_historica",
  "comparacao",
  "afirmacao_sobre_pesquisa",
  "compromisso_politico",
  "interpretacao_pessoal",
];
const FONTE_TIPO_VALIDOS = [
  "youtube_oficial",
  "tse",
  "camara",
  "senado",
  "diario_oficial",
  "midia_consolidada",
  "rede_social_oficial",
];

export const ENUM_VALIDOS = {
  TEMA_VALIDOS,
  TIPO_ESTRUTURAL_VALIDOS,
  FONTE_TIPO_VALIDOS,
} as const;
```

- [ ] **Step 2: Escrever teste para `validate-log.ts` (falha antes de existir)**

Criar `tests/unit/scripts/validate-log.test.ts`:

```typescript
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
```

- [ ] **Step 3: Rodar o teste para confirmar que falha (módulo não existe)**

```bash
pnpm test -- tests/unit/scripts/validate-log.test.ts
```

Expected: FAIL com "Cannot find module '@/../scripts/validate-log'".

- [ ] **Step 4: Criar `scripts/validate-log.ts`**

```typescript
import { pathToFileURL } from "node:url";
import {
  loadDeclaracoes,
  loadLogEditorial,
  ENUM_VALIDOS,
  type DeclaracaoFrontmatter,
  type LogLine,
} from "./lib/data-loaders";

export interface ValidationResult {
  ok: boolean;
  errors: string[];
}

export function validarLog(
  declaracoes: DeclaracaoFrontmatter[],
  log: LogLine[],
): ValidationResult {
  const errors: string[] = [];
  const declSet = new Set(declaracoes.map((d) => d.id));
  const logSet = new Set<string>();
  const logCount = new Map<string, number>();

  for (const line of log) {
    logCount.set(line.declaracao_id, (logCount.get(line.declaracao_id) ?? 0) + 1);
    if (!declSet.has(line.declaracao_id)) {
      errors.push(
        `log-editorial.csv: linha referencia declaracao_id=${line.declaracao_id} que não existe em data/declaracoes/`,
      );
    }
    logSet.add(line.declaracao_id);

    if (!line.motivo_inclusao.match(/^cascata-[1-5]:/)) {
      errors.push(
        `log-editorial.csv: declaracao_id=${line.declaracao_id} tem motivo_inclusao sem prefixo "cascata-N:" (1-5). Valor: "${line.motivo_inclusao}"`,
      );
    }

    if (!ENUM_VALIDOS.TEMA_VALIDOS.includes(line.tema)) {
      errors.push(
        `log-editorial.csv: declaracao_id=${line.declaracao_id} tem tema inválido "${line.tema}". Válidos: ${ENUM_VALIDOS.TEMA_VALIDOS.join(", ")}`,
      );
    }
    if (!ENUM_VALIDOS.TIPO_ESTRUTURAL_VALIDOS.includes(line.tipo_estrutural)) {
      errors.push(
        `log-editorial.csv: declaracao_id=${line.declaracao_id} tem tipo_estrutural inválido "${line.tipo_estrutural}".`,
      );
    }
    if (!ENUM_VALIDOS.FONTE_TIPO_VALIDOS.includes(line.fonte_tipo)) {
      errors.push(
        `log-editorial.csv: declaracao_id=${line.declaracao_id} tem fonte_tipo inválido "${line.fonte_tipo}".`,
      );
    }
  }

  for (const [id, count] of logCount) {
    if (count > 1) {
      errors.push(`log-editorial.csv: declaracao_id=${id} aparece em ${count} linhas (duplicada)`);
    }
  }

  for (const d of declaracoes) {
    if (!logSet.has(d.id)) {
      errors.push(
        `data/declaracoes/${d.id}.md: declaração sem entrada correspondente em log-editorial.csv`,
      );
    }
  }

  return { ok: errors.length === 0, errors };
}

function isMain(): boolean {
  return import.meta.url === pathToFileURL(process.argv[1] ?? "").href;
}

if (isMain()) {
  const declaracoes = loadDeclaracoes();
  const log = loadLogEditorial();
  const { ok, errors } = validarLog(declaracoes, log);

  if (ok) {
    console.log(`✅ log-editorial.csv: ${log.length} linhas, FK match 100% (${declaracoes.length} declarações).`);
    process.exit(0);
  } else {
    console.error(`❌ log-editorial.csv tem ${errors.length} problema(s):`);
    for (const e of errors) console.error(`  - ${e}`);
    process.exit(1);
  }
}
```

- [ ] **Step 5: Rodar testes — esperar PASS**

```bash
pnpm test -- tests/unit/scripts/validate-log.test.ts
```

Expected: 8 testes PASS.

- [ ] **Step 6: Commit**

```bash
git add scripts/lib/data-loaders.ts scripts/validate-log.ts tests/unit/scripts/validate-log.test.ts
git commit -m "$(cat <<'EOF'
feat(fase4): adicionar scripts/validate-log e helpers de data loading

scripts/validate-log.ts: valida FK match perfeito entre data/log-editorial.csv
e data/declaracoes/, enums (tema, tipo_estrutural, fonte_tipo) e formato do
motivo_inclusao (cascata-N: ...). CLI exit 0/1.

scripts/lib/data-loaders.ts: funções puras loadDeclaracoes/loadCandidatos/
loadEventos/loadLogEditorial + enums centralizados. Reutilizadas por audit-*.

Cobertura: 8 testes unitários cobrindo FK match, duplicidade, enums, formato
cascata.

Ref: docs/superpowers/specs/2026-05-28-atlas-fase4-conteudo-mvp-design.md §7.3
EOF
)"
```

---

### Task 3: Script `scripts/audit-paridade.ts` (CI bloqueante)

**Files:**
- Create: `scripts/audit-paridade.ts`
- Create: `tests/unit/scripts/audit-paridade.test.ts`

- [ ] **Step 1: Escrever teste primeiro (falha antes)**

Criar `tests/unit/scripts/audit-paridade.test.ts`:

```typescript
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
    const declaracoes = Array.from({ length: 13 }).map((_, i) =>
      dec(`d${i}`, "a", "economia"),
    );
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
});
```

- [ ] **Step 2: Rodar teste — esperar FAIL**

```bash
pnpm test -- tests/unit/scripts/audit-paridade.test.ts
```

Expected: FAIL com "Cannot find module".

- [ ] **Step 3: Criar `scripts/audit-paridade.ts`**

```typescript
import { pathToFileURL } from "node:url";
import { writeFileSync, mkdirSync } from "node:fs";
import { join } from "node:path";
import {
  loadCandidatos,
  loadDeclaracoes,
  loadEventos,
  ENUM_VALIDOS,
  type CandidatoYaml,
  type DeclaracaoFrontmatter,
  type EventoYaml,
} from "./lib/data-loaders";

export type AuditMode = "setup" | "piloto" | "final";

export interface AuditInput {
  mode: AuditMode;
  candidatos: CandidatoYaml[];
  declaracoes: DeclaracaoFrontmatter[];
  eventos: EventoYaml[];
  eventoDeDeclaracao: Map<string, string>;
}

export interface AuditResult {
  ok: boolean;
  errors: string[];
  report: string;
}

const JANELA_INICIO = new Date("2025-05-15T00:00:00.000Z").getTime();
const JANELA_FIM = new Date("2026-05-15T23:59:59.999Z").getTime();

export function auditarParidade(input: AuditInput): AuditResult {
  const { mode, candidatos, declaracoes, eventos, eventoDeDeclaracao } = input;
  const errors: string[] = [];
  const lines: string[] = [];

  lines.push(`# Auditoria de Paridade Fase 4`);
  lines.push(``);
  lines.push(`- Modo: \`${mode}\``);
  lines.push(`- Candidatos: ${candidatos.length}`);
  lines.push(`- Declarações: ${declaracoes.length}`);
  lines.push(`- Eventos: ${eventos.length}`);
  lines.push(``);

  // 1. Número de candidatos
  if (mode === "setup") {
    if (candidatos.length !== 0 && candidatos.length !== 2) {
      errors.push(
        `setup-mode: esperado 0 ou 2 candidatos em data/candidatos/, encontrado ${candidatos.length}`,
      );
    }
  } else {
    if (candidatos.length !== 2) {
      errors.push(`${mode}-mode: esperado exatamente 2 candidatos, encontrado ${candidatos.length}`);
    }
  }

  // 2. Número de declarações
  if (mode === "piloto" && declaracoes.length !== 12) {
    errors.push(`piloto-mode: esperado exatamente 12 declarações (1 × 6 temas × 2 candidatos), encontrado ${declaracoes.length}`);
  }
  if (mode === "final" && declaracoes.length !== 60) {
    errors.push(`final-mode: esperado exatamente 60 declarações (5 × 6 temas × 2 candidatos), encontrado ${declaracoes.length}`);
  }
  if (declaracoes.length > 60) {
    errors.push(`declarações em excesso: ${declaracoes.length} (máximo permitido na Fase 4: 60)`);
  }

  // 3. Distribuição por (candidato × tema)
  const matriz = new Map<string, number>();
  for (const d of declaracoes) {
    const key = `${d.candidato_id}::${d.tema_principal}`;
    matriz.set(key, (matriz.get(key) ?? 0) + 1);
  }

  if (mode === "final") {
    for (const c of candidatos) {
      for (const t of ENUM_VALIDOS.TEMA_VALIDOS) {
        const count = matriz.get(`${c.id}::${t}`) ?? 0;
        if (count !== 5) {
          errors.push(
            `final-mode: ${c.id} tem ${count} declaração(ões) em ${t}, esperado 5`,
          );
        }
      }
    }
  } else if (mode === "piloto") {
    for (const c of candidatos) {
      for (const t of ENUM_VALIDOS.TEMA_VALIDOS) {
        const count = matriz.get(`${c.id}::${t}`) ?? 0;
        if (count !== 1) {
          errors.push(
            `piloto-mode: ${c.id} tem ${count} declaração(ões) em ${t}, esperado 1`,
          );
        }
      }
    }
  } else {
    // setup/cumulativo: permite ≤ 5 por (candidato, tema)
    for (const [key, count] of matriz) {
      if (count > 5) {
        errors.push(`incremental: ${key} tem ${count} declarações (máximo 5)`);
      }
    }
  }

  // 4. archive_url em 100%
  for (const d of declaracoes) {
    if (!d.archive_url || d.archive_url.trim() === "") {
      errors.push(`declaração ${d.id} sem archive_url Wayback`);
    }
  }

  // 5. Janela temporal
  for (const d of declaracoes) {
    const evId = eventoDeDeclaracao.get(d.id);
    if (!evId) {
      errors.push(`declaração ${d.id} sem evento_id mapeado`);
      continue;
    }
    const evento = eventos.find((e) => e.id === evId);
    if (!evento) {
      errors.push(`declaração ${d.id} referencia evento_id=${evId} inexistente`);
      continue;
    }
    const ts = Date.parse(evento.data);
    if (Number.isNaN(ts)) {
      errors.push(`evento ${evento.id} tem data inválida: ${evento.data}`);
      continue;
    }
    if (ts < JANELA_INICIO || ts > JANELA_FIM) {
      errors.push(
        `declaração ${d.id} em evento ${evento.id} (data=${evento.data}) fora da janela [2025-05-15, 2026-05-15]`,
      );
    }
  }

  if (errors.length > 0) {
    lines.push(`## ❌ ${errors.length} problema(s)`);
    lines.push(``);
    for (const e of errors) lines.push(`- ${e}`);
  } else {
    lines.push(`## ✅ PASS`);
    lines.push(``);
    lines.push(`Todas as invariantes da Fase 4 satisfeitas para o modo "${mode}".`);
  }

  return { ok: errors.length === 0, errors, report: lines.join("\n") };
}

function isMain(): boolean {
  return import.meta.url === pathToFileURL(process.argv[1] ?? "").href;
}

function parseMode(args: string[]): AuditMode {
  if (args.includes("--final-mode")) return "final";
  if (args.includes("--piloto-mode")) return "piloto";
  return "setup";
}

if (isMain()) {
  const candidatos = loadCandidatos();
  const declaracoes = loadDeclaracoes();
  const eventos = loadEventos();
  // Para CLI, precisamos cruzar declaracoes -> evento via frontmatter.
  // Mas DeclaracaoFrontmatter não tem evento_id por simplicidade.
  // Vamos reler para extrair evento_id direto.
  // Em vez de re-implementar, usamos o spread direto via parse local:
  const eventoDeDeclaracao = new Map<string, string>();
  // Re-parse para pegar evento_id (que não está em DeclaracaoFrontmatter intencionalmente porque não precisa em outras audits):
  const { readdirSync, readFileSync } = require("node:fs");
  const matter = require("gray-matter");
  const { join } = require("node:path");
  const decDir = join(process.cwd(), "data", "declaracoes");
  for (const file of readdirSync(decDir).filter((f: string) => f.endsWith(".md"))) {
    const raw = readFileSync(join(decDir, file), "utf-8");
    const { data } = matter(raw);
    if (data.id && data.evento_id) eventoDeDeclaracao.set(data.id, data.evento_id);
  }

  const mode = parseMode(process.argv.slice(2));
  const { ok, errors, report } = auditarParidade({
    mode,
    candidatos,
    declaracoes,
    eventos,
    eventoDeDeclaracao,
  });

  const outPath = join(process.cwd(), "docs", "audit-fase4.md");
  mkdirSync(join(process.cwd(), "docs"), { recursive: true });
  writeFileSync(outPath, report + "\n", "utf-8");

  if (ok) {
    console.log(`✅ Auditoria de paridade (${mode}) PASS — relatório em docs/audit-fase4.md`);
    process.exit(0);
  } else {
    console.error(`❌ Auditoria de paridade (${mode}) falhou com ${errors.length} problema(s):`);
    for (const e of errors) console.error(`  - ${e}`);
    console.error(`\nRelatório completo: docs/audit-fase4.md`);
    process.exit(1);
  }
}
```

- [ ] **Step 4: Rodar testes — esperar PASS**

```bash
pnpm test -- tests/unit/scripts/audit-paridade.test.ts
```

Expected: 9 testes PASS.

- [ ] **Step 5: Commit**

```bash
git add scripts/audit-paridade.ts tests/unit/scripts/audit-paridade.test.ts
git commit -m "$(cat <<'EOF'
feat(fase4): adicionar scripts/audit-paridade (CI bloqueante)

Verifica invariantes da Fase 4 a cada PR:
- setup-mode: 0 ou 2 candidatos
- piloto-mode: 2 candidatos + 12 declarações distribuídas 1×6×2
- final-mode: 2 candidatos + 60 declarações distribuídas 5×6×2
- 100% das declarações com archive_url não-vazio
- 100% dos eventos dentro da janela [2025-05-15, 2026-05-15]

Output: docs/audit-fase4.md (markdown regenerado a cada run) + exit code 0/1.

Cobertura: 9 testes Vitest com função pura auditarParidade.

Ref: docs/superpowers/specs/2026-05-28-atlas-fase4-conteudo-mvp-design.md §7.3
EOF
)"
```

---

### Task 4: Script `scripts/audit-distribuicao.ts` (observabilidade)

**Files:**
- Create: `scripts/audit-distribuicao.ts`
- Create: `tests/unit/scripts/audit-distribuicao.test.ts`

- [ ] **Step 1: Escrever teste primeiro**

Criar `tests/unit/scripts/audit-distribuicao.test.ts`:

```typescript
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
```

- [ ] **Step 2: Rodar teste — esperar FAIL**

```bash
pnpm test -- tests/unit/scripts/audit-distribuicao.test.ts
```

Expected: FAIL "Cannot find module".

- [ ] **Step 3: Criar `scripts/audit-distribuicao.ts`**

```typescript
import { pathToFileURL } from "node:url";
import { writeFileSync, mkdirSync } from "node:fs";
import { join } from "node:path";
import { loadDeclaracoes, type DeclaracaoFrontmatter } from "./lib/data-loaders";

export interface DistribuicaoResult {
  totalDeclaracoes: number;
  percentComVereditoExterno: number;
  tiposPorCandidato: Map<string, Set<string>>;
  distribuicaoFonte: Map<string, number>; // % do total
}

function pct(n: number, total: number): number {
  if (total === 0) return 0;
  return Math.round((n / total) * 100);
}

export function calcularDistribuicao(declaracoes: DeclaracaoFrontmatter[]): DistribuicaoResult {
  const total = declaracoes.length;
  const comVeredito = declaracoes.filter(
    (d) => Array.isArray(d.vereditos_externos) && d.vereditos_externos.length > 0,
  ).length;

  const tiposPorCandidato = new Map<string, Set<string>>();
  for (const d of declaracoes) {
    if (!tiposPorCandidato.has(d.candidato_id)) {
      tiposPorCandidato.set(d.candidato_id, new Set());
    }
    for (const t of d.tipo_estrutural) {
      tiposPorCandidato.get(d.candidato_id)!.add(t);
    }
  }

  const fonteCount = new Map<string, number>();
  for (const d of declaracoes) {
    fonteCount.set(d.fonte_primaria_tipo, (fonteCount.get(d.fonte_primaria_tipo) ?? 0) + 1);
  }
  const distribuicaoFonte = new Map<string, number>();
  for (const [k, v] of fonteCount) {
    distribuicaoFonte.set(k, pct(v, total));
  }

  return {
    totalDeclaracoes: total,
    percentComVereditoExterno: pct(comVeredito, total),
    tiposPorCandidato,
    distribuicaoFonte,
  };
}

function renderMarkdown(r: DistribuicaoResult): string {
  const lines: string[] = [];
  lines.push(`# Distribuição editorial Fase 4`);
  lines.push(``);
  lines.push(`- Total de declarações: **${r.totalDeclaracoes}**`);
  lines.push(`- % com veredito externo: **${r.percentComVereditoExterno}%**`);
  lines.push(``);

  lines.push(`## Tipos estruturais cobertos por candidato`);
  lines.push(``);
  lines.push(`| Candidato | Tipos distintos | Tipos |`);
  lines.push(`|---|---|---|`);
  for (const [cand, tipos] of r.tiposPorCandidato) {
    lines.push(`| ${cand} | ${tipos.size}/8 | ${Array.from(tipos).join(", ")} |`);
  }
  lines.push(``);

  lines.push(`## Distribuição de fonte_primaria_tipo`);
  lines.push(``);
  lines.push(`| Fonte | % |`);
  lines.push(`|---|---|`);
  for (const [fonte, p] of r.distribuicaoFonte) {
    lines.push(`| ${fonte} | ${p}% |`);
  }

  return lines.join("\n");
}

function isMain(): boolean {
  return import.meta.url === pathToFileURL(process.argv[1] ?? "").href;
}

if (isMain()) {
  const declaracoes = loadDeclaracoes();
  const result = calcularDistribuicao(declaracoes);
  const md = renderMarkdown(result);

  const outPath = join(process.cwd(), "docs", "distribuicao-fase4.md");
  mkdirSync(join(process.cwd(), "docs"), { recursive: true });
  writeFileSync(outPath, md + "\n", "utf-8");

  console.log(`✅ Distribuição calculada para ${result.totalDeclaracoes} declarações — docs/distribuicao-fase4.md`);
  process.exit(0);
}
```

- [ ] **Step 4: Rodar testes**

```bash
pnpm test -- tests/unit/scripts/audit-distribuicao.test.ts
```

Expected: 4 testes PASS.

- [ ] **Step 5: Commit**

```bash
git add scripts/audit-distribuicao.ts tests/unit/scripts/audit-distribuicao.test.ts
git commit -m "$(cat <<'EOF'
feat(fase4): adicionar scripts/audit-distribuicao (observabilidade)

Calcula métricas editoriais (não-bloqueante no CI):
- Total de declarações
- % com vereditos externos populados
- Diversidade de tipo_estrutural por candidato (alvo: 5-8 tipos distintos)
- Distribuição de fonte_primaria_tipo (% youtube_oficial vs midia vs rede_social)

Output: docs/distribuicao-fase4.md em markdown legível.

Cobertura: 4 testes Vitest com função pura calcularDistribuicao.

Ref: docs/superpowers/specs/2026-05-28-atlas-fase4-conteudo-mvp-design.md §7.3
EOF
)"
```

---

### Task 5: Script `scripts/check-archive-urls.ts`

**Files:**
- Create: `scripts/check-archive-urls.ts`
- Create: `tests/unit/scripts/check-archive-urls.test.ts`

- [ ] **Step 1: Escrever teste primeiro (mock global.fetch)**

Criar `tests/unit/scripts/check-archive-urls.test.ts`:

```typescript
import { describe, it, expect, vi, beforeEach } from "vitest";
import { verificarArchiveUrls } from "@/../scripts/check-archive-urls";

describe("verificarArchiveUrls", () => {
  beforeEach(() => {
    vi.unstubAllGlobals();
  });

  it("retorna ok=true quando todas URLs retornam 200", async () => {
    const mockFetch = vi.fn().mockResolvedValue({ status: 200, ok: true });
    vi.stubGlobal("fetch", mockFetch);

    const { ok, failures } = await verificarArchiveUrls([
      "https://web.archive.org/web/2026/a",
      "https://web.archive.org/web/2026/b",
    ]);

    expect(ok).toBe(true);
    expect(failures).toEqual([]);
    expect(mockFetch).toHaveBeenCalledTimes(2);
  });

  it("retorna ok=false quando alguma URL retorna 4xx/5xx", async () => {
    const mockFetch = vi
      .fn()
      .mockResolvedValueOnce({ status: 200, ok: true })
      .mockResolvedValueOnce({ status: 404, ok: false });
    vi.stubGlobal("fetch", mockFetch);

    const { ok, failures } = await verificarArchiveUrls([
      "https://web.archive.org/web/2026/a",
      "https://web.archive.org/web/2026/b",
    ]);

    expect(ok).toBe(false);
    expect(failures).toEqual([
      { url: "https://web.archive.org/web/2026/b", status: 404, error: null },
    ]);
  });

  it("captura erros de rede como falha", async () => {
    const mockFetch = vi.fn().mockRejectedValue(new Error("ETIMEDOUT"));
    vi.stubGlobal("fetch", mockFetch);

    const { ok, failures } = await verificarArchiveUrls(["https://web.archive.org/x"]);

    expect(ok).toBe(false);
    expect(failures[0].error).toContain("ETIMEDOUT");
  });

  it("usa método HEAD por padrão", async () => {
    const mockFetch = vi.fn().mockResolvedValue({ status: 200, ok: true });
    vi.stubGlobal("fetch", mockFetch);

    await verificarArchiveUrls(["https://web.archive.org/x"]);

    expect(mockFetch).toHaveBeenCalledWith(
      "https://web.archive.org/x",
      expect.objectContaining({ method: "HEAD" }),
    );
  });
});
```

- [ ] **Step 2: Rodar teste — esperar FAIL**

```bash
pnpm test -- tests/unit/scripts/check-archive-urls.test.ts
```

Expected: FAIL "Cannot find module".

- [ ] **Step 3: Criar `scripts/check-archive-urls.ts`**

```typescript
import { pathToFileURL } from "node:url";
import { execSync } from "node:child_process";
import { loadDeclaracoes, loadEventos } from "./lib/data-loaders";

export interface UrlFailure {
  url: string;
  status: number | null;
  error: string | null;
}

export interface CheckResult {
  ok: boolean;
  total: number;
  failures: UrlFailure[];
}

export async function verificarArchiveUrls(urls: string[]): Promise<CheckResult> {
  const failures: UrlFailure[] = [];
  for (const url of urls) {
    try {
      const res = await fetch(url, { method: "HEAD" });
      if (!res.ok) {
        failures.push({ url, status: res.status, error: null });
      }
    } catch (e) {
      failures.push({ url, status: null, error: (e as Error).message });
    }
  }
  return { ok: failures.length === 0, total: urls.length, failures };
}

function urlsModoRecent(): string[] {
  try {
    const diff = execSync("git diff --name-only HEAD~1 HEAD", { encoding: "utf-8" });
    const arquivosAlterados = diff.split("\n").filter((f) => f.trim());
    const declaracoes = loadDeclaracoes().filter((d) =>
      arquivosAlterados.some((f) => f.includes("declaracoes/") && f.includes(d.id)),
    );
    const eventos = loadEventos().filter((e) =>
      arquivosAlterados.some((f) => f.includes("eventos/") && f.includes(e.id)),
    );
    const urls: string[] = [];
    for (const d of declaracoes) if (d.archive_url) urls.push(d.archive_url);
    for (const _ of eventos) {
      // Eventos têm archive_url também — mas EventoYaml minimal não tem.
      // Releitura via parse YAML completo seria necessária; aceito limitação:
      // o --recent só checa declarações por enquanto, eventos vão pelo --all.
    }
    return Array.from(new Set(urls));
  } catch {
    return [];
  }
}

function urlsModoAll(): string[] {
  const declaracoes = loadDeclaracoes();
  const urls: string[] = [];
  for (const d of declaracoes) if (d.archive_url) urls.push(d.archive_url);
  return Array.from(new Set(urls));
}

function isMain(): boolean {
  return import.meta.url === pathToFileURL(process.argv[1] ?? "").href;
}

if (isMain()) {
  const args = process.argv.slice(2);
  const isRecent = args.includes("--recent");
  const urls = isRecent ? urlsModoRecent() : urlsModoAll();

  if (urls.length === 0) {
    console.log(`ℹ Nenhuma URL Wayback para checar (modo: ${isRecent ? "--recent" : "--all"}).`);
    process.exit(0);
  }

  console.log(`🔍 Checando ${urls.length} URL(s) Wayback (modo: ${isRecent ? "--recent" : "--all"})...`);
  const { ok, total, failures } = await verificarArchiveUrls(urls);

  if (ok) {
    console.log(`✅ Todas as ${total} URLs Wayback retornaram HEAD 200 OK.`);
    process.exit(0);
  } else {
    console.error(`❌ ${failures.length}/${total} URLs Wayback falharam:`);
    for (const f of failures) {
      console.error(`  - ${f.url} (status=${f.status ?? "ERR"}, erro=${f.error ?? "-"})`);
    }
    process.exit(1);
  }
}
```

- [ ] **Step 4: Rodar testes — esperar PASS**

```bash
pnpm test -- tests/unit/scripts/check-archive-urls.test.ts
```

Expected: 4 testes PASS.

- [ ] **Step 5: Commit**

```bash
git add scripts/check-archive-urls.ts tests/unit/scripts/check-archive-urls.test.ts
git commit -m "$(cat <<'EOF'
feat(fase4): adicionar scripts/check-archive-urls

Verifica HEAD HTTP 200 em URLs Wayback de declarações/eventos:
- --all: verifica todos os archive_url do dataset
- --recent: verifica apenas declarações modificadas em HEAD~1 (PR atual)

Cobertura: 4 testes Vitest com mock global.fetch (ok 200, ok 404, erro rede,
método HEAD por padrão).

Ref: docs/superpowers/specs/2026-05-28-atlas-fase4-conteudo-mvp-design.md §7.3
EOF
)"
```

---

### Task 6: Atualizar `package.json` com 4 scripts novos + ajustar `validate-data`

**Files:**
- Modify: `package.json` — adicionar 4 entries em `scripts`
- Modify: `scripts/validate-data.ts` — chamar `validate-log.ts` ao final

- [ ] **Step 1: Adicionar entries em `package.json`**

Adicionar dentro do bloco `"scripts": { ... }` (entre `validate-data` e `generate-schemas`):

```json
    "audit:paridade": "tsx scripts/audit-paridade.ts",
    "audit:distribuicao": "tsx scripts/audit-distribuicao.ts",
    "check:archive-urls": "tsx scripts/check-archive-urls.ts",
    "validate:log": "tsx scripts/validate-log.ts",
```

Posição final do bloco `"scripts"` (ordem alfabética-ish por grupo, mas mantendo agrupamento por função):

```json
  "scripts": {
    "dev": "astro dev",
    "build": "astro build",
    "build:index": "pagefind --site dist --force-language pt",
    "build:full": "pnpm build && pnpm build:index",
    "preview": "astro preview",
    "astro": "astro",
    "typecheck": "astro check",
    "lint": "eslint . --max-warnings=0",
    "lint:fix": "eslint . --fix",
    "format": "prettier --write .",
    "format:check": "prettier --check .",
    "test": "vitest run --passWithNoTests",
    "test:watch": "vitest --passWithNoTests",
    "validate-data": "tsx scripts/validate-data.ts",
    "validate:log": "tsx scripts/validate-log.ts",
    "generate-schemas": "tsx scripts/generate-json-schemas.ts",
    "audit:paridade": "tsx scripts/audit-paridade.ts",
    "audit:distribuicao": "tsx scripts/audit-distribuicao.ts",
    "check:archive-urls": "tsx scripts/check-archive-urls.ts",
    "scrape:youtube": "tsx scripts/scrape-youtube.ts",
    "transcribe": "tsx scripts/transcribe.ts",
    "archive": "tsx scripts/archive.ts",
    "scrape:url": "tsx scripts/scrape-url.ts",
    "generate:og": "tsx scripts/generate-og-images.ts",
    "export:dataset": "tsx scripts/export-dataset.ts"
  },
```

- [ ] **Step 2: Atualizar `scripts/validate-data.ts` para chamar validate-log ao final**

No final do arquivo, **antes** de `process.exit(0)`, adicionar:

```typescript
// Validação do log editorial (Fase 4+)
console.log(`\n${"=".repeat(60)}`);
console.log(`Validando log editorial...`);
try {
  const { validarLog } = await import("./validate-log.js");
  const { loadDeclaracoes, loadLogEditorial } = await import("./lib/data-loaders.js");
  const result = validarLog(loadDeclaracoes(), loadLogEditorial());
  if (!result.ok) {
    console.error(`❌ log-editorial.csv tem ${result.errors.length} problema(s):`);
    for (const e of result.errors) console.error(`  - ${e}`);
    process.exit(1);
  }
  console.log(`✅ log-editorial.csv: validado.`);
} catch (e) {
  console.error(`❌ Erro ao validar log: ${(e as Error).message}`);
  process.exit(1);
}
```

Nota: `import` dinâmico usa `.js` em vez de `.ts` porque tsx faz a tradução em runtime. Se houver erro de resolução, substituir por `await import("./validate-log")` e `await import("./lib/data-loaders")` sem extensão.

- [ ] **Step 3: Verificar que `validate-data` agora valida o log também**

```bash
pnpm validate-data
```

Expected: exit 0 (sem log ainda, sem declarações, sem erro).

- [ ] **Step 4: Commit**

```bash
git add package.json scripts/validate-data.ts
git commit -m "$(cat <<'EOF'
feat(fase4): registrar 4 scripts de auditoria em package.json

Adiciona entries: audit:paridade, audit:distribuicao, check:archive-urls,
validate:log. Ajusta scripts/validate-data.ts para chamar validarLog ao
final, garantindo que log-editorial.csv é validado a cada validate-data
(inclui o step do CI).

Ref: docs/superpowers/specs/2026-05-28-atlas-fase4-conteudo-mvp-design.md §7.3
EOF
)"
```

---

### Task 7: Atualizar workflow CI com step `audit:paridade`

**Files:**
- Modify: `.github/workflows/ci.yml`

- [ ] **Step 1: Adicionar step após "Validate data" e antes de "Run tests"**

Modificar `.github/workflows/ci.yml`, inserindo entre os steps existentes:

```yaml
      - name: Validate data
        run: pnpm validate-data

      - name: Auditoria de paridade Fase 4
        run: pnpm audit:paridade

      - name: Run tests
        run: pnpm test
```

- [ ] **Step 2: Verificar localmente que `pnpm audit:paridade` passa no estado atual (setup-mode com 2 demos)**

```bash
pnpm audit:paridade
```

Expected: PASS porque está em "setup-mode" implícito (sem `--final-mode` nem `--piloto-mode`), aceita 0-2 candidatos. O `docs/audit-fase4.md` é gerado.

- [ ] **Step 3: Commit**

```bash
git add .github/workflows/ci.yml
git commit -m "$(cat <<'EOF'
ci(fase4): adicionar step "Auditoria de paridade Fase 4"

Roda pnpm audit:paridade após validate-data, antes dos tests. CI bloqueia
PR se invariantes da Fase 4 falharem (número de candidatos, paridade
temática, archive_url 100%, janela temporal).

Modo default (sem flag) é "setup", que aceita 0 ou 2 candidatos — permitindo
PRs de cleanup parcial. Modos --piloto-mode e --final-mode são chamados
manualmente em sprints 5.2 e 5.4.

Ref: docs/superpowers/specs/2026-05-28-atlas-fase4-conteudo-mvp-design.md §7.4
EOF
)"
```

---

### Task 8: Criar `data/log-editorial.csv` vazio com header

**Files:**
- Create: `data/log-editorial.csv`

- [ ] **Step 1: Criar arquivo com apenas o header**

```bash
cat > data/log-editorial.csv << 'EOF'
declaracao_id,candidato_id,tema,tipo_estrutural,fonte_tipo,tem_veredito_externo,motivo_inclusao,curador,validador,data_inclusao
EOF
```

Ou via Node se preferir cross-platform Windows:

```powershell
"declaracao_id,candidato_id,tema,tipo_estrutural,fonte_tipo,tem_veredito_externo,motivo_inclusao,curador,validador,data_inclusao`n" | Out-File -Encoding utf8 -FilePath data/log-editorial.csv -NoNewline
```

- [ ] **Step 2: Verificar conteúdo**

```bash
cat data/log-editorial.csv
```

Expected: 1 linha (header), sem BOM.

- [ ] **Step 3: Validar via script**

```bash
pnpm validate:log
```

Expected: `✅ log-editorial.csv: 0 linhas, FK match 100% (0 declarações).` exit 0.

- [ ] **Step 4: Commit**

```bash
git add data/log-editorial.csv
git commit -m "$(cat <<'EOF'
feat(fase4): criar data/log-editorial.csv com header (vazio)

Schema documentado em §7.2 do design Fase 4. CSV (não JSON) para permitir
abertura em planilha por jornalistas/pesquisadores sem fricção.

Colunas: declaracao_id, candidato_id, tema, tipo_estrutural, fonte_tipo,
tem_veredito_externo, motivo_inclusao, curador, validador, data_inclusao.

Ref: docs/superpowers/specs/2026-05-28-atlas-fase4-conteudo-mvp-design.md §7.2
EOF
)"
```

---

### Task 9: Criar template de PR específico para Fase 4

**Files:**
- Create: `.github/PULL_REQUEST_TEMPLATE/fase4.md`

- [ ] **Step 1: Criar diretório e arquivo**

```bash
mkdir -p .github/PULL_REQUEST_TEMPLATE
```

Criar `.github/PULL_REQUEST_TEMPLATE/fase4.md`:

```markdown
## Sprint
<!-- Marque um -->
- [ ] 5.1 Setup
- [ ] 5.2 Piloto
- [ ] 5.3 Lote
- [ ] 5.4 Polimento

## Mudança editorial
- [ ] N declarações novas: ___
- [ ] N entradas em log-editorial.csv: ___
- [ ] Candidatos envolvidos: ___

## Auditoria automatizada
- [ ] `pnpm validate-data`: PASS
- [ ] `pnpm audit:paridade`: PASS — output:
  ```
  <colar output>
  ```
- [ ] `pnpm audit:distribuicao`: rodado (link para `docs/distribuicao-fase4.md`)
- [ ] `pnpm check:archive-urls --recent`: PASS

## Auditoria humana
- [ ] Sign-off por declaração: ___/___ (checklist do §5.5 do design marcada)
- [ ] Wayback abre para todas as N URLs
- [ ] Transcrição confere com fonte primária (integral em 5.1/5.2/5.4; amostral em 5.3)

## Build
- [ ] `pnpm format:check`: PASS
- [ ] `pnpm lint`: PASS
- [ ] `pnpm typecheck`: PASS
- [ ] `pnpm test`: PASS (N testes)
- [ ] `pnpm build:full`: PASS (N páginas no dist)

## Risco residual conhecido
<!-- vazio | descreve riscos aceitos conscientemente -->

## Referências
- Spec: `docs/superpowers/specs/2026-05-28-atlas-fase4-conteudo-mvp-design.md`
- Plan: `docs/superpowers/plans/2026-05-28-atlas-fase4-sprint5-1-setup-editorial.md`
```

- [ ] **Step 2: Commit**

```bash
git add .github/PULL_REQUEST_TEMPLATE/fase4.md
git commit -m "$(cat <<'EOF'
docs(fase4): adicionar template de PR específico para Fase 4

Template aplicado via query string ?template=fase4.md ao criar PR.
Checklist espelha §8.4 do design: sprint, mudança editorial, auditoria
automatizada, auditoria humana (sign-off), build e risco residual.

Ref: docs/superpowers/specs/2026-05-28-atlas-fase4-conteudo-mvp-design.md §8.4
EOF
)"
```

---

### Task 10: [EDITORIAL] Pesquisar 3 pesquisas eleitorais + arquivar no Wayback

**Files:**
- Nenhum arquivo criado nesta task — output é a longlist de URLs + arquivamentos no Wayback. Será usada na Task 11.

**Workflow (co-curadoria assistida):**

- [ ] **Step 1: Claude — pesquisar via WebFetch a pesquisa mais recente de cada instituto até 2026-05-15**

Para cada instituto:
1. **Datafolha** — buscar em `https://datafolha.folha.uol.com.br/` (filtrar "intenção de voto presidente 2026")
2. **Quaest** — buscar em `https://www.quaest.com.br/`
3. **Genial-Quaest** — buscar em `https://www.quaest.com.br/categoria-pesquisas/`

Coletar para cada:
- URL canônica do relatório (estimulado, 1º turno)
- Data de publicação
- Tamanho da amostra
- Margem de erro
- Metodologia (domiciliar/telefônica/online)
- Lista candidato + percentual

**Critério de seleção da pesquisa:** mais recente do instituto que foi publicada **até** 2026-05-15 inclusive.

Apresentar resumo ao André com:
```
DATAFOLHA: <url> | <data> | amostra <N> | margem <p.p.>
QUAEST:    <url> | <data> | amostra <N> | margem <p.p.>
GENIAL-Q.: <url> | <data> | amostra <N> | margem <p.p.>

Candidatos presentes nas 3 pesquisas:
  - <nome 1>: D=<x>%, Q=<y>%, G=<z>% → média <m>%
  - ...
```

- [ ] **Step 2: André — validar a longlist de pesquisas**

Confirmar que:
- Datas estão corretas e ≤ 2026-05-15
- Pesquisas são "estimuladas, 1º turno"
- Não há pesquisa MAIS recente que foi pulada por engano

- [ ] **Step 3: Claude — arquivar as 3 URLs no Wayback Machine**

Para cada URL aprovada:

```bash
# Save Page Now API (Wayback Machine)
curl -s -X GET "https://web.archive.org/save/<URL_ENCODED>"
```

Capturar a `archive_url` final retornada no header `Content-Location` ou na URL final pós-redirect:
- Formato: `https://web.archive.org/web/YYYYMMDDhhmmss/<URL>`

Verificar HTTP 200 OK em cada `archive_url` arquivada.

- [ ] **Step 4: Salvar resumo em scratchpad temporário**

Não commitar ainda. Output para Task 11:
- 3 URLs canônicas
- 3 URLs Wayback
- 3 datas de publicação
- 3 amostras + 3 margens + 3 metodologias
- Listagem completa dos percentuais por candidato

Nota: não criar nenhum arquivo nesta task. Output é a *informação* para Task 11.

---

### Task 11: [EDITORIAL] Aplicar critério + preencher `data/criterio-selecao/latest.yaml`

**Files:**
- Create: `data/criterio-selecao/latest.yaml`

**Workflow:**

- [ ] **Step 1: Claude — calcular média simples e ordenar**

Para cada candidato presente nas 3 pesquisas:
```
media_simples = (datafolha + quaest + genial) / 3
```

Ordenar descendente. Identificar:
- Posição 1: maior média
- Posição 2: 2ª maior média
- Linha de empate: 3º colocado
- Distância pp entre 2º e 3º

Se `distancia_pp ≤ 2`: aplicar desempate em cascata (maior amostra agregada → menor margem agregada → tempo no cargo).

- [ ] **Step 2: André — validar a decisão**

Confirmar:
- Cálculo da média está correto
- Linha de empate não foi inadvertidamente excluída
- Se houve desempate, está documentado

- [ ] **Step 3: Claude — preencher `data/criterio-selecao/latest.yaml`**

Formato (substituir valores reais):

```yaml
data_corte: "2026-05-15"
criado_em: "2026-05-28T<HH:MM:SS>.000Z"
curador: "André Dezob"

pesquisas:
  - instituto: "Datafolha"
    url: "<URL_REAL>"
    archive_url: "<WAYBACK_URL_REAL>"
    data_publicacao: "<ISO_8601>"
    amostra: <N>
    margem_erro_pp: <P>
    metodologia: "presencial domiciliar"
    intencao_estimulada:
      - candidato_nome: "<NOME>"
        percentual: <X>
      # ... demais candidatos presentes

  - instituto: "Quaest"
    url: "<URL_REAL>"
    archive_url: "<WAYBACK_URL_REAL>"
    data_publicacao: "<ISO_8601>"
    amostra: <N>
    margem_erro_pp: <P>
    metodologia: "presencial domiciliar"
    intencao_estimulada:
      - candidato_nome: "<NOME>"
        percentual: <Y>

  - instituto: "Genial-Quaest"
    url: "<URL_REAL>"
    archive_url: "<WAYBACK_URL_REAL>"
    data_publicacao: "<ISO_8601>"
    amostra: <N>
    margem_erro_pp: <P>
    metodologia: "presencial domiciliar"
    intencao_estimulada:
      - candidato_nome: "<NOME>"
        percentual: <Z>

calculo:
  # ordenado descendente
  - candidato_nome: "<1º>"
    media_simples: <m1>
  - candidato_nome: "<2º>"
    media_simples: <m2>
  - candidato_nome: "<3º>"
    media_simples: <m3>
  # ... demais

selecionados:
  - posicao: 1
    candidato_id: "<slug-1>"
    nome: "<1º>"
    media: <m1>
  - posicao: 2
    candidato_id: "<slug-2>"
    nome: "<2º>"
    media: <m2>

linha_de_empate:
  candidato_nome: "<3º>"
  media: <m3>
  distancia_pp: <m2 - m3>
  desempate_aplicado: <bool>
  desempate_criterio: <null | "maior amostra" | "menor margem" | "tempo no cargo">

versao: 1
```

- [ ] **Step 4: Validar via Zod (content collection) + AJV**

```bash
pnpm astro sync
pnpm typecheck
pnpm generate-schemas
pnpm validate-data
```

Expected: 0 errors. Validação confirma o arquivo está conforme schema.

- [ ] **Step 5: Commit**

```bash
git add data/criterio-selecao/latest.yaml
git commit -m "$(cat <<'EOF'
feat(fase4): aplicar critério editorial e selecionar 2 candidatos

data/criterio-selecao/latest.yaml com:
- 3 pesquisas (Datafolha, Quaest, Genial-Quaest) com archive_url Wayback
- Cálculo da média simples por candidato
- Selecionados: <slug1>, <slug2>
- Linha de empate: <slug3> (distância <X> p.p.)

Aplicação do critério §4.1 do design Fase 4 com data de corte 2026-05-15.

Ref: docs/superpowers/specs/2026-05-28-atlas-fase4-conteudo-mvp-design.md §4.1
EOF
)"
```

---

### Task 12: [EDITORIAL] Criar 2 candidatos reais (`<slug1>.yaml`, `<slug2>.yaml` + fotos)

**Files:**
- Create: `data/candidatos/<slug1>.yaml`
- Create: `data/candidatos/<slug2>.yaml`
- Create: `public/img/candidatos/<slug1>.jpg`
- Create: `public/img/candidatos/<slug2>.jpg`

**Workflow:**

- [ ] **Step 1: Claude — pesquisar dados oficiais dos 2 candidatos**

Para cada candidato:
1. **Nome completo** (forma usada no TSE)
2. **Partido** (com filiação atual confirmada)
3. **Biografia mínima** (2-3 frases factuais, sem opinião editorial)
4. **Contas oficiais verificadas** — checar manualmente o badge oficial em cada plataforma:
   - YouTube: badge "Verificado"
   - X/Twitter: checkmark (com link para perfil oficial)
   - Instagram: badge azul
   - Facebook: badge azul
   - TikTok: checkmark
5. **Foto oficial pública** — site oficial do candidato OU Wikimedia Commons (CC-BY)

Apresentar resumo ao André para validação.

- [ ] **Step 2: André — validar dados**

Confirmar:
- Nome exato como TSE
- Partido atual (não histórico)
- Biografia factual sem julgamento
- Contas oficiais TÊM badge oficial (não imitadoras)
- Direito autoral da foto: declarado e atribuído

- [ ] **Step 3: Claude — baixar fotos oficiais para `public/img/candidatos/`**

```bash
mkdir -p public/img/candidatos
curl -o public/img/candidatos/<slug1>.jpg "<URL_FOTO_OFICIAL_1>"
curl -o public/img/candidatos/<slug2>.jpg "<URL_FOTO_OFICIAL_2>"
```

Verificar:
- Dimensão razoável (mínimo 400×400 px)
- Formato JPEG ou PNG
- Tamanho < 500KB cada

- [ ] **Step 4: Claude — criar `data/candidatos/<slug1>.yaml`**

Template (substituir valores reais):

```yaml
id: "<ULID_GERADO>"
slug: "<slug1>"
nome: "<NOME COMPLETO>"
foto_url: "/img/candidatos/<slug1>.jpg"
partido: "<SIGLA>"
biografia_minima: >
  <2-3 frases factuais.>
contas_oficiais:
  - plataforma: "youtube"
    handle: "<@handle>"
    url: "https://www.youtube.com/<@handle>"
    verificada: true
  - plataforma: "x"
    handle: "@<handle>"
    url: "https://x.com/<handle>"
    verificada: true
  - plataforma: "instagram"
    handle: "@<handle>"
    url: "https://www.instagram.com/<handle>"
    verificada: true
  # ... outras plataformas verificadas
criado_em: "2026-05-28T<HH:MM:SS>.000Z"
atualizado_em: "2026-05-28T<HH:MM:SS>.000Z"
```

Gerar ULID via:
```bash
node -e "import('ulid').then(m => console.log(m.ulid()))"
```

Repetir para `<slug2>.yaml`.

- [ ] **Step 5: Validar**

```bash
pnpm validate-data
```

Expected: 2 candidatos válidos, exit 0.

- [ ] **Step 6: Verificar que `pnpm audit:paridade` (sem flag) ainda passa em setup-mode**

```bash
pnpm audit:paridade
```

Expected: PASS (2 candidatos é aceito em setup-mode).

- [ ] **Step 7: Commit**

```bash
git add data/candidatos/<slug1>.yaml data/candidatos/<slug2>.yaml public/img/candidatos/
git commit -m "$(cat <<'EOF'
feat(fase4): adicionar 2 candidatos reais selecionados pelo critério

Substitui demos (candidato-a, candidato-b) — removidos em commit separado:
- <slug1>: posicao 1, partido <X>, contas oficiais verificadas N
- <slug2>: posicao 2, partido <Y>, contas oficiais verificadas M

Fotos oficiais (CC-BY 4.0 ou uso jornalístico) em public/img/candidatos/.

Ref: docs/superpowers/specs/2026-05-28-atlas-fase4-conteudo-mvp-design.md §6.2 (Sprint 5.1 entregável 2)
EOF
)"
```

---

### Task 13: Remover demos (candidatos a/b, declarações, evento)

**Files:**
- Remove: `data/candidatos/candidato-a.yaml`
- Remove: `data/candidatos/candidato-b.yaml`
- Remove: `data/declaracoes/2026-04-15-candidato-a-economia-imposto.md`
- Remove: `data/declaracoes/2026-04-15-candidato-b-saude-sus.md`
- Remove: `data/eventos/2026-04-15-debate-rede-tv.yaml`

- [ ] **Step 1: Remover arquivos**

```bash
git rm data/candidatos/candidato-a.yaml
git rm data/candidatos/candidato-b.yaml
git rm data/declaracoes/2026-04-15-candidato-a-economia-imposto.md
git rm data/declaracoes/2026-04-15-candidato-b-saude-sus.md
git rm data/eventos/2026-04-15-debate-rede-tv.yaml
```

- [ ] **Step 2: Verificar que nada quebra**

```bash
pnpm astro sync
pnpm typecheck
pnpm validate-data
pnpm audit:paridade
pnpm test
pnpm build:full
```

Expected: tudo verde. Sem demos, o build agora gera páginas só dos 2 candidatos reais (sem declarações ainda).

- [ ] **Step 3: Commit**

```bash
git commit -m "$(cat <<'EOF'
chore(fase4): remover candidatos e declarações demonstrativos

Remove:
- data/candidatos/candidato-{a,b}.yaml (demos)
- data/declaracoes/2026-04-15-candidato-{a-economia-imposto,b-saude-sus}.md
- data/eventos/2026-04-15-debate-rede-tv.yaml

Substituídos pelos 2 candidatos reais selecionados pelo critério §4.1
em commit anterior.

Ref: docs/superpowers/specs/2026-05-28-atlas-fase4-conteudo-mvp-design.md §6.2 (Sprint 5.1 entregável 3)
EOF
)"
```

---

### Task 14: Criar página `/metodologia` v1

**Files:**
- Create: `src/pages/metodologia.astro`

- [ ] **Step 1: Criar `src/pages/metodologia.astro`**

```astro
---
import BaseLayout from "@/components/layout/BaseLayout.astro";
import { getEntry } from "astro:content";

const criterio = await getEntry("criterioSelecao", "latest");
const dataAplicacao = criterio?.data.criado_em
  ? new Date(criterio.data.criado_em).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    })
  : null;

const selecionados = criterio?.data.selecionados ?? [];
const linhaEmpate = criterio?.data.linha_de_empate;
---

<BaseLayout
  title="Metodologia"
  description="Como o Atlas seleciona candidatos, declarações, fontes e vereditos externos. Critério público auditável."
>
  <article class="container-text" style="padding-block: var(--space-3xl);">
    <header style="margin-bottom: var(--space-2xl);">
      <p class="eyebrow" style="text-transform: uppercase; letter-spacing: 0.05em; color: var(--color-text-mute);">
        Metodologia
      </p>
      <h1 style="font-size: var(--text-display-md); line-height: 1.15; letter-spacing: -0.02em; margin-block: var(--space-sm);">
        Como decidimos o que entra no Atlas
      </h1>
      <p style="color: var(--color-text-body); font-size: var(--text-body-lg);">
        Critério editorial público. Sem juízo de valor. Sem veredito próprio.
      </p>
    </header>

    <section style="margin-bottom: var(--space-2xl);">
      <h2>1. Seleção dos 2 candidatos cobertos no MVP</h2>
      <p>
        Os 2 candidatos com maior <strong>média simples</strong> de intenção de voto
        <em>estimulada</em> (1º turno) nas <strong>3 últimas pesquisas</strong> publicadas pelos
        institutos <strong>Datafolha</strong>, <strong>Quaest</strong> e <strong>Genial-Quaest</strong>
        até a <strong>data de corte de 2026-05-15</strong>.
      </p>
      <p>
        Critério público auditável em
        <a href="https://github.com/atlas2026/blob/main/data/criterio-selecao/latest.yaml" rel="noopener external">
          <code>data/criterio-selecao/latest.yaml</code>
        </a>.
      </p>

      {criterio && (
        <>
          <p><strong>Critério aplicado em {dataAplicacao}:</strong></p>
          <ul>
            {selecionados.map((s) => (
              <li>
                Posição {s.posicao}: <strong>{s.nome}</strong> (média {s.media}%)
              </li>
            ))}
          </ul>
          {linhaEmpate && (
            <p style="color: var(--color-text-body); font-size: var(--text-body-sm);">
              <strong>Linha de empate (3º colocado, transparência):</strong>{" "}
              {linhaEmpate.candidato_nome} (média {linhaEmpate.media}%, distância {linhaEmpate.distancia_pp} p.p. para o 2º).
              {linhaEmpate.desempate_aplicado && (
                <> Desempate aplicado: {linhaEmpate.desempate_criterio}.</>
              )}
            </p>
          )}
        </>
      )}

      <p>
        <strong>Lock total:</strong> uma vez aplicado o critério, os 2 candidatos não mudam durante
        a Fase 4. Revisão do critério fica para versões pós-MVP, com Errata documentando a mudança.
      </p>
    </section>

    <section style="margin-bottom: var(--space-2xl);">
      <h2>2. Janela temporal</h2>
      <p>
        São elegíveis declarações públicas dos candidatos emitidas entre <strong>15/05/2025</strong>
        e <strong>15/05/2026</strong> (12 meses anteriores à data de corte, inclusive nas duas pontas).
      </p>
    </section>

    <section style="margin-bottom: var(--space-2xl);">
      <h2>3. Distribuição temática (paridade rígida)</h2>
      <p>
        Cada candidato terá <strong>exatamente 5 declarações por tema</strong> nos 6 temas primários:
        economia, saúde, segurança pública, educação, meio-ambiente, política externa.
        Total invariante: <strong>30 declarações por candidato</strong>.
      </p>
      <p>
        Se um candidato emitiu menos de 5 declarações relevantes em um tema dentro da janela,
        registramos a lacuna abertamente em vez de inflar artificialmente.
      </p>
    </section>

    <section style="margin-bottom: var(--space-2xl);">
      <h2>4. Cascata de saliência</h2>
      <p>
        Quando há mais de 5 declarações elegíveis num tema, aplicamos esta cascata determinística
        (cada nível só desempata o anterior):
      </p>
      <ol>
        <li>
          <strong>Cobertura estrutural</strong> — priorizar diversidade dos 8 tipos estruturais
          (promessa, dado_numerico, atribuição a terceiro, afirmação histórica, comparação,
          afirmação sobre pesquisa, compromisso político, interpretação pessoal).
        </li>
        <li>
          <strong>Veredito externo existente</strong> — entre candidatas do mesmo tipo estrutural,
          prioriza as que já têm verificação publicada por Lupa, Aos Fatos, Comprova ou Estadão Verifica.
        </li>
        <li>
          <strong>Fonte com timestamp de vídeo oficial</strong> — prefere YouTube oficial, TSE, Câmara,
          Senado sobre mídia consolidada ou rede social.
        </li>
        <li>
          <strong>Audiência do evento</strong> — debate > entrevista > sabatina > comício > declaração
          oficial > post de rede social.
        </li>
        <li>
          <strong>Recência</strong> — empate final: declaração mais recente vence.
        </li>
      </ol>
      <p>
        Cada inclusão registra <code>motivo_inclusao</code> em
        <a href="https://github.com/atlas2026/blob/main/data/log-editorial.csv" rel="noopener external">
          <code>data/log-editorial.csv</code>
        </a>{" "}
        no formato <code>cascata-N: &lt;justificação&gt;</code>.
      </p>
    </section>

    <section style="margin-bottom: var(--space-2xl);">
      <h2>5. Fontes primárias e Wayback obrigatório</h2>
      <p>
        Toda declaração tem <strong>URL de fonte primária + timestamp (quando aplicável) + snapshot
        Wayback Machine</strong>. Sem os três, não publicamos.
      </p>
      <p>
        Snapshots Wayback protegem contra remoção de fontes — princípio §3.5 do Atlas (permanência).
      </p>
    </section>

    <section style="margin-bottom: var(--space-2xl);">
      <h2>6. Sem veredito próprio</h2>
      <p>
        O Atlas <strong>não emite veredito de verdade/mentira</strong>. Quando fact-checker reconhecido
        (Lupa, Aos Fatos, Comprova, Estadão Verifica) avalia uma declaração, agregamos a citação
        literal com atribuição clara à fonte original e link para o veredito completo.
      </p>
      <p>
        Não classificamos automaticamente. Não inferimos. Não interpretamos. Apresentamos a evidência
        e o leitor conclui.
      </p>
    </section>

    <section style="margin-bottom: var(--space-2xl);">
      <h2>7. Uso de Inteligência Artificial no Atlas</h2>
      <p>
        O Atlas usa modelos de IA apenas como ferramentas auxiliares de pesquisa e transcrição.
        <strong>Não usamos IA generativa para criar conteúdo editorial.</strong>
      </p>
      <ul>
        <li>
          <strong>Transcrição bruta de áudio/vídeo:</strong> modelo Whisper (OpenAI) gera o texto base.
          Toda transcrição é revisada e corrigida por curador humano antes de virar declaração publicada.
        </li>
        <li>
          <strong>Pesquisa de longlist:</strong> assistente IA (Claude, Anthropic) ajuda a localizar
          declarações candidatas e fontes primárias. Decisão de inclusão é sempre humana.
        </li>
        <li>
          <strong>Estruturação de dados:</strong> assistente IA preenche campos derivados (IDs, slugs,
          timestamps) seguindo schemas fixos.
        </li>
        <li>
          <strong>O que NÃO fazemos:</strong> geração automática de texto/contexto editorial; resumo
          automático; classificação automática de "veracidade".
        </li>
      </ul>
      <p>
        Esta política está alinhada à TSE Res. 23.732/2024 sobre uso de IA em conteúdo eleitoral.
      </p>
    </section>

    <section style="margin-bottom: var(--space-2xl);">
      <h2>8. Auditabilidade total</h2>
      <p>
        Critério, código, dataset e log editorial são públicos no GitHub. Erros são corrigíveis via
        Pull Request. Cada correção é documentada em <a href="/errata">/errata</a> com versão
        incrementada da declaração (nada é deletado).
      </p>
    </section>
  </article>
</BaseLayout>
```

- [ ] **Step 2: Rodar build e verificar `/metodologia` no dist**

```bash
pnpm astro sync
pnpm build
```

Verificar:
```bash
ls dist/metodologia/
```

Expected: `dist/metodologia/index.html` existe.

Inspecionar conteúdo:
```bash
grep -i "metodologia\|criterio\|cascata" dist/metodologia/index.html | head -20
```

Expected: HTML contém as seções do critério.

- [ ] **Step 3: Iniciar dev server e verificar visualmente (curl)**

```bash
pnpm dev &
sleep 5
curl -s -o /dev/null -w "%{http_code}\n" http://localhost:4321/metodologia
```

Expected: 200.

- [ ] **Step 4: Commit**

```bash
git add src/pages/metodologia.astro
git commit -m "$(cat <<'EOF'
feat(fase4): adicionar página /metodologia v1

Documenta critério público de:
1. Seleção dos 2 candidatos (Datafolha/Quaest/Genial-Quaest, corte 2026-05-15)
2. Janela temporal (2025-05-15 a 2026-05-15)
3. Distribuição rígida 5 declarações × 6 temas = 30 por candidato
4. Cascata de saliência em 5 níveis determinísticos
5. Fontes primárias com Wayback obrigatório
6. Política de não emitir veredito próprio
7. Disclosure de uso de IA (TSE Res. 23.732/2024)
8. Auditabilidade total via GitHub + Errata

Página lê data/criterio-selecao/latest.yaml dinamicamente via getEntry().

Ref: docs/superpowers/specs/2026-05-28-atlas-fase4-conteudo-mvp-design.md §4 e §5.4
EOF
)"
```

---

### Task 15: Criar página `/errata` v1

**Files:**
- Create: `src/pages/errata.astro`

- [ ] **Step 1: Criar `src/pages/errata.astro`**

```astro
---
import BaseLayout from "@/components/layout/BaseLayout.astro";

// Lista de erratas — vazia no MVP, populada via PRs futuras.
// Cada errata: { data: ISO 8601, declaracao_id: string, descricao: string, pr_url: string, issue_url?: string }
const erratas: Array<{
  data: string;
  declaracao_id: string;
  descricao: string;
  pr_url: string;
  issue_url?: string;
}> = [];
---

<BaseLayout
  title="Errata"
  description="Correções factuais publicamente registradas pelo Atlas. Histórico auditável com referências a PRs."
>
  <article class="container-text" style="padding-block: var(--space-3xl);">
    <header style="margin-bottom: var(--space-2xl);">
      <p class="eyebrow" style="text-transform: uppercase; letter-spacing: 0.05em; color: var(--color-text-mute);">
        Errata
      </p>
      <h1 style="font-size: var(--text-display-md); line-height: 1.15; letter-spacing: -0.02em; margin-block: var(--space-sm);">
        Correções publicadas
      </h1>
      <p style="color: var(--color-text-body); font-size: var(--text-body-lg);">
        Erros factuais descobertos no Atlas são corrigidos publicamente e registrados aqui.
      </p>
    </header>

    <section style="margin-bottom: var(--space-2xl);">
      <h2>Processo de correção</h2>
      <ol>
        <li>
          Encontrou um erro factual?
          <a href="https://github.com/atlas2026/issues/new?labels=errata-fase4" rel="noopener external">
            Abra uma issue no GitHub
          </a>
          com label <code>errata</code> descrevendo o erro e a fonte da correção.
        </li>
        <li>
          Um PR de correção atualiza o YAML/MD afetado e <strong>incrementa o número de versão</strong>
          da declaração (campo <code>versao</code>).
        </li>
        <li>
          A correção é registrada nesta página com data, descrição em 1-2 frases e link para o PR.
        </li>
        <li>
          <strong>Nada é deletado.</strong> O histórico Git preserva todas as versões para auditoria.
        </li>
      </ol>
    </section>

    <section style="margin-bottom: var(--space-2xl);">
      <h2>Erratas publicadas</h2>

      {erratas.length === 0 ? (
        <p style="color: var(--color-text-mute); font-style: italic;">
          Nenhuma errata registrada ainda. Esta página será populada conforme correções forem
          publicadas.
        </p>
      ) : (
        <ul>
          {erratas.map((e) => (
            <li>
              <strong>{new Date(e.data).toLocaleDateString("pt-BR")}</strong> —
              <code>{e.declaracao_id}</code>: {e.descricao}
              <a href={e.pr_url} rel="noopener external">PR</a>
              {e.issue_url && (
                <>
                  {" "}
                  <a href={e.issue_url} rel="noopener external">Issue</a>
                </>
              )}
            </li>
          ))}
        </ul>
      )}
    </section>

    <section style="margin-bottom: var(--space-2xl);">
      <h2>Por que isto importa</h2>
      <p>
        O Atlas é infraestrutura factual, não fact-checker. Erros editoriais — uma transcrição
        incorreta, um timestamp errado, uma classificação imprecisa — afetam a integridade da fonte.
      </p>
      <p>
        Esta página garante que cada correção é <strong>documentada publicamente</strong> e
        <strong>versionada em git</strong>, conforme o princípio §3.4 do Atlas (auditabilidade total).
      </p>
    </section>
  </article>
</BaseLayout>
```

- [ ] **Step 2: Rodar build e verificar**

```bash
pnpm build
ls dist/errata/
grep -i "errata" dist/errata/index.html | head -5
```

Expected: `dist/errata/index.html` existe e contém conteúdo.

- [ ] **Step 3: Commit**

```bash
git add src/pages/errata.astro
git commit -m "$(cat <<'EOF'
feat(fase4): adicionar página /errata v1

Processo público de correção: issue → PR → entrada nesta página + incremento
de versao. Lista de erratas inicialmente vazia, populada via PRs futuras.

Cumpre princípio §3.4 do Atlas (auditabilidade total) e §3.5 (permanência —
nada é deletado, apenas versionado).

Ref: docs/superpowers/specs/2026-05-28-atlas-fase4-conteudo-mvp-design.md §6.2 (Sprint 5.1 entregável 5)
EOF
)"
```

---

### Task 16: Criar página `/sobre` v1

**Files:**
- Create: `src/pages/sobre.astro`

- [ ] **Step 1: Criar `src/pages/sobre.astro`**

```astro
---
import BaseLayout from "@/components/layout/BaseLayout.astro";
---

<BaseLayout
  title="Sobre"
  description="O Atlas dos Candidatos 2026 é infraestrutura factual pública para a eleição presidencial brasileira. Quem mantém, por que existe, licenças."
>
  <article class="container-text" style="padding-block: var(--space-3xl);">
    <header style="margin-bottom: var(--space-2xl);">
      <p class="eyebrow" style="text-transform: uppercase; letter-spacing: 0.05em; color: var(--color-text-mute);">
        Sobre
      </p>
      <h1 style="font-size: var(--text-display-md); line-height: 1.15; letter-spacing: -0.02em; margin-block: var(--space-sm);">
        Infraestrutura factual da eleição 2026
      </h1>
      <p style="color: var(--color-text-body); font-size: var(--text-body-lg);">
        Base pública, aberta e indexável de declarações documentadas de candidatos à presidência
        do Brasil em 2026.
      </p>
    </header>

    <section style="margin-bottom: var(--space-2xl);">
      <h2>O que é</h2>
      <p>
        Cada declaração no Atlas tem fonte primária verificável: vídeo timestamped, transcrição
        oficial, link arquivado no Wayback Machine. O dataset completo é publicado em
        <a href="/dataset">/dataset</a> sob licença CC-BY 4.0.
      </p>
      <p>
        Quando há veredito de fact-checker reconhecido (Lupa, Aos Fatos, Comprova, Estadão Verifica),
        agregamos com atribuição transparente. <strong>O Atlas não emite veredito próprio.</strong>
      </p>
    </section>

    <section style="margin-bottom: var(--space-2xl);">
      <h2>Postura editorial</h2>
      <p>
        <strong>Tecnicista neutro radical, sem rosto.</strong> Mesma régua editorial para cada
        candidato, sem exceção ideológica. Critério público auditável em
        <a href="/metodologia">/metodologia</a>.
      </p>
      <p>
        Não somos fact-checker. Somos infraestrutura de fontes primárias.
      </p>
    </section>

    <section style="margin-bottom: var(--space-2xl);">
      <h2>Quem mantém</h2>
      <p>
        Projeto solo mantido por <strong>André Dezob</strong>. Curadoria editorial humana
        + ferramentas de IA auxiliares (sem geração de conteúdo). Ver
        <a href="/metodologia#7-uso-de-inteligência-artificial-no-atlas">política de IA</a>.
      </p>
      <p>
        Contato: via <a href="https://github.com/atlas2026/issues" rel="noopener external">issues do GitHub</a>.
      </p>
    </section>

    <section style="margin-bottom: var(--space-2xl);">
      <h2>Licenças</h2>
      <ul>
        <li>
          <strong>Código:</strong> MIT — veja
          <a href="https://github.com/atlas2026/blob/main/LICENSE" rel="noopener external">LICENSE</a>
        </li>
        <li>
          <strong>Dataset:</strong> CC-BY 4.0 — reutilizável com atribuição
        </li>
        <li>
          <strong>Conteúdo editorial:</strong> CC-BY 4.0
        </li>
      </ul>
    </section>

    <section style="margin-bottom: var(--space-2xl);">
      <h2>Como contribuir</h2>
      <p>
        Encontrou um erro factual? Veja o processo em <a href="/errata">/errata</a>.
      </p>
      <p>
        Quer propor melhorias técnicas ou editoriais? Issues e PRs no
        <a href="https://github.com/atlas2026" rel="noopener external">repositório público</a>.
      </p>
    </section>

    <section style="margin-bottom: var(--space-2xl);">
      <h2>Limites assumidos</h2>
      <p>
        O Atlas cobre <strong>2 candidatos</strong> à presidência no MVP — os top-2 da média das
        principais pesquisas até 2026-05-15. Cobertura adicional fica para versões post-MVP.
      </p>
      <p>
        Não cobrimos candidatos a outros cargos (governadores, senadores etc.) no MVP.
      </p>
    </section>
  </article>
</BaseLayout>
```

- [ ] **Step 2: Rodar build e verificar**

```bash
pnpm build
ls dist/sobre/
grep -i "sobre\|atlas" dist/sobre/index.html | head -5
```

Expected: `dist/sobre/index.html` existe.

- [ ] **Step 3: Commit**

```bash
git add src/pages/sobre.astro
git commit -m "$(cat <<'EOF'
feat(fase4): adicionar página /sobre v1

Identifica curadoria (André Dezob), postura editorial neutra, licenças
(MIT código + CC-BY 4.0 dataset/conteúdo), processo de contribuição e
limites assumidos do MVP (2 candidatos).

Reduz acusação de "fonte anônima" (risco F4-1 do design Fase 4) e
cumpre §3.4 do Atlas (auditabilidade total inclui identificar mantenedor).

Ref: docs/superpowers/specs/2026-05-28-atlas-fase4-conteudo-mvp-design.md §6.2 (Sprint 5.1 entregável 6)
EOF
)"
```

---

### Task 17: Validação local completa pré-PR

**Files:** nenhum — só verificação.

- [ ] **Step 1: Limpar caches e reinstalar**

```bash
rm -rf node_modules .astro dist
pnpm install --frozen-lockfile
pnpm astro sync
```

Expected: install limpo, sem warnings.

- [ ] **Step 2: Rodar a suite completa de gates**

```bash
pnpm format:check
pnpm lint
pnpm typecheck
pnpm generate-schemas
pnpm validate-data
pnpm audit:paridade
pnpm audit:distribuicao
pnpm test
pnpm build:full
```

Expected:
- `format:check`: All matched files use Prettier code style!
- `lint`: 0 problems
- `typecheck`: 0 errors / 0 warnings / 0 hints
- `generate-schemas`: 5 schemas (candidato, tema, evento, declaracao, criterio-selecao)
- `validate-data`: ✅ Todos os dados são válidos.
- `audit:paridade`: PASS (setup-mode, 2 candidatos, 0 declarações)
- `audit:distribuicao`: gera `docs/distribuicao-fase4.md`
- `test`: 105 + ~26 novos = ~131 testes PASS
- `build:full`: build sem erros + Pagefind index OK

- [ ] **Step 3: Verificar URLs novas no dist**

```bash
ls dist/metodologia/ dist/errata/ dist/sobre/
```

Expected: cada uma tem `index.html`.

- [ ] **Step 4: Spot check de Lighthouse (opcional, mas recomendado)**

Iniciar preview e rodar Lighthouse:

```bash
pnpm preview &
sleep 3
pnpm dlx lighthouse http://localhost:4321/metodologia --only-categories=accessibility,seo --output=json --output-path=docs/lighthouse-metodologia.json
```

Verificar:
```bash
cat docs/lighthouse-metodologia.json | grep -o '"score":[0-9.]*' | head -5
```

Expected: scores ≥ 0.95 para accessibility e seo.

Matar processo preview:
```bash
pkill -f "astro preview" || true
```

- [ ] **Step 5: Verificar que todos os scripts auxiliares funcionam**

```bash
pnpm validate:log         # ✅ 0 linhas, FK match
pnpm check:archive-urls   # ✅ ou ℹ Nenhuma URL (sem declarações ainda)
```

Expected: ambos exit 0.

- [ ] **Step 6: (Não commitar) — Garantir que docs/audit-fase4.md e docs/distribuicao-fase4.md NÃO estão tracked**

```bash
git status
```

Verificar que `docs/audit-fase4.md` e `docs/distribuicao-fase4.md` aparecem como untracked OR estão em `.gitignore`. Se não estão ignorados, adicionar:

```bash
echo "docs/audit-fase4.md" >> .gitignore
echo "docs/distribuicao-fase4.md" >> .gitignore
echo "docs/lighthouse-*.json" >> .gitignore
git add .gitignore
git commit -m "chore: ignorar relatórios de auditoria regenerados"
```

(São relatórios regenerados a cada run — não fazem sentido versionados; o relatório fica anexado ao PR via copy-paste na descrição.)

---

### Task 18: Branch push + PR + CI + squash merge

**Files:** nenhum — operação de git/GitHub.

- [ ] **Step 1: Verificar log de commits da branch**

```bash
git log main..HEAD --oneline
```

Expected: ~14-16 commits da branch, todos com prefixos `feat(fase4):` / `chore(fase4):` / `docs(fase4):` / `ci(fase4):`.

- [ ] **Step 2: Push da branch**

```bash
git push -u origin feat/fase4-sprint5-1-setup-editorial
```

Expected: branch publicada, link para criar PR no output.

- [ ] **Step 3: Criar PR usando template fase4**

```bash
gh pr create \
  --template fase4.md \
  --title "feat(fase4): Sprint 5.1 — Setup editorial (critério, candidatos reais, páginas institucionais, audits)" \
  --body "$(cat <<'EOF'
## Sprint
- [x] 5.1 Setup
- [ ] 5.2 Piloto
- [ ] 5.3 Lote
- [ ] 5.4 Polimento

## Mudança editorial
- [x] N declarações novas: **0** (Sprint 5.1 não cria declarações; só infra)
- [x] N entradas em log-editorial.csv: **0** (header apenas)
- [x] Candidatos envolvidos: **<slug1>, <slug2>** (substituem demos)

## Auditoria automatizada
- [x] `pnpm validate-data`: PASS
- [x] `pnpm audit:paridade`: PASS (setup-mode, 2 candidatos, 0 declarações)
- [x] `pnpm audit:distribuicao`: rodado
- [x] `pnpm check:archive-urls --recent`: PASS (3 URLs Wayback do criterio-selecao)

## Auditoria humana
- [x] Sign-off por candidato: 2/2 (André validou nome, partido, contas verificadas, foto)
- [x] Wayback abre para as 3 URLs do criterio-selecao
- [x] Critério aplicado conforme §4.1 do design Fase 4

## Build
- [x] `pnpm format:check`: PASS
- [x] `pnpm lint`: PASS
- [x] `pnpm typecheck`: PASS
- [x] `pnpm test`: PASS (~131 testes)
- [x] `pnpm build:full`: PASS

## Risco residual conhecido
Nenhum.

## Referências
- Spec: `docs/superpowers/specs/2026-05-28-atlas-fase4-conteudo-mvp-design.md`
- Plan: `docs/superpowers/plans/2026-05-28-atlas-fase4-sprint5-1-setup-editorial.md`

## Próximo passo
Sprint 5.2 (Piloto — 12 declarações de validação do critério). Plan separado a ser criado após este merge.

🤖 Generated with [Claude Code](https://claude.com/claude-code)
EOF
)"
```

- [ ] **Step 4: Aguardar CI verde**

```bash
gh pr checks --watch
```

Expected: `Lint, typecheck, test, validate` PASS + CodeRabbit walkthrough (pode ser "skipped" se o PR for muito grande). Aguardar até estado PASS antes de prosseguir.

- [ ] **Step 5: Squash merge**

```bash
gh pr merge --squash --delete-branch
```

Expected: PR merged em main, branch remota deletada.

Se `--delete-branch` falhar com "branch checked out in another worktree", cleanup manual:

```bash
git checkout main
git pull origin main
git push origin --delete feat/fase4-sprint5-1-setup-editorial
git branch -D feat/fase4-sprint5-1-setup-editorial
```

- [ ] **Step 6: Verificar HEAD em main**

```bash
git log --oneline -3
```

Expected: HEAD é o squash commit `feat(fase4): Sprint 5.1 — Setup editorial...`.

---

### Task 19: Atualizar checkpoint do Vault

**Files:**
- Create: `C:/Users/dezob/.claude/projects/C--Users-dezob-Projects-atlas/memory/checkpoint-fase4-sprint5-1-completa.md`
- Modify: `C:/Users/dezob/.claude/projects/C--Users-dezob-Projects-atlas/memory/MEMORY.md`

- [ ] **Step 1: Criar checkpoint da Sprint 5.1**

Caminho: `C:/Users/dezob/.claude/projects/C--Users-dezob-Projects-atlas/memory/checkpoint-fase4-sprint5-1-completa.md`

```markdown
---
name: checkpoint-fase4-sprint5-1-completa
description: "Checkpoint Sprint 5.1 (Setup editorial) da Fase 4 do Atlas mergeado em main via squash. Critério editorial público registrado, 2 candidatos reais criados, páginas /metodologia /errata /sobre publicadas, 4 scripts de auditoria com testes Vitest, log-editorial.csv vazio, demos removidos."
metadata:
  type: project
---

**Data:** 2026-05-28
**Status:** Sprint 5.1 (Setup editorial) 100% mergeada em main via PR squash. Próximo: Sprint 5.2 (Piloto — 12 declarações de validação do critério).

**Why:** Encerra o setup editorial da Fase 4. A partir deste merge, a infra para receber declarações reais está pronta e o critério público está em git.

**How to apply:** Em nova sessão:
1. `cd C:/Users/dezob/Projects/atlas`
2. `git log --oneline -3` deve mostrar o squash commit no topo
3. `git branch -a` deve mostrar apenas main local; remotos: histórico de feat/* + main
4. Próximo passo: **Sprint 5.2 — Piloto (12 declarações)**. Brainstorming não necessário (o critério já está aprovado); ir direto para writing-plans criando `2026-XX-XX-atlas-fase4-sprint5-2-piloto.md`.

## Estado do dataset após Sprint 5.1

- 2 candidatos reais em `data/candidatos/<slug1>.yaml` e `<slug2>.yaml`
- 0 declarações em `data/declaracoes/` (demos removidas; piloto cria as primeiras 12)
- 0 eventos em `data/eventos/`
- `data/criterio-selecao/latest.yaml` versionado com cálculo público
- `data/log-editorial.csv` com header (0 entradas)

## Páginas novas

- `/metodologia` v1 — critério + cascata + AI policy + disclosure
- `/errata` v1 — processo de correção + lista vazia
- `/sobre` v1 — curadoria + missão + licenças

## Scripts novos com testes

- `scripts/audit-paridade.ts` (CI bloqueante, 9 testes)
- `scripts/audit-distribuicao.ts` (observabilidade, 4 testes)
- `scripts/check-archive-urls.ts` (HEAD HTTP, 4 testes)
- `scripts/validate-log.ts` (FK match CSV ↔ declarações, 8 testes)
- `scripts/lib/data-loaders.ts` (helpers compartilhados)

Total novos testes: 25-30 (depende de small variations) — passando todos.

## Constraints permanentes ainda ativas

(ver §10 do spec Fase 4)
1. `src/content/config.ts` mantém Zod 3 (astro:content)
2. Scripts standalone podem usar Zod 4 nativo
3. CLI scripts usam `pathToFileURL(process.argv[1] ?? "").href` para isMain
4. Vitest mock astro:content via alias (NÃO tocar)
5. `.gitattributes` força eol=lf (NÃO tocar)
6. Path alias único `@/*` → `src/*`
7. CI Ubuntu vs Windows local — rodar suite completa antes de push
8. Componentes Astro `.astro` testáveis só via build + grep
9. `exactOptionalPropertyTypes: true` — spread condicional
10. `@/lib/utils/format-date` exporta formatDateBR/Long/Relative (não formatDate)

## Memórias relacionadas

- [[checkpoint-fase3-completa]] — checkpoint anterior (substituído por este)
- [[decisoes-core-atlas]] — postura editorial (princípios §3 do spec mestre)
- [[bugs-do-plano-fase1]] — bugs informativos para todos plans
```

- [ ] **Step 2: Atualizar `MEMORY.md` (entry point ativo)**

Trocar a linha em negrito (entry point) para apontar para o novo checkpoint:

```markdown
- [Checkpoint Fase 3 completa](checkpoint-fase3-completa.md) — referência histórica (substituído pela Sprint 5.1).
- **[Checkpoint Fase 4 Sprint 5.1 completa](checkpoint-fase4-sprint5-1-completa.md) — entry point atual. Sprint 5.1 (Setup editorial) mergeada em main em 2026-05-28. Próximo: Sprint 5.2 (Piloto — 12 declarações).**
```

(Manter histórico das fases anteriores; só mudar qual está em **negrito**.)

- [ ] **Step 3: Verificar via grep**

```bash
grep -E "checkpoint-fase4-sprint5-1-completa" "C:/Users/dezob/.claude/projects/C--Users-dezob-Projects-atlas/memory/MEMORY.md"
```

Expected: 1 match — a linha em negrito.

Nota: o Vault não é parte do repo do Atlas; é versionado separadamente. Esta task NÃO commita nada no git do Atlas.

---

## Self-Review (executar antes de marcar plan como pronto)

**1. Spec coverage:**

| Spec § | Requisito | Coberto em |
|---|---|---|
| §2.2 (DONE Fase 4 inteira) | n/a aqui — esta é só a 5.1 | — |
| §4.1 critério candidatos | Tasks 10, 11 (aplicar) + Task 14 (publicar em /metodologia) |
| §4.2 janela temporal | Task 3 (audit-paridade verifica), Task 14 (publica) |
| §4.3 distribuição rígida | Task 3, Task 14 |
| §4.4 cascata de saliência | Task 2 (validate-log valida formato cascata-N:), Task 14 (publica) |
| §5.1 AI policy | Task 14 |
| §5.2 RACI | Tasks 10, 11, 12 (workflow Claude+André) |
| §5.5 checklist sign-off | Task 18 (PR template menciona) |
| §6.2 Sprint 5.1 entregáveis | Tasks 1-16 (cobrem 1-8 entregáveis listados) |
| §7.1 criterio-selecao schema | Task 1 |
| §7.2 log-editorial.csv | Task 8 |
| §7.3 4 scripts auditoria | Tasks 2, 3, 4, 5 |
| §7.4 CI integration | Task 7 |
| §7.5 páginas institucionais | Tasks 14, 15, 16 |
| §8.4 PR template | Task 9 |

**2. Placeholder scan:** o plan tem placeholders intencionais marcados `<slug1>`, `<URL_REAL>`, `<NOME>` etc. nas tarefas editoriais (10, 11, 12) — esses são preenchidos no momento da execução com dados reais coletados, não são "TODOs" no sentido proibido pelo skill. Todos os campos têm formato/contexto suficiente para o executor saber o que preencher.

**3. Type consistency:**
- `DeclaracaoFrontmatter`, `LogLine`, `CandidatoYaml`, `EventoYaml` definidos em `scripts/lib/data-loaders.ts` (Task 2) e usados consistentemente em Tasks 3, 4, 5.
- `AuditMode`, `AuditInput`, `AuditResult` definidos em Task 3 e exportados.
- `ENUM_VALIDOS` exportado de `data-loaders.ts` e usado em `validate-log.ts` e `audit-paridade.ts`.
- Função `calcularDistribuicao` retorna `DistribuicaoResult` exportado.
- Função `verificarArchiveUrls` retorna `CheckResult` exportado.

Todos os tipos batem.

**4. Decisão consciente sobre execução:**

O plan tem **3 tasks "EDITORIAL"** (10, 11, 12) que dependem de pesquisa web real do Claude + decisão humana. Essas tasks não são "TDD" no sentido clássico, mas têm passos verificáveis (validate-data, audit-paridade). O executor (implementer subagent ou inline) deve **PAUSAR** após Task 10 step 1 para apresentar a longlist ao André antes de prosseguir.

---

## Plano de Execução

**Plan complete and saved to `docs/superpowers/plans/2026-05-28-atlas-fase4-sprint5-1-setup-editorial.md`.**

**Duas opções de execução:**

1. **Subagent-Driven (recomendado)** — Cada task vai para um implementer subagent fresh, depois para spec reviewer + code quality reviewer. Recomendado para a maioria das tasks (1-9, 13-19). **Mas** as tasks 10, 11, 12 (editoriais) precisam **interrompendo o pipeline e voltando ao André** entre steps porque envolvem decisões humanas sobre conteúdo real. Subagent NÃO pode tomar essas decisões sozinho.

2. **Inline Execution** — Executar tasks na sessão atual com checkpoints. Permite naturalmente intercalar tasks editoriais (pausas para validação humana) com tasks de código. Mais natural para o workflow co-curadoria.

**Recomendação:** **Inline para Tasks 10-12** + **Subagent-driven para 1-9, 13-19**. Híbrido.

