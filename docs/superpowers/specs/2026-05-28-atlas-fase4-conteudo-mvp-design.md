---
título: "Atlas dos Candidatos · 2026 — Fase 4: Conteúdo MVP"
versão: "1.0"
status: "design aprovado em brainstorming · pendente plan"
autor: "André Dezob (curador) + Claude (rascunho)"
data_criação: "2026-05-28"
spec_pai: "docs/superpowers/specs/2026-05-27-atlas-design.md"
licença_conteúdo: "CC-BY 4.0"
licença_código: "MIT"
---

# Atlas dos Candidatos · 2026 — Fase 4: Conteúdo MVP (Design Document)

> **Escopo deste documento:** define o critério editorial público, a arquitetura de execução e o plano de teste e evidência da **Fase 4 — Conteúdo MVP**, que substitui os 2 candidatos demonstrativos por 2 candidatos reais com 30 declarações cada, e publica a primeira versão pública do dataset (`v0.1.0`). Complementa o spec mestre `2026-05-27-atlas-design.md` (que continua sendo a fonte de verdade para princípios, modelo de dados, arquitetura técnica e roadmap geral).

---

## 1. TL;DR

A Fase 4 transforma o site técnico (Fase 1-3) em um produto público funcional. Não é trabalho de código — é trabalho **editorial**, mas conduzido com o mesmo rigor de engenharia de software: critérios públicos, auditoria automatizada, evidência por PR, gates honestos.

Quatro sprints sequenciais (≈ 8-10 semanas a 8-15h/sem):

| Sprint | Foco | Duração | Entrega |
|---|---|---|---|
| **5.1** | Setup editorial | 1 sem | 2 candidatos reais, `/metodologia`, `/errata`, `/sobre`, `criterio-selecao.yaml`, demos removidos |
| **5.2** | Piloto | 1-2 sem | 12 declarações (1 por tema × 2 candidatos) + relatório de aprendizados |
| **5.3** | Lote principal | 4-6 sem | 48 declarações restantes (4 por tema × 2 candidatos) |
| **5.4** | Polimento + release | 1 sem | Auditoria final, dataset `v0.1.0`, GitHub Release, checkpoint |

**Estado final:** 2 candidatos × 30 declarações cada (paridade 5×6 rígida) com fonte primária + Wayback + sign-off humano em 100% dos itens, dataset CC-BY 4.0 publicado, Lighthouse SEO+A11y ≥ 95.

---

## 2. Motivação e gate de DONE

### 2.1 Por que esta fase importa

A Fase 4 é onde o Atlas para de ser projeto técnico e vira **infraestrutura pública**. Antes dela, qualquer crítica ("vocês podem cobrir politicamente errado") é hipotética. A partir dela, é empírica — e essa exposição precisa de blindagem editorial.

O critério editorial só vale se for **registrado publicamente antes** de qualquer decisão sobre conteúdo. Por isso o Sprint 5.1 entrega `/metodologia` e `criterio-selecao.yaml` **antes** de qualquer declaração ser ingerida.

### 2.2 Definição de DONE (binária, auditável)

A Fase 4 está completa se e somente se TODAS as condições abaixo são verdadeiras simultaneamente:

1. **Conteúdo quantitativo:** `data/candidatos/` contém **exatamente 2 candidatos reais**, com demos removidos. `data/declaracoes/` contém **exatamente 60 declarações** (30 por candidato).
2. **Paridade temática:** cada candidato tem **exatamente 5 declarações** em **cada um** dos 6 temas primários. Verificável via `scripts/audit-paridade.ts --final-mode`.
3. **Fontes primárias:** **100%** das declarações têm `fonte_primaria_url` preenchido + `timestamp_no_evento` (quando aplicável a vídeo/áudio) + `archive_url` Wayback retornando HTTP 200.
4. **Auditabilidade pública:**
   - `/metodologia` v1 publicada documentando critério de seleção dos candidatos, janela temporal, distribuição temática e cascata de saliência.
   - `/errata` v1 publicada (vazia ou com correções iniciais) com processo descrito.
   - `/sobre` v1 publicada identificando curadoria + missão + licenças.
   - `data/log-editorial.csv` versionado com **exatamente 1 linha por declaração** existente (FK match 100%).
   - `data/criterio-selecao.yaml` versionado contendo cálculo da seleção dos candidatos.
5. **Schema/build:** `pnpm validate-data`, `pnpm typecheck`, `pnpm lint --max-warnings=0`, `pnpm test`, `pnpm build:full`, `pnpm audit:paridade`, `pnpm check:archive-urls` — todos retornando exit code 0.
6. **Dataset publicado:** `pnpm export:dataset` gera `dist-dataset/atlas-2026-v0.1.0.{jsonl,csv}` + `SCHEMA.md`. GitHub Release `v0.1.0` criada com os artefatos anexados e corpo de release citando `criterio-selecao.yaml` em commit específico.
7. **Performance:** Lighthouse SEO ≥ 95 e Accessibility ≥ 95 em **3 URLs sortear** (1 perfil de candidato, 1 declaração, 1 evento). Resultados versionados em `docs/lighthouse-fase4.json`.
8. **Auditoria manual final:** 6 declarações sorteadas (1 por tema) tiveram transcrição conferida contra fonte primária pelo curador, registrado na descrição do PR final.
9. **Vault:** `memory/checkpoint-fase4-completa.md` existe e está apontado como entry point ativo em `MEMORY.md`.

### 2.3 Gates honestos de parada (espelham spec mestre §15)

A Fase 4 **deve parar e ser re-planejada** (não declarada falha) se qualquer condição abaixo ocorrer:

- **Após Sprint 5.2 (piloto):** tempo médio por declaração > 90 minutos → otimizar workflow antes do lote.
- **Após Sprint 5.2:** quota de 5 por tema confirmada inviável para mais de 2 pares (tema, candidato) → registrar lacuna em `/metodologia`, baixar quota apenas para esses pares; **não** inflar artificialmente.
- **Em 6 semanas operacionais** sem fechar o lote: parar, registrar motivo no Vault, publicar `v0.1.0` com o número de declarações disponíveis, re-planejar.
- **Antes de release v0.1.0:** auditoria manual de 6 declarações sorteadas encontrar qualquer erro factual → bloquear release até correção + re-sortear.

---

## 3. Princípios herdados (recordatórios, não negociáveis)

Os princípios §3 do spec mestre permanecem inviolados. Esta seção apenas explicita como cada um se aplica especificamente à curadoria editorial da Fase 4:

| # spec mestre | Princípio | Aplicação na Fase 4 |
|---|---|---|
| §3.1 | Toda declaração tem fonte primária ou não existe | 100% das 60 declarações têm URL + timestamp + Wayback funcionando |
| §3.2 | Sem rótulo de verdade/mentira | Nenhum campo de "veracidade" é preenchido pelo curador |
| §3.3 | Igual rigor para todos | Mesma quota (5×6), mesma janela (12 meses), mesmo workflow para ambos candidatos |
| §3.4 | Auditabilidade total | `criterio-selecao.yaml` + `log-editorial.csv` + `/metodologia` + `/errata` versionados |
| §3.5 | Permanência | Wayback obrigatório, `versao` incrementa em correções, nada é deletado |
| §3.6 | Não emitimos veredito | `vereditos_externos[]` agrega Lupa/Aos Fatos/Comprova com `citacao_curta` literal + atribuição |
| §3.7 | Contexto adicional documentável | `contexto_adicional` só preenchido quando há fonte rigorosa; em dúvida, omite |
| §3.8 | Disclaimer prominente em toda página | Componentes `VereditosExternos.astro` e `ContextoAdicional.astro` já exibem (Fase 3) |

Adicionalmente, do spec mestre §7.1: **AI não gera conteúdo.** Esta regra é o pilar da AI policy da Fase 4 (§5.4 abaixo).

---

## 4. Critério editorial público

Esta seção é a referência canônica do conteúdo de `/metodologia`. Mudanças aqui exigem PR + sign-off + atualização da página pública.

### 4.1 Seleção dos 2 candidatos cobertos no MVP

**Regra:**

> Os 2 candidatos com maior **média simples** de intenção de voto **estimulada (1º turno)** nas **3 últimas pesquisas** publicadas pelos institutos **Datafolha**, **Quaest** e **Genial-Quaest** até a **data de corte de 2026-05-15** (inclusive).

**Mecânica de aplicação:**

1. Coletar a pesquisa mais recente de **cada** instituto publicada **até** 2026-05-15.
2. Para cada candidato presente nas 3 pesquisas, calcular `media = (datafolha + quaest + genial) / 3`.
3. Ordenar candidatos por `media` descendente.
4. Os 2 primeiros candidatos são selecionados para o MVP.
5. **Empate técnico** (diferença ≤ 2 p.p. entre 2º e 3º): desempate em cascata: (a) maior amostra agregada nas 3 pesquisas, (b) menor margem de erro agregada, (c) mais antigo no cargo público (atual ou último).
6. **Candidato ausente em alguma das 3 pesquisas:** não é elegível ao MVP. Esta lacuna é registrada como déficit metodológico em `/metodologia`.

**Lock total:** uma vez aplicado o critério no Sprint 5.1, os 2 candidatos selecionados **não mudam** durante a Fase 4, independentemente de mudanças posteriores no ranking. Re-seleção fica para revisão pós-MVP (com nova Errata documentando a mudança).

**Artefato auditável:** `data/criterio-selecao.yaml` contendo URLs canônicas das 3 pesquisas, `archive_url` Wayback de cada, números brutos, cálculo da média, candidato da linha de empate (3º colocado) com distância para o 2º, e timestamp da decisão. Esse arquivo é citado por nome em `/metodologia` com link direto para sua versão atual em git.

### 4.2 Janela temporal de elegibilidade

**Regra:**

> São elegíveis declarações cujo `evento.data` cai no intervalo fechado **[2025-05-15, 2026-05-15]** (12 meses anteriores à data de corte, inclusive nas duas pontas).

**Mecânica:**

- Eventos fora da janela são rejeitados na ingestão.
- Para declarações que o candidato repete em eventos diferentes dentro da janela: conta a **primeira ocorrência** dentro da janela.
- Re-discussões em eventos pós-janela do mesmo conteúdo não geram declaração nova.

### 4.3 Distribuição temática (paridade rígida)

**Regra:**

> Cada candidato terá **exatamente 5 declarações** em **cada um** dos **6 temas primários**: economia, saúde, segurança pública, educação, meio-ambiente, política externa. Total invariante: 5 × 6 = **30 declarações por candidato**.

**Mecânica:**

- O `tema_principal` da declaração define em qual quota ela conta. `temas_secundarios[]` não consome quota.
- Quotas **não são fungíveis** entre temas (não vale "compensar" tema escasso com extras em tema farto).
- Se o piloto (Sprint 5.2) revelar lacuna **estrutural** (candidato emitiu < 5 declarações relevantes do tema X em 12 meses), registramos a falha em `/metodologia` com texto explícito ("candidato X tem N declarações em tema Y; régua não foi forçada a preencher cota artificialmente") e baixamos a quota **apenas para esse par (candidato, tema)**.

### 4.4 Cascata de saliência (qual das N elegíveis ocupa uma vaga)

Quando o universo de declarações elegíveis num tema for > 5, aplicamos esta **cascata determinística** (cada nível só desempata o anterior; ordem é estrita):

1. **Cobertura estrutural** — priorizar diversidade dos 8 `tipo_estrutural` do schema (promessa, dado_numerico, atribuicao_a_terceiro, afirmacao_historica, comparacao, afirmacao_sobre_pesquisa, compromisso_politico, interpretacao_pessoal). Meta: as 5 vagas cobrem o máximo possível de tipos diferentes.
2. **Veredito externo existente** — entre candidatas do mesmo `tipo_estrutural`, prioriza as que já têm `vereditos_externos[]` populado por Lupa/Aos Fatos/Comprova/Estadão Verifica.
3. **Fonte com timestamp de vídeo oficial** — entre as que sobram, prioriza `fonte_primaria_tipo ∈ {youtube_oficial, tse, camara, senado}` sobre `midia_consolidada` e sobre `rede_social_oficial`.
4. **Audiência do evento** — prioridade descendente: `debate` > `entrevista` > `sabatina` > `comicio` > `declaracao_oficial` > `post_rede_social`.
5. **Recência** — empate final: declaração mais recente vence.

**Artefato auditável:** cada inclusão registra `motivo_inclusao` em `log-editorial.csv` no formato `cascata-N: <breve justificação>` onde N é o nível da cascata que decidiu a inclusão.

---

## 5. Workflow operacional

### 5.1 Princípio operacional inviolável

Do spec mestre §7.1: **"AI não gera conteúdo."** Whisper só faz transcrição bruta; toda transcrição é revisada por humano antes de virar `texto` da declaração.

Aplicado à Fase 4: **nenhuma declaração publicada terá `texto`, `contexto` ou `contexto_adicional` escrito pelo Claude sem revisão humana explícita.** Claude preenche campos derivados (`id`, `slug`, `criado_em`, `versao`), prepara a estrutura, propõe `tema_principal`/`tipo_estrutural` para validação, mas o **conteúdo editorial** sempre passa por André.

### 5.2 RACI por atividade

| Atividade | Claude | André | Validação automatizada |
|---|---|---|---|
| Pesquisar pesquisas eleitorais e calcular média | rascunho | aprova | schema Zod |
| Decidir 2 candidatos finais | propõe | **aprova** | — |
| Escrever `criterio-selecao.yaml` | rascunho | aprova | schema Zod + Ajv |
| Escrever `/metodologia`, `/errata`, `/sobre` | rascunho | **aprova final** | build estático |
| Identificar longlist de declarações por (tema, candidato) | rascunho | aprova | — |
| Escolher 1-N declarações da longlist | propõe | **decide** | — |
| Rodar `pnpm scrape:youtube/transcribe/archive` | executa | — | Wayback HTTP 200 |
| Revisar transcrição Whisper bruta vs vídeo | — | **executa** | — |
| Decidir `tipo_estrutural` da declaração | propõe | **decide** | schema enum |
| Decidir `tema_principal` + `temas_secundarios` | propõe | **decide** | FK para `data/temas/` |
| Buscar `vereditos_externos` em Lupa/Aos Fatos/Comprova | pesquisa | aprova citação | URL HTTP 200 |
| Escrever `contexto` e `contexto_adicional` | rascunho factual | **edita/aprova** | — |
| Preencher campos derivados (`id`, `slug`, datas) | executa | — | schema Zod |
| Atualizar `log-editorial.csv` | escreve linha | revisa | FK match script |
| Commit + PR | abre PR | **sign-off** | CI verde |

**Regra de ouro:** se Claude tem dúvida sobre **factualidade** de qualquer campo (data, número, nome, citação literal), **para e pergunta** ao André em vez de assumir.

### 5.3 Pipeline por declaração (9 passos)

```
1. Identificar par alvo (tema, candidato)        Claude  ───┐
2. Pesquisar longlist 5-10 candidatas via web    Claude     │  Pré-curadoria
3. Aplicar cascata de saliência sobre longlist   Claude  ───┤
4. Validar escolha + escolher 1                  André   ───┘
5. Rodar pipeline (scrape/transcribe/archive)    Claude  ───┐
6. Revisar transcrição vs vídeo original         André      │  Ingestão
7. Preencher YAML/MD com campos validados        Claude  ───┤
8. Buscar vereditos externos (se aplicável)      Claude  ───┘
9. Sign-off + commit + atualizar log editorial   André   ───── Publicação
```

**Tempo estimado por declaração** (informado por spec mestre §7):

| Nível | Fonte | Tempo total estimado |
|---|---|---|
| 1 (fácil) | YouTube oficial · TSE · Câmara/Senado | ~10-15 min |
| 2 (médio) | Mídia consolidada com vídeo embedado | ~15-20 min |
| 3 (difícil) | Posts X/IG/FB/TikTok oficiais | ~25-35 min |

Total estimado para 60 declarações: **15-30 h de trabalho efetivo do André** (paralelo ao trabalho do Claude).

### 5.4 AI policy pública (bloco obrigatório em `/metodologia`)

Texto que deve aparecer literalmente em `/metodologia` v1:

> ## Uso de Inteligência Artificial no Atlas
>
> O Atlas usa modelos de IA apenas como ferramentas auxiliares de pesquisa e transcrição. **Não usamos IA generativa para criar conteúdo editorial.** Especificamente:
>
> - **Transcrição bruta de áudio/vídeo:** modelo Whisper (OpenAI) gera o texto base. Toda transcrição é revisada e corrigida por curador humano antes de virar declaração publicada.
> - **Pesquisa de longlist:** assistente IA (Claude, Anthropic) ajuda a localizar declarações candidatas e fontes primárias. Decisão de inclusão é sempre humana.
> - **Estruturação de dados:** assistente IA preenche campos derivados (IDs, slugs, timestamps) seguindo schemas fixos.
> - **O que NÃO fazemos:** geração automática de `texto`, `contexto`, `contexto_adicional` ou qualquer campo de conteúdo editorial; resumo automático de declarações; classificação automática de "veracidade" (não emitimos vereditos).
>
> Esta política está alinhada à TSE Res. 23.732/2024 sobre uso de IA em conteúdo eleitoral.

### 5.5 Checklist humano de sign-off (registro em `log-editorial.csv`)

Antes de qualquer commit de declaração nova, André confirma esta checklist. A coluna `validador` no log registra "André" implicitamente atestando estas verificações:

- [ ] Transcrição confere palavra por palavra com a fonte primária (vídeo/áudio)?
- [ ] Timestamp HH:MM:SS confere com o momento do trecho?
- [ ] `archive_url` Wayback abre e mostra a fonte capturada?
- [ ] `tipo_estrutural` faz sentido sem ambiguidade?
- [ ] `tema_principal` é o tema dominante real da declaração?
- [ ] `contexto` é descrição neutra do que foi perguntado/dito?
- [ ] Se há `vereditos_externos[]`: a `citacao_curta` é literal do fact-checker (verificada por copy-paste)?
- [ ] `motivo_inclusao` no log cita corretamente o nível da cascata?

### 5.6 Tratamento de erros descobertos pós-publicação

Quando erro factual for descoberto (por André, por terceiros via issue, ou em sessão futura):

1. **Abrir issue** no GitHub com label `errata-fase4` descrevendo o erro e a fonte da correção.
2. **PR de correção** atualiza o YAML/MD afetado, **incrementa `versao`**, atualiza `atualizado_em`.
3. **`/errata`** ganha nova entrada: data, link para o issue, link para o PR/commit, descrição em 1-2 frases.
4. **Nunca deletar** a declaração — git history preserva a versão errada com auditoria.

---

## 6. Arquitetura de execução

Abordagem **C — Piloto + lote** (decidida no brainstorming). 4 sprints sequenciais, cada um virando seu próprio plan + PR independente.

### 6.1 Visão de alto nível

```
Sprint 5.1 (1 sem)  →  Sprint 5.2 (1-2 sem)  →  Sprint 5.3 (4-6 sem)  →  Sprint 5.4 (1 sem)
Setup editorial         Piloto (12 itens)        Lote (48 itens)        Polimento + release
                        valida critério           ritmo de cruzeiro      v0.1.0 publicado
```

### 6.2 Sprint 5.1 — Setup editorial

**Objetivo:** ter o critério aplicado, os 2 candidatos identificados, e as páginas institucionais publicadas. Sem este sprint, não existe rastro público de como os candidatos foram escolhidos.

**Entregáveis:**

1. **`data/criterio-selecao.yaml`** versionado conforme schema da §7.1 deste documento.
2. **`data/candidatos/<slug1>.yaml`** e **`<slug2>.yaml`** substituindo demos:
   - `nome`, `partido`, `biografia_minima` (2-3 frases factuais)
   - `foto_url` (oficial pública ou Wikimedia Commons CC-BY)
   - `contas_oficiais[]` — handles verificados de YouTube/X/IG/FB com `verificada: true` apenas quando há badge oficial
3. **Demos removidos:** `data/candidatos/candidato-{a,b}.yaml`, `data/eventos/2026-04-15-debate-rede-tv.yaml`, as 2 declarações demonstrativas, fotos `public/img/candidato-{a,b}.jpg` (se existirem).
4. **`/metodologia` v1** (`src/pages/metodologia.astro`) conforme §4.4 (cascata) e §5.4 (AI policy).
5. **`/errata` v1** (`src/pages/errata.astro`) — página inicial com processo descrito; entradas vazias.
6. **`/sobre` v1** (`src/pages/sobre.astro`) — curadoria + missão + licenças.
7. **`data/log-editorial.csv`** vazio com header conforme §7.2 deste documento.
8. **PR template novo:** `.github/PULL_REQUEST_TEMPLATE/fase4.md` conforme §8.4 deste documento.

**Critério de DONE 5.1:** todas validações verdes (`pnpm validate-data`, `pnpm typecheck`, `pnpm lint`, `pnpm test`, `pnpm build:full`); páginas `/metodologia`, `/errata`, `/sobre` retornam 200 com conteúdo; PR mergeado em main.

### 6.3 Sprint 5.2 — Piloto (validação do critério com 12 declarações)

**Objetivo:** validar o critério editorial com **12 declarações reais** (1 por tema × 2 candidatos) antes de commitar 60 itens. Detecta defeitos da régua barato.

**Mecânica:**

- Para cada um dos **6 temas**, cada candidato contribui **1 declaração** dentro da janela 2025-05-15 a 2026-05-15.
- Total: 12 declarações + os eventos correspondentes (até 12 novos; overlap possível se ambos no mesmo debate).
- Workflow segue pipeline §5.3 deste documento (9 passos por declaração).

**Saída esperada:**

- 12 declarações publicadas em `data/declaracoes/`
- 12 linhas em `log-editorial.csv`
- **Relatório de aprendizados** em `docs/superpowers/specs/<data>-piloto-fase4-aprendizados.md` respondendo:
  - A quota de 5 é viável para todos os 12 pares (tema, candidato) testados?
  - A cascata de saliência convergiu rápido ou houve ambiguidade frequente?
  - O Wayback funcionou em 100% das URLs?
  - Quantas declarações têm `vereditos_externos[]` populado?
  - Quanto tempo (h/declaração) por nível (1/2/3)?
- **Decisão escrita:** seguir para Sprint 5.3 sem mudanças OU ajustar critério em `/metodologia` antes.

**Critério de DONE 5.2:** 12 declarações com schema verde; `log-editorial.csv` com 12 linhas; relatório de aprendizados commitado; PR mergeado em main.

### 6.4 Sprint 5.3 — Lote principal (48 declarações)

**Objetivo:** completar as **48 declarações restantes** (4 por tema × 6 temas × 2 candidatos) com o critério já validado.

**Mecânica:**

- Estratégia recomendada **a decidir no início do Sprint 5.3 baseado no aprendizado do 5.2**:
  - **Lotes por candidato** (alternados): semana 1-2 → candidato A (24 declarações); semana 3-4 → candidato B (24 declarações); semana 5 reserva para fechamento.
  - OU **lotes por tema** se for mais natural cognitivamente.
- **Subdivisão em mini-PRs:** 1 PR por candidato por bloco de 10-12 declarações. Histórico em git mostra progresso incremental, evita PRs gigantes.

**Critério de DONE 5.3:** 60 declarações totais (12 do piloto + 48 do lote); `scripts/audit-paridade.ts` verifica 5×6×2 = 30 por candidato; `log-editorial.csv` com 60 linhas; todas validações verdes; PRs mergeados em main.

### 6.5 Sprint 5.4 — Polimento + release v0.1.0

**Objetivo:** auditoria final + publicação do dataset + checkpoint.

**Entregáveis:**

1. **Auditoria automatizada** via `scripts/audit-paridade.ts --final-mode` + `scripts/audit-distribuicao.ts`. Outputs versionados em `docs/audit-fase4.md` e `docs/distribuicao-fase4.md`.
2. **Auditoria manual** de 6 declarações sorteadas (1 por tema, escolha aleatória balanceada entre candidatos) — André confere transcrição contra vídeo original e Wayback abre.
3. **Lighthouse audit** em 3 URLs (1 perfil, 1 declaração, 1 evento) — resultado em `docs/lighthouse-fase4.json`.
4. **`pnpm export:dataset`** → gera `dist-dataset/atlas-2026-v0.1.0.{jsonl,csv}` + `SCHEMA.md`.
5. **GitHub Release v0.1.0** com artefatos anexados; corpo de release cita commit-SHA específico de `data/criterio-selecao.yaml`.
6. **Checkpoint Vault** em `memory/checkpoint-fase4-completa.md` (substituindo `checkpoint-fase3-completa.md` como entry point).
7. **`MEMORY.md`** atualizado com novo entry point em **negrito**.

**Critério de DONE 5.4 = DONE da Fase 4 inteira** (ver §2.2).

---

## 7. Infraestrutura de auditoria

### 7.1 `data/criterio-selecao.yaml` (schema)

```yaml
data_corte: "2026-05-15"                    # ISO 8601 (string)
criado_em: ISO 8601                          # quando o critério foi aplicado
curador: "André Dezob"
pesquisas:
  - instituto: "Datafolha"
    url: string                              # URL canônica do relatório
    archive_url: string                      # Wayback obrigatório
    data_publicacao: ISO 8601
    amostra: number
    margem_erro_pp: number
    metodologia: "presencial domiciliar" | "telefônica" | "online"
    intencao_estimulada:
      - candidato_nome: string
        percentual: number
  - instituto: "Quaest"
    # mesma estrutura
  - instituto: "Genial-Quaest"
    # mesma estrutura
calculo:
  - candidato_nome: string
    media_simples: number                    # (datafolha + quaest + genial) / 3
  # ordenado descendente
selecionados:
  - posicao: 1
    candidato_id: string                     # FK para data/candidatos/<slug>.yaml
    nome: string
    media: number
  - posicao: 2
    candidato_id: string
    nome: string
    media: number
linha_de_empate:                             # 3º colocado — transparência
  candidato_nome: string
  media: number
  distancia_pp: number                       # diferença para o 2º
  desempate_aplicado: boolean                # se houve empate técnico ≤ 2 p.p.
  desempate_criterio: string | null          # "maior amostra" | "menor margem" | "tempo no cargo" | null
versao: number                               # 1 inicialmente; incrementa em revisões pós-MVP
```

Validado por Zod 3 em `src/content/config.ts` (constraint do `astro:content`).

### 7.2 `data/log-editorial.csv` (schema)

```csv
declaracao_id,candidato_id,tema,tipo_estrutural,fonte_tipo,tem_veredito_externo,motivo_inclusao,curador,validador,data_inclusao
01HZQ...,bolsonaro-jair,economia,promessa,youtube_oficial,false,"cascata-1: única promessa de imposto na janela","Claude+André","André","2026-06-03T14:22:00-03:00"
```

**Colunas:**

| Coluna | Tipo | Origem | Observações |
|---|---|---|---|
| `declaracao_id` | string (ULID) | FK | Casa com `data/declaracoes/<id>.md` |
| `candidato_id` | string (slug) | FK | Casa com `data/candidatos/<slug>.yaml` |
| `tema` | enum | FK | 1 dos 6 temas primários |
| `tipo_estrutural` | enum | declaração | 1 dos 8 do schema mestre |
| `fonte_tipo` | enum | declaração | youtube_oficial \| tse \| camara \| senado \| midia_consolidada \| rede_social_oficial |
| `tem_veredito_externo` | boolean | declaração | `vereditos_externos[].length > 0` |
| `motivo_inclusao` | string | curadoria | Começa com `cascata-N:` |
| `curador` | string | fixo MVP | "Claude+André" |
| `validador` | string | fixo MVP | "André" |
| `data_inclusao` | ISO 8601 | timestamp | Quando o sign-off ocorreu |

CSV (não JSON) intencionalmente, para jornalistas/pesquisadores abrirem em planilha sem fricção.

### 7.3 Scripts de auditoria automatizada

Quatro scripts novos em `scripts/`, idempotentes, com testes Vitest. Cada um exige uma entry correspondente em `package.json` (campo `scripts`) para ser invocável via `pnpm <nome>`. Entries:

```json
{
  "scripts": {
    "audit:paridade": "tsx scripts/audit-paridade.ts",
    "audit:distribuicao": "tsx scripts/audit-distribuicao.ts",
    "check:archive-urls": "tsx scripts/check-archive-urls.ts",
    "validate:log": "tsx scripts/validate-log.ts"
  }
}
```

Adicionalmente, `pnpm validate-data` (já existente) deve passar a chamar `validate:log` ao final, para garantir que o log editorial é validado a cada `validate-data`.

#### `scripts/audit-paridade.ts`

**Propósito:** verificar invariantes da Fase 4 a cada PR.

**Validações:**

1. Existem **exatamente 2** candidatos em `data/candidatos/` (`--setup-mode` aceita 0 também durante 5.1).
2. Existem **≤ 60** declarações durante execução; **exatamente 60** quando `--final-mode`.
3. Cada candidato tem **≤ 5** declarações em cada um dos 6 temas (incremental); **exatamente 5** quando `--final-mode`.
4. **100%** das declarações têm `archive_url` Wayback não-vazio.
5. **100%** das declarações têm `evento.data` na janela [2025-05-15, 2026-05-15].
6. `log-editorial.csv` tem **exatamente 1 linha por declaração** existente (FK match).
7. `data/criterio-selecao.yaml.selecionados[].candidato_id` corresponde aos slugs em `data/candidatos/`.

**Saída:** exit code 0/1 + relatório markdown em `docs/audit-fase4.md` regenerado a cada run.

**Integração CI:** rodar em step próprio em `.github/workflows/ci.yml` após `validate-data`.

**Comando:** `pnpm audit:paridade` (entrada em `package.json`).

#### `scripts/audit-distribuicao.ts`

**Propósito:** observabilidade (não bloqueia CI).

**Métricas:**

- Distribuição de `tipo_estrutural` por candidato (ideal: cobre 5-8 tipos por candidato).
- Distribuição de `fonte_primaria_tipo` (% youtube_oficial vs midia_consolidada vs rede_social_oficial).
- % de declarações com `vereditos_externos[]` populado.
- Distribuição cronológica (declarações por mês na janela).

**Saída:** `docs/distribuicao-fase4.md` com tabelas markdown.

**Comando:** `pnpm audit:distribuicao`.

#### `scripts/check-archive-urls.ts`

**Propósito:** verificar Wayback URLs HTTP HEAD 200 OK.

**Modos:**

- `--all`: verifica todos os `archive_url` (custoso, rate-limit Wayback).
- `--recent`: verifica apenas declarações modificadas no PR atual (via `git diff --name-only`).

**Saída:** exit code 0/1 + lista de URLs com falha.

**Comando:** `pnpm check:archive-urls`.

#### `scripts/validate-log.ts`

**Propósito:** FK match entre `data/log-editorial.csv` e `data/declaracoes/`.

**Validações:**

- Cada linha do CSV referencia `declaracao_id` que existe em `data/declaracoes/<id>.md`.
- Cada declaração em `data/declaracoes/` tem **exatamente 1** linha no CSV.
- Campos enum (`tema`, `tipo_estrutural`, `fonte_tipo`) batem com valores válidos do schema mestre.
- `motivo_inclusao` começa com `cascata-N:` onde N ∈ {1, 2, 3, 4, 5}.

**Comando:** `pnpm validate:log` (rodado em `pnpm validate-data` agregado).

### 7.4 Integração com o CI existente

`.github/workflows/ci.yml` ganha 1 step novo após `validate-data`:

```yaml
- name: Auditoria de paridade Fase 4
  run: pnpm audit:paridade
```

Sem mudanças em format/lint/typecheck/test/build. Build continua independente do estado editorial.

### 7.5 Páginas institucionais como infraestrutura de auditoria

| Página | Função auditável |
|---|---|
| `/metodologia` | Documenta critério → permite contestar critério, não só execução |
| `/errata` | Registra correções publicamente → cumpre §3.4 (erros corrigíveis publicamente) |
| `/sobre` | Identifica curadores → reduz acusação de "fonte anônima" |
| `/dataset` (já existe) | Permite reuso por terceiros → cumpre §3.4 (dataset aberto) |

---

## 8. TEP — Plano de Teste e Evidência

### 8.1 Pirâmide de evidência

```
                       ┌──────────────────────┐
                       │ Auditoria automática │   ←  scripts/audit-*
                       │  (CI bloqueante)     │
                       └──────────────────────┘
                    ┌────────────────────────────┐
                    │  Schema validation         │   ←  pnpm validate-data
                    │  (Zod + Ajv) — duplo       │
                    └────────────────────────────┘
              ┌──────────────────────────────────────┐
              │  Unit tests para scripts novos       │   ←  Vitest
              │  (audit-paridade, audit-distribuicao,│
              │   validate-log, check-archive-urls)  │
              └──────────────────────────────────────┘
        ┌──────────────────────────────────────────────┐
        │   Verificação humana (sign-off por declar.)  │   ←  checklist §5.5
        │   Wayback URL HEAD 200 OK                    │
        └──────────────────────────────────────────────┘
   ┌────────────────────────────────────────────────────────┐
   │   Auditoria manual final (Sprint 5.4)                  │   ←  6 declarações
   │   André confere transcrição vs vídeo original          │      sorteadas
   └────────────────────────────────────────────────────────┘
```

### 8.2 TEP por sprint

#### Sprint 5.1

| Item | Como | Evidência | Bloqueia merge? |
|---|---|---|---|
| `criterio-selecao.yaml` validado pelo Zod | `pnpm validate-data` | exit 0 + log no PR | ✅ |
| 2 candidatos novos válidos (sem demos) | `pnpm validate-data` + `pnpm audit:paridade --setup-mode` | exit 0 | ✅ |
| Demos removidos (incluindo fotos) | `git diff --stat` mostra deleções esperadas | diff no PR | ✅ |
| `/metodologia` renderiza com critério | `pnpm build:full` + curl `/metodologia` | response no PR | ✅ |
| `/errata` e `/sobre` renderizam | idem | idem | ✅ |
| `log-editorial.csv` existe com header | `cat data/log-editorial.csv` | output no PR | ✅ |
| Lighthouse das 3 páginas novas | `pnpm dlx lighthouse <url> --only-categories=accessibility,seo` | score ≥ 95 anexado | ⚠️ alerta |
| Wayback Snapshot das 3 pesquisas | `pnpm check:archive-urls --recent` | exit 0 | ✅ |

#### Sprint 5.2 — Piloto

| Item | Como | Evidência | Bloqueia merge? |
|---|---|---|---|
| 12 declarações novas válidas | `pnpm validate-data` | exit 0 | ✅ |
| 1 declaração por (tema × candidato) | `pnpm audit:paridade --piloto-mode` | output 6+6 | ✅ |
| 12 entradas em `log-editorial.csv` FK match | `pnpm validate:log` | exit 0 | ✅ |
| Wayback URL válido em 100% das 12 | `pnpm check:archive-urls --recent` | exit 0 | ✅ |
| Transcrição revisada (sign-off) | checklist §5.5 marcada por declaração | descrição do PR menciona "sign-off: 12/12" | ✅ |
| Relatório de aprendizados commitado | arquivo presente em `docs/superpowers/specs/` | ls | ✅ |
| Tempo médio por declaração medido | André anota nas anotações | menção no relatório | ⚠️ alerta |

#### Sprint 5.3 — Lote

| Item | Como | Evidência | Bloqueia merge? |
|---|---|---|---|
| Cada mini-PR de 10-12 declarações válido | `pnpm validate-data` por PR | exit 0 | ✅ |
| Auditoria paridade incremental | `pnpm audit:paridade` mostra progressão | output no PR | ✅ |
| Wayback URL válido nas declarações do PR | `pnpm check:archive-urls --recent` | exit 0 | ✅ |
| `log-editorial.csv` FK match continua 100% | `pnpm validate:log` | exit 0 | ✅ |
| Diversidade de `tipo_estrutural` sendo construída | `pnpm audit:distribuicao` | tabela no PR | ⚠️ alerta |
| Build estático funciona | `pnpm build:full` no CI | exit 0 + tamanho do dist | ✅ |

#### Sprint 5.4 — Release

| Item | Como | Evidência | Bloqueia merge? |
|---|---|---|---|
| 60 declarações exatas | `pnpm audit:paridade --final-mode` | "PASS: 60 declarations, 5×6×2 distribution" | ✅ |
| Distribuição de tipos saudável | `pnpm audit:distribuicao` | `docs/distribuicao-fase4.md` versionado | ✅ |
| Lighthouse SEO ≥ 95 em 3 URLs | `pnpm dlx lighthouse` | JSON em `docs/lighthouse-fase4.json` | ✅ |
| Lighthouse Accessibility ≥ 95 | idem | idem | ✅ |
| Dataset gerado | `pnpm export:dataset` | `dist-dataset/atlas-2026-v0.1.0.*` | ✅ |
| GitHub Release v0.1.0 publicado | `gh release create` | URL no PR final | ✅ |
| Auditoria manual de 6 declarações | André confere transcrição + Wayback | "manual audit: 6/6 OK" no PR | ✅ |
| Checkpoint Vault registrado | `memory/checkpoint-fase4-completa.md` | ls | ✅ |
| `MEMORY.md` aponta novo checkpoint | grep `**bold**` | diff no PR | ✅ |

### 8.3 Testes unitários (Vitest) novos

```
tests/unit/data/criterio-selecao.test.ts       # Zod schema accepts/rejects válido/inválido
tests/unit/scripts/audit-paridade.test.ts       # função pura: dado N declarações, calcula distribuição
tests/unit/scripts/audit-distribuicao.test.ts   # função pura: percentuais corretos
tests/unit/scripts/validate-log.test.ts         # FK match entre log e declarações
tests/unit/scripts/check-archive-urls.test.ts   # mock fetch, retorna OK/FAIL apropriado
```

**Cobertura alvo:** ≥ 80% lines nas funções novas de `scripts/` (alinhado ao gate atual de `vitest.config.ts`).

### 8.4 Template de PR da Fase 4

`.github/PULL_REQUEST_TEMPLATE/fase4.md`:

```markdown
## Sprint
5.X (setup | piloto | lote | polimento)

## Mudança editorial
- [ ] N declarações novas
- [ ] N entradas em log-editorial.csv
- [ ] Candidatos: <slug1>, <slug2>

## Auditoria automatizada
- `pnpm validate-data`: PASS
- `pnpm audit:paridade`: <output>
- `pnpm audit:distribuicao`: <link para docs/distribuicao-fase4.md>
- `pnpm check:archive-urls --recent`: PASS

## Auditoria humana
- [ ] Sign-off por declaração: N/N (checklist §5.5 marcada)
- [ ] Wayback abre para todas N URLs
- [ ] Transcrição confere com fonte primária

## Build
- `pnpm format:check`: PASS
- `pnpm lint`: PASS
- `pnpm typecheck`: PASS
- `pnpm test`: PASS (N tests)
- `pnpm build:full`: PASS (N páginas)

## Risco residual conhecido
<vazio | descreve riscos aceitos conscientemente>
```

---

## 9. Riscos e mitigações

| # | Risco | Sev. | Prob. | Mitigação | Responsável |
|---|---|---|---|---|---|
| F4-1 | Acusação de viés político na escolha dos 2 candidatos | Alta | Alta | Critério público (§4.1) + `criterio-selecao.yaml` versionado + linha de empate divulgada + lock total | Sprint 5.1 |
| F4-2 | Alucinação de texto/dado pelo Claude virando declaração publicada | Alta | Média | RACI §5.2 com "validador: André" obrigatório + checklist §5.5 + AI policy §5.4 | Todos sprints |
| F4-3 | Transcrição Whisper com erro em nome/número/citação | Alta | Alta | André revisa transcrição contra vídeo original ANTES de virar `texto` | Todos sprints |
| F4-4 | Fonte primária deletada antes do snapshot Wayback completar | Alta | Média | Wayback Save Page Now é chamado **antes** de qualquer outro passo; HEAD check confirma 200 | Sprint 5.2/5.3 |
| F4-5 | Candidato falou < 5 vezes de algum tema na janela (quota inviável) | Média | Média | Piloto 5.2 testa antes do lote; lacuna estrutural vira nota em `/metodologia`, não inflação artificial | Sprint 5.2 |
| F4-6 | Falsa atribuição (declaração de outro político atribuída ao candidato) | Alta | Baixa-Média | Sign-off humano + fonte primária obrigatória + checklist | André |
| F4-7 | Citação fora de contexto distorcendo intenção original | Alta | Média | `contexto` é factual ("Em resposta à pergunta sobre X, candidato disse Y") + linkado ao vídeo timestamped | André |
| F4-8 | Fact-checker mudou veredito após publicação no Atlas | Média | Baixa | `versao` incrementa no PR de correção + `/errata` registra mudança + `data` do veredito no schema | Pós-publicação |
| F4-9 | Linha de empate (3º colocado) entra forte no jornal | Média | Média | Lock total tem rationale em `criterio-selecao.yaml` + texto antecipando crítica em `/metodologia` + revisão pós-MVP | `/metodologia` |
| F4-10 | Direitos autorais sobre foto oficial do candidato | Baixa | Média | Foto pública oficial (site do candidato) ou Wikimedia Commons CC-BY; atribuição no `<img alt>` | Sprint 5.1 |
| F4-11 | Direitos autorais sobre trecho de citação literal | Baixa | Baixa | Fair use jornalístico (LDA Art. 46) + link para fonte completa | André + spec mestre |
| F4-12 | LGPD: dados pessoais de candidatos | Baixa | Baixa | Cobertura limitada a fala pública em contexto público (Art. 7 §III LGPD) | spec mestre |
| F4-13 | Burnout do solo founder na curadoria | Média | Média | Co-curadoria Claude+André + piloto antes do lote + gates de parada | Todos sprints |
| F4-14 | Inconsistência entre 30 declarações iniciais e como curar futuro | Média | Média | `/metodologia` v1 define padrão; revisão pós-MVP só muda critério com Errata | Pós-MVP |
| F4-15 | Erro factual descoberto após release v0.1.0 | Alta | Quase certa | §5.6 (processo de erratas) + `/errata` + git versão incrementada | Pós-Fase 4 |
| F4-16 | Candidato processa por difamação | Baixa | Baixa | Zero veredito próprio; agrega citações literais; `vereditos_externos[]` atribuído ao fact-checker | spec mestre |
| F4-17 | Pagamento de Whisper/Firecrawl explode em volume | Baixa | Baixa | Cache em `.cache/`; 60 declarações ≈ $0.40 total Whisper | Pipeline existente |

### 9.1 Riscos aceitos conscientemente (não mitigamos)

1. **Baixa tração orgânica pós-launch** (gate spec §15): dado empírico, não defeito da Fase 4.
2. **Janela 12 meses excluir declaração icônica de 2024**: aceitamos; versão pós-MVP pode estender.
3. **Sentir artificial ter exatamente 5 por tema**: aceitamos; paridade rígida supera fidelidade ao discurso real para MVP — defendido em `/metodologia`.

### 9.2 Cenários que escalam para parar e perguntar

Os seguintes cenários **interrompem o sprint e exigem decisão consciente do André** (Claude não tenta resolver sozinho):

- **F4-2 detectado**: encontrei algo que não consegui verificar 100% factualmente.
- **F4-3 detectado**: transcrição Whisper diverge do que ouvi no vídeo em campo crítico.
- **F4-5 confirmado no piloto**: quota é inviável. Decisão: reduzir quota para esse par OU substituir critério.
- **F4-10/11 dúvida**: direito autoral de foto/citação específica.
- **F4-13 manifesto**: André sinalizar fadiga / pedir pausa.

---

## 10. Restrições técnicas herdadas (não-negociáveis no CLAUDE.md)

Estas restrições permanecem ativas na Fase 4. Documentadas aqui para evitar regressão:

1. **`src/content/config.ts` mantém Zod 3** (`astro:content` bundla Zod 3). Novo schema de `criterio-selecao.yaml` usa Zod 3.
2. **Scripts standalone podem usar Zod 4** nativo (`z.url()`, `z.iso.datetime()`).
3. **CLI scripts** usam `pathToFileURL(process.argv[1] ?? "").href` para `isMain` check (correção Windows).
4. **Vitest mock `astro:content`** via alias em `vitest.config.ts` — **não tocar**.
5. **`.gitattributes` força `eol=lf`** em todo o repo — **não tocar**.
6. **Path alias único `@/*` → `src/*`**.
7. **CI Ubuntu vs Windows local**: rodar `pnpm format:check && pnpm lint && pnpm typecheck && pnpm test && pnpm build:full` localmente antes de push.
8. **Componentes `.astro` não são testáveis em Vitest unitário** — verificar via `astro build` + grep no HTML resultante.
9. **`exactOptionalPropertyTypes: true`** no tsconfig — usar spread condicional `{...(x ? { prop: x } : {})}` para campos opcionais vindos de `Map.get()`.
10. **`@/lib/utils/format-date` exporta `formatDateBR`, `formatDateLong`, `formatRelative`** — não existe `formatDate`.

---

## 11. Próximos passos (após aprovação deste design)

1. André revisa este spec e aprova mudanças se necessárias.
2. Invocar `superpowers:writing-plans` para criar `docs/superpowers/plans/2026-05-28-atlas-fase4-conteudo-mvp.md`.
3. O plan deve decompor os 4 sprints em tarefas executáveis (provavelmente 4 plans separados ou 1 plan grande com 4 fases internas — decidir em writing-plans).
4. Iniciar Sprint 5.1 (Setup editorial) — primeiro PR.

---

## Apêndice A — Memórias relacionadas

- [[checkpoint-fase3-completa]] — entry point que esta Fase 4 substitui ao concluir
- [[decisoes-core-atlas]] — postura editorial original (princípios §3)
- [[criterios-sucesso-atlas]] — métricas não-financeiras e gates de continuidade
- [[bugs-do-plano-fase1]] — bugs/constraints informativos para todos plans
- [[astro-content-zod3]] — constraint Zod 3 ainda ativa
- [[feedback-best-practices]] — reuso first, zero invenção

## Apêndice B — Links externos canônicos

- Datafolha — instituto: https://datafolha.folha.uol.com.br/
- Quaest — instituto: https://www.quaest.com.br/
- Genial-Quaest — repositório de pesquisas: https://www.quaest.com.br/categoria-pesquisas/
- Lupa (fact-checker): https://lupa.uol.com.br/
- Aos Fatos (fact-checker): https://www.aosfatos.org/
- Comprova (consórcio fact-check): https://projetocomprova.com.br/
- Estadão Verifica (fact-checker): https://www.estadao.com.br/estadao-verifica/
- TSE — repositório de candidaturas: https://divulgacandcontas.tse.jus.br/
- Wayback Machine Save Page Now: https://web.archive.org/save/
- TSE Res. 23.732/2024 (IA em campanhas): https://www.tse.jus.br/legislacao/codigo-eleitoral/resolucoes

---

**Documento aprovado em brainstorming em 2026-05-28. Pendente: revisão final do André + invocação de `writing-plans`.**
