---
tags: [decisao, editorial, ia, processo, credibilidade]
created: 2026-05-29
updated: 2026-05-29
status: ativo
dependencies:
  - "[[Postura-Editorial]]"
  - "[[Sem-Veredito-Proprio]]"
---

# Decisão: AI Policy — "O Processo é a Autoridade"

> Spec completo: `docs/superpowers/specs/2026-05-29-atlas-ai-policy-design.md`. Decidido em brainstorming 2026-05-29 (curador + Claude).

## Contexto

A política fundadora (spec mestre §7.1, "AI não gera conteúdo") protegia credibilidade **proibindo** a IA de gerar conteúdo. Tensão: inviável para escala (60 declarações em curadoria solo → risco de burnout F4-13) e deixa valor na mesa para a audiência primária (academia, LLMs, mídia). O curador decidiu repensar — sem perder respeito de pensadores e acadêmicos de verdade.

## Alternativas consideradas

1. **Manter "AI não gera conteúdo":** seguro, mas inviável para escala e perde valor agregado. Rejeitado.
2. **IA gera tudo sem salvaguardas:** escala máxima, destrói credibilidade ("slop de IA"). Rejeitado.
3. **Processo reproduzível (escolhida):** a IA pode operar qualquer etapa, desde que todo dado seja rastreável + verificável + repetível + documentado, sob método público. Credibilidade vem do **método**, não da restrição.

## Decisão

**Adotar "O Processo é a Autoridade".** A IA opera o pipeline; a credibilidade migra de _"confie no curador"_ para _"não confie — reproduza"_. Invariantes:

- **Linha vermelha = O Método** (4 garantias: rastreável, verificável, repetível, documentado). Cada uma vira gate de CI; falha → não publica.
- **Mantém [[Sem-Veredito-Proprio]]:** síntese-com-proveniência SIM, juízo próprio de veracidade NÃO.
- **3 camadas de confiança:** C0 factual (verbatim, híbrido por confiança), C1 derivada (IA redige, ancorada), C2 analítica (síntese sem juízo).
- **Repetível = convergência verificável** (não bit-identidade — LLM é estocástico).
- **Humano governa o método** + audita amostra + decide exceções; não verifica item-a-item. Inclusão por cascata determinística (mitiga F4-1).
- **Conformidade TSE 2026** embutida (Res. 23.610/2019 art. 9º-B, red. 23.755/2026): rótulo proeminente, modo janela-de-silêncio 72h/24h, sem mídia sintética, gate anti-descontextualização.

## Consequências

- ✅ Escala viável + valor para academia/LLMs + visão agent-native
- ✅ Credibilidade reproduzível (mais robusta que "confie em mim")
- ✅ Postura neutra e zero-veredito-próprio **preservadas**
- ⚠️ Exposição legal eleitoral → **gate jurídico obrigatório antes de produção**
- ⚠️ Risco de erosão de confiança se a mudança for mal comunicada (mitigar pelo reframe + proveniência aberta)
- ⚠️ Complexidade nova: proveniência, quórum de verificação, modo janela-de-silêncio, method-as-code

## Sinais para reavaliar

- Parecer jurídico contrário à abordagem → faseamento por risco legal (só C0 + vereditos externos)
- Percepção pública de "feito por IA" minando confiança → reforçar comunicação / recuar camadas
- Verificadores falhando por vício compartilhado → aumentar diversidade / peso da amostra humana
- Custo de manutenção do method-as-code superando o valor → simplificar para proveniência-só

## Links

- Spec: `docs/superpowers/specs/2026-05-29-atlas-ai-policy-design.md`
- Postura: [[Postura-Editorial]]
- Decisão preservada: [[Sem-Veredito-Proprio]]
- Auditoria que originou a sessão: [[Auditoria-Dados-2026-05-29]]
- Plano P1: `docs/superpowers/plans/2026-05-29-atlas-ai-policy-p1-fundacao-proveniencia.md`
