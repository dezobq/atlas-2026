---
tags: [moc, decisoes]
created: 2026-05-28
updated: 2026-05-28
status: ativo
---

# MOC · Decisões

Decisões arquiteturais e editoriais com rationale registrado. Cada nota deve responder: *por que* a decisão foi tomada, *quais alternativas* foram consideradas, *quando reavaliar*.

## Arquitetura técnica

- [[Stack-Astro-Estatico]] — Astro 5 estático + dados em git, sem banco
- [[URLs-Estaveis]] — estrutura hierárquica e imutável

## Editorial

- [[Sem-Veredito-Proprio]] — Atlas nunca classifica veracidade
- [[Licencas-MIT-CC-BY]] — código MIT, dataset/conteúdo CC-BY 4.0

## Como adicionar nova decisão

1. Copiar `[[../Templates/Template-Decisao]]` para esta pasta com nome descritivo
2. Preencher TODOS os campos obrigatórios
3. Adicionar entrada neste MOC com link e descrição em 1 linha
4. Linkar do [[../00-Index]] se for decisão de impacto alto

## Quando reabrir uma decisão

Toda decisão tem **sinais de revisão** explícitos. Se sinal disparar, abrir issue no GitHub referenciando a nota, discutir, e ou: (a) confirmar decisão atual com novo rationale, ou (b) atualizar a nota com `status: obsoleto` + link para a decisão sucessora.
