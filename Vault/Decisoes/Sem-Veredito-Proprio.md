---
tags: [decisao, editorial, neutralidade]
created: 2026-05-27
updated: 2026-05-28
status: ativo
dependencies: [[../Dominios/Postura-Editorial]]
---

# Decisão: Sem Veredito Próprio

## Contexto

Em 2026, ambiente eleitoral altamente polarizado. Qualquer projeto que classifica declarações como "verdadeiras/falsas" vira alvo. E mais importante: o curador (André Queiroz) não é jornalista nem fact-checker certificado.

## Alternativas consideradas

1. **Atlas emite veredito próprio:** dá autoridade aparente, mas exige equipe editorial, viola posicionamento técnico, vira alvo de polarização. Rejeitado.
2. **Atlas só publica fontes primárias (sem vereditos):** mais conservador, mas perde valor agregado para o leitor. Rejeitado.
3. **Atlas agrega vereditos externos com atribuição transparente (escolhida):** publica declaração + lista de vereditos de fontes Tier 1/2, sem síntese. Leitor decide.

## Decisão

**Atlas NUNCA emite juízo de veracidade.** Agrega vereditos de fact-checkers reconhecidos (Lupa, Aos Fatos, Comprova) com atribuição literal. Quando não há veredito: registra "sem veredito até <data>".

## Consequências

- ✅ Sustentabilidade jurídica (não somos editora, somos catálogo)
- ✅ Cobertura paritária natural (mesma regra para todos)
- ✅ Lower bar para contribuição (não exigimos jornalistas)
- ⚠️ Perdemos parte do valor "curatorial" que leitores podem esperar
- ⚠️ Risco de "neutralidade comprada" — mitigado por [[../Dominios/Criterio-Selecao-Candidatos]] mecânico

## Sinais para reavaliar

- Pressão de stakeholder pedindo "posicionamento" → manter decisão (é o ponto)
- Demanda crescente por síntese → considerar feature opcional "consenso entre fontes", mas SEM emitir veredito próprio
- Fact-checkers começam a referenciar Atlas como autoridade → revisar mensageria pública

## Links

- Postura: [[../Dominios/Postura-Editorial]]
- Cascata: [[../Dominios/Cascata-de-Vereditos]]
- Página pública: `src/pages/metodologia.astro`
