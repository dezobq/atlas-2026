---
tags: [dominio, operacional, pipeline]
created: 2026-05-28
updated: 2026-05-28
status: ativo
---

# Pipeline de Ingestão

Workflow semi-automatizado para transformar uma declaração de candidato (vídeo, post, entrevista) em entrada estruturada no dataset.

## 3 níveis de fontes

1. **YouTube oficial** (canal do candidato/coligação)
2. **Mídia consolidada** (Folha, Estadão, G1, UOL, etc.)
3. **Rede social** (X, Instagram, Threads — última opção, mais frágil)

## Etapas

```
1. scrape:youtube <url>     → metadata JSON + áudio MP3 em .cache/youtube/
2. transcribe <audio.mp3>   → Whisper API (pt-BR) → .cache/transcripts/
3. archive <url>             → Wayback Save Page Now → .cache/archive/
4. scrape:url <url>          → Firecrawl markdown + screenshot → .cache/scrape/
5. generate:og               → Satori → public/og/<id>.png por declaração
```

Todos os scripts são **idempotentes** — cache em `.cache/<categoria>/<hash>.*` evita retrabalho.

## Credenciais necessárias (`.env`)

- `OPENAI_API_KEY` — Whisper
- `FIRECRAWL_API_KEY` — scrape de páginas

Template em `.env.example`. Nunca commitar `.env`.

## Validação dupla

1. **Build-time:** Zod no `astro:content` (falha o build)
2. **CI:** `pnpm validate-data` usa Ajv contra JSON Schemas em `data/schemas/`

## Workflow operacional detalhado

Ver `scripts/README.md`. Esta nota é o overview de alto nível.

## Anti-patterns conhecidos

- Não invocar handles de redes sociais (ver memória `feedback-verificar-handles.md`) — verificar URL real
- Não rodar `validate-data` ignorando warnings — eles viram bugs em produção
- Não esquecer de arquivar no Wayback **antes** de publicar — fontes desaparecem

## Links

- Decisão de stack: [[../Decisoes/Stack-Astro-Estatico]]
- Bug histórico: [[../Bugs/Astro-Zod3-vs-Zod4]]
- Spec mestre (seção pipeline): `docs/superpowers/specs/2026-05-27-atlas-design.md`
