# Contribuindo com o Atlas

O Atlas existe para ser **auditável e corrigível**. Toda contribuição é
bem-vinda — desde correções de typo até sugestões de fontes que faltam.

## Princípios

1. **Fonte primária obrigatória.** Nenhuma declaração entra sem URL, timestamp
   e snapshot (Wayback ou local).
2. **Sem veredito.** O Atlas não classifica como verdade/mentira. Vereditos são
   agregados de fact-checkers reconhecidos via campo `vereditos_externos`.
3. **Igual rigor para todos.** Mesma régua editorial para cada candidato.
4. **Auditabilidade.** Toda edição vira commit. Histórico permanece visível.

## Como contribuir

### Correções factuais

Abra uma issue usando o template **"Correção factual"**. Inclua:

- Link da declaração no Atlas
- Que parte está errada (timestamp, citação, atribuição, etc)
- Fonte que comprova a correção

### Sugestões de fonte

Abra uma issue usando o template **"Fonte sugerida"**. Inclua:

- Candidato
- Data do evento
- Fonte primária (URL oficial, vídeo, transcrição)
- Trecho da declaração
- Tema principal

Editores avaliam e, se aceito, criam a entrada.

### Pull requests de código

1. Fork e branch a partir de `main`
2. Faça commits seguindo [Conventional Commits em PT-BR](https://www.conventionalcommits.org/)
3. Rode `pnpm lint`, `pnpm typecheck`, `pnpm test`, `pnpm validate-data`
   antes de abrir PR
4. PR deve passar todos os checks do CI
5. Descreva claramente o "porquê" no PR

### Pull requests de dados

Pedidos de adição/edição de declarações via PR também são aceitos. Mesma régua
de validação. CI roda `validate-data` em todo PR.

## Setup local

Veja [`README.md`](../README.md).

## Comunicação

Issues no GitHub são o canal principal. Não usamos Slack/Discord.

## Código de conduta

Veja [`CODE_OF_CONDUCT.md`](CODE_OF_CONDUCT.md).
