# Design — Card visual de declarações (MVP da feature 1 de I4)

**Data:** 2026-05-28
**Fonte:** brainstorm tático após brainstorm estratégico de 2026-05-28
**Decisão pai:** `Vault/Decisoes/I4-Compartilhabilidade.md` (sub-seção 5.1)

## 1. Contexto

O card visual de declaração é a **primeira feature** do pacote sequencial cravado em `I4-Compartilhabilidade.md`. Serve duas audiências definidas em `Audiencia-Primaria.md`:

- **B2C indireto** (eleitor leigo via redistribuição em WhatsApp/Twitter/Instagram/Stories) — artefato autossuficiente que carrega a mensagem completa sem depender de clique em link
- **B2B leve** (jornalista usa em matéria como ilustração) — alternativa visual quando texto puro não basta

Este spec detalha decisões técnicas finas que `I4-Compartilhabilidade.md` deixou em aberto, cravadas em brainstorm tático posterior.

## 2. Decisões cravadas

### 2.1 Paleta cromática

- **Fundo:** `#FAFAFA` (off-white, jornalístico)
- **Texto primário:** `#0A0A0A` (quase-preto, contraste alto sem ser puro)
- **Texto secundário:** `#525252` (cinza médio para metadados)
- **Borda divisória:** `#E5E5E5` (cinza muito claro)
- **Acento Atlas:** `#171717` (preto puro reservado para marca do Atlas no rodapé)

Tom: neutro, jornalístico, sem associações com marcas de tech (Vercel/Linear/Anthropic) ou com paletas políticas (vermelho/azul). Funciona tanto em WhatsApp claro quanto Twitter modo claro/escuro.

### 2.2 Tipografia

**Fonte única:** Geist Sans (já no projeto; suporta `Latin Extended` com acentos PT-BR e demais glifos necessários; Satori-compatível via TTF).

**Escala dinâmica em 3 faixas (declaração principal):**

| Comprimento da declaração | Tamanho da fonte (1200×630) | Comportamento                                                                                          |
| ------------------------- | --------------------------- | ------------------------------------------------------------------------------------------------------ |
| ≤ 120 caracteres          | 72pt                        | Texto integral, centralizado verticalmente                                                             |
| 120-300 caracteres        | 54pt                        | Texto integral, leading 1.2                                                                            |
| > 300 caracteres          | 40pt                        | Truncamento em **280 chars + "…"** + linha "Ver completo: atlas-2026.pages.dev/declaracoes/&lt;id&gt;" |

**Tamanhos derivados por formato (proporcional):**

| Formato                             | Multiplicador da escala base 1200×630  |
| ----------------------------------- | -------------------------------------- |
| 1200×630 (Twitter/X, OG)            | 1.0×                                   |
| 1200×1200 (square LinkedIn/Threads) | 1.0×                                   |
| 1080×1350 (Instagram feed)          | 0.95×                                  |
| 1080×1920 (Stories/Reels)           | 0.9× (mais espaço para verticalização) |

**Hierarquia tipográfica (limitada a 2 pesos disponíveis em `assets/fonts/`: Regular 400 e Medium 500):**

| Elemento                                                              | Tamanho 1200×630   | Peso          |
| --------------------------------------------------------------------- | ------------------ | ------------- |
| Wordmark "Atlas dos Candidatos · 2026"                                | 24pt               | 500 (medium)  |
| Declaração principal                                                  | 40-72pt (3 faixas) | 500 (medium)  |
| Atribuição (candidato · data · evento)                                | 22pt               | 400 (regular) |
| Nome do fact-checker                                                  | 24pt               | 500 (medium)  |
| Texto do veredito                                                     | 24pt               | 400 (regular) |
| URL `atlas-2026.pages.dev/declaracoes/<id>`                           | 20pt               | 500 (medium)  |
| Rodapé "Atlas dos Candidatos · 2026 · Não emite veredito · CC-BY 4.0" | 18pt               | 400 (regular) |

Hierarquia visual decorre de **tamanho** + **peso** + **cor** sem precisar de Semibold/Bold. Caso testes visuais revelem hierarquia insuficiente, adicionar Geist-SemiBold.ttf em `assets/fonts/` numa task futura.

### 2.3 Tratamento dos vereditos (mitigação M1+M2+M3 cravada)

**Princípio inviolável:** cor identifica o **fact-checker** (não o veredito). Atlas não emite veredito; cor não pode ser indicador de "verdade/falsidade".

**M1 — Cor atribuída ao fact-checker:**

Cada fact-checker reconhecido (Tier 1) tem cor própria associada à identidade visual da agência. Posicionada como **ponto/bullet antes do nome**, não antes do veredito:

```
● Lupa            parcialmente falso
● Aos Fatos       distorce
● Comprova        sem registro até 28/05
```

A paleta deve cobrir **exatamente** os valores do enum `veiculoVeredito` em `src/content/config.ts`:

| Valor do enum                 | Cor identidade          | Hex       |
| ----------------------------- | ----------------------- | --------- |
| `Lupa` (Agência Lupa / UOL)   | Vermelho marca          | `#E20E0E` |
| `Aos Fatos`                   | Verde marca             | `#1A9E5E` |
| `Comprova` (Projeto Comprova) | Azul marca              | `#1E5AAF` |
| `Estadão Verifica`            | Cinza Estadão           | `#3F3F3F` |
| `Agência Pública`             | Laranja marca           | `#E67E22` |
| `BBC Verify`                  | Vermelho BBC            | `#B40000` |
| `outro`                       | Cinza neutro (fallback) | `#737373` |

(Esta tabela vive em `src/lib/cards/fact-checker-palette.ts` para uso programático. Adição de novo veículo exige primeiro estender o enum em `src/content/config.ts` e depois adicionar entrada aqui.)

**M2 — Saturação calma:**

Cores acima são as **identidades originais** dos fact-checkers (apropriação editorialmente honesta). Caso saturação seja considerada alta demais em testes visuais, aplicar redução de saturação de 20% sem mudar matiz. Decisão final em revisão visual da PR.

**M3 — Borda lateral em vez de fill:**

Cada linha de veredito tem `border-left: 4px solid <cor-do-fact-checker>` em vez de fundo colorido. Layout final:

```
┃ ● Lupa            parcialmente falso
┃ ● Aos Fatos       distorce
┃ ● Comprova        sem registro até 28/05
```

Borda sutil; texto do veredito sempre em `#525252` (cinza neutro).

**Ordem de exibição:** Tier 1 alfabético (Aos Fatos → Comprova → Lupa). Limite 3 visíveis. Caso > 3: mostrar os 3 com peso editorial maior (preferir vereditos com classificação ≠ "sem registro" sobre "sem registro").

**Caso zero vereditos:**

Não mostrar lista vazia. Substituir por linha discreta em `#525252`:

> _"Sem veredito de fact-checker reconhecido até DD/MM/AAAA"_

### 2.4 Escopo MVP (primeira sprint)

**Está no escopo:**

- Card de declaração específica em 4 formatos: 1200×630, 1080×1350, 1080×1920, 1200×1200
- Geração build-time como PNG estático em `public/cards/<id>/<formato>.png`
- UI nas páginas `/declaracoes/[id]` com 3 botões: Baixar / Copiar link da imagem / Compartilhar
- Suporte ao caso "sem veredito"
- Suporte aos 3 fact-checkers atuais (Lupa, Aos Fatos, Comprova) + paleta extensível

**Não está no escopo (sub-specs futuros):**

- Variante "comparação temporal" (X disse A em 2024, B em 2026)
- Variante "claim sem veredito" (alerta para fact-checkers, alinha com I6)
- Cards para entidades agregadas (candidato, tema, evento) — só por declaração
- Personalização de card por usuário (cores, layout custom)
- Animated GIF / vídeo do card
- Compartilhamento via API third-party (Bluesky, Mastodon — ficam para futuro)

## 3. Conteúdo do card (por seção)

**Header (10% da altura):**

- Wordmark _"Atlas dos Candidatos · 2026"_ em `#171717` peso medium 24pt
- Linha divisória `1px solid #E5E5E5` abaixo

**Corpo principal (60% da altura):**

- Declaração em destaque tipográfico (escala dinâmica em 3 faixas)
- Centralizada verticalmente quando ≤ 120 chars
- Justificada à esquerda quando > 120 chars

**Atribuição (8% da altura):**

- _"— Candidato Nome · DD/MM/AAAA · Evento Y"_
- Em `#525252` 22pt medium

**Cascata de vereditos (15% da altura):**

- Lista de até 3 vereditos com tratamento M1+M2+M3
- Ou linha "Sem veredito..." se vazia

**Rodapé (7% da altura):**

- Esquerda: URL `atlas-2026.pages.dev/declaracoes/<id>` em 20pt medium
- Direita: QR code 120×120px com a mesma URL
- Linha base: _"Atlas dos Candidatos · 2026 · Não emite veredito · CC-BY 4.0"_ em 18pt regular cinza

## 4. Layout por formato

Componente único em JSX (Satori) com props de tamanho que aplicam multiplicador na escala tipográfica. Layout vertical/horizontal por formato:

### 4.1 — 1200×630 (Twitter/X, WhatsApp preview, OG)

```
┌──────────────────────────────────────────────────────────┐
│ Atlas dos Candidatos · 2026                              │
│ ────────────────                                         │
│                                                          │
│   "Declaração textual aqui em destaque tipográfico"      │
│                                                          │
│   — Candidato X · 12/04/2026 · Evento Y                  │
│                                                          │
│ ┃ ● Lupa         parcialmente falso                      │
│ ┃ ● Aos Fatos    distorce                                │
│ ┃ ● Comprova     sem registro até 28/05                  │
│                                                          │
│ atlas-2026.pages.dev/declaracoes/<id>      ▓▓▓▓▓▓▓       │
│ Atlas · Não emite veredito · CC-BY 4.0      ▓ QR ▓       │
│                                              ▓▓▓▓▓▓▓     │
└──────────────────────────────────────────────────────────┘
```

### 4.2 — 1080×1350 (Instagram feed)

Proporção 4:5. Layout idêntico ao 1200×630 com multiplicador 0.95× e altura maior dedicada ao corpo (declaração ganha 5% extra).

### 4.3 — 1080×1920 (Stories/Reels)

Proporção 9:16. Layout vertical mais alongado:

```
┌────────────────────┐
│ Atlas              │
│ Candidatos · 2026  │
│ ────────────       │
│                    │
│  "Declaração"      │
│  ...               │
│  ...               │
│                    │
│ — Candidato X      │
│   12/04/2026       │
│   Evento Y         │
│                    │
│ ┃ ● Lupa           │
│   parcialmente     │
│   falso            │
│ ┃ ● Aos Fatos      │
│   distorce         │
│ ┃ ● Comprova       │
│   sem registro     │
│                    │
│ ▓▓▓▓▓▓▓            │
│ ▓ QR ▓ atlas-2026  │
│ ▓▓▓▓▓▓▓ .pages.dev │
│                    │
│ Não emite veredito │
│ CC-BY 4.0          │
└────────────────────┘
```

Multiplicador 0.9×; nome do fact-checker e veredito empilhados verticalmente; QR ao lado da URL.

### 4.4 — 1200×1200 (square LinkedIn/Threads)

Proporção 1:1. Layout do 1200×630 com altura proporcionalmente maior dedicada ao corpo da declaração.

## 5. Geração técnica

### 5.1 Stack

- **Satori** (já no projeto) — JSX → SVG
- **@resvg/resvg-js** — SVG → PNG (já provavelmente no stack se `generate-og-images.ts` existe; verificar e adicionar se faltar)
- **qrcode** (NPM, ~30k downloads/wk, mantido) — gerar SVG do QR para embed no Satori
- Fonte: Geist Sans TTF carregada via `readFileSync` em `node_modules/@vercel/...` ou `public/fonts/`

### 5.2 Script

Refatorar `scripts/generate-og-images.ts` em `scripts/generate-cards.ts` com lógica de multi-formato.

Output:

```
public/cards/<id>/1200x630.png
public/cards/<id>/1080x1350.png
public/cards/<id>/1080x1920.png
public/cards/<id>/1200x1200.png
```

Mantém **idempotência** (cache por hash do conteúdo da declaração + versão da template). Re-execução pula trabalho já feito.

Adicionar comando em `package.json`:

```json
"generate:cards": "tsx scripts/generate-cards.ts"
```

Build de produção roda automaticamente via hook do astro build (ou via `pnpm build:full`).

### 5.3 Performance

- Build de 60 declarações × 4 formatos = 240 PNGs. Estimativa: ~30-60s adicional no build.
- Trade-off aceito: build mais lento; runtime continua estático.

## 6. UI nas páginas `/declaracoes/[id]`

Componente `CardActions.astro` (novo) em `src/components/declaracoes/CardActions.astro` com 3 botões:

### Botão 1 — Baixar card

Menu dropdown:

- 1200×630 (Twitter / WhatsApp)
- 1080×1350 (Instagram Feed)
- 1080×1920 (Stories / Reels)
- 1200×1200 (LinkedIn / Threads)

Cada item dispara download direto via `<a href="/cards/<id>/<size>.png" download>`.

### Botão 2 — Copiar link da imagem

Menu dropdown com mesmos 4 formatos. Cada item dispara `navigator.clipboard.writeText(url)` da URL pública direta do PNG. Útil para colar como imagem em WhatsApp.

### Botão 3 — Compartilhar

Menu dropdown com intents:

- **WhatsApp:** `https://wa.me/?text=<texto>` com URL Atlas pré-formada
- **Twitter/X:** `https://twitter.com/intent/tweet?text=<texto>&url=<url>`
- **Threads:** `https://www.threads.net/intent/post?text=<texto>+<url>`
- **Telegram:** `https://t.me/share/url?url=<url>&text=<texto>`

Texto pré-formado: _"<Declaração resumida em ~80 chars>. Veja vereditos em <URL>."_

Estilo: botões em estilo discreto, alinhados com design system existente (shadcn/ui).

## 7. Critérios de aceitação

Para o card MVP ser considerado pronto:

1. ✅ 4 formatos PNG gerados para cada declaração no dataset (atualmente 0 → assim que Sprint 5.2 adiciona piloto 12 declarações, deve haver 48 PNGs)
2. ✅ Texto da declaração com 50 chars renderiza em 72pt
3. ✅ Texto da declaração com 200 chars renderiza em 54pt
4. ✅ Texto da declaração com 500 chars truncado em 280 chars + "…" + URL
5. ✅ Acentos PT-BR (ã, õ, ç, é, í, ó, ú, ê, à) renderizam corretamente em Geist Sans
6. ✅ Caso zero vereditos renderiza linha "Sem veredito até DD/MM/AAAA"
7. ✅ Caso 4+ vereditos mostra 3 com bias para classificações ≠ "sem registro"
8. ✅ Border-left em cada linha de veredito com cor do fact-checker
9. ✅ Bullet/ponto antes do nome do fact-checker (não antes do veredito)
10. ✅ QR code 120×120px renderiza no canto inferior direito e é scanneável
11. ✅ Rodapé "Atlas não emite veredito · CC-BY 4.0" presente em todos os formatos
12. ✅ URL `atlas-2026.pages.dev/declaracoes/<id>` legível no canto inferior esquerdo
13. ✅ UI em `/declaracoes/[id]` mostra os 3 botões (Baixar / Copiar / Compartilhar)
14. ✅ Botão "Baixar" abre menu com 4 formatos e dispara download
15. ✅ Botão "Copiar link" copia URL do PNG para clipboard
16. ✅ Botão "Compartilhar" abre intent nativo para WhatsApp / Twitter / Threads / Telegram
17. ✅ Build completo (`pnpm build`) inclui geração de cards e termina em ≤ 5min
18. ✅ Cards versionados em `public/cards/` são servidos por Cloudflare Pages com cache adequado (`Cache-Control: public, max-age=31536000, immutable`)
19. ✅ Tests: unit tests para escala dinâmica de tipografia (3 faixas × 4 formatos = 12 casos)
20. ✅ Tests: integration test que gera 1 card por formato a partir de declaração mock e valida dimensões + presença dos elementos via parsing do PNG (libpng ou pixelmatch contra snapshot)

## 8. Não-objetivos

- **Cor variável por veredito** (verde/amarelo/vermelho) — rejeitado para preservar `Sem-Veredito-Proprio`. Cor é do fact-checker, não do veredito.
- **Personalização visual por usuário** — fora do escopo; cards são deterministicamente gerados a partir do conteúdo da declaração.
- **Geração on-demand via endpoint** — fora do escopo MVP; build-time apenas.
- **Compartilhamento via API third-party** — apenas intents nativas no MVP.
- **Cards animados (GIF / vídeo)** — fora do escopo.
- **Variantes comparação temporal e claim-sem-veredito** — sub-specs futuros.
- **Telemetria de cards baixados** — implementação postergada; aparece como métrica P6 em `I3-Metricas-de-Sucesso.md` mas instrumentação é sprint próprio.

## 9. Riscos editoriais e mitigações

| Risco                                                         | Mitigação                                                                                                                                |
| ------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| Card percebido como endosso do veredito do fact-checker       | M1+M2+M3 (cor do fact-checker, borda lateral, saturação calma) + rodapé "Atlas não emite veredito" presente em **todos** os formatos     |
| Card editado/cropado para descontextualizar                   | QR code visível em **todos** os formatos; pequeno e funcional, dispara para página completa                                              |
| Cards usados em campanha política como ataque                 | CC-BY 4.0 permite uso; clarificar nos termos de uso em `/sobre` que reuso requer atribuição visual ao Atlas                              |
| Fact-checker se sentir desconfortável com sua cor sendo usada | Cores são as identidades visuais oficiais; mas se solicitação formal vier, ajustar paleta em `src/lib/cards/fact-checker-palette.ts`     |
| Declaração contém ofensa pessoal                              | Cobertura editorial decide se publicar a declaração; cards não-MVP têm filtro adicional. No MVP, qualquer declaração publicada vira card |

## 10. Dependências e premissas

**Premissas:**

- Geist Sans está disponível no projeto (verificar em `package.json` ou `public/fonts/`; se faltar, adicionar via `npm install geist`)
- `@resvg/resvg-js` está disponível (verificar e adicionar se faltar)
- `scripts/generate-og-images.ts` existe e usa Satori (confirmado em diagnóstico)
- Declarações no `data/declaracoes/` têm campo `vereditos[]` com `fonte`, `classificacao`, `data` (conforme schema em `src/content/config.ts`)

**Dependências:**

- Implementação acontece após Sprint 5.2 (piloto 12 declarações) ou em paralelo
- Não bloqueia nem é bloqueado por outras features de I4 (API JSON, embed widget)

## 11. Validação

Pré-merge:

```bash
pnpm format:check
pnpm lint
pnpm typecheck
pnpm test
pnpm build  # deve incluir geração de cards
pnpm audit-paridade  # CI bloqueante já em main
```

Manual:

- Abrir 3 cards (declaração curta / média / longa) em browser e verificar visualmente
- Scanear QR code com celular e confirmar URL correta
- Testar 3 botões em `/declaracoes/[id]` com declaração real

## 12. Links

- Decisão pai: `Vault/Decisoes/I4-Compartilhabilidade.md`
- Audiência primária: `Vault/Decisoes/Audiencia-Primaria.md`
- Métricas (P6 cards baixados): `Vault/Decisoes/I3-Metricas-de-Sucesso.md`
- Postura editorial: `Vault/Dominios/Postura-Editorial.md`
- Cascata de vereditos: `Vault/Dominios/Cascata-de-Vereditos.md`
- Spec mestre: `docs/superpowers/specs/2026-05-27-atlas-design.md`
- Próximo passo: `docs/superpowers/plans/2026-05-28-card-visual-declaracoes.md` (a ser gerado por writing-plans)
