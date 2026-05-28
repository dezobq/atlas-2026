---
tags: [moc, decisoes]
created: 2026-05-28
updated: 2026-05-28
status: ativo
dependencies: []
---

# MOC · Decisões

Decisões arquiteturais e editoriais com rationale registrado. Cada nota deve responder: _por que_ a decisão foi tomada, _quais alternativas_ foram consideradas, _quando reavaliar_.

## Arquitetura técnica

- [[Stack-Astro-Estatico]] — Astro 5 estático + dados em git, sem banco
- [[URLs-Estaveis]] — estrutura hierárquica e imutável

## Editorial

- [[Sem-Veredito-Proprio]] — Atlas nunca classifica veracidade
- [[Licencas-MIT-CC-BY]] — código MIT, dataset/conteúdo CC-BY 4.0

## Estratégia e posicionamento

- [[Audiencia-Primaria]] — mídia + acadêmico + LLM como audiência primária; eleitor leigo via redistribuição transitiva (2026-05-28)

## Produto e distribuição

- [[I4-Compartilhabilidade]] — pacote completo sequencial: cards visuais + API JSON pública + embed widget (2026-05-28)
- [[I3-Metricas-de-Sucesso]] — reframe de primárias (B2B/LLM/features) e secundárias (uniques/cobertura) (2026-05-28)
- [[I2-Distribuicao]] — outreach controlado em 5 camadas; soft launch silencioso reinterpretado (2026-05-28)
- [[I6-Canal-Ativo-com-Audiencia]] — RSS + newsletter mensal opcional + feed claim-sem-veredito (2026-05-28)

## Como adicionar nova decisão

1. Copiar `[[../Templates/Template-Decisao]]` para esta pasta com nome descritivo
2. Preencher TODOS os campos obrigatórios
3. Adicionar entrada neste MOC com link e descrição em 1 linha
4. Linkar do [[../00-Index]] se for decisão de impacto alto

## Quando reabrir uma decisão

Toda decisão tem **sinais de revisão** explícitos. Se sinal disparar, abrir issue no GitHub referenciando a nota, discutir, e ou: (a) confirmar decisão atual com novo rationale, ou (b) atualizar a nota com `status: obsoleto` + link para a decisão sucessora.
