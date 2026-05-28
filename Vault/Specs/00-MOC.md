---
tags: [moc, specs]
created: 2026-05-28
updated: 2026-05-28
status: ativo
---

# MOC · Specs

Pointers para specs em `docs/superpowers/specs/`. Specs são **fonte da verdade canônica** para o que está sendo construído; este MOC apenas indexa e dá contexto.

## Specs ativos

### Mestre

- **`2026-05-27-atlas-design.md`** — spec original do Atlas, postura, stack, escopo MVP. Sempre re-ler antes de decisões grandes.

### Fase 4 — MVP Editorial

- **`2026-05-28-fase4-editorial-mvp.md`** — divisão em Sprints 5.1 (setup), 5.2 (piloto), 5.3 (lote), 5.4 (release v0.1.0)

### Features estratégicas (decorrentes da revisão de premissas 2026-05-28)

- **`2026-05-28-card-visual-declaracoes-design.md`** — feature 1 de I4 (compartilhabilidade): cards visuais em 4 formatos via Satori, com cor de fact-checker (não de veredito), build-time, 3 botões em /declaracoes/[id]

## Como adicionar novo spec

1. Criar em `docs/superpowers/specs/YYYY-MM-DD-<descritor>.md` (não aqui)
2. Adicionar entrada neste MOC com 1 linha
3. Linkar do [[../00-Index]] se for spec de fase

## Specs arquivados

Quando uma fase encerra:
- Spec **fica** em `docs/superpowers/specs/` (referência histórica)
- Plano correspondente **fica** em `docs/superpowers/plans/`
- Checkpoint em `~/.claude/projects/.../memory/checkpoint-fase<N>-completa.md`
- Aqui no MOC, marcar como "arquivado" mas manter linkado para arqueologia

## Why specs vivem em `docs/` e não no Vault?

- Specs são **artefatos imutáveis** após aprovação. Vault é fluido.
- `docs/` é estável para deep-link de PRs e issues.
- Vault contextualiza e cross-referencia, não substitui.
