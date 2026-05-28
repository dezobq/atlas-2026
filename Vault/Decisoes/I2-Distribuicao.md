---
tags: [decisao, estrategia, distribuicao, outreach]
created: 2026-05-28
updated: 2026-05-28
status: ativo
dependencies: [[Audiencia-Primaria]] [[I3-Metricas-de-Sucesso]] [[I4-Compartilhabilidade]]
---

# Decisão: Distribuição — Outreach controlado em 5 camadas

## Contexto

A decisão core #8 (`decisoes-core-atlas.md`) definiu **"soft launch silencioso, sem PR"**. Implicitamente, essa decisão foi interpretada como "zero outreach", criando uma lacuna entre as métricas declaradas em [[I3-Metricas-de-Sucesso]] (que pressupõem que mediadores qualificados encontrem e citem Atlas) e a realidade operacional (sem outreach, encontrar Atlas depende de SEO orgânico de domínio novo sem backlinks, jogo de longo prazo).

Esta decisão **distingue** entre:

- **Soft launch silencioso** = sem campanha mass market, sem assessoria de imprensa, sem press release, sem paid ads, sem entrevistas em coluna com rosto público
- **Outreach controlado** = contato direto, individual, personalizado com mediadores qualificados específicos

Os dois são compatíveis. Distinguir liberta o projeto para atingir gates de I3 sem violar a postura editorial de soft launch.

## Alternativas consideradas

1. **Manter "zero outreach"** (interpretação extrema de soft launch silencioso): compatível 100% com decisão #8 original mas inviabiliza gates de I3 (backlinks editoriais, citações LLM esperam mediadores chegarem espontaneamente). **Rejeitada.**

2. **Outreach controlado em 5 camadas (escolhida):** contato direto individual a mediadores qualificados de B2B/acadêmico/AI-research, com volume baixo (~5-10/mês) que cabe no bandwidth do solo founder. Mantém soft launch silencioso intacto.

3. **Outreach amplo via comunidades open source** (HN, Reddit, dev.to): alcance imediato mas alto risco de expor curador como rosto público e virar "post de marketing" que viola soft launch. **Rejeitada como abordagem primária**, mas Camada 5 captura versão controlada.

4. **Parcerias institucionais formais** (FGV, OKFN BR): legitimidade transitiva alta mas cronograma lento e demanda formalização incompatível com 8-15h/sem do curador. **Rejeitada como push proativo**; emerge naturalmente como consequência se B funcionar.

## Decisão

**Outreach controlado em 5 camadas, com cadência ~1-2h/mês do curador.** Cada camada tem alvo específico, approach personalizado e princípios não-negociáveis. Soft launch silencioso mantido reinterpretado (sem PR mass, sem assessoria, sem paid, sem rosto público — outreach individual com nome de mantenedor é categoria distinta).

## Camadas de outreach

### Camada 1 — Jornalistas técnicos e de dados (~2/mês)

**Alvos prioritários:**

- Núcleo Jornalismo (nucleo.jor.br)
- Aos Fatos (aosfatos.org)
- Comprova (projetocomprova.com.br)
- Agência Lupa (agencialupa.uol.com.br)
- Folha Verifica (folha.uol.com.br/verifica)
- Estadão Verifica (politica.estadao.com.br/estadao-verifica)
- BBC Brasil Reality Check (bbc.com/portuguese)
- Jornalistas independentes de eleição: Jamil Chade, André Trigueiro, Tom Phillips (Guardian BR), Carla Araújo

**Approach:** email curto, direto, personalizado, conectado a algo recente que eles publicaram. Sem expectativa de resposta.

**Template-base (adaptar para cada destinatário):**

> Olá [nome],
>
> Vi sua matéria de [data] sobre [tema]. Estou desenvolvendo o Atlas dos Candidatos 2026 — base aberta de declarações documentadas com fontes primárias e cascata de vereditos agregada de fact-checkers (Lupa, Aos Fatos, Comprova).
>
> Acabamos de publicar [N] declarações sobre [tema relevante para o destinatário]. Caso queira ver: atlas-2026.pages.dev/temas/[slug].
>
> Dataset CC-BY 4.0, sem fricção para citar. Embed widget para incorporar em matérias: atlas-2026.pages.dev/embed.
>
> Sem expectativa de resposta, só queria deixar mapeado.
>
> Abs, André Queiroz (mantenedor)

### Camada 2 — Pesquisadores eleitorais (~1-2/mês)

**Alvos:**

- FGV CPDOC, FGV DAPP, FGV ECMI
- USP IRI, USP IEA, USP NUPRI
- UnB IPOL, UnB CEAM
- UFMG DCP
- UFRJ IESP, UFPE DCP

**Approach:** email com pointer para dataset + sugestão concreta de aplicabilidade (análise de discurso, polarização, evolução temporal de posições). Mencionar CC-BY 4.0 explicitamente — pesquisador valoriza.

### Camada 3 — Comunidade open data Brasil (envolvimento orgânico, NÃO push)

**Alvos:**

- Open Knowledge Brasil (okfn.org.br) — listas, Discord/Slack
- Operação Serenata de Amor
- Brasil.io (brasil.io)
- Transparência Brasil

**Approach:** participar de discussões existentes; oferecer Atlas como referência quando contexto pede; anunciar releases de dataset em listas/canais quando relevante. **Sem push, sem self-promotion.** Comunidade respeita quem contribui antes de pedir atenção.

### Camada 4 — AI/LLM research community (setup + sutil)

**Alvos:**

- **Hugging Face Hub** — publicar dataset como "Brazilian Elections 2026 — Verified Statements Dataset" com dataset card detalhado (one-shot setup, depois atualização por release)
- Newsletter Latent Space (swyx)
- Comunidade NLP Brasil (NILC USP-São Carlos, comunidades NLP em Discord/Slack)
- ChatGPT-search / Perplexity / NotebookLM / Gemini — não exigem outreach direto; basta JSON-LD bem feito + presence em HF Hub

**Approach:** publicação em HF Hub é setup técnico, não outreach. Indexa para LLMs automaticamente. Menção em fóruns NLP quando contexto técnico apropriado.

### Camada 5 — Comunidades técnicas brasileiras (background, opcional, pseudônimo OK)

**Alvos:**

- dev.to BR
- Hashnode
- Reddit r/brdev (técnico, **NÃO r/brasil** que é mais político)

**Approach:** post técnico sobre arquitetura do Atlas (Astro 5 estático + Schema.org Quotation + audit trail em git + JSON-LD para LLM-search). Foco em técnica, não em editorial. **Pode ser pseudônimo** ou apenas "mantenedor do projeto" sem foto/bio expandida.

**Riscos e mitigações:**

- _Risco:_ post viralizar como "produto" e virar pressão para entrevistas
- _Mitigação:_ não responder DMs pedindo entrevista; responder apenas PRs/issues técnicas
- _Risco:_ post pseudônimo ser tratado como suspeito
- _Mitigação:_ aceitar que esta camada é opcional; só fazer se ganho técnico-pedagógico é claro

## Cadência operacional

| Frequência           | Atividade                                                                         | Tempo |
| -------------------- | --------------------------------------------------------------------------------- | ----- |
| **Semanal**          | Review de painel P1-P7 (de [[I3-Metricas-de-Sucesso]])                            | 15min |
| **Mensal**           | 4-6 outreaches diretos personalizados (Camadas 1+2)                               | ~2h   |
| **Trimestral**       | Anúncio de release em comunidades open data (Camada 3) + HF Hub update (Camada 4) | ~1h   |
| **Semestral**        | Avaliação eficácia e ajuste de alvos                                              | ~1h   |
| **Anual** (opcional) | Paper técnico descrevendo arquitetura (Camada 5)                                  | ~4-8h |

**Bandwidth total estimado:** ~3-4h/mês do curador. Dentro do orçamento de 8-15h/sem.

## Princípios não-negociáveis

1. **Cada outreach é personalizado** — nunca template mass enviado para múltiplos destinatários
2. **Atlas se apresenta como infraestrutura, não como opinião** — vocabulário tecnicista mantido
3. **Curador faz outreach com nome próprio em email privado** mas SEM aparecer como rosto público
   - OK: _"Sou o mantenedor do Atlas dos Candidatos 2026, gostaria de mencionar..."_
   - NÃO OK: aparecer em coluna, podcast, entrevista TV/rádio com foto/bio
4. **Aceitar "não" graciosamente** — taxa de resposta esperada: 10-30%
5. **Painel mensal registra outreaches feitos + respostas** — análise privada de eficácia
6. **Sem follow-up agressivo** — um email por destinatário, no máximo um lembrete 4 semanas depois se relevante

## O que NÃO fazer (preserva soft launch silencioso)

- ❌ Press release
- ❌ Assessoria de imprensa
- ❌ Email blast / mass mailing
- ❌ Cold DMs em Twitter/Instagram/LinkedIn
- ❌ Campanha paga em redes sociais
- ❌ Show HN (Hacker News Show) tradicional
- ❌ Entrevista em coluna / podcast com nome real e foto
- ❌ Aparição em painel/evento como representante do Atlas
- ❌ Conteúdo opinativo em nome do Atlas em qualquer canal

## Compatibilidade com decisões cravadas

| Decisão                                       | Compatibilidade                                                                                                    |
| --------------------------------------------- | ------------------------------------------------------------------------------------------------------------------ |
| **Sem rosto público** (decisão #2 em memória) | Mantida. Outreach individual com nome de mantenedor preserva. Camada 5 permite pseudônimo.                         |
| **[[Sem-Veredito-Proprio]]**                  | Total. Outreach apresenta Atlas como infraestrutura agregadora, não fact-checker.                                  |
| **Soft launch silencioso** (#8)               | Reinterpretado: "sem PR mass" mantido literal; "outreach controlado individual" é categoria distinta e compatível. |
| **Postura tecnicista**                        | Reforça (outreach focado em uso técnico/factual).                                                                  |
| **[[Audiencia-Primaria]]**                    | Total. Camadas 1+2+4 miram exatamente B2B/LLM/acadêmico.                                                           |
| **[[I3-Metricas-de-Sucesso]]**                | Total. Gera P1 (backlinks editoriais), P2 (LLM via HF Hub), P3 (citações acadêmicas).                              |
| **[[I4-Compartilhabilidade]]**                | Total. Embed widget (feature 3 de I4) depende de Camada 1 para validação.                                          |
| **[[Stack-Astro-Estatico]]**                  | Total. Nenhuma feature técnica nova exigida.                                                                       |

## Consequências

### O que muda no processo do curador

- Adiciona ~3-4h/mês de bandwidth dedicado a outreach + review de painel
- Painel mensal interno (planilha privada ou nota em `Vault/Pessoas/Andre-Queiroz.md` privada) registra:
  - Outreaches feitos (data, destinatário, camada, link)
  - Respostas recebidas (positivas/negativas/sem resposta)
  - Eficácia por camada (taxa de resposta, taxa de conversão em P1-P7)
- Setup one-shot:
  - Publicar dataset em Hugging Face Hub (Camada 4)
  - Configurar Google Scholar alert por "Atlas dos Candidatos" + "atlas-2026.pages.dev"
  - Lista de destinatários priorizados de Camadas 1+2 (CSV em painel privado)

### O que NÃO muda no produto

- Nenhuma feature técnica nova exigida (Camada 4 usa HF Hub que é externo; embed widget de I4 já planejado independentemente)
- Postura editorial intocada
- Comunicação pública em `/sobre`, `/metodologia`, `/errata` intocada
- README do repositório intocada

### Trade-offs aceitos

- Bandwidth do curador ~3-4h/mês de outreach (mensurável; pode automatizar parcialmente futuramente)
- Risco de não-resposta percebido como falha pessoal — mitigar com princípio "aceitar 'não' graciosamente"
- Risco de Camada 5 viralizar como produto — mitigar com mitigações registradas

## Sinais para reavaliar

- **T+3 com 0 respostas em 18+ outreaches** → ou tom está errado, ou alvos não são qualificados; reformular templates e reavaliar lista
- **Camada 5 produzir post viral inesperado** → revisar mitigação de exposição do curador; considerar pausar Camada 5
- **Mídia começar a citar Atlas espontaneamente** (sem outreach prévio) → reduzir volume de Camada 1; outreach virou desnecessário
- **Bandwidth de outreach > 8h/mês** → revisar processo; automatizar geração de templates personalizados (sem mass mailing)
- **Convite inesperado para entrevista pessoal** → recusar graciosamente, oferecer entrevista técnica pseudônima como alternativa
- **Parceria formal emergir naturalmente** (ex: FGV propor pesquisa colaborativa) → reavaliar D (parcerias formais) como adição

## Derivações imediatas

- **[[I6-Canal-Ativo-com-Audiencia]]** (próxima decisão) — RSS de claim sem veredito e newsletter mensal opcional alimentam mediadores qualificados depois do primeiro outreach; canal ativo é continuação natural de Camada 3 e 4
- **Painel mensal interno** — não é spec de produto; é processo operacional do curador

## Links

- Audiência primária: [[Audiencia-Primaria]]
- Métricas: [[I3-Metricas-de-Sucesso]]
- Compartilhabilidade: [[I4-Compartilhabilidade]]
- Postura editorial: [[../Dominios/Postura-Editorial]]
- Decisões core em memória: `~/.claude/projects/.../memory/decisoes-core-atlas.md` (#8 reinterpretada)
- Sessão de revisão: 2026-05-28 (brainstorm crítico sobre diferencial e engajamento)
