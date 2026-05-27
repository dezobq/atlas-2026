---
projeto: Atlas dos Candidatos · 2026
data: 2026-05-27
autor: André (solo founder, anônimo público)
status: design aprovado — pronto para writing-plans
licenca: documento sob CC-BY 4.0
---

# Atlas dos Candidatos · 2026 — Design Document

> Memória factual da eleição presidencial brasileira de 2026.
> Declarações com fonte primária. Sem julgamento editorial.

---

## 1. TL;DR

Atlas é uma base **pública, aberta e indexável** de declarações documentais feitas por candidatos à presidência do Brasil em 2026. Cada declaração é apresentada com **fonte primária verificável** (vídeo timestamped, transcrição oficial, link arquivado). O produto **não emite veredito** sobre veracidade — quando há veredito de fact-checker reconhecido (Lupa, Aos Fatos, Comprova, etc), agregamos com transparência de atribuição.

A entrega inicial é um **site estático SEO-first** (Astro 5 + Tailwind v4 + shadcn/ui + Geist), com dataset paralelo publicado em **GitHub Releases + HuggingFace + Zenodo (DOI)**. Código sob MIT, dataset sob CC-BY 4.0.

MVP: 2 candidatos × ~30 declarações cada, lançável em 6 semanas. Cobertura cresce incrementalmente até o período eleitoral oficial (julho 2026).

Critério de sucesso: missão cívica + portfolio técnico. Receita não é alvo.

---

## 2. Motivação e Contexto

### Perfil do operador

| Dimensão                     | Valor                                                          |
| ---------------------------- | -------------------------------------------------------------- |
| Motivação primária           | Missão cívica + portfolio/aprendizado                          |
| Critério de sucesso          | Impacto real OU visibilidade técnica (receita = bônus)         |
| Recursos                     | 8-15h/sem · até R$ 2k/mês · ~17 meses até eleição              |
| Postura                      | Tecnicista neutro radical · sem rosto público                  |
| Distribuição existente       | Zero canais — precisa ser embutida no formato do produto       |
| Familiaridade com fact-check | Leitor casual (research participante necessário antes/durante) |

### Por que Atlas e não fact-checker?

O ecossistema brasileiro de fact-check (Lupa, Aos Fatos, Comprova, Estadão Verifica) é maduro, possui times editoriais, advogados e marca. Solo founder com 12h/semana **não consegue competir** nessa categoria.

Atlas se posiciona como **camada de infraestrutura factual** — não concorrente, mas **complementar** ao ecossistema existente. Fact-checkers podem (e devem) linkar para Atlas como fonte primária; Atlas pode (e deve) linkar para vereditos deles. Ganha-ganha.

### Riscos eliminados pela postura

- **Veredito = risco jurídico e editorial.** Atlas não emite. Risco transferido ou inexistente.
- **Rosto público = exposição pessoal.** Atlas opera sob marca, sem expor identidade. Risco reduzido.
- **Cobertura em tempo real = competição perdida.** Atlas opera assíncrono ("no dia seguinte, com fonte primária"). Permanência > velocidade.

---

## 3. Princípios Não-Negociáveis

1. **Toda declaração tem fonte primária ou não existe.** URL, timestamp e snapshot são obrigatórios.
2. **Sem rótulo de verdade/mentira.** O produto apresenta evidência. O leitor conclui.
3. **Igual rigor para todos.** Mesma régua editorial para cada candidato, sem exceção ideológica.
4. **Auditabilidade total.** Código + dataset + critérios públicos. Erros são corrigíveis publicamente via issues/PRs.
5. **Permanência.** Cada item tem URL canônica que nunca quebra. Snapshot guardado contra remoção de fontes.
6. **Não emitimos veredito.** Quando há veredito de terceiro reconhecido, agregamos com transparência sobre a fonte.
7. **Contexto adicional só é incluído quando documentável.** Em dúvida, omite.
8. **Disclaimer prominente em toda página.** Atlas não é fact-checker; é infraestrutura de fontes primárias.

---

## 4. Escopo (in/out)

### Dentro do escopo do MVP

- Site estático público em português brasileiro
- 2 candidatos prováveis × ~30 declarações documentadas cada
- Modelo de dados em git (markdown + YAML)
- Pipeline de ingestão semi-automatizado (yt-dlp, Firecrawl, Wayback API)
- Estrutura de URL estável + SEO completo (structured data JSON-LD, sitemap, OG dinâmico)
- Busca client-side (Pagefind)
- Dataset paralelo (JSON Lines + CSV) publicado em GitHub Releases
- Página de metodologia, FAQ, sobre, contribuir
- Open-source desde dia 1 (MIT código · CC-BY 4.0 dataset)
- Zenodo DOI para dataset (citação acadêmica)

### Fora do escopo do MVP (post-MVP ou nunca)

- Veredito próprio (nunca)
- Mapa de contradições (Direção C — descartada)
- Cobertura em tempo real (durante debates) (post-MVP, talvez nunca)
- Extensão de browser (Direção B — pós-MVP, depende de dataset maduro)
- Tradução para outros idiomas (post-MVP)
- App mobile nativo (nunca)
- Funcionalidades de comentário/discussão dentro do Atlas (nunca)
- Análise de sentimento ou predição (nunca)
- Cobertura de candidatos a outros cargos (governadores, senadores, etc) — post-MVP
- Integração com APIs pagas do X/Twitter (post-MVP, só se necessário)

---

## 5. Modelo de Dados

Quatro entidades centrais. Persistência inicial: **markdown + YAML em git**. Migração para Turso (libSQL) quando volume justificar.

### 5.1 Candidato

```yaml
id: string                # ULID
slug: string              # url-safe, ex: "candidato-a"
nome: string
foto_url: string
partido: string
biografia_minima: string  # 2-3 frases factuais
contas_oficiais:
  - plataforma: "youtube" | "x" | "instagram" | "facebook" | "tiktok"
    handle: string
    url: string
    verificada: boolean
criado_em: ISO 8601
atualizado_em: ISO 8601
```

### 5.2 Evento

```yaml
id: string                          # ULID
titulo: string
data: ISO 8601
tipo: "debate" | "entrevista" | "comicio" | "post_rede_social" | "sabatina" | "declaracao_oficial"
local:
  fisico: string | null
  digital: string | null            # plataforma se digital
duracao_minutos: number | null
fonte_primaria_url: string          # link canônico da gravação/transcrição completa
fonte_primaria_tipo: "youtube_oficial" | "tse" | "camara" | "senado" | "midia_consolidada" | "rede_social_oficial"
archive_url: string                 # snapshot Wayback Machine
candidatos_envolvidos:
  - candidato_id: string
descricao: string                   # contexto editorial neutro
criado_em: ISO 8601
atualizado_em: ISO 8601
```

### 5.3 Declaração (entidade central)

```yaml
id: string                          # ULID
slug: string                        # url-safe, ex: "2026-11-02-candidato-a-economia-imposto-renda"
candidato_id: string
evento_id: string

texto: string                       # citação literal transcrita
timestamp_no_evento: string         # HH:MM:SS se vídeo/áudio
contexto: string                    # 1-2 frases neutras sobre o que foi perguntado

tema_principal: string              # slug
temas_secundarios: [string]         # slugs

tipo_estrutural:                    # taxonomia neutra (não-veredito)
  - "promessa" | "dado_numerico" | "atribuicao_a_terceiro" |
    "afirmacao_historica" | "comparacao" | "afirmacao_sobre_pesquisa" |
    "compromisso_politico" | "interpretacao_pessoal"

fonte_primaria_url: string
fonte_primaria_tipo: "youtube_oficial" | "tse" | "camara" | "senado" | "midia_consolidada" | "rede_social_oficial"
archive_url: string                 # snapshot Wayback Machine
snapshot_interno_path: string | null # backup local opcional

contexto_adicional:                 # opcional, só quando rigorosamente documentável
  texto: string
  fontes:
    - tipo: string
      url: string
      data: ISO 8601

vereditos_externos:                 # quando fact-checker reconhecido avaliou
  - veiculo: "Lupa" | "Aos Fatos" | "Comprova" | "Estadão Verifica" | string
    classificacao: string           # texto exato do veredito do veículo
    url: string
    data: ISO 8601
    citacao_curta: string           # trecho representativo do veredito

versao: number                      # incrementado a cada edição
criado_em: ISO 8601
atualizado_em: ISO 8601
```

### 5.4 Tema

```yaml
id: string
slug: string                        # ex: "economia", "saude", "seguranca-publica"
nome: string
descricao_curta: string
nivel: "primario" | "secundario"
tema_pai_id: string | null          # hierarquia opcional
```

### 5.5 Decisões importantes embutidas

- **Sem campo `verdadeiro/falso`** — por design, para todo sempre.
- **Sem campo `contradição`** — Direção C descartada explicitamente.
- **`archive_url` obrigatório** — defesa contra remoção de fontes.
- **`versao` + git history** — auditabilidade total. Declaração corrigida nunca é deletada.
- **`vereditos_externos` é array** — múltiplos fact-checkers podem ter avaliado a mesma declaração.

---

## 6. Arquitetura Técnica e Stack

### 6.1 Stack consolidada

```
Framework            → Astro 5
Interatividade       → React 19 islands (busca, filtros, modal)
Design system        → Tailwind v4 + shadcn/ui
Tipografia           → Geist Sans + Geist Mono (Vercel-grade)
Iconografia          → Lucide React
Animations           → View Transitions API + Framer Motion
Banco (futuro)       → Turso (libSQL) — free tier 9GB, 1B reads/mês
Banco (MVP)          → Markdown + YAML em git
Hosting              → Cloudflare Pages (gratuito, CDN global)
Busca                → Pagefind (client-side estática)
Archive              → Internet Archive Save Page Now API (gratuito)
Scraping             → yt-dlp · Firecrawl MCP · Playwright (último caso)
Transcrição          → Whisper (local ou OpenAI API)
CMS / Admin          → Decap CMS ou form simples (source: markdown em git)
Dataset publication  → GitHub Releases + HuggingFace dataset card + Zenodo DOI
Repo                 → GitHub público (MIT)
CI/CD                → GitHub Actions
Analytics            → Plausible self-hosted ou Umami (~R$ 20/mês)
OG images            → Satori (gerado em build time)
```

### 6.2 Custo mensal MVP

| Item                    | Custo                 |
| ----------------------- | --------------------- |
| Cloudflare Pages        | R$ 0                  |
| GitHub (repo público)   | R$ 0                  |
| Turso free tier         | R$ 0                  |
| Wayback Machine         | R$ 0                  |
| HuggingFace dataset     | R$ 0                  |
| Zenodo DOI              | R$ 0                  |
| Domain `.com.br`        | ~R$ 40/ano            |
| Whisper (se OpenAI API) | ~R$ 30/mês (estimado) |
| Analytics self-hosted   | ~R$ 20/mês (opcional) |
| **Total**               | **R$ 0 - 50/mês**     |

Bem abaixo do teto de R$ 2k/mês.

### 6.3 Arquitetura em camadas

```
┌───────────────────────────────────────────────────────────────┐
│  Camada Pública (HTML estático no Cloudflare CDN)             │
│  → /, /candidatos/[slug], /declaracoes/[id]                   │
│  → /temas/[slug], /eventos/[id]                               │
│  → /dataset, /metodologia, /sobre, /contribuir, /buscar       │
└───────────────────────────────────────────────────────────────┘
                              ↑
                       (build time, Astro)
                              ↑
┌───────────────────────────────────────────────────────────────┐
│  Camada de Dados (git repo)                                   │
│  data/candidatos/*.yaml                                       │
│  data/eventos/*.yaml                                          │
│  data/declaracoes/*.md   (markdown + frontmatter YAML)        │
│  data/temas/*.yaml                                            │
└───────────────────────────────────────────────────────────────┘
                              ↑
                              ↑
┌───────────────────────────────────────────────────────────────┐
│  Camada de Ingestão (scripts locais + admin manual)           │
│  scripts/scrape-youtube.ts                                    │
│  scripts/scrape-url.ts                                        │
│  scripts/archive.ts                                           │
│  scripts/transcribe.ts                                        │
│  scripts/validate-data.ts (CI obrigatório)                    │
│  scripts/generate-og-images.ts                                │
└───────────────────────────────────────────────────────────────┘
```

---

## 7. Pipeline de Ingestão (3 níveis de esforço)

| Nível                              | Fonte                                                                      | Pipeline                                                                                     | Esforço/item |
| ---------------------------------- | -------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------- | ------------ |
| **1 — Fácil (automatizável)**      | YouTube oficial · TSE · Diário Oficial · transcrições Câmara/Senado        | Script baixa + Whisper transcreve + você seleciona trechos                                   | ~5-10 min    |
| **2 — Médio (semi-auto)**          | Mídia consolidada (G1, Folha, UOL, BBC Brasil, Estadão) com vídeo embedado | Cola URL → script extrai metadata + screenshot + Wayback → você confirma trecho + timestamp  | ~10-15 min   |
| **3 — Difícil (manual+assistido)** | Posts X/IG/FB/TikTok oficiais verificados                                  | Cola URL → script tenta Wayback + screenshot + yt-dlp se vídeo → você transcreve manualmente | ~20-30 min   |

### 7.1 Princípios da ingestão

- **AI não gera conteúdo.** AI só ajuda em: transcrição bruta (Whisper), sugestão de tags estruturais, busca semântica (post-MVP).
- **Toda transcrição é revisada por você** antes de virar declaração publicada.
- **Wayback Machine é obrigatório** em cada item — sem exceção.
- **Snapshot interno** quando Wayback falha (raro, mas possível com X bloqueando).
- **Disclosure de IA** na metodologia: "transcrições brutas geradas por Whisper, revisadas humanamente".

### 7.2 Operação durante eventos ao vivo

**Não fazemos cobertura ao vivo no MVP.** Cobertura é assíncrona: 24-48h após o evento, processamos declarações relevantes.

Razões:

1. Tempo real = competir com Twitter, jogo perdido para solo founder.
2. Valor agregado do Atlas é **permanência e rigor**, não velocidade.
3. Slogan operacional: "no dia seguinte, com fonte primária."

---

## 8. Interface e Arquitetura de Informação

### 8.1 Rotas principais

```
/                              ← home (dashboard editorial, não-blog)
/candidatos                    ← índice de candidatos
/candidatos/[slug]             ← perfil + timeline + filtros
/declaracoes/[id]              ← PÁGINA-CHAVE para SEO
/eventos                       ← índice por data/tipo
/eventos/[id]                  ← evento + lista de declarações dele
/temas                         ← índice
/temas/[slug]                  ← agregação por tema, cross-candidato
/buscar                        ← busca textual + filtros
/dataset                       ← download CSV/JSON + schema documentado
/metodologia                   ← critérios, hierarquia de fontes, disclosures
/sobre                         ← projeto + autor (sem rosto, mas identificável)
/contribuir                    ← guia (issues + PRs + sugestão de fonte)
/api/                          ← endpoints opcionais (JSON) post-MVP
```

### 8.2 Visual identity

- **Paleta**: slate/zinc neutros + accent neutro (cinza-azul ou cinza-âmbar). Evitar verde/vermelho (sugerem veredito).
- **Tipografia**: Geist Sans + Geist Mono. Sinaliza "ferramenta séria de pesquisa".
- **Densidade**: alta — jornalista/pesquisador precisa de muita informação por viewport.
- **Microinterações**: hover refinados, View Transitions API entre páginas, foco visível (WCAG AA).
- **Tom**: Vercel/Linear/The Pudding/Anthropic. **Não** Lupa/Aos Fatos atuais, **não** Wikipedia, **não** "civic tech bonzinho".

### 8.3 Layout da página de Declaração (a mais importante para SEO)

```
┌───────────────────────────────────────────────────────────────┐
│  Atlas / Declarações / [ID]                          [share]  │
├───────────────────────────────────────────────────────────────┤
│  ▌ CITAÇÃO LITERAL                                            │
│  "Texto exato da declaração, palavra por palavra."            │
│  ─ Candidato A · Debate Band · 02 nov 2026 · 21:34            │
├───────────────────────────────────────────────────────────────┤
│  Contexto                                                     │
│  Em resposta a [X], no bloco de [Y].                          │
├───────────────────────────────────────────────────────────────┤
│  Tipo estrutural                                              │
│  [promessa] [dado numérico] [comparação histórica]            │
├───────────────────────────────────────────────────────────────┤
│  Fonte primária                                               │
│  ▶ YouTube Band · 02:14:34–02:15:08                           │
│    [abrir no YouTube] [ver no Wayback] [baixar snapshot]      │
├───────────────────────────────────────────────────────────────┤
│  Contexto adicional (documentado)                             │
│  • Pesquisa citada: IBGE 2023, link direto                    │
│  • Pesquisa relacionada do mesmo instituto: link direto       │
├───────────────────────────────────────────────────────────────┤
│  Vereditos de fact-checkers (agregados, externos)             │
│  • Lupa — "Falso" — link · data                               │
│  • Aos Fatos — "Exagerado" — link · data                      │
├───────────────────────────────────────────────────────────────┤
│  Declarações relacionadas                                     │
│  [card] [card] [card]                                         │
├───────────────────────────────────────────────────────────────┤
│  Edições recentes (auditoria pública)                         │
│  • 03 nov: correção de timestamp · [diff no git]              │
└───────────────────────────────────────────────────────────────┘
```

---

## 9. SEO Strategy

### 9.1 URLs

- Humanas, estáveis, hierárquicas
- `/declaracoes/2026-11-02-candidato-a-economia-imposto-renda`
- **Nunca quebram.** Redirects 301 quando estrutura muda. URLs antigas mantidas no sitemap.

### 9.2 Structured Data (JSON-LD)

- `Schema.org/Person` para cada candidato
- `Schema.org/Quotation` para cada declaração (com `creator` → candidato, `citation.url` → fonte)
- `Schema.org/Event` para debates/entrevistas
- `Schema.org/Article` wrapping para cada página de declaração
- `Schema.org/Dataset` para a página `/dataset`

### 9.3 Meta + Open Graph

- Title e description únicos por página, ricos em palavras-chave naturais (não keyword-stuffing)
- OG image dinâmica gerada em build time com **Satori** (candidato + citação + data)
- Twitter Cards configuradas

### 9.4 Sitemap e robots

- `sitemap.xml` automático (Astro integration)
- `robots.txt` permissivo — queremos indexação total, inclusive por AI-bots (visibilidade em respostas de chatbots)

### 9.5 Lighthouse targets

- Performance ≥ 95
- Accessibility ≥ 95 (WCAG 2.2 AA)
- Best Practices ≥ 95
- SEO ≥ 95
- LCP < 2.5s · CLS < 0.1 · INP < 200ms

Astro estático entrega isso na configuração padrão. Não negociar para baixo.

---

## 10. Open-Source Strategy

### 10.1 Licenças

| Componente                                   | Licença                              |
| -------------------------------------------- | ------------------------------------ |
| Código                                       | MIT                                  |
| Dataset                                      | CC-BY 4.0 (atribuição obrigatória)   |
| Conteúdo editorial (descrições, metodologia) | CC-BY 4.0                            |
| Citações de candidatos                       | Fair use (citação factual com fonte) |

### 10.2 Arquivos obrigatórios no repo

- `README.md` — robusto: o que é, como usar, como contribuir, ética
- `CONTRIBUTING.md` — como propor correção via issue ou PR
- `CODE_OF_CONDUCT.md` — padrão Contributor Covenant 2.1
- `SECURITY.md` — disclosure policy
- `GOVERNANCE.md` — você decide; comunidade sugere via issues/PRs
- `METODOLOGIA.md` — critérios editoriais públicos
- `SCHEMA.md` — schema do dataset (humano + JSON Schema linkado)

### 10.3 Issue templates

- `correcao-factual.yml` — erro em citação, timestamp, atribuição
- `fonte-sugerida.yml` — declaração documentada que falta no Atlas
- `bug.yml` — bug técnico no site
- `duvida.yml` — pergunta sobre metodologia

---

## 11. Dataset Paralelo

| Aspecto           | Decisão                                                                              |
| ----------------- | ------------------------------------------------------------------------------------ |
| Formatos          | JSON Lines (`.jsonl`) + CSV simétrico                                                |
| Schema            | `SCHEMA.md` + JSON Schema linkado                                                    |
| Publicação        | GitHub Releases (tag por release) + HuggingFace dataset card                         |
| Frequência MVP    | A cada release tag (manual)                                                          |
| Frequência futura | Automatizado via GitHub Action (semanal ou por commit)                               |
| Versionamento     | SemVer adaptado: MAJOR=schema, MINOR=novos candidatos/temas, PATCH=novas declarações |
| DOI               | Zenodo (gera DOI citável a cada release)                                             |

---

## 12. Workflow Operacional Semanal (8-15h/sem)

| Atividade                              | Horas/sem | Quando (sugestão)        |
| -------------------------------------- | --------- | ------------------------ |
| Ingestão (scraping + organização)      | 2h        | Domingo                  |
| Curadoria + transcrição manual         | 4-6h      | 2-3 sessões distribuídas |
| Melhoria de produto (UX, código)       | 2-3h      | Fins de semana           |
| Monitoramento (analytics, issues, PRs) | 1-2h      | Diluído                  |
| Comunicação (issues, divulgação leve)  | 1h        | Quando aparece           |

**Antifrágil**: se uma semana só rende 4h, foca em ingestão. Resto do pipeline aguenta atraso temporário.

---

## 13. Riscos e Mitigações

| Risco                                | Severidade  | Probabilidade | Mitigação                                                                                             |
| ------------------------------------ | ----------- | ------------- | ----------------------------------------------------------------------------------------------------- |
| Acusação de viés político            | Média       | Alta          | Código + dataset abertos · log de edições público · paridade rígida de critério                       |
| Processo por difamação               | Baixa-Média | Baixa         | Zero veredito próprio · agregamos vereditos externos com atribuição clara                             |
| TSE Res. 23.732/2024 (IA generativa) | Baixa       | Baixa         | Não usamos IA generativa para conteúdo · só transcrição (Whisper) · disclosure público na metodologia |
| LGPD                                 | Baixa       | Baixa         | Políticos públicos em contexto público (Art. 7 §III LGPD) · privacy policy explícita                  |
| Scraping cinzento (X/IG/FB)          | Média       | Alta          | Wayback como fallback obrigatório · manual quando não escala · respeitar robots.txt                   |
| Remoção/edição de fonte primária     | Alta        | Quase certa   | Snapshot interno + Wayback API obrigatórios em cada item                                              |
| Burnout do solo founder              | Média       | Média         | Cobertura limitada (2 cand.) · workflow definido · gates de parada honestos                           |
| Erro factual descoberto no Atlas     | Alta        | Quase certa   | Auditoria via git · processo público de correção · página de errata visível                           |
| Confundir Atlas com fact-checker     | Alta        | Alta          | Disclaimer prominente em TODA página · FAQ clara · metodologia destacada                              |

---

## 14. Roadmap MVP (6 Semanas)

| Sprint      | Foco                    | Entregáveis                                                                              |
| ----------- | ----------------------- | ---------------------------------------------------------------------------------------- |
| **0** (pré) | Setup e decisões        | Repo público · design tokens · identidade visual · fonts · paleta                        |
| **1**       | Infra base              | Astro + Tailwind v4 + shadcn + layout mestre + tipografia + design system                |
| **2**       | Modelo de dados         | Schema YAML/Markdown · validação CI · páginas estáticas candidato/declaração/evento/tema |
| **3**       | Pipeline ingestão       | Scripts: yt-dlp · Firecrawl · Wayback · Whisper transcript · OG image gen (Satori)       |
| **4**       | SEO + busca             | JSON-LD structured data · sitemap · Pagefind · robots · OG dinâmico                      |
| **5**       | Conteúdo MVP            | 2 candidatos × 30 declarações · dataset jsonl+csv · GitHub Releases v0.1.0               |
| **6**       | Polimento + soft launch | Zenodo DOI · README robusto · FAQ · metodologia · soft launch silencioso                 |

**Soft launch silencioso** = publicar, deixar Google indexar, sem alarde. Tração orgânica leva 4-12 semanas pós-launch.

---

## 15. Métricas Objetivas e Gates de Continuidade

| Marco                                   | Métricas                                                                                    | Veredito honesto |
| --------------------------------------- | ------------------------------------------------------------------------------------------- | ---------------- |
| **T+0 (lançamento)**                    | Site no ar · 60 declarações · Lighthouse 95+ · MIT no GitHub                                | Sucesso técnico  |
| **T+3 meses**                           | 150 declarações · 200+ uniques/mês orgânicos · ≥3 mentions externas · ≥10 dataset downloads | Tração mínima    |
| **T+6 meses** (início campanha oficial) | 400+ declarações · 1k+ uniques/mês · ≥1 citação acadêmica ou jornalística                   | Validação        |
| **T+12 meses** (mês da eleição)         | Operando ao vivo · ≥5k uniques/mês durante debates                                          | Impacto real     |

### Gates de parada honestos

- **T+3 meses**, < 50 uniques/mês orgânicos → revisar SEO + repensar distribuição. Não desistir ainda.
- **T+6 meses**, sem tração mínima → aceitar como projeto de portfolio. Parar de expandir conteúdo.
- **T+12 meses**, ZERO uso relatado → arquivar dignamente. Não é fracasso; é dado empírico.

Nenhuma métrica é financeira — coerente com motivação declarada (missão + portfolio, não receita).

---

## 16. TEP — Plano de Teste e Evidência

(Obrigatório pelo CLAUDE.md global.)

| Item                       | Como testar                                                                          | Evidência                        |
| -------------------------- | ------------------------------------------------------------------------------------ | -------------------------------- |
| Lighthouse ≥ 95            | `npm run build && lhci autorun`                                                      | Relatório HTML no Vault          |
| Schema validation          | `npm run validate-data` (CI obrigatório)                                             | CI logs                          |
| Structured data            | Google Rich Results Test                                                             | Screenshot do pass               |
| Acessibilidade WCAG 2.2 AA | axe-core + screen reader manual (NVDA/VoiceOver)                                     | Audit report                     |
| LCP < 2.5s                 | WebPageTest + PageSpeed Insights                                                     | Reports salvos no Vault          |
| Dataset integrity          | JSON Schema + amostragem aleatória manual                                            | CI logs + `sample-validation.md` |
| Anti-regressão             | Mapa de impacto no Vault antes de cada feature                                       | `docs/mapa-impacto-[feature].md` |
| Verificação de fontes      | Cada PR de declaração checa: URL acessível + archive_url presente + timestamp válido | CI check obrigatório             |

---

## 17. Considerações Futuras (Roadmap V2+)

Itens registrados para reflexão posterior — **não fazem parte do MVP**.

### 17.1 Sustentabilidade financeira (crowdfunding)

Quando Atlas tiver tração mínima (T+3 meses+), considerar:

| Plataforma               | Tipo                                 | Vantagem                                                                   | Encaixe |
| ------------------------ | ------------------------------------ | -------------------------------------------------------------------------- | ------- |
| **Open Collective**      | Recorrente + one-shot · transparente | Mostra todas as despesas publicamente; padrão ouro para open-source cívico | Alta    |
| **GitHub Sponsors**      | Recorrente · USD                     | Zero atrito para devs apoiarem                                             | Alta    |
| **Apoia.se / Padrim**    | Recorrente · BRL                     | Audiência brasileira em massa                                              | Média   |
| **Ko-fi / BuyMeACoffee** | One-shot + recorrente                | Baixíssima taxa, simples                                                   | Média   |
| **Pix doação + cripto**  | One-shot                             | Apoiadores anônimos                                                        | Média   |

**Política sugerida**: 100% das doações usadas para infra + dataset paralelo + dois pontos auditáveis em relatório trimestral público. Sem retirada para si até o projeto sustentar todos os custos operacionais.

**Não fazer**: parcerias pagas com partidos, campanhas ou veículos com bandeira política. Aceita-se grant de fundação cívica (Ford, Mozilla, Knight, MacArthur, Itaú Social, etc) com disclosure pública.

### 17.2 Engajamento (pós-tração)

Considerar quando T+3 meses passar com tração mínima:

- **Newsletter mensal**: "O que adicionamos no Atlas em [mês]" — gratuita, opt-in, sem marketing pesado
- **GitHub Discussions ativo**: comunidade técnica em torno do dataset
- **Apresentações em conferências técnicas** brasileiras (Python Brasil, RubyConf, Node BR, Linux Day) — sob pseudônimo se necessário
- **Posts técnicos sobre o projeto** (dev.to, Medium, Substack) — foco em decisões de design, não em política
- **Visualizações virais derivadas do dataset** — mapas, infográficos, comparações (estilo The Pudding)
- **Bots de redes sociais** (X, Mastodon BR, Bluesky): **somente** posts neutros do tipo "declaração nova adicionada", **nunca** com comentário editorial — risco de virar partidário sem querer
- **Reddit r/brasil, r/brasilivre**: posts curados quando relevantes — risco médio de moderação
- **Parceria fria com mídia/ONG** (post-T+6 meses): apresentar como recurso complementar, não substituto

### 17.3 Extensão de browser (Direção B do brainstorm)

Pós-T+6 meses, quando dataset tiver cobertura razoável (400+ declarações):

- Extensão Chrome MV3 que detecta citações de candidatos em posts/notícias
- Sublinha o trecho e oferece "ver fonte primária" via overlay com link direto para `/declaracoes/[id]` do Atlas
- Open-source desde dia 1 (MIT)
- Acoplamento mínimo: extensão consome JSON estático do Atlas, não tem backend próprio
- Distribuição via Chrome Web Store + Firefox Add-ons + GitHub Releases (sideload)

### 17.4 Outros itens parking lot

- **Cobertura ao vivo durante debates** — só se equipe crescer (não-MVP)
- **API JSON pública** com rate limit — quando demanda aparecer
- **Versões em inglês** das páginas-chave — para citação internacional
- **Cobertura de candidatos a outros cargos** (governadores, senadores) — pós-2026
- **Análise comparativa entre candidatos** — apresentação visual de declarações lado a lado por tema, sem julgamento
- **Integração com Wikidata** — IDs canônicos de candidatos e eventos

---

## 18. Glossário

- **Declaração**: trecho específico do que um candidato disse, com fonte primária linkada.
- **Fonte primária**: gravação oficial, transcrição oficial, ou post de conta oficial verificada — nunca "ouvi dizer".
- **Veredito externo**: avaliação de veracidade emitida por fact-checker reconhecido (Lupa, Aos Fatos, etc).
- **Tipo estrutural**: taxonomia neutra que classifica a declaração por **forma**, não por **veracidade**.
- **Snapshot**: cópia preservada da fonte (via Wayback ou local) para proteção contra remoção.
- **Soft launch**: lançar publicamente sem alarde — deixar SEO orgânico atrair tráfego.

---

## 19. Histórico de Decisões-Chave (rationale resumido)

| Decisão                           | Alternativa rejeitada              | Razão                                                                      |
| --------------------------------- | ---------------------------------- | -------------------------------------------------------------------------- |
| Atlas como infraestrutura factual | Fact-checker editorial próprio     | Solo founder não escala fact-check; categoria saturada                     |
| Sem veredito próprio              | Veredito (verdade/mentira/parcial) | Risco editorial + jurídico; quebra postura tecnicista                      |
| Agregador de vereditos externos   | Sem mencionar vereditos            | Adiciona valor sem reintroduzir risco                                      |
| Tecnicista neutro sem rosto       | Curador identificado               | Reduz exposição pessoal + risco reputacional                               |
| Astro 5                           | Next.js 15                         | Performance/SEO sem JS overhead; conteúdo majoritariamente estático        |
| Markdown em git (MVP)             | Banco de dados desde início        | Audit trail nativo · zero infra · backups gratuitos via mirrors            |
| Cobertura assíncrona              | Tempo real                         | Competir com Twitter é jogo perdido; valor é permanência                   |
| Soft launch silencioso            | Lançamento com PR/divulgação       | Sem network · SEO orgânico precisa de tempo · evitar atenção indevida cedo |
| Open-source desde dia 1           | Open-source depois de MVP estável  | Defesa anti-viés + portfolio + colaboração externa desde início            |
| 2 candidatos × 30 declarações     | 6+ candidatos × 80 declarações     | Risco de virar projeto que nunca lança                                     |
| Crowdfunding adiado               | Crowdfunding desde MVP             | Sem tração não há razão para captar; T+3 meses mínimo                      |

---

## 20. Próximos Passos (após aprovação deste design)

1. **Invocar writing-plans** (próxima skill) para criar plano de implementação detalhado, sprint a sprint.
2. **Criar repo público** no GitHub com README inicial + licença MIT.
3. **Reservar domínio** `.com.br` (sugerido: `atlas2026.com.br` ou similar — decidir).
4. **Setup base do projeto** (Astro + Tailwind + shadcn + Geist) — Sprint 1.

---

## Apêndice A — Referências externas

- **Lupa** — https://lupa.uol.com.br/
- **Aos Fatos** — https://www.aosfatos.org/
- **Comprova** — https://projetocomprova.com.br/
- **Estadão Verifica** — https://www.estadao.com.br/estadao-verifica/
- **Agência Pública** — https://apublica.org/
- **TSE** — https://www.tse.jus.br/
- **Resolução TSE 23.732/2024** — sobre IA generativa em eleições
- **LGPD (Lei 13.709/2018)** — Art. 7º §III sobre dados de figuras públicas
- **Internet Archive Save Page Now** — https://web.archive.org/save/
- **Zenodo (DOI service)** — https://zenodo.org/

## Apêndice B — Stack: links de referência

- Astro 5 — https://astro.build/
- Tailwind v4 — https://tailwindcss.com/
- shadcn/ui — https://ui.shadcn.com/
- Geist Font — https://vercel.com/font
- Pagefind — https://pagefind.app/
- Cloudflare Pages — https://pages.cloudflare.com/
- Turso (libSQL) — https://turso.tech/
- Satori (OG images) — https://github.com/vercel/satori
- Firecrawl — https://firecrawl.dev/
- yt-dlp — https://github.com/yt-dlp/yt-dlp
- Decap CMS — https://decapcms.org/
