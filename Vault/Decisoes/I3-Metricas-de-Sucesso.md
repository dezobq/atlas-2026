---
tags: [decisao, estrategia, metricas, gates]
created: 2026-05-28
updated: 2026-05-28
status: ativo
dependencies: [[Audiencia-Primaria]] [[I4-Compartilhabilidade]]
---

# Decisão: Métricas de Sucesso — Reframear primárias/secundárias

## Contexto

Métricas atuais (`~/.claude/projects/.../memory/criterios-sucesso-atlas.md`) centradas em **uniques/mês orgânicos** como sinal dominante em T+3, T+6 e T+12. Cravadas no brainstorm de 2026-05-27 quando audiência primária era implícita ("eleitor leigo via SEO orgânico").

[[Audiencia-Primaria]] (cravada 2026-05-28) reframeou audiência primária para mídia + acadêmico + LLM. [[I4-Compartilhabilidade]] (cravada 2026-05-28) introduziu cards visuais + API JSON pública + embed widget como features de produto. Métricas atuais não refletem nem a nova audiência nem as novas features. Adicionalmente, "mentions externas" é vago e não-operacional.

Sem revisão de métricas: decisões de produto e distribuição posteriores ficariam medindo a coisa errada. Uniques/mês contra Folha/Estadão sem backlinks de autoridade é jogo de longo prazo que valida apenas _depois_ da eleição — tarde demais para informar pivot.

## Alternativas consideradas

1. **Manter atuais + adicionar B2B/LLM como secundárias:** continuidade alta mas métrica central (uniques) conflita com audiência primária declarada. **Rejeitada.**

2. **Reframear primárias/secundárias (escolhida):** métricas que refletem audiência primária ganham centralidade; uniques + cobertura + Lighthouse mantêm sinal saudável como secundárias. Alinha 100% com I1 + I4.

3. **Métrica única norte:** foco simples mas única métrica é hackeável e perde sinal de cobertura/performance. **Rejeitada.**

4. **Score composto (índice 0-100 com pesos):** visão unificada mas opaca, difícil de comunicar publicamente, arbitrariedade dos pesos vira problema editorial. **Rejeitada.**

## Decisão

**Métricas primárias:** indicadores que medem alcance da audiência declarada em I1 e adoção das features de I4.

**Métricas secundárias:** sinais saudáveis legados que continuam relevantes mas não centralizam a avaliação de sucesso.

## Métricas primárias

| #      | Métrica                                           | Ferramenta de detecção                                                                                   | Custo de operação                 |
| ------ | ------------------------------------------------- | -------------------------------------------------------------------------------------------------------- | --------------------------------- |
| **P1** | Backlinks editoriais de domínios .com.br de mídia | Google Search Console + Ahrefs free tier                                                                 | Baixo (relatório mensal)          |
| **P2** | Citações em respostas de LLM                      | Busca manual periódica em Perplexity / ChatGPT search / NotebookLM / Claude / Gemini por consultas-teste | Baixo (~30min/mês)                |
| **P3** | Citações em papers acadêmicos                     | Google Scholar alert por "Atlas dos Candidatos" + "atlas-2026.pages.dev"                                 | Zero (notificação automática)     |
| **P4** | Downloads de dataset (JSONL/CSV)                  | GitHub Releases analytics                                                                                | Zero (built-in)                   |
| **P5** | Embeds ativos em domínios externos                | 1×1 pixel opt-in no widget — agregado por referer, sem fingerprint                                       | Baixo (logs Cloudflare)           |
| **P6** | Cards baixados                                    | Contagem anônima de cliques em "Baixar card"                                                             | Baixo (telemetria mínima)         |
| **P7** | API consumption                                   | Logs Cloudflare Pages por endpoint + referer                                                             | Baixo (Cloudflare Analytics free) |

## Métricas secundárias

- **S1.** Uniques/mês orgânicos (Cloudflare Analytics) — target informativo, não gate
- **S2.** Cobertura de declarações (total + por candidato + por tema)
- **S3.** Lighthouse score (target ≥95; queda dispara revisão)
- **S4.** Mentions em redes sociais (Twitter/X search por "atlas-2026" + "Atlas dos Candidatos")

## Gates revisados

| Marco                            | Primárias                                                                                                                                                                             | Secundárias                     | Veredito        |
| -------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------- | --------------- |
| **T+0 (lançamento)**             | Site no ar; ≥60 declarações; cards gerados; API live; embed playground ativo                                                                                                          | Lighthouse ≥95; MIT no GitHub   | Sucesso técnico |
| **T+3 meses**                    | ≥1 backlink editorial **OU** ≥1 citação acadêmica em construção **OU** ≥1 aparição em LLM detectada; ≥10 dataset downloads; ≥5 cards baixados; API consumida ≥1× por entidade externa | ≥50 uniques/mês orgânicos       | Tração mínima   |
| **T+6 meses (campanha oficial)** | ≥3 backlinks editoriais; ≥1 citação acadêmica; ≥3 aparições em LLM detectadas; ≥1 embed ativo em mídia não-Atlas                                                                      | ≥500 uniques/mês                | Validação       |
| **T+12 meses (mês da eleição)**  | ≥10 backlinks editoriais; ≥3 citações acadêmicas; aparições recorrentes em LLM; ≥3 embeds ativos em mídia                                                                             | ≥2k uniques/mês durante debates | Impacto real    |

## Gates de parada/pivot honestos (revisados)

- **T+3, zero backlinks + zero citações + zero LLM detectado** → outreach insuficiente ou diferencial não claro. Reabrir [[Audiencia-Primaria]] ou [[I2-Distribuicao]] (a definir).
- **T+6, sem tração primária mínima** → aceitar como portfolio. Parar de expandir conteúdo.
- **T+12, zero uso relatado em primárias** → arquivar dignamente. **Não é fracasso — é dado empírico.**

A premissa "arquivar dignamente é cenário aceitável" cravada em `criterios-sucesso-atlas.md` continua intacta.

## Definições operacionais (críticas)

- **Backlink editorial:** link de domínio brasileiro de mídia (lista não-exaustiva: `folha.uol.com.br`, `estadao.com.br`, `oglobo.globo.com`, `uol.com.br`, `g1.globo.com`, `bbc.com/portuguese`, `nucleo.jor.br`, `aosfatos.org`, `agencialupa.uol.com.br`, `projetocomprova.com.br`, `bbc.com/portuguese/eleicoes`) que aponte para `atlas-2026.pages.dev` ou cite "Atlas dos Candidatos" em texto editorial. Citação em comentário ou tweet não conta.
- **LLM citation:** resposta de LLM (Perplexity / ChatGPT search / NotebookLM / Claude / Gemini / Google AI Overview) que cite `atlas-2026.pages.dev` como fonte em consulta-teste padronizada relacionada à eleição 2026. Lista de consultas-teste mantida em painel interno.
- **Embed ativo:** widget Atlas detectado em domínio não-Atlas via referer no 1×1 pixel opt-in. Contagem agregada por domínio único (não por hit).
- **Citação acadêmica:** menção em paper publicado em revista revisada por pares, anais de conferência, ou tese acadêmica defendida. Google Scholar alert detecta. Working paper sem peer-review conta como "em construção" em T+3.
- **Dataset download:** download de release no GitHub. Pode ser inflado por bots de pesquisa; threshold de relevância é ≥10 únicos com pelo menos 1 identificável como pessoa/instituição (não bot UA).

## Operação

- **Painel mensal interno** (`Vault/Pessoas/Andre-Queiroz.md` ou planilha privada com acesso só do curador) registra contagens. Não é público para evitar pressão de gamification e por privacidade de quem aparece.
- **Atualização do `/sobre`** com seção "Estado atual" que comunica progresso _qualitativamente_ (ex: "Em julho de 2026, Atlas foi citado por 2 veículos editoriais e aparece em respostas de Perplexity para queries sobre tema X") — sem expor números crus.
- **Revisão trimestral dos gates:** se gate disparar reabertura, sessão de brainstorm aberta para [[Audiencia-Primaria]] ou [[I2-Distribuicao]] dependendo do gap.

## Consequências

### O que muda

- `~/.claude/projects/.../memory/criterios-sucesso-atlas.md` deve ser atualizado para refletir esta decisão como fonte canônica em memória; Vault é fonte de verdade git.
- **Implementação técnica de detecção:**
  - 1×1 pixel image no embed widget — entra como sub-task de [[I4-Compartilhabilidade]]
  - Contagem de cliques em "Baixar card" — sub-task de [[I4-Compartilhabilidade]]
  - GitHub Releases analytics — built-in, zero esforço
  - Google Scholar alert — configuração one-shot pelo curador
  - LLM citation tracking — manual mensal, 30min de curador
- Comunicação pública em `/sobre` ganha seção "Estado atual" qualitativa.

### Trade-offs aceitos

- Maior esforço operacional do curador (~1-2h/mês para painel + LLM tracking).
- Privacidade de quem aparece — gates internos protegem; público vê apenas qualitativo.
- "Mentions externas" da métrica antiga foi substituído por backlinks editoriais (mais específico) e LLM citation (mais relevante). Tweets/posts em redes sociais não viram primária.
- Uniques/mês passa a sinal informativo, não veredito.

### Compatibilidade com decisões cravadas

- **[[Audiencia-Primaria]]:** total. Cada métrica primária mede alcance da audiência declarada.
- **[[I4-Compartilhabilidade]]:** total. Cards baixados, embeds ativos, API consumption medem adoção das features.
- **[[Sem-Veredito-Proprio]]:** mantida intacta. Métricas não dependem de classificação editorial.
- **[[Stack-Astro-Estatico]]:** mantida intacta. Telemetria é opt-in e respeita privacy by default.
- **Sem rosto público:** mantida intacta. Painel interno não tem rosto público.

## Sinais para reavaliar

- **T+3 com 0 em P1+P2+P3:** outreach foi insuficiente OU diferencial está mal posicionado. Reabrir [[Audiencia-Primaria]] ou [[I2-Distribuicao]].
- **LLM platforms desfavorecem fontes não-tradicionais sistematicamente** → reavaliar peso relativo de P2 dentro das primárias.
- **Surge plataforma de métrica que padroniza "citation in LLM"** → adotar e atualizar definição operacional.
- **Backlinks editoriais começam a ser inflados por SEO automático sem editorial real** (ex: aggregators automáticos) → endurecer definição.
- **Curador perde 1-2h/mês de bandwidth para painel** → automatizar via script (Google Scholar API, etc.).

## Derivações imediatas

- **[[I2-Distribuicao]]** (a criar) — outreach controlado precisa mirar exatamente quem gera P1, P2, P3 (backlinks editoriais, citações acadêmicas, aparições em LLM).
- **[[I6-Canal-Ativo-com-Audiencia]]** (a criar) — RSS de claim sem veredito e newsletter mensal alimentam P4 (downloads) e P7 (API consumption).

## Links

- Audiência primária: [[Audiencia-Primaria]]
- Compartilhabilidade: [[I4-Compartilhabilidade]]
- Postura editorial: [[../Dominios/Postura-Editorial]]
- Critérios de sucesso anteriores (a atualizar): `~/.claude/projects/.../memory/criterios-sucesso-atlas.md`
- Spec mestre (seção sucesso): `docs/superpowers/specs/2026-05-27-atlas-design.md`
- Sessão de revisão: 2026-05-28 (brainstorm crítico sobre diferencial e engajamento)
