---
tags: [bug, dependencias, astro, zod]
created: 2026-05-27
updated: 2026-05-28
status: ativo
dependencies: [[../Decisoes/Stack-Astro-Estatico]]
---

# Bug: Astro 5 bundles Zod 3, sintaxe Zod 4 quebra

## Sintoma

Em `src/content/config.ts`, usar `z.url()` ou `z.iso.datetime()` (sintaxe Zod 4) **passa o typecheck** mas falha em runtime no build com erro críptico do `astro:content`.

## Causa raiz

Astro 5 internamente re-exporta **Zod 3** via `astro:content`. Mesmo que `package.json` resolva `zod` para v4, o que está dentro do `astro:content` é v3. Sintaxe v4-only (`z.url()`, `z.iso.datetime()`) não existe nele.

## Solução

**Manter sintaxe Zod 3 em `src/content/config.ts`:**

```typescript
// ✅ correto
fonte: z.string().url();
data: z.string().datetime();

// ❌ errado (Zod 4 syntax)
fonte: z.url();
data: z.iso.datetime();
```

**Scripts standalone** (em `scripts/`) podem usar Zod 4 nativo porque importam `zod` diretamente, não via `astro:content`.

## Como detectar regressão

- ESLint rule custom: detectar `z\.url\(\)|z\.iso\./` em `src/content/`
- CI: `pnpm build` é bloqueante e pega isso em runtime
- Test: tests/unit/data/criterio-selecao.test.ts valida o schema

## Quando reavaliar

Quando Astro alinhar interna com Zod 4 (issue acompanhada em https://github.com/withastro/astro/issues/...). Provavelmente em Astro 6.

## Links

- Decisão de stack: [[../Decisoes/Stack-Astro-Estatico]]
- Constraint registrada: `CLAUDE.md` seção "Constraints permanentes" (item 1, 2)
- Memória relacionada: `~/.claude/projects/.../memory/astro-content-zod3.md`
