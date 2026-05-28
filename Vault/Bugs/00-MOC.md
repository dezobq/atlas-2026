---
tags: [moc, bugs]
created: 2026-05-28
updated: 2026-05-28
status: ativo
dependencies: []
---

# MOC · Bugs / Incidentes

Registro de bugs com causa raiz e fix. Protocolo anti-regressão: antes de tocar em área "frágil", consultar bugs históricos relacionados.

## Por categoria

### Dependências e build

- [[Astro-Zod3-vs-Zod4]] — `astro:content` re-exporta Zod 3, sintaxe Zod 4 quebra
- [[pnpm-CI-vs-Local]] — diferenças Windows/Ubuntu, mitigadas por `.gitattributes`

## Como adicionar novo bug

1. Copiar [[../Templates/Template-Bug]] para esta pasta
2. Nome descritivo: `<componente>-<sintoma-curto>.md`
3. Preencher Sintoma, Causa raiz, Solução, Como detectar regressão
4. Linkar PR/commit que corrigiu
5. Adicionar entrada neste MOC

## Princípio Karpathy aplicado

> "Cada bug é uma oportunidade de tornar o sistema mais legível."

Bug fix sem registro = bug que volta. Vault é a memória institucional.
