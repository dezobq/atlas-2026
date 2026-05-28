---
tags: [decisao, produto, compartilhabilidade, distribuicao]
created: 2026-05-28
updated: 2026-05-28
status: ativo
dependencies: [[Audiencia-Primaria]]
---

# Decisão: Compartilhabilidade — Pacote completo sequencial (cards + API + embed)

## Contexto

Até esta sessão, compartilhabilidade no Atlas era **implícita**: link de página + OG image automática (Satori gera `public/og/<id>.png` 1200×630). Nenhum card visual autossuficiente, nenhum endpoint API público, nenhum embed widget para mídia. Otimização atual = preview de link em Twitter/X funciona bem, em WhatsApp grupo grande falha (preview some no scroll, raros clicam em links).

Decisão **[[Audiencia-Primaria]]** (cravada nesta mesma sessão 2026-05-28) declarou audiência primária como mídia + acadêmico + LLM, com eleitor leigo via redistribuição transitiva. Isso reverbera diretamente em compartilhabilidade:

- **Mídia** precisa de **embed widget** para incorporar bloco "Declarações de X sobre Y" em matérias sem fricção
- **LLMs** preferem **endpoint JSON versionado** (`/api/v1/*.json`) para crawling em massa — JSON-LD inline funciona mas é subótimo
- **Eleitor leigo via redistribuição (WhatsApp/Instagram/Stories)** precisa de **cards visuais autossuficientes** que carreguem a mensagem completa sem depender de clique em link

Adicionalmente, Satori já está no stack (gera OG images hoje) → custo marginal de cards extras é baixo. Pergunta original de 2026-05-28 sobre feature de compartilhamento é respondida diretamente pelos cards.

## Alternativas consideradas

1. **Status quo (link + OG automática):** zero esforço, já funciona para Twitter/X. Não atende B2B (embed) nem B2C indireto efetivo (WhatsApp grupo). Não responde sua pergunta original. **Rejeitada.**

2. **Pacote completo sequencial — cards + API + embed (escolhida):** três features em sequência prioritizada. Cobre B2C indireto + B2B + LLM. Aproveita Satori. Sinergia técnica forte (mesma source-of-truth, mesmo build).

3. **Só card visual (escopo mínimo):** responde a pergunta original direto mas deixa B2B (embed) e LLM (API) sem servir — desalinhado com [[Audiencia-Primaria]]. **Rejeitada.**

4. **Só embed + API (B2B puro):** alinha 100% com I1 mas não cobre B2C indireto via redes sociais. Deixa eleitor leigo (audiência secundária via redistribuição) sem artefato. **Rejeitada.**

## Decisão

**Pacote completo de artefatos de compartilhamento, em sequência priorizada:**

1. **Card visual de declaração** (Satori → PNG estático)
2. **API JSON pública** (`/api/v1/*.json` build-time, versionada)
3. **Embed widget** (web component + iframe fallback)

Cada uma é sprint independente (~1-5 dias). Pode pausar entre cada para validar. Sequência minimiza risco de explosão de escopo enquanto mantém sinergia técnica.

## Detalhamento por feature

### 1. Card visual de declaração

**Tecnologia:** Satori (já no stack), gerado build-time como PNG estático em `public/cards/<id>/<size>.png`.

**Conteúdo (todos os cards):**

- Declaração textual em destaque tipográfico (Geist Sans, contraste alto)
- Atribuição: candidato + data + evento + link primário
- Cascata de vereditos com fontes nomeadas e datadas:
  - _"Lupa, 12/04/2026: parcialmente falso"_
  - _"Aos Fatos, 14/04/2026: distorce"_
  - _"Comprova: sem registro até 28/05/2026"_
- URL Atlas: `atlas-2026.pages.dev/declaracoes/<id>` em rodapé
- QR code para a URL acima
- Rodapé fixo: _"Atlas dos Candidatos · 2026 · Não emite veredito · CC-BY 4.0"_

**Formatos gerados:**

| Formato   | Uso primário                                        |
| --------- | --------------------------------------------------- |
| 1200×630  | Twitter/X large card, WhatsApp preview, OG genérico |
| 1080×1350 | Instagram feed                                      |
| 1080×1920 | Stories/Reels                                       |
| 1200×1200 | Square (LinkedIn, Threads)                          |

**Variantes futuras (não-MVP):**

- Card de comparação temporal: _"Em 2024 candidato X disse A. Em 2026 disse B."_ (usa timeline existente)
- Card de "claim sem veredito": alerta para fact-checker — alinha com I6 (canal ativo, a definir)

**UI em `/declaracoes/[id]`:**

- Botão _"Baixar card"_ → menu com 4 tamanhos
- Botão _"Copiar link da imagem"_ → URL direta do PNG (compartilhar como imagem, não link)
- Botão _"Compartilhar"_ → intents nativos: WhatsApp / Twitter/X / Threads / Telegram

**Mitigações editoriais (críticas):**

- Atribuição visual forte de cada veredito (nome do fact-checker em fonte distintamente identificada + data ao lado)
- Rodapé fixo _"Atlas não emite veredito"_
- QR code visível em todos os cards → reduz risco de crop/edição maliciosa
- Termos de uso em `/sobre`: cards CC-BY 4.0; reuso requer atribuição _"Dados do Atlas dos Candidatos · 2026 (atlas-2026.pages.dev)"_

### 2. API JSON pública

**Endpoints build-time (Astro `.json.ts` em `src/pages/api/v1/`):**

```
/api/v1/declaracoes.json           — lista completa minificada
/api/v1/declaracoes/<id>.json      — declaração + vereditos + relacionados
/api/v1/candidatos.json            — lista
/api/v1/candidatos/<slug>.json     — candidato + declarações + temas dominantes
/api/v1/temas.json                 — lista
/api/v1/temas/<slug>.json          — tema + declarações por candidato
/api/v1/eventos.json               — lista
/api/v1/eventos/<id>.json          — evento + declarações
/api/v1/dataset/manifest.json      — pointer para JSONL/CSV completo (GitHub Releases)
/api/v1/openapi.json               — OpenAPI 3.1 spec
/api/v1/index.json                 — listagem de endpoints + versão atual
```

**Características:**

- Versionamento via URL (`/v1/`) — novo schema = nova versão; v1 fica para sempre
- CORS permissivo: `Access-Control-Allow-Origin: *`
- `Cache-Control: public, max-age=3600`
- Documentação em `/docs/api` com exemplos cURL + Python + JavaScript + MCP
- Schema JSON Schema por endpoint, regenerado via `pnpm generate-schemas`

### 3. Embed widget

**Web component vanilla (preferido) + fallback iframe (para hosts com CSP restritivo):**

```html
<!-- Bloco de declarações filtrado -->
<atlas-widget candidato="lula-luiz-inacio" tema="economia" limite="5"></atlas-widget>

<!-- Declaração específica com vereditos -->
<atlas-widget declaracao="2026-04-15-lula-economia-imposto"></atlas-widget>

<!-- Feed de claims sem veredito (alinha com I6 futuro) -->
<atlas-widget tipo="alerta-claim"></atlas-widget>

<!-- Fallback iframe -->
<iframe
  src="https://atlas-2026.pages.dev/embed/candidato/lula-luiz-inacio?tema=economia"
  width="100%"
  height="400"
  frameborder="0"
></iframe>
```

**Características:**

- Self-contained CSS (Shadow DOM no web component)
- Lazy-loading nativo
- Branding mínimo: _"via Atlas dos Candidatos"_ com link permanente
- Sem JavaScript de tracking, sem cookies, sem fingerprinting
- Telemetria opcional via 1×1 pixel image — contagem agregada por referer apenas (privacy by default)
- Playground/preview ao vivo em `/embed` com gerador de código copy-paste

**Outreach acoplado:**

Embed widget exige outreach a parceiros mídia para validar adoção real (5-10 jornais técnicos + 2-3 fact-checkers como teste). Isso vai estar no escopo de [[I2-Distribuicao]] (a definir).

## Consequências

### O que muda no produto

- **Novas rotas:** `/api/v1/*.json` (endpoints), `/embed/*` (preview embed), `/docs/api` (documentação), `/embed` (playground)
- **Novos componentes:** `CardActions.astro` (botões em `/declaracoes/[id]`), `AtlasWidget.ts` (web component)
- **Scripts novos:**
  - `scripts/generate-cards.ts` (já existe `generate-og-images.ts`; pode ser refatorado para multi-formato)
  - `scripts/generate-openapi.ts` (regenera OpenAPI a partir do Zod)
- **Build cresce:** estimativa +5-10MB para 60 declarações × 4 formatos de card. Aceitável em Cloudflare Pages (comprime bem).
- **Telemetria minimal:** opt-in via 1×1 pixel no widget; sem cookies.

### Trade-offs aceitos

- Build mais lento por causa de geração de cards (estimativa +30s para 60 declarações × 4 formatos)
- Manutenção de versões da API (v1 fica para sempre; mudança de schema → v2)
- Web component precisa funcionar em N stacks (WordPress, Vue, React, plain HTML) — testes manuais obrigatórios em 3-5 hosts diferentes

### Compatibilidade com decisões cravadas

- **[[Audiencia-Primaria]]:** cobre B2B (embed + API), LLM (API + JSON-LD), B2C indireto (cards). Total.
- **[[Sem-Veredito-Proprio]]:** mantida intacta. Cards exibem cascata de vereditos com atribuição forte; rodapé sempre lembra que Atlas não emite veredito.
- **[[Stack-Astro-Estatico]]:** mantida intacta. Endpoints são build-time `.json.ts`, embed é web component vanilla.
- **[[URLs-Estaveis]]:** novas rotas (`/api/v1/*`, `/embed/*`) adicionadas; nenhuma URL existente muda.
- **[[Licencas-MIT-CC-BY]]:** mantida intacta. CC-BY 4.0 cobre cards e API; atribuição obrigatória em termos de uso.
- **Sem rosto público:** mantida intacta. Nenhuma feature exige rosto.

## Sinais para reavaliar

- **Cards** circulando descontextualizados como "Atlas disse falso" → mitigação atual falhou; reforçar atribuição visual ou pausar geração de cards
- **API** sem uso após 6 meses (zero downloads, zero referer de mídia) → audiência B2B não está consumindo como esperado; reavaliar formato/documentação
- **Embed** sem adoção após outreach a 10+ parceiros → fricção técnica ou desinteresse; considerar pivotar para "screenshot Card" como alternativa
- **Build > 5min** consistentemente por causa de cards → considerar gerar cards on-demand via Cloudflare Worker
- Mudança em comportamento de LLM-search que desfavoreça endpoints JSON estáticos → revisar formato (JSON-LD vs JSON puro vs GraphQL)

## Sequência de implementação (não-vinculante; pode ajustar entre sprints)

| Ordem | Feature                   | Estimativa | Sprint sugerido                                  |
| ----- | ------------------------- | ---------- | ------------------------------------------------ |
| 1     | Card visual (4 formatos)  | 1-2 dias   | Após Sprint 5.2 (piloto 12 decl.) ou em paralelo |
| 2     | API JSON pública          | 1-2 dias   | Após card validado                               |
| 3     | Embed widget + playground | 3-5 dias   | Após API + outreach inicial                      |

Cada feature vai gerar spec próprio em `docs/superpowers/specs/` (writing-plans skill) na hora de implementar.

## Derivações imediatas

- **[[I2-Distribuicao]]** (a criar) — outreach acoplado à validação do embed widget; lista de parceiros prioritários
- **[[I3-Metricas-de-Sucesso]]** (a criar) — incluir contagem de cards baixados, downloads de API, embeds ativos como métricas primárias
- **[[I6-Canal-Ativo-com-Audiencia]]** (a criar) — RSS de "claim sem veredito" alimenta variante de card específica (feed de alerta)

## Links

- Audiência primária: [[Audiencia-Primaria]]
- Postura editorial: [[../Dominios/Postura-Editorial]]
- Cascata de vereditos: [[../Dominios/Cascata-de-Vereditos]]
- Stack: [[Stack-Astro-Estatico]]
- Licenças: [[Licencas-MIT-CC-BY]]
- Scripts existentes relevantes: `scripts/generate-og-images.ts`
- Sessão de revisão: 2026-05-28 (brainstorm crítico sobre diferencial e engajamento)
