# Governança do Atlas

## Decisão final

O Atlas tem **um mantenedor único** com responsabilidade editorial e técnica
final. A comunidade contribui via issues e PRs; o mantenedor decide o que
entra.

## Critérios de inclusão de declarações

Definidos em [`METODOLOGIA.md`](METODOLOGIA.md) (a ser publicado na Fase 3).
Aplicáveis a TODOS os candidatos com a mesma régua, sem exceção.

## Processo de correção factual

1. Issue aberta com template "Correção factual"
2. Mantenedor avalia em até 7 dias
3. Se aceita: commit de correção com referência à issue
4. Histórico permanece visível via `git log` e seção "Edições recentes" da
   página da declaração

## Processo de PRs externos

1. CI deve passar (lint + typecheck + test + validate-data)
2. Revisão do mantenedor
3. Aceito ou rejeitado com justificativa pública

## Não-aceitamos

- Contribuições financeiras de partidos, campanhas, ou candidatos
- Parcerias editoriais com veículos politicamente posicionados
- Pedidos de remoção de declarações documentadas com fonte primária válida

## Aceitamos

- Doações via Open Collective (a partir da Fase 2+, se ativado)
- Grants de fundações cívicas (Mozilla, Knight, MacArthur, Itaú Social, etc)
  com disclosure pública
- Contribuições técnicas e editoriais via PR/issue

## Disclaimer

O Atlas **não é um fact-checker**. É uma camada de infraestrutura factual.
Para vereditos sobre veracidade, consulte fact-checkers reconhecidos
(Lupa, Aos Fatos, Comprova, Estadão Verifica) — linkados quando disponíveis
em cada declaração.
