# Atlas — Fase 3 (Sprint 4): SEO + Páginas + JSON-LD — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Entregar a camada SEO-first do Atlas — structured data JSON-LD (Schema.org/Person, Quotation, Event, Article, Dataset), sitemap, robots, busca client-side (Pagefind) e todas as páginas e componentes pendentes do roadmap para que o site fique pronto para o conteúdo MVP da Sprint 5.

**Architecture:** Construímos primeiro a infraestrutura SEO (Sprint 4.1: helpers tipados de schema-dts + componentes Astro JSON-LD + SEOTags). Depois ligamos a infra de descoberta (Sprint 4.2: `@astrojs/sitemap`, `robots.txt`, Pagefind via build hook + UI oficial). Por fim renderizamos as 9 rotas e 8 componentes compartilhados (Sprint 4.3) que consomem essas peças. Cada peça é testada isoladamente quando é uma função pura; páginas `.astro` são validadas via `astro build` + grep no HTML resultante.

**Tech Stack:** Astro 5.18 (static output, ClientRouter, Content Collections) · React 19 islands · Tailwind v4 · `@astrojs/sitemap` · `pagefind` + `@pagefind/default-ui` · `schema-dts` · TypeScript estrito · Vitest 2 · ESLint 9 (max-warnings 0) · Conventional Commits PT-BR.

---

## Pré-condições e contexto operacional

Antes de iniciar qualquer task, o engenheiro DEVE estar ciente destas constraints permanentes herdadas das Fases 1 e 2:

1. **`src/content/config.ts` mantém sintaxe Zod 3** (`.url()`, `.datetime()`). O `astro:content` re-exporta Zod 3 internamente (Astro 5 depende de `zod@^3.25`). NÃO migrar.
2. **Scripts standalone podem usar Zod 4 nativo** (`z.url()`, `z.iso.datetime()`) — apenas arquivos que importam `zod` diretamente, não via `astro:content`.
3. **Todo script CLI** deve usar `pathToFileURL(process.argv[1] ?? "").href` para `isMain` check (Windows correctness).
4. **`astro:content` em testes Vitest** é resolvido via alias em `vitest.config.ts` → `tests/__mocks__/astro-content.ts`. Já configurado. Não tocar.
5. **`.gitattributes` já força `eol=lf`** em todos os arquivos de texto. Não tocar.
6. **CI Ubuntu vs Windows local** — sempre rodar `pnpm format:check && pnpm lint && pnpm typecheck && pnpm test && pnpm build` localmente antes de push para evitar drift que só aparece em Ubuntu.
7. **Conventional Commits em PT-BR** — `feat(escopo): mensagem`, `fix(escopo): mensagem`, `test(escopo): mensagem`, `chore(escopo): mensagem`, `docs(escopo): mensagem`, `refactor(escopo): mensagem`. Sem emojis em commits.
8. **Idioma do projeto: português brasileiro** com acentos preservados — `não`, `declaração`, `histórico`, `imposição` (jamais `nao`, `declaracao`).
9. **Path alias**: apenas `@/*` resolvendo `src/*`. Configurado em `tsconfig.json`, `astro.config.mjs` e `vitest.config.ts`. Não criar novos aliases.
10. **`pnpm` é obrigatório**: versão local v10, CI v9; lockfile compatível com ambos via `--frozen-lockfile` no CI.

### Estado do repositório antes do Plan 3

- Branch atual: `main` em commit `39bd315` (squash merge do PR #2)
- 70 testes Vitest passando
- 0 lint warnings (`pnpm lint --max-warnings=0`)
- 0 typecheck hints (`pnpm typecheck`)
- 2 páginas estáticas (`/index.astro`, `/404.astro`)
- 6 fixtures de tema em `data/temas/`
- **0 fixtures de candidato** (`data/candidatos/` não existe ainda)
- **0 fixtures de declaração** (`data/declaracoes/` está vazia)
- **0 fixtures de evento** (`data/eventos/` não existe ainda)
- Issues em aberto: #3, #4, #5, #6 — todas com label `good first issue`. **FORA do escopo deste plano** (PRs dedicados depois).

### Decisões travadas pelo André antes do plan

| #   | Decisão                                            | Justificativa registrada                                                                     |
| --- | -------------------------------------------------- | -------------------------------------------------------------------------------------------- |
| 1   | Sitemap: `@astrojs/sitemap` (oficial)              | Zero código manual; suporta `serialize/filter/customPages` (Context7: `/withastro/docs`)     |
| 2   | Pagefind UI: `@pagefind/default-ui` (oficial)      | Web component plug-and-play; acessível por padrão; alinha com postura tecnicista neutra      |
| 3   | JSON-LD: componentes Astro `<JSONLDPerson />` etc. | Re-uso por página, tipo-safe via `schema-dts` (Context7: `/google/schema-dts`)               |
| 4   | Issues #3, #4, #5, #6: PRs dedicados depois        | Fora do escopo deste plano — declarações reais ainda não existem; fixes não bloqueiam Plan 3 |
| 5   | Domínio: manter `atlas-2026.pages.dev`             | Migração para domínio próprio = find/replace em `astro.config.mjs` no futuro                 |

---

## File Structure

### Novos diretórios

```
src/lib/seo/                     ← funções puras tipadas que constroem JSON-LD via schema-dts
src/components/seo/              ← componentes Astro finos que renderizam <script type="application/ld+json">
src/components/declaracao/       ← componentes específicos da página-chave SEO
src/components/candidato/        ← header + cards + timeline do candidato
src/components/search/           ← wrapper Astro para <pagefind-ui>
src/pages/candidatos/            ← rotas /candidatos e /candidatos/[slug]
src/pages/declaracoes/           ← rota /declaracoes/[id]
src/pages/eventos/               ← rotas /eventos e /eventos/[id]
src/pages/temas/                 ← rotas /temas e /temas/[slug]
tests/unit/seo/                  ← testes unitários das funções puras de schema
tests/unit/lib/data/             ← (já existe) — não alterar
data/candidatos/                 ← fixtures YAML de candidato (criado em Sprint 4.3)
data/eventos/                    ← fixtures YAML de evento (criado em Sprint 4.3)
data/declaracoes/                ← (já existe vazio) — adicionar fixtures md em Sprint 4.3
```

### Arquivos novos (criar)

```
src/lib/seo/safe-json-ld.ts                    Helper: escape HTML-safe para <script type="application/ld+json">
src/lib/seo/build-person.ts                    buildPersonSchema(candidato, siteUrl) → WithContext<Person>
src/lib/seo/build-quotation.ts                 buildQuotationSchema(decl, candidato, siteUrl) → WithContext<Quotation>
src/lib/seo/build-event.ts                     buildEventSchema(evento, candidatos, siteUrl) → WithContext<Event>
src/lib/seo/build-article.ts                   buildArticleSchema(decl, candidato, siteUrl) → WithContext<Article>
src/lib/seo/build-dataset.ts                   buildDatasetSchema(version, downloads, siteUrl) → WithContext<Dataset>

src/components/seo/SEOTags.astro               Meta tags Open Graph + Twitter Cards + article:published_time
src/components/seo/JSONLDPerson.astro          <script type="application/ld+json">{Person}</script>
src/components/seo/JSONLDQuotation.astro       idem Quotation
src/components/seo/JSONLDEvent.astro           idem Event
src/components/seo/JSONLDArticle.astro         idem Article
src/components/seo/JSONLDDataset.astro         idem Dataset

src/components/search/PagefindSearch.astro     Web component wrapper carrega assets oficiais Pagefind

src/components/declaracao/DeclaracaoFull.astro    Bloco de citação + meta + fonte primária + archive
src/components/declaracao/DeclaracaoCard.astro    Cartão de declaração em listas
src/components/declaracao/VereditosExternos.astro Lista vereditos_externos[] com badge por veiculo
src/components/declaracao/ContextoAdicional.astro Bloco opcional contexto_adicional do schema

src/components/candidato/CandidatoCard.astro      Cartão em /candidatos
src/components/candidato/CandidatoHeader.astro    Topo de /candidatos/[slug]
src/components/candidato/CandidatoTimeline.astro  Timeline de eventos + declarações por data
src/components/candidato/TimelineEvento.astro     Item da timeline

src/pages/candidatos/index.astro                  Lista de candidatos
src/pages/candidatos/[slug].astro                 Perfil do candidato (consome /candidato/[slug] do schema)
src/pages/declaracoes/[id].astro                  PÁGINA-CHAVE SEO — Quotation + Claim + Vereditos + Contexto
src/pages/eventos/index.astro                     Lista de eventos
src/pages/eventos/[id].astro                      Evento + declarações dele
src/pages/temas/index.astro                       Lista de temas
src/pages/temas/[slug].astro                      Tema + declarações com esse tema
src/pages/buscar.astro                            Monta <PagefindSearch />
src/pages/dataset.astro                           Descritivo + downloads JSONL/CSV + JSON-LD Dataset

public/robots.txt                                 Permissivo (inclusive AI bots) + Sitemap reference

data/candidatos/candidato-a.yaml                  Fixture candidato fictício A
data/candidatos/candidato-b.yaml                  Fixture candidato fictício B
data/eventos/2026-04-15-debate-rede-tv.yaml       Fixture evento debate
data/declaracoes/2026-04-15-candidato-a-economia-imposto.md   Fixture declaração 1
data/declaracoes/2026-04-15-candidato-b-saude-sus.md          Fixture declaração 2

tests/unit/seo/safe-json-ld.test.ts
tests/unit/seo/build-person.test.ts
tests/unit/seo/build-quotation.test.ts
tests/unit/seo/build-event.test.ts
tests/unit/seo/build-article.test.ts
tests/unit/seo/build-dataset.test.ts
```

### Arquivos a modificar

```
package.json                            +deps (schema-dts, @astrojs/sitemap, pagefind, @pagefind/default-ui)
                                        +scripts (pagefind, build:full, build:index)
astro.config.mjs                        +integration sitemap({ filter, serialize })
src/components/layout/BaseLayout.astro  + <slot name="head" /> + props ogImage/ogType (opcionais)
.github/workflows/ci.yml                + step "pnpm pagefind" entre build e validate
.gitignore                              +.pagefind/, pagefind temporários
```

### Componentes/arquivos NÃO criados nesta fase (deferred)

- `/metodologia`, `/sobre`, `/contribuir` — Sprint 5 (Conteúdo MVP) e Sprint 6 (Polimento)
- `JSONLDClaim` separado — já embutido em Quotation via `Quotation.spokenByCharacter` + propriedade composta
- Extensão browser, crowdfunding, engajamento — V2 (registrado em [[roadmap-v2-atlas]])
- Fixes das issues #3-#6 — PRs dedicados

---

## Workflow gerencial

### Checkpoints e pausas

- **Pausa após Sprint 4.1** (Tasks 1–8) — reportar status para o André antes de prosseguir. Lição da Fase 2.
- **Pausa após Sprint 4.2** (Tasks 9–12) — reportar status; arquivos novos de configuração precisam de revisão humana antes de virar dependência de Sprint 4.3.
- **Smoke test global** entre Sprints (lição reforçada da Fase 2: configs antes de features).

### Branch e merge

- **Branch:** `feat/fase3-seo-paginas` (criada em Task 0 via `superpowers:using-git-worktrees`).
- **Estratégia:** worktree isolada em `../atlas-fase3/` (ou similar) para não interferir com `main`.
- **Merge:** Squash merge no PR final, mensagem `feat(fase3): SEO + páginas + JSON-LD (#PR)`.
- **Branch deletada após merge** — local e remote.

### TDD obrigatório por task

Cada Task de função pura segue:

1. Write the failing test
2. Run test — expected: FAIL
3. Write minimal implementation
4. Run test — expected: PASS
5. Run lint + typecheck — expected: clean
6. Commit (Conventional Commits PT-BR)

Componentes `.astro` (sem framework de teste para Astro components diretamente) seguem:

1. Write a small smoke test (verifica imports + tipagem das props)
2. Implement component
3. Run `pnpm build` para confirmar que o componente compila
4. `grep` o HTML resultante em `dist/` para confirmar elementos esperados
5. Commit

---

## Task 0: Criar branch de trabalho via worktree

**Files:**

- N/A (apenas git)

- [ ] **Step 1: Garantir que `main` está limpo e atualizado**

Run:

```bash
git checkout main
git pull origin main
git status --short
```

Expected: `git status --short` retorna vazio. `git log --oneline -1` mostra `39bd315`.

- [ ] **Step 2: Invocar superpowers:using-git-worktrees**

Invocar a sub-skill `superpowers:using-git-worktrees` com argumento:

```
Criar worktree em ../atlas-fase3 para a branch feat/fase3-seo-paginas baseada em main.
Repo principal: C:\Users\dezob\Projects\atlas
```

A skill cria a worktree, faz `cd` e confirma branch + estado.

- [ ] **Step 3: Verificar worktree**

Run:

```bash
git worktree list
git branch --show-current
git status --short
```

Expected:

- `git worktree list` lista a nova worktree em `../atlas-fase3`
- `git branch --show-current` retorna `feat/fase3-seo-paginas`
- `git status --short` retorna vazio

- [ ] **Step 4: Instalar deps na worktree**

Run:

```bash
pnpm install --frozen-lockfile
pnpm test
```

Expected: install verde, 70 tests pass.

---

# SPRINT 4.1 — SEO Foundation (Tasks 1–8)

Objetivo: helpers tipados, 5 componentes JSON-LD, SEOTags, BaseLayout estendido. Após esta sprint o André valida que a infraestrutura SEO está pronta antes de Sprint 4.2.

---

## Task 1: Instalar schema-dts + criar helper `safe-json-ld.ts`

**Por que primeiro:** o helper é usado por todos os 5 componentes JSON-LD. Establece o padrão de escape para evitar XSS quando JSON-LD entra no HTML.

**Context7 (já validado):**

- Library ID: `/google/schema-dts`
- Padrão canônico: `WithContext<T>` + função `JsonLd<T>(json)` que escapa `< > & '`. Fonte: `https://github.com/google/schema-dts/blob/main/packages/schema-dts/README.md`.

**Files:**

- Modify: `package.json`
- Create: `src/lib/seo/safe-json-ld.ts`
- Create: `tests/unit/seo/safe-json-ld.test.ts`

- [ ] **Step 1: Adicionar schema-dts como dep**

Run:

```bash
pnpm add schema-dts@^1.1.5
```

Expected: `schema-dts` adicionado em `dependencies` do `package.json`, lockfile atualizado.

Verificar:

```bash
grep '"schema-dts"' package.json
```

Expected: `    "schema-dts": "^1.1.5",`

- [ ] **Step 2: Escrever teste do helper de escape**

Create `tests/unit/seo/safe-json-ld.test.ts`:

```typescript
import { describe, it, expect } from "vitest";
import type { Person, WithContext } from "schema-dts";
import { safeJsonLd } from "@/lib/seo/safe-json-ld";

describe("safeJsonLd", () => {
  it("serializa um objeto Schema.org Person com @context", () => {
    const person: WithContext<Person> = {
      "@context": "https://schema.org",
      "@type": "Person",
      name: "Candidato A",
    };
    const output = safeJsonLd(person);
    expect(output).toContain('"@context":"https://schema.org"');
    expect(output).toContain('"@type":"Person"');
    expect(output).toContain('"name":"Candidato A"');
  });

  it("escapa < para impedir fechamento prematuro de <script>", () => {
    const person: WithContext<Person> = {
      "@context": "https://schema.org",
      "@type": "Person",
      name: "</script><img src=x onerror=alert(1)>",
    };
    const output = safeJsonLd(person);
    expect(output).not.toContain("</script>");
    expect(output).toContain("\\u003C/script\\u003E");
  });

  it("escapa > & ' para injeção HTML segura", () => {
    const person: WithContext<Person> = {
      "@context": "https://schema.org",
      "@type": "Person",
      name: "A > B & C 'quoted'",
    };
    const output = safeJsonLd(person);
    expect(output).not.toContain(">");
    expect(output).not.toContain("&");
    expect(output).not.toContain("'");
    expect(output).toContain("\\u003E");
    expect(output).toContain("\\u0026");
    expect(output).toContain("\\u0027");
  });

  it("preserva caracteres unicode portugueses normalmente", () => {
    const person: WithContext<Person> = {
      "@context": "https://schema.org",
      "@type": "Person",
      name: "João Não-Açúcar",
    };
    const output = safeJsonLd(person);
    expect(output).toContain("João Não-Açúcar");
  });
});
```

- [ ] **Step 3: Rodar teste — deve FALHAR**

Run:

```bash
pnpm test -- tests/unit/seo/safe-json-ld.test.ts
```

Expected: FAIL com "Cannot find module '@/lib/seo/safe-json-ld'".

- [ ] **Step 4: Implementar `safe-json-ld.ts`**

Create `src/lib/seo/safe-json-ld.ts`:

```typescript
import type { Thing, WithContext } from "schema-dts";

/**
 * Serializa um objeto JSON-LD para inclusão segura em <script type="application/ld+json">.
 *
 * Escapa caracteres que poderiam fechar a tag <script> prematuramente ou
 * permitir injeção de HTML: <, >, &, '.
 *
 * Padrão recomendado por schema-dts (fonte: Context7 /google/schema-dts).
 */
export function safeJsonLd<T extends Thing>(data: WithContext<T>): string {
  return JSON.stringify(data)
    .replace(/</g, "\\u003C")
    .replace(/>/g, "\\u003E")
    .replace(/&/g, "\\u0026")
    .replace(/'/g, "\\u0027");
}
```

- [ ] **Step 5: Rodar teste — deve PASSAR**

Run:

```bash
pnpm test -- tests/unit/seo/safe-json-ld.test.ts
```

Expected: 4 tests pass.

- [ ] **Step 6: Lint + typecheck**

Run:

```bash
pnpm lint
pnpm typecheck
```

Expected: 0 warnings em ambos.

- [ ] **Step 7: Commit**

```bash
git add package.json pnpm-lock.yaml src/lib/seo/safe-json-ld.ts tests/unit/seo/safe-json-ld.test.ts
git commit -m "feat(seo): adicionar schema-dts e helper safeJsonLd"
```

---

## Task 2: `build-person.ts` + componente `JSONLDPerson.astro`

**Por que:** schema mais simples (Person). Estabelece o padrão build-function + componente que será replicado nas próximas 4 tasks.

**Files:**

- Create: `src/lib/seo/build-person.ts`
- Create: `src/components/seo/JSONLDPerson.astro`
- Create: `tests/unit/seo/build-person.test.ts`

- [ ] **Step 1: Escrever teste de buildPersonSchema**

Create `tests/unit/seo/build-person.test.ts`:

```typescript
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
    const schema = buildPersonSchema(fakeCandidato, "https://atlas-2026.pages.dev");
    expect(schema["@context"]).toBe("https://schema.org");
    expect(schema["@type"]).toBe("Person");
    expect(schema.name).toBe("Candidato A");
  });

  it("inclui url canônica do candidato no site", () => {
    const schema = buildPersonSchema(fakeCandidato, "https://atlas-2026.pages.dev");
    expect(schema.url).toBe("https://atlas-2026.pages.dev/candidatos/candidato-a");
  });

  it("inclui memberOf com partido", () => {
    const schema = buildPersonSchema(fakeCandidato, "https://atlas-2026.pages.dev");
    expect(schema.memberOf).toEqual({
      "@type": "PoliticalParty",
      name: "Partido Demo",
    });
  });

  it("inclui sameAs com contas oficiais verificadas", () => {
    const schema = buildPersonSchema(fakeCandidato, "https://atlas-2026.pages.dev");
    expect(schema.sameAs).toEqual(["https://x.com/candidatoa"]);
  });

  it("omite sameAs quando não há contas verificadas", () => {
    const candidatoSemContas: Candidato = {
      ...fakeCandidato,
      data: { ...fakeCandidato.data, contas_oficiais: [] },
    } as Candidato;
    const schema = buildPersonSchema(candidatoSemContas, "https://atlas-2026.pages.dev");
    expect(schema.sameAs).toBeUndefined();
  });

  it("inclui image quando foto_url existe", () => {
    const schema = buildPersonSchema(fakeCandidato, "https://atlas-2026.pages.dev");
    expect(schema.image).toBe("https://exemplo.com/foto.jpg");
  });
});
```

- [ ] **Step 2: Rodar teste — deve FALHAR**

Run:

```bash
pnpm test -- tests/unit/seo/build-person.test.ts
```

Expected: FAIL com "Cannot find module '@/lib/seo/build-person'".

- [ ] **Step 3: Implementar `build-person.ts`**

Create `src/lib/seo/build-person.ts`:

```typescript
import type { Person, WithContext } from "schema-dts";
import type { Candidato } from "@/types";

/**
 * Constrói o JSON-LD Schema.org/Person para um candidato.
 *
 * Inclui apenas contas oficiais verificadas em `sameAs` (sinal de confiança
 * para crawlers). Inclui `memberOf` como PoliticalParty quando partido existe.
 *
 * Fonte do tipo: schema-dts (Context7 /google/schema-dts).
 */
export function buildPersonSchema(candidato: Candidato, siteUrl: string): WithContext<Person> {
  const { data } = candidato;
  const sameAs = data.contas_oficiais.filter((c) => c.verificada).map((c) => c.url);

  const schema: WithContext<Person> = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: data.nome,
    url: `${siteUrl}/candidatos/${data.slug}`,
    description: data.biografia_minima,
    memberOf: {
      "@type": "PoliticalParty",
      name: data.partido,
    },
  };

  if (data.foto_url) {
    schema.image = data.foto_url;
  }
  if (sameAs.length > 0) {
    schema.sameAs = sameAs;
  }

  return schema;
}
```

- [ ] **Step 4: Rodar teste — deve PASSAR**

Run:

```bash
pnpm test -- tests/unit/seo/build-person.test.ts
```

Expected: 6 tests pass.

- [ ] **Step 5: Criar componente JSONLDPerson.astro**

Create `src/components/seo/JSONLDPerson.astro`:

```astro
---
import type { Candidato } from "@/types";
import { buildPersonSchema } from "@/lib/seo/build-person";
import { safeJsonLd } from "@/lib/seo/safe-json-ld";

interface Props {
  candidato: Candidato;
}

const { candidato } = Astro.props;
const siteUrl = Astro.site?.toString().replace(/\/$/, "") ?? "https://atlas-2026.pages.dev";
const schema = buildPersonSchema(candidato, siteUrl);
const json = safeJsonLd(schema);
---

<script type="application/ld+json" is:inline set:html={json} />
```

- [ ] **Step 6: Lint + typecheck**

Run:

```bash
pnpm lint
pnpm typecheck
```

Expected: 0 warnings.

- [ ] **Step 7: Commit**

```bash
git add src/lib/seo/build-person.ts src/components/seo/JSONLDPerson.astro tests/unit/seo/build-person.test.ts
git commit -m "feat(seo): adicionar buildPersonSchema e componente JSONLDPerson"
```

---

## Task 3: `build-quotation.ts` + componente `JSONLDQuotation.astro`

**Por que:** Quotation é o schema mais importante do projeto — cada declaração é uma Quotation com `spokenByCharacter` (Person) e `citation` (URL primária). Esse é o componente que vai dar visibilidade SEO mais alta.

**Files:**

- Create: `src/lib/seo/build-quotation.ts`
- Create: `src/components/seo/JSONLDQuotation.astro`
- Create: `tests/unit/seo/build-quotation.test.ts`

- [ ] **Step 1: Escrever teste de buildQuotationSchema**

Create `tests/unit/seo/build-quotation.test.ts`:

```typescript
import { describe, it, expect } from "vitest";
import { buildQuotationSchema } from "@/lib/seo/build-quotation";
import type { Candidato, Declaracao } from "@/types";

const fakeCandidato: Candidato = {
  id: "candidato-a",
  slug: "candidato-a",
  collection: "candidatos",
  data: {
    id: "candidato-a",
    slug: "candidato-a",
    nome: "Candidato A",
    partido: "Partido Demo",
    biografia_minima: "Biografia mínima.",
    contas_oficiais: [],
    criado_em: "2026-01-01T00:00:00Z",
    atualizado_em: "2026-04-01T00:00:00Z",
  },
} as Candidato;

const fakeDeclaracao: Declaracao = {
  id: "2026-04-15-candidato-a-economia-imposto",
  slug: "2026-04-15-candidato-a-economia-imposto",
  collection: "declaracoes",
  data: {
    id: "2026-04-15-candidato-a-economia-imposto",
    slug: "2026-04-15-candidato-a-economia-imposto",
    candidato_id: "candidato-a",
    evento_id: "2026-04-15-debate-rede-tv",
    texto: "Vou reduzir o imposto de renda em 30% no primeiro ano.",
    timestamp_no_evento: "00:23:15",
    contexto: "Resposta sobre política fiscal durante o debate.",
    tema_principal: "economia",
    temas_secundarios: [],
    tipo_estrutural: ["promessa", "dado_numerico"],
    fonte_primaria_url: "https://youtube.com/watch?v=abc123",
    fonte_primaria_tipo: "youtube_oficial",
    archive_url: "https://web.archive.org/web/2026/https://youtube.com/watch?v=abc123",
    snapshot_interno_path: null,
    contexto_adicional: null,
    vereditos_externos: [],
    versao: 1,
    criado_em: "2026-04-15T00:00:00Z",
    atualizado_em: "2026-04-15T00:00:00Z",
  },
} as Declaracao;

describe("buildQuotationSchema", () => {
  it("retorna Quotation com @context e @type", () => {
    const schema = buildQuotationSchema(
      fakeDeclaracao,
      fakeCandidato,
      "https://atlas-2026.pages.dev",
    );
    expect(schema["@context"]).toBe("https://schema.org");
    expect(schema["@type"]).toBe("Quotation");
  });

  it("usa o texto da declaração como text", () => {
    const schema = buildQuotationSchema(
      fakeDeclaracao,
      fakeCandidato,
      "https://atlas-2026.pages.dev",
    );
    expect(schema.text).toBe("Vou reduzir o imposto de renda em 30% no primeiro ano.");
  });

  it("inclui spokenByCharacter referenciando o candidato", () => {
    const schema = buildQuotationSchema(
      fakeDeclaracao,
      fakeCandidato,
      "https://atlas-2026.pages.dev",
    );
    expect(schema.spokenByCharacter).toEqual({
      "@type": "Person",
      name: "Candidato A",
      url: "https://atlas-2026.pages.dev/candidatos/candidato-a",
    });
  });

  it("inclui citation com URL da fonte primária", () => {
    const schema = buildQuotationSchema(
      fakeDeclaracao,
      fakeCandidato,
      "https://atlas-2026.pages.dev",
    );
    expect(schema.citation).toBe("https://youtube.com/watch?v=abc123");
  });

  it("inclui url canônica da declaração no site", () => {
    const schema = buildQuotationSchema(
      fakeDeclaracao,
      fakeCandidato,
      "https://atlas-2026.pages.dev",
    );
    expect(schema.url).toBe(
      "https://atlas-2026.pages.dev/declaracoes/2026-04-15-candidato-a-economia-imposto",
    );
  });

  it("inclui dateCreated com criado_em", () => {
    const schema = buildQuotationSchema(
      fakeDeclaracao,
      fakeCandidato,
      "https://atlas-2026.pages.dev",
    );
    expect(schema.dateCreated).toBe("2026-04-15T00:00:00Z");
  });
});
```

- [ ] **Step 2: Rodar teste — deve FALHAR**

Run:

```bash
pnpm test -- tests/unit/seo/build-quotation.test.ts
```

Expected: FAIL com "Cannot find module '@/lib/seo/build-quotation'".

- [ ] **Step 3: Implementar `build-quotation.ts`**

Create `src/lib/seo/build-quotation.ts`:

```typescript
import type { Quotation, WithContext } from "schema-dts";
import type { Candidato, Declaracao } from "@/types";

/**
 * Constrói o JSON-LD Schema.org/Quotation para uma declaração.
 *
 * Inclui:
 * - text: o texto exato da declaração
 * - spokenByCharacter: Person inline referenciando o candidato (sem alias completo)
 * - citation: URL da fonte primária
 * - url: URL canônica da página da declaração no Atlas
 *
 * Schema.org/Quotation: https://schema.org/Quotation
 */
export function buildQuotationSchema(
  declaracao: Declaracao,
  candidato: Candidato,
  siteUrl: string,
): WithContext<Quotation> {
  return {
    "@context": "https://schema.org",
    "@type": "Quotation",
    text: declaracao.data.texto,
    spokenByCharacter: {
      "@type": "Person",
      name: candidato.data.nome,
      url: `${siteUrl}/candidatos/${candidato.data.slug}`,
    },
    citation: declaracao.data.fonte_primaria_url,
    url: `${siteUrl}/declaracoes/${declaracao.data.id}`,
    dateCreated: declaracao.data.criado_em,
  };
}
```

- [ ] **Step 4: Rodar teste — deve PASSAR**

Run:

```bash
pnpm test -- tests/unit/seo/build-quotation.test.ts
```

Expected: 6 tests pass.

- [ ] **Step 5: Criar componente JSONLDQuotation.astro**

Create `src/components/seo/JSONLDQuotation.astro`:

```astro
---
import type { Candidato, Declaracao } from "@/types";
import { buildQuotationSchema } from "@/lib/seo/build-quotation";
import { safeJsonLd } from "@/lib/seo/safe-json-ld";

interface Props {
  declaracao: Declaracao;
  candidato: Candidato;
}

const { declaracao, candidato } = Astro.props;
const siteUrl = Astro.site?.toString().replace(/\/$/, "") ?? "https://atlas-2026.pages.dev";
const schema = buildQuotationSchema(declaracao, candidato, siteUrl);
const json = safeJsonLd(schema);
---

<script type="application/ld+json" is:inline set:html={json} />
```

- [ ] **Step 6: Lint + typecheck**

Run:

```bash
pnpm lint
pnpm typecheck
```

Expected: 0 warnings.

- [ ] **Step 7: Commit**

```bash
git add src/lib/seo/build-quotation.ts src/components/seo/JSONLDQuotation.astro tests/unit/seo/build-quotation.test.ts
git commit -m "feat(seo): adicionar buildQuotationSchema e componente JSONLDQuotation"
```

---

## Task 4: `build-event.ts` + componente `JSONLDEvent.astro`

**Por que:** evento é o contêiner factual onde declarações acontecem. Schema.org/Event ajuda buscadores a entender o contexto (debate, entrevista, comício).

**Files:**

- Create: `src/lib/seo/build-event.ts`
- Create: `src/components/seo/JSONLDEvent.astro`
- Create: `tests/unit/seo/build-event.test.ts`

- [ ] **Step 1: Escrever teste de buildEventSchema**

Create `tests/unit/seo/build-event.test.ts`:

```typescript
import { describe, it, expect } from "vitest";
import { buildEventSchema } from "@/lib/seo/build-event";
import type { Candidato, Evento } from "@/types";

const fakeCandidatos: Candidato[] = [
  {
    id: "candidato-a",
    slug: "candidato-a",
    collection: "candidatos",
    data: {
      id: "candidato-a",
      slug: "candidato-a",
      nome: "Candidato A",
      partido: "Partido X",
      biografia_minima: "Bio.",
      contas_oficiais: [],
      criado_em: "2026-01-01T00:00:00Z",
      atualizado_em: "2026-04-01T00:00:00Z",
    },
  } as Candidato,
  {
    id: "candidato-b",
    slug: "candidato-b",
    collection: "candidatos",
    data: {
      id: "candidato-b",
      slug: "candidato-b",
      nome: "Candidato B",
      partido: "Partido Y",
      biografia_minima: "Bio.",
      contas_oficiais: [],
      criado_em: "2026-01-01T00:00:00Z",
      atualizado_em: "2026-04-01T00:00:00Z",
    },
  } as Candidato,
];

const fakeEvento: Evento = {
  id: "2026-04-15-debate-rede-tv",
  collection: "eventos",
  data: {
    id: "2026-04-15-debate-rede-tv",
    titulo: "Debate Presidencial - Rede TV 15/04/2026",
    data: "2026-04-15T20:00:00Z",
    tipo: "debate",
    local: { fisico: "Estúdio Rede TV - São Paulo", digital: null },
    duracao_minutos: 120,
    fonte_primaria_url: "https://youtube.com/watch?v=abc123",
    fonte_primaria_tipo: "youtube_oficial",
    archive_url: "https://web.archive.org/web/2026/https://youtube.com/watch?v=abc123",
    candidatos_envolvidos: [{ candidato_id: "candidato-a" }, { candidato_id: "candidato-b" }],
    descricao: "Debate entre candidatos sobre economia e saúde.",
    criado_em: "2026-04-15T00:00:00Z",
    atualizado_em: "2026-04-15T00:00:00Z",
  },
} as Evento;

describe("buildEventSchema", () => {
  it("retorna Event com @context e @type", () => {
    const schema = buildEventSchema(fakeEvento, fakeCandidatos, "https://atlas-2026.pages.dev");
    expect(schema["@context"]).toBe("https://schema.org");
    expect(schema["@type"]).toBe("Event");
  });

  it("usa título como name e descrição como description", () => {
    const schema = buildEventSchema(fakeEvento, fakeCandidatos, "https://atlas-2026.pages.dev");
    expect(schema.name).toBe("Debate Presidencial - Rede TV 15/04/2026");
    expect(schema.description).toBe("Debate entre candidatos sobre economia e saúde.");
  });

  it("usa data como startDate", () => {
    const schema = buildEventSchema(fakeEvento, fakeCandidatos, "https://atlas-2026.pages.dev");
    expect(schema.startDate).toBe("2026-04-15T20:00:00Z");
  });

  it("inclui location quando físico existe", () => {
    const schema = buildEventSchema(fakeEvento, fakeCandidatos, "https://atlas-2026.pages.dev");
    expect(schema.location).toEqual({
      "@type": "Place",
      name: "Estúdio Rede TV - São Paulo",
    });
  });

  it("inclui performer com todos os candidatos envolvidos", () => {
    const schema = buildEventSchema(fakeEvento, fakeCandidatos, "https://atlas-2026.pages.dev");
    expect(schema.performer).toEqual([
      {
        "@type": "Person",
        name: "Candidato A",
        url: "https://atlas-2026.pages.dev/candidatos/candidato-a",
      },
      {
        "@type": "Person",
        name: "Candidato B",
        url: "https://atlas-2026.pages.dev/candidatos/candidato-b",
      },
    ]);
  });

  it("inclui url canônica do evento", () => {
    const schema = buildEventSchema(fakeEvento, fakeCandidatos, "https://atlas-2026.pages.dev");
    expect(schema.url).toBe("https://atlas-2026.pages.dev/eventos/2026-04-15-debate-rede-tv");
  });

  it("ignora candidatos_envolvidos que não estão na lista de candidatos passada", () => {
    const eventoComOrfao: Evento = {
      ...fakeEvento,
      data: {
        ...fakeEvento.data,
        candidatos_envolvidos: [
          { candidato_id: "candidato-a" },
          { candidato_id: "candidato-fantasma" },
        ],
      },
    } as Evento;
    const schema = buildEventSchema(eventoComOrfao, fakeCandidatos, "https://atlas-2026.pages.dev");
    expect(schema.performer).toHaveLength(1);
    expect(Array.isArray(schema.performer) ? schema.performer[0] : schema.performer).toMatchObject({
      name: "Candidato A",
    });
  });
});
```

- [ ] **Step 2: Rodar teste — deve FALHAR**

Run:

```bash
pnpm test -- tests/unit/seo/build-event.test.ts
```

Expected: FAIL com "Cannot find module '@/lib/seo/build-event'".

- [ ] **Step 3: Implementar `build-event.ts`**

Create `src/lib/seo/build-event.ts`:

```typescript
import type { Event as SchemaEvent, Person, WithContext } from "schema-dts";
import type { Candidato, Evento } from "@/types";

/**
 * Constrói o JSON-LD Schema.org/Event para um evento.
 *
 * Inclui performer[] como Person inline para cada candidato envolvido
 * (filtrado contra a lista de candidatos passada, ignora referências órfãs).
 *
 * Schema.org/Event: https://schema.org/Event
 */
export function buildEventSchema(
  evento: Evento,
  candidatos: Candidato[],
  siteUrl: string,
): WithContext<SchemaEvent> {
  const candidatosPorId = new Map(candidatos.map((c) => [c.data.id, c]));

  const performer: Person[] = evento.data.candidatos_envolvidos
    .map((c) => candidatosPorId.get(c.candidato_id))
    .filter((c): c is Candidato => c !== undefined)
    .map((c) => ({
      "@type": "Person" as const,
      name: c.data.nome,
      url: `${siteUrl}/candidatos/${c.data.slug}`,
    }));

  const schema: WithContext<SchemaEvent> = {
    "@context": "https://schema.org",
    "@type": "Event",
    name: evento.data.titulo,
    description: evento.data.descricao,
    startDate: evento.data.data,
    url: `${siteUrl}/eventos/${evento.data.id}`,
    performer,
  };

  if (evento.data.local.fisico) {
    schema.location = {
      "@type": "Place",
      name: evento.data.local.fisico,
    };
  }

  return schema;
}
```

- [ ] **Step 4: Rodar teste — deve PASSAR**

Run:

```bash
pnpm test -- tests/unit/seo/build-event.test.ts
```

Expected: 7 tests pass.

- [ ] **Step 5: Criar componente JSONLDEvent.astro**

Create `src/components/seo/JSONLDEvent.astro`:

```astro
---
import type { Candidato, Evento } from "@/types";
import { buildEventSchema } from "@/lib/seo/build-event";
import { safeJsonLd } from "@/lib/seo/safe-json-ld";

interface Props {
  evento: Evento;
  candidatos: Candidato[];
}

const { evento, candidatos } = Astro.props;
const siteUrl = Astro.site?.toString().replace(/\/$/, "") ?? "https://atlas-2026.pages.dev";
const schema = buildEventSchema(evento, candidatos, siteUrl);
const json = safeJsonLd(schema);
---

<script type="application/ld+json" is:inline set:html={json} />
```

- [ ] **Step 6: Lint + typecheck**

Run:

```bash
pnpm lint
pnpm typecheck
```

Expected: 0 warnings.

- [ ] **Step 7: Commit**

```bash
git add src/lib/seo/build-event.ts src/components/seo/JSONLDEvent.astro tests/unit/seo/build-event.test.ts
git commit -m "feat(seo): adicionar buildEventSchema e componente JSONLDEvent"
```

---

## Task 5: `build-article.ts` + componente `JSONLDArticle.astro`

**Por que:** Article wrapping em torno de cada página de declaração ajuda crawlers genéricos (não-Schema-aware) a tratar a página como conteúdo jornalístico/factual com autor (o Atlas) e data.

**Files:**

- Create: `src/lib/seo/build-article.ts`
- Create: `src/components/seo/JSONLDArticle.astro`
- Create: `tests/unit/seo/build-article.test.ts`

- [ ] **Step 1: Escrever teste de buildArticleSchema**

Create `tests/unit/seo/build-article.test.ts`:

```typescript
import { describe, it, expect } from "vitest";
import { buildArticleSchema } from "@/lib/seo/build-article";
import type { Candidato, Declaracao } from "@/types";

const fakeCandidato: Candidato = {
  id: "candidato-a",
  slug: "candidato-a",
  collection: "candidatos",
  data: {
    id: "candidato-a",
    slug: "candidato-a",
    nome: "Candidato A",
    partido: "Partido X",
    biografia_minima: "Bio.",
    contas_oficiais: [],
    criado_em: "2026-01-01T00:00:00Z",
    atualizado_em: "2026-04-01T00:00:00Z",
  },
} as Candidato;

const fakeDeclaracao: Declaracao = {
  id: "2026-04-15-candidato-a-economia-imposto",
  slug: "2026-04-15-candidato-a-economia-imposto",
  collection: "declaracoes",
  data: {
    id: "2026-04-15-candidato-a-economia-imposto",
    slug: "2026-04-15-candidato-a-economia-imposto",
    candidato_id: "candidato-a",
    evento_id: "2026-04-15-debate-rede-tv",
    texto: "Vou reduzir o imposto de renda em 30% no primeiro ano.",
    timestamp_no_evento: "00:23:15",
    contexto: "Resposta sobre política fiscal durante o debate.",
    tema_principal: "economia",
    temas_secundarios: [],
    tipo_estrutural: ["promessa", "dado_numerico"],
    fonte_primaria_url: "https://youtube.com/watch?v=abc123",
    fonte_primaria_tipo: "youtube_oficial",
    archive_url: "https://web.archive.org/web/2026/https://youtube.com/watch?v=abc123",
    snapshot_interno_path: null,
    contexto_adicional: null,
    vereditos_externos: [],
    versao: 1,
    criado_em: "2026-04-15T00:00:00Z",
    atualizado_em: "2026-04-20T00:00:00Z",
  },
} as Declaracao;

describe("buildArticleSchema", () => {
  it("retorna Article com @context e @type", () => {
    const schema = buildArticleSchema(
      fakeDeclaracao,
      fakeCandidato,
      "https://atlas-2026.pages.dev",
    );
    expect(schema["@context"]).toBe("https://schema.org");
    expect(schema["@type"]).toBe("Article");
  });

  it("usa nome do candidato e texto truncado como headline", () => {
    const schema = buildArticleSchema(
      fakeDeclaracao,
      fakeCandidato,
      "https://atlas-2026.pages.dev",
    );
    expect(schema.headline).toBe(
      'Candidato A: "Vou reduzir o imposto de renda em 30% no primeiro ano."',
    );
  });

  it("trunca textos longos da declaração no headline (até 110 chars + reticências)", () => {
    const longText = "A".repeat(200);
    const declaracaoLonga: Declaracao = {
      ...fakeDeclaracao,
      data: { ...fakeDeclaracao.data, texto: longText },
    } as Declaracao;
    const schema = buildArticleSchema(
      declaracaoLonga,
      fakeCandidato,
      "https://atlas-2026.pages.dev",
    );
    expect(schema.headline?.toString().length).toBeLessThanOrEqual(140);
    expect(schema.headline?.toString()).toContain("…");
  });

  it("inclui author como Organization Atlas", () => {
    const schema = buildArticleSchema(
      fakeDeclaracao,
      fakeCandidato,
      "https://atlas-2026.pages.dev",
    );
    expect(schema.author).toEqual({
      "@type": "Organization",
      name: "Atlas dos Candidatos 2026",
      url: "https://atlas-2026.pages.dev",
    });
  });

  it("usa criado_em como datePublished e atualizado_em como dateModified", () => {
    const schema = buildArticleSchema(
      fakeDeclaracao,
      fakeCandidato,
      "https://atlas-2026.pages.dev",
    );
    expect(schema.datePublished).toBe("2026-04-15T00:00:00Z");
    expect(schema.dateModified).toBe("2026-04-20T00:00:00Z");
  });

  it("inclui mainEntityOfPage com URL da declaração", () => {
    const schema = buildArticleSchema(
      fakeDeclaracao,
      fakeCandidato,
      "https://atlas-2026.pages.dev",
    );
    expect(schema.mainEntityOfPage).toEqual({
      "@type": "WebPage",
      "@id": "https://atlas-2026.pages.dev/declaracoes/2026-04-15-candidato-a-economia-imposto",
    });
  });
});
```

- [ ] **Step 2: Rodar teste — deve FALHAR**

Run:

```bash
pnpm test -- tests/unit/seo/build-article.test.ts
```

Expected: FAIL com "Cannot find module '@/lib/seo/build-article'".

- [ ] **Step 3: Implementar `build-article.ts`**

Create `src/lib/seo/build-article.ts`:

```typescript
import type { Article, WithContext } from "schema-dts";
import type { Candidato, Declaracao } from "@/types";

const HEADLINE_MAX_TEXT_CHARS = 110;

function truncateForHeadline(text: string): string {
  if (text.length <= HEADLINE_MAX_TEXT_CHARS) {
    return text;
  }
  return `${text.slice(0, HEADLINE_MAX_TEXT_CHARS).trimEnd()}…`;
}

/**
 * Constrói o JSON-LD Schema.org/Article wrapping para a página de uma declaração.
 *
 * O Atlas é o autor editorial (Organization). O candidato aparece como
 * sujeito da Quotation (separado em JSONLDQuotation).
 *
 * Schema.org/Article: https://schema.org/Article
 */
export function buildArticleSchema(
  declaracao: Declaracao,
  candidato: Candidato,
  siteUrl: string,
): WithContext<Article> {
  const truncated = truncateForHeadline(declaracao.data.texto);
  const headline = `${candidato.data.nome}: "${truncated}"`;
  const pageUrl = `${siteUrl}/declaracoes/${declaracao.data.id}`;

  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline,
    author: {
      "@type": "Organization",
      name: "Atlas dos Candidatos 2026",
      url: siteUrl,
    },
    datePublished: declaracao.data.criado_em,
    dateModified: declaracao.data.atualizado_em,
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": pageUrl,
    },
  };
}
```

- [ ] **Step 4: Rodar teste — deve PASSAR**

Run:

```bash
pnpm test -- tests/unit/seo/build-article.test.ts
```

Expected: 6 tests pass.

- [ ] **Step 5: Criar componente JSONLDArticle.astro**

Create `src/components/seo/JSONLDArticle.astro`:

```astro
---
import type { Candidato, Declaracao } from "@/types";
import { buildArticleSchema } from "@/lib/seo/build-article";
import { safeJsonLd } from "@/lib/seo/safe-json-ld";

interface Props {
  declaracao: Declaracao;
  candidato: Candidato;
}

const { declaracao, candidato } = Astro.props;
const siteUrl = Astro.site?.toString().replace(/\/$/, "") ?? "https://atlas-2026.pages.dev";
const schema = buildArticleSchema(declaracao, candidato, siteUrl);
const json = safeJsonLd(schema);
---

<script type="application/ld+json" is:inline set:html={json} />
```

- [ ] **Step 6: Lint + typecheck**

Run:

```bash
pnpm lint
pnpm typecheck
```

Expected: 0 warnings.

- [ ] **Step 7: Commit**

```bash
git add src/lib/seo/build-article.ts src/components/seo/JSONLDArticle.astro tests/unit/seo/build-article.test.ts
git commit -m "feat(seo): adicionar buildArticleSchema e componente JSONLDArticle"
```

---

## Task 6: `build-dataset.ts` + componente `JSONLDDataset.astro`

**Por que:** a página `/dataset` precisa ser indexada como Schema.org/Dataset para que Google Dataset Search, HuggingFace e outros agregadores encontrem o dataset CC-BY 4.0 do Atlas.

**Files:**

- Create: `src/lib/seo/build-dataset.ts`
- Create: `src/components/seo/JSONLDDataset.astro`
- Create: `tests/unit/seo/build-dataset.test.ts`

- [ ] **Step 1: Escrever teste de buildDatasetSchema**

Create `tests/unit/seo/build-dataset.test.ts`:

```typescript
import { describe, it, expect } from "vitest";
import { buildDatasetSchema } from "@/lib/seo/build-dataset";

describe("buildDatasetSchema", () => {
  it("retorna Dataset com @context e @type", () => {
    const schema = buildDatasetSchema(
      {
        version: "0.1.0",
        downloads: [
          {
            format: "application/x-ndjson",
            url: "https://atlas-2026.pages.dev/dataset/declaracoes.jsonl",
          },
          { format: "text/csv", url: "https://atlas-2026.pages.dev/dataset/declaracoes.csv" },
        ],
        totalDeclaracoes: 60,
      },
      "https://atlas-2026.pages.dev",
    );
    expect(schema["@context"]).toBe("https://schema.org");
    expect(schema["@type"]).toBe("Dataset");
  });

  it("inclui name e description fixos do Atlas", () => {
    const schema = buildDatasetSchema(
      { version: "0.1.0", downloads: [], totalDeclaracoes: 0 },
      "https://atlas-2026.pages.dev",
    );
    expect(schema.name).toBe("Atlas dos Candidatos 2026 — Declarações");
    expect(schema.description).toContain("Memória factual");
  });

  it("inclui licença CC-BY 4.0", () => {
    const schema = buildDatasetSchema(
      { version: "0.1.0", downloads: [], totalDeclaracoes: 0 },
      "https://atlas-2026.pages.dev",
    );
    expect(schema.license).toBe("https://creativecommons.org/licenses/by/4.0/");
  });

  it("inclui version e numberOfItems", () => {
    const schema = buildDatasetSchema(
      { version: "0.1.0", downloads: [], totalDeclaracoes: 42 },
      "https://atlas-2026.pages.dev",
    );
    expect(schema.version).toBe("0.1.0");
    const numberOfItems = (schema as unknown as { numberOfItems: number }).numberOfItems;
    expect(numberOfItems).toBe(42);
  });

  it("inclui distribution[] com cada download", () => {
    const schema = buildDatasetSchema(
      {
        version: "0.1.0",
        downloads: [
          {
            format: "application/x-ndjson",
            url: "https://atlas-2026.pages.dev/dataset/declaracoes.jsonl",
          },
          { format: "text/csv", url: "https://atlas-2026.pages.dev/dataset/declaracoes.csv" },
        ],
        totalDeclaracoes: 60,
      },
      "https://atlas-2026.pages.dev",
    );
    expect(schema.distribution).toEqual([
      {
        "@type": "DataDownload",
        encodingFormat: "application/x-ndjson",
        contentUrl: "https://atlas-2026.pages.dev/dataset/declaracoes.jsonl",
      },
      {
        "@type": "DataDownload",
        encodingFormat: "text/csv",
        contentUrl: "https://atlas-2026.pages.dev/dataset/declaracoes.csv",
      },
    ]);
  });

  it("inclui creator como Organization Atlas", () => {
    const schema = buildDatasetSchema(
      { version: "0.1.0", downloads: [], totalDeclaracoes: 0 },
      "https://atlas-2026.pages.dev",
    );
    expect(schema.creator).toEqual({
      "@type": "Organization",
      name: "Atlas dos Candidatos 2026",
      url: "https://atlas-2026.pages.dev",
    });
  });
});
```

- [ ] **Step 2: Rodar teste — deve FALHAR**

Run:

```bash
pnpm test -- tests/unit/seo/build-dataset.test.ts
```

Expected: FAIL com "Cannot find module '@/lib/seo/build-dataset'".

- [ ] **Step 3: Implementar `build-dataset.ts`**

Create `src/lib/seo/build-dataset.ts`:

```typescript
import type { Dataset, DataDownload, WithContext } from "schema-dts";

export interface DatasetMeta {
  version: string;
  downloads: Array<{ format: string; url: string }>;
  totalDeclaracoes: number;
}

/**
 * Constrói o JSON-LD Schema.org/Dataset para a página /dataset.
 *
 * Inclui:
 * - distribution[]: cada formato (JSONL, CSV) como DataDownload
 * - license: CC-BY 4.0
 * - version + numberOfItems (totalDeclaracoes)
 *
 * Schema.org/Dataset: https://schema.org/Dataset
 */
export function buildDatasetSchema(meta: DatasetMeta, siteUrl: string): WithContext<Dataset> {
  const distribution: DataDownload[] = meta.downloads.map((d) => ({
    "@type": "DataDownload" as const,
    encodingFormat: d.format,
    contentUrl: d.url,
  }));

  const schema: WithContext<Dataset> & { numberOfItems: number } = {
    "@context": "https://schema.org",
    "@type": "Dataset",
    name: "Atlas dos Candidatos 2026 — Declarações",
    description:
      "Memória factual de declarações de candidatos à presidência do Brasil em 2026, com fonte primária verificável (vídeo timestamped, transcrição oficial, link arquivado) e vereditos externos quando disponíveis.",
    url: `${siteUrl}/dataset`,
    license: "https://creativecommons.org/licenses/by/4.0/",
    version: meta.version,
    numberOfItems: meta.totalDeclaracoes,
    distribution,
    creator: {
      "@type": "Organization",
      name: "Atlas dos Candidatos 2026",
      url: siteUrl,
    },
  };

  return schema;
}
```

- [ ] **Step 4: Rodar teste — deve PASSAR**

Run:

```bash
pnpm test -- tests/unit/seo/build-dataset.test.ts
```

Expected: 6 tests pass.

- [ ] **Step 5: Criar componente JSONLDDataset.astro**

Create `src/components/seo/JSONLDDataset.astro`:

```astro
---
import { buildDatasetSchema, type DatasetMeta } from "@/lib/seo/build-dataset";
import { safeJsonLd } from "@/lib/seo/safe-json-ld";

interface Props {
  meta: DatasetMeta;
}

const { meta } = Astro.props;
const siteUrl = Astro.site?.toString().replace(/\/$/, "") ?? "https://atlas-2026.pages.dev";
const schema = buildDatasetSchema(meta, siteUrl);
const json = safeJsonLd(schema);
---

<script type="application/ld+json" is:inline set:html={json} />
```

- [ ] **Step 6: Lint + typecheck**

Run:

```bash
pnpm lint
pnpm typecheck
```

Expected: 0 warnings.

- [ ] **Step 7: Commit**

```bash
git add src/lib/seo/build-dataset.ts src/components/seo/JSONLDDataset.astro tests/unit/seo/build-dataset.test.ts
git commit -m "feat(seo): adicionar buildDatasetSchema e componente JSONLDDataset"
```

---

## Task 7: Estender BaseLayout com slot `head` + criar SEOTags.astro

**Por que:** BaseLayout atual não permite injeção de tags adicionais no `<head>` por página (necessário para JSON-LD por página, OG image dinâmica, Twitter Cards, etc.). Adicionamos um `<slot name="head" />` no BaseLayout para que cada página injete o que precisar via componentes (SEOTags + JSONLD\*). SEOTags.astro centraliza Open Graph + Twitter Cards + article:published_time.

**Files:**

- Modify: `src/components/layout/BaseLayout.astro`
- Create: `src/components/seo/SEOTags.astro`

- [ ] **Step 1: Modificar BaseLayout.astro para incluir slot named `head`**

Edit `src/components/layout/BaseLayout.astro`. Substituir todo o conteúdo por:

```astro
---
import "@/styles/global.css";
import { ClientRouter } from "astro:transitions";
import Header from "@/components/layout/Header.astro";
import Footer from "@/components/layout/Footer.astro";
import SkipLink from "@/components/shared/SkipLink.astro";

interface Props {
  title: string;
  description?: string;
  canonicalUrl?: string;
  noindex?: boolean;
}

const {
  title,
  description = "Memória factual da eleição presidencial brasileira de 2026. Declarações com fonte primária. Sem julgamento editorial.",
  canonicalUrl,
  noindex = false,
} = Astro.props;

const fullTitle =
  title === "Atlas dos Candidatos 2026" ? title : `${title} · Atlas dos Candidatos 2026`;

const canonical = canonicalUrl ?? new URL(Astro.url.pathname, Astro.site).toString();
---

<!doctype html>
<html lang="pt-BR">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="generator" content={Astro.generator} />

    <title>{fullTitle}</title>
    <meta name="description" content={description} />
    <link rel="canonical" href={canonical} />

    {noindex && <meta name="robots" content="noindex" />}

    <link rel="icon" type="image/svg+xml" href="/favicon.svg" />

    <slot name="head" />

    <ClientRouter />
  </head>
  <body>
    <SkipLink />
    <Header />
    <main id="main-content" tabindex="-1">
      <slot />
    </main>
    <Footer />
  </body>
</html>
```

A única mudança versus o original é a linha `<slot name="head" />` antes do `<ClientRouter />`. Mantemos `<slot />` (default) para o conteúdo do body.

- [ ] **Step 2: Criar SEOTags.astro**

Create `src/components/seo/SEOTags.astro`:

```astro
---
interface Props {
  title: string;
  description: string;
  canonical: string;
  ogImage?: string;
  ogType?: "website" | "article";
  publishedTime?: string;
  modifiedTime?: string;
  twitterCard?: "summary" | "summary_large_image";
}

const {
  title,
  description,
  canonical,
  ogImage,
  ogType = "website",
  publishedTime,
  modifiedTime,
  twitterCard = "summary_large_image",
} = Astro.props;
---

<meta property="og:title" content={title} />
<meta property="og:description" content={description} />
<meta property="og:url" content={canonical} />
<meta property="og:type" content={ogType} />
<meta property="og:site_name" content="Atlas dos Candidatos 2026" />
<meta property="og:locale" content="pt_BR" />
{ogImage && <meta property="og:image" content={ogImage} />}
{ogImage && <meta property="og:image:width" content="1200" />}
{ogImage && <meta property="og:image:height" content="630" />}

<meta name="twitter:card" content={twitterCard} />
<meta name="twitter:title" content={title} />
<meta name="twitter:description" content={description} />
{ogImage && <meta name="twitter:image" content={ogImage} />}

{
  ogType === "article" && publishedTime && (
    <meta property="article:published_time" content={publishedTime} />
  )
}
{
  ogType === "article" && modifiedTime && (
    <meta property="article:modified_time" content={modifiedTime} />
  )
}
```

- [ ] **Step 3: Build + typecheck para confirmar que slot extension não quebra**

Run:

```bash
pnpm typecheck
pnpm build
```

Expected: typecheck 0 hints, build sucede (2 páginas estáticas, igual antes).

- [ ] **Step 4: Verificar HTML resultante mantém estrutura esperada**

Run:

```bash
grep -E '<title>|<meta name="description"|<link rel="canonical"' dist/index.html | head -10
```

Expected: as 3 tags continuam aparecendo no HTML — confirmando que adicionar o slot não quebrou o BaseLayout existente.

- [ ] **Step 5: Lint**

Run:

```bash
pnpm lint
```

Expected: 0 warnings.

- [ ] **Step 6: Commit**

```bash
git add src/components/layout/BaseLayout.astro src/components/seo/SEOTags.astro
git commit -m "feat(seo): adicionar slot head em BaseLayout e componente SEOTags"
```

---

## Task 8: Smoke test do Sprint 4.1 (build com JSON-LD em uma página de teste)

**Por que:** antes de seguir para Sprint 4.2, validamos que os componentes JSON-LD efetivamente injetam scripts válidos no HTML. Usamos a home como vitrine — adicionamos um JSONLDDataset placeholder e confirmamos no HTML resultante.

**Files:**

- Modify: `src/pages/index.astro` (temporário; depois é refinado em Sprint 4.3)

- [ ] **Step 1: Adicionar JSONLD placeholder na home**

Edit `src/pages/index.astro`. Substituir o conteúdo inteiro por:

```astro
---
import BaseLayout from "@/components/layout/BaseLayout.astro";
import Disclaimer from "@/components/shared/Disclaimer.astro";
import Tag from "@/components/shared/Tag.astro";
import JSONLDDataset from "@/components/seo/JSONLDDataset.astro";
import SEOTags from "@/components/seo/SEOTags.astro";

const datasetMeta = {
  version: "0.0.0",
  downloads: [],
  totalDeclaracoes: 0,
};

const canonical = new URL("/", Astro.site).toString();
---

<BaseLayout title="Atlas dos Candidatos 2026">
  <SEOTags
    slot="head"
    title="Atlas dos Candidatos 2026"
    description="Memória factual da eleição presidencial brasileira de 2026. Declarações com fonte primária. Sem julgamento editorial."
    canonical={canonical}
    ogType="website"
  />
  <JSONLDDataset slot="head" meta={datasetMeta} />

  <section class="container-narrow" style="padding-block: var(--space-4xl);">
    <p class="eyebrow" style="margin-bottom: var(--space-sm);">ATLAS · ELEIÇÃO 2026</p>
    <h1>Atlas dos Candidatos 2026.</h1>
    <p
      style="margin-top: var(--space-md); color: var(--color-text-body); font-size: var(--text-body-lg); max-width: 60ch;"
    >
      Memória factual da eleição presidencial brasileira de 2026. Declarações com fonte primária.
      Sem julgamento editorial.
    </p>

    <div style="margin-top: var(--space-lg); display: flex; gap: var(--space-xs); flex-wrap: wrap;">
      <Tag>economia</Tag>
      <Tag>saúde</Tag>
      <Tag variant="structural">promessa</Tag>
      <Tag variant="structural">dado_numerico</Tag>
    </div>

    <div style="margin-top: var(--space-2xl);">
      <Disclaimer variant="prominent" />
    </div>
  </section>
</BaseLayout>
```

- [ ] **Step 2: Build**

Run:

```bash
pnpm build
```

Expected: build sucede com 2 páginas estáticas.

- [ ] **Step 3: Verificar JSON-LD no HTML resultante**

Run:

```bash
grep -c 'application/ld+json' dist/index.html
grep -c 'og:title' dist/index.html
grep -c 'twitter:card' dist/index.html
grep -o '"@type":"Dataset"' dist/index.html
```

Expected:

- `grep -c 'application/ld+json'` → 1 ou mais
- `grep -c 'og:title'` → 1
- `grep -c 'twitter:card'` → 1
- `grep -o '"@type":"Dataset"'` → `"@type":"Dataset"`

- [ ] **Step 4: Rodar test suite completa para garantir que nada quebrou**

Run:

```bash
pnpm test
pnpm lint
pnpm typecheck
```

Expected:

- `pnpm test`: 70 anteriores + 35 novos (6×6=36, menos overlap) = aproximadamente **97 tests passing**, 0 skipped. (Número exato pode variar; o importante é todos passing.)
- `pnpm lint`: 0 warnings
- `pnpm typecheck`: 0 hints

- [ ] **Step 5: Commit**

```bash
git add src/pages/index.astro
git commit -m "test(seo): integrar JSONLDDataset e SEOTags na home como smoke test"
```

- [ ] **Step 6: PAUSA — Reportar status ao André**

Antes de prosseguir para Sprint 4.2, reportar:

- Sprint 4.1 completo (Tasks 1–8)
- Total de tests rodando localmente
- Confirmação de build verde + JSON-LD validado no HTML
- Próximo: Sprint 4.2 — Sitemap + robots + Pagefind

Aguardar autorização explícita do André antes de iniciar Task 9.

---

# SPRINT 4.2 — Sitemap + robots + Pagefind (Tasks 9–12)

Objetivo: infraestrutura de descoberta — sitemap.xml automático, robots.txt permissivo e busca estática via Pagefind. Após esta sprint o site é descobrível por crawlers e tem busca interna funcional.

---

## Task 9: Adicionar `@astrojs/sitemap` integration

**Context7 (já validado):**

- Library ID: `/withastro/docs`
- Padrão canônico: `import sitemap, { ChangeFreqEnum } from '@astrojs/sitemap'` + `sitemap({ serialize(item) { ... return item } })`. Fonte: `https://github.com/withastro/docs/blob/main/src/content/docs/en/guides/integrations-guide/sitemap.mdx`.
- Requer `site` em `astro.config.mjs` (já está: `https://atlas-2026.pages.dev`).

**Files:**

- Modify: `package.json`
- Modify: `astro.config.mjs`

- [ ] **Step 1: Instalar @astrojs/sitemap**

Run:

```bash
pnpm add @astrojs/sitemap@^3.6.0
```

Expected: `@astrojs/sitemap` aparece em `dependencies` do `package.json`, lockfile atualizado.

- [ ] **Step 2: Modificar `astro.config.mjs`**

Substituir todo o conteúdo de `astro.config.mjs` por:

```javascript
import { defineConfig } from "astro/config";
import { fileURLToPath } from "node:url";
import react from "@astrojs/react";
import sitemap, { ChangeFreqEnum } from "@astrojs/sitemap";
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
  integrations: [
    react(),
    sitemap({
      changefreq: "weekly",
      priority: 0.6,
      serialize(item) {
        if (/\/404/.test(item.url) || /\/buscar/.test(item.url)) {
          return undefined;
        }
        if (/\/declaracoes\//.test(item.url)) {
          item.priority = 0.9;
          item.changefreq = ChangeFreqEnum.MONTHLY;
        }
        if (/\/candidatos\/|\/eventos\//.test(item.url)) {
          item.priority = 0.8;
          item.changefreq = ChangeFreqEnum.WEEKLY;
        }
        if (item.url.endsWith("/") || /\/dataset|\/metodologia/.test(item.url)) {
          item.priority = 0.7;
        }
        return item;
      },
    }),
  ],
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

- [ ] **Step 3: Build para gerar sitemap**

Run:

```bash
pnpm build
```

Expected: build sucede; `dist/` contém `sitemap-index.xml` e `sitemap-0.xml`.

- [ ] **Step 4: Verificar sitemap gerado**

Run:

```bash
ls dist/sitemap*.xml
grep -c "<loc>" dist/sitemap-0.xml
```

Expected: existe `dist/sitemap-index.xml` e `dist/sitemap-0.xml`; `<loc>` count >= 1.

- [ ] **Step 5: Lint + typecheck**

Run:

```bash
pnpm lint
pnpm typecheck
```

Expected: 0 warnings.

- [ ] **Step 6: Commit**

```bash
git add package.json pnpm-lock.yaml astro.config.mjs
git commit -m "feat(seo): adicionar @astrojs/sitemap com filtros e prioridades"
```

---

## Task 10: Criar `public/robots.txt` permissivo (inclusive AI bots)

**Por que:** o spec (seção 9.4) é explícito: "robots.txt permissivo — queremos indexação total, inclusive por AI-bots (visibilidade em respostas de chatbots)". Isso é decisão estratégica do projeto.

**Files:**

- Create: `public/robots.txt`

- [ ] **Step 1: Criar `public/robots.txt`**

Conteúdo de `public/robots.txt`:

```
# Atlas dos Candidatos 2026
# Política: indexação aberta — inclusive AI bots
# Objetivo: visibilidade em buscadores e em respostas de chatbots/assistentes

User-agent: *
Allow: /

# AI/LLM bots explicitamente permitidos
User-agent: GPTBot
Allow: /

User-agent: ClaudeBot
Allow: /

User-agent: anthropic-ai
Allow: /

User-agent: Google-Extended
Allow: /

User-agent: PerplexityBot
Allow: /

User-agent: Bytespider
Allow: /

User-agent: CCBot
Allow: /

User-agent: FacebookBot
Allow: /

User-agent: Applebot
Allow: /

User-agent: Applebot-Extended
Allow: /

Sitemap: https://atlas-2026.pages.dev/sitemap-index.xml
```

- [ ] **Step 2: Build e verificar robots.txt copiado**

Run:

```bash
pnpm build
ls dist/robots.txt
grep -c "^User-agent:" dist/robots.txt
grep "^Sitemap:" dist/robots.txt
```

Expected: `dist/robots.txt` existe; `User-agent:` count = 11; linha `Sitemap:` presente.

- [ ] **Step 3: Commit**

```bash
git add public/robots.txt
git commit -m "feat(seo): adicionar robots.txt permissivo (inclusive AI bots) com sitemap"
```

---

## Task 11: Instalar Pagefind + configurar `build:full` + atualizar CI

**Context7 (já validado):**

- Library ID: `/cloudcannon/pagefind`
- Padrão canônico via bundler: `import { PagefindUI } from '@pagefind/default-ui'`. Fonte: `https://github.com/cloudcannon/pagefind/blob/main/pagefind_ui/default/README.md`.
- Forçar idioma português: `--force-language pt`.
- Pagefind roda como CLI após `astro build`, indexando o `dist/`.

**Files:**

- Modify: `package.json` (deps + scripts)
- Modify: `.gitignore`
- Modify: `.github/workflows/ci.yml`

- [ ] **Step 1: Instalar pagefind + UI oficial**

Run:

```bash
pnpm add -D pagefind@^1.3.0
pnpm add @pagefind/default-ui@^1.3.0
```

Expected: `pagefind` em `devDependencies`; `@pagefind/default-ui` em `dependencies`.

- [ ] **Step 2: Adicionar scripts `build:index` e `build:full` ao `package.json`**

Edit `package.json`. Localizar o bloco `"scripts"` e adicionar 2 novos scripts:

`old_string`:

```
    "dev": "astro dev",
    "build": "astro build",
    "preview": "astro preview",
```

`new_string`:

```
    "dev": "astro dev",
    "build": "astro build",
    "build:index": "pagefind --site dist --force-language pt",
    "build:full": "pnpm build && pnpm build:index",
    "preview": "astro preview",
```

- [ ] **Step 3: Atualizar `.gitignore` para excluir artefatos Pagefind**

Edit `.gitignore`. Append no final do arquivo as 2 linhas:

```
# Pagefind build artifacts
.pagefind/
```

(Use Edit com `old_string` = última linha atual do `.gitignore`, `new_string` = essa linha + as 2 novas.)

Verificar:

```bash
tail -3 .gitignore
```

- [ ] **Step 4: Rodar `build:full` localmente**

Run:

```bash
pnpm build:full
```

Expected:

- `astro build` sucede
- `pagefind --site dist --force-language pt` roda e cria `dist/pagefind/` com `pagefind-ui.js`, `pagefind-ui.css`, `pagefind.js`, `index.json` e `fragment/*.pf_fragment`.

Verificar:

```bash
ls dist/pagefind/ | head
```

- [ ] **Step 5: Atualizar `.github/workflows/ci.yml`**

Ler `.github/workflows/ci.yml` para localizar o step de build atual e substituir.

`old_string`:

```yaml
- name: Build
  run: pnpm build
```

`new_string`:

```yaml
- name: Build com índice Pagefind
  run: pnpm build:full
```

Se o nome do step no CI atual for diferente, ajustar `old_string` para refletir o conteúdo real.

- [ ] **Step 6: Lint + typecheck + test**

Run:

```bash
pnpm lint
pnpm typecheck
pnpm test
```

Expected: tudo verde.

- [ ] **Step 7: Commit**

```bash
git add package.json pnpm-lock.yaml .gitignore .github/workflows/ci.yml
git commit -m "feat(seo): adicionar Pagefind como devDep e script build:full para CI"
```

---

## Task 12: Componente `PagefindSearch.astro` que monta `<pagefind-ui>`

**Files:**

- Create: `src/components/search/PagefindSearch.astro`

- [ ] **Step 1: Criar `PagefindSearch.astro`**

Conteúdo de `src/components/search/PagefindSearch.astro`:

```astro
---
/**
 * Wrapper Astro para Pagefind Default UI.
 *
 * Carrega assets gerados por `pnpm build:full` (dist/pagefind/) e instancia
 * PagefindUI sobre #pagefind-search após DOMContentLoaded.
 *
 * Padrão Context7 /cloudcannon/pagefind: assets como <link>/<script> + init em DOMContentLoaded.
 */

interface Props {
  showSubResults?: boolean;
  showImages?: boolean;
}

const { showSubResults = true, showImages = false } = Astro.props;
---

<link href="/pagefind/pagefind-ui.css" rel="stylesheet" />

<div id="pagefind-search"></div>

<script is:inline src="/pagefind/pagefind-ui.js"></script>

<script is:inline define:vars={{ showSubResults, showImages }}>
  window.addEventListener("DOMContentLoaded", () => {
    new PagefindUI({
      element: "#pagefind-search",
      showSubResults,
      showImages,
      translations: {
        placeholder: "Buscar declarações, candidatos, eventos...",
        clear_search: "Limpar",
        load_more: "Carregar mais",
        search_label: "Pesquisar no Atlas",
        filters_label: "Filtros",
        zero_results: "Nenhum resultado para [SEARCH_TERM]",
        many_results: "[COUNT] resultados para [SEARCH_TERM]",
        one_result: "[COUNT] resultado para [SEARCH_TERM]",
        alt_search: "Sem resultados para [SEARCH_TERM]. Mostrando [DIFFERENT_TERM]",
        search_suggestion: "Sem resultados para [SEARCH_TERM]. Tente: [DIFFERENT_TERM]",
        searching: "Pesquisando [SEARCH_TERM]...",
      },
    });
  });
</script>

<style>
  :global(.pagefind-ui) {
    --pagefind-ui-primary: var(--color-text-primary, #171717);
    --pagefind-ui-text: var(--color-text-body, #4d4d4d);
    --pagefind-ui-background: var(--color-canvas, #ffffff);
    --pagefind-ui-border: var(--color-hairline, #ebebeb);
    --pagefind-ui-tag: var(--color-bg-muted, #f5f5f5);
    --pagefind-ui-border-width: 1px;
    --pagefind-ui-border-radius: var(--radius-md, 8px);
    --pagefind-ui-font: var(--font-sans, system-ui);
  }
</style>
```

- [ ] **Step 2: Lint + typecheck**

Run:

```bash
pnpm lint
pnpm typecheck
```

Expected: 0 warnings.

- [ ] **Step 3: Commit**

```bash
git add src/components/search/PagefindSearch.astro
git commit -m "feat(seo): adicionar componente PagefindSearch com UI oficial Pagefind"
```

- [ ] **Step 4: PAUSA — Reportar status ao André**

Sprint 4.2 completo. Reportar:

- Sitemap automático funcionando (`dist/sitemap-index.xml` + `dist/sitemap-0.xml`)
- robots.txt permissivo no `dist/`
- Pagefind integrado: `pnpm build:full` gera índice em `dist/pagefind/`
- `PagefindSearch.astro` pronto para uso em `/buscar` na Sprint 4.3
- CI atualizado para rodar `pnpm build:full`

Aguardar autorização do André antes de iniciar Task 13.

---

# SPRINT 4.3 — Páginas + Componentes (Tasks 13–26)

Objetivo: renderizar as 9 rotas e 8 componentes compartilhados que consomem a infraestrutura SEO do Sprint 4.1+4.2. Após esta sprint o site tem todas as URLs públicas previstas no spec.

**Convenção para componentes `.astro`:** sem framework de teste unitário direto para Astro components. Validação por:

1. Escrever o componente
2. Importá-lo na página de destino
3. `pnpm build` para confirmar compilação
4. `grep` no HTML resultante em `dist/` para confirmar elementos esperados
5. Commit

Funções utilitárias extraídas para `src/lib/` ainda são unit-tested via Vitest.

---

## Task 13: Criar fixtures mínimos (2 candidatos + 1 evento + 2 declarações)

**Por que:** `data/candidatos/` e `data/eventos/` não existem ainda. `data/declaracoes/` existe mas está vazio. Sem fixtures, `astro build` produz 0 páginas dinâmicas. Estes fixtures são **placeholders fictícios** ("Candidato Demo A/B") — não dados reais. Servem para validar o pipeline de renderização e documentar o formato dos YAMLs.

**Files:**

- Create: `data/candidatos/candidato-a.yaml`
- Create: `data/candidatos/candidato-b.yaml`
- Create: `data/eventos/2026-04-15-debate-rede-tv.yaml`
- Create: `data/declaracoes/2026-04-15-candidato-a-economia-imposto.md`
- Create: `data/declaracoes/2026-04-15-candidato-b-saude-sus.md`

- [ ] **Step 1: Criar `data/candidatos/candidato-a.yaml`**

```yaml
id: candidato-a
slug: candidato-a
nome: Candidato Demo A
partido: Partido Demonstração Alfa
biografia_minima: |
  Candidato fictício A. Este registro é placeholder para validação técnica
  do pipeline de renderização. Não representa pessoa real.
contas_oficiais:
  - plataforma: x
    handle: "@candidatoa_demo"
    url: https://x.com/candidatoa_demo
    verificada: true
  - plataforma: youtube
    handle: "@candidatoa_demo"
    url: https://youtube.com/@candidatoa_demo
    verificada: true
criado_em: 2026-01-15T00:00:00.000Z
atualizado_em: 2026-04-15T00:00:00.000Z
```

- [ ] **Step 2: Criar `data/candidatos/candidato-b.yaml`**

```yaml
id: candidato-b
slug: candidato-b
nome: Candidato Demo B
partido: Partido Demonstração Beta
biografia_minima: |
  Candidato fictício B. Este registro é placeholder para validação técnica
  do pipeline de renderização. Não representa pessoa real.
contas_oficiais:
  - plataforma: x
    handle: "@candidatob_demo"
    url: https://x.com/candidatob_demo
    verificada: true
criado_em: 2026-01-15T00:00:00.000Z
atualizado_em: 2026-04-15T00:00:00.000Z
```

- [ ] **Step 3: Criar `data/eventos/2026-04-15-debate-rede-tv.yaml`**

```yaml
id: 2026-04-15-debate-rede-tv
titulo: Debate Demonstrativo - Rede TV 15/04/2026
data: 2026-04-15T20:00:00.000Z
tipo: debate
local:
  fisico: Estúdio Demo - São Paulo
  digital: null
duracao_minutos: 120
fonte_primaria_url: https://youtube.com/watch?v=demoabc123
fonte_primaria_tipo: youtube_oficial
archive_url: https://web.archive.org/web/2026/https://youtube.com/watch?v=demoabc123
candidatos_envolvidos:
  - candidato_id: candidato-a
  - candidato_id: candidato-b
descricao: |
  Debate fictício entre os dois candidatos demonstrativos sobre economia e saúde.
  Este registro é placeholder para validação técnica.
criado_em: 2026-04-15T00:00:00.000Z
atualizado_em: 2026-04-15T00:00:00.000Z
```

- [ ] **Step 4: Criar `data/declaracoes/2026-04-15-candidato-a-economia-imposto.md`**

```markdown
---
id: 2026-04-15-candidato-a-economia-imposto
slug: 2026-04-15-candidato-a-economia-imposto
candidato_id: candidato-a
evento_id: 2026-04-15-debate-rede-tv
texto: Vou reduzir o imposto de renda em 30 por cento no primeiro ano de mandato.
timestamp_no_evento: "00:23:15"
contexto: Resposta sobre política fiscal durante o debate demonstrativo. Conteúdo fictício.
tema_principal: economia
temas_secundarios: []
tipo_estrutural:
  - promessa
  - dado_numerico
fonte_primaria_url: https://youtube.com/watch?v=demoabc123
fonte_primaria_tipo: youtube_oficial
archive_url: https://web.archive.org/web/2026/https://youtube.com/watch?v=demoabc123
snapshot_interno_path: null
contexto_adicional: null
vereditos_externos: []
versao: 1
criado_em: 2026-04-15T20:23:15.000Z
atualizado_em: 2026-04-15T20:23:15.000Z
---

Conteúdo de placeholder. A declaração acima é fictícia e existe apenas para validação
do pipeline de renderização.
```

- [ ] **Step 5: Criar `data/declaracoes/2026-04-15-candidato-b-saude-sus.md`**

```markdown
---
id: 2026-04-15-candidato-b-saude-sus
slug: 2026-04-15-candidato-b-saude-sus
candidato_id: candidato-b
evento_id: 2026-04-15-debate-rede-tv
texto: O SUS atende mais de 150 milhões de brasileiros e precisa de investimento estável.
timestamp_no_evento: "00:47:30"
contexto: Resposta sobre saúde pública durante o debate demonstrativo. Conteúdo fictício.
tema_principal: saude
temas_secundarios: []
tipo_estrutural:
  - dado_numerico
  - compromisso_politico
fonte_primaria_url: https://youtube.com/watch?v=demoabc123
fonte_primaria_tipo: youtube_oficial
archive_url: https://web.archive.org/web/2026/https://youtube.com/watch?v=demoabc123
snapshot_interno_path: null
contexto_adicional: null
vereditos_externos:
  - veiculo: Lupa
    classificacao: Verdadeiro
    url: https://lupa.uol.com.br/exemplo-demo-sus
    data: 2026-04-16T10:00:00.000Z
    citacao_curta: O número citado é consistente com dados do DataSUS de 2025.
versao: 1
criado_em: 2026-04-15T20:47:30.000Z
atualizado_em: 2026-04-16T10:00:00.000Z
---

Conteúdo de placeholder. Declaração fictícia para validação do pipeline.
```

- [ ] **Step 6: Validar fixtures**

Run:

```bash
pnpm validate-data
```

Expected: validação passa para todos os fixtures (2 candidatos, 1 evento, 2 declarações, 6 temas).

- [ ] **Step 7: Build e confirmar páginas geradas**

Run:

```bash
pnpm build
ls dist/
```

Expected: build sucede; ainda só 2 páginas estáticas (home + 404) porque as rotas dinâmicas só existirão a partir da Task 15. Mas o `validate-data` precisa passar.

- [ ] **Step 8: Commit**

```bash
git add data/candidatos/ data/eventos/ data/declaracoes/
git commit -m "test(fixtures): adicionar 2 candidatos, 1 evento e 2 declarações demonstrativos"
```

---

## Task 14: `CandidatoCard.astro`

**Files:**

- Create: `src/components/candidato/CandidatoCard.astro`

- [ ] **Step 1: Criar componente**

Conteúdo de `src/components/candidato/CandidatoCard.astro`:

```astro
---
import type { Candidato } from "@/types";

interface Props {
  candidato: Candidato;
}

const { candidato } = Astro.props;
const { data } = candidato;
---

<a
  href={`/candidatos/${data.slug}`}
  class="candidato-card"
  aria-label={`Ver perfil de ${data.nome}`}
>
  <div class="candidato-card__header">
    {
      data.foto_url ? (
        <img src={data.foto_url} alt="" width="48" height="48" class="candidato-card__avatar" />
      ) : (
        <div class="candidato-card__avatar candidato-card__avatar--placeholder" aria-hidden="true">
          {data.nome.charAt(0)}
        </div>
      )
    }
    <div class="candidato-card__identidade">
      <h3 class="candidato-card__nome">{data.nome}</h3>
      <p class="candidato-card__partido">{data.partido}</p>
    </div>
  </div>
  <p class="candidato-card__bio">{data.biografia_minima}</p>
</a>

<style>
  .candidato-card {
    display: flex;
    flex-direction: column;
    gap: var(--space-md);
    padding: var(--space-lg);
    border: 1px solid var(--color-hairline);
    border-radius: var(--radius-md);
    background: var(--color-canvas);
    color: var(--color-text-primary);
    text-decoration: none;
    transition: var(--transition-base);
  }
  .candidato-card:hover {
    border-color: var(--color-hairline-strong);
    box-shadow: var(--shadow-3-soft);
  }
  .candidato-card__header {
    display: flex;
    gap: var(--space-md);
    align-items: center;
  }
  .candidato-card__avatar {
    width: 48px;
    height: 48px;
    border-radius: var(--radius-full);
    object-fit: cover;
  }
  .candidato-card__avatar--placeholder {
    display: grid;
    place-items: center;
    background: var(--color-bg-muted);
    color: var(--color-text-mute);
    font-weight: var(--weight-semibold);
    font-size: var(--text-body-lg);
  }
  .candidato-card__nome {
    margin: 0;
    font-size: var(--text-display-sm);
    font-weight: var(--weight-semibold);
    letter-spacing: var(--tracking-display-sm);
  }
  .candidato-card__partido {
    margin: 0;
    font-size: var(--text-body-sm);
    color: var(--color-text-mute);
  }
  .candidato-card__bio {
    margin: 0;
    font-size: var(--text-body-sm);
    color: var(--color-text-body);
    line-height: var(--leading-body);
  }
</style>
```

- [ ] **Step 2: Lint + typecheck**

Run:

```bash
pnpm lint
pnpm typecheck
```

Expected: 0 warnings.

- [ ] **Step 3: Commit**

```bash
git add src/components/candidato/CandidatoCard.astro
git commit -m "feat(candidato): adicionar componente CandidatoCard"
```

---

## Task 15: `/candidatos/index.astro` (lista de candidatos)

**Files:**

- Create: `src/pages/candidatos/index.astro`

- [ ] **Step 1: Criar página**

Conteúdo de `src/pages/candidatos/index.astro`:

```astro
---
import BaseLayout from "@/components/layout/BaseLayout.astro";
import SEOTags from "@/components/seo/SEOTags.astro";
import CandidatoCard from "@/components/candidato/CandidatoCard.astro";
import { getAllCandidatos } from "@/lib/data/candidatos";

const candidatos = await getAllCandidatos();
const canonical = new URL("/candidatos", Astro.site).toString();
const description = `Lista de ${candidatos.length} candidatos à presidência do Brasil em 2026 documentados no Atlas.`;
---

<BaseLayout title="Candidatos" description={description}>
  <SEOTags
    slot="head"
    title="Candidatos · Atlas dos Candidatos 2026"
    description={description}
    canonical={canonical}
    ogType="website"
  />

  <section class="container-default" style="padding-block: var(--space-3xl);">
    <p class="eyebrow" style="margin-bottom: var(--space-sm);">CANDIDATOS</p>
    <h1 style="margin-bottom: var(--space-lg);">Candidatos documentados</h1>
    <p style="color: var(--color-text-body); max-width: 60ch; margin-bottom: var(--space-2xl);">
      {description}
    </p>

    {
      candidatos.length === 0 ? (
        <p style="color: var(--color-text-mute);">Nenhum candidato registrado ainda.</p>
      ) : (
        <div style="display: grid; gap: var(--space-md); grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));">
          {candidatos.map((c) => (
            <CandidatoCard candidato={c} />
          ))}
        </div>
      )
    }
  </section>
</BaseLayout>
```

- [ ] **Step 2: Build e verificar**

Run:

```bash
pnpm build
ls dist/candidatos/
grep -c "Candidato Demo A" dist/candidatos/index.html
grep -c "Candidato Demo B" dist/candidatos/index.html
```

Expected:

- `dist/candidatos/index.html` existe
- Ambos nomes aparecem (1+ ocorrências cada)

- [ ] **Step 3: Lint + typecheck**

```bash
pnpm lint
pnpm typecheck
```

- [ ] **Step 4: Commit**

```bash
git add src/pages/candidatos/index.astro
git commit -m "feat(candidato): adicionar página de lista /candidatos"
```

---

## Task 16: `CandidatoHeader.astro`

**Files:**

- Create: `src/components/candidato/CandidatoHeader.astro`

- [ ] **Step 1: Criar componente**

Conteúdo de `src/components/candidato/CandidatoHeader.astro`:

```astro
---
import type { Candidato } from "@/types";

interface Props {
  candidato: Candidato;
  totalDeclaracoes: number;
}

const { candidato, totalDeclaracoes } = Astro.props;
const { data } = candidato;
const contasVerificadas = data.contas_oficiais.filter((c) => c.verificada);
---

<header class="candidato-header">
  <div class="candidato-header__identidade">
    {
      data.foto_url ? (
        <img
          src={data.foto_url}
          alt={`Foto de ${data.nome}`}
          width="120"
          height="120"
          class="candidato-header__avatar"
        />
      ) : (
        <div
          class="candidato-header__avatar candidato-header__avatar--placeholder"
          aria-hidden="true"
        >
          {data.nome.charAt(0)}
        </div>
      )
    }
    <div>
      <p class="eyebrow">CANDIDATO</p>
      <h1 style="margin-block: var(--space-xs);">{data.nome}</h1>
      <p style="color: var(--color-text-mute); font-size: var(--text-body-md); margin: 0;">
        {data.partido}
      </p>
    </div>
  </div>

  <p class="candidato-header__bio">{data.biografia_minima}</p>

  <dl class="candidato-header__stats">
    <div>
      <dt>Declarações documentadas</dt>
      <dd>{totalDeclaracoes}</dd>
    </div>
    <div>
      <dt>Contas oficiais verificadas</dt>
      <dd>{contasVerificadas.length}</dd>
    </div>
  </dl>

  {
    contasVerificadas.length > 0 && (
      <ul class="candidato-header__contas" aria-label="Contas oficiais verificadas">
        {contasVerificadas.map((c) => (
          <li>
            <a href={c.url} rel="external nofollow noopener" target="_blank">
              <span class="candidato-header__conta-plataforma">{c.plataforma}</span>
              <span class="candidato-header__conta-handle">{c.handle}</span>
            </a>
          </li>
        ))}
      </ul>
    )
  }
</header>

<style>
  .candidato-header {
    display: flex;
    flex-direction: column;
    gap: var(--space-lg);
    padding-block: var(--space-2xl) var(--space-xl);
    border-bottom: 1px solid var(--color-hairline);
  }
  .candidato-header__identidade {
    display: flex;
    gap: var(--space-lg);
    align-items: center;
  }
  .candidato-header__avatar {
    width: 120px;
    height: 120px;
    border-radius: var(--radius-full);
    object-fit: cover;
  }
  .candidato-header__avatar--placeholder {
    display: grid;
    place-items: center;
    background: var(--color-bg-muted);
    color: var(--color-text-mute);
    font-size: var(--text-display-lg);
    font-weight: var(--weight-semibold);
  }
  .candidato-header__bio {
    color: var(--color-text-body);
    max-width: 60ch;
    line-height: var(--leading-body);
    margin: 0;
  }
  .candidato-header__stats {
    display: flex;
    gap: var(--space-xl);
    margin: 0;
  }
  .candidato-header__stats dt {
    font-size: var(--text-caption);
    color: var(--color-text-mute);
    text-transform: uppercase;
    letter-spacing: 0.05em;
    margin: 0;
  }
  .candidato-header__stats dd {
    font-size: var(--text-display-md);
    font-weight: var(--weight-semibold);
    color: var(--color-text-primary);
    margin: 0;
  }
  .candidato-header__contas {
    display: flex;
    gap: var(--space-sm);
    flex-wrap: wrap;
    list-style: none;
    padding: 0;
    margin: 0;
  }
  .candidato-header__contas a {
    display: inline-flex;
    align-items: center;
    gap: var(--space-xs);
    padding: var(--space-xs) var(--space-sm);
    border: 1px solid var(--color-hairline);
    border-radius: var(--radius-pill);
    background: var(--color-canvas);
    color: var(--color-text-body);
    font-size: var(--text-body-sm);
    text-decoration: none;
  }
  .candidato-header__contas a:hover {
    border-color: var(--color-hairline-strong);
  }
  .candidato-header__conta-plataforma {
    font-size: var(--text-caption);
    text-transform: uppercase;
    color: var(--color-text-mute);
  }
</style>
```

- [ ] **Step 2: Lint + typecheck**

```bash
pnpm lint
pnpm typecheck
```

- [ ] **Step 3: Commit**

```bash
git add src/components/candidato/CandidatoHeader.astro
git commit -m "feat(candidato): adicionar componente CandidatoHeader"
```

---

## Task 17: `TimelineEvento.astro` + `CandidatoTimeline.astro`

**Files:**

- Create: `src/components/candidato/TimelineEvento.astro`
- Create: `src/components/candidato/CandidatoTimeline.astro`

- [ ] **Step 1: Criar `TimelineEvento.astro`**

Conteúdo de `src/components/candidato/TimelineEvento.astro`:

```astro
---
import type { Declaracao, Evento } from "@/types";
import { formatDate } from "@/lib/utils/format-date";

interface Props {
  evento: Evento;
  declaracoes: Declaracao[];
}

const { evento, declaracoes } = Astro.props;
---

<article class="timeline-evento">
  <header class="timeline-evento__header">
    <time datetime={evento.data.data} class="timeline-evento__data">
      {formatDate(evento.data.data)}
    </time>
    <p class="timeline-evento__tipo">{evento.data.tipo}</p>
    <h3 class="timeline-evento__titulo">
      <a href={`/eventos/${evento.data.id}`}>{evento.data.titulo}</a>
    </h3>
  </header>

  {
    declaracoes.length > 0 && (
      <ul class="timeline-evento__declaracoes">
        {declaracoes.map((d) => (
          <li>
            <a href={`/declaracoes/${d.data.id}`} class="timeline-evento__declaracao-link">
              {d.data.timestamp_no_evento && (
                <span class="timeline-evento__timestamp">{d.data.timestamp_no_evento}</span>
              )}
              <span class="timeline-evento__texto">{d.data.texto}</span>
            </a>
          </li>
        ))}
      </ul>
    )
  }
</article>

<style>
  .timeline-evento {
    padding-block: var(--space-lg);
    border-bottom: 1px solid var(--color-hairline);
  }
  .timeline-evento:last-child {
    border-bottom: none;
  }
  .timeline-evento__data {
    font-family: var(--font-mono);
    font-size: var(--text-caption);
    color: var(--color-text-mute);
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }
  .timeline-evento__tipo {
    display: inline-block;
    margin-left: var(--space-sm);
    font-size: var(--text-caption);
    color: var(--color-text-mute);
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }
  .timeline-evento__titulo {
    margin-block: var(--space-xs) var(--space-md);
    font-size: var(--text-display-sm);
    font-weight: var(--weight-semibold);
  }
  .timeline-evento__titulo a {
    color: var(--color-text-primary);
    text-decoration: none;
  }
  .timeline-evento__titulo a:hover {
    color: var(--color-link-deep);
  }
  .timeline-evento__declaracoes {
    list-style: none;
    padding: 0;
    margin: 0;
    display: flex;
    flex-direction: column;
    gap: var(--space-sm);
  }
  .timeline-evento__declaracao-link {
    display: flex;
    gap: var(--space-md);
    align-items: baseline;
    padding: var(--space-sm) var(--space-md);
    border-radius: var(--radius-sm);
    background: var(--color-bg-muted);
    color: var(--color-text-body);
    text-decoration: none;
    line-height: var(--leading-body);
  }
  .timeline-evento__declaracao-link:hover {
    background: var(--color-canvas-soft-2);
  }
  .timeline-evento__timestamp {
    font-family: var(--font-mono);
    font-size: var(--text-caption);
    color: var(--color-text-mute);
    flex-shrink: 0;
  }
  .timeline-evento__texto {
    font-size: var(--text-body-sm);
  }
</style>
```

- [ ] **Step 2: Criar `CandidatoTimeline.astro`**

Conteúdo de `src/components/candidato/CandidatoTimeline.astro`:

```astro
---
import type { Declaracao, Evento } from "@/types";
import TimelineEvento from "@/components/candidato/TimelineEvento.astro";

interface Props {
  eventos: Evento[];
  declaracoes: Declaracao[];
}

const { eventos, declaracoes } = Astro.props;

const declaracoesPorEvento = new Map<string, Declaracao[]>();
for (const d of declaracoes) {
  const lista = declaracoesPorEvento.get(d.data.evento_id) ?? [];
  lista.push(d);
  declaracoesPorEvento.set(d.data.evento_id, lista);
}
---

<section class="candidato-timeline" aria-label="Histórico de eventos e declarações">
  <h2 style="margin-bottom: var(--space-lg);">Linha do tempo</h2>
  {
    eventos.length === 0 ? (
      <p style="color: var(--color-text-mute);">Nenhum evento registrado ainda.</p>
    ) : (
      <div>
        {eventos.map((ev) => (
          <TimelineEvento evento={ev} declaracoes={declaracoesPorEvento.get(ev.data.id) ?? []} />
        ))}
      </div>
    )
  }
</section>
```

- [ ] **Step 3: Lint + typecheck**

```bash
pnpm lint
pnpm typecheck
```

- [ ] **Step 4: Commit**

```bash
git add src/components/candidato/TimelineEvento.astro src/components/candidato/CandidatoTimeline.astro
git commit -m "feat(candidato): adicionar TimelineEvento e CandidatoTimeline"
```

---

## Task 18: `/candidatos/[slug].astro` (perfil do candidato)

**Files:**

- Create: `src/pages/candidatos/[slug].astro`

- [ ] **Step 1: Criar página**

Conteúdo de `src/pages/candidatos/[slug].astro`:

```astro
---
import BaseLayout from "@/components/layout/BaseLayout.astro";
import SEOTags from "@/components/seo/SEOTags.astro";
import JSONLDPerson from "@/components/seo/JSONLDPerson.astro";
import CandidatoHeader from "@/components/candidato/CandidatoHeader.astro";
import CandidatoTimeline from "@/components/candidato/CandidatoTimeline.astro";
import { getAllCandidatos } from "@/lib/data/candidatos";
import { getDeclaracoesByCandidato } from "@/lib/data/declaracoes";
import { getEventosByCandidato } from "@/lib/data/eventos";
import type { Candidato } from "@/types";

export async function getStaticPaths() {
  const candidatos = await getAllCandidatos();
  return candidatos.map((candidato) => ({
    params: { slug: candidato.data.slug },
    props: { candidato },
  }));
}

interface Props {
  candidato: Candidato;
}

const { candidato } = Astro.props;
const declaracoes = await getDeclaracoesByCandidato(candidato.data.id);
const eventos = await getEventosByCandidato(candidato.data.id);
const canonical = new URL(`/candidatos/${candidato.data.slug}`, Astro.site).toString();
const description = `${candidato.data.nome} — ${candidato.data.partido}. ${declaracoes.length} declarações documentadas no Atlas.`;
---

<BaseLayout title={candidato.data.nome} description={description}>
  <SEOTags
    slot="head"
    title={`${candidato.data.nome} · Atlas dos Candidatos 2026`}
    description={description}
    canonical={canonical}
    ogImage={candidato.data.foto_url}
    ogType="website"
  />
  <JSONLDPerson slot="head" candidato={candidato} />

  <div class="container-default" style="padding-block: var(--space-xl);">
    <CandidatoHeader candidato={candidato} totalDeclaracoes={declaracoes.length} />
    <CandidatoTimeline eventos={eventos} declaracoes={declaracoes} />
  </div>
</BaseLayout>
```

- [ ] **Step 2: Build e verificar**

Run:

```bash
pnpm build
ls dist/candidatos/
grep -c '"@type":"Person"' dist/candidatos/candidato-a/index.html
grep -c "Linha do tempo" dist/candidatos/candidato-a/index.html
```

Expected:

- `dist/candidatos/candidato-a/index.html` e `dist/candidatos/candidato-b/index.html` existem
- JSON-LD Person presente
- Seção "Linha do tempo" presente

- [ ] **Step 3: Lint + typecheck**

```bash
pnpm lint
pnpm typecheck
```

- [ ] **Step 4: Commit**

```bash
git add src/pages/candidatos/\[slug\].astro
git commit -m "feat(candidato): adicionar página de perfil /candidatos/[slug] com JSON-LD"
```

---

## Task 19: `VereditosExternos.astro`

**Files:**

- Create: `src/components/declaracao/VereditosExternos.astro`

- [ ] **Step 1: Criar componente**

Conteúdo de `src/components/declaracao/VereditosExternos.astro`:

```astro
---
import type { Declaracao } from "@/types";
import { formatDate } from "@/lib/utils/format-date";

interface Props {
  vereditos: Declaracao["data"]["vereditos_externos"];
}

const { vereditos } = Astro.props;
---

{
  vereditos.length > 0 && (
    <section class="vereditos" aria-labelledby="vereditos-heading">
      <h2 id="vereditos-heading" class="vereditos__heading">
        Vereditos de fact-checkers externos
      </h2>
      <p class="vereditos__nota">
        O Atlas não emite veredito próprio. Esta seção agrega vereditos de fact-checkers
        reconhecidos com atribuição transparente.
      </p>
      <ul class="vereditos__lista">
        {vereditos.map((v) => (
          <li class="vereditos__item">
            <div class="vereditos__cabecalho">
              <span class="vereditos__veiculo">{v.veiculo}</span>
              <span class="vereditos__classificacao">{v.classificacao}</span>
              <time class="vereditos__data" datetime={v.data}>
                {formatDate(v.data)}
              </time>
            </div>
            <blockquote class="vereditos__citacao">{v.citacao_curta}</blockquote>
            <a href={v.url} rel="external noopener" target="_blank" class="vereditos__link">
              Ler verificação completa →
            </a>
          </li>
        ))}
      </ul>
    </section>
  )
}

<style>
  .vereditos {
    margin-block: var(--space-2xl);
    padding: var(--space-lg);
    border: 1px solid var(--color-hairline);
    border-radius: var(--radius-md);
    background: var(--color-canvas-soft);
  }
  .vereditos__heading {
    font-size: var(--text-display-sm);
    margin-block: 0 var(--space-xs);
  }
  .vereditos__nota {
    font-size: var(--text-body-sm);
    color: var(--color-text-mute);
    margin-block: 0 var(--space-md);
  }
  .vereditos__lista {
    list-style: none;
    padding: 0;
    margin: 0;
    display: flex;
    flex-direction: column;
    gap: var(--space-md);
  }
  .vereditos__item {
    padding: var(--space-md);
    background: var(--color-canvas);
    border: 1px solid var(--color-hairline);
    border-radius: var(--radius-sm);
  }
  .vereditos__cabecalho {
    display: flex;
    gap: var(--space-sm);
    align-items: baseline;
    flex-wrap: wrap;
    margin-bottom: var(--space-xs);
  }
  .vereditos__veiculo {
    font-weight: var(--weight-semibold);
    color: var(--color-text-primary);
  }
  .vereditos__classificacao {
    padding: var(--space-xxs) var(--space-xs);
    background: var(--color-bg-muted);
    border-radius: var(--radius-xs);
    font-size: var(--text-caption);
    color: var(--color-text-body);
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }
  .vereditos__data {
    margin-left: auto;
    font-family: var(--font-mono);
    font-size: var(--text-caption);
    color: var(--color-text-mute);
  }
  .vereditos__citacao {
    margin-block: var(--space-xs);
    padding-left: var(--space-md);
    border-left: 2px solid var(--color-hairline);
    font-size: var(--text-body-sm);
    color: var(--color-text-body);
    line-height: var(--leading-body);
  }
  .vereditos__link {
    font-size: var(--text-body-sm);
    color: var(--color-link);
  }
  .vereditos__link:hover {
    color: var(--color-link-deep);
  }
</style>
```

- [ ] **Step 2: Lint + typecheck**

```bash
pnpm lint
pnpm typecheck
```

- [ ] **Step 3: Commit**

```bash
git add src/components/declaracao/VereditosExternos.astro
git commit -m "feat(declaracao): adicionar componente VereditosExternos"
```

---

## Task 20: `ContextoAdicional.astro`

**Files:**

- Create: `src/components/declaracao/ContextoAdicional.astro`

- [ ] **Step 1: Criar componente**

Conteúdo de `src/components/declaracao/ContextoAdicional.astro`:

```astro
---
import type { Declaracao } from "@/types";
import { formatDate } from "@/lib/utils/format-date";

interface Props {
  contexto: NonNullable<Declaracao["data"]["contexto_adicional"]>;
}

const { contexto } = Astro.props;
---

<section class="contexto-adicional" aria-labelledby="contexto-adicional-heading">
  <h2 id="contexto-adicional-heading" class="contexto-adicional__heading">Contexto adicional</h2>
  <p class="contexto-adicional__nota">
    Informação editorial neutra para situar a declaração — sem juízo de valor.
  </p>
  <p class="contexto-adicional__texto">{contexto.texto}</p>

  <h3 class="contexto-adicional__fontes-heading">Fontes do contexto</h3>
  <ul class="contexto-adicional__fontes">
    {
      contexto.fontes.map((f) => (
        <li>
          <a href={f.url} rel="external noopener" target="_blank">
            <span class="contexto-adicional__fonte-tipo">{f.tipo}</span>
            <time datetime={f.data}>{formatDate(f.data)}</time>
          </a>
        </li>
      ))
    }
  </ul>
</section>

<style>
  .contexto-adicional {
    margin-block: var(--space-2xl);
    padding: var(--space-lg);
    border-left: 4px solid var(--color-hairline-strong);
    background: var(--color-canvas-soft);
  }
  .contexto-adicional__heading {
    font-size: var(--text-display-sm);
    margin-block: 0 var(--space-xs);
  }
  .contexto-adicional__nota {
    font-size: var(--text-body-sm);
    color: var(--color-text-mute);
    margin-block: 0 var(--space-md);
  }
  .contexto-adicional__texto {
    font-size: var(--text-body-md);
    line-height: var(--leading-body);
    color: var(--color-text-body);
    margin-block: 0 var(--space-md);
  }
  .contexto-adicional__fontes-heading {
    font-size: var(--text-caption);
    text-transform: uppercase;
    letter-spacing: 0.05em;
    color: var(--color-text-mute);
    margin-block: var(--space-md) var(--space-xs);
  }
  .contexto-adicional__fontes {
    list-style: none;
    padding: 0;
    margin: 0;
    display: flex;
    flex-direction: column;
    gap: var(--space-xs);
  }
  .contexto-adicional__fontes a {
    display: inline-flex;
    gap: var(--space-sm);
    align-items: baseline;
    color: var(--color-link);
    text-decoration: none;
    font-size: var(--text-body-sm);
  }
  .contexto-adicional__fontes a:hover {
    color: var(--color-link-deep);
  }
  .contexto-adicional__fonte-tipo {
    font-weight: var(--weight-medium);
  }
</style>
```

- [ ] **Step 2: Lint + typecheck**

```bash
pnpm lint
pnpm typecheck
```

- [ ] **Step 3: Commit**

```bash
git add src/components/declaracao/ContextoAdicional.astro
git commit -m "feat(declaracao): adicionar componente ContextoAdicional"
```

---

## Task 21: `DeclaracaoFull.astro` + `/declaracoes/[id].astro` (PÁGINA-CHAVE SEO)

**Por que:** essa é a página de maior valor SEO do projeto. Cada declaração tem URL estável tipo `/declaracoes/2026-04-15-candidato-a-economia-imposto`. Recebe 3 JSON-LDs (Quotation, Article, Person como spokenByCharacter no Quotation já — Person adicional opcional via inheritance), SEOTags com og:type=article, e usa todos os componentes da declaração.

**Files:**

- Create: `src/components/declaracao/DeclaracaoFull.astro`
- Create: `src/pages/declaracoes/[id].astro`

- [ ] **Step 1: Criar `DeclaracaoFull.astro`**

Conteúdo de `src/components/declaracao/DeclaracaoFull.astro`:

```astro
---
import type { Candidato, Declaracao, Evento } from "@/types";
import Tag from "@/components/shared/Tag.astro";
import VereditosExternos from "@/components/declaracao/VereditosExternos.astro";
import ContextoAdicional from "@/components/declaracao/ContextoAdicional.astro";
import { formatDate } from "@/lib/utils/format-date";

interface Props {
  declaracao: Declaracao;
  candidato: Candidato;
  evento: Evento | undefined;
}

const { declaracao, candidato, evento } = Astro.props;
const { data } = declaracao;
---

<article class="declaracao-full">
  <header class="declaracao-full__cabecalho">
    <p class="eyebrow">DECLARAÇÃO</p>
    <p class="declaracao-full__meta">
      <a href={`/candidatos/${candidato.data.slug}`} class="declaracao-full__candidato">
        {candidato.data.nome}
      </a>
      <span aria-hidden="true">·</span>
      <time datetime={data.criado_em}>{formatDate(data.criado_em)}</time>
      {
        evento && (
          <>
            <span aria-hidden="true">·</span>
            <a href={`/eventos/${evento.data.id}`}>{evento.data.titulo}</a>
          </>
        )
      }
    </p>
  </header>

  <blockquote class="declaracao-full__citacao">
    <p>"{data.texto}"</p>
    {
      data.timestamp_no_evento && (
        <cite class="declaracao-full__timestamp">{data.timestamp_no_evento}</cite>
      )
    }
  </blockquote>

  <p class="declaracao-full__contexto">{data.contexto}</p>

  <dl class="declaracao-full__tags">
    <div>
      <dt>Tema principal</dt>
      <dd><Tag>{data.tema_principal}</Tag></dd>
    </div>
    {
      data.temas_secundarios.length > 0 && (
        <div>
          <dt>Temas secundários</dt>
          <dd>
            {data.temas_secundarios.map((t) => (
              <Tag>{t}</Tag>
            ))}
          </dd>
        </div>
      )
    }
    <div>
      <dt>Tipo estrutural</dt>
      <dd>
        {data.tipo_estrutural.map((t) => <Tag variant="structural">{t}</Tag>)}
      </dd>
    </div>
  </dl>

  <section class="declaracao-full__fontes" aria-labelledby="fontes-heading">
    <h2 id="fontes-heading" class="declaracao-full__fontes-heading">Fontes</h2>
    <ul>
      <li>
        <span class="declaracao-full__fonte-tipo">Fonte primária ({data.fonte_primaria_tipo}):</span
        >
        <a href={data.fonte_primaria_url} rel="external noopener" target="_blank">
          {data.fonte_primaria_url}
        </a>
      </li>
      <li>
        <span class="declaracao-full__fonte-tipo">Arquivo permanente:</span>
        <a href={data.archive_url} rel="external noopener" target="_blank">
          {data.archive_url}
        </a>
      </li>
      {
        data.snapshot_interno_path && (
          <li>
            <span class="declaracao-full__fonte-tipo">Snapshot interno:</span>
            <code>{data.snapshot_interno_path}</code>
          </li>
        )
      }
    </ul>
  </section>

  {data.contexto_adicional && <ContextoAdicional contexto={data.contexto_adicional} />}
  <VereditosExternos vereditos={data.vereditos_externos} />
</article>

<style>
  .declaracao-full {
    max-width: var(--container-narrow);
    margin-inline: auto;
  }
  .declaracao-full__cabecalho {
    padding-block: var(--space-2xl) var(--space-md);
    border-bottom: 1px solid var(--color-hairline);
  }
  .declaracao-full__meta {
    color: var(--color-text-mute);
    font-size: var(--text-body-sm);
    display: flex;
    gap: var(--space-xs);
    flex-wrap: wrap;
    align-items: baseline;
  }
  .declaracao-full__meta a {
    color: var(--color-text-body);
    text-decoration: none;
  }
  .declaracao-full__meta a:hover {
    color: var(--color-link-deep);
    text-decoration: underline;
  }
  .declaracao-full__candidato {
    font-weight: var(--weight-medium);
  }
  .declaracao-full__citacao {
    margin-block: var(--space-xl);
    padding-left: var(--space-lg);
    border-left: 4px solid var(--color-text-primary);
  }
  .declaracao-full__citacao p {
    font-family: var(--font-mono);
    font-size: var(--text-display-md);
    line-height: var(--leading-display-md);
    color: var(--color-text-primary);
    margin: 0;
  }
  .declaracao-full__timestamp {
    display: block;
    margin-top: var(--space-sm);
    font-family: var(--font-mono);
    font-size: var(--text-caption);
    color: var(--color-text-mute);
    font-style: normal;
  }
  .declaracao-full__contexto {
    color: var(--color-text-body);
    line-height: var(--leading-body);
    margin-block: var(--space-md) var(--space-xl);
  }
  .declaracao-full__tags {
    display: flex;
    flex-direction: column;
    gap: var(--space-md);
    margin-block: var(--space-xl);
    padding-block: var(--space-md);
    border-top: 1px solid var(--color-hairline);
    border-bottom: 1px solid var(--color-hairline);
  }
  .declaracao-full__tags > div {
    display: flex;
    gap: var(--space-md);
    align-items: baseline;
    flex-wrap: wrap;
  }
  .declaracao-full__tags dt {
    font-size: var(--text-caption);
    text-transform: uppercase;
    letter-spacing: 0.05em;
    color: var(--color-text-mute);
    min-width: 140px;
    margin: 0;
  }
  .declaracao-full__tags dd {
    display: flex;
    gap: var(--space-xs);
    flex-wrap: wrap;
    margin: 0;
  }
  .declaracao-full__fontes {
    margin-block: var(--space-xl);
  }
  .declaracao-full__fontes-heading {
    font-size: var(--text-display-sm);
    margin-block: 0 var(--space-md);
  }
  .declaracao-full__fontes ul {
    list-style: none;
    padding: 0;
    margin: 0;
    display: flex;
    flex-direction: column;
    gap: var(--space-sm);
  }
  .declaracao-full__fonte-tipo {
    font-weight: var(--weight-medium);
    color: var(--color-text-body);
    margin-right: var(--space-xs);
  }
  .declaracao-full__fontes a {
    color: var(--color-link);
    word-break: break-all;
  }
  .declaracao-full__fontes a:hover {
    color: var(--color-link-deep);
  }
</style>
```

- [ ] **Step 2: Criar `/declaracoes/[id].astro`**

Conteúdo de `src/pages/declaracoes/[id].astro`:

```astro
---
import BaseLayout from "@/components/layout/BaseLayout.astro";
import SEOTags from "@/components/seo/SEOTags.astro";
import JSONLDQuotation from "@/components/seo/JSONLDQuotation.astro";
import JSONLDArticle from "@/components/seo/JSONLDArticle.astro";
import DeclaracaoFull from "@/components/declaracao/DeclaracaoFull.astro";
import { getAllDeclaracoes } from "@/lib/data/declaracoes";
import { getCandidatoById } from "@/lib/data/candidatos";
import { getEventoById } from "@/lib/data/eventos";
import type { Candidato, Declaracao, Evento } from "@/types";
import { truncate } from "@/lib/utils/truncate";

export async function getStaticPaths() {
  const declaracoes = await getAllDeclaracoes();
  const paths = await Promise.all(
    declaracoes.map(async (declaracao) => {
      const candidato = await getCandidatoById(declaracao.data.candidato_id);
      const evento = await getEventoById(declaracao.data.evento_id);
      return {
        params: { id: declaracao.data.id },
        props: { declaracao, candidato, evento },
      };
    }),
  );
  return paths;
}

interface Props {
  declaracao: Declaracao;
  candidato: Candidato | undefined;
  evento: Evento | undefined;
}

const { declaracao, candidato, evento } = Astro.props;

if (!candidato) {
  throw new Error(`Candidato não encontrado: ${declaracao.data.candidato_id}`);
}

const ogImage = new URL(`/og/${declaracao.data.id}.png`, Astro.site).toString();
const canonical = new URL(`/declaracoes/${declaracao.data.id}`, Astro.site).toString();
const title = `${candidato.data.nome}: "${truncate(declaracao.data.texto, 80)}"`;
const description = declaracao.data.contexto;
---

<BaseLayout title={title} description={description}>
  <SEOTags
    slot="head"
    title={`${title} · Atlas dos Candidatos 2026`}
    description={description}
    canonical={canonical}
    ogImage={ogImage}
    ogType="article"
    publishedTime={declaracao.data.criado_em}
    modifiedTime={declaracao.data.atualizado_em}
  />
  <JSONLDQuotation slot="head" declaracao={declaracao} candidato={candidato} />
  <JSONLDArticle slot="head" declaracao={declaracao} candidato={candidato} />

  <div class="container-default" style="padding-block: var(--space-xl);">
    <DeclaracaoFull declaracao={declaracao} candidato={candidato} evento={evento} />
  </div>
</BaseLayout>
```

- [ ] **Step 3: Build e verificar**

Run:

```bash
pnpm build
ls dist/declaracoes/
grep -c '"@type":"Quotation"' dist/declaracoes/2026-04-15-candidato-a-economia-imposto/index.html
grep -c '"@type":"Article"' dist/declaracoes/2026-04-15-candidato-a-economia-imposto/index.html
grep -c 'og:type" content="article"' dist/declaracoes/2026-04-15-candidato-a-economia-imposto/index.html
grep -c 'article:published_time' dist/declaracoes/2026-04-15-candidato-a-economia-imposto/index.html
```

Expected:

- 2 páginas de declaração geradas
- Quotation JSON-LD presente
- Article JSON-LD presente
- og:type=article presente
- article:published_time presente

- [ ] **Step 4: Lint + typecheck**

```bash
pnpm lint
pnpm typecheck
```

- [ ] **Step 5: Commit**

```bash
git add src/components/declaracao/DeclaracaoFull.astro src/pages/declaracoes/\[id\].astro
git commit -m "feat(declaracao): adicionar DeclaracaoFull e página /declaracoes/[id] com Quotation+Article JSON-LD"
```

---

## Task 22: `DeclaracaoCard.astro`

**Files:**

- Create: `src/components/declaracao/DeclaracaoCard.astro`

- [ ] **Step 1: Criar componente**

Conteúdo de `src/components/declaracao/DeclaracaoCard.astro`:

```astro
---
import type { Candidato, Declaracao } from "@/types";
import { formatDate } from "@/lib/utils/format-date";
import { truncate } from "@/lib/utils/truncate";

interface Props {
  declaracao: Declaracao;
  candidato?: Candidato;
}

const { declaracao, candidato } = Astro.props;
const { data } = declaracao;
---

<a href={`/declaracoes/${data.id}`} class="declaracao-card">
  <header class="declaracao-card__meta">
    {candidato && <span class="declaracao-card__candidato">{candidato.data.nome}</span>}
    <time datetime={data.criado_em} class="declaracao-card__data">{formatDate(data.criado_em)}</time
    >
  </header>
  <p class="declaracao-card__texto">"{truncate(data.texto, 180)}"</p>
  <footer class="declaracao-card__footer">
    <span class="declaracao-card__tema">{data.tema_principal}</span>
    {data.tipo_estrutural.map((t) => <span class="declaracao-card__tipo">{t}</span>)}
  </footer>
</a>

<style>
  .declaracao-card {
    display: flex;
    flex-direction: column;
    gap: var(--space-sm);
    padding: var(--space-lg);
    border: 1px solid var(--color-hairline);
    border-radius: var(--radius-md);
    background: var(--color-canvas);
    color: var(--color-text-primary);
    text-decoration: none;
    transition: var(--transition-base);
  }
  .declaracao-card:hover {
    border-color: var(--color-hairline-strong);
    box-shadow: var(--shadow-3-soft);
  }
  .declaracao-card__meta {
    display: flex;
    justify-content: space-between;
    align-items: baseline;
    font-size: var(--text-caption);
    color: var(--color-text-mute);
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }
  .declaracao-card__candidato {
    font-weight: var(--weight-medium);
    color: var(--color-text-body);
  }
  .declaracao-card__data {
    font-family: var(--font-mono);
  }
  .declaracao-card__texto {
    margin: 0;
    font-size: var(--text-body-md);
    line-height: var(--leading-body);
    color: var(--color-text-primary);
  }
  .declaracao-card__footer {
    display: flex;
    gap: var(--space-xs);
    flex-wrap: wrap;
    font-size: var(--text-caption);
  }
  .declaracao-card__tema,
  .declaracao-card__tipo {
    padding: var(--space-xxs) var(--space-xs);
    border-radius: var(--radius-xs);
    background: var(--color-bg-muted);
    color: var(--color-text-body);
    text-transform: lowercase;
  }
</style>
```

- [ ] **Step 2: Lint + typecheck**

```bash
pnpm lint
pnpm typecheck
```

- [ ] **Step 3: Commit**

```bash
git add src/components/declaracao/DeclaracaoCard.astro
git commit -m "feat(declaracao): adicionar componente DeclaracaoCard"
```

---

## Task 23: `/eventos/index.astro` + `/eventos/[id].astro`

**Files:**

- Create: `src/pages/eventos/index.astro`
- Create: `src/pages/eventos/[id].astro`

- [ ] **Step 1: Criar `/eventos/index.astro`**

Conteúdo de `src/pages/eventos/index.astro`:

```astro
---
import BaseLayout from "@/components/layout/BaseLayout.astro";
import SEOTags from "@/components/seo/SEOTags.astro";
import { getAllEventos } from "@/lib/data/eventos";
import { formatDate } from "@/lib/utils/format-date";

const eventos = await getAllEventos();
const canonical = new URL("/eventos", Astro.site).toString();
const description = `Lista de ${eventos.length} eventos (debates, entrevistas, sabatinas) documentados no Atlas dos Candidatos 2026.`;
---

<BaseLayout title="Eventos" description={description}>
  <SEOTags
    slot="head"
    title="Eventos · Atlas dos Candidatos 2026"
    description={description}
    canonical={canonical}
    ogType="website"
  />

  <section class="container-default" style="padding-block: var(--space-3xl);">
    <p class="eyebrow" style="margin-bottom: var(--space-sm);">EVENTOS</p>
    <h1 style="margin-bottom: var(--space-lg);">Eventos documentados</h1>
    <p style="color: var(--color-text-body); max-width: 60ch; margin-bottom: var(--space-2xl);">
      {description}
    </p>

    {
      eventos.length === 0 ? (
        <p style="color: var(--color-text-mute);">Nenhum evento registrado ainda.</p>
      ) : (
        <ul style="list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: var(--space-md);">
          {eventos.map((ev) => (
            <li>
              <a
                href={`/eventos/${ev.data.id}`}
                style="display: block; padding: var(--space-lg); border: 1px solid var(--color-hairline); border-radius: var(--radius-md); color: var(--color-text-primary); text-decoration: none; transition: var(--transition-base);"
              >
                <time
                  datetime={ev.data.data}
                  style="font-family: var(--font-mono); font-size: var(--text-caption); color: var(--color-text-mute); text-transform: uppercase;"
                >
                  {formatDate(ev.data.data)} · {ev.data.tipo}
                </time>
                <h3 style="margin-block: var(--space-xs) 0; font-size: var(--text-display-sm);">
                  {ev.data.titulo}
                </h3>
                {ev.data.local.fisico && (
                  <p style="margin: var(--space-xs) 0 0; color: var(--color-text-mute); font-size: var(--text-body-sm);">
                    {ev.data.local.fisico}
                  </p>
                )}
              </a>
            </li>
          ))}
        </ul>
      )
    }
  </section>
</BaseLayout>
```

- [ ] **Step 2: Criar `/eventos/[id].astro`**

Conteúdo de `src/pages/eventos/[id].astro`:

```astro
---
import BaseLayout from "@/components/layout/BaseLayout.astro";
import SEOTags from "@/components/seo/SEOTags.astro";
import JSONLDEvent from "@/components/seo/JSONLDEvent.astro";
import DeclaracaoCard from "@/components/declaracao/DeclaracaoCard.astro";
import { getAllEventos } from "@/lib/data/eventos";
import { getAllCandidatos, getCandidatoById } from "@/lib/data/candidatos";
import { getDeclaracoesByEvento } from "@/lib/data/declaracoes";
import { formatDate } from "@/lib/utils/format-date";
import type { Candidato, Evento } from "@/types";

export async function getStaticPaths() {
  const eventos = await getAllEventos();
  const candidatos = await getAllCandidatos();
  return eventos.map((evento) => ({
    params: { id: evento.data.id },
    props: { evento, candidatos },
  }));
}

interface Props {
  evento: Evento;
  candidatos: Candidato[];
}

const { evento, candidatos } = Astro.props;
const declaracoes = await getDeclaracoesByEvento(evento.data.id);
const candidatosPorId = new Map(candidatos.map((c) => [c.data.id, c]));

const candidatosPresentes = await Promise.all(
  evento.data.candidatos_envolvidos.map((c) => getCandidatoById(c.candidato_id)),
);
const candidatosValidos = candidatosPresentes.filter((c): c is Candidato => c !== undefined);

const canonical = new URL(`/eventos/${evento.data.id}`, Astro.site).toString();
const description = `${evento.data.titulo} — ${declaracoes.length} declarações documentadas no Atlas.`;
---

<BaseLayout title={evento.data.titulo} description={description}>
  <SEOTags
    slot="head"
    title={`${evento.data.titulo} · Atlas dos Candidatos 2026`}
    description={description}
    canonical={canonical}
    ogType="website"
  />
  <JSONLDEvent slot="head" evento={evento} candidatos={candidatosValidos} />

  <section class="container-default" style="padding-block: var(--space-xl);">
    <p class="eyebrow">EVENTO · {evento.data.tipo}</p>
    <h1 style="margin-block: var(--space-xs) var(--space-md);">{evento.data.titulo}</h1>

    <dl
      style="display: flex; gap: var(--space-xl); margin-block: var(--space-md) var(--space-xl); flex-wrap: wrap;"
    >
      <div>
        <dt
          style="font-size: var(--text-caption); text-transform: uppercase; color: var(--color-text-mute); letter-spacing: 0.05em;"
        >
          Data
        </dt>
        <dd style="margin: var(--space-xxs) 0 0; font-family: var(--font-mono);">
          <time datetime={evento.data.data}>{formatDate(evento.data.data)}</time>
        </dd>
      </div>
      {
        evento.data.local.fisico && (
          <div>
            <dt style="font-size: var(--text-caption); text-transform: uppercase; color: var(--color-text-mute); letter-spacing: 0.05em;">
              Local
            </dt>
            <dd style="margin: var(--space-xxs) 0 0;">{evento.data.local.fisico}</dd>
          </div>
        )
      }
      {
        evento.data.duracao_minutos && (
          <div>
            <dt style="font-size: var(--text-caption); text-transform: uppercase; color: var(--color-text-mute); letter-spacing: 0.05em;">
              Duração
            </dt>
            <dd style="margin: var(--space-xxs) 0 0;">{evento.data.duracao_minutos} minutos</dd>
          </div>
        )
      }
    </dl>

    <p style="color: var(--color-text-body); max-width: 70ch; line-height: var(--leading-body);">
      {evento.data.descricao}
    </p>

    <h2 style="margin-block: var(--space-2xl) var(--space-lg);">Declarações deste evento</h2>
    {
      declaracoes.length === 0 ? (
        <p style="color: var(--color-text-mute);">Nenhuma declaração documentada ainda.</p>
      ) : (
        <div style="display: flex; flex-direction: column; gap: var(--space-md);">
          {declaracoes.map((d) => (
            <DeclaracaoCard declaracao={d} candidato={candidatosPorId.get(d.data.candidato_id)} />
          ))}
        </div>
      )
    }
  </section>
</BaseLayout>
```

- [ ] **Step 3: Build e verificar**

Run:

```bash
pnpm build
ls dist/eventos/
grep -c '"@type":"Event"' dist/eventos/2026-04-15-debate-rede-tv/index.html
```

Expected: pasta `/eventos/index/` + `/eventos/2026-04-15-debate-rede-tv/`. JSON-LD Event presente.

- [ ] **Step 4: Lint + typecheck**

```bash
pnpm lint
pnpm typecheck
```

- [ ] **Step 5: Commit**

```bash
git add src/pages/eventos/
git commit -m "feat(evento): adicionar /eventos e /eventos/[id] com JSON-LD Event"
```

---

## Task 24: `/temas/index.astro` + `/temas/[slug].astro`

**Files:**

- Create: `src/pages/temas/index.astro`
- Create: `src/pages/temas/[slug].astro`

- [ ] **Step 1: Criar `/temas/index.astro`**

Conteúdo de `src/pages/temas/index.astro`:

```astro
---
import BaseLayout from "@/components/layout/BaseLayout.astro";
import SEOTags from "@/components/seo/SEOTags.astro";
import { getCollection } from "astro:content";

const temas = await getCollection("temas");
const temasOrdenados = temas.sort((a, b) => a.data.nome.localeCompare(b.data.nome, "pt-BR"));
const canonical = new URL("/temas", Astro.site).toString();
const description = `Taxonomia de ${temas.length} temas que organizam as declarações no Atlas dos Candidatos 2026.`;
---

<BaseLayout title="Temas" description={description}>
  <SEOTags
    slot="head"
    title="Temas · Atlas dos Candidatos 2026"
    description={description}
    canonical={canonical}
    ogType="website"
  />

  <section class="container-default" style="padding-block: var(--space-3xl);">
    <p class="eyebrow" style="margin-bottom: var(--space-sm);">TEMAS</p>
    <h1 style="margin-bottom: var(--space-lg);">Temas documentados</h1>
    <p style="color: var(--color-text-body); max-width: 60ch; margin-bottom: var(--space-2xl);">
      {description}
    </p>

    <div
      style="display: grid; gap: var(--space-md); grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));"
    >
      {
        temasOrdenados.map((tema) => (
          <a
            href={`/temas/${tema.data.slug}`}
            style="display: block; padding: var(--space-lg); border: 1px solid var(--color-hairline); border-radius: var(--radius-md); color: var(--color-text-primary); text-decoration: none; transition: var(--transition-base);"
          >
            <h3 style="margin-block: 0 var(--space-xs); font-size: var(--text-display-sm);">
              {tema.data.nome}
            </h3>
            <p style="margin: 0; color: var(--color-text-body); font-size: var(--text-body-sm); line-height: var(--leading-body);">
              {tema.data.descricao_curta}
            </p>
          </a>
        ))
      }
    </div>
  </section>
</BaseLayout>
```

- [ ] **Step 2: Criar `/temas/[slug].astro`**

Conteúdo de `src/pages/temas/[slug].astro`:

```astro
---
import BaseLayout from "@/components/layout/BaseLayout.astro";
import SEOTags from "@/components/seo/SEOTags.astro";
import DeclaracaoCard from "@/components/declaracao/DeclaracaoCard.astro";
import { getCollection } from "astro:content";
import { getDeclaracoesByTema } from "@/lib/data/declaracoes";
import { getAllCandidatos } from "@/lib/data/candidatos";
import type { Candidato, Tema } from "@/types";

export async function getStaticPaths() {
  const temas = await getCollection("temas");
  return temas.map((tema) => ({
    params: { slug: tema.data.slug },
    props: { tema },
  }));
}

interface Props {
  tema: Tema;
}

const { tema } = Astro.props;
const declaracoes = await getDeclaracoesByTema(tema.data.slug);
const candidatos = await getAllCandidatos();
const candidatosPorId = new Map(candidatos.map((c: Candidato) => [c.data.id, c]));
const canonical = new URL(`/temas/${tema.data.slug}`, Astro.site).toString();
const description = `${tema.data.nome} — ${declaracoes.length} declarações documentadas no Atlas. ${tema.data.descricao_curta}`;
---

<BaseLayout title={tema.data.nome} description={description}>
  <SEOTags
    slot="head"
    title={`${tema.data.nome} · Atlas dos Candidatos 2026`}
    description={description}
    canonical={canonical}
    ogType="website"
  />

  <section class="container-default" style="padding-block: var(--space-xl);">
    <p class="eyebrow">TEMA</p>
    <h1 style="margin-block: var(--space-xs);">{tema.data.nome}</h1>
    <p
      style="color: var(--color-text-body); max-width: 70ch; line-height: var(--leading-body); margin-block: var(--space-md) var(--space-2xl);"
    >
      {tema.data.descricao_curta}
    </p>

    <h2 style="margin-bottom: var(--space-lg);">
      Declarações sobre {tema.data.nome.toLowerCase()}
    </h2>
    {
      declaracoes.length === 0 ? (
        <p style="color: var(--color-text-mute);">
          Nenhuma declaração registrada ainda neste tema.
        </p>
      ) : (
        <div style="display: flex; flex-direction: column; gap: var(--space-md);">
          {declaracoes.map((d) => (
            <DeclaracaoCard declaracao={d} candidato={candidatosPorId.get(d.data.candidato_id)} />
          ))}
        </div>
      )
    }
  </section>
</BaseLayout>
```

- [ ] **Step 3: Build e verificar**

Run:

```bash
pnpm build
ls dist/temas/
```

Expected: `dist/temas/index.html` + 6 subpastas (uma por tema).

- [ ] **Step 4: Lint + typecheck**

```bash
pnpm lint
pnpm typecheck
```

- [ ] **Step 5: Commit**

```bash
git add src/pages/temas/
git commit -m "feat(tema): adicionar /temas e /temas/[slug] com declarações relacionadas"
```

---

## Task 25: `/buscar.astro` (monta PagefindSearch)

**Files:**

- Create: `src/pages/buscar.astro`

- [ ] **Step 1: Criar página**

Conteúdo de `src/pages/buscar.astro`:

```astro
---
import BaseLayout from "@/components/layout/BaseLayout.astro";
import SEOTags from "@/components/seo/SEOTags.astro";
import PagefindSearch from "@/components/search/PagefindSearch.astro";

const canonical = new URL("/buscar", Astro.site).toString();
const description =
  "Busca textual em declarações, candidatos e eventos do Atlas dos Candidatos 2026.";
---

<BaseLayout title="Buscar" description={description} noindex={true}>
  <SEOTags
    slot="head"
    title="Buscar · Atlas dos Candidatos 2026"
    description={description}
    canonical={canonical}
    ogType="website"
  />

  <section class="container-default" style="padding-block: var(--space-3xl);">
    <p class="eyebrow" style="margin-bottom: var(--space-sm);">BUSCAR</p>
    <h1 style="margin-bottom: var(--space-lg);">Buscar no Atlas</h1>
    <p style="color: var(--color-text-body); max-width: 60ch; margin-bottom: var(--space-2xl);">
      A busca opera totalmente no seu navegador. Nenhum dado é enviado a servidores externos.
    </p>

    <PagefindSearch />
  </section>
</BaseLayout>
```

`noindex={true}` porque `/buscar` é interface, não conteúdo (sitemap exclui via filtro do Task 9).

- [ ] **Step 2: Build:full e verificar**

Run:

```bash
pnpm build:full
ls dist/buscar/
ls dist/pagefind/
```

Expected:

- `dist/buscar/index.html` existe
- `dist/pagefind/` contém os assets (gerados pelo step `build:index`)

- [ ] **Step 3: Lint + typecheck**

```bash
pnpm lint
pnpm typecheck
```

- [ ] **Step 4: Commit**

```bash
git add src/pages/buscar.astro
git commit -m "feat(busca): adicionar página /buscar com PagefindSearch"
```

---

## Task 26: `/dataset.astro` (descritivo + JSON-LD Dataset)

**Files:**

- Create: `src/pages/dataset.astro`

- [ ] **Step 1: Criar página**

Conteúdo de `src/pages/dataset.astro`:

```astro
---
import BaseLayout from "@/components/layout/BaseLayout.astro";
import SEOTags from "@/components/seo/SEOTags.astro";
import JSONLDDataset from "@/components/seo/JSONLDDataset.astro";
import { getAllDeclaracoes } from "@/lib/data/declaracoes";

const declaracoes = await getAllDeclaracoes();
const totalDeclaracoes = declaracoes.length;

const datasetVersion = "0.1.0-demo";
const siteUrl = Astro.site?.toString().replace(/\/$/, "") ?? "https://atlas-2026.pages.dev";

const downloads = [
  {
    format: "application/x-ndjson",
    url: `${siteUrl}/dataset/declaracoes.jsonl`,
    label: "Declarações (JSON Lines)",
  },
  {
    format: "text/csv",
    url: `${siteUrl}/dataset/declaracoes.csv`,
    label: "Declarações (CSV)",
  },
];

const datasetMeta = {
  version: datasetVersion,
  downloads: downloads.map(({ format, url }) => ({ format, url })),
  totalDeclaracoes,
};

const canonical = new URL("/dataset", Astro.site).toString();
const description = `Dataset aberto de ${totalDeclaracoes} declarações documentadas no Atlas. Formatos JSONL e CSV. Licença CC-BY 4.0.`;
---

<BaseLayout title="Dataset" description={description}>
  <SEOTags
    slot="head"
    title="Dataset · Atlas dos Candidatos 2026"
    description={description}
    canonical={canonical}
    ogType="website"
  />
  <JSONLDDataset slot="head" meta={datasetMeta} />

  <section class="container-narrow" style="padding-block: var(--space-3xl);">
    <p class="eyebrow" style="margin-bottom: var(--space-sm);">DATASET</p>
    <h1 style="margin-bottom: var(--space-lg);">Atlas dos Candidatos 2026 — Dataset</h1>
    <p
      style="color: var(--color-text-body); line-height: var(--leading-body); margin-bottom: var(--space-xl);"
    >
      {description}
    </p>

    <h2 style="margin-block: var(--space-xl) var(--space-md);">Downloads</h2>
    <ul
      style="list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: var(--space-md);"
    >
      {
        downloads.map((d) => (
          <li>
            <a
              href={d.url}
              style="display: flex; justify-content: space-between; align-items: baseline; padding: var(--space-md) var(--space-lg); border: 1px solid var(--color-hairline); border-radius: var(--radius-md); color: var(--color-text-primary); text-decoration: none;"
            >
              <span style="font-weight: var(--weight-medium);">{d.label}</span>
              <span style="font-family: var(--font-mono); font-size: var(--text-caption); color: var(--color-text-mute);">
                {d.format}
              </span>
            </a>
          </li>
        ))
      }
    </ul>

    <h2 style="margin-block: var(--space-xl) var(--space-md);">Licença</h2>
    <p style="color: var(--color-text-body); line-height: var(--leading-body);">
      Dataset distribuído sob licença
      <a
        href="https://creativecommons.org/licenses/by/4.0/"
        rel="external noopener"
        target="_blank"
      >
        Creative Commons Attribution 4.0 International (CC-BY 4.0)
      </a>. Você pode usar, redistribuir e adaptar, desde que atribua a fonte como "Atlas dos
      Candidatos 2026 — atlas-2026.pages.dev".
    </p>

    <h2 style="margin-block: var(--space-xl) var(--space-md);">Esquema</h2>
    <p style="color: var(--color-text-body); line-height: var(--leading-body);">
      Cada registro de declaração tem o esquema documentado em
      <a
        href="https://github.com/dezobq/atlas-2026/blob/main/dist-dataset/SCHEMA.md"
        rel="external noopener"
        target="_blank"
      >
        SCHEMA.md
      </a>. Para gerar os arquivos localmente, rode <code>pnpm export:dataset</code>.
    </p>

    <h2 style="margin-block: var(--space-xl) var(--space-md);">Versão e citação</h2>
    <p style="color: var(--color-text-body); line-height: var(--leading-body);">
      Versão atual: <code>{datasetVersion}</code>. Total de declarações: <strong
        >{totalDeclaracoes}</strong
      >. Cite como: "Atlas dos Candidatos 2026 — Dataset v{datasetVersion}, acessado em {
        new Date().toISOString().slice(0, 10)
      }."
    </p>
  </section>
</BaseLayout>
```

- [ ] **Step 2: Build e verificar**

Run:

```bash
pnpm build
ls dist/dataset/
grep -c '"@type":"Dataset"' dist/dataset/index.html
grep -c 'creativecommons.org/licenses/by/4.0' dist/dataset/index.html
```

Expected:

- `dist/dataset/index.html` existe
- JSON-LD Dataset presente
- Link CC-BY 4.0 presente

- [ ] **Step 3: Lint + typecheck**

```bash
pnpm lint
pnpm typecheck
```

- [ ] **Step 4: Commit**

```bash
git add src/pages/dataset.astro
git commit -m "feat(dataset): adicionar página /dataset com JSON-LD Dataset e descrição de licença"
```

---

# SPRINT 4.4 — Validação Final + PR Merge (Tasks 27–29)

Objetivo: validar localmente que tudo funciona, abrir PR, esperar CI verde, fazer squash merge.

---

## Task 27: Validação local completa

**Files:** N/A (apenas comandos).

- [ ] **Step 1: Limpar e reinstalar deps do zero**

Run:

```bash
rm -rf node_modules dist .pagefind
pnpm install --frozen-lockfile
```

Expected: install verde, sem warnings de peer deps inesperados.

- [ ] **Step 2: Rodar bateria completa de validações**

Run (em sequência):

```bash
pnpm format:check
pnpm lint
pnpm typecheck
pnpm validate-data
pnpm test
pnpm build:full
```

Expected:

- `format:check`: 0 arquivos a formatar
- `lint`: 0 warnings
- `typecheck`: 0 errors, 0 warnings, 0 hints
- `validate-data`: 6 temas + 2 candidatos + 1 evento + 2 declarações validados
- `test`: todos passing (estimado ~100 tests)
- `build:full`: gera todos os arquivos esperados

- [ ] **Step 3: Verificar estrutura final do `dist/`**

Run:

```bash
ls dist/
ls dist/candidatos/
ls dist/declaracoes/
ls dist/eventos/
ls dist/temas/
ls dist/pagefind/ | head -5
cat dist/robots.txt | head -3
ls dist/sitemap*.xml
```

Expected:

- `dist/` contém: `index.html`, `404.html`, `robots.txt`, `humans.txt`, `favicon.svg`, `_assets/`, `og/`, `pagefind/`, `sitemap-index.xml`, `sitemap-0.xml`, e subpastas `candidatos/`, `declaracoes/`, `eventos/`, `temas/`, `buscar/`, `dataset/`
- `dist/candidatos/`: `index.html`, `candidato-a/`, `candidato-b/`
- `dist/declaracoes/`: `2026-04-15-candidato-a-economia-imposto/`, `2026-04-15-candidato-b-saude-sus/`
- `dist/eventos/`: `index/`, `2026-04-15-debate-rede-tv/`
- `dist/temas/`: `index/` + 6 subpastas (uma por tema)
- `dist/pagefind/`: contém `pagefind.js`, `pagefind-ui.js`, `pagefind-ui.css`, `index.json`, `fragment/`

- [ ] **Step 4: Validar JSON-LD em uma amostra de páginas críticas**

Run:

```bash
echo "--- /candidatos/candidato-a ---"
grep -o '"@type":"[^"]*"' dist/candidatos/candidato-a/index.html | sort -u
echo "--- /declaracoes/2026-04-15-candidato-a-economia-imposto ---"
grep -o '"@type":"[^"]*"' dist/declaracoes/2026-04-15-candidato-a-economia-imposto/index.html | sort -u
echo "--- /eventos/2026-04-15-debate-rede-tv ---"
grep -o '"@type":"[^"]*"' dist/eventos/2026-04-15-debate-rede-tv/index.html | sort -u
echo "--- /dataset ---"
grep -o '"@type":"[^"]*"' dist/dataset/index.html | sort -u
```

Expected output (aproximado):

- `/candidatos/candidato-a`: `"@type":"Person"` e `"@type":"PoliticalParty"`
- `/declaracoes/...`: `"@type":"Quotation"`, `"@type":"Article"`, `"@type":"Person"`, `"@type":"Organization"`, `"@type":"WebPage"`
- `/eventos/...`: `"@type":"Event"`, `"@type":"Person"`, `"@type":"Place"`
- `/dataset`: `"@type":"Dataset"`, `"@type":"DataDownload"`, `"@type":"Organization"`

- [ ] **Step 5: Validar OG e Twitter Cards numa página de declaração**

Run:

```bash
grep -E 'og:title|og:description|og:url|og:type|twitter:card|article:published_time' \
  dist/declaracoes/2026-04-15-candidato-a-economia-imposto/index.html | sort -u
```

Expected: pelo menos 6 meta tags distintas (og:title, og:description, og:url, og:type, twitter:card, article:published_time).

- [ ] **Step 6: Validar sitemap não inclui /404 nem /buscar**

Run:

```bash
grep -c '/buscar' dist/sitemap-0.xml
grep -c '/404' dist/sitemap-0.xml
grep -c '/declaracoes/' dist/sitemap-0.xml
```

Expected:

- `/buscar` count = 0
- `/404` count = 0
- `/declaracoes/` count >= 2 (uma por declaração)

- [ ] **Step 7: Validar Pagefind localmente (manual smoke test)**

Run:

```bash
pnpm preview
```

Abrir `http://localhost:4321/buscar` no navegador. Digitar uma palavra ("imposto", "SUS", "candidato"). Verificar:

- A caixa de busca aparece
- Resultados aparecem ao digitar
- Clicar em resultado leva a `/declaracoes/.../`

Esse é o único teste manual do plano. Não é bloqueante para o commit; é confirmação visual.

- [ ] **Step 8: Commit consolidado se houver alterações pendentes**

Se `git status --short` não retornar vazio (improvável), criar um commit final:

```bash
git status --short
git diff
```

Se houver mudanças não commitadas, identificar a causa e commitar com mensagem apropriada.

---

## Task 28: Push da branch + abrir PR

**Files:** N/A (apenas git/gh).

- [ ] **Step 1: Push da branch**

Run:

```bash
git push -u origin feat/fase3-seo-paginas
```

Expected: branch publicada no GitHub.

- [ ] **Step 2: Abrir PR via `gh`**

Run:

```bash
gh pr create --title "feat(fase3): SEO + páginas + JSON-LD" --body "$(cat <<'EOF'
## Resumo

Sprint 4 do roadmap — entrega a camada SEO-first do Atlas e todas as 9 páginas + 8 componentes compartilhados previstos no spec. Após este merge o site está pronto para receber conteúdo MVP real (Sprint 5).

## O que mudou

### Sprint 4.1 — Foundation
- `schema-dts` adicionado para tipagem JSON-LD type-safe
- 5 builders puros tipados em `src/lib/seo/` (Person, Quotation, Event, Article, Dataset)
- 5 componentes Astro em `src/components/seo/` (`JSONLDPerson`, `JSONLDQuotation`, `JSONLDEvent`, `JSONLDArticle`, `JSONLDDataset`)
- `SEOTags.astro` (Open Graph + Twitter Cards + article:published_time)
- `BaseLayout.astro` recebeu `<slot name="head" />` para injeção por página
- Helper `safeJsonLd` que escapa `< > & '`

### Sprint 4.2 — Sitemap + robots + Pagefind
- `@astrojs/sitemap` com filtros (`serialize`): exclui `/404` e `/buscar`, prioridade 0.9 para declarações
- `public/robots.txt` permissivo, inclusive AI bots (GPTBot, ClaudeBot, etc.)
- `pagefind` + `@pagefind/default-ui` integrados via `pnpm build:full`
- CI atualizado para rodar `pnpm build:full`
- `PagefindSearch.astro` com tradução pt-BR e CSS override usando tokens

### Sprint 4.3 — Páginas + componentes
- 9 rotas: `/candidatos`, `/candidatos/[slug]`, `/declaracoes/[id]` (página-chave SEO), `/eventos`, `/eventos/[id]`, `/temas`, `/temas/[slug]`, `/buscar`, `/dataset`
- 8 componentes: `DeclaracaoFull`, `DeclaracaoCard`, `VereditosExternos`, `ContextoAdicional`, `CandidatoCard`, `CandidatoHeader`, `CandidatoTimeline`, `TimelineEvento`
- 5 fixtures demonstrativos (2 candidatos + 1 evento + 2 declarações)

## Validação

- `pnpm format:check`: clean
- `pnpm lint --max-warnings=0`: 0 warnings
- `pnpm typecheck`: 0 errors, 0 hints
- `pnpm validate-data`: todos os fixtures validados
- `pnpm test`: ~100 tests passing
- `pnpm build:full`: build estática + índice Pagefind gerados

## Plano de teste manual

- [ ] CI verde (lint + typecheck + test + build + validate-data)
- [ ] Visitar `/candidatos`, `/candidatos/candidato-a`, `/declaracoes/2026-04-15-candidato-a-economia-imposto`
- [ ] Verificar JSON-LD em `view-source:` da declaração via Google Rich Results Test
- [ ] `/buscar`: digitar palavra e ver resultados
- [ ] `/dataset`: ver descritivo e JSON-LD Dataset
- [ ] `/sitemap-index.xml` lista URLs corretas
- [ ] `/robots.txt` permissivo com Sitemap reference

## Decisões registradas

5 decisões pelo André travadas antes do plan (sitemap oficial, Pagefind UI oficial, JSON-LD em componentes Astro, issues #3-#6 fora de escopo, manter atlas-2026.pages.dev). Detalhes no plano: `docs/superpowers/plans/2026-05-27-atlas-fase3-seo-paginas.md`.

## Follow-ups (não bloqueantes)

- Issues #3, #4, #5, #6 — fixes no pipeline de ingestão como PRs dedicados
- Sprint 5: conteúdo MVP (declarações reais), substituir fixtures demonstrativos
- Sprint 6: polimento + soft launch
EOF
)"
```

Expected: PR aberto. Saída do comando inclui URL `https://github.com/dezobq/atlas-2026/pull/N`.

- [ ] **Step 3: Confirmar PR via `gh pr view`**

Run:

```bash
gh pr view --json number,title,state,url
```

Expected: PR no estado `OPEN` com título correto.

---

## Task 29: Aguardar CI verde e fazer squash merge

**Files:** N/A.

- [ ] **Step 1: Acompanhar CI**

Run:

```bash
gh pr checks --watch
```

Expected: todas as checks passam — `format:check`, `lint`, `typecheck`, `validate-data`, `test`, `build:full`.

Se alguma falhar:

- Investigar a causa via `gh run view <run-id> --log`
- Corrigir localmente, commit, push, voltar ao Step 1
- Mais comum: diferenças de formatação Windows vs Ubuntu (mitigado por `.gitattributes` mas atentar)

- [ ] **Step 2: Squash merge**

Run:

```bash
gh pr merge --squash --delete-branch --subject "feat(fase3): SEO + páginas + JSON-LD"
```

Expected:

- PR mergeado em `main` via squash
- Branch remote `feat/fase3-seo-paginas` deletada
- Branch local ainda existe (worktree)

- [ ] **Step 3: Cleanup local**

Sair da worktree (cd para o repo principal) e remover:

```bash
cd C:/Users/dezob/Projects/atlas
git checkout main
git pull origin main
git log --oneline -3
git worktree list
git worktree remove ../atlas-fase3
git branch -d feat/fase3-seo-paginas
```

Expected:

- `main` agora aponta para o novo squash commit
- `git log` mostra o novo commit como HEAD
- Worktree removida
- Branch local deletada

- [ ] **Step 4: Atualizar checkpoint na memória do Claude Code**

Atualizar `~/.claude/projects/C--Users-dezob-Projects-atlas/memory/checkpoint-fase2-completa.md` (ou criar `checkpoint-fase3-completa.md` novo) com:

- Data e SHA do novo merge
- Lista do que foi entregue
- Próximo passo: Sprint 5 (Conteúdo MVP)
- Issues #3-#6 ainda pendentes (links)

Atualizar `MEMORY.md` para apontar para o novo checkpoint.

- [ ] **Step 5: Confirmar tudo verde**

Run:

```bash
git status
pnpm test
pnpm build:full
```

Expected: working tree limpo; testes passing; build verde.

---

## Resumo executivo do plano

| Sprint | Tasks | Foco                                           | Pausa após |
| ------ | ----- | ---------------------------------------------- | ---------- |
| 4.1    | 1–8   | SEO Foundation (helpers + 5 JSON-LD + SEOTags) | ✓ Sim      |
| 4.2    | 9–12  | Sitemap + robots + Pagefind                    | ✓ Sim      |
| 4.3    | 13–26 | 9 páginas + 8 componentes + fixtures           | —          |
| 4.4    | 27–29 | Validação final + PR + merge                   | —          |

**Total: 29 tasks, ~3 sprints com pausas para revisão humana entre 4.1↔4.2 e 4.2↔4.3.**

---

## Apêndice A — Comandos úteis durante execução

```bash
# Rodar 1 arquivo de teste específico
pnpm test -- tests/unit/seo/build-person.test.ts

# Watch tests
pnpm test:watch

# Inspect HTML resultante de build
ls -R dist/ | head -50

# Procurar todos JSON-LDs no HTML resultante
grep -r 'application/ld+json' dist/ -l

# Preview local com pagefind
pnpm build:full && pnpm preview
# http://localhost:4321

# Verificar tamanho do output
du -sh dist/
```

## Apêndice B — Glossário de schemas Schema.org usados

| Schema         | Aplicação                              | Build function                                        | Fonte oficial                     |
| -------------- | -------------------------------------- | ----------------------------------------------------- | --------------------------------- |
| Person         | Candidato                              | `buildPersonSchema`                                   | https://schema.org/Person         |
| Quotation      | Declaração                             | `buildQuotationSchema`                                | https://schema.org/Quotation      |
| Event          | Debate/Entrevista/Sabatina             | `buildEventSchema`                                    | https://schema.org/Event          |
| Article        | Wrapper de página de declaração        | `buildArticleSchema`                                  | https://schema.org/Article        |
| Dataset        | Página `/dataset`                      | `buildDatasetSchema`                                  | https://schema.org/Dataset        |
| PoliticalParty | Subobjeto em Person.memberOf           | inline em `buildPersonSchema`                         | https://schema.org/PoliticalParty |
| Organization   | Author em Article + creator em Dataset | inline em `buildArticleSchema` e `buildDatasetSchema` | https://schema.org/Organization   |
| Place          | Localização do Event                   | inline em `buildEventSchema`                          | https://schema.org/Place          |
| DataDownload   | Cada distribuição em Dataset           | inline em `buildDatasetSchema`                        | https://schema.org/DataDownload   |
| WebPage        | mainEntityOfPage em Article            | inline em `buildArticleSchema`                        | https://schema.org/WebPage        |

## Apêndice C — Fontes Context7 citadas

- **@astrojs/sitemap** — `/withastro/docs` — patterns `sitemap({ serialize, filter, customPages })`, `ChangeFreqEnum`. Fonte: `https://github.com/withastro/docs/blob/main/src/content/docs/en/guides/integrations-guide/sitemap.mdx`
- **Pagefind + default-ui** — `/cloudcannon/pagefind` — patterns `<link>/<script>` + `new PagefindUI({...})` em DOMContentLoaded, flag `--force-language pt`. Fontes: `https://github.com/cloudcannon/pagefind/blob/main/docs/content/docs/ui-usage.md` e `https://github.com/cloudcannon/pagefind/blob/main/pagefind_ui/default/README.md`
- **schema-dts** — `/google/schema-dts` — patterns `WithContext<T>`, helper `safeJsonLd` que escapa `< > & '`. Fonte: `https://github.com/google/schema-dts/blob/main/packages/schema-dts/README.md`

## Apêndice D — Constraints permanentes herdadas (referência rápida)

1. `src/content/config.ts` mantém Zod 3 (`astro:content` re-exporta Zod 3 internamente)
2. Scripts standalone usam Zod 4 nativo
3. Todo script CLI usa `pathToFileURL(process.argv[1] ?? "").href` para `isMain`
4. `vitest.config.ts` já tem alias `astro:content` → `tests/__mocks__/astro-content.ts`
5. `.gitattributes` já força `eol=lf`
6. CI Ubuntu vs Windows local — sempre rodar suite completa localmente antes de push
7. Conventional Commits PT-BR
8. Português brasileiro com acentos preservados
9. Path alias único: `@/*` → `src/*`
10. pnpm v10 local, v9 CI — `--frozen-lockfile` sempre
