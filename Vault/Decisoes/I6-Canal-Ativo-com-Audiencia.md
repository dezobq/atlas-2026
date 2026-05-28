---
tags: [decisao, produto, retencao, canal-ativo, rss, newsletter]
created: 2026-05-28
updated: 2026-05-28
status: ativo
dependencies: [[Audiencia-Primaria]] [[I3-Metricas-de-Sucesso]] [[I4-Compartilhabilidade]] [[I2-Distribuicao]]
---

# Decisão: Canal Ativo com Audiência — RSS + Newsletter mensal opcional

## Contexto

Implícito no design original do Atlas: **zero canal ativo**. Audiência chega ao site via descoberta orgânica e raramente volta porque nada notifica. Sob lente das decisões cravadas em 2026-05-28:

- [[Audiencia-Primaria]]: mediadores qualificados (jornalistas, pesquisadores, sistemas LLM) precisam de feed legível por máquina (RSS) e por humano (newsletter) — sem isso, primeira visita do outreach de [[I2-Distribuicao]] não converte em retenção
- [[I3-Metricas-de-Sucesso]]: P4 (dataset downloads) e P7 (API consumption) ganham retenção via canal ativo que anuncia releases
- [[I4-Compartilhabilidade]]: a variante "alerta claim sem veredito" e "card mensal destacado" precisam de canal de distribuição
- Fact-checkers (audiência específica) precisam de sinal upstream que diga "essas declarações ainda não foram verificadas"

Atlas hoje é catálogo read-only sem mecanismo de retenção. Mediadores contactados em [[I2-Distribuicao]] vão lembrar de visitar de novo? Improvável. Canal ativo de baixo atrito resolve.

## Alternativas consideradas

1. **Zero canal ativo (status quo):** zero esforço; retenção nula; sinal upstream para fact-checkers inexistente. **Rejeitada.**

2. **RSS + newsletter mensal opcional (escolhida):** 5 endpoints RSS nativos Astro + newsletter via Buttondown. Opt-in puro, zero rastreamento, curador anônimo. Compatível com soft launch silencioso. Habilita variantes de I4. ~1-2h/mês recorrente.

3. **B + Discord/Telegram comunidade:** alto custo de moderação; risco editorial alto (curador anônimo moderando discussão política eleitoral é receita para desastre); incompatível com postura neutra. **Rejeitada.**

4. **B + webhooks para fact-checkers:** tecnicamente elegante mas demanda parceria formal (que [[I2-Distribuicao]] evita como push proativo); pode emergir naturalmente após validação. **Adiada como derivação opcional.**

## Decisão

**Três componentes:**

1. **RSS feeds** (5 endpoints nativos Astro)
2. **Newsletter mensal opcional** (Buttondown ou alternativa equivalente)
3. **Feed específico "claim sem veredito"** (variante de RSS posicionada como ferramenta para fact-checkers)

Cada componente respeita opt-in puro, zero rastreamento, e curador anônimo. Implementação técnica do RSS é build-time (compatível com [[Stack-Astro-Estatico]]). Newsletter é serviço externo zero esforço no stack.

## Componentes

### 1. RSS feeds

**Endpoints (build-time via `@astrojs/rss` em `src/pages/rss/`):**

```
/rss.xml                                — todas declarações, cronológico reverso
/rss/candidatos/<slug>.xml              — declarações de um candidato
/rss/temas/<slug>.xml                   — declarações de um tema
/rss/claim-sem-veredito.xml             — feed específico para fact-checkers
/rss/errata.xml                         — feed de correções (transparência)
```

**Características:**

- Metadata bem formatada: title, description, language=`pt-BR`, copyright `CC-BY 4.0`
- Cada item inclui: título declaração, data, candidato, tema, vereditos resumidos, link permanente
- Auto-discovery via `<link rel="alternate" type="application/rss+xml" href="/rss.xml">` em todas as páginas relevantes
- Implementação estimada: ~1-2 dias

### 2. Newsletter mensal opcional

**Plataforma:** **Buttondown** (gratuito até 100 assinantes; $9/mês acima — dentro do orçamento R$2k/mês).

Alternativas aceitáveis: EmailOctopus, MailerLite.
Rejeitada: **Substack** (host político ativo, conflita com postura neutra).

**Cadência:** mensal no início do mês. Permitido pular mês sem conteúdo substantivo (Atlas não vira esteira de conteúdo forçado).

**Conteúdo padrão:**

- Resumo qualitativo das novas declarações do mês passado (sem opinião)
- Card visual destacado (variante "card mensal" mostrando claim emblemático com cascata de vereditos)
- Updates de metodologia, errata, novos candidatos selecionados pelo critério (se houve)
- Pointer para releases de dataset (gera P4 de [[I3-Metricas-de-Sucesso]])
- Pointer para mudanças em `/metodologia` se relevante

**Opt-in:**

- Formulário em página dedicada `/newsletter`
- Bloco discreto em `/sobre` mencionando RSS + newsletter como opção
- Sem dark patterns; texto claro do que será enviado
- Email único como input
- **Double opt-in** (confirmação anti-spam)

**Privacy:**

- Sem rastreamento de abertura (sem 1×1 pixel no email)
- Sem rastreamento de clique (sem URL wrapping)
- Sem cookies em landing `/newsletter`
- Cancelamento em 1 clique no rodapé do email

**Voz e assinatura:**

- Curador permanece anônimo
- Emails assinados *"Atlas dos Candidatos · 2026"*
- Tom factual, sem opinativo
- Sem call-to-action emocional ou político

### 3. Feed específico "claim sem veredito"

**Endpoint:** `/rss/claim-sem-veredito.xml`

**Conteúdo:**

- Declarações que estão sem veredito de Tier 1 (Lupa/Aos Fatos/Comprova) há ≥30 dias
- Cada item inclui: candidato, data, tema, evento, declaração resumida, link permanente, dias desde publicação
- Score de prioridade futuro (visibilidade × ausência de veredito × relevância temática) — **não-MVP**

**Implementação:** query no build sobre coleção `declaracoes` filtrando `vereditos.length === 0 && date < (today - 30d)`.

**Posicionamento:** apresentado em `/metodologia` como "ferramenta para fact-checkers" — reforça posicionamento de **infraestrutura upstream**, não competidor de fact-check.

**Risco:** declaração no feed sendo interpretada como "Atlas considera duvidosa" — mitigar com rótulo claro no feed metadata: *"Esta lista contém declarações ainda não verificadas por fact-checker reconhecido. Atlas não emite veredito próprio."*

## Princípios não-negociáveis

- **Zero rastreamento** (privacy by default)
- **Sem dark patterns de opt-in**
- **Newsletter pode pular meses** sem conteúdo substantivo
- **Conteúdo factual, não opinativo**
- **Curador anônimo** para subscritores (assinatura coletiva "Atlas dos Candidatos · 2026")
- **Sem CTAs emocionais ou políticos**
- **Cancelamento em 1 clique**
- **Sem URL wrapping** em links (transparência total)
- **Sem 1×1 pixel** em emails (privacy total)

## Compatibilidade com decisões cravadas

| Decisão | Compatibilidade |
| ------- | --------------- |
| Sem rosto público | Total (curador anônimo em todas as comunicações) |
| **[[Sem-Veredito-Proprio]]** | Total (newsletter factual; feed claim-sem-veredito é sinal upstream, não veredito) |
| Soft launch silencioso | Total (opt-in puro, sem push) |
| Postura tecnicista | Total |
| **[[Audiencia-Primaria]]** | Total (RSS serve B2B/LLM; newsletter serve mediadores; alerta serve fact-checkers) |
| **[[I3-Metricas-de-Sucesso]]** | Reforça (P4 via anúncio de releases; P7 via RSS adoção) |
| **[[I4-Compartilhabilidade]]** | Habilita variantes "card mensal" e "alerta claim sem veredito" |
| **[[I2-Distribuicao]]** | Complementa (mediadores contactados em Camada 1 assinam newsletter; Camada 3+4 amplificam releases) |
| **[[Stack-Astro-Estatico]]** | Total (RSS é build-time nativo; newsletter externa zero esforço no stack) |
| **[[Licencas-MIT-CC-BY]]** | Total (feed CC-BY 4.0; copyright bem formatado) |

## Consequências

### O que muda no produto

- 5 endpoints RSS adicionados em `src/pages/rss/*.xml.ts`
- Nova página `/newsletter` (formulário opt-in)
- Bloco discreto em `/sobre` mencionando RSS + newsletter
- Query "claim sem veredito" implementada no build
- Tag `<link rel="alternate">` em páginas relevantes (BaseLayout ou conditionalmente)
- Setup one-shot de Buttondown (operacional, curador)

### O que NÃO muda

- Stack
- URLs existentes (apenas adições)
- Schema de declaração
- Postura editorial
- Cascata de vereditos
- Comunicação pública existente (apenas adições discretas)

### Trade-offs aceitos

- Bandwidth recorrente: ~1-2h/mês para newsletter
- Custo potencial: ~$9/mês se Buttondown atingir 100 assinantes (dentro do orçamento)
- Risco mínimo: feed claim-sem-veredito virar polêmica → mitigação registrada (rótulo claro no metadata + página `/metodologia` explica)

## Sinais para reavaliar

- **Newsletter 0 assinantes após T+6** → conteúdo não atrai OU divulgação insuficiente; revisar templates e divulgação
- **RSS 0 hits após T+3** → audiência B2B não consome via RSS (improvável); investigar
- **Pressão por opinião editorial em newsletter** → reforçar postura; perder assinantes que esperam opinião é OK
- **Buttondown subir preço significativamente** → migrar para EmailOctopus / MailerLite
- **Feed claim-sem-veredito virar polêmica** → reforçar atribuição visual + documentação em `/metodologia`; última opção é remover o feed e manter só os outros 4
- **Demanda por webhook automatizado para fact-checkers** → considerar derivação D (webhooks) com parceria formal

## Derivações

Implementação técnica vira sub-tasks de feature em writing-plans futuro:

- **Sprint para 5 endpoints RSS** — independente; ~1-2 dias; pode ser feito antes ou depois das features de I4
- **Sprint para setup newsletter** — mais setup operacional do que código; ~0.5 dia + criação de página `/newsletter`
- **Sprint para query claim-sem-veredito + endpoint** — depende de declarações reais no dataset (pós Sprint 5.2 da Fase 4)
- **Variante "card mensal"** — sub-task de Card visual em [[I4-Compartilhabilidade]]; sem prazo isolado

## Links

- Audiência primária: [[Audiencia-Primaria]]
- Métricas: [[I3-Metricas-de-Sucesso]]
- Compartilhabilidade: [[I4-Compartilhabilidade]]
- Distribuição: [[I2-Distribuicao]]
- Postura editorial: [[../Dominios/Postura-Editorial]]
- Cascata de vereditos: [[../Dominios/Cascata-de-Vereditos]]
- Stack: [[Stack-Astro-Estatico]]
- Sessão de revisão: 2026-05-28
