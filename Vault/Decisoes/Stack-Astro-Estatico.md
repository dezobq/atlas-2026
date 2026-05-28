---
tags: [decisao, arquitetura, stack]
created: 2026-05-27
updated: 2026-05-28
status: ativo
dependencies: [[URLs-Estaveis]]
---

# Decisão: Stack Astro 5 Estático

## Contexto

Atlas precisa ser uma base pública, indexável, com alta confiabilidade e baixo custo operacional. Sem login, sem dashboards autenticados, dados raros mudam (declarações são imutáveis após publicação; vereditos podem ser adicionados via PR).

## Alternativas consideradas

1. **Next.js + Postgres + Vercel:** flexível, mas adiciona banco, runtime serverless, custo. Overkill para dados imutáveis.
2. **Hugo + Markdown:** rápido, mas comunidade React mais ativa; Hugo template syntax é específica.
3. **Astro 5 estático + git (escolhida):** site 100% pré-renderizado, dados em YAML/Markdown versionados, sem banco. Build → HTML + JSON-LD + sitemap + Pagefind.

## Decisão

**Astro 5 com `output: "static"`**, dados em git, hospedado em Cloudflare Pages.

## Consequências

- ✅ Zero banco, zero runtime, hospedagem gratuita (Cloudflare Pages)
- ✅ Conteúdo é diff-ável no git → revisões via PR
- ✅ Pagefind indexa client-side (sem servidor de busca)
- ✅ `astro:content` valida tudo via Zod no build (falha rápido)
- ⚠️ Toda mudança de dados é um commit → fluxo de PR obrigatório para correções
- ⚠️ Build cresce O(n) com declarações; aceitável até ~10k entradas
- ⚠️ `astro:content` re-exporta Zod 3 — não migrar (ver [[../Bugs/Astro-Zod3-vs-Zod4]])

## Sinais para reavaliar

- Build > 5min consistentemente → considerar incremental builds ou paginação
- Necessidade de write-time public (envio de formulário) → considerar Worker + KV
- Dataset > 10k declarações → repensar paginação e indexação

## Links

- Spec mestre: `docs/superpowers/specs/2026-05-27-atlas-design.md`
- Bug relacionado: [[../Bugs/Astro-Zod3-vs-Zod4]]
- URLs: [[URLs-Estaveis]]
