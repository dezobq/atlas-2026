---
tags: [decisao, arquitetura, urls]
created: 2026-05-27
updated: 2026-05-28
status: ativo
dependencies: [[Stack-Astro-Estatico]]
---

# Decisão: URLs Estáveis

## Contexto

Atlas será citado em jornalismo, redes sociais, papers acadêmicos. URL que muda = citação morta = perda de confiabilidade duradoura.

## Decisão

**URLs são contrato permanente.** Quando uma URL muda (raríssimo), aplicar `301 → nova URL` para sempre.

## Estrutura

```
/                              → home
/candidatos                    → índice
/candidatos/[slug]             → perfil + timeline + filtros
/declaracoes/[id]              → PÁGINA-CHAVE SEO
/eventos                       → índice
/eventos/[id]                  → evento + declarações
/temas                         → índice
/temas/[slug]                  → tema + declarações
/buscar                        → Pagefind UI
/dataset                       → JSON-LD Dataset + downloads
/metodologia                   → critério + cascata + AI policy
/errata                        → processo + lista
/sobre                         → curador + missão + licenças
/sitemap-index.xml             → @astrojs/sitemap
/robots.txt                    → permissivo
```

## Regras

1. **ID de declaração** = `YYYY-MM-DD-<candidato-slug>-<tema>-<descritor>`
   - Exemplo: `2026-04-15-lula-economia-imposto`
2. **URL é função pura do ID** — não muda quando o conteúdo muda
3. **Slug de candidato** = `<sobrenome-familia>-<primeiro-nome>` (ex: `lula-luiz-inacio`, `bolsonaro-flavio`)
4. **Sluggify único e estável** — implementado em `src/lib/utils/slug.ts`; idempotente

## Anti-pattern

- Mudar slug porque "ficou feio" — não, registrar errata e seguir
- URLs de candidatura ao cargo (ex: `/presidente/`) — não, o cargo varia ao longo do tempo

## Sinais para reavaliar

- Necessidade de versionar declarações (edição com diff) → considerar `/declaracoes/[id]/v2/`
- SEO penaliza URLs muito longas → trade-off com legibilidade

## Links

- Stack: [[Stack-Astro-Estatico]]
- Spec mestre (seção URLs): `docs/superpowers/specs/2026-05-27-atlas-design.md`
