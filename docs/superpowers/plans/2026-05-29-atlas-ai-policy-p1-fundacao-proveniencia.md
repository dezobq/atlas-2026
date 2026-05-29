# AI Policy P1 — Fundação de Proveniência · Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Adicionar o bloco `proveniencia` ao schema de declaração e um gate de validação semântica (`validarProveniencia`), materializando a linha vermelha "todo dado é rastreável" da [nova AI Policy](../specs/2026-05-29-atlas-ai-policy-design.md).

**Architecture:** Espelha o padrão existente `validarLog`/`validate-log.ts`: função pura `(declaracoes) → {ok, errors}` testada em isolamento (TDD), integrada ao `validate-data.ts` por dynamic import. O schema é definido em dois lugares (Zod 3 no `astro:content`; Zod 4 no gerador de JSON Schema) e o JSON Schema é regenerado.

**Tech Stack:** TypeScript + tsx, Zod 3 (`astro:content`) / Zod 4 (scripts), Ajv (validação CI), Vitest.

---

## ⚠️ Constraints do projeto (NÃO violar — do CLAUDE.md do atlas)

1. **`src/content/config.ts` usa Zod 3:** `z.string().url()`, `z.string().datetime()`. **NÃO** usar `z.url()` / `z.iso.datetime()` aqui (quebram em runtime via `astro:content`).
2. **`scripts/generate-json-schemas.ts` usa Zod 4 nativo:** `z.url()`, `z.iso.datetime()`. Os dois schemas de declaração devem ficar **sincronizados em forma**, divergindo só na sintaxe Zod.
3. **CLI `isMain`:** usar `import.meta.url === pathToFileURL(process.argv[1] ?? "").href` (correção Windows). Nunca `file://${argv[1]}`.
4. **`.gitattributes` força `eol=lf`** — não alterar fins de linha.
5. **Path alias:** testes importam de `@/../scripts/...` (`@` → `src`).
6. **`exactOptionalPropertyTypes: true`** — para "remover" um campo opcional num teste, use `delete obj.campo`, não atribua `undefined`.
7. **Antes de considerar pronto:** `pnpm format:check && pnpm lint && pnpm typecheck && pnpm test && pnpm build` (o build é estático; com 0 declarações continua válido).

---

## File Structure

- **Modify** `scripts/lib/data-loaders.ts` — adicionar tipos `CamadaProv`, `Proveniencia` e o campo `proveniencia?` em `DeclaracaoFrontmatter`.
- **Create** `scripts/validate-proveniencia.ts` — função pura `validarProveniencia` + runner CLI.
- **Create** `tests/unit/scripts/validate-proveniencia.test.ts` — testes da função pura.
- **Modify** `src/content/config.ts` — sub-schema `proveniencia` (Zod 3) no collection `declaracoes`.
- **Modify** `scripts/generate-json-schemas.ts` — sub-schema `proveniencia` (Zod 4) no `declaracaoSchema`.
- **Modify** `scripts/validate-data.ts` — chamar `validarProveniencia` após `validarLog`.
- **Modify** `package.json` — entry `validate:proveniencia`.
- **Regenerate** `data/schemas/declaracao.schema.json` via `pnpm generate-schemas`.

**Modelo do bloco** (decisão de implementação): `camadas` é um **array de objetos com `id`** (não um mapa de chaves dinâmicas) — torna as referências (`ancora`, `humano_revisou`) validáveis mecanicamente.

```yaml
proveniencia:
  metodo: "atlas-pipeline@1.4.0" # ^[a-z0-9-]+@\d+\.\d+\.\d+$
  fonte_ancora: "youtube:UCxxxx@00:14:32"
  camadas:
    - {
        id: "C0_texto",
        camada: 0,
        origem: "whisper-large-v3",
        ancora: [],
        verificacao: "adversarial-3/3",
        confianca: 0.98,
      }
    - {
        id: "C1_contexto",
        camada: 1,
        origem: "claude-opus-4-8",
        ancora: ["C0_texto"],
        verificacao: "adversarial-2/3",
      }
  humano_revisou: ["C0_texto"]
  gerado_em: "2026-05-29T12:00:00.000Z"
```

---

## Task 1: Função pura `validarProveniencia` + tipos (TDD)

**Files:**

- Modify: `scripts/lib/data-loaders.ts` (adicionar tipos + campo)
- Create: `scripts/validate-proveniencia.ts`
- Test: `tests/unit/scripts/validate-proveniencia.test.ts`

- [ ] **Step 1: Adicionar tipos em `scripts/lib/data-loaders.ts`**

Inserir antes de `export interface DeclaracaoFrontmatter` e adicionar o campo `proveniencia?` na interface:

```typescript
export interface CamadaProv {
  id: string;
  camada: 0 | 1 | 2;
  origem: string;
  ancora: string[];
  verificacao: string;
  confianca?: number;
}

export interface Proveniencia {
  metodo: string;
  fonte_ancora: string;
  camadas: CamadaProv[];
  humano_revisou: string[];
  gerado_em: string;
}

export interface DeclaracaoFrontmatter {
  id: string;
  candidato_id: string;
  tema_principal: string;
  tipo_estrutural: string[];
  fonte_primaria_tipo: string;
  archive_url: string;
  vereditos_externos?: Array<{ veiculo: string }>;
  proveniencia?: Proveniencia;
}
```

- [ ] **Step 2: Escrever o teste falhando** em `tests/unit/scripts/validate-proveniencia.test.ts`

```typescript
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
});
```

- [ ] **Step 3: Rodar o teste e ver falhar**

Run: `pnpm test -- tests/unit/scripts/validate-proveniencia.test.ts`
Expected: FAIL — `Failed to resolve import "@/../scripts/validate-proveniencia"` (arquivo ainda não existe).

- [ ] **Step 4: Implementar `scripts/validate-proveniencia.ts`**

```typescript
import { pathToFileURL } from "node:url";
import { loadDeclaracoes, type DeclaracaoFrontmatter } from "./lib/data-loaders";

export interface ValidationResult {
  ok: boolean;
  errors: string[];
}

export function validarProveniencia(declaracoes: DeclaracaoFrontmatter[]): ValidationResult {
  const errors: string[] = [];

  for (const d of declaracoes) {
    const p = d.proveniencia;
    if (!p) {
      errors.push(
        `data/declaracoes/${d.id}.md: sem bloco 'proveniencia' (linha vermelha: todo dado é rastreável)`,
      );
      continue;
    }

    const ids = new Set(p.camadas.map((c) => c.id));
    if (ids.size !== p.camadas.length) {
      errors.push(`${d.id}: proveniencia.camadas tem id duplicado`);
    }
    if (!p.camadas.some((c) => c.camada === 0)) {
      errors.push(`${d.id}: proveniencia precisa de ao menos uma camada factual (camada 0)`);
    }

    for (const c of p.camadas) {
      if (c.camada === 0 && c.ancora.length > 0) {
        errors.push(`${d.id}: camada ${c.id} (C0 factual) não pode ter ancora`);
      }
      if (c.camada > 0 && c.ancora.length === 0) {
        errors.push(`${d.id}: camada ${c.id} (derivada/analítica) precisa de ancora`);
      }
      for (const a of c.ancora) {
        const alvo = p.camadas.find((x) => x.id === a);
        if (!alvo) {
          errors.push(`${d.id}: camada ${c.id} ancora em "${a}" que não existe`);
        } else if (alvo.camada > c.camada) {
          errors.push(
            `${d.id}: camada ${c.id} (C${c.camada}) ancora em C${alvo.camada} (camada superior) — proibido`,
          );
        }
      }
    }

    for (const h of p.humano_revisou) {
      if (!ids.has(h)) {
        errors.push(`${d.id}: humano_revisou referencia "${h}" que não é uma camada`);
      }
    }
  }

  return { ok: errors.length === 0, errors };
}

function isMain(): boolean {
  return import.meta.url === pathToFileURL(process.argv[1] ?? "").href;
}

if (isMain()) {
  const declaracoes = loadDeclaracoes();
  const { ok, errors } = validarProveniencia(declaracoes);
  if (ok) {
    console.log(`✅ proveniencia: ${declaracoes.length} declaração(ões) com proveniência válida.`);
    process.exit(0);
  } else {
    console.error(`❌ proveniencia: ${errors.length} problema(s):`);
    for (const e of errors) console.error(`  - ${e}`);
    process.exit(1);
  }
}
```

- [ ] **Step 5: Rodar o teste e ver passar**

Run: `pnpm test -- tests/unit/scripts/validate-proveniencia.test.ts`
Expected: PASS (10 testes verdes).

- [ ] **Step 6: Typecheck**

Run: `pnpm typecheck`
Expected: 0 erros.

- [ ] **Step 7: Commit**

```bash
git add scripts/lib/data-loaders.ts scripts/validate-proveniencia.ts tests/unit/scripts/validate-proveniencia.test.ts
git commit -m "feat(proveniencia): adiciona validação semântica de proveniência de declarações"
```

---

## Task 2: Sub-schema `proveniencia` nos dois schemas Zod + regenerar JSON Schema

**Files:**

- Modify: `src/content/config.ts` (Zod 3)
- Modify: `scripts/generate-json-schemas.ts` (Zod 4)
- Regenerate: `data/schemas/declaracao.schema.json`

- [ ] **Step 1: Adicionar sub-schema em `src/content/config.ts` (Zod 3)**

Inserir antes de `const declaracoes = defineCollection({` :

```typescript
const camadaProvSchema = z.object({
  id: z.string().min(1),
  camada: z.union([z.literal(0), z.literal(1), z.literal(2)]),
  origem: z.string().min(1),
  ancora: z.array(z.string()).default([]),
  verificacao: z.string().regex(/^(adversarial|humano)-\d+\/\d+$/),
  confianca: z.number().min(0).max(1).optional(),
});

const provenienciaSchema = z.object({
  metodo: z.string().regex(/^[a-z0-9-]+@\d+\.\d+\.\d+$/),
  fonte_ancora: z.string().min(1),
  camadas: z.array(camadaProvSchema).min(1),
  humano_revisou: z.array(z.string()).default([]),
  gerado_em: z.string().datetime(),
});
```

E dentro do `schema: z.object({ ... })` do collection `declaracoes`, adicionar (logo após `atualizado_em: z.string().datetime(),`):

```typescript
    proveniencia: provenienciaSchema,
```

- [ ] **Step 2: Adicionar sub-schema espelhado em `scripts/generate-json-schemas.ts` (Zod 4)**

Inserir antes de `const declaracaoSchema = z.object({` — **note `z.iso.datetime()` (Zod 4)**:

```typescript
const camadaProvSchemaGen = z.object({
  id: z.string().min(1),
  camada: z.union([z.literal(0), z.literal(1), z.literal(2)]),
  origem: z.string().min(1),
  ancora: z.array(z.string()).default([]),
  verificacao: z.string().regex(/^(adversarial|humano)-\d+\/\d+$/),
  confianca: z.number().min(0).max(1).optional(),
});

const provenienciaSchemaGen = z.object({
  metodo: z.string().regex(/^[a-z0-9-]+@\d+\.\d+\.\d+$/),
  fonte_ancora: z.string().min(1),
  camadas: z.array(camadaProvSchemaGen).min(1),
  humano_revisou: z.array(z.string()).default([]),
  gerado_em: z.iso.datetime(),
});
```

E dentro de `declaracaoSchema`, após `atualizado_em: z.iso.datetime(),`:

```typescript
  proveniencia: provenienciaSchemaGen,
```

- [ ] **Step 3: Regenerar o JSON Schema**

Run: `pnpm generate-schemas`
Expected: imprime `✓ .../declaracao.schema.json` e `✅ JSON Schemas gerados com sucesso.` sem erro.

- [ ] **Step 4: Confirmar que `proveniencia` entrou no JSON Schema gerado**

Run: `node -e "const s=require('./data/schemas/declaracao.schema.json'); console.log(s.required.includes('proveniencia'), !!s.properties.proveniencia)"`
Expected: `true true`

- [ ] **Step 5: Validar dados + typecheck (0 declarações → continua verde)**

Run: `pnpm validate-data && pnpm typecheck`
Expected: `✅ Todos os dados são válidos.` + 0 erros de tipo. (Não há declarações ainda; o gate só age quando houver.)

- [ ] **Step 6: Commit**

```bash
git add src/content/config.ts scripts/generate-json-schemas.ts data/schemas/declaracao.schema.json
git commit -m "feat(schema): torna bloco proveniencia obrigatório na declaração (Zod 3 + Zod 4)"
```

---

## Task 3: Integrar `validarProveniencia` ao gate `validate-data` + entry no `package.json`

**Files:**

- Modify: `scripts/validate-data.ts` (após o bloco de validação do log)
- Modify: `package.json` (scripts)

- [ ] **Step 1: Adicionar a etapa de proveniência em `scripts/validate-data.ts`**

Localizar o bloco final que termina com:

```typescript
  console.log(`✅ log-editorial.csv: validado.`);
} catch (e) {
  console.error(`❌ Erro ao validar log: ${(e as Error).message}`);
  process.exit(1);
}

console.log(`\n✅ Todos os dados são válidos.`);
process.exit(0);
```

Substituir por (insere a validação de proveniência **antes** da mensagem final):

```typescript
  console.log(`✅ log-editorial.csv: validado.`);
} catch (e) {
  console.error(`❌ Erro ao validar log: ${(e as Error).message}`);
  process.exit(1);
}

// Validação semântica de proveniência (AI Policy P1)
console.log(`\n${"=".repeat(60)}`);
console.log(`Validando proveniência...`);
try {
  const { validarProveniencia } = await import("./validate-proveniencia.js");
  const { loadDeclaracoes } = await import("./lib/data-loaders.js");
  const result = validarProveniencia(loadDeclaracoes());
  if (!result.ok) {
    console.error(`❌ proveniencia tem ${result.errors.length} problema(s):`);
    for (const e of result.errors) console.error(`  - ${e}`);
    process.exit(1);
  }
  console.log(`✅ proveniencia: validada.`);
} catch (e) {
  console.error(`❌ Erro ao validar proveniência: ${(e as Error).message}`);
  process.exit(1);
}

console.log(`\n✅ Todos os dados são válidos.`);
process.exit(0);
```

- [ ] **Step 2: Adicionar entry no `package.json`**

Na seção `"scripts"`, logo após a linha `"validate:log": "tsx scripts/validate-log.ts",`, adicionar:

```json
    "validate:proveniencia": "tsx scripts/validate-proveniencia.ts",
```

- [ ] **Step 3: Rodar o gate standalone**

Run: `pnpm validate:proveniencia`
Expected: `✅ proveniencia: 0 declaração(ões) com proveniência válida.` (exit 0).

- [ ] **Step 4: Rodar o gate agregado (validate-data inclui a nova etapa)**

Run: `pnpm validate-data`
Expected: saída termina com `Validando proveniência...` → `✅ proveniencia: validada.` → `✅ Todos os dados são válidos.`

- [ ] **Step 5: Suite completa de qualidade (constraint do projeto)**

Run: `pnpm format:check && pnpm lint && pnpm typecheck && pnpm test && pnpm build`
Expected: tudo verde (build estático com 0 declarações continua válido).

- [ ] **Step 6: Commit**

```bash
git add scripts/validate-data.ts package.json
git commit -m "feat(proveniencia): integra gate de proveniência ao validate-data e adiciona script pnpm"
```

---

## Self-Review (executado na escrita deste plano)

- **Cobertura do spec (P1):** bloco de proveniência no schema ✅ (Task 2); gate `validate-proveniencia` ✅ (Task 1+3); linha vermelha "sem proveniência não publica" ✅ (campo obrigatório + erro "sem bloco"). Itens fora de P1 (pipeline C0/C1/C2, modo janela-de-silêncio, /metodologia, quórum em runtime) são P3/P4 — fora de escopo por design.
- **Placeholders:** nenhum — todo código é completo e os comandos têm saída esperada.
- **Consistência de tipos:** `CamadaProv`/`Proveniencia` definidos na Task 1 (data-loaders) e reusados nos testes e na função; `validarProveniencia(declaracoes) → {ok, errors}` idêntico em assinatura ao `validarLog`; nomes de campo (`camada`, `ancora`, `verificacao`, `humano_revisou`) idênticos entre schema Zod, tipos TS e testes.

## Dependências e ordem

Task 1 → Task 2 → Task 3 (sequencial). Task 3 depende do dynamic import do arquivo criado na Task 1 e do campo de schema da Task 2.

## Fora de escopo (próximos planos)

- **P2** — atualizar docs internos (spec mestre §7.1, Fase 4 §5, Postura-Editorial) + corrigir citação legal (23.732/2024 → 23.610/2019 art. 9º-B).
- **P3** — pipeline de produção C0/C1/C2 com verificação adversarial e modo janela-de-silêncio (**após parecer jurídico**).
- **P4** — `/metodologia` pública com rótulo de IA (**após parecer jurídico**).
