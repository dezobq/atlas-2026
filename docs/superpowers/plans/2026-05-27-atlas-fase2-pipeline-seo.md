# Atlas Fase 2 — Pipeline de Ingestão Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Construir pipeline de ingestão semi-automatizado (yt-dlp → transcrição → archive → scrape → OG images → export) e resolver tech debt do Plan 1, deixando o Atlas pronto para receber declarações reais antes do Plan 3 (SEO + páginas).

**Architecture:** Sprint 2.5 zera os 4 itens de tech debt registrados durante Plan 1 (aliases simplificados, Zod 4 sintaxe nativa, site URL real, investigação Vitest+astro:content). Sprint 3 entrega 6 scripts CLI standalone em `scripts/`, cada um com responsabilidade única, encadeáveis manualmente pelo operador. Compartilham infra mínima em `scripts/lib/` (env vars, paths, logger). Output dos scripts vai para `data/` (commitado) e `.cache/` (gitignored).

**Tech Stack:** youtube-dl-exec (wrapper Node de yt-dlp · validado via Context7 `/microlinkhq/youtube-dl-exec`) · OpenAI Node SDK v6 (Whisper API · validado `/openai/openai-node`) · @mendable/firecrawl-js (validado `/firecrawl/firecrawl-docs`) · satori + @resvg/resvg-js (validado `/vercel/satori` + `/thx/resvg-js`) · Wayback Save Page Now API (fetch direto, sem SDK) · papaparse (CSV) · existing Zod 4 + Ajv 8 + Vitest 2 toolchain.

**Pré-requisito:** Plan 1 mergeado em main (commit `ce6ad3d`). Working directory: `C:\Users\dezob\Projects\atlas`. Branch recomendada: `feat/fase2-pipeline`.

---

## Decisões registradas (de [[checkpoint-fase1-completa]] + sessão atual)

1. **Path aliases:** simplificar de 5 (`@`, `@components`, `@lib`, `@styles`, `@types`) para **apenas `@/*`** — pattern dominante na comunidade Astro/React, reduz risco de drift entre tsconfig/astro.config/vitest.config (Bugs 1 e 9 do Plan 1).
2. **Zod 4 deprecations:** migrar `z.string().url()` → `z.url()` e `z.string().datetime()` → `z.iso.datetime()` em `src/content/config.ts` e `scripts/generate-json-schemas.ts`. Plan 3 vai expandir schemas; pegar débito antes.
3. **`.surface-dark` class:** manter (decisão registrada — não há mudança neste plano).
4. **Vitest + astro:content (Bug 5):** spike time-boxed em 1h. Se nenhum approach validado funcionar, manter loader tests skipados com mock e documentar.
5. **Site URL:** `https://atlas-2026.pages.dev` (Cloudflare Pages subdomínio temporário até registrar domínio definitivo).

---

## File Structure

### Sprint 2.5 — arquivos a modificar

| Arquivo                                  | Responsabilidade                        | Mudança                                                     |
| ---------------------------------------- | --------------------------------------- | ----------------------------------------------------------- |
| `tsconfig.json`                          | Path aliases declarados ao TypeScript   | Remover 4 aliases, manter só `@/*`                          |
| `astro.config.mjs`                       | Aliases Vite + site URL + integrações   | Remover 4 aliases, atualizar `site`                         |
| `vitest.config.ts`                       | Aliases para resolver imports em testes | Remover 4 aliases                                           |
| `src/content/config.ts`                  | Schemas Zod das collections             | Migrar `.url()` / `.datetime()`                             |
| `scripts/generate-json-schemas.ts`       | Geração de JSON Schemas                 | Migrar `.url()` / `.datetime()` (mesmos schemas duplicados) |
| `src/pages/index.astro`                  | Home                                    | 3 imports `@components/...` → `@/components/...`            |
| `src/pages/404.astro`                    | Página 404                              | 1 import `@components/...` → `@/components/...`             |
| `src/components/layout/BaseLayout.astro` | Layout master                           | 3 imports `@components/...` → `@/components/...`            |
| `src/lib/data/candidatos.ts`             | Loader candidatos                       | `from "@types"` → `from "@/types"`                          |
| `src/lib/data/temas.ts`                  | Loader temas                            | `from "@types"` → `from "@/types"`                          |
| `src/lib/data/eventos.ts`                | Loader eventos                          | `from "@types"` → `from "@/types"`                          |
| `src/lib/data/declaracoes.ts`            | Loader declarações                      | `from "@types"` → `from "@/types"`                          |

### Sprint 3 — arquivos a criar

| Arquivo                                         | Responsabilidade                                                                        |
| ----------------------------------------------- | --------------------------------------------------------------------------------------- |
| `scripts/lib/env.ts`                            | Carrega `.env` com `process.loadEnvFile()` + valida vars obrigatórias por script        |
| `scripts/lib/paths.ts`                          | Constantes de caminhos (`DATA_DIR`, `CACHE_DIR`, `PUBLIC_DIR`, `OG_DIR`, `DATASET_DIR`) |
| `scripts/lib/logger.ts`                         | Logger estruturado (`info`/`warn`/`error`/`success` com ✓ ✗ ⚠ ℹ prefixes)               |
| `scripts/scrape-youtube.ts`                     | Download metadata YouTube + extração de áudio MP3 via yt-dlp                            |
| `scripts/transcribe.ts`                         | Transcrição via OpenAI Whisper API (`whisper-1`, lang `pt`)                             |
| `scripts/archive.ts`                            | Wayback Machine Save Page Now (HTTP direto, sem SDK)                                    |
| `scripts/scrape-url.ts`                         | Scrape de URL via Firecrawl SDK (markdown + screenshot)                                 |
| `scripts/generate-og-images.ts`                 | Satori → SVG → @resvg/resvg-js → PNG em `public/og/`                                    |
| `scripts/export-dataset.ts`                     | Exporta `data/declaracoes/` para `dist-dataset/atlas-declaracoes.{jsonl,csv}`           |
| `scripts/README.md`                             | Manual do operador (workflow semi-automatizado, ordem dos scripts, exemplos)            |
| `.env.example`                                  | Documentação das env vars (`OPENAI_API_KEY`, `FIRECRAWL_API_KEY`)                       |
| `.cache/.gitkeep`                               | Mantém diretório, conteúdo ignorado                                                     |
| `tests/unit/scripts/lib/env.test.ts`            | Tests do loader de env                                                                  |
| `tests/unit/scripts/lib/paths.test.ts`          | Tests dos caminhos                                                                      |
| `tests/unit/scripts/lib/logger.test.ts`         | Tests do logger                                                                         |
| `tests/unit/scripts/scrape-youtube.test.ts`     | Tests do extractor de video ID e summarizer                                             |
| `tests/unit/scripts/transcribe.test.ts`         | Tests do formatador de timestamps                                                       |
| `tests/unit/scripts/archive.test.ts`            | Test do builder de URL Wayback + parsing de resposta                                    |
| `tests/unit/scripts/scrape-url.test.ts`         | Tests dos utils sanitizeFilename e isLikelyUrl                                          |
| `tests/unit/scripts/generate-og-images.test.ts` | Tests do truncateCitacao e ogImagePath                                                  |
| `tests/unit/scripts/export-dataset.test.ts`     | Tests dos formatters JSONL + CSV                                                        |
| `tests/fixtures/youtube-metadata.json`          | Fixture parcial de resposta yt-dlp para testes                                          |
| `tests/fixtures/whisper-response.json`          | Fixture de resposta Whisper                                                             |
| `assets/fonts/Geist-Regular.ttf`                | Font Regular para Satori (binário versionado)                                           |
| `assets/fonts/Geist-Medium.ttf`                 | Font Medium para Satori (binário versionado)                                            |

### Arquivos a modificar (Sprint 3)

| Arquivo            | Mudança                                                                                                                                                                                                                                                   |
| ------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `package.json`     | Add deps: `youtube-dl-exec`, `openai`, `@mendable/firecrawl-js`, `satori`, `@resvg/resvg-js`, `papaparse`, `dotenv` · DevDeps: `@types/papaparse` · Add scripts: `scrape:youtube`, `transcribe`, `archive`, `scrape:url`, `generate:og`, `export:dataset` |
| `.gitignore`       | Add `.cache/`, `dist-dataset/`, `public/og/`, `assets/fonts/` (fonts vão via download script ou pinned via fontsource)                                                                                                                                    |
| `eslint.config.js` | Já permite `no-console: off` em `scripts/**/*.ts` (Bug 3 do Plan 1). Sem mudança necessária.                                                                                                                                                              |

---

## Diretrizes de execução

- **Conventional Commits PT-BR** (mesmo padrão do Plan 1).
- **TDD obrigatório:** test → run failing → implement → run passing → commit. Para scripts CLI, "test" pode significar smoke run com `--help` ou com fixture mockada.
- **Sem placeholders:** todo step tem código completo.
- **Validação Context7 já feita:** cada lib externa abaixo foi resolvida via `resolve-library-id` e teve docs queryeadas no início do plano. Source IDs documentados na seção de cada task.
- **Lições do Plan 1 ([[bugs-do-plano-fase1]]):** smoke test inicial valida configs antes de adicionar features. Cada nova lib roda hello-world antes de integração completa.
- **Idioma:** todo conteúdo, comentários, commits e mensagens de erro em português brasileiro.
- **Português ortográfico:** preserve acentos sempre (`Não`, `Geração`, `código`, etc.).

---

# SPRINT 2.5 — Tech Debt Cleanup

Objetivo: zerar os 5 itens de tech debt do Plan 1 ANTES de criar novo código no Sprint 3.

---

### Task 1: Simplificar path aliases para `@/*`

**Files:**

- Modify: `tsconfig.json`
- Modify: `astro.config.mjs`
- Modify: `vitest.config.ts`
- Modify: `src/pages/index.astro`
- Modify: `src/pages/404.astro`
- Modify: `src/components/layout/BaseLayout.astro`
- Modify: `src/lib/data/candidatos.ts`
- Modify: `src/lib/data/temas.ts`
- Modify: `src/lib/data/eventos.ts`
- Modify: `src/lib/data/declaracoes.ts`

**Por que simplificar:** os 4 aliases extras (`@components`, `@lib`, `@styles`, `@types`) só existiam para legibilidade marginal, mas custaram o Bug 1 (drift tsconfig × astro.config) e o Bug 9 (vitest.config faltava). A comunidade Astro + shadcn/ui usa só `@/*` em quase todos os templates oficiais — pattern validado.

- [ ] **Step 1: Criar branch de trabalho**

Run:

```bash
git checkout main
git pull origin main
git checkout -b feat/fase2-pipeline
```

Expected: branch criada, ahead 0 de main.

- [ ] **Step 2: Atualizar tsconfig.json**

Substituir o bloco `paths` por apenas o alias `@/*`.

```json
{
  "extends": "astro/tsconfigs/strict",
  "include": [".astro/types.d.ts", "**/*", "src/env.d.ts"],
  "exclude": ["dist", "node_modules"],
  "compilerOptions": {
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "exactOptionalPropertyTypes": true,
    "noImplicitOverride": true,
    "noFallthroughCasesInSwitch": true,
    "verbatimModuleSyntax": true,
    "moduleResolution": "bundler",
    "module": "ESNext",
    "target": "ES2022",
    "jsx": "react-jsx",
    "jsxImportSource": "react",
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"]
    }
  }
}
```

- [ ] **Step 3: Atualizar astro.config.mjs**

Reduzir o objeto `vite.resolve.alias` para apenas `@` e atualizar `site`.

```javascript
import { defineConfig } from "astro/config";
import { fileURLToPath } from "node:url";
import react from "@astrojs/react";
import tailwindcss from "@tailwindcss/vite";

const srcDir = fileURLToPath(new URL("./src", import.meta.url));

export default defineConfig({
  site: "https://atlas-2026.pages.dev",
  output: "static",
  trailingSlash: "never",
  build: {
    format: "directory",
    assets: "_assets",
  },
  integrations: [react()],
  prefetch: {
    prefetchAll: false,
    defaultStrategy: "viewport",
  },
  vite: {
    plugins: [tailwindcss()],
    resolve: {
      alias: {
        "@": srcDir,
      },
    },
  },
});
```

- [ ] **Step 4: Atualizar vitest.config.ts**

```typescript
import { defineConfig } from "vitest/config";
import { fileURLToPath } from "node:url";

export default defineConfig({
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  test: {
    environment: "jsdom",
    globals: true,
    include: ["tests/**/*.test.{ts,tsx}"],
    coverage: {
      provider: "v8",
      reporter: ["text", "html", "lcov"],
      exclude: [
        "node_modules/",
        "dist/",
        ".astro/",
        "tests/",
        "scripts/",
        "**/*.config.*",
        "**/*.d.ts",
      ],
      thresholds: {
        lines: 80,
        functions: 80,
        branches: 75,
        statements: 80,
      },
    },
  },
});
```

- [ ] **Step 5: Atualizar imports em src/pages/index.astro**

Localizar as 3 linhas de import e ajustar para `@/components/...`.

Antes:

```astro
import BaseLayout from "@components/layout/BaseLayout.astro"; import Disclaimer from
"@components/shared/Disclaimer.astro"; import Tag from "@components/shared/Tag.astro";
```

Depois:

```astro
import BaseLayout from "@/components/layout/BaseLayout.astro"; import Disclaimer from
"@/components/shared/Disclaimer.astro"; import Tag from "@/components/shared/Tag.astro";
```

- [ ] **Step 6: Atualizar imports em src/pages/404.astro**

Antes:

```astro
import BaseLayout from "@components/layout/BaseLayout.astro";
```

Depois:

```astro
import BaseLayout from "@/components/layout/BaseLayout.astro";
```

- [ ] **Step 7: Atualizar imports em src/components/layout/BaseLayout.astro**

Antes (linhas 4-6):

```astro
import Header from "@components/layout/Header.astro"; import Footer from
"@components/layout/Footer.astro"; import SkipLink from "@components/shared/SkipLink.astro";
```

Depois:

```astro
import Header from "@/components/layout/Header.astro"; import Footer from
"@/components/layout/Footer.astro"; import SkipLink from "@/components/shared/SkipLink.astro";
```

- [ ] **Step 8: Atualizar imports em src/lib/data/candidatos.ts**

Antes (linha 2):

```typescript
import type { Candidato } from "@types";
```

Depois:

```typescript
import type { Candidato } from "@/types";
```

- [ ] **Step 9: Atualizar imports em src/lib/data/temas.ts**

Antes (linha 2):

```typescript
import type { Tema } from "@types";
```

Depois:

```typescript
import type { Tema } from "@/types";
```

- [ ] **Step 10: Atualizar imports em src/lib/data/eventos.ts**

Antes (linha 2):

```typescript
import type { Evento } from "@types";
```

Depois:

```typescript
import type { Evento } from "@/types";
```

- [ ] **Step 11: Atualizar imports em src/lib/data/declaracoes.ts**

Antes (linha 2):

```typescript
import type { Declaracao } from "@types";
```

Depois:

```typescript
import type { Declaracao } from "@/types";
```

- [ ] **Step 12: Sanity check com grep — sem residuais**

Run:

```bash
pnpm exec grep -rn "@components" src/ tests/ || echo "OK: nenhum residual"
pnpm exec grep -rn "@lib/" src/ tests/ || echo "OK: nenhum residual"
pnpm exec grep -rn "@styles/" src/ tests/ || echo "OK: nenhum residual"
pnpm exec grep -rn "from \"@types\"" src/ tests/ || echo "OK: nenhum residual"
```

Expected: 4 linhas "OK: nenhum residual" (todas as buscas zeradas em src/ e tests/). Matches em `docs/` são OK (documentação histórica).

> **Nota Windows:** se `grep` não estiver disponível no PATH, use `findstr /S /N "@components" src\* tests\*` em PowerShell ou rode dentro de `git bash`. Resultado equivalente.

- [ ] **Step 13: Astro sync para regerar tipos**

Run:

```bash
pnpm astro sync
```

Expected: "Types generated" sem erro. Regera `.astro/types.d.ts` com as novas resoluções.

- [ ] **Step 14: Verificar typecheck**

Run:

```bash
pnpm typecheck
```

Expected: `0 errors, 0 warnings` (ou apenas hints Zod 4 deprecation — esses serão removidos na Task 2).

- [ ] **Step 15: Verificar lint**

Run:

```bash
pnpm lint
```

Expected: zero errors.

- [ ] **Step 16: Verificar tests**

Run:

```bash
pnpm test
```

Expected: 18 passed, 4 skipped (mesmo baseline do final do Plan 1).

- [ ] **Step 17: Verificar build**

Run:

```bash
pnpm build
```

Expected: build concluído, 2 páginas geradas (`/index.html`, `/404.html`), sem erros de resolução.

- [ ] **Step 18: Commit**

```bash
git add tsconfig.json astro.config.mjs vitest.config.ts src/
git commit -m "refactor(config): simplificar path aliases para apenas @/*

Reduz drift entre tsconfig.json, astro.config.mjs e vitest.config.ts
(corrige causa raiz dos Bugs 1 e 9 do Plan 1). Alinha com o pattern
dominante da comunidade Astro/React/shadcn.

- Remove @components, @lib, @styles, @types
- Atualiza 7 arquivos que usavam aliases legados
- Atualiza site URL para Cloudflare Pages subdomain temporário"
```

Expected: commit criado, working tree clean.

---

### Task 2: Migrar Zod 4 deprecations

**Files:**

- Modify: `scripts/generate-json-schemas.ts`
- ~~Modify: `src/content/config.ts`~~ **(descoberta durante execução: não migrar — ver Constraint abaixo)**

**Por que agora:** Plan 3 vai expandir schemas (JSON-LD components). Pegar hints de deprecation agora evita acúmulo.

**Validação Context7:** Zod 4 documenta `z.url()` e `z.iso.datetime()` como top-level functions. `z.string().url()` e `z.string().datetime()` ainda funcionam mas emitem deprecation hints.

**⚠ CONSTRAINT DESCOBERTO EM EXECUÇÃO (Plan 2 Task 2):** `astro:content` (até Astro 5.18.2) re-exporta `z` do **Zod 3** (Astro depende de `zod@^3.25.76` internamente). Quando `src/content/config.ts` faz `import { z } from "astro:content"`, recebe Zod 3 — que **não** tem `z.url()` nem `z.iso.datetime()` no top-level. Tentar usar essa sintaxe produz erro de runtime SSR `__vite_ssr_import_0__.z.url is not a function`. Por isso `src/content/config.ts` **fica em sintaxe Zod 3** (`z.string().url()`, `z.string().datetime()`) — isso NÃO gera hints porque é a sintaxe correta para Zod 3. Apenas `scripts/generate-json-schemas.ts` (que faz `import { z } from "zod"` direto) é migrado.

- [ ] **Step 1: Atualizar src/content/config.ts**

Substituir todas as ocorrências de `z.string().url()` por `z.url()` e `z.string().datetime()` por `z.iso.datetime()`. Resultado completo:

```typescript
import { defineCollection, z } from "astro:content";
import { glob } from "astro/loaders";

const fonteTipoEnum = z.enum([
  "youtube_oficial",
  "tse",
  "camara",
  "senado",
  "diario_oficial",
  "midia_consolidada",
  "rede_social_oficial",
]);

const tipoEstruturalEnum = z.enum([
  "promessa",
  "dado_numerico",
  "atribuicao_a_terceiro",
  "afirmacao_historica",
  "comparacao",
  "afirmacao_sobre_pesquisa",
  "compromisso_politico",
  "interpretacao_pessoal",
]);

const eventoTipoEnum = z.enum([
  "debate",
  "entrevista",
  "comicio",
  "post_rede_social",
  "sabatina",
  "declaracao_oficial",
]);

const veiculoVeredito = z.enum([
  "Lupa",
  "Aos Fatos",
  "Comprova",
  "Estadão Verifica",
  "Agência Pública",
  "BBC Verify",
  "outro",
]);

const contaOficialSchema = z.object({
  plataforma: z.enum(["youtube", "x", "instagram", "facebook", "tiktok"]),
  handle: z.string().min(1),
  url: z.url(),
  verificada: z.boolean(),
});

const candidatos = defineCollection({
  loader: glob({ base: "./data/candidatos", pattern: "*.yaml" }),
  schema: z.object({
    id: z.string().min(1),
    slug: z.string().regex(/^[a-z0-9-]+$/),
    nome: z.string().min(1),
    foto_url: z.url().optional(),
    partido: z.string().min(1),
    biografia_minima: z.string().min(10).max(500),
    contas_oficiais: z.array(contaOficialSchema).default([]),
    criado_em: z.iso.datetime(),
    atualizado_em: z.iso.datetime(),
  }),
});

const temas = defineCollection({
  loader: glob({ base: "./data/temas", pattern: "*.yaml" }),
  schema: z.object({
    id: z.string().min(1),
    slug: z.string().regex(/^[a-z0-9-]+$/),
    nome: z.string().min(1),
    descricao_curta: z.string().min(10).max(280),
    nivel: z.enum(["primario", "secundario"]),
    tema_pai_id: z.string().nullable().optional(),
  }),
});

const eventos = defineCollection({
  loader: glob({ base: "./data/eventos", pattern: "*.yaml" }),
  schema: z.object({
    id: z.string().min(1),
    titulo: z.string().min(1),
    data: z.iso.datetime(),
    tipo: eventoTipoEnum,
    local: z.object({
      fisico: z.string().nullable(),
      digital: z.string().nullable(),
    }),
    duracao_minutos: z.number().int().positive().nullable(),
    fonte_primaria_url: z.url(),
    fonte_primaria_tipo: fonteTipoEnum,
    archive_url: z.url(),
    candidatos_envolvidos: z.array(z.object({ candidato_id: z.string().min(1) })).min(1),
    descricao: z.string().min(10),
    criado_em: z.iso.datetime(),
    atualizado_em: z.iso.datetime(),
  }),
});

const declaracoes = defineCollection({
  loader: glob({ base: "./data/declaracoes", pattern: "*.md" }),
  schema: z.object({
    id: z.string().min(1),
    slug: z.string().regex(/^[a-z0-9-]+$/),
    candidato_id: z.string().min(1),
    evento_id: z.string().min(1),

    texto: z.string().min(1),
    timestamp_no_evento: z
      .string()
      .regex(/^\d{2}:\d{2}:\d{2}$/)
      .nullable(),
    contexto: z.string().min(10).max(500),

    tema_principal: z.string().min(1),
    temas_secundarios: z.array(z.string()).default([]),

    tipo_estrutural: z.array(tipoEstruturalEnum).min(1),

    fonte_primaria_url: z.url(),
    fonte_primaria_tipo: fonteTipoEnum,
    archive_url: z.url(),
    snapshot_interno_path: z.string().nullable().optional(),

    contexto_adicional: z
      .object({
        texto: z.string().min(10),
        fontes: z
          .array(
            z.object({
              tipo: z.string().min(1),
              url: z.url(),
              data: z.iso.datetime(),
            }),
          )
          .min(1),
      })
      .nullable()
      .optional(),

    vereditos_externos: z
      .array(
        z.object({
          veiculo: veiculoVeredito,
          classificacao: z.string().min(1),
          url: z.url(),
          data: z.iso.datetime(),
          citacao_curta: z.string().min(1).max(300),
        }),
      )
      .default([]),

    versao: z.number().int().positive(),
    criado_em: z.iso.datetime(),
    atualizado_em: z.iso.datetime(),
  }),
});

export const collections = {
  candidatos,
  temas,
  eventos,
  declaracoes,
};
```

- [ ] **Step 2: Atualizar scripts/generate-json-schemas.ts**

Mesma migração no segundo arquivo (Bug 11 do Plan 1 deixou esses schemas duplicados — ainda não foi consolidado em arquivo único; isso pode ser feito em Plan 3 quando reorganizarmos data layer).

```typescript
import { writeFileSync, mkdirSync } from "node:fs";
import { join } from "node:path";
import { z } from "zod";

const fonteTipoEnum = z.enum([
  "youtube_oficial",
  "tse",
  "camara",
  "senado",
  "diario_oficial",
  "midia_consolidada",
  "rede_social_oficial",
]);

const tipoEstruturalEnum = z.enum([
  "promessa",
  "dado_numerico",
  "atribuicao_a_terceiro",
  "afirmacao_historica",
  "comparacao",
  "afirmacao_sobre_pesquisa",
  "compromisso_politico",
  "interpretacao_pessoal",
]);

const eventoTipoEnum = z.enum([
  "debate",
  "entrevista",
  "comicio",
  "post_rede_social",
  "sabatina",
  "declaracao_oficial",
]);

const veiculoVeredito = z.enum([
  "Lupa",
  "Aos Fatos",
  "Comprova",
  "Estadão Verifica",
  "Agência Pública",
  "BBC Verify",
  "outro",
]);

const contaOficialSchema = z.object({
  plataforma: z.enum(["youtube", "x", "instagram", "facebook", "tiktok"]),
  handle: z.string().min(1),
  url: z.url(),
  verificada: z.boolean(),
});

const candidatoSchema = z.object({
  id: z.string().min(1),
  slug: z.string().regex(/^[a-z0-9-]+$/),
  nome: z.string().min(1),
  foto_url: z.url().optional(),
  partido: z.string().min(1),
  biografia_minima: z.string().min(10).max(500),
  contas_oficiais: z.array(contaOficialSchema).default([]),
  criado_em: z.iso.datetime(),
  atualizado_em: z.iso.datetime(),
});

const temaSchema = z.object({
  id: z.string().min(1),
  slug: z.string().regex(/^[a-z0-9-]+$/),
  nome: z.string().min(1),
  descricao_curta: z.string().min(10).max(280),
  nivel: z.enum(["primario", "secundario"]),
  tema_pai_id: z.string().nullable().optional(),
});

const eventoSchema = z.object({
  id: z.string().min(1),
  titulo: z.string().min(1),
  data: z.iso.datetime(),
  tipo: eventoTipoEnum,
  local: z.object({
    fisico: z.string().nullable(),
    digital: z.string().nullable(),
  }),
  duracao_minutos: z.number().int().positive().nullable(),
  fonte_primaria_url: z.url(),
  fonte_primaria_tipo: fonteTipoEnum,
  archive_url: z.url(),
  candidatos_envolvidos: z.array(z.object({ candidato_id: z.string().min(1) })).min(1),
  descricao: z.string().min(10),
  criado_em: z.iso.datetime(),
  atualizado_em: z.iso.datetime(),
});

const declaracaoSchema = z.object({
  id: z.string().min(1),
  slug: z.string().regex(/^[a-z0-9-]+$/),
  candidato_id: z.string().min(1),
  evento_id: z.string().min(1),
  texto: z.string().min(1),
  timestamp_no_evento: z
    .string()
    .regex(/^\d{2}:\d{2}:\d{2}$/)
    .nullable(),
  contexto: z.string().min(10).max(500),
  tema_principal: z.string().min(1),
  temas_secundarios: z.array(z.string()).default([]),
  tipo_estrutural: z.array(tipoEstruturalEnum).min(1),
  fonte_primaria_url: z.url(),
  fonte_primaria_tipo: fonteTipoEnum,
  archive_url: z.url(),
  snapshot_interno_path: z.string().nullable().optional(),
  contexto_adicional: z
    .object({
      texto: z.string().min(10),
      fontes: z
        .array(
          z.object({
            tipo: z.string().min(1),
            url: z.url(),
            data: z.iso.datetime(),
          }),
        )
        .min(1),
    })
    .nullable()
    .optional(),
  vereditos_externos: z
    .array(
      z.object({
        veiculo: veiculoVeredito,
        classificacao: z.string().min(1),
        url: z.url(),
        data: z.iso.datetime(),
        citacao_curta: z.string().min(1).max(300),
      }),
    )
    .default([]),
  versao: z.number().int().positive(),
  criado_em: z.iso.datetime(),
  atualizado_em: z.iso.datetime(),
});

const outDir = join(process.cwd(), "data", "schemas");
mkdirSync(outDir, { recursive: true });

function write(name: string, schema: z.ZodTypeAny): void {
  const jsonSchema = z.toJSONSchema(schema, {
    target: "draft-7",
    unrepresentable: "any",
  });
  const enriched = {
    $schema: "http://json-schema.org/draft-07/schema#",
    title: name,
    ...jsonSchema,
  };
  const path = join(outDir, `${name}.schema.json`);
  writeFileSync(path, JSON.stringify(enriched, null, 2) + "\n", "utf-8");
  console.log(`✓ ${path}`);
}

write("candidato", candidatoSchema);
write("tema", temaSchema);
write("evento", eventoSchema);
write("declaracao", declaracaoSchema);

console.log("\n✅ JSON Schemas gerados com sucesso.");
```

- [ ] **Step 3: Regenerar JSON Schemas**

Run:

```bash
pnpm generate-schemas
```

Expected:

```
✓ <project>/data/schemas/candidato.schema.json
✓ <project>/data/schemas/tema.schema.json
✓ <project>/data/schemas/evento.schema.json
✓ <project>/data/schemas/declaracao.schema.json

✅ JSON Schemas gerados com sucesso.
```

- [ ] **Step 4: Verificar diff dos schemas — devem ser idênticos**

Run:

```bash
git diff data/schemas/
```

Expected: zero mudança nos arquivos JSON gerados (a sintaxe nova produz mesmo output JSON Schema que a antiga).

Se houver diff, é um sinal de regressão — abrir as mudanças e investigar. A semântica deve ser idêntica.

- [ ] **Step 5: Verificar validate-data**

Run:

```bash
pnpm validate-data
```

Expected:

```
✓ data/temas/economia.yaml
✓ data/temas/saude.yaml
...
✅ 6 arquivo(s) validado(s) com sucesso.
```

- [ ] **Step 6: Verificar typecheck (zero hints)**

Run:

```bash
pnpm typecheck
```

Expected: `0 errors, 0 warnings, 0 hints`. Os 17 hints sumiram porque agora usamos as APIs nativas Zod 4.

- [ ] **Step 7: Verificar lint + tests + build**

Run:

```bash
pnpm lint && pnpm test && pnpm build
```

Expected: tudo verde. 18 tests passed, 4 skipped.

- [ ] **Step 8: Commit**

```bash
git add src/content/config.ts scripts/generate-json-schemas.ts
git commit -m "refactor(zod): migrar para sintaxe nativa Zod 4

Substitui z.string().url() por z.url() e z.string().datetime()
por z.iso.datetime() (17 hints eliminados). JSON Schemas gerados
permanecem byte-identical — apenas sintaxe modernizada.

Aplica débito antes do Plan 3, que estende schemas com Schema.org
JSON-LD."
```

---

### Task 3: Investigar Vitest + astro:content (spike time-boxed)

**Files:**

- Modify (possivelmente): `vitest.config.ts`
- Modify (possivelmente): `package.json` (alguma dep nova)
- Modify (possivelmente): `tests/unit/data-loaders.test.ts`

**Time box: 1 hora cronometrada.** Se não resolver, fallback documentado: manter testes skipados com mock simples e seguir.

**Por que tentar:** os 4 tests skipados em `data-loaders.test.ts` cobrem código real (loaders de candidatos/temas/eventos/declaracoes). Plan 3 vai expandir esses loaders. Cobrir agora reduz risco.

**3 abordagens validadas pela comunidade (cada uma 15-20 min):**

- [ ] **Step 1: Marcar início do time-box**

Run:

```bash
date +"Início spike: %Y-%m-%d %H:%M:%S"
```

(No Windows PowerShell: `Get-Date -Format "yyyy-MM-dd HH:mm:ss"`.)

Anotar mentalmente: parar em **1h cronometrada** independente do progresso.

- [ ] **Step 2: Approach A — getViteConfig com Vite override (15 min)**

Editar `vitest.config.ts` para usar o helper oficial do Astro:

```typescript
import { getViteConfig } from "astro/config";

export default getViteConfig({
  test: {
    environment: "jsdom",
    globals: true,
    include: ["tests/**/*.test.{ts,tsx}"],
    coverage: {
      provider: "v8",
      reporter: ["text", "html", "lcov"],
      exclude: [
        "node_modules/",
        "dist/",
        ".astro/",
        "tests/",
        "scripts/",
        "**/*.config.*",
        "**/*.d.ts",
      ],
      thresholds: {
        lines: 80,
        functions: 80,
        branches: 75,
        statements: 80,
      },
    },
  },
});
```

Tentar adicionar `package.json` overrides para alinhar Vite (Bug 5 do Plan 1):

```json
{
  "pnpm": {
    "overrides": {
      "vite": "^6.0.0"
    }
  }
}
```

Run:

```bash
pnpm install
pnpm typecheck
pnpm test
```

Expected (sucesso): `data-loaders.test.ts` agora roda em vez de ser skipped, com 4 tests passing.
Expected (falha): typecheck error em `vitest.config.ts` ou import error de `astro:content` em runtime.

Se passar → ir para Step 5 (commit). Se falhar → Step 3.

- [ ] **Step 3: Approach B — Mock manual de astro:content (15 min)**

Reverter mudanças do approach A. Recriar `vitest.config.ts` simples (igual ao do Step 4 da Task 1). Editar `tests/unit/data-loaders.test.ts` para mockar `astro:content`:

```typescript
import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("astro:content", () => ({
  getCollection: vi.fn(),
  getEntry: vi.fn(),
}));

import { getCollection } from "astro:content";
import { getAllCandidatos, getCandidatoBySlug } from "@/lib/data/candidatos";

const mockGetCollection = vi.mocked(getCollection);

describe("candidatos loader", () => {
  beforeEach(() => {
    mockGetCollection.mockReset();
  });

  it("retorna todos os candidatos ordenados", async () => {
    mockGetCollection.mockResolvedValue([
      {
        id: "cand-a",
        data: { id: "cand-a", slug: "candidato-a", nome: "Candidato A" },
      },
      {
        id: "cand-b",
        data: { id: "cand-b", slug: "candidato-b", nome: "Candidato B" },
      },
    ] as never);

    const result = await getAllCandidatos();

    expect(result).toHaveLength(2);
    expect(result[0]?.nome).toBe("Candidato A");
  });

  it("retorna candidato por slug", async () => {
    mockGetCollection.mockResolvedValue([
      { id: "cand-a", data: { id: "cand-a", slug: "candidato-a", nome: "Candidato A" } },
    ] as never);

    const result = await getCandidatoBySlug("candidato-a");

    expect(result?.nome).toBe("Candidato A");
  });
});
```

Run:

```bash
pnpm test tests/unit/data-loaders.test.ts
```

Expected (sucesso): 2 tests passing, sem skip.
Expected (falha): erro de resolução de `astro:content` antes do mock ser aplicado.

Se passar com mock → expandir mock para cobrir temas/eventos/declaracoes (mais 6 tests, ~5 min) → Step 5. Se falhar → Step 4.

- [ ] **Step 4: Approach C — vitest-plugin para Astro (15 min)**

Instalar plugin community que resolve módulos virtuais Astro em Vitest:

```bash
pnpm add -D vite-plugin-astro-content
```

Editar `vitest.config.ts`:

```typescript
import { defineConfig } from "vitest/config";
import { fileURLToPath } from "node:url";
import astroContent from "vite-plugin-astro-content";

export default defineConfig({
  plugins: [astroContent()],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  test: {
    environment: "jsdom",
    globals: true,
    include: ["tests/**/*.test.{ts,tsx}"],
    coverage: {
      provider: "v8",
      reporter: ["text", "html", "lcov"],
      exclude: [
        "node_modules/",
        "dist/",
        ".astro/",
        "tests/",
        "scripts/",
        "**/*.config.*",
        "**/*.d.ts",
      ],
      thresholds: { lines: 80, functions: 80, branches: 75, statements: 80 },
    },
  },
});
```

> **Nota:** se `vite-plugin-astro-content` não existir no npm (validar via `pnpm view vite-plugin-astro-content` antes), pular para Step 5 com fallback. Não inventar plugin que não existe.

Run:

```bash
pnpm test
```

Expected (sucesso): loaders rodam, tests passing.
Expected (falha): plugin não resolve ou conflita com Vite 5.

- [ ] **Step 5: Decidir e commitar**

Se algum approach funcionou:

- Reverter as mudanças dos approaches que NÃO foram escolhidos
- Manter as do approach que funcionou
- Remover `.skip` dos 4 tests skipados no Plan 1 (ver `tests/unit/data-loaders.test.ts`)
- Run `pnpm test` — Expected: `22 passed, 0 skipped` (18 + 4 que estavam skipados)

Commit (escolha **uma** das mensagens conforme o approach que funcionou):

Se Approach A (getViteConfig + Vite override):

```bash
git add vitest.config.ts tests/ package.json pnpm-lock.yaml
git commit -m "test(loaders): resolver Bug 5 via getViteConfig + Vite override

Usa o helper oficial astro/config + override pnpm para alinhar Vite 6.
Os 4 tests skipados em data-loaders.test.ts agora rodam de verdade.

Closes Bug 5 do Plan 1."
```

Se Approach B (mock manual de astro:content):

```bash
git add vitest.config.ts tests/
git commit -m "test(loaders): resolver Bug 5 via mock manual de astro:content

vi.mock('astro:content') intercepta getCollection/getEntry sem
precisar resolver o módulo virtual em runtime. Tests cobrem shape
dos retornos dos loaders.

Closes Bug 5 do Plan 1."
```

Se Approach C (vite-plugin-astro-content):

```bash
git add vitest.config.ts tests/ package.json pnpm-lock.yaml
git commit -m "test(loaders): resolver Bug 5 via vite-plugin-astro-content

Plugin community resolve o módulo virtual astro:content em Vitest.
Os 4 tests skipados agora rodam.

Closes Bug 5 do Plan 1."
```

Se NENHUM approach funcionou (tempo esgotado):

- Reverter todas as tentativas (`git checkout -- .` ou `git restore .`)
- Documentar a investigação em comentário no topo de `tests/unit/data-loaders.test.ts`:

```typescript
/**
 * NOTA SOBRE TESTES SKIPADOS — Spike de Plan 2 (1h time-boxed)
 *
 * Tentativas de habilitar tests de loaders que usam astro:content:
 *   A) getViteConfig + Vite override em package.json — conflito de tipos
 *   B) Mock manual com vi.mock("astro:content") — [resultado]
 *   C) vite-plugin-astro-content — [resultado / não disponível]
 *
 * Decisão: manter skipados. Loaders são cobertos por:
 *   - Tipagem estática (TypeScript estrito) garante shape
 *   - Tests E2E em Plan 3 quando páginas reais consumirem dados
 *   - Validate-data CI cobre integridade do conteúdo
 *
 * Revisitar quando Astro publicar guia oficial Vitest + Content Collections.
 */
```

Sem commit (estado revertido).

> **Importante:** independente do resultado, ATUALIZAR a memória `bugs-do-plano-fase1.md` removendo Bug 5 da lista pendente (se resolvido) ou marcando-o como "investigado, documentado, mantido" (se não resolvido).

---

### Task 4: Smoke test final do Sprint 2.5

**Files:**

- (verificação apenas; sem mudança de código)

Objetivo: garantir que Sprint 2.5 não quebrou nada antes de iniciar Sprint 3. Lição direta dos 11 bugs do Plan 1 — validar tooling antes de adicionar features.

- [ ] **Step 1: Clean install para baseline limpo**

Run:

```bash
rm -rf node_modules .astro dist .vite
pnpm install --frozen-lockfile
```

(Windows PowerShell: `Remove-Item -Recurse -Force node_modules, .astro, dist, .vite -ErrorAction SilentlyContinue; pnpm install --frozen-lockfile`.)

Expected: install completes, `node_modules/` recriado.

- [ ] **Step 2: Sync de tipos Astro**

Run:

```bash
pnpm astro sync
```

Expected: `Types generated` sem erro.

- [ ] **Step 3: Format check**

Run:

```bash
pnpm format:check
```

Expected: todos arquivos OK.

- [ ] **Step 4: Lint zero warnings**

Run:

```bash
pnpm lint
```

Expected: zero errors, zero warnings.

- [ ] **Step 5: Typecheck zero issues**

Run:

```bash
pnpm typecheck
```

Expected: `0 errors, 0 warnings, 0 hints`.

- [ ] **Step 6: Tests passing**

Run:

```bash
pnpm test
```

Expected: 18 passed + 4 skipped (ou 22 passed, 0 skipped se Task 3 resolveu Bug 5).

- [ ] **Step 7: Generate schemas reproduce baseline**

Run:

```bash
pnpm generate-schemas
git diff data/schemas/
```

Expected: zero diff (schemas idênticos ao baseline pós-Task 2).

- [ ] **Step 8: Validate data**

Run:

```bash
pnpm validate-data
```

Expected: 6 arquivos validados, exit 0.

- [ ] **Step 9: Build produz HTML estático**

Run:

```bash
pnpm build
```

Expected: build concluído. `dist/index.html` e `dist/404.html` existem.

- [ ] **Step 10: Verificar dist/ tem conteúdo esperado**

Run:

```bash
ls dist/
```

Expected (linux/mac):

```
_assets/  404.html  index.html
```

(Windows: `Get-ChildItem dist`.)

Verifica que `astro.config.mjs` ainda gera com `assets: "_assets"`.

- [ ] **Step 11: Verificar canonical no HTML**

Run:

```bash
pnpm exec grep -h "atlas-2026.pages.dev" dist/index.html | head -3
```

Expected: pelo menos 1 ocorrência (canonical link ou OG URL) apontando para `https://atlas-2026.pages.dev`.

> Se canonical/OG ainda não está implementado nos meta tags (será no Plan 3), basta verificar via output do `astro build` que `site` foi lido sem erro. Aceitar zero matches aqui — não bloqueante.

- [ ] **Step 12: Push da branch + abrir draft PR**

Run:

```bash
git push -u origin feat/fase2-pipeline
gh pr create --draft --title "feat(fase2): tech debt + pipeline de ingestão (WIP)" --body "$(cat <<'EOF'
## Fase 2 do Atlas — Pipeline de Ingestão + SEO

PR em modo **draft** durante Sprints 2.5 e 3. Será marcado ready quando todos os scripts de pipeline estiverem implementados e testados.

### Sprint 2.5 — Tech Debt (concluído)
- Path aliases simplificados para apenas \`@/*\`
- Zod 4 deprecations migradas (17 hints → 0)
- Site URL atualizado para \`atlas-2026.pages.dev\`
- Spike Vitest × astro:content (1h time-boxed) — resultado documentado

### Sprint 3 — Pipeline de Ingestão (em andamento)
- [ ] scripts/scrape-youtube.ts
- [ ] scripts/transcribe.ts (Whisper API)
- [ ] scripts/archive.ts (Wayback Save Page Now)
- [ ] scripts/scrape-url.ts (Firecrawl)
- [ ] scripts/generate-og-images.ts (Satori + Resvg)
- [ ] scripts/export-dataset.ts (JSONL + CSV)
- [ ] scripts/README.md

🤖 Generated with [Claude Code](https://claude.com/claude-code)
EOF
)"
```

Expected: PR criado em draft, URL retornada.

---

# SPRINT 3 — Pipeline de Ingestão

Objetivo: entregar 6 scripts CLI standalone que cobrem o pipeline semi-automatizado descrito na seção 7 do spec (3 níveis de esforço por fonte).

**Princípios:**

- Cada script é executável diretamente via `tsx scripts/nome.ts <args>`.
- Cada script é também invocável via `pnpm <comando>` (script no package.json).
- Output dos scripts vai para `.cache/` (artefatos temporários) e `data/` (artefatos commitados).
- Tests cobrem **lógica pura** (parsing, formatação, builders de URL). Chamadas externas (HTTP, processos filhos) são mockadas ou marcadas como integration tests que rodam só com flag.

---

### Task 5: Setup de infraestrutura compartilhada de scripts

**Files:**

- Create: `scripts/lib/env.ts`
- Create: `scripts/lib/paths.ts`
- Create: `scripts/lib/logger.ts`
- Create: `tests/unit/scripts/lib/env.test.ts`
- Create: `tests/unit/scripts/lib/paths.test.ts`
- Create: `tests/unit/scripts/lib/logger.test.ts`
- Create: `.env.example`
- Modify: `.gitignore`
- Modify: `package.json` (deps + scripts)

**Por que primeiro:** todos os 6 scripts do Sprint 3 dependem de env vars, paths e logger. Compartilhar evita duplicação.

**Validação Context7:** usamos APIs nativas Node 22 (`node:fs`, `node:path`, `node:process`). Para `.env` loading, Node 22 tem `process.loadEnvFile()` nativo desde v20.6.0 — não precisa de `dotenv`.

- [ ] **Step 1: Adicionar entradas ao .gitignore**

Editar `.gitignore` adicionando ao final:

```gitignore

# Pipeline cache (Plan 2 Sprint 3)
.cache/
dist-dataset/
public/og/

# Local env
.env
.env.local
```

- [ ] **Step 2: Criar .env.example**

```bash
# .env.example — copiar para .env e preencher

# OpenAI Whisper API (obrigatório para scripts/transcribe.ts)
# Obter em: https://platform.openai.com/api-keys
OPENAI_API_KEY=

# Firecrawl (obrigatório para scripts/scrape-url.ts)
# Obter em: https://www.firecrawl.dev/app/api-keys
FIRECRAWL_API_KEY=
```

Salvar como `.env.example` na raiz.

- [ ] **Step 3: Criar diretórios de cache + ignore**

```bash
mkdir -p .cache
touch .cache/.gitkeep
```

(Windows PowerShell: `New-Item -ItemType Directory -Force .cache | Out-Null; New-Item -ItemType File -Force .cache/.gitkeep | Out-Null`.)

- [ ] **Step 4: Escrever test do logger**

Criar `tests/unit/scripts/lib/logger.test.ts`:

```typescript
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { logger } from "../../../../scripts/lib/logger";

describe("logger", () => {
  let logSpy: ReturnType<typeof vi.spyOn>;
  let errorSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    logSpy = vi.spyOn(console, "log").mockImplementation(() => undefined);
    errorSpy = vi.spyOn(console, "error").mockImplementation(() => undefined);
  });

  afterEach(() => {
    logSpy.mockRestore();
    errorSpy.mockRestore();
  });

  it("info prefixa com ℹ", () => {
    logger.info("teste");
    expect(logSpy).toHaveBeenCalledWith("ℹ teste");
  });

  it("success prefixa com ✓", () => {
    logger.success("ok");
    expect(logSpy).toHaveBeenCalledWith("✓ ok");
  });

  it("warn prefixa com ⚠", () => {
    logger.warn("atenção");
    expect(logSpy).toHaveBeenCalledWith("⚠ atenção");
  });

  it("error prefixa com ✗ e usa console.error", () => {
    logger.error("falhou");
    expect(errorSpy).toHaveBeenCalledWith("✗ falhou");
  });

  it("error aceita objeto Error e mostra mensagem", () => {
    logger.error(new Error("boom"));
    expect(errorSpy).toHaveBeenCalledWith("✗ boom");
  });
});
```

- [ ] **Step 5: Rodar test do logger — espera falhar**

Run:

```bash
pnpm test tests/unit/scripts/lib/logger.test.ts
```

Expected: FAIL com `Cannot find module '../../../../scripts/lib/logger'`.

- [ ] **Step 6: Implementar scripts/lib/logger.ts**

Criar `scripts/lib/logger.ts`:

```typescript
type Logger = {
  info: (msg: string) => void;
  success: (msg: string) => void;
  warn: (msg: string) => void;
  error: (msg: string | Error) => void;
};

export const logger: Logger = {
  info: (msg) => console.log(`ℹ ${msg}`),
  success: (msg) => console.log(`✓ ${msg}`),
  warn: (msg) => console.log(`⚠ ${msg}`),
  error: (msg) => {
    const text = msg instanceof Error ? msg.message : msg;
    console.error(`✗ ${text}`);
  },
};
```

- [ ] **Step 7: Rodar test do logger — espera passar**

Run:

```bash
pnpm test tests/unit/scripts/lib/logger.test.ts
```

Expected: 5 tests passing.

- [ ] **Step 8: Escrever test de paths**

Criar `tests/unit/scripts/lib/paths.test.ts`:

```typescript
import { describe, it, expect } from "vitest";
import {
  DATA_DIR,
  CACHE_DIR,
  PUBLIC_DIR,
  OG_DIR,
  DATASET_DIR,
} from "../../../../scripts/lib/paths";
import { resolve } from "node:path";

describe("paths", () => {
  it("DATA_DIR aponta para <cwd>/data", () => {
    expect(DATA_DIR).toBe(resolve(process.cwd(), "data"));
  });

  it("CACHE_DIR aponta para <cwd>/.cache", () => {
    expect(CACHE_DIR).toBe(resolve(process.cwd(), ".cache"));
  });

  it("PUBLIC_DIR aponta para <cwd>/public", () => {
    expect(PUBLIC_DIR).toBe(resolve(process.cwd(), "public"));
  });

  it("OG_DIR fica dentro de PUBLIC_DIR", () => {
    expect(OG_DIR).toBe(resolve(process.cwd(), "public", "og"));
  });

  it("DATASET_DIR aponta para <cwd>/dist-dataset", () => {
    expect(DATASET_DIR).toBe(resolve(process.cwd(), "dist-dataset"));
  });
});
```

- [ ] **Step 9: Rodar test de paths — espera falhar**

Run:

```bash
pnpm test tests/unit/scripts/lib/paths.test.ts
```

Expected: FAIL `Cannot find module '../../../../scripts/lib/paths'`.

- [ ] **Step 10: Implementar scripts/lib/paths.ts**

```typescript
import { resolve } from "node:path";

const root = process.cwd();

export const DATA_DIR = resolve(root, "data");
export const CACHE_DIR = resolve(root, ".cache");
export const PUBLIC_DIR = resolve(root, "public");
export const OG_DIR = resolve(root, "public", "og");
export const DATASET_DIR = resolve(root, "dist-dataset");

export const CANDIDATOS_DIR = resolve(DATA_DIR, "candidatos");
export const TEMAS_DIR = resolve(DATA_DIR, "temas");
export const EVENTOS_DIR = resolve(DATA_DIR, "eventos");
export const DECLARACOES_DIR = resolve(DATA_DIR, "declaracoes");
```

- [ ] **Step 11: Rodar tests de paths — espera passar**

Run:

```bash
pnpm test tests/unit/scripts/lib/paths.test.ts
```

Expected: 5 tests passing.

- [ ] **Step 12: Escrever test de env loader**

Criar `tests/unit/scripts/lib/env.test.ts`:

```typescript
import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { requireEnv } from "../../../../scripts/lib/env";

describe("requireEnv", () => {
  const originalEnv = { ...process.env };

  beforeEach(() => {
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = { ...originalEnv };
  });

  it("retorna valor quando env var existe", () => {
    process.env.TEST_VAR = "valor-teste";
    expect(requireEnv("TEST_VAR")).toBe("valor-teste");
  });

  it("lança erro com mensagem clara quando env var falta", () => {
    delete process.env.MISSING_VAR;
    expect(() => requireEnv("MISSING_VAR")).toThrow(/MISSING_VAR.*\.env/i);
  });

  it("lança erro quando env var é string vazia", () => {
    process.env.EMPTY_VAR = "";
    expect(() => requireEnv("EMPTY_VAR")).toThrow();
  });
});
```

- [ ] **Step 13: Rodar test de env — espera falhar**

Run:

```bash
pnpm test tests/unit/scripts/lib/env.test.ts
```

Expected: FAIL `Cannot find module '../../../../scripts/lib/env'`.

- [ ] **Step 14: Implementar scripts/lib/env.ts**

```typescript
import { existsSync } from "node:fs";
import { resolve } from "node:path";

const envPath = resolve(process.cwd(), ".env");
if (existsSync(envPath)) {
  process.loadEnvFile(envPath);
}

export function requireEnv(name: string): string {
  const value = process.env[name];
  if (value === undefined || value === "") {
    throw new Error(
      `Variável de ambiente obrigatória "${name}" não definida. ` +
        `Copie .env.example para .env e preencha o valor.`,
    );
  }
  return value;
}

export function getEnv(name: string, defaultValue: string): string {
  const value = process.env[name];
  return value === undefined || value === "" ? defaultValue : value;
}
```

- [ ] **Step 15: Rodar test de env — espera passar**

Run:

```bash
pnpm test tests/unit/scripts/lib/env.test.ts
```

Expected: 3 tests passing.

- [ ] **Step 16: Rodar full test suite**

Run:

```bash
pnpm test
```

Expected: 18 (Plan 1) + 13 (Sprint 3 lib) = 31 passed (4 skipped se Bug 5 não resolvido).

- [ ] **Step 17: Commit**

```bash
git add scripts/lib/ tests/unit/scripts/ .env.example .gitignore .cache/
git commit -m "feat(scripts): infraestrutura compartilhada para pipeline

Cria scripts/lib/ com env, paths e logger usados pelos scripts de
ingestão do Sprint 3. Tests TDD para cada módulo (13 tests passing).

- env: requireEnv lança erro claro com referência a .env.example
- paths: constantes resolvidas a partir de process.cwd()
- logger: prefixes Unicode (ℹ ✓ ⚠ ✗) para output consistente

Usa process.loadEnvFile() nativo do Node 22 (sem dependência dotenv)."
```

---

### Task 6: Instalar dependências do pipeline

**Files:**

- Modify: `package.json`

**Validação Context7:**

- `youtube-dl-exec` — `/microlinkhq/youtube-dl-exec`, High reputation, 398 snippets, suporte TypeScript nativo (`Flags`, `Payload` types).
- `openai` — `/openai/openai-node`, v6.1.0 atual, suporte oficial Whisper via `client.audio.transcriptions.create()`.
- `@mendable/firecrawl-js` — `/firecrawl/firecrawl-docs`, 3479 snippets, API oficial.
- `satori` — `/vercel/satori`, benchmark 91, JSX → SVG.
- `@resvg/resvg-js` — `/thx/resvg-js`, 86 snippets, SVG → PNG.
- `papaparse` — biblioteca canônica de CSV em JS (~50M downloads/sem em npm), API estável há 10+ anos.

- [ ] **Step 1: Instalar dependências de produção**

Run:

```bash
pnpm add youtube-dl-exec openai @mendable/firecrawl-js satori @resvg/resvg-js papaparse ulid
```

Expected: 7 packages adicionados. `ulid` já era dep no Plan 1, idempotente.

- [ ] **Step 2: Instalar dev types**

Run:

```bash
pnpm add -D @types/papaparse
```

Expected: 1 package adicionado. `youtube-dl-exec`, `openai`, `satori`, `@resvg/resvg-js`, `@mendable/firecrawl-js` já trazem types embutidos.

- [ ] **Step 3: Adicionar scripts ao package.json**

Editar o objeto `scripts` em `package.json`, adicionando após `validate-data`:

```json
{
  "scripts": {
    "dev": "astro dev",
    "build": "astro build",
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
    "generate-schemas": "tsx scripts/generate-json-schemas.ts",
    "scrape:youtube": "tsx scripts/scrape-youtube.ts",
    "transcribe": "tsx scripts/transcribe.ts",
    "archive": "tsx scripts/archive.ts",
    "scrape:url": "tsx scripts/scrape-url.ts",
    "generate:og": "tsx scripts/generate-og-images.ts",
    "export:dataset": "tsx scripts/export-dataset.ts"
  }
}
```

- [ ] **Step 4: Smoke-check de install — typecheck ainda passa**

Run:

```bash
pnpm typecheck
```

Expected: zero errors. As deps foram só adicionadas, ainda não importadas.

- [ ] **Step 5: Smoke-check de install — tests ainda passam**

Run:

```bash
pnpm test
```

Expected: mesmo baseline (31 passed ou 35 dependendo do resultado do Task 3).

- [ ] **Step 6: Commit**

```bash
git add package.json pnpm-lock.yaml
git commit -m "deps(pipeline): adicionar libs validadas via Context7

- youtube-dl-exec: wrapper Node de yt-dlp (Microlink, types nativos)
- openai: SDK oficial para Whisper API
- @mendable/firecrawl-js: SDK oficial Firecrawl
- satori + @resvg/resvg-js: pipeline JSX → SVG → PNG (Vercel + thx)
- papaparse + @types/papaparse: CSV serialização (lib canônica JS)

Adiciona 6 scripts no package.json (scrape:youtube, transcribe,
archive, scrape:url, generate:og, export:dataset)."
```

---

### Task 7: scripts/scrape-youtube.ts — download metadata + áudio via yt-dlp

**Files:**

- Create: `scripts/scrape-youtube.ts`
- Create: `tests/fixtures/youtube-metadata.json`

**Validação Context7 — `/microlinkhq/youtube-dl-exec`:**

- `youtubedl(url, { dumpSingleJson: true })` retorna `Payload` parsed.
- `youtubedl(url, { extractAudio: true, audioFormat: 'mp3', output: '...' })` baixa áudio.
- Auto-instala binário yt-dlp na primeira execução.

**Como funciona o script:**

1. Aceita URL do YouTube como argumento posicional.
2. Lê metadata via `dumpSingleJson`.
3. Salva metadata em `.cache/youtube/<videoId>.json`.
4. Baixa áudio MP3 em `.cache/youtube/<videoId>.mp3`.
5. Imprime resumo (título, duração, paths) para o operador.

- [ ] **Step 1: Criar fixture de metadata**

Criar `tests/fixtures/youtube-metadata.json`:

```json
{
  "id": "dQw4w9WgXcQ",
  "title": "Debate Band 02-11-2026",
  "duration": 7234,
  "upload_date": "20261102",
  "uploader": "Band Jornalismo",
  "channel_id": "UCxxx",
  "description": "Debate presidencial transmitido pela Band em 02/11/2026.",
  "thumbnails": [],
  "formats": []
}
```

- [ ] **Step 2: Escrever test do parser de metadata**

Criar `tests/unit/scripts/scrape-youtube.test.ts`:

```typescript
import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { extractVideoId, summarizeMetadata } from "../../../scripts/scrape-youtube";

const fixturePath = resolve(__dirname, "../../fixtures/youtube-metadata.json");
const fixture = JSON.parse(readFileSync(fixturePath, "utf-8")) as Record<string, unknown>;

describe("extractVideoId", () => {
  it("extrai ID de URL watch?v=", () => {
    expect(extractVideoId("https://www.youtube.com/watch?v=dQw4w9WgXcQ")).toBe("dQw4w9WgXcQ");
  });

  it("extrai ID de URL youtu.be/", () => {
    expect(extractVideoId("https://youtu.be/dQw4w9WgXcQ")).toBe("dQw4w9WgXcQ");
  });

  it("extrai ID de URL com query params extras", () => {
    expect(extractVideoId("https://www.youtube.com/watch?v=dQw4w9WgXcQ&t=120s")).toBe(
      "dQw4w9WgXcQ",
    );
  });

  it("retorna null para URL inválida", () => {
    expect(extractVideoId("https://exemplo.com/video")).toBeNull();
  });
});

describe("summarizeMetadata", () => {
  it("formata duração como HH:MM:SS", () => {
    const summary = summarizeMetadata(fixture);
    expect(summary).toContain("Debate Band 02-11-2026");
    expect(summary).toContain("02:00:34");
    expect(summary).toContain("Band Jornalismo");
  });
});
```

- [ ] **Step 3: Rodar test — espera falhar**

Run:

```bash
pnpm test tests/unit/scripts/scrape-youtube.test.ts
```

Expected: FAIL — module not found.

- [ ] **Step 4: Implementar scripts/scrape-youtube.ts**

```typescript
import { writeFileSync, mkdirSync } from "node:fs";
import { join } from "node:path";
import youtubedl from "youtube-dl-exec";
import { CACHE_DIR } from "./lib/paths";
import { logger } from "./lib/logger";

const YOUTUBE_ID_RE = /(?:v=|youtu\.be\/|embed\/|shorts\/)([\w-]{11})/;

export function extractVideoId(url: string): string | null {
  const match = YOUTUBE_ID_RE.exec(url);
  return match?.[1] ?? null;
}

function formatDuration(totalSeconds: number): string {
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;
  return [h, m, s].map((n) => String(n).padStart(2, "0")).join(":");
}

export function summarizeMetadata(metadata: Record<string, unknown>): string {
  const title = String(metadata.title ?? "(sem título)");
  const duration = typeof metadata.duration === "number" ? metadata.duration : 0;
  const uploader = String(metadata.uploader ?? "(desconhecido)");
  const uploadDate = String(metadata.upload_date ?? "?");
  return `${title}\n  Duração: ${formatDuration(duration)}\n  Canal: ${uploader}\n  Data: ${uploadDate}`;
}

async function run(): Promise<void> {
  const url = process.argv[2];
  if (!url) {
    logger.error("Uso: pnpm scrape:youtube <url-do-youtube>");
    process.exit(1);
  }

  const videoId = extractVideoId(url);
  if (!videoId) {
    logger.error(`URL não parece ser do YouTube: ${url}`);
    process.exit(1);
  }

  const outDir = join(CACHE_DIR, "youtube");
  mkdirSync(outDir, { recursive: true });

  logger.info(`Baixando metadata de ${videoId}...`);
  const metadata = (await youtubedl(url, {
    dumpSingleJson: true,
    noCheckCertificates: true,
    noWarnings: true,
  })) as Record<string, unknown>;

  const metadataPath = join(outDir, `${videoId}.json`);
  writeFileSync(metadataPath, JSON.stringify(metadata, null, 2), "utf-8");
  logger.success(`Metadata salva em ${metadataPath}`);

  logger.info(`Extraindo áudio MP3...`);
  await youtubedl(url, {
    extractAudio: true,
    audioFormat: "mp3",
    audioQuality: 0,
    output: join(outDir, "%(id)s.%(ext)s"),
    noCheckCertificates: true,
    noWarnings: true,
  });
  logger.success(`Áudio salvo em ${join(outDir, `${videoId}.mp3`)}`);

  logger.info("\n" + summarizeMetadata(metadata));
}

const isMain = import.meta.url === `file://${process.argv[1]}`;
if (isMain) {
  run().catch((err: unknown) => {
    logger.error(err instanceof Error ? err : String(err));
    process.exit(1);
  });
}
```

- [ ] **Step 5: Rodar test — espera passar**

Run:

```bash
pnpm test tests/unit/scripts/scrape-youtube.test.ts
```

Expected: 5 tests passing.

- [ ] **Step 6: Smoke run com --help do yt-dlp (sem rede)**

Run:

```bash
pnpm scrape:youtube
```

Expected: erro "Uso: pnpm scrape:youtube <url-do-youtube>" e exit 1. Confirma que o script entry-point está OK.

- [ ] **Step 7: Lint + typecheck**

Run:

```bash
pnpm lint && pnpm typecheck
```

Expected: zero errors.

- [ ] **Step 8: Commit**

```bash
git add scripts/scrape-youtube.ts tests/unit/scripts/scrape-youtube.test.ts tests/fixtures/youtube-metadata.json
git commit -m "feat(scripts): scrape-youtube baixa metadata e áudio via yt-dlp

Wrapper sobre youtube-dl-exec (Context7: /microlinkhq/youtube-dl-exec).
Baixa metadata como JSON e extrai áudio MP3 para .cache/youtube/.

Funções puras (extractVideoId, summarizeMetadata) testadas com fixture.
Chamadas yt-dlp não cobertas em unit test — verificadas manualmente
durante operação do pipeline."
```

---

### Task 8: scripts/transcribe.ts — transcrição via OpenAI Whisper API

**Files:**

- Create: `scripts/transcribe.ts`
- Create: `tests/fixtures/whisper-response.json`
- Create: `tests/unit/scripts/transcribe.test.ts`

**Validação Context7 — `/openai/openai-node`:**

```typescript
const transcription = await client.audio.transcriptions.create({
  file: fs.createReadStream("audio.mp3"),
  model: "whisper-1",
});
```

- Parâmetro `language: 'pt'` força detecção pt-BR.
- `response_format: 'verbose_json'` retorna timestamps por segmento.

**Como funciona:**

1. Aceita path de arquivo de áudio como argumento.
2. Lê env `OPENAI_API_KEY`.
3. Envia para Whisper API com `language: "pt"`, `response_format: "verbose_json"`.
4. Salva resposta completa em `.cache/transcripts/<basename>.json`.
5. Imprime texto bruto para preview.

- [ ] **Step 1: Criar fixture de resposta Whisper**

Criar `tests/fixtures/whisper-response.json`:

```json
{
  "task": "transcribe",
  "language": "portuguese",
  "duration": 12.5,
  "text": "Vamos reduzir o imposto de renda para a classe média.",
  "segments": [
    {
      "id": 0,
      "start": 0.0,
      "end": 5.2,
      "text": "Vamos reduzir o imposto de renda"
    },
    {
      "id": 1,
      "start": 5.2,
      "end": 12.5,
      "text": " para a classe média."
    }
  ]
}
```

- [ ] **Step 2: Escrever test do formatador**

Criar `tests/unit/scripts/transcribe.test.ts`:

```typescript
import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { formatSegmentsAsTimestamps } from "../../../scripts/transcribe";

type WhisperResponse = {
  text: string;
  duration: number;
  segments: Array<{ id: number; start: number; end: number; text: string }>;
};

const fixturePath = resolve(__dirname, "../../fixtures/whisper-response.json");
const fixture = JSON.parse(readFileSync(fixturePath, "utf-8")) as WhisperResponse;

describe("formatSegmentsAsTimestamps", () => {
  it("formata segments como [HH:MM:SS] texto", () => {
    const formatted = formatSegmentsAsTimestamps(fixture.segments);
    expect(formatted).toContain("[00:00:00] Vamos reduzir o imposto de renda");
    expect(formatted).toContain("[00:00:05]");
  });

  it("formata duração em segundos corretamente", () => {
    const segments = [{ id: 0, start: 3665, end: 3700, text: "teste" }];
    expect(formatSegmentsAsTimestamps(segments)).toBe("[01:01:05] teste");
  });

  it("retorna string vazia para array vazio", () => {
    expect(formatSegmentsAsTimestamps([])).toBe("");
  });
});
```

- [ ] **Step 3: Rodar test — espera falhar**

Run:

```bash
pnpm test tests/unit/scripts/transcribe.test.ts
```

Expected: FAIL — module not found.

- [ ] **Step 4: Implementar scripts/transcribe.ts**

```typescript
import { createReadStream, writeFileSync, mkdirSync, existsSync } from "node:fs";
import { basename, extname, join } from "node:path";
import OpenAI from "openai";
import { CACHE_DIR } from "./lib/paths";
import { requireEnv } from "./lib/env";
import { logger } from "./lib/logger";

type WhisperSegment = {
  id: number;
  start: number;
  end: number;
  text: string;
};

function formatTimestamp(seconds: number): string {
  const total = Math.floor(seconds);
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  return [h, m, s].map((n) => String(n).padStart(2, "0")).join(":");
}

export function formatSegmentsAsTimestamps(segments: WhisperSegment[]): string {
  return segments.map((seg) => `[${formatTimestamp(seg.start)}] ${seg.text.trim()}`).join("\n");
}

async function run(): Promise<void> {
  const audioPath = process.argv[2];
  if (!audioPath) {
    logger.error("Uso: pnpm transcribe <path-do-audio.mp3>");
    process.exit(1);
  }

  if (!existsSync(audioPath)) {
    logger.error(`Arquivo não encontrado: ${audioPath}`);
    process.exit(1);
  }

  const apiKey = requireEnv("OPENAI_API_KEY");
  const client = new OpenAI({ apiKey });

  const outDir = join(CACHE_DIR, "transcripts");
  mkdirSync(outDir, { recursive: true });

  const baseName = basename(audioPath, extname(audioPath));
  logger.info(`Transcrevendo ${baseName} via Whisper API (pt-BR)...`);

  const response = await client.audio.transcriptions.create({
    file: createReadStream(audioPath),
    model: "whisper-1",
    language: "pt",
    response_format: "verbose_json",
  });

  const outPath = join(outDir, `${baseName}.json`);
  writeFileSync(outPath, JSON.stringify(response, null, 2), "utf-8");
  logger.success(`Transcrição salva em ${outPath}`);

  const segments = (response as { segments?: WhisperSegment[] }).segments ?? [];
  if (segments.length > 0) {
    const timestamped = formatSegmentsAsTimestamps(segments);
    const txtPath = join(outDir, `${baseName}.txt`);
    writeFileSync(txtPath, timestamped, "utf-8");
    logger.success(`Versão timestamped salva em ${txtPath}`);
    logger.info("\nPrimeiros 500 caracteres:\n" + timestamped.slice(0, 500));
  } else {
    logger.warn("Resposta sem segments — apenas texto bruto disponível.");
    logger.info("\nTexto:\n" + ((response as { text?: string }).text ?? ""));
  }
}

const isMain = import.meta.url === `file://${process.argv[1]}`;
if (isMain) {
  run().catch((err: unknown) => {
    logger.error(err instanceof Error ? err : String(err));
    process.exit(1);
  });
}
```

- [ ] **Step 5: Rodar test — espera passar**

Run:

```bash
pnpm test tests/unit/scripts/transcribe.test.ts
```

Expected: 3 tests passing.

- [ ] **Step 6: Smoke run sem args**

Run:

```bash
pnpm transcribe
```

Expected: erro "Uso: pnpm transcribe <path-do-audio.mp3>" e exit 1.

- [ ] **Step 7: Smoke run com arquivo inexistente**

Run:

```bash
pnpm transcribe /tmp/inexistente.mp3
```

Expected: erro "Arquivo não encontrado: ..." e exit 1.

- [ ] **Step 8: Lint + typecheck**

Run:

```bash
pnpm lint && pnpm typecheck
```

Expected: zero errors.

- [ ] **Step 9: Commit**

```bash
git add scripts/transcribe.ts tests/unit/scripts/transcribe.test.ts tests/fixtures/whisper-response.json
git commit -m "feat(scripts): transcribe usa OpenAI Whisper API

Wrapper sobre openai SDK (Context7: /openai/openai-node v6).
Modelo whisper-1 com language='pt' e response_format='verbose_json'
para receber segments com timestamps.

Output: .cache/transcripts/<id>.json (resposta completa) +
.cache/transcripts/<id>.txt (versão timestamped legível).

Custo estimado: ~\$0.006/min de áudio (Whisper pricing 2024)."
```

---

### Task 9: scripts/archive.ts — Wayback Machine Save Page Now

**Files:**

- Create: `scripts/archive.ts`
- Create: `tests/unit/scripts/archive.test.ts`

**Validação:** Internet Archive Save Page Now API é HTTP REST simples (sem SDK Node oficial). Documentação canônica: https://archive.org/help/wayback_api.php. Endpoint usado:

- `POST https://web.archive.org/save/<URL>` — dispara save, retorna `Location` header com archive URL OU response page com link.

**Como funciona:**

1. Aceita URL como argumento.
2. Faz `POST` para `https://web.archive.org/save/<URL>`.
3. Lê `Location` header (Wayback ressuscita o snapshot).
4. Imprime URL do snapshot e salva em `.cache/archive/<hash>.txt`.

- [ ] **Step 1: Escrever test do builder de URL**

Criar `tests/unit/scripts/archive.test.ts`:

```typescript
import { describe, it, expect } from "vitest";
import { buildSaveUrl, extractArchiveUrl, hashUrl } from "../../../scripts/archive";

describe("buildSaveUrl", () => {
  it("monta URL com encoding correto", () => {
    expect(buildSaveUrl("https://exemplo.com/post?id=1")).toBe(
      "https://web.archive.org/save/https://exemplo.com/post?id=1",
    );
  });

  it("aceita URL com unicode (acentos)", () => {
    expect(buildSaveUrl("https://exemplo.com/política")).toBe(
      "https://web.archive.org/save/https://exemplo.com/política",
    );
  });
});

describe("extractArchiveUrl", () => {
  it("extrai URL do header Content-Location quando presente", () => {
    const headers = new Headers();
    headers.set("Content-Location", "/web/20261102/https://exemplo.com");
    expect(extractArchiveUrl(headers)).toBe(
      "https://web.archive.org/web/20261102/https://exemplo.com",
    );
  });

  it("extrai do header Location quando Content-Location ausente", () => {
    const headers = new Headers();
    headers.set("Location", "https://web.archive.org/web/20261102/https://exemplo.com");
    expect(extractArchiveUrl(headers)).toBe(
      "https://web.archive.org/web/20261102/https://exemplo.com",
    );
  });

  it("retorna null quando nenhum header disponível", () => {
    expect(extractArchiveUrl(new Headers())).toBeNull();
  });
});

describe("hashUrl", () => {
  it("produz hash hex estável de 8 chars", () => {
    const h = hashUrl("https://exemplo.com/post");
    expect(h).toHaveLength(8);
    expect(h).toMatch(/^[a-f0-9]{8}$/);
  });

  it("produz mesmo hash para mesma URL", () => {
    expect(hashUrl("https://exemplo.com")).toBe(hashUrl("https://exemplo.com"));
  });

  it("produz hashes diferentes para URLs diferentes", () => {
    expect(hashUrl("https://a.com")).not.toBe(hashUrl("https://b.com"));
  });
});
```

- [ ] **Step 2: Rodar test — espera falhar**

Run:

```bash
pnpm test tests/unit/scripts/archive.test.ts
```

Expected: FAIL — module not found.

- [ ] **Step 3: Implementar scripts/archive.ts**

```typescript
import { writeFileSync, mkdirSync } from "node:fs";
import { join } from "node:path";
import { createHash } from "node:crypto";
import { CACHE_DIR } from "./lib/paths";
import { logger } from "./lib/logger";

export function buildSaveUrl(url: string): string {
  return `https://web.archive.org/save/${url}`;
}

export function extractArchiveUrl(headers: Headers): string | null {
  const contentLocation = headers.get("Content-Location");
  if (contentLocation) {
    return contentLocation.startsWith("http")
      ? contentLocation
      : `https://web.archive.org${contentLocation}`;
  }
  const location = headers.get("Location");
  if (location) {
    return location.startsWith("http") ? location : `https://web.archive.org${location}`;
  }
  return null;
}

export function hashUrl(url: string): string {
  return createHash("sha256").update(url).digest("hex").slice(0, 8);
}

async function run(): Promise<void> {
  const url = process.argv[2];
  if (!url) {
    logger.error("Uso: pnpm archive <url>");
    process.exit(1);
  }

  const outDir = join(CACHE_DIR, "archive");
  mkdirSync(outDir, { recursive: true });

  const saveUrl = buildSaveUrl(url);
  logger.info(`Arquivando via Wayback Machine: ${url}`);
  logger.info(`(pode levar 30-90s para snapshot ser criado)`);

  const response = await fetch(saveUrl, {
    method: "POST",
    redirect: "manual",
    headers: {
      "User-Agent": "atlas-2026/0.1 (+https://github.com/dezobq/atlas-2026)",
    },
  });

  const archiveUrl = extractArchiveUrl(response.headers);
  if (!archiveUrl) {
    logger.error(
      `Wayback não retornou URL de snapshot (status ${response.status}). ` +
        "A página pode estar bloqueando arquivamento.",
    );
    process.exit(1);
  }

  const hash = hashUrl(url);
  const recordPath = join(outDir, `${hash}.txt`);
  writeFileSync(recordPath, `${new Date().toISOString()}\n${url}\n${archiveUrl}\n`, "utf-8");

  logger.success(`Snapshot criado:\n  ${archiveUrl}`);
  logger.info(`Registro: ${recordPath}`);
}

const isMain = import.meta.url === `file://${process.argv[1]}`;
if (isMain) {
  run().catch((err: unknown) => {
    logger.error(err instanceof Error ? err : String(err));
    process.exit(1);
  });
}
```

- [ ] **Step 4: Rodar test — espera passar**

Run:

```bash
pnpm test tests/unit/scripts/archive.test.ts
```

Expected: 7 tests passing.

- [ ] **Step 5: Smoke run sem args**

Run:

```bash
pnpm archive
```

Expected: "Uso: pnpm archive <url>" e exit 1.

- [ ] **Step 6: Lint + typecheck**

Run:

```bash
pnpm lint && pnpm typecheck
```

Expected: zero errors.

- [ ] **Step 7: Commit**

```bash
git add scripts/archive.ts tests/unit/scripts/archive.test.ts
git commit -m "feat(scripts): archive dispara Wayback Save Page Now

Wrapper sobre Internet Archive Save Page Now (sem SDK, fetch puro).
Endpoint: POST https://web.archive.org/save/<URL>.

Resolução de URL do snapshot:
1. Header Content-Location (caminho relativo)
2. Header Location (fallback)

Output: .cache/archive/<hash>.txt com timestamp + URL original + URL
do snapshot. Hash SHA-256 truncado em 8 chars para filename estável.

User-Agent customizado identifica Atlas para análise futura de logs."
```

---

### Task 10: scripts/scrape-url.ts — Firecrawl para URLs genéricas

**Files:**

- Create: `scripts/scrape-url.ts`
- Create: `tests/unit/scripts/scrape-url.test.ts`

**Validação Context7 — `/firecrawl/firecrawl-docs`:**

```javascript
import Firecrawl from "@mendable/firecrawl-js";
const firecrawl = new Firecrawl({ apiKey: "fc-..." });
const doc = await firecrawl.scrape("https://example.com", {
  formats: ["markdown", "screenshot"],
});
console.log(doc.markdown);
```

**Como funciona:**

1. Aceita URL como argumento.
2. Lê env `FIRECRAWL_API_KEY`.
3. Chama `firecrawl.scrape(url, { formats: ['markdown', 'screenshot'] })`.
4. Salva markdown em `.cache/scrape/<hash>.md`.
5. Decodifica screenshot base64 → `.cache/scrape/<hash>.png` (se presente).

- [ ] **Step 1: Escrever test de utilitários**

Criar `tests/unit/scripts/scrape-url.test.ts`:

```typescript
import { describe, it, expect } from "vitest";
import { sanitizeFilename, isLikelyUrl } from "../../../scripts/scrape-url";

describe("sanitizeFilename", () => {
  it("converte caracteres não-alfanuméricos em -", () => {
    expect(sanitizeFilename("Notícia: G1!")).toBe("noticia-g1");
  });

  it("remove diacríticos", () => {
    expect(sanitizeFilename("declaração")).toBe("declaracao");
  });

  it("limita comprimento a 40 chars", () => {
    const long = "a".repeat(100);
    expect(sanitizeFilename(long).length).toBeLessThanOrEqual(40);
  });
});

describe("isLikelyUrl", () => {
  it("aceita https", () => {
    expect(isLikelyUrl("https://exemplo.com")).toBe(true);
  });

  it("aceita http", () => {
    expect(isLikelyUrl("http://exemplo.com")).toBe(true);
  });

  it("rejeita strings sem protocolo", () => {
    expect(isLikelyUrl("exemplo.com")).toBe(false);
  });

  it("rejeita strings vazias", () => {
    expect(isLikelyUrl("")).toBe(false);
  });
});
```

- [ ] **Step 2: Rodar test — espera falhar**

Run:

```bash
pnpm test tests/unit/scripts/scrape-url.test.ts
```

Expected: FAIL — module not found.

- [ ] **Step 3: Implementar scripts/scrape-url.ts**

```typescript
import { writeFileSync, mkdirSync } from "node:fs";
import { join } from "node:path";
import Firecrawl from "@mendable/firecrawl-js";
import { CACHE_DIR } from "./lib/paths";
import { requireEnv } from "./lib/env";
import { logger } from "./lib/logger";
import { hashUrl } from "./archive";

export function sanitizeFilename(input: string): string {
  return input
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40);
}

export function isLikelyUrl(input: string): boolean {
  return /^https?:\/\//i.test(input);
}

async function run(): Promise<void> {
  const url = process.argv[2];
  if (!url) {
    logger.error("Uso: pnpm scrape:url <url>");
    process.exit(1);
  }

  if (!isLikelyUrl(url)) {
    logger.error(`URL inválida (esperado http/https): ${url}`);
    process.exit(1);
  }

  const apiKey = requireEnv("FIRECRAWL_API_KEY");
  const firecrawl = new Firecrawl({ apiKey });

  const outDir = join(CACHE_DIR, "scrape");
  mkdirSync(outDir, { recursive: true });

  logger.info(`Scraping ${url} via Firecrawl...`);
  const doc = await firecrawl.scrape(url, {
    formats: [
      "markdown",
      {
        type: "screenshot",
        fullPage: true,
        quality: 80,
        viewport: { width: 1280, height: 800 },
      },
    ],
  });

  const hash = hashUrl(url);

  const markdown = (doc as { markdown?: string }).markdown ?? "";
  if (markdown.length > 0) {
    const mdPath = join(outDir, `${hash}.md`);
    writeFileSync(mdPath, markdown, "utf-8");
    logger.success(`Markdown (${markdown.length} chars) salvo em ${mdPath}`);
  } else {
    logger.warn("Firecrawl retornou markdown vazio.");
  }

  const screenshot = (doc as { screenshot?: string }).screenshot;
  if (typeof screenshot === "string") {
    const base64 = screenshot.startsWith("data:")
      ? (screenshot.split(",")[1] ?? screenshot)
      : screenshot;
    const imgPath = join(outDir, `${hash}.png`);
    writeFileSync(imgPath, Buffer.from(base64, "base64"));
    logger.success(`Screenshot salvo em ${imgPath}`);
  }
}

const isMain = import.meta.url === `file://${process.argv[1]}`;
if (isMain) {
  run().catch((err: unknown) => {
    logger.error(err instanceof Error ? err : String(err));
    process.exit(1);
  });
}
```

- [ ] **Step 4: Rodar test — espera passar**

Run:

```bash
pnpm test tests/unit/scripts/scrape-url.test.ts
```

Expected: 7 tests passing.

- [ ] **Step 5: Smoke run sem args**

Run:

```bash
pnpm scrape:url
```

Expected: "Uso: pnpm scrape:url <url>" e exit 1.

- [ ] **Step 6: Smoke run com input inválido**

Run:

```bash
pnpm scrape:url exemplo.com
```

Expected: "URL inválida (esperado http/https): exemplo.com" e exit 1.

- [ ] **Step 7: Lint + typecheck**

Run:

```bash
pnpm lint && pnpm typecheck
```

Expected: zero errors.

- [ ] **Step 8: Commit**

```bash
git add scripts/scrape-url.ts tests/unit/scripts/scrape-url.test.ts
git commit -m "feat(scripts): scrape-url usa Firecrawl para URLs genéricas

Wrapper sobre @mendable/firecrawl-js (Context7: /firecrawl/firecrawl-docs).
Captura markdown + screenshot fullpage 1280x800.

Output:
- .cache/scrape/<hash>.md (conteúdo markdown limpo)
- .cache/scrape/<hash>.png (screenshot decodificado de base64)

Hash = SHA-256[0..8] da URL (reutiliza hashUrl de archive.ts)."
```

---

### Task 11: scripts/generate-og-images.ts — Satori → SVG → Resvg → PNG

**Files:**

- Create: `scripts/generate-og-images.ts`
- Create: `tests/unit/scripts/generate-og-images.test.ts`
- Create: `assets/fonts/Geist-Regular.ttf` (binário, ver Step 1)
- Create: `assets/fonts/Geist-Medium.ttf` (binário, ver Step 1)
- Modify: `.gitignore` (remove `assets/fonts/` se foi adicionado errado no Task 5)

**Validação Context7 — `/vercel/satori` + `/thx/resvg-js`:**

- `satori(jsx, { width, height, fonts: [{ name, data, weight, style }] })` retorna SVG string.
- `new Resvg(svg).render().asPng()` converte SVG → PNG Buffer.

**Como funciona:**

1. Carrega fonts Geist Regular + Medium do `assets/fonts/`.
2. Lê declarações de `data/declaracoes/*.md` (uma OG image por declaração).
3. Para cada declaração: gera JSX com citação + candidato + data, converte Satori → Resvg → PNG.
4. Salva em `public/og/<declaracao-id>.png`.

- [ ] **Step 1: Baixar fonts Geist (manual, uma vez)**

Os arquivos `Geist-Regular.ttf` e `Geist-Medium.ttf` precisam estar em `assets/fonts/`. Como são binários e não devem ser commitados na primeira leitura, fazer download direto:

Run (Windows PowerShell ou bash):

```bash
mkdir -p assets/fonts
curl -L -o assets/fonts/Geist-Regular.ttf https://github.com/vercel/geist-font/raw/main/packages/next/dist/fonts/geist-sans/Geist-Regular.ttf
curl -L -o assets/fonts/Geist-Medium.ttf https://github.com/vercel/geist-font/raw/main/packages/next/dist/fonts/geist-sans/Geist-Medium.ttf
ls -la assets/fonts/
```

Expected: 2 arquivos `.ttf` com ~80-200KB cada.

> **Validação:** se os URLs do GitHub mudaram (Geist Font repo pode renomear paths), fallback é baixar via `@fontsource-variable/geist` que já é dep do Plan 1 — copiar de `node_modules/@fontsource-variable/geist/files/*.woff2` (mas Satori prefere TTF, então preferir releases oficiais).

- [ ] **Step 2: Decidir se versionar fonts**

Fonts TTF são binários ~80-200KB. Duas opções equivalentes na comunidade:

**Opção A (recomendada):** versionar em git (binários pequenos, simplifica CI).
**Opção B:** scripts/download-fonts.ts que baixa em CI.

Para Sprint 3, escolher **A** (mais simples). Remover `assets/fonts/` de `.gitignore` se foi adicionado:

Editar `.gitignore` — manter `assets/fonts/` fora da lista de ignore. Se Task 5 adicionou, remover.

- [ ] **Step 3: Escrever test do builder de JSX**

Criar `tests/unit/scripts/generate-og-images.test.ts`:

```typescript
import { describe, it, expect } from "vitest";
import { truncateCitacao, ogImagePath } from "../../../scripts/generate-og-images";

describe("truncateCitacao", () => {
  it("não altera citação curta", () => {
    expect(truncateCitacao("texto curto", 100)).toBe("texto curto");
  });

  it("trunca em boundary de palavra com ellipsis", () => {
    const result = truncateCitacao("Vamos reduzir o imposto de renda da classe média", 20);
    expect(result.endsWith("…")).toBe(true);
    expect(result.length).toBeLessThanOrEqual(21);
  });

  it("respeita comprimento exato quando coincide com word boundary", () => {
    expect(truncateCitacao("um dois três", 12)).toBe("um dois três");
  });
});

describe("ogImagePath", () => {
  it("retorna path no diretório OG_DIR", () => {
    expect(ogImagePath("01J9XYZ123")).toMatch(/public[\\/]og[\\/]01J9XYZ123\.png$/);
  });
});
```

- [ ] **Step 4: Rodar test — espera falhar**

Run:

```bash
pnpm test tests/unit/scripts/generate-og-images.test.ts
```

Expected: FAIL.

- [ ] **Step 5: Implementar scripts/generate-og-images.ts**

```typescript
import { readFileSync, writeFileSync, mkdirSync, readdirSync } from "node:fs";
import { join, basename, extname } from "node:path";
import satori from "satori";
import { Resvg } from "@resvg/resvg-js";
import matter from "gray-matter";
import { OG_DIR, DECLARACOES_DIR } from "./lib/paths";
import { logger } from "./lib/logger";

const WIDTH = 1200;
const HEIGHT = 630;
const ASSETS_FONT_DIR = join(process.cwd(), "assets", "fonts");

type FrontmatterMinimo = {
  id: string;
  texto: string;
  candidato_id: string;
  criado_em: string;
};

export function truncateCitacao(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  const cut = text.slice(0, maxLength);
  if (text[maxLength] === " ") return cut + "…";
  const lastSpace = cut.lastIndexOf(" ");
  return (lastSpace > 0 ? cut.slice(0, lastSpace) : cut) + "…";
}

export function ogImagePath(id: string): string {
  return join(OG_DIR, `${id}.png`);
}

function buildJsx(citacao: string, candidato: string, data: string): unknown {
  const truncated = truncateCitacao(citacao, 220);
  const dataFmt = new Date(data).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });
  return {
    type: "div",
    props: {
      style: {
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        padding: 80,
        backgroundColor: "#fafafa",
        fontFamily: "Geist",
      },
      children: [
        {
          type: "div",
          props: {
            style: { fontSize: 24, color: "#888", fontWeight: 500 },
            children: "ATLAS DOS CANDIDATOS · 2026",
          },
        },
        {
          type: "div",
          props: {
            style: {
              fontSize: 48,
              color: "#171717",
              lineHeight: 1.2,
              fontWeight: 500,
              letterSpacing: "-0.02em",
            },
            children: `"${truncated}"`,
          },
        },
        {
          type: "div",
          props: {
            style: {
              fontSize: 22,
              color: "#4d4d4d",
              display: "flex",
              gap: 16,
            },
            children: [
              { type: "span", props: { children: candidato } },
              { type: "span", props: { style: { color: "#a1a1a1" }, children: "·" } },
              { type: "span", props: { children: dataFmt } },
            ],
          },
        },
      ],
    },
  };
}

async function renderOg(
  jsx: unknown,
  fonts: Array<{ name: string; data: Buffer; weight: 400 | 500; style: "normal" }>,
): Promise<Buffer> {
  const svg = await satori(jsx as never, { width: WIDTH, height: HEIGHT, fonts });
  const resvg = new Resvg(svg, {
    fitTo: { mode: "width", value: WIDTH },
    font: { loadSystemFonts: false },
  });
  return resvg.render().asPng();
}

async function run(): Promise<void> {
  const fonts = [
    {
      name: "Geist",
      data: readFileSync(join(ASSETS_FONT_DIR, "Geist-Regular.ttf")),
      weight: 400 as const,
      style: "normal" as const,
    },
    {
      name: "Geist",
      data: readFileSync(join(ASSETS_FONT_DIR, "Geist-Medium.ttf")),
      weight: 500 as const,
      style: "normal" as const,
    },
  ];

  mkdirSync(OG_DIR, { recursive: true });

  let declaracoes: string[] = [];
  try {
    declaracoes = readdirSync(DECLARACOES_DIR).filter((f) => extname(f) === ".md");
  } catch {
    logger.warn(`Diretório ${DECLARACOES_DIR} ainda não existe. Nada a gerar.`);
    return;
  }

  if (declaracoes.length === 0) {
    logger.warn(`Nenhuma declaração em ${DECLARACOES_DIR}. Nada a gerar.`);
    return;
  }

  logger.info(`Gerando ${declaracoes.length} OG image(s)...`);

  for (const file of declaracoes) {
    const path = join(DECLARACOES_DIR, file);
    const parsed = matter(readFileSync(path, "utf-8"));
    const fm = parsed.data as FrontmatterMinimo;
    if (!fm.id || !fm.texto || !fm.candidato_id || !fm.criado_em) {
      logger.warn(`${file}: frontmatter incompleto, pulando.`);
      continue;
    }
    const jsx = buildJsx(fm.texto, fm.candidato_id, fm.criado_em);
    const png = await renderOg(jsx, fonts);
    const outPath = ogImagePath(fm.id);
    writeFileSync(outPath, png);
    logger.success(`${basename(file)} → ${outPath}`);
  }

  logger.info(`\nTotal: ${declaracoes.length} OG image(s) gerada(s) em ${OG_DIR}`);
}

const isMain = import.meta.url === `file://${process.argv[1]}`;
if (isMain) {
  run().catch((err: unknown) => {
    logger.error(err instanceof Error ? err : String(err));
    process.exit(1);
  });
}
```

- [ ] **Step 6: Rodar test — espera passar**

Run:

```bash
pnpm test tests/unit/scripts/generate-og-images.test.ts
```

Expected: 4 tests passing.

- [ ] **Step 7: Smoke run sem declarações — espera warning**

Run:

```bash
pnpm generate:og
```

Expected:

```
⚠ Diretório <...>/data/declaracoes ainda não existe. Nada a gerar.
```

(ou warning equivalente se diretório existe mas vazio). Exit 0.

- [ ] **Step 8: Criar declaração de exemplo para validar geração real**

Criar `data/declaracoes/exemplo-smoke-test.md`:

```markdown
---
id: 01J9XYZSMOKETEST123
slug: exemplo-smoke-test
candidato_id: cand-exemplo
evento_id: evt-exemplo
texto: "Vamos reduzir o imposto de renda para a classe média brasileira nos próximos quatro anos."
timestamp_no_evento: "00:15:30"
contexto: "Resposta a pergunta sobre política tributária no bloco de economia."
tema_principal: economia
temas_secundarios: []
tipo_estrutural:
  - promessa
fonte_primaria_url: "https://www.youtube.com/watch?v=exemplo"
fonte_primaria_tipo: youtube_oficial
archive_url: "https://web.archive.org/web/20261102/https://www.youtube.com/watch?v=exemplo"
vereditos_externos: []
versao: 1
criado_em: "2026-11-02T21:34:00.000Z"
atualizado_em: "2026-11-02T21:34:00.000Z"
---

Declaração de smoke test apenas para validar pipeline OG image. Remover após verificação.
```

- [ ] **Step 9: Rodar generate:og — espera gerar PNG**

Run:

```bash
pnpm generate:og
ls public/og/
```

Expected:

```
✓ exemplo-smoke-test.md → <...>/public/og/01J9XYZSMOKETEST123.png
01J9XYZSMOKETEST123.png
```

Abrir `public/og/01J9XYZSMOKETEST123.png` em visualizador e verificar:

- Texto "ATLAS DOS CANDIDATOS · 2026" no topo
- Citação grande centralizada
- Candidato + data no bottom
- Geist font renderizando (acentos OK)

- [ ] **Step 10: Remover arquivo de smoke test**

Run:

```bash
rm data/declaracoes/exemplo-smoke-test.md
rm public/og/01J9XYZSMOKETEST123.png
```

- [ ] **Step 11: Lint + typecheck**

Run:

```bash
pnpm lint && pnpm typecheck
```

Expected: zero errors.

- [ ] **Step 12: Commit**

```bash
git add scripts/generate-og-images.ts tests/unit/scripts/generate-og-images.test.ts assets/fonts/
git commit -m "feat(scripts): generate-og-images via Satori + Resvg

Pipeline JSX → SVG → PNG (Context7: /vercel/satori, /thx/resvg-js).
Lê data/declaracoes/*.md e gera public/og/<id>.png (1200×630).

Design tokens hardcoded (palette canvas-soft #fafafa, ink #171717,
text-mute #888, text-body #4d4d4d) consistente com .surface-dark.
Fonts Geist Regular (400) + Medium (500) versionados em assets/fonts/.

Truncate em word boundary 220 chars para manter visual limpo.
Date formatada com pt-BR Intl + timeZone UTC para reprodutibilidade."
```

---

### Task 12: scripts/export-dataset.ts — JSONL + CSV

**Files:**

- Create: `scripts/export-dataset.ts`
- Create: `tests/unit/scripts/export-dataset.test.ts`

**Validação:** `papaparse` é a lib canônica de CSV em JS (50M+ downloads/sem). JSONL é apenas `JSON.stringify(obj) + "\n"` por linha, sem lib externa necessária.

**Como funciona:**

1. Lê todas as declarações de `data/declaracoes/*.md` via `gray-matter`.
2. Constrói array de objetos planos (achata nested objects para CSV).
3. Escreve `dist-dataset/atlas-declaracoes.jsonl` (1 objeto por linha).
4. Escreve `dist-dataset/atlas-declaracoes.csv` via papaparse.
5. Escreve `dist-dataset/SCHEMA.md` documentando colunas.

- [ ] **Step 1: Escrever test de flattening**

Criar `tests/unit/scripts/export-dataset.test.ts`:

```typescript
import { describe, it, expect } from "vitest";
import { flattenDeclaracao, toJsonl, toCsv } from "../../../scripts/export-dataset";

const sample = {
  id: "01J9XYZ123",
  slug: "exemplo",
  candidato_id: "cand-a",
  evento_id: "evt-1",
  texto: "Vamos reduzir",
  timestamp_no_evento: "00:15:30",
  contexto: "contexto",
  tema_principal: "economia",
  temas_secundarios: ["impostos", "renda"],
  tipo_estrutural: ["promessa", "dado_numerico"],
  fonte_primaria_url: "https://example.com",
  fonte_primaria_tipo: "youtube_oficial",
  archive_url: "https://web.archive.org/web/20261102/...",
  snapshot_interno_path: null,
  contexto_adicional: null,
  vereditos_externos: [
    {
      veiculo: "Lupa",
      classificacao: "Falso",
      url: "https://lupa.example/x",
      data: "2026-11-03T10:00:00.000Z",
      citacao_curta: "trecho",
    },
  ],
  versao: 1,
  criado_em: "2026-11-02T21:34:00.000Z",
  atualizado_em: "2026-11-02T21:34:00.000Z",
};

describe("flattenDeclaracao", () => {
  it("achata arrays string em CSV-friendly format", () => {
    const flat = flattenDeclaracao(sample);
    expect(flat.temas_secundarios).toBe("impostos;renda");
    expect(flat.tipo_estrutural).toBe("promessa;dado_numerico");
  });

  it("achata vereditos_externos com count", () => {
    const flat = flattenDeclaracao(sample);
    expect(flat.vereditos_externos_count).toBe(1);
    expect(flat.vereditos_externos_veiculos).toBe("Lupa");
  });

  it("substitui contexto_adicional null por string vazia", () => {
    const flat = flattenDeclaracao(sample);
    expect(flat.contexto_adicional_texto).toBe("");
  });
});

describe("toJsonl", () => {
  it("produz uma linha por objeto", () => {
    const out = toJsonl([{ a: 1 }, { a: 2 }]);
    const lines = out.split("\n").filter(Boolean);
    expect(lines).toHaveLength(2);
    expect(JSON.parse(lines[0]!)).toEqual({ a: 1 });
  });

  it("termina com newline", () => {
    expect(toJsonl([{ a: 1 }])).toBe('{"a":1}\n');
  });

  it("retorna string vazia para array vazio", () => {
    expect(toJsonl([])).toBe("");
  });
});

describe("toCsv", () => {
  it("inclui header com nomes das colunas", () => {
    const out = toCsv([{ a: 1, b: "x" }]);
    expect(out.split("\n")[0]).toBe("a,b");
  });

  it("escapa vírgulas e aspas corretamente", () => {
    const out = toCsv([{ a: 'tem, vírgula e "aspas"' }]);
    expect(out).toContain('"tem, vírgula e ""aspas"""');
  });
});
```

- [ ] **Step 2: Rodar test — espera falhar**

Run:

```bash
pnpm test tests/unit/scripts/export-dataset.test.ts
```

Expected: FAIL.

- [ ] **Step 3: Implementar scripts/export-dataset.ts**

```typescript
import { readFileSync, writeFileSync, mkdirSync, readdirSync, existsSync } from "node:fs";
import { join, extname } from "node:path";
import Papa from "papaparse";
import matter from "gray-matter";
import { DATASET_DIR, DECLARACOES_DIR } from "./lib/paths";
import { logger } from "./lib/logger";

type Declaracao = Record<string, unknown>;

type FlatDeclaracao = {
  id: string;
  slug: string;
  candidato_id: string;
  evento_id: string;
  texto: string;
  timestamp_no_evento: string;
  contexto: string;
  tema_principal: string;
  temas_secundarios: string;
  tipo_estrutural: string;
  fonte_primaria_url: string;
  fonte_primaria_tipo: string;
  archive_url: string;
  snapshot_interno_path: string;
  contexto_adicional_texto: string;
  contexto_adicional_fontes_count: number;
  vereditos_externos_count: number;
  vereditos_externos_veiculos: string;
  versao: number;
  criado_em: string;
  atualizado_em: string;
};

function asString(value: unknown): string {
  if (value === null || value === undefined) return "";
  return String(value);
}

function asStringArray(value: unknown): string[] {
  return Array.isArray(value) ? value.map(asString) : [];
}

export function flattenDeclaracao(d: Declaracao): FlatDeclaracao {
  const contextoAdicional = d.contexto_adicional as
    | { texto?: string; fontes?: unknown[] }
    | null
    | undefined;
  const vereditos = (d.vereditos_externos as Array<{ veiculo?: string }> | undefined) ?? [];

  return {
    id: asString(d.id),
    slug: asString(d.slug),
    candidato_id: asString(d.candidato_id),
    evento_id: asString(d.evento_id),
    texto: asString(d.texto),
    timestamp_no_evento: asString(d.timestamp_no_evento),
    contexto: asString(d.contexto),
    tema_principal: asString(d.tema_principal),
    temas_secundarios: asStringArray(d.temas_secundarios).join(";"),
    tipo_estrutural: asStringArray(d.tipo_estrutural).join(";"),
    fonte_primaria_url: asString(d.fonte_primaria_url),
    fonte_primaria_tipo: asString(d.fonte_primaria_tipo),
    archive_url: asString(d.archive_url),
    snapshot_interno_path: asString(d.snapshot_interno_path),
    contexto_adicional_texto: asString(contextoAdicional?.texto),
    contexto_adicional_fontes_count: Array.isArray(contextoAdicional?.fontes)
      ? contextoAdicional.fontes.length
      : 0,
    vereditos_externos_count: vereditos.length,
    vereditos_externos_veiculos: vereditos.map((v) => asString(v.veiculo)).join(";"),
    versao: typeof d.versao === "number" ? d.versao : 0,
    criado_em: asString(d.criado_em),
    atualizado_em: asString(d.atualizado_em),
  };
}

export function toJsonl(items: Array<Record<string, unknown>>): string {
  if (items.length === 0) return "";
  return items.map((item) => JSON.stringify(item)).join("\n") + "\n";
}

export function toCsv(items: Array<Record<string, unknown>>): string {
  return Papa.unparse(items, { header: true, newline: "\n" });
}

const SCHEMA_DOC = `# Atlas Declarações — Dataset

Exportado de \`data/declaracoes/*.md\` pelo script \`scripts/export-dataset.ts\`.

## Formatos

- \`atlas-declaracoes.jsonl\` — uma declaração por linha (JSON Lines)
- \`atlas-declaracoes.csv\` — mesma estrutura achatada em CSV

## Convenções de achatamento

- Arrays de string viram lista separada por \`;\` (ex: \`temas_secundarios\`, \`tipo_estrutural\`)
- \`contexto_adicional\` (objeto opcional) achatado como \`contexto_adicional_texto\` e \`contexto_adicional_fontes_count\`
- \`vereditos_externos\` (array de objetos) virou \`vereditos_externos_count\` + \`vereditos_externos_veiculos\` (lista \`;\`)

## Schema fonte da verdade

O schema completo (tipos, validações) está em \`data/schemas/declaracao.schema.json\` (JSON Schema draft-07).
Para análise programática, prefira o JSONL onde os objetos preservam nesting.

## Licença

CC-BY 4.0 — atribuição obrigatória ao Atlas dos Candidatos · 2026.
`;

async function run(): Promise<void> {
  if (!existsSync(DECLARACOES_DIR)) {
    logger.error(`Diretório de declarações não encontrado: ${DECLARACOES_DIR}`);
    process.exit(1);
  }

  const files = readdirSync(DECLARACOES_DIR).filter((f) => extname(f) === ".md");
  if (files.length === 0) {
    logger.warn(`Nenhuma declaração em ${DECLARACOES_DIR}. Nada a exportar.`);
    return;
  }

  logger.info(`Lendo ${files.length} declaração(ões)...`);
  const declaracoes: Declaracao[] = files.map((f) => {
    const parsed = matter(readFileSync(join(DECLARACOES_DIR, f), "utf-8"));
    return parsed.data;
  });

  const flat = declaracoes.map(flattenDeclaracao);

  mkdirSync(DATASET_DIR, { recursive: true });

  const jsonlPath = join(DATASET_DIR, "atlas-declaracoes.jsonl");
  writeFileSync(jsonlPath, toJsonl(declaracoes), "utf-8");
  logger.success(`JSONL: ${jsonlPath}`);

  const csvPath = join(DATASET_DIR, "atlas-declaracoes.csv");
  writeFileSync(csvPath, toCsv(flat) + "\n", "utf-8");
  logger.success(`CSV: ${csvPath}`);

  const schemaPath = join(DATASET_DIR, "SCHEMA.md");
  writeFileSync(schemaPath, SCHEMA_DOC, "utf-8");
  logger.success(`Doc: ${schemaPath}`);

  logger.info(`\nTotal: ${flat.length} declaração(ões) exportada(s).`);
}

const isMain = import.meta.url === `file://${process.argv[1]}`;
if (isMain) {
  run().catch((err: unknown) => {
    logger.error(err instanceof Error ? err : String(err));
    process.exit(1);
  });
}
```

- [ ] **Step 4: Rodar test — espera passar**

Run:

```bash
pnpm test tests/unit/scripts/export-dataset.test.ts
```

Expected: 7 tests passing.

- [ ] **Step 5: Smoke run sem declarações — espera warning**

Run:

```bash
pnpm export:dataset
```

Expected: warning sobre diretório vazio, exit 0.

- [ ] **Step 6: Smoke run com declaração de teste**

Recriar `data/declaracoes/exemplo-smoke-test.md` (mesmo conteúdo da Task 11 Step 8), rodar:

```bash
pnpm export:dataset
ls dist-dataset/
cat dist-dataset/atlas-declaracoes.jsonl
head dist-dataset/atlas-declaracoes.csv
```

Expected:

- `dist-dataset/atlas-declaracoes.jsonl` com 1 linha JSON válida
- `dist-dataset/atlas-declaracoes.csv` com header + 1 linha
- `dist-dataset/SCHEMA.md` com documentação

- [ ] **Step 7: Verificar JSONL parseable**

Run:

```bash
node -e "const fs=require('fs'); const l=fs.readFileSync('dist-dataset/atlas-declaracoes.jsonl','utf-8').trim().split('\n'); console.log('Linhas:', l.length); JSON.parse(l[0]); console.log('Linha 1: parsing OK');"
```

Expected: `Linhas: 1` e `Linha 1: parsing OK`.

- [ ] **Step 8: Limpar arquivo de smoke test**

Run:

```bash
rm data/declaracoes/exemplo-smoke-test.md
rm -rf dist-dataset/
```

- [ ] **Step 9: Lint + typecheck**

Run:

```bash
pnpm lint && pnpm typecheck
```

Expected: zero errors.

- [ ] **Step 10: Commit**

```bash
git add scripts/export-dataset.ts tests/unit/scripts/export-dataset.test.ts
git commit -m "feat(scripts): export-dataset gera JSONL + CSV + SCHEMA.md

Lê data/declaracoes/*.md via gray-matter e exporta para
dist-dataset/ em 3 formatos:

- atlas-declaracoes.jsonl: 1 objeto por linha (preserva nesting)
- atlas-declaracoes.csv: estrutura achatada via papaparse
- SCHEMA.md: documentação humana das convenções de achatamento

Achatamento:
- Arrays de string → join(';')
- contexto_adicional (object) → 2 colunas (_texto, _fontes_count)
- vereditos_externos (array) → 2 colunas (_count, _veiculos)

JSONL preserva nesting completo para análise programática.
CSV é amigável para Excel/pandas com perda de info documentada."
```

---

### Task 13: scripts/README.md — manual do operador

**Files:**

- Create: `scripts/README.md`

**Por que último:** documenta workflow end-to-end usando todos os 6 scripts. Só pode ser escrito depois que cada um existe.

- [ ] **Step 1: Criar scripts/README.md**

```markdown
# Pipeline de Ingestão — Atlas dos Candidatos · 2026

Conjunto de scripts CLI que automatiza parcialmente o trabalho de coletar,
arquivar, transcrever e exportar declarações de candidatos.

## Pré-requisitos

1. Node 22+ e pnpm 9+ instalados (ver \`engines\` em \`package.json\`).
2. \`pnpm install\` executado uma vez.
3. \`.env\` criado a partir de \`.env.example\`:
   - \`OPENAI_API_KEY\` — necessário para \`pnpm transcribe\`.
   - \`FIRECRAWL_API_KEY\` — necessário para \`pnpm scrape:url\`.
4. \`yt-dlp\` é auto-instalado pelo \`youtube-dl-exec\` na primeira execução.

## Workflow operacional típico

### Nível 1 — YouTube oficial (5-10 min por declaração)

\`\`\`bash

# 1. Baixar áudio + metadata

pnpm scrape:youtube https://www.youtube.com/watch?v=ABCDE12345

# Output: .cache/youtube/ABCDE12345.{json,mp3}

# 2. Transcrever com Whisper

pnpm transcribe .cache/youtube/ABCDE12345.mp3

# Output: .cache/transcripts/ABCDE12345.{json,txt}

# 3. Arquivar a URL no Wayback

pnpm archive https://www.youtube.com/watch?v=ABCDE12345

# Output: .cache/archive/<hash>.txt (com URL do snapshot)

# 4. Criar manualmente a declaração em data/declaracoes/<slug>.md

# usando os trechos transcritos e os links coletados acima.

\`\`\`

### Nível 2 — Mídia consolidada com vídeo embedado (10-15 min)

\`\`\`bash

# 1. Scrape da URL (markdown + screenshot)

pnpm scrape:url https://g1.globo.com/politica/noticia/...

# Output: .cache/scrape/<hash>.{md,png}

# 2. Arquivar

pnpm archive https://g1.globo.com/politica/noticia/...

# 3. Se houver vídeo: extrair URL, rodar scrape:youtube

# 4. Criar declaração manualmente

\`\`\`

### Nível 3 — Post de rede social (20-30 min)

\`\`\`bash

# 1. Arquivar primeiro (X/IG podem remover rapidamente)

pnpm archive https://x.com/exemplo/status/123

# 2. Scrape pra ter markdown e screenshot

pnpm scrape:url https://x.com/exemplo/status/123

# 3. Se houver vídeo nativo: scrape:youtube tenta yt-dlp como fallback

# 4. Transcrever áudio se aplicável

# 5. Criar declaração com nota sobre fonte secundária se Wayback falhou

\`\`\`

## Após adicionar declarações

\`\`\`bash

# Validar schema das novas declarações

pnpm validate-data

# Gerar OG images para todas as declarações

pnpm generate:og

# Output: public/og/<id>.png

# Exportar dataset completo

pnpm export:dataset

# Output: dist-dataset/atlas-declaracoes.{jsonl,csv} + SCHEMA.md

\`\`\`

## Diretórios

| Path              | Versionado?           | Propósito                                                   |
| ----------------- | --------------------- | ----------------------------------------------------------- |
| \`.cache/\`       | Não (.gitignore)      | Artefatos intermediários (áudios, transcripts, screenshots) |
| \`data/\`         | Sim                   | Fonte da verdade (markdown + YAML)                          |
| \`public/og/\`    | Não (.gitignore)      | Gerado por \`generate:og\` em cada build                    |
| \`dist-dataset/\` | Não (.gitignore)      | Anexado a GitHub Releases manualmente                       |
| \`assets/fonts/\` | Sim (binários ~200KB) | Fonts Geist para Satori OG generation                       |

## Princípios

1. **Toda declaração tem fonte primária ou não existe.** Pelo menos um dos:
   YouTube oficial, TSE, Câmara/Senado, mídia consolidada com vídeo embedado,
   rede social oficial verificada.
2. **Wayback é obrigatório** (\`pnpm archive\`) em cada item antes de criar
   a declaração no \`data/\`.
3. **Transcrição é sempre revisada humanamente.** Whisper produz baseline,
   operador edita.
4. **AI não gera conteúdo editorial.** Whisper para transcrição,
   sugestões manuais de \`tipo_estrutural\`. Sem AI escrevendo contexto.
5. **Trabalho assíncrono.** 24-48h após evento. Não fazemos cobertura ao vivo.

## Limitações conhecidas

- **yt-dlp**: alguns sites bloqueiam scraping. Wayback é fallback.
- **Whisper API**: erros frequentes em áudio de baixa qualidade ou ruído alto.
  Revisar transcript SEMPRE antes de citar.
- **Firecrawl**: free tier tem rate limit. Plano gratuito serve para MVP (<500 scrapes/mês).
- **Wayback Save Page Now**: 30-90s para criar snapshot. Alguns sites
  bloqueiam (X, FB). Para esses, snapshot interno via screenshot do Firecrawl.

## Custo operacional estimado

| Item                | Custo estimado MVP (~60 declarações) |
| ------------------- | ------------------------------------ |
| OpenAI Whisper API  | R\$ 30/mês (~900 min de áudio)       |
| Firecrawl free tier | R\$ 0 (até 500 scrapes/mês)          |
| Wayback Machine     | R\$ 0 (gratuito)                     |
| GitHub repo público | R\$ 0                                |
| **Total**           | **R\$ 30/mês**                       |

Baseline coerente com seção 6.2 do spec (\`docs/superpowers/specs/2026-05-27-atlas-design.md\`).
```

- [ ] **Step 2: Verificar markdown válido (sem build)**

Run:

```bash
pnpm format:check scripts/README.md
```

Expected: arquivo OK.

- [ ] **Step 3: Commit**

```bash
git add scripts/README.md
git commit -m "docs(scripts): manual do operador do pipeline de ingestão

Documenta workflow end-to-end para os 3 níveis de fontes
(YouTube oficial, mídia consolidada, redes sociais).

Inclui:
- Pré-requisitos (env vars, deps)
- Comandos sequenciais por nível de esforço
- Tabela de diretórios versionados vs gitignored
- Princípios editoriais (Wayback obrigatório, AI só transcreve, etc)
- Limitações conhecidas + custo MVP

Aderência à seção 7 do spec (Pipeline de Ingestão · 3 níveis)."
```

---

### Task 14: Validação final + handoff para Plan 3

**Files:** (verificação apenas)

- [ ] **Step 1: Clean rebuild — baseline limpo**

Run:

```bash
rm -rf node_modules .astro dist .vite .cache dist-dataset public/og
pnpm install --frozen-lockfile
pnpm astro sync
```

Expected: install + sync sem erros.

- [ ] **Step 2: Full pipeline check**

Run:

```bash
pnpm format:check && pnpm lint && pnpm typecheck && pnpm test
```

Expected:

- Format: tudo OK
- Lint: zero errors
- Typecheck: zero errors, zero hints
- Tests: ~50 passed (18 Plan 1 + 32 Sprint 3 lib+scripts) — número exato pode variar conforme Task 3

- [ ] **Step 3: Schemas reproduzíveis**

Run:

```bash
pnpm generate-schemas
git diff data/schemas/
```

Expected: zero diff.

- [ ] **Step 4: Validate data**

Run:

```bash
pnpm validate-data
```

Expected: 6 temas validados, exit 0.

- [ ] **Step 5: Build produção**

Run:

```bash
pnpm build
```

Expected: build concluído, `dist/` populado.

- [ ] **Step 6: Verificar smoke runs dos scripts (sem rede)**

Run em sequência:

```bash
pnpm scrape:youtube
pnpm transcribe
pnpm archive
pnpm scrape:url
pnpm generate:og
pnpm export:dataset
```

Expected para cada um: mensagem de uso (sem args) ou warning de "nada a gerar" (com dados vazios), exit code apropriado. Nenhum crash inesperado.

- [ ] **Step 7: Atualizar memória de checkpoint**

Editar `C:\Users\dezob\.claude\projects\C--Users-dezob-Projects-atlas\memory\checkpoint-fase1-completa.md`:

- Renomear arquivo para `checkpoint-fase2-completa.md` (rename file)
- Atualizar conteúdo para refletir estado pós-Plan 2:
  - Sprint 2.5 concluído (path aliases simplificados, Zod 4 migrado, site URL, Vitest spike documentado)
  - Sprint 3 concluído (6 scripts + README)
  - Próximo: Plan 3 (Sprint 4 — SEO + Páginas + JSON-LD)

Editar `MEMORY.md` para apontar para o novo checkpoint.

- [ ] **Step 8: Atualizar memória de bugs**

Editar `bugs-do-plano-fase1.md`:

- Marcar Bug 5 como resolvido (se Task 3 conseguiu) ou como "investigado e documentado" (se não)
- Marcar tech debt Zod 4 hints como resolvido
- Marcar Bug 1 e 9 (path aliases) como mitigated by simplification

- [ ] **Step 9: Marcar PR como ready**

Run:

```bash
gh pr ready
gh pr view
```

Expected: PR muda de draft para ready, URL retornada.

- [ ] **Step 10: Aguardar CI passar**

Run:

```bash
gh pr checks --watch
```

Expected: todos os checks verdes (lint, typecheck, test, build, validate-data).

> Se CI falhar: investigar diff entre ambiente local Windows e CI Ubuntu. Lição do Plan 1: `astro sync` em CI antes de lint é obrigatório (já no workflow).

- [ ] **Step 11: Merge via squash**

Run:

```bash
gh pr merge --squash --delete-branch
```

Expected: PR mergeado em main, branch deletada local + remote.

- [ ] **Step 12: Pull main local**

Run:

```bash
git checkout main
git pull origin main
git log --oneline -1
```

Expected: HEAD em main com squash commit do PR.

---

## Self-Review Checklist

### 1. Cobertura de spec

| Item do spec                       | Task que cobre                                   |
| ---------------------------------- | ------------------------------------------------ |
| §6.3 scripts/scrape-youtube.ts     | Task 7                                           |
| §6.3 scripts/transcribe.ts         | Task 8                                           |
| §6.3 scripts/archive.ts            | Task 9                                           |
| §6.3 scripts/scrape-url.ts         | Task 10                                          |
| §6.3 scripts/generate-og-images.ts | Task 11                                          |
| §6.3 scripts/validate-data.ts (CI) | Já existia (Plan 1) — referenciado no smoke test |
| §7 Pipeline 3 níveis               | scripts/README.md (Task 13)                      |
| §7.1 AI só transcreve              | README + transcribe.ts (sem fallback de geração) |
| §7.1 Wayback obrigatório           | archive.ts (Task 9) + README                     |
| §10.2 dataset paralelo JSONL+CSV   | export-dataset.ts (Task 12)                      |

**Itens deferidos para Plan 3** (já planejados, fora deste plano):

- JSON-LD components (Person/Quotation/Event/Article/Dataset)
- @astrojs/sitemap + customização
- robots.txt
- Pagefind
- SEOTags component
- Páginas /candidatos, /declaracoes/[id], etc.
- DeclaracaoFull/Card, CandidatoCard/Header, etc.

### 2. Sem placeholders

Revisado: nenhuma ocorrência de "TBD", "TODO", "implement later", "add validation", "handle edge cases". Cada step tem código completo ou comando exato.

### 3. Consistência de tipos

- `FlatDeclaracao` (Task 12) consistente com Schema do Plan 1 (`src/content/config.ts`)
- `WhisperSegment` (Task 8) consistente com fixture `tests/fixtures/whisper-response.json`
- `hashUrl` (Task 9 archive.ts) reutilizado em Task 10 scrape-url.ts
- Constantes de path (`CACHE_DIR`, `OG_DIR`, `DATASET_DIR`) consistentes entre Task 5 (definição) e Tasks 7-12 (uso)

### 4. Lições do Plan 1 aplicadas

- ✅ Bug 1 (alias drift): Task 1 elimina aliases extras
- ✅ Bug 5 (Vitest+astro:content): Task 3 spike time-boxed
- ✅ Bug 9 (vitest aliases): Task 1 simplifica + smoke test (Task 4) valida
- ✅ Bug 11 (zod-to-json-schema): mantemos `z.toJSONSchema` nativo (já feito Plan 1)
- ✅ Padrão geral (smoke test inicial): Task 4 antes de Sprint 3, Task 14 antes de merge
- ✅ Context7 obrigatório: cada lib externa documentada com Context7 ID

---

## Pós-Plan 2

Quando Plan 2 mergear, o estado do projeto será:

- Path aliases simplificados (`@/*` único)
- Zod 4 sintaxe moderna (zero hints)
- Site URL: `https://atlas-2026.pages.dev`
- 6 scripts CLI funcionais em `scripts/`
- ~50 tests passing (~2x mais que Plan 1)
- Manual do operador completo
- Pipeline pronto para receber a primeira declaração real

**Próximo:** invocar `superpowers:writing-plans` para Plan 3 (Sprint 4 — SEO + Páginas + JSON-LD), que vai consumir tanto os dados criados via pipeline quanto as OG images geradas por `generate:og`.

Plan 3 escopo planejado:

- Componentes JSON-LD (Person, Quotation, Event, Article, Dataset)
- @astrojs/sitemap (Context7 já valido durante writing-plans do Plan 3)
- robots.txt permissivo
- Pagefind client-side search
- SEOTags meta component (title, description, OG, Twitter Cards)
- Páginas: /candidatos, /candidatos/[slug], /declaracoes/[id], /eventos, /eventos/[id], /temas, /temas/[slug], /buscar, /dataset
- Componentes: DeclaracaoFull, DeclaracaoCard, VereditosExternos, ContextoAdicional, CandidatoCard, CandidatoHeader, CandidatoTimeline, TimelineEvento
