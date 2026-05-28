---
tags: [moc, index]
created: 2026-05-28
updated: 2026-05-28
status: ativo
---

# Atlas · MOC Raiz

Mapa de Conteúdos do vault. Atualizar sempre que uma nota nova for adicionada a uma pasta.

## Domínios

- [[Dominios/00-MOC|Visão geral dos domínios]]
- [[Dominios/Postura-Editorial]] — tecnicista neutro radical, sem rosto, sem veredito próprio
- [[Dominios/Cascata-de-Vereditos]] — quando e como agregar vereditos de fact-checkers
- [[Dominios/Criterio-Selecao-Candidatos]] — quais candidatos entram no Atlas (3 pesquisas + corte temporal)
- [[Dominios/Pipeline-de-Ingestao]] — scrape → transcribe → archive → og

## Decisões

- [[Decisoes/00-MOC|Visão geral das decisões]]
- [[Decisoes/Stack-Astro-Estatico]] — por que Astro 5 estático + dados em git
- [[Decisoes/Sem-Veredito-Proprio]] — Atlas nunca classifica veracidade
- [[Decisoes/Licencas-MIT-CC-BY]] — código MIT, dados/conteúdo CC-BY 4.0
- [[Decisoes/URLs-Estaveis]] — estrutura de URLs que nunca quebra
- [[Decisoes/Audiencia-Primaria]] — mídia + acadêmico + LLM como audiência primária (2026-05-28)
- [[Decisoes/I4-Compartilhabilidade]] — cards visuais + API JSON pública + embed widget (2026-05-28)
- [[Decisoes/I3-Metricas-de-Sucesso]] — reframe de métricas primárias (B2B/LLM/features) e secundárias (uniques/cobertura) (2026-05-28)
- [[Decisoes/I2-Distribuicao]] — outreach controlado em 5 camadas; soft launch silencioso reinterpretado (2026-05-28)
- [[Decisoes/I6-Canal-Ativo-com-Audiencia]] — RSS + newsletter mensal opcional + feed claim-sem-veredito (2026-05-28)

## Bugs / Incidentes

- [[Bugs/00-MOC|Visão geral dos bugs registrados]]
- [[Bugs/Astro-Zod3-vs-Zod4]] — astro:content re-exporta Zod 3; não migrar
- [[Bugs/pnpm-CI-vs-Local]] — diferenças Windows/Ubuntu mitigadas por `.gitattributes`

## Specs ativos

- [[Specs/00-MOC|Visão geral dos specs]]
- Spec mestre: `docs/superpowers/specs/2026-05-27-atlas-design.md`
- Spec Fase 4: `docs/superpowers/specs/2026-05-28-fase4-editorial-mvp.md`

## Fontes (fact-checkers)

- [[Fontes/00-MOC|Visão geral das fontes]]
- [[Fontes/Lupa]] · [[Fontes/Aos-Fatos]] · [[Fontes/Comprova]]

## Pessoas

- [[Pessoas/00-MOC|Curador, candidatos, stakeholders]]
- [[Pessoas/Andre-Queiroz]] — curador e mantenedor
- [[Pessoas/Lula]] · [[Pessoas/Flavio-Bolsonaro]] — candidatos no MVP

## Templates

- [[Templates/Template-Decisao]] · [[Templates/Template-Bug]] · [[Templates/Template-Declaracao-Audit]]

## Status do projeto (resumo)

- **Fase atual:** Fase 4 · Sprint 5.1 ✅ (setup editorial mergeado em main em 2026-05-28)
- **Próximo:** Sprint 5.2 — piloto de 12 declarações
- **Entry-point detalhado:** `~/.claude/projects/.../memory/checkpoint-fase4-sprint5-1-completa.md`
