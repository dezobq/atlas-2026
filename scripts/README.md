# Pipeline de Ingestão — Atlas dos Candidatos · 2026

Conjunto de scripts CLI que automatiza parcialmente o trabalho de coletar,
arquivar, transcrever e exportar declarações de candidatos.

## Pré-requisitos

1. Node 22+ e pnpm 9+ instalados (ver `engines` em `package.json`).
2. `pnpm install` executado uma vez.
3. `.env` criado a partir de `.env.example`:
   - `OPENAI_API_KEY` — necessário para `pnpm transcribe`.
   - `FIRECRAWL_API_KEY` — necessário para `pnpm scrape:url`.
4. `yt-dlp` é auto-instalado pelo `youtube-dl-exec` na primeira execução.

## Workflow operacional típico

### Nível 1 — YouTube oficial (5-10 min por declaração)

```bash
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
```

### Nível 2 — Mídia consolidada com vídeo embedado (10-15 min)

```bash
# 1. Scrape da URL (markdown + screenshot)
pnpm scrape:url https://g1.globo.com/politica/noticia/...

# Output: .cache/scrape/<hash>.{md,png}

# 2. Arquivar
pnpm archive https://g1.globo.com/politica/noticia/...

# 3. Se houver vídeo: extrair URL, rodar scrape:youtube
# 4. Criar declaração manualmente
```

### Nível 3 — Post de rede social (20-30 min)

```bash
# 1. Arquivar primeiro (X/IG podem remover rapidamente)
pnpm archive https://x.com/exemplo/status/123

# 2. Scrape pra ter markdown e screenshot
pnpm scrape:url https://x.com/exemplo/status/123

# 3. Se houver vídeo nativo: scrape:youtube tenta yt-dlp como fallback
# 4. Transcrever áudio se aplicável
# 5. Criar declaração com nota sobre fonte secundária se Wayback falhou
```

## Após adicionar declarações

```bash
# Validar schema das novas declarações
pnpm validate-data

# Gerar OG images para todas as declarações
pnpm generate:og

# Output: public/og/<id>.png

# Exportar dataset completo
pnpm export:dataset

# Output: dist-dataset/atlas-declaracoes.{jsonl,csv} + SCHEMA.md
```

## Diretórios

| Path            | Versionado?           | Propósito                                                   |
| --------------- | --------------------- | ----------------------------------------------------------- |
| `.cache/`       | Não (.gitignore)      | Artefatos intermediários (áudios, transcripts, screenshots) |
| `data/`         | Sim                   | Fonte da verdade (markdown + YAML)                          |
| `public/og/`    | Não (.gitignore)      | Gerado por `generate:og` em cada build                      |
| `dist-dataset/` | Não (.gitignore)      | Anexado a GitHub Releases manualmente                       |
| `assets/fonts/` | Sim (binários ~250KB) | Fonts Geist para Satori OG generation                       |

## Princípios

1. **Toda declaração tem fonte primária ou não existe.** Pelo menos um dos:
   YouTube oficial, TSE, Câmara/Senado, mídia consolidada com vídeo embedado,
   rede social oficial verificada.
2. **Wayback é obrigatório** (`pnpm archive`) em cada item antes de criar
   a declaração no `data/`.
3. **Transcrição é sempre revisada humanamente.** Whisper produz baseline,
   operador edita.
4. **AI não gera conteúdo editorial.** Whisper para transcrição,
   sugestões manuais de `tipo_estrutural`. Sem AI escrevendo contexto.
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
| OpenAI Whisper API  | R$ 30/mês (~900 min de áudio)        |
| Firecrawl free tier | R$ 0 (até 500 scrapes/mês)           |
| Wayback Machine     | R$ 0 (gratuito)                      |
| GitHub repo público | R$ 0                                 |
| **Total**           | **R$ 30/mês**                        |

Baseline coerente com seção 6.2 do spec (`docs/superpowers/specs/2026-05-27-atlas-design.md`).
