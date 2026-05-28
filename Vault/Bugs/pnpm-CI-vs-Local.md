---
tags: [bug, ci, pnpm, windows]
created: 2026-05-27
updated: 2026-05-28
status: ativo
---

# Bug: pnpm v10 local vs v9 CI · LF vs CRLF

## Sintoma

PR passa localmente (Windows) e quebra no CI (Ubuntu) com:
- Prettier reportando "code style issues found"
- ESLint diff
- Falha em testes que dependem de paths

## Causa raiz

Dois subproblemas combinados:

1. **pnpm versão diferente** — local v10, CI v9. Lockfile 9.0 compatível com ambos, mas comandos podem se comportar diferente.
2. **Fim de linha (EOL)** — Windows escreve CRLF por padrão, Ubuntu lê LF. Prettier reformata, diff vira ruído.

## Solução

1. **`.gitattributes` força `eol=lf`** em todo o repo (NÃO tocar):
   ```
   * text=auto eol=lf
   ```
2. **CI usa `--frozen-lockfile`** sempre — pega lockfile drift cedo
3. **Workflow local antes de push:**
   ```bash
   pnpm format:check && pnpm lint && pnpm typecheck && pnpm test && pnpm build
   ```

## Como detectar regressão

- Pre-commit hook que roda `pnpm format:check` (TODO se ainda não existe)
- CI step `git diff --check` para detectar CRLF acidentais
- Workflow obrigatório: rodar suite completa local antes de push

## Quando reavaliar

- Quando pnpm v10 for o default global no GitHub Actions runners
- Se Windows native passar a respeitar `.gitattributes` corretamente em todos os editores

## Links

- Constraint registrada: `CLAUDE.md` seção "Constraints permanentes" (itens 5, 7, 8)
- Stack: [[../Decisoes/Stack-Astro-Estatico]]
