---
tags: [decisao, editorial, fase4, criterio, janela-temporal]
created: 2026-05-28
updated: 2026-05-28
status: aprovada
dependencies: [Criterio-Selecao-Candidatos, Sem-Veredito-Proprio]
---

# Decisão: estender a janela temporal de elegibilidade para [2025-05-16, 2026-05-28]

## Contexto

A janela de elegibilidade de declarações da Fase 4 era **[2025-05-16, 2026-05-16]** (12 meses, com o fim alinhado à data de corte da seleção de candidatos). Durante a pesquisa de longlists do piloto Sprint 5.2 (2026-05-28), descobriu-se que o material público mais saliente do pré-candidato **Flávio Bolsonaro** (senador) se concentrava em **19–26/05/2026** — imediatamente após o fim da janela:

- Marcha dos Prefeitos (19/05/2026): "neutralizar facções".
- Encontro com Trump na Casa Branca (26/05/2026): pedido de classificação de PCC/CV como terroristas; acordo comercial.

Mantê-lo em 16/05 deixaria os temas **Segurança** e **Política Externa** do Flávio artificialmente rasos por **acidente de calendário**, não por escassez real de discurso. Isso é justamente o tipo de defeito de critério que o piloto (Risco F4-5 do spec §6.3) existe para revelar.

## Alternativas consideradas

1. **Aceitar fonte N2** nos pares escassos do Flávio: resolveria o nível de fonte, mas não o problema de calendário (o material 19–26/05 continuaria inelegível).
2. **Reduzir quota** nos pares afetados: honesto, mas desbalancearia o piloto (Lula 6 × Flávio 3) por um motivo evitável.
3. **Prosseguir só com o in-window original**: descartaria o discurso mais representativo de um candidato sobre seus temas centrais.
4. **Estender o fim da janela para a data da curadoria (escolhida):** captura o material saliente sem inventar nem inflar.

## Decisão

Opção 4: fim da janela estendido de `2026-05-16` → **`2026-05-28`** (data fixa da curadoria, não móvel). A **`data_corte` da seleção de candidatos (2026-05-16) permanece locked** — os 2 candidatos não mudam; apenas a elegibilidade temporal de declarações se estende. Autorizada pelo André em 2026-05-28; registrada como **Errata** pública.

## Consequências

- **Código:** `scripts/audit-paridade.ts` — `JANELA_FIM` = `2026-05-28T23:59:59.999Z`.
- **Público:** Errata em `/metodologia` §2 (transparência: por que a janela mudou).
- **Spec:** §4.2 atualizada + nota de Errata; refs subordinadas (§6.3, §8) alinhadas.
- **Lacuna residual NÃO resolvida:** Flávio × {Saúde, Educação, Meio Ambiente} seguem com cobertura escassa — isso é escassez real, não de janela. Tratar com fonte N2 + nota no relatório de aprendizados (Task 9).
- **Trade-off aceito:** a janela deixa de ser exatamente "12 meses" (vira ~12,4 meses); aceitável porque a fidelidade ao discurso real supera a simetria do número redondo.
- **Sinal de revisão:** se em sprints futuros a janela móvel virar tentação recorrente, formalizar uma regra de "janela = corte da seleção + N dias" em vez de extensões ad hoc.

## Links

- Relacionada: [[Criterio-Selecao-Candidatos]] · [[Sem-Veredito-Proprio]]
- Spec que originou: `docs/superpowers/specs/2026-05-28-atlas-fase4-conteudo-mvp-design.md` §4.2
- Dossiê do piloto: `docs/superpowers/research/2026-05-28-piloto-longlists.md`
- PR de implementação: (a abrir — Sprint 5.2)
