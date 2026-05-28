---
tags: [dominio, editorial, criterio]
created: 2026-05-28
updated: 2026-05-28
status: ativo
versao_atual: v1.1
dependencies: [[Postura-Editorial]]
---

# Critério de Seleção de Candidatos

Mecânica pública e auditável de quais candidatos entram no Atlas. Política de "ninguém é convidado, ninguém é vetado".

## Versão atual: v1.1

**Regra:** entra no Atlas quem aparecer em **≥3 das pesquisas** abaixo, publicadas até **2026-05-16**:

- **Datafolha**
- **Quaest** (inclui Genial-Quaest — mesmo instituto)
- **AtlasIntel**

## Mudança de v1.0 para v1.1

| Campo | v1.0 (spec) | v1.1 (atual) |
|-------|-------------|--------------|
| Institutos | Datafolha + Quaest + Genial-Quaest | Datafolha + Quaest + AtlasIntel |
| Corte temporal | 2026-05-15 | 2026-05-16 |

**Motivo:** durante execução do Sprint 5.1 descobriu-se que Quaest = Genial-Quaest (Banco Genial contrata todas as rodadas Quaest). E Datafolha de maio publicou em 16/05 — fora do corte original. Revisão registrada em commit `ecaec1b`.

## Resultado da aplicação (Sprint 5.1)

| Candidato | Média 3 pesquisas | Posição |
|-----------|-------------------|---------|
| Lula (PT) | 40.53% | 1 |
| Flávio Bolsonaro (PL) | 35.57% | 2 |

## Onde vive no código

- Schema: `src/content/config.ts` (collection `criterio-selecao`)
- Cálculo público: `data/criterio-selecao/latest.yaml`
- Auditor: `scripts/audit-paridade.ts` (CI bloqueante)
- Página pública: `src/pages/metodologia.astro`

## Como evoluir

Próxima atualização do critério vai requerer:
1. Nova entrada em `data/criterio-selecao/` (versionar; nunca sobrescrever)
2. Atualizar `latest.yaml` symlink/cópia
3. Re-rodar `pnpm audit-paridade` em CI
4. Atualizar esta nota e [[../Decisoes/...]] correspondente

## Links

- Postura geral: [[Postura-Editorial]]
- Pessoas selecionadas: [[Pessoas/Lula]], [[Pessoas/Flavio-Bolsonaro]]
- Spec: `docs/superpowers/specs/2026-05-28-fase4-editorial-mvp.md`
