# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

> **Escopo:** este arquivo complementa o `~/.claude/CLAUDE.md` global — não duplica regras genéricas (TDD, brainstorming, Vault, Context7, Conventional Commits PT-BR, acentos preservados). Foca no que é único do Atlas.

---

## Projeto

**Atlas dos Candidatos · 2026** — base pública, aberta e indexável de declarações documentais de candidatos à presidência do Brasil em 2026. Cada declaração tem fonte primária verificável (vídeo timestamped, transcrição oficial, link arquivado).

**Postura editorial:** tecnicista neutro radical, sem rosto, sem veredito próprio. Quando há veredito de fact-checker reconhecido (Lupa, Aos Fatos, Comprova), agregamos com atribuição transparente. **Nunca emitimos juízo de veracidade.** Ver [[decisoes-core-atlas]] e seção 8 do spec `docs/superpowers/specs/2026-05-27-atlas-design.md`.

**Licenças:** código MIT · dataset CC-BY 4.0 · conteúdo editorial CC-BY 4.0.

---

## Comandos

### Desenvolvimento

```bash
pnpm dev              # http://localhost:4321
pnpm build            # build estático (Astro 5)
pnpm build:full       # build + índice Pagefind (após Sprint 4.2)
pnpm preview          # serve dist/ localmente
pnpm typecheck        # astro check (TypeScript estrito)
pnpm lint             # eslint --max-warnings=0
pnpm lint:fix
pnpm format           # prettier --write
pnpm format:check
```

### Testes

```bash
pnpm test                                          # vitest run --passWithNoTests
pnpm test:watch                                    # modo watch
pnpm test -- tests/unit/seo/build-person.test.ts   # 1 arquivo só
```

### Dados

```bash
pnpm validate-data       # Ajv contra JSON Schemas em data/schemas/
pnpm generate-schemas    # regenera JSON Schemas a partir do Zod em src/content/config.ts
pnpm export:dataset      # gera dist-dataset/*.{jsonl,csv} + SCHEMA.md
```

### Pipeline de ingestão (semi-automatizado)

```bash
pnpm scrape:youtube <url>     # yt-dlp: metadata JSON + áudio MP3 em .cache/youtube/
pnpm transcribe <audio.mp3>   # Whisper API (pt-BR) → .cache/transcripts/
pnpm archive <url>            # Wayback Save Page Now → .cache/archive/
pnpm scrape:url <url>         # Firecrawl markdown + screenshot → .cache/scrape/
pnpm generate:og              # Satori → public/og/<id>.png por declaração
```

Workflow operacional detalhado em `scripts/README.md` (3 níveis: YouTube oficial · mídia consolidada · rede social). Credenciais necessárias em `.env` (template em `.env.example`): `OPENAI_API_KEY`, `FIRECRAWL_API_KEY`.

---

## Arquitetura

### Visão de alto nível

Site **estático** (Astro 5 `output: "static"`) com dados em **markdown + YAML versionados em git**. Sem banco, sem servidor, sem CMS. Build produz HTML + JSON-LD + sitemap; Pagefind indexa `dist/` client-side; Cloudflare Pages hospeda em `atlas-2026.pages.dev`.

```
data/*.{yaml,md}  →  astro:content (Zod 3)  →  páginas .astro  →  dist/ (HTML+JSON-LD)
       ↓                                              ↓
scripts/pipeline/                              Pagefind index
       ↓
dist-dataset/*.{jsonl,csv}  →  GitHub Releases (CC-BY 4.0)
```

### Content Collections

4 coleções definidas em `src/content/config.ts`, todas com schema Zod estrito:

| Collection | Arquivos | Loader | Relação |
|------------|----------|--------|---------|
| `candidatos` | `data/candidatos/*.yaml` | glob YAML | — |
| `temas` | `data/temas/*.yaml` | glob YAML | taxonomia (primário ↔ secundário) |
| `eventos` | `data/eventos/*.yaml` | glob YAML | many-to-many com candidatos via `candidatos_envolvidos[]` |
| `declaracoes` | `data/declaracoes/*.md` | glob MD | `candidato_id` + `evento_id` + `tema_principal` + `temas_secundarios[]` |

**Acesso por loader puro** em `src/lib/data/`: `getAllCandidatos()`, `getDeclaracoesByTema(slug)`, `getEventosByCandidato(id)`, etc. Páginas `.astro` consomem esses helpers; nunca chamam `getCollection` direto.

### Pipeline de scripts (`scripts/`)

Scripts CLI standalone (Node 22 nativo + `tsx`), cada um com responsabilidade única. Compartilham infra em `scripts/lib/` (`env.ts` valida `.env`, `paths.ts` constantes, `logger.ts` saída padronizada). **Idempotentes**: cache em `.cache/<categoria>/<hash>.*` — re-execução pula trabalho já feito.

### SEO (estrutura)

- **Funções puras** em `src/lib/seo/` (`build-person.ts`, `build-quotation.ts`, etc.) constroem `WithContext<T>` de `schema-dts`. Tipos-safe, testáveis em isolado.
- **Componentes thin-wrapper** em `src/components/seo/` (`JSONLDPerson.astro`, etc.) chamam build + `safeJsonLd` + renderizam `<script type="application/ld+json" is:inline set:html={json} />`.
- **`SEOTags.astro`** = Open Graph + Twitter Cards + `article:published_time`.
- **Injeção por página** via `<slot name="head" />` em `BaseLayout.astro`.

### Validação dupla

1. **Build-time**: Zod no `astro:content` (falha o build se schema inválido).
2. **CI separado**: `pnpm validate-data` usa Ajv contra JSON Schemas em `data/schemas/` (regenerados via `pnpm generate-schemas` a partir do Zod). Sinaliza inconsistência entre fonte da verdade (Zod) e contrato externo (JSON Schema).

---

## Constraints permanentes

Estas constraints foram descobertas via incidentes nas Fases 1-2. **Documentadas como memórias [[bugs-do-plano-fase1]] e [[astro-content-zod3]]:**

1. **`src/content/config.ts` mantém sintaxe Zod 3** (`.url()`, `.datetime()`). Astro 5 re-exporta Zod 3 via `astro:content` — `z.url()` / `z.iso.datetime()` falham em runtime. **Não migrar até Astro alinhar.**
2. **Scripts standalone podem usar Zod 4** nativo (`z.url()`) — apenas arquivos que importam `zod` diretamente, não via `astro:content`.
3. **CLI scripts** devem usar `pathToFileURL(process.argv[1] ?? "").href` para `isMain` check (correção Windows; `file://${argv[1]}` quebra com 2 vs 3 slashes).
4. **Vitest + `astro:content`** já resolvido via alias em `vitest.config.ts` → `tests/__mocks__/astro-content.ts`. **Não tocar** essa config nem o mock.
5. **`.gitattributes` força `eol=lf`** em todo o repo. Não tocar — previne drift Windows/Ubuntu que falha apenas em CI.
6. **Path alias único**: `@/*` → `src/*`. Configurado em `tsconfig.json`, `astro.config.mjs` e `vitest.config.ts`. **Não criar outros aliases.**
7. **pnpm v10 local · v9 CI** — lockfile 9.0 compatível. Sempre `--frozen-lockfile` no CI.
8. **CI Ubuntu vs Windows local**: rodar `pnpm format:check && pnpm lint && pnpm typecheck && pnpm test && pnpm build` localmente antes de push. Diferenças de fim de linha já estão mitigadas pelo `.gitattributes`, mas Prettier ainda pode ver formatação diferente.

---

## Estrutura de URLs

Estáveis, hierárquicas, **nunca quebram** (redirects 301 quando muda).

```
/                              → home (dashboard editorial)
/candidatos                    → índice
/candidatos/[slug]             → perfil + timeline + filtros
/declaracoes/[id]              → PÁGINA-CHAVE SEO (Quotation + Article + Vereditos + Contexto)
/eventos                       → índice por data/tipo
/eventos/[id]                  → evento + lista de declarações
/temas                         → índice
/temas/[slug]                  → tema + declarações
/buscar                        → Pagefind UI
/dataset                       → JSON-LD Dataset + downloads (JSONL+CSV) + licença
/sitemap-index.xml             → @astrojs/sitemap
/robots.txt                    → permissivo (inclusive AI bots: GPTBot, ClaudeBot, etc.)
```

ID de declaração: `YYYY-MM-DD-<candidato-slug>-<tema>-<descritor>` (ex: `2026-04-15-candidato-a-economia-imposto`). **URL é função pura do ID** — não muda.

---

## Workflow do projeto

Ver [[checkpoint-fase2-completa]] para entry point atual. Fases completas:

| Fase | Status | Commit | Entrega |
|------|--------|--------|---------|
| 1 — Fundação | ✅ | `ce6ad3d` | Astro+React+Tailwind+shadcn+layout+tokens |
| 2 — Pipeline | ✅ | `39bd315` | 6 scripts CLI + tech debt + bug fixes |
| 3 — SEO+Páginas | 🚧 | (em curso) | JSON-LD + sitemap + Pagefind + 9 rotas + 8 componentes |
| 4 — Conteúdo MVP | ⏳ | — | 2 candidatos × 30 declarações reais |
| 5 — Polimento+launch | ⏳ | — | Zenodo DOI · soft launch silencioso |

**Plans em `docs/superpowers/plans/`**, specs em `docs/superpowers/specs/`. Issues abertas (`#3`-`#6`) marcadas `good first issue` — fora do escopo das fases atuais.

---

## Referências canônicas

- **Spec mestre:** `docs/superpowers/specs/2026-05-27-atlas-design.md`
- **Plan atual:** `docs/superpowers/plans/2026-05-27-atlas-fase3-seo-paginas.md`
- **Schema do dataset:** `docs/SCHEMA.md` (gerado por `pnpm export:dataset`)
- **Pipeline operacional:** `scripts/README.md`
- **Memórias-chave:** [[checkpoint-fase2-completa]] · [[decisoes-core-atlas]] · [[astro-content-zod3]] · [[bugs-do-plano-fase1]] · [[feedback-best-practices]]

---

## Gates de qualidade (alinhados ao spec §9.5)

| Métrica | Meta |
|---------|------|
| Lighthouse SEO | ≥ 95 |
| Lighthouse Acessibilidade | ≥ 95 (WCAG 2.2 AA) |
| LCP | < 2.5s |
| CLS | < 0.1 |
| Cobertura testes | ≥ 80% lines (atual: 80% threshold em vitest.config.ts) |
| Lint warnings | 0 (`--max-warnings=0`) |
| Typecheck hints | 0 |

CI bloqueia merge se `format:check`, `lint`, `typecheck`, `validate-data`, `test` ou `build` falharem em Ubuntu.
