---
tags: [moc, index, readme]
created: 2026-05-28
updated: 2026-05-28
status: ativo
dependencies: []
---

# Vault do Atlas dos Candidatos · 2026

Knowledge base versionada deste projeto. Inspirada em **zettelkasten** e nos princípios de **Andrej Karpathy** para captura de conhecimento ("notas atômicas, alta densidade de links, evolução constante").

## Princípios

1. **Atomic notes** — uma ideia por nota, título descritivo, ≤ 150 linhas. Quebrar em sub-notas em vez de crescer.
2. **Links bidirecionais** — usar `[[wiki-links]]` liberalmente. Conexão > hierarquia.
3. **Auto-suficiência** — toda nota deve ser legível com zero contexto externo. Frontmatter explícito.
4. **Pastas semânticas, não cronológicas** — `Dominios/`, `Decisoes/`, `Bugs/`, etc. Não `2026-05/`.
5. **Organismo vivo** — revisar regularmente. Notas erradas se atualizam ou se apagam; nunca se "deprecam" silenciosamente.
6. **Versionado no git** — vault é parte do código, viaja com a branch. PRs podem alterar vault junto com código.

## Estrutura

- [[00-Index]] — Mapa de Conteúdos raiz (entry point)
- `Dominios/` — áreas de conhecimento (postura editorial, pipeline, critério)
- `Decisoes/` — decisões arquiteturais e editoriais com rationale
- `Bugs/` — incidentes técnicos e correções (anti-regressão)
- `Specs/` — pointers para specs ativos em `docs/superpowers/specs/`
- `Fontes/` — fact-checkers e agregadores (Lupa, Aos Fatos, Comprova)
- `Pessoas/` — candidatos, curador, stakeholders
- `Templates/` — frontmatter padrão para cada tipo de nota

## Como usar

- **Antes de implementar:** consultar `[[Decisoes/...]]` e `[[Dominios/...]]` relevantes
- **Após bug:** registrar em `Bugs/` com causa raiz, solução e link para PR
- **Após decisão:** registrar em `Decisoes/` com data, alternativas consideradas, motivo
- **Anti-regressão:** antes de alterar feature, fazer "Mapa de Impacto" via backlinks (`[[origem]]`)

## Convenção de frontmatter

```yaml
---
tags: [tag1, tag2]
created: 2026-05-28
updated: 2026-05-28
status: ativo | obsoleto | rascunho
dependencies: [[Outra-Nota]]
---
```

## Conexão com Claude Code

MCP Obsidian configurado em `.mcp.json` (raiz do projeto) aponta para este `Vault/`. Use ferramentas `mcp__obsidian__*` para read/write/search.
