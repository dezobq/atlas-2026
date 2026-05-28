# Sprint 5.2 — Piloto: 12 declarações reais (Plan)

> **For agentic workers:** REQUIRED SUB-SKILL: Use `superpowers:subagent-driven-development` (parcial — só Tasks 1–2 e Tasks 9–10) **ou** `superpowers:executing-plans` (recomendado — Tasks 3–8 exigem curadoria humana ao vivo). Steps usam checkbox (`- [ ]`) para tracking.

**Goal:** Publicar 12 declarações reais (1 por tema × 2 candidatos) com 100% de fonte primária + Wayback + sign-off humano, validar empiricamente o critério editorial v1.1 antes do lote (Sprint 5.3), e produzir relatório de aprendizados com decisão escrita sobre prosseguir.

**Architecture:** Sprint **editorial**, não código. Infra mecânica do piloto (Tasks 1–2) prepara templates e diretório. Curadoria (Tasks 3–8) percorre os 6 temas em sequência, cada tema produzindo 2 declarações (1 Lula + 1 Flávio Bolsonaro) seguindo o pipeline de 9 passos do spec §5.3. Tasks 9–10 produzem relatório de aprendizados, executam auditorias finais e abrem PR para `main`. O workflow de ingestão por declaração está documentado em **Apêndice A** e os templates de evento/declaração em **Apêndice B** para reduzir duplicação.

**Tech Stack:** Atlas existente — Astro 5, Zod 3 (`astro:content`), Vitest. Scripts já prontos do Sprint 5.1: `scrape-youtube`, `transcribe`, `archive`, `scrape-url`, `audit-paridade --piloto-mode`, `validate-log`, `check-archive-urls --recent`. Sem novas dependências.

**Pré-condições verificadas em 2026-05-28:**

- Branch `main` no commit `9ff59f0` (PR #9 mergeado).
- `data/candidatos/` tem `lula-luiz-inacio.yaml` (id `01KSQDGYBHGRTNYGSMCMPAAKH4`) e `bolsonaro-flavio.yaml`.
- `data/temas/` tem os 6 temas primários (economia, saude, educacao, seguranca-publica, meio-ambiente, politica-externa).
- `data/declaracoes/` vazio.
- `data/eventos/` **não existe** como diretório (será criado na Task 1).
- `data/log-editorial.csv` contém só o header.
- `audit-paridade.ts` já implementa `AuditMode = "setup" | "piloto" | "final"` e valida 12 declarações + 1 por (tema × candidato) em modo piloto (linhas 15, 64–67, 94–101, 182).
- Schema Zod 3 em `src/content/config.ts` cobre `eventos` (linhas 78–98) e `declaracoes` (linhas 100–157).
- Janela temporal corrigida no spec v1.1: **[2025-05-16, 2026-05-16]** (12 meses anteriores ao corte do critério).

**Branch policy:** Criar branch `feat/fase4-sprint5-2-piloto` antes da Task 1 (não trabalhar em `main`). Comando: `git checkout -b feat/fase4-sprint5-2-piloto`. Worktree opcional via `superpowers:using-git-worktrees` se preferir.

**Estimativa de tempo:**

- Tasks 1–2 (infra): ~30 min Claude
- Tasks 3–8 (curadoria 12 declarações): ~12–18 h trabalho do André + Claude (estimativa do spec §5.3: 10–35 min/declaração × 12)
- Task 9 (relatório): ~1 h
- Task 10 (PR + merge): ~30 min

**Total:** ~15–20 h efetivas distribuídas em 1–2 semanas.

---

## File Structure

**Criados:**

| Arquivo                                                          | Responsabilidade                                                      |
| ---------------------------------------------------------------- | --------------------------------------------------------------------- |
| `data/eventos/.gitkeep`                                          | Marcador para diretório versionado vazio (até primeiro evento)        |
| `data/eventos/<id>.yaml` × N (≤ 12)                              | Eventos onde declarações ocorreram (1 evento pode ter ≥ 1 declaração) |
| `data/declaracoes/<id>.md` × 12                                  | As 12 declarações reais                                               |
| `docs/superpowers/templates/evento.template.yaml`                | Template comentado de evento                                          |
| `docs/superpowers/templates/declaracao.template.md`              | Template comentado de declaração                                      |
| `docs/superpowers/templates/sign-off-checklist.md`               | Checklist §5.5 em forma reutilizável                                  |
| `docs/superpowers/specs/2026-XX-XX-piloto-fase4-aprendizados.md` | Relatório de aprendizados (data definida na Task 9)                   |
| `docs/audit-fase4.md`                                            | Output regenerado pelo `audit-paridade` (gerado, não escrito à mão)   |

**Modificados:**

| Arquivo                  | Mudança                                                          |
| ------------------------ | ---------------------------------------------------------------- |
| `data/log-editorial.csv` | +12 linhas (1 por declaração) — vai de 1 (header) para 13 linhas |

**NÃO mexer:**

- `src/content/config.ts` — schemas estão prontos
- `scripts/audit-paridade.ts`, `scripts/validate-log.ts`, `scripts/check-archive-urls.ts` — funcionam com modo piloto
- `scripts/scrape-youtube.ts`, `scripts/transcribe.ts`, `scripts/archive.ts` — pipeline já operacional
- `data/criterio-selecao/latest.yaml` — lock total da Fase 4 (spec §4.1)

---

## Task 1: Setup do diretório `data/eventos/` e validação inicial

**Files:**

- Create: `data/eventos/.gitkeep`

- [ ] **Step 1: Criar diretório e marcador**

```bash
mkdir -p data/eventos
echo "# Marcador para versionar o diretório vazio. Removível ao primeiro evento ser criado." > data/eventos/.gitkeep
```

- [ ] **Step 2: Validar que astro:content aceita coleção vazia**

```bash
pnpm validate-data
```

Expected: exit 0 (não deve haver erros mesmo com 0 eventos — o glob loader retorna `[]`).

- [ ] **Step 3: Validar que audit-paridade modo setup ainda passa**

```bash
pnpm audit:paridade
```

Expected: exit 0 com saída "Modo: `setup`" (não há declarações ainda, então só checa que candidatos = 2).

- [ ] **Step 4: Commit**

```bash
git add data/eventos/.gitkeep
git commit -m "chore(fase4): criar diretório data/eventos/ para Sprint 5.2"
```

---

## Task 2: Criar templates operacionais

Templates reduzem erros de digitação durante a curadoria. Vivem em `docs/superpowers/templates/` (fora de `data/`) — são documentação operacional, não dados.

**Files:**

- Create: `docs/superpowers/templates/evento.template.yaml`
- Create: `docs/superpowers/templates/declaracao.template.md`
- Create: `docs/superpowers/templates/sign-off-checklist.md`

- [ ] **Step 1: Criar template de evento**

Conteúdo de `docs/superpowers/templates/evento.template.yaml`:

```yaml
# Template de evento — copiar para data/eventos/<id>.yaml e preencher.
#
# id: formato ULID (gerar com `pnpm dlx ulid` ou
#     https://www.ulidtools.com/) — 26 chars alfanuméricos.
# Campos com <PLACEHOLDER_X> precisam ser preenchidos.
# Datas: ISO 8601 com timezone (ex: 2025-08-15T20:30:00-03:00).

id: "<ULID_DE_26_CHARS>"
titulo: "<TÍTULO_DESCRITIVO_DO_EVENTO>"
data: "<DATA_ISO_8601_COM_TZ>"
tipo: "<debate|entrevista|comicio|post_rede_social|sabatina|declaracao_oficial>"
local:
  fisico: "<CIDADE_UF_OU_NULL>" # ex: "São Paulo, SP" ou null
  digital: "<PLATAFORMA_OU_NULL>" # ex: "YouTube ao vivo" ou null
duracao_minutos: <NUMERO_OU_NULL> # int positivo ou null
fonte_primaria_url: "<URL_CANÔNICA>" # ex: https://www.youtube.com/watch?v=...
fonte_primaria_tipo: "<youtube_oficial|tse|camara|senado|diario_oficial|midia_consolidada|rede_social_oficial>"
archive_url: "<WAYBACK_URL>" # https://web.archive.org/web/<timestamp>/<URL>
candidatos_envolvidos:
  - candidato_id: "<ID_DO_CANDIDATO>" # ex: 01KSQDGYBHGRTNYGSMCMPAAKH4 (Lula)
descricao: "<2_A_3_FRASES_FACTUAIS>" # ≥ 10 chars, sem juízo de valor
criado_em: "<ISO_8601>"
atualizado_em: "<ISO_8601>"
```

- [ ] **Step 2: Criar template de declaração**

Conteúdo de `docs/superpowers/templates/declaracao.template.md`:

```markdown
---
# Template de declaração — copiar para data/declaracoes/<id>.md e preencher.
#
# id: formato YYYY-MM-DD-<candidato-slug>-<tema>-<descritor-curto>
#     ex: 2025-08-15-lula-luiz-inacio-economia-juros-selic
# slug: mesmo valor do id (regex /^[a-z0-9-]+$/)
# timestamp_no_evento: HH:MM:SS (ou null se fonte não tem timing)
# texto: literal, palavra por palavra, sem aspas externas
# contexto: 1–2 frases factuais ("Em resposta a X, candidato disse Y")
# tipo_estrutural: array com 1+ valores do enum
# tema_principal: slug de data/temas/ (economia, saude, etc)
# temas_secundarios: array de slugs (pode ser vazio)

id: "<ID>"
slug: "<SLUG_IGUAL_AO_ID>"
candidato_id: "<ID_DO_CANDIDATO>"
evento_id: "<ID_DO_EVENTO>"

texto: |
  <TRECHO_LITERAL_DA_DECLARAÇÃO_REVISADO_CONTRA_O_VÍDEO>

timestamp_no_evento: "<HH:MM:SS_OU_NULL>"
contexto: "<DESCRIÇÃO_FACTUAL_DO_CONTEXTO>"

tema_principal: "<SLUG_DE_TEMA>"
temas_secundarios: []

tipo_estrutural:
  - "<UM_OU_MAIS_DE: promessa|dado_numerico|atribuicao_a_terceiro|afirmacao_historica|comparacao|afirmacao_sobre_pesquisa|compromisso_politico|interpretacao_pessoal>"

fonte_primaria_url: "<URL_CANÔNICA>"
fonte_primaria_tipo: "<youtube_oficial|tse|camara|senado|diario_oficial|midia_consolidada|rede_social_oficial>"
archive_url: "<WAYBACK_URL>"
snapshot_interno_path: null

contexto_adicional: null # ou objeto {texto, fontes: [...]} quando houver fonte rigorosa

vereditos_externos: [] # array de {veiculo, classificacao, url, data, citacao_curta}

versao: 1
criado_em: "<ISO_8601>"
atualizado_em: "<ISO_8601>"
---

<!-- Corpo Markdown opcional para narrativa contextual.
     Não duplica os campos do frontmatter; serve só para texto editorial extra. -->
```

- [ ] **Step 3: Criar checklist de sign-off**

Conteúdo de `docs/superpowers/templates/sign-off-checklist.md`:

```markdown
# Checklist de Sign-off Editorial — Fase 4 (spec §5.5)

> Marcar TODOS os itens **antes** de commitar uma declaração nova. Linha do `log-editorial.csv` registra `validador="André"` atestando estas verificações implicitamente.

## Por declaração

- [ ] **Transcrição literal:** confere palavra por palavra com a fonte primária (vídeo/áudio) pelo timestamp indicado.
- [ ] **Timestamp:** HH:MM:SS confere com o momento exato do trecho no vídeo/áudio.
- [ ] **Wayback OK:** `archive_url` abre em browser e mostra a fonte capturada (não erro 404).
- [ ] **`tipo_estrutural` correto:** classificação não-ambígua (re-leia §3 do spec mestre se em dúvida).
- [ ] **`tema_principal` correto:** é o tema dominante real da declaração, não o "mais conveniente".
- [ ] **`contexto` neutro:** descrição factual ("Em resposta à pergunta sobre X, candidato disse Y"), sem adjetivo avaliativo.
- [ ] **Vereditos externos (se houver):** `citacao_curta` é literal do fact-checker, copiada por copy-paste. Veículo bate com enum do schema.
- [ ] **`motivo_inclusao` no log:** cita corretamente o nível da cascata (`cascata-N: <breve>`).

## Por evento (apenas ao criar evento novo)

- [ ] **`fonte_primaria_url`:** URL canônica (não shortlink, não redirect).
- [ ] **`archive_url`:** snapshot Wayback gerado pelo `pnpm archive <url>` e verificado em browser.
- [ ] **`data`:** dentro da janela [2025-05-16, 2026-05-16].
- [ ] **`tipo` do evento:** classificação correta (debate/entrevista/etc.).
- [ ] **`candidatos_envolvidos[]`:** lista os candidatos relevantes (todos os candidatos do evento, não só o autor da declaração).
- [ ] **`descricao`:** 2–3 frases factuais sem juízo.
```

- [ ] **Step 4: Validar formatação Prettier**

```bash
npx prettier --check docs/superpowers/templates/
```

Expected: "All matched files use Prettier code style!" — se falhar, rodar `npx prettier --write docs/superpowers/templates/`.

- [ ] **Step 5: Commit**

```bash
git add docs/superpowers/templates/
git commit -m "feat(fase4): adicionar templates operacionais do Sprint 5.2

- evento.template.yaml com campos comentados
- declaracao.template.md com frontmatter completo
- sign-off-checklist.md replicando spec §5.5

Reduz erros de digitação durante curadoria das 12 declarações."
```

---

## Task 3: Curadoria do tema **Economia** (declarações 1–2/12)

> Esta task entrega **2 declarações** — uma para Lula, uma para Flávio Bolsonaro — no tema `economia`. Segue o workflow completo de **Apêndice A** para cada declaração. Cada declaração resulta em um commit próprio (mais incremento incremental do `log-editorial.csv`). Tempo estimado: 1–3 h.

### 3.A — Declaração Lula no tema Economia

- [ ] **Step 1: Pesquisar longlist (≥ 5 candidatas)**

Claude propõe 5–10 declarações de Lula em economia dentro da janela [2025-05-16, 2026-05-16] via:

- Canal YouTube oficial `@LulaOficial`
- Fact-checkers: site:lupa.uol.com.br "lula" economia, site:aosfatos.org "lula" economia, site:projetocomprova.com.br "lula" economia
- Mídia consolidada com vídeo embedado (Folha, G1, UOL, CNN Brasil)

Saída: tabela markdown em comentário do task com colunas `data | título | URL | tipo_estrutural | tem_veredito?`.

- [ ] **Step 2: André valida longlist e aplica cascata §4.4**

Cascata determinística (ordem estrita, cada nível só desempata o anterior):

1. **Cobertura estrutural** — diversidade dos 8 `tipo_estrutural` (este piloto ainda terá poucas; prioriza tipos não-cobertos)
2. **Veredito externo** — prioriza declarações com Lupa/Aos Fatos/Comprova já populado
3. **Fonte com timestamp** — `youtube_oficial` / `tse` / `camara` / `senado` > `midia_consolidada` > `rede_social_oficial`
4. **Audiência do evento** — `debate` > `entrevista` > `sabatina` > `comicio` > `declaracao_oficial` > `post_rede_social`
5. **Recência** — empate final: mais recente vence

Registrar `motivo_inclusao = "cascata-N: <breve>"` para uso no log.

- [ ] **Step 3 a 11: Executar workflow do Apêndice A**

Seguir os 9 passos do Apêndice A com:

- `candidato_id`: `01KSQDGYBHGRTNYGSMCMPAAKH4` (Lula)
- `tema_principal`: `economia`
- Outros campos: conforme escolha do Step 2

- [ ] **Step 12: Commit**

```bash
git add data/eventos/<id-evento>.yaml data/declaracoes/<id-declaracao>.md data/log-editorial.csv
git commit -m "feat(fase4): adicionar declaração 1/12 — Lula sobre economia

Sprint 5.2 piloto: <descrição curta do tema da declaração>.

Fonte: <fonte_primaria_tipo> (<URL>).
Cascata: <motivo_inclusao>.
Sign-off: checklist §5.5 marcada (12/12)."
```

### 3.B — Declaração Flávio Bolsonaro no tema Economia

- [ ] **Steps 1–2:** Repetir Steps 1–2 acima com `candidato_id` de Flávio Bolsonaro.

- [ ] **Step 3 a 11: Executar workflow do Apêndice A**

Seguir os 9 passos do Apêndice A com:

- `candidato_id`: (slug de `bolsonaro-flavio.yaml`)
- `tema_principal`: `economia`

- [ ] **Step 12: Commit**

```bash
git add data/eventos/<id-evento>.yaml data/declaracoes/<id-declaracao>.md data/log-editorial.csv
git commit -m "feat(fase4): adicionar declaração 2/12 — Flávio Bolsonaro sobre economia

Sprint 5.2 piloto: <descrição curta>.

Fonte: <fonte_primaria_tipo> (<URL>).
Cascata: <motivo_inclusao>.
Sign-off: checklist §5.5 marcada (12/12)."
```

- [ ] **Step 13: Validação parcial**

```bash
pnpm validate-data
pnpm audit:paridade
```

Expected: exit 0 em ambos. `audit:paridade` (modo default `setup`) deve mostrar 2 declarações em economia (1 por candidato). Não rodar `--piloto-mode` ainda — ele exige 12.

---

## Task 4: Curadoria do tema **Saúde** (declarações 3–4/12)

> Mesma estrutura da Task 3, agora para `tema_principal: saude`. Executar **Apêndice A** para cada declaração. Estimativa: 1–3 h.

### 4.A — Declaração Lula no tema Saúde

- [ ] **Step 1: Pesquisar longlist** (cf. Task 3.A.Step 1, ajustando para tema saúde)
- [ ] **Step 2: Validar + cascata** (cf. Task 3.A.Step 2)
- [ ] **Steps 3–11: Executar Apêndice A** com `tema_principal: saude`
- [ ] **Step 12: Commit** com `# 3/12 — Lula sobre saúde`

### 4.B — Declaração Flávio Bolsonaro no tema Saúde

- [ ] **Steps 1–2:** Repetir para Flávio
- [ ] **Steps 3–11: Executar Apêndice A** com `tema_principal: saude`
- [ ] **Step 12: Commit** com `# 4/12 — Flávio Bolsonaro sobre saúde`

- [ ] **Step 13: Validação parcial**

```bash
pnpm validate-data && pnpm audit:paridade
```

Expected: exit 0. Já temos 4 declarações (2 economia + 2 saúde).

---

## Task 5: Curadoria do tema **Educação** (declarações 5–6/12)

> Mesma estrutura, `tema_principal: educacao`. Estimativa: 1–3 h.

### 5.A — Lula sobre Educação

- [ ] **Steps 1–11:** Mesma sequência das Tasks 3–4, ajustando para tema `educacao`.
- [ ] **Step 12: Commit** com `# 5/12 — Lula sobre educação`

### 5.B — Flávio Bolsonaro sobre Educação

- [ ] **Steps 1–11:** Mesma sequência.
- [ ] **Step 12: Commit** com `# 6/12 — Flávio Bolsonaro sobre educação`

- [ ] **Step 13:** `pnpm validate-data && pnpm audit:paridade` → exit 0.

---

## Task 6: Curadoria do tema **Segurança Pública** (declarações 7–8/12)

> `tema_principal: seguranca-publica`. Estimativa: 1–3 h.

### 6.A — Lula sobre Segurança Pública

- [ ] **Steps 1–11:** Mesma sequência.
- [ ] **Step 12: Commit** com `# 7/12 — Lula sobre segurança pública`

### 6.B — Flávio Bolsonaro sobre Segurança Pública

- [ ] **Steps 1–11:** Mesma sequência.
- [ ] **Step 12: Commit** com `# 8/12 — Flávio Bolsonaro sobre segurança pública`

- [ ] **Step 13:** `pnpm validate-data && pnpm audit:paridade` → exit 0.

---

## Task 7: Curadoria do tema **Meio Ambiente** (declarações 9–10/12)

> `tema_principal: meio-ambiente`. Estimativa: 1–3 h.

### 7.A — Lula sobre Meio Ambiente

- [ ] **Steps 1–11:** Mesma sequência.
- [ ] **Step 12: Commit** com `# 9/12 — Lula sobre meio ambiente`

### 7.B — Flávio Bolsonaro sobre Meio Ambiente

- [ ] **Steps 1–11:** Mesma sequência.
- [ ] **Step 12: Commit** com `# 10/12 — Flávio Bolsonaro sobre meio ambiente`

- [ ] **Step 13:** `pnpm validate-data && pnpm audit:paridade` → exit 0.

---

## Task 8: Curadoria do tema **Política Externa** (declarações 11–12/12)

> `tema_principal: politica-externa`. Estimativa: 1–3 h. **Última task de curadoria.**

### 8.A — Lula sobre Política Externa

- [ ] **Steps 1–11:** Mesma sequência.
- [ ] **Step 12: Commit** com `# 11/12 — Lula sobre política externa`

### 8.B — Flávio Bolsonaro sobre Política Externa

- [ ] **Steps 1–11:** Mesma sequência.
- [ ] **Step 12: Commit** com `# 12/12 — Flávio Bolsonaro sobre política externa`

- [ ] **Step 13: Validação completa do piloto**

```bash
pnpm validate-data
pnpm audit:paridade --piloto-mode
pnpm validate:log
pnpm check:archive-urls --recent
```

Expected (todos): exit 0.

- Em `pnpm audit:paridade --piloto-mode`, esperado: "12 declarações, 1 por candidato × 6 temas, PASS".
- Em `pnpm validate:log`, esperado: 12 linhas FK-match com `data/declaracoes/`.
- Em `pnpm check:archive-urls --recent`, esperado: 12 Wayback URLs HTTP 200 OK.

Se alguma validação falhar, **NÃO prosseguir** para Task 9. Investigar (geralmente: timestamp errado, slug não bate, Wayback rate-limited, `tema_principal` com slug típo).

---

## Task 9: Relatório de aprendizados

> Documento curto (≤ 200 linhas) respondendo às 5 perguntas obrigatórias do spec §6.3 + decisão escrita sobre prosseguir para Sprint 5.3. Critical para Risk F4-5 (quota inviável) e F4-13 (burnout).

**Files:**

- Create: `docs/superpowers/specs/2026-XX-XX-piloto-fase4-aprendizados.md` (XX-XX = data real da conclusão da Task 8)

- [ ] **Step 1: Decidir data do arquivo**

A data no nome reflete o dia em que a Task 8 fechou (não o dia em que a Task 1 começou). Ex: se Task 8 terminou em 2026-06-15, arquivo é `2026-06-15-piloto-fase4-aprendizados.md`.

- [ ] **Step 2: Escrever o relatório**

Estrutura mínima (preencher com dados reais coletados durante Tasks 3–8):

```markdown
---
título: "Sprint 5.2 Piloto — Relatório de Aprendizados (12 declarações)"
data_inicio: "<YYYY-MM-DD da Task 1>"
data_fim: "<YYYY-MM-DD da Task 8>"
duracao_dias: <inteiro>
declaracoes_publicadas: 12
autor: "André Queiroz"
---

# Sprint 5.2 Piloto — Relatório de Aprendizados

## 1. Quota de 5 declarações por (tema × candidato): viável?

<Resposta SIM/NÃO/PARCIAL com evidência por par. Listar pares onde longlist teve < 5 candidatas
e indicar se quota de 5 será sustentável no Sprint 5.3 ou precisa baixar para esse par.>

| Par                           | Longlist encontrada | Quota 5 viável no Sprint 5.3? |
| ----------------------------- | ------------------- | ----------------------------- |
| Lula × economia               | N candidatas        | sim/não                       |
| Flávio × economia             | N                   | sim/não                       |
| <repetir para todos 12 pares> |                     |                               |

## 2. Cascata de saliência: convergência

<Em quantas das 12 inclusões a cascata convergiu no nível 1? nível 2? nível 3+? Houve casos
em que múltiplos critérios empataram e exigiram desempate manual?>

| Nível | # de inclusões resolvidas neste nível |
| ----- | ------------------------------------- |
| 1     | N                                     |
| 2     | N                                     |
| 3     | N                                     |
| 4     | N                                     |
| 5     | N                                     |

## 3. Wayback Save Page Now: taxa de sucesso

- URLs tentadas: 12
- Snapshots gerados com sucesso (HTTP 200 em `check-archive-urls`): N/12
- Falhas (motivo): <descrever — rate limit, host bloqueia, etc>

## 4. Vereditos externos: cobertura

- Declarações com `vereditos_externos[]` populado: N/12 (= NN%)
- Fact-checkers presentes: <Lupa: N, Aos Fatos: N, Comprova: N, outro: N>

## 5. Tempo por declaração

| Nível (spec §5.3) | Fonte usada                 | # declarações neste nível | Tempo médio |
| ----------------- | --------------------------- | ------------------------- | ----------- |
| 1                 | YouTube oficial / TSE / etc | N                         | ~XX min     |
| 2                 | Mídia consolidada           | N                         | ~XX min     |
| 3                 | Rede social oficial         | N                         | ~XX min     |

**Tempo total efetivo do piloto:** ~XX h de André + Claude.

## 6. Defeitos do critério descobertos

<Lista de defeitos detectados durante a aplicação real. Ex: "candidato X só tem post no IG no tema Y,
sem vídeo timestamped" → ajustar §4.4 cascata? Ou aceitar como déficit em /metodologia?>

## 7. Decisão escrita

- [ ] **Prosseguir para Sprint 5.3 sem mudanças**, OU
- [ ] **Ajustar `/metodologia` antes** (descrever ajuste exato), OU
- [ ] **Reduzir quota para pares específicos** (listar pares + nova quota)

**Justificativa:** <2–4 frases>

## 8. Próximos passos imediatos

<O que executar primeiro no Sprint 5.3.>
```

- [ ] **Step 3: Validar Prettier**

```bash
npx prettier --check docs/superpowers/specs/2026-XX-XX-piloto-fase4-aprendizados.md
```

- [ ] **Step 4: Commit**

```bash
git add docs/superpowers/specs/2026-XX-XX-piloto-fase4-aprendizados.md
git commit -m "docs(fase4): adicionar relatório de aprendizados do Sprint 5.2 piloto

12 declarações curadas, cascata aplicada, decisão sobre Sprint 5.3 registrada."
```

---

## Task 10: Auditorias finais + PR

> Executar suite completa de validações e abrir PR para `main` usando o template `.github/PULL_REQUEST_TEMPLATE/fase4.md`. Esta task NÃO mergeia — o merge final fica para depois da aprovação do André.

- [ ] **Step 1: Suite completa local (mesma do CI Ubuntu)**

```bash
pnpm format:check
pnpm lint
pnpm typecheck
pnpm test
pnpm validate-data
pnpm audit:paridade --piloto-mode
pnpm validate:log
pnpm check:archive-urls --recent
pnpm build:full
```

Expected: TODOS exit 0. Se algum falhar, corrigir antes de abrir PR.

- [ ] **Step 2: Auditoria de distribuição (observabilidade)**

```bash
pnpm audit:distribuicao
```

Output: `docs/distribuicao-fase4.md` regenerado. **Não bloqueia merge**, mas é evidência valiosa para o PR.

- [ ] **Step 3: Push da branch**

```bash
git push -u origin feat/fase4-sprint5-2-piloto
```

- [ ] **Step 4: Abrir PR usando template Fase 4**

```bash
gh pr create --title "feat(fase4): Sprint 5.2 — piloto de 12 declarações reais" --body "$(cat <<'EOF'
## Sprint

5.2 piloto

## Mudança editorial

- [x] 12 declarações novas (1 por tema × 2 candidatos)
- [x] 12 entradas em log-editorial.csv
- [x] Candidatos: lula-luiz-inacio, bolsonaro-flavio

## Auditoria automatizada

- `pnpm validate-data`: PASS
- `pnpm audit:paridade --piloto-mode`: PASS (12 declarações, 1×6×2)
- `pnpm audit:distribuicao`: ver docs/distribuicao-fase4.md
- `pnpm validate:log`: PASS (12/12 FK match)
- `pnpm check:archive-urls --recent`: PASS (12/12 Wayback HTTP 200)

## Auditoria humana

- [x] Sign-off por declaração: 12/12 (checklist §5.5 marcada em cada commit)
- [x] Wayback abre para todas 12 URLs
- [x] Transcrição confere com fonte primária (revisão palavra por palavra)

## Build

- `pnpm format:check`: PASS
- `pnpm lint`: PASS (--max-warnings=0)
- `pnpm typecheck`: PASS
- `pnpm test`: PASS
- `pnpm build:full`: PASS

## Relatório de aprendizados

Ver \`docs/superpowers/specs/2026-XX-XX-piloto-fase4-aprendizados.md\` para
métricas de tempo, cobertura de vereditos, e decisão sobre Sprint 5.3.

## Risco residual conhecido

<vazio | descrever>

🤖 Generated with [Claude Code](https://claude.com/claude-code)
EOF
)"
```

- [ ] **Step 5: Monitorar CI**

Aguardar status checks do GitHub Actions. Se algum falhar, reproduzir local, corrigir, push.

- [ ] **Step 6: Aguardar review do André + merge**

Não fazer squash merge sem confirmação explícita. Usar mensagem squash no formato Conventional Commits PT-BR (ver Sprint 5.1 PR #8 e Sprint Cards PR #9 como referência).

- [ ] **Step 7: Atualizar memory checkpoint após merge**

Criar `~/.claude/projects/C--Users-dezob-Projects-atlas/memory/checkpoint-fase4-sprint5-2-completa.md` apontando squash commit, e atualizar `MEMORY.md` para marcar como entry point atual.

---

## Apêndice A — Workflow de ingestão por declaração (9 passos)

> Referência canônica para Tasks 3.A, 3.B, 4.A, 4.B, ..., 8.A, 8.B (12 vezes total).

**Pré-requisitos antes de começar:**

- Tema (`tema_principal`) e candidato (`candidato_id`) decididos (Tasks 3–8 Steps 1–2)
- Declaração específica escolhida da longlist via cascata §4.4
- Templates de evento e declaração disponíveis em `docs/superpowers/templates/`

### Passo 3: Rodar pipeline de ingestão

Dependendo do tipo da fonte primária, usar o comando correto:

**Caso Nível 1 — YouTube oficial:**

```bash
pnpm scrape:youtube <URL_DO_VÍDEO>
# Saída esperada: .cache/youtube/<hash>.{json,mp3}
#                  → metadata + áudio MP3 baixados

pnpm transcribe .cache/youtube/<hash>.mp3
# Saída esperada: .cache/transcripts/<hash>.txt (transcrição Whisper bruta pt-BR)

pnpm archive <URL_DO_VÍDEO>
# Saída esperada: .cache/archive/<hash>.json com archive_url Wayback
```

**Caso Nível 2 — Mídia consolidada com vídeo embedado:**

```bash
pnpm scrape:url <URL_DA_PÁGINA>
# Saída: .cache/scrape/<hash>.{md,png} (markdown + screenshot via Firecrawl)

# Se há vídeo embedado no artigo, baixar áudio:
pnpm scrape:youtube <URL_DO_VÍDEO_EMBEDADO>
pnpm transcribe .cache/youtube/<hash>.mp3

pnpm archive <URL_DA_PÁGINA>
```

**Caso Nível 3 — Post de rede social:**

```bash
pnpm scrape:url <URL_DO_POST>
pnpm archive <URL_DO_POST>
# Transcrição não aplicável a texto puro; copiar texto literal manualmente.
```

### Passo 4: Verificar Wayback URL

```bash
curl -I "<archive_url>"
```

Expected: `HTTP/2 200` (ou `HTTP/1.1 200 OK`). Se falhar:

- Aguardar 30s e tentar de novo (Wayback é lento)
- Se persistir, re-rodar `pnpm archive <URL>` — pode ter dado timeout

### Passo 5: Revisar transcrição Whisper (HUMANO)

Abrir `.cache/transcripts/<hash>.txt` e o vídeo lado a lado. Conferir **palavra por palavra** o trecho específico no timestamp identificado. Whisper pt-BR erra:

- Nomes próprios ("Datafolha" → "data folha", "Selic" → "Célic")
- Números falados ("15%" → "quinze por cento" ou "15 por sento")
- Pontuação (acrescenta vírgulas inexistentes)

Anotar timestamp HH:MM:SS exato do início do trecho.

### Passo 6: Criar (ou reutilizar) evento

Se o evento ainda não existe em `data/eventos/`, criar:

1. Gerar ULID novo (`pnpm dlx ulid` ou https://www.ulidtools.com/).
2. Copiar `docs/superpowers/templates/evento.template.yaml` para `data/eventos/<ULID>.yaml`.
3. Preencher TODOS os campos `<PLACEHOLDER_X>`.
4. Validar com `pnpm validate-data` — se falhar, ler erro Zod e corrigir.

Se o evento JÁ existe (caso debate compartilhado entre candidatos), pular para passo 7 reusando `evento_id`.

### Passo 7: Criar declaração

1. Gerar ID no formato `YYYY-MM-DD-<candidato-slug>-<tema>-<descritor>`. Ex: `2025-08-15-lula-luiz-inacio-economia-juros-selic`.
   - Data: data do evento (não data da curadoria)
   - Descritor: 1–3 palavras kebab-case sobre o assunto
2. Copiar `docs/superpowers/templates/declaracao.template.md` para `data/declaracoes/<id>.md`.
3. Preencher TODOS os campos do frontmatter:
   - `id` e `slug`: idênticos (regex `/^[a-z0-9-]+$/`)
   - `candidato_id`, `evento_id`: FKs (validados por Zod)
   - `texto`: literal, palavra por palavra (revisado contra vídeo no passo 5)
   - `timestamp_no_evento`: HH:MM:SS
   - `contexto`: 1–2 frases factuais sem juízo
   - `tema_principal`: slug do tema (economia, saude, etc — bate com `data/temas/`)
   - `temas_secundarios`: array (pode ser vazio)
   - `tipo_estrutural`: array com 1+ valores do enum
   - `fonte_primaria_url`, `fonte_primaria_tipo`, `archive_url`
   - `vereditos_externos`: array (pode ser vazio se ainda não pesquisou — passo 8)
   - `versao: 1`, `criado_em` e `atualizado_em` ISO 8601 com TZ
4. Validar com `pnpm validate-data` — corrigir até passar.

### Passo 8: Buscar vereditos externos (opcional, mas recomendado)

Pesquisar no momento da curadoria — não depois:

```
site:lupa.uol.com.br "<trecho da declaração>" "<sobrenome candidato>"
site:aosfatos.org "<trecho>" "<sobrenome>"
site:projetocomprova.com.br "<trecho>" "<sobrenome>"
site:estadao.com.br/estadao-verifica "<trecho>"
```

Se encontrar match, popular `vereditos_externos[]` com:

- `veiculo`: `Lupa | Aos Fatos | Comprova | Estadão Verifica | Agência Pública | BBC Verify | outro`
- `classificacao`: literal do fact-checker (ex: "falso", "exagerado", "verdadeiro")
- `url`: link canônico para o veredito
- `data`: ISO 8601 da publicação do veredito
- `citacao_curta`: ≤ 300 chars, literal do parágrafo de conclusão do fact-checker (copy-paste, sem paráfrase)

**Critical:** se nenhum fact-checker reconhecido tem veredito, `vereditos_externos: []` permanece vazio. **Não inventar.** Não usar "outro" para fontes não-reconhecidas.

### Passo 9: Adicionar linha em `log-editorial.csv`

Append uma linha no formato:

```csv
<declaracao_id>,<candidato_id>,<tema>,<tipo_estrutural>,<fonte_tipo>,<true|false>,<motivo_inclusao>,Claude+André,André,<data_inclusao_ISO>
```

Onde:

- `tipo_estrutural`: 1 valor do array (o "principal" — geralmente o primeiro)
- `fonte_tipo`: igual a `fonte_primaria_tipo` da declaração
- `tem_veredito_externo`: `true` se `vereditos_externos[].length > 0`, senão `false`
- `motivo_inclusao`: começa com `cascata-N:` onde N ∈ {1, 2, 3, 4, 5}, seguido de breve justificação (ex: `cascata-1: única promessa de imposto na janela`)
- `data_inclusao`: ISO 8601 com TZ -03:00

### Passo 10: Marcar checklist §5.5

Abrir `docs/superpowers/templates/sign-off-checklist.md` mentalmente (ou copiar para scratch) e marcar TODOS os itens. Não commit até todos os checkboxes estarem fisicamente OK.

### Passo 11: Validação local incremental

```bash
pnpm validate-data
pnpm validate:log
```

Expected: ambos exit 0. Se `validate:log` falhar, geralmente é typo no `declaracao_id` ou `motivo_inclusao` que não começa com `cascata-N:`.

### Passo 12: Commit

(coberto pelos Steps 12 de cada sub-task em 3.A, 3.B, ..., 8.B)

---

## Apêndice B — Snippets úteis

### Gerar ULID rápido

```bash
node -e "import('ulid').then(m => console.log(m.ulid()))"
```

Saída: ULID de 26 chars (ex: `01KSQDGYBHGRTNYGSMCMPAAKH4`).

### ISO 8601 com timezone correto

```bash
node -e "console.log(new Date().toISOString())"
# Saída UTC: 2026-05-28T17:30:00.000Z

# Para -03:00, ajustar manualmente ou usar:
node -e "
const d = new Date();
const off = -180; // -3h em minutos
const local = new Date(d.getTime() - off * 60000);
console.log(local.toISOString().replace('Z', '-03:00'));
"
```

### Listar valores enum válidos do schema

```bash
grep -A 10 "fonteTipoEnum\|tipoEstruturalEnum\|eventoTipoEnum\|veiculoVeredito" src/content/config.ts
```

### Verificar status incremental durante curadoria

```bash
ls data/declaracoes/ | wc -l       # quantas declarações já criadas
wc -l data/log-editorial.csv       # esperado: 1 + N (1 header + N declarações)
pnpm audit:paridade                # exit 0 em modo setup (até < 12 declarações)
```

---

## Self-Review (do plan, antes de apresentar ao André)

### 1. Spec coverage

| Seção do spec §                                              | Coberto em                                  |
| ------------------------------------------------------------ | ------------------------------------------- |
| §6.3 Sprint 5.2 — Piloto: objetivo, mecânica, saída esperada | Tasks 3–9                                   |
| §5.3 Pipeline 9 passos                                       | Apêndice A                                  |
| §5.5 Checklist sign-off                                      | Task 2 + Apêndice A passo 10                |
| §4.4 Cascata de saliência                                    | Tasks 3–8 Step 2                            |
| §4.2 Janela temporal [2025-05-16, 2026-05-16]                | Apêndice A passo 6 (validação)              |
| §7.1 `criterio-selecao.yaml`                                 | NÃO precisa mudar — locked desde Sprint 5.1 |
| §7.2 `log-editorial.csv` schema                              | Apêndice A passo 9                          |
| §7.3 Scripts de auditoria                                    | Task 8 Step 13 + Task 10 Step 1             |
| §8.2 TEP Sprint 5.2                                          | Task 10 Steps 1–2                           |
| §8.4 Template PR Fase 4                                      | Task 10 Step 4                              |
| §6.3 Relatório de aprendizados                               | Task 9                                      |
| §6.3 Decisão escrita para Sprint 5.3                         | Task 9 Step 2 seção 7                       |

**Gaps potenciais identificados:**

- Auditoria manual de 6 declarações sorteadas (spec §2.2 #8) é da Sprint 5.4, não 5.2 — OK, fora de escopo aqui.
- Lighthouse audit (spec §2.2 #7) também 5.4 — OK.

### 2. Placeholder scan

- "TBD", "TODO", "implementar depois" no plan: nenhum encontrado.
- Templates têm `<PLACEHOLDER_X>` intencionalmente — são valores factuais a serem preenchidos pelo curador, não placeholders do plan. Documentado claramente como "preencher" em cada template.
- "Similar to Task N": referências a Apêndice A em vez de duplicar (escolha consciente para 12 ingressões idênticas em workflow).

### 3. Type consistency

- `candidato_id` vs `candidato-slug`: schema usa `candidato_id` (FK), templates usam `candidato_id` consistentemente. ✅
- `tema_principal` é slug (`economia`, `saude`, etc), não objeto. ✅ — bate com `data/temas/*.yaml` (campo `slug`).
- `fonte_primaria_tipo` enum: `youtube_oficial | tse | camara | senado | diario_oficial | midia_consolidada | rede_social_oficial`. ✅ confere com `src/content/config.ts:4-12`.
- `tipo_estrutural` é array (não único). ✅ confere com schema linha 118.
- Janela: usei [2025-05-16, 2026-05-16] (versão v1.1 do critério). ✅ confere com `audit-paridade.ts:32-33`.

### 4. Bite-sized check

Tasks 3–8 têm 13 steps cada (12 ingressões mecânicas + 1 validação). Cada step do Apêndice A é 2–15 min (mais demorado em Nível 2/3 da fonte). Aceitável para natureza editorial.

Tasks 1, 2, 9, 10 têm 4–7 steps cada, todos 2–5 min mecânicos. ✅

---

**Status:** plan completo, pronto para revisão do André. Salvar como `docs/superpowers/plans/2026-05-28-atlas-fase4-sprint5-2-piloto.md`.
