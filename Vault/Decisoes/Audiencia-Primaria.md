---
tags: [decisao, estrategia, audiencia, posicionamento]
created: 2026-05-28
updated: 2026-05-28
status: ativo
dependencies: [[../Dominios/Postura-Editorial]]
---

# Decisão: Audiência Primária = Mídia + Acadêmico + LLM

## Contexto

Até esta sessão (2026-05-28), o design do Atlas tratava implicitamente "eleitor leigo via SEO orgânico" como audiência primária — sem nunca declarar essa escolha conscientemente. Sinais no design apontavam simultaneamente para duas audiências distintas (eleitor leigo via SEO + jornalista/pesquisador via dataset estruturado), e métricas de sucesso (uniques/mês orgânicos) assumiam só a primeira.

Análise crítica disparada pela pergunta "Atlas tem diferencial real e potencial de engajamento?" revelou que:

- O diferencial técnico real (dataset CC-BY 4.0 estruturado, JSON-LD, audit trail em git, navegação per-candidato × per-tema × per-evento) **agrega valor zero para eleitor leigo** — agrega valor alto para jornalistas, pesquisadores e LLMs.
- SEO orgânico de eleitor leigo em queries YMYL eleitorais é jogo perdido contra Folha/Estadão/Lupa com domínio novo sem backlinks, especialmente sem rosto público (E-E-A-T).
- Eleitor brasileiro 2026 consome notícia política majoritariamente via Instagram/TikTok/YouTube/WhatsApp (Reuters Digital News Report 2025), não via Google → site de notícia.
- AI-search (ChatGPT, Perplexity, Claude, Gemini, Google AI Overview) cresce >100% YoY como vetor de descoberta de informação política — e JSON-LD estruturado é o caminho de Atlas virar citation.
- Um deal de embed editorial com Folha/Estadão/UOL gera mais alcance + autoridade transitiva do que 1000 sessões orgânicas individuais.

A premissa implícita precisava virar decisão consciente para destravar revisão consequente de métricas de sucesso, distribuição, compartilhabilidade e canais de retenção.

## Alternativas consideradas

1. **Eleitor leigo via SEO orgânico (status quo implícito):** declarar conscientemente que audiência primária é quem busca via Google/AI bots. Mantém design intacto.
   **Prós:** zero esforço; alinha com missão cívica direta.
   **Contras:** baixa probabilidade de tração T+3/T+6 (E-E-A-T + competição); diferencial técnico do Atlas não é o que essa audiência valoriza; risco alto de falhar gates.

2. **Mídia + acadêmico + LLM (escolhida):** declarar primária a audiência B2B (jornalistas, pesquisadores, sistemas de AI-search). Eleitor leigo alcançado **transitivamente** via mediadores que citam Atlas.
   **Prós:** aproveita diferencial real; leverage alto para solo founder; risco de E-E-A-T some (audiência avalia infra, não rosto); compatível com todas as 4 decisões cravadas; gates de sucesso ficam factíveis (backlinks, citações acadêmicas, citações em LLM, embeds, downloads).
   **Contras:** exige outreach controlado; demanda formato B2B adicional (docs de API, exemplos, embed widget); reframing de comunicação em `/sobre` e `/metodologia`.

3. **Mista por fase:** F1 (T+0 a T+6) foco B; F2 (T+6 a T+12) transição para A com base de autoridade acumulada.
   **Prós:** pragmático evolutivo; reconhece que autoridade SEO precisa ser construída antes.
   **Contras:** dilui foco quando foco é o recurso mais escasso; comunicação ambígua; dois playbooks para executar.

## Decisão

**Audiência primária declarada: mídia jornalística + acadêmico + sistemas de AI-search.**

Eleitor leigo é audiência **secundária**, alcançada via redistribuição — não via SEO direto. O caminho para eleitor leigo é:

```
Atlas → (citação em mídia, embed em matéria, citation em LLM) → eleitor leigo
```

Atlas otimiza primariamente para o **mediador**, não para o consumidor final. O consumidor final é beneficiário transitivo.

## Consequências

### O que muda

- **Critérios de sucesso ([[../../auto-memory/criterios-sucesso-atlas]]):** revisão obrigatória. Adicionar métricas de B2B/LLM:
  - Backlinks editoriais de domínios .com.br de mídia (contáveis via Ahrefs/Google Search Console)
  - Citações em respostas de LLM (Perplexity logs, NotebookLM, ChatGPT search)
  - Citações em papers acadêmicos (Google Scholar alert por "Atlas dos Candidatos")
  - Downloads do dataset (GitHub Releases analytics)
  - Embeds ativos do widget Atlas (telemetria opcional ou contagem por referer)
  - Uniques/mês orgânicos passa a métrica **secundária**, não primária.

- **Distribuição:** "soft launch silencioso" precisa ser reinterpretado.
  - Mantém: sem PR de mídia mass market, sem rosto público.
  - Adiciona: outreach controlado a jornalistas técnicos (Núcleo, Aos Fatos, Comprova, Folha Verifica, Estadão Verifica), pesquisadores eleitorais (FGV CPDOC, USP IRI, UnB IPOL), comunidade open data Brasil (Open Knowledge Foundation BR, Operação Serenata), e prompt engineering / AI research community (newsletter Latent Space, comunidade Hugging Face).
  - Sem perseguir cobertura jornalística sobre Atlas em si — perseguir uso de Atlas como fonte em matérias sobre candidatos.

- **Produto:** ganha duas features prioritárias derivadas dessa decisão:
  - **API JSON pública** (`/api/declaracoes.json`, `/api/candidatos.json`, `/api/temas.json`) versionada — facilita consumo por LLM e por jornalismo de dados.
  - **Embed widget** (`<iframe>` ou web component) — bloco "Declarações verificáveis de X sobre Y" que mídia pode incorporar em matérias.

- **Comunicação pública (`/sobre`, `/metodologia`, README):** reframear missão para mencionar audiência B2B sem perder vocabulário cívico. Atlas continua sendo "base pública aberta de declarações" — mas agora é claro para quem ele otimiza.

### Trade-offs aceitos

- Velocidade de adoção menor no curto prazo entre eleitores leigos diretos — aceitável porque eleitor leigo direto é cenário implausível no MVP independente da audiência declarada.
- Esforço de outreach precisa ser feito (8-15h/sem precisam acomodar 1-2h/sem de outreach).
- Risco percebido de "menos popular" — mitigado porque eleitor leigo é beneficiário transitivo e cards visuais compartilháveis cobrem distribuição direta quando relevante.

### Compatibilidade com decisões cravadas

- **[[Sem-Veredito-Proprio]]:** mantida intacta. Mídia/acadêmico/LLM consomem cascata de vereditos externos com a mesma transparência.
- **[[Stack-Astro-Estatico]]:** mantida intacta. API JSON e embed widget são gerados no mesmo build estático.
- **[[URLs-Estaveis]]:** mantida intacta. Rotas API (`/api/*.json`) são adições, não mudanças.
- **[[Licencas-MIT-CC-BY]]:** mantida intacta. CC-BY 4.0 é exatamente o que B2B/acadêmico precisa.
- **Sem rosto público** (decisão em [[../../auto-memory/decisoes-core-atlas]] #2): mantida intacta. Mídia/acadêmico avalia infra, não rosto.

## Sinais para reavaliar

- **T+6:** zero citações editoriais ou acadêmicas + zero aparições em LLM → revisar se outreach foi insuficiente OU se diferencial não é tão claro quanto pareceu. Considerar pivot para C (mista por fase) ou repensar produto.
- **T+12:** se Atlas tem tração B2B (citações + backlinks) mas zero alcance entre eleitores leigos via redistribuição → revisar features de compartilhamento direto (cards, RSS, newsletter).
- Mudança regulatória que crie barreira para mídia citar bases abertas (improvável mas possível) → revisar premissa de redistribuição transitiva.
- AI-search platafomas começam a desfavorecer fontes não-tradicionais → revisar peso relativo de mídia vs LLM dentro da audiência primária.
- Surgimento de competidor B2B com mesmo posicionamento (dataset estruturado de declarações eleitorais) → revisar diferencial.

## Derivações imediatas (próximas decisões a tomar)

Esta decisão é upstream das premissas I2-I6 (mapeadas em sessão 2026-05-28). Derivações em ordem natural:

1. **[[I3-Metricas-de-Sucesso]]** (a criar) — atualizar métricas para refletir audiência B2B/LLM
2. **[[I4-Compartilhabilidade]]** (a criar) — desenhar cards visuais e embed widget com posicionamento B2B + B2C indireto
3. **[[I2-Distribuicao]]** (a criar) — distinguir "soft launch" (sem PR mass) de "zero outreach" (incorreto); desenhar plano de outreach controlado
4. **[[I6-Canal-Ativo-com-Audiencia]]** (a criar) — RSS de "claim sem veredito", newsletter mensal opcional, alertas técnicos

## Links

- Postura geral: [[../Dominios/Postura-Editorial]]
- Decisões cravadas que continuam intactas: [[Sem-Veredito-Proprio]] · [[Stack-Astro-Estatico]] · [[URLs-Estaveis]] · [[Licencas-MIT-CC-BY]]
- Critérios de sucesso a revisar em derivação: `~/.claude/projects/.../memory/criterios-sucesso-atlas.md`
- Decisões core em memória que continuam intactas: `~/.claude/projects/.../memory/decisoes-core-atlas.md`
- Spec mestre: `docs/superpowers/specs/2026-05-27-atlas-design.md` (seção a ser atualizada com pointer para esta decisão)
- Sessão de revisão: 2026-05-28 (brainstorm crítico sobre diferencial e engajamento)
