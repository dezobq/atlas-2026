---
tags: [decisao, juridico, licenca]
created: 2026-05-27
updated: 2026-05-28
status: ativo
---

# Decisão: Licenças MIT + CC-BY 4.0

## Contexto

Atlas é projeto de utilidade pública. Quem deve poder usar o código, os dados, o conteúdo editorial? E sob que condições?

## Decisão

| Camada                                                                         | Licença   | Implicação                                       |
| ------------------------------------------------------------------------------ | --------- | ------------------------------------------------ | -------------------------------------- |
| **Código** (`src/`, `scripts/`, configs)                                       | MIT       | Reuso livre, inclusive comercial, com atribuição |
| **Dataset** (`data/`, `dist-dataset/\*.jsonl                                   | csv`)     | CC-BY 4.0                                        | Reuso livre com atribuição obrigatória |
| **Conteúdo editorial** (`Vault/`, páginas `/metodologia`, `/errata`, `/sobre`) | CC-BY 4.0 | Reuso livre com atribuição                       |

## Atribuição padrão

> "Dados do Atlas dos Candidatos · 2026 (atlas-2026.pages.dev), CC-BY 4.0"

## Por que não AGPL ou CC-BY-SA?

- AGPL/SA criam fricção em reuso jornalístico (impede agregação em produtos proprietários)
- Objetivo é **distribuição máxima** dos dados, não cativar contribuições
- Quem quiser melhorar o Atlas: PR direto no repo

## Sinais para reavaliar

- Empresa fazendo fork comercial sem atribuição → considerar CC-BY-SA para dataset, mas trade-off com adoção
- Tentativa de "embrulhar" Atlas em produto fechado → discutir publicamente, considerar adendo

## Links

- Página `/sobre` materializa: `src/pages/sobre.astro`
- Pessoa responsável: [[../Pessoas/Andre-Queiroz]]
