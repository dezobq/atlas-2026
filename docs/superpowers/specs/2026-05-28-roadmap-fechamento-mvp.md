---
título: "Atlas dos Candidatos · 2026 — Roadmap de Fechamento do MVP (release v0.1.0)"
versão: "1.0"
status: "mapa de sequenciamento · aguardando revisão do André"
autor: "André Queiroz (curador) + Claude (rascunho)"
data: "2026-05-28"
spec_pai: "docs/superpowers/specs/2026-05-28-atlas-fase4-conteudo-mvp-design.md"
spec_avô: "docs/superpowers/specs/2026-05-27-atlas-design.md"
licença_conteúdo: "CC-BY 4.0"
---

# Atlas — Roadmap de Fechamento do MVP (release v0.1.0)

> **Propósito deste documento:** dar um mapa único e navegável de **tudo que falta** entre o estado atual (piloto a 10/12 em branch) e o **release `v0.1.0`** (o gate T+0 de lançamento). Não introduz design novo de feature — consolida o que já está especificado nos specs/plans da Fase 4 em uma sequência com critério de DONE, dono e dependências explícitas. É um documento-mapa, não um plan executável: cada camada acionável vira (ou já tem) seu próprio plan superpowers.

---

## 0. Decisão de escopo desta sessão (registro)

Em 2026-05-28, ao perguntar "o que falta para o MVP e o que focar", o curador cravou conscientemente:

> **MVP = conteúdo → release.** O caminho crítico é chegar a ~60 declarações + dataset `v0.1.0` + GitHub Release + Zenodo DOI. As features de **redistribuição** identificadas na revisão de premissas I1–I6 — **API JSON pública (I4), embed widget (I4), RSS feeds + newsletter (I6)** — saem do caminho crítico e tornam-se **pós-launch**.

**Rationale aceito:**

1. "No ar e indexável" é pré-requisito de **toda** redistribuição — mídia e LLMs só citam o que existe e é encontrável.
2. O **dataset** (`.jsonl`+`.csv`, já no escopo do release) já é a forma primária de redistribuição para a audiência acadêmica/LLM; API e embed são refinamentos aditivos.
3. O **card visual** (PR #9) já entrega a compartilhabilidade social básica (1 das 3 features de I4).
4. O gargalo real do MVP é **humano** (curadoria das declarações, ~15–30h indelegáveis), não técnico — adiar features de código que não destravam esse gargalo é correto.

**O que isto NÃO altera:** a revisão I1–I6 permanece válida e cravada no Vault. Apenas a **ordem** muda — I4/I6 vêm depois do `v0.1.0`, não antes. Ver [[checkpoint-revisao-premissas-2026-05-28]].

---

## 1. Estado atual (2026-05-28)

| Camada do produto                   | Estado                         | Referência                                                                                                                |
| ----------------------------------- | ------------------------------ | ------------------------------------------------------------------------------------------------------------------------- |
| Infra técnica (Fases 1–3)           | ✅ completa                    | SEO, páginas, busca Pagefind, componentes, JSON-LD                                                                        |
| Setup editorial (Sprint 5.1, PR #8) | ✅ completa                    | 2 candidatos reais, `/metodologia`, `/errata`, `/sobre`, `criterio-selecao.yaml` locked, scripts de auditoria, log header |
| Card visual (PR #9)                 | ✅ completa                    | 4 formatos Satori; 1 de 3 features de I4 (bônus, fora do caminho crítico)                                                 |
| Piloto (Sprint 5.2)                 | 🔄 **em branch, não mergeado** | 10/12 declarações em DRAFT (`validador="pendente"`); relatório de aprendizados concluído; corpo de PR pronto              |

**Detalhe do piloto** (branch `feat/fase4-sprint5-2-piloto`):

- **10 declarações publicadas**, todas DRAFT pendentes de sign-off. **Lula 6/6 temas · Flávio 4/6.**
- **2 déficits estruturais** confirmados (Risco F4-5): **Flávio × educação** e **Flávio × saúde** — não há fala direta de 1ª pessoa dele nesses temas dentro da janela, em fonte acessível.
- 171 testes verdes; `audit:paridade --piloto-mode` reporta honestamente 10/12.
- Recomendação do relatório: **GO condicional** para o lote, com 3 pré-condições técnicas resolvidas antes de escalar.

Referências canônicas do estado: `docs/superpowers/research/2026-05-28-piloto-relatorio-aprendizados.md` · [[checkpoint-piloto-branch-2026-05-28]].

---

## 2. Caminho crítico (visão de dependências)

```
┌─────────────┐   ┌──────────────────┐   ┌─────────────────┐   ┌──────────────────┐
│  CAMADA 0   │   │     CAMADA 1     │   │    CAMADA 2     │   │     CAMADA 3     │
│ Fechar      │   │ Destravar a      │   │ Lote principal  │   │ Release v0.1.0   │
│ piloto      │   │ fábrica          │   │ (Sprint 5.3)    │   │ (Sprint 5.4)     │
│             │   │                  │   │                 │   │                  │
│ • déficits  │   │ • fix Wayback    │   │ • ~40-50 decl.  │   │ • auditoria 6    │
│ • sign-off  │   │   (SPN2 + auth)  │   │   restantes     │   │ • Lighthouse ≥95 │
│ • merge PR  │   │ • acesso gov.br  │   │ • paridade real │   │ • dataset+SCHEMA │
│             │   │                  │   │                 │   │ • GH Release+DOI │
└──────┬──────┘   └────────┬─────────┘   └────────┬────────┘   └────────┬─────────┘
       │                   │                      │                     │
       └───────────────────┴──────────►───────────┴─────────►───────────┘
   (0 e 1 podem ser PARALELOS:                (2 depende de 1 RESOLVIDA   (3 depende de
    sign-off é humano, fix é código)           para gerar snapshots)       2 completa)
```

**Insight de dependência:** Camadas 0 e 1 **não competem por recursos** (sign-off = André; fix do Wayback = Claude) → podem rodar em paralelo. A Camada 2 (lote) **não pode escalar** sem a Camada 1 resolvida (sem `archive` funcionando, 60 declarações não geram snapshot). A Camada 3 só fecha quando a 2 atinge a contagem-alvo.

---

## 3. Camada 0 — Fechar o piloto

**Objetivo:** tirar as 10 declarações de DRAFT e levá-las a `main`, com a decisão dos 2 déficits registrada.

| Item                                                                | Dono           | Notas                                                                                                                                                                 |
| ------------------------------------------------------------------- | -------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Decidir os 2 déficits do Flávio (educação + saúde)                  | **André**      | Recomendação C do relatório: **reduzir quota nesses 2 pares + documentar em `/metodologia`** (não inflar/misatribuir). Decisão muda o alvo final de declarações (§6). |
| Sign-off das 10 drafts (checklist §5.5)                             | **André**      | Conferir verbatim/datas/casing contra fonte. Opcional: elevar 🟡5 e 🟡8 a fonte oficial gov.br (depende da Camada 1 destravada).                                      |
| Atualizar `validador` no `log-editorial.csv` (`pendente` → `André`) | André + Claude | 1 linha por declaração assinada.                                                                                                                                      |
| Abrir/mergear o PR do piloto para `main`                            | **André**      | Corpo de PR já pronto em `docs/superpowers/research/2026-05-28-piloto-PR-body.md`.                                                                                    |

**Critério de DONE (Camada 0):**

- `log-editorial.csv` com 10 linhas `validador="André"`.
- Decisão dos déficits escrita (no relatório de aprendizados §7 + refletida em `/metodologia` se reduzir quota).
- PR do piloto mergeado em `main`; CI verde.

**Bloqueio:** nenhum técnico. É trabalho intrinsecamente humano (decisão editorial + verificação).

---

## 4. Camada 1 — Destravar a fábrica de conteúdo

**Objetivo:** ter o pipeline de snapshot confiável e o acesso à fonte oficial resolvidos **antes** de escalar para ~50 declarações. Pré-condição dura de escala.

### 4.1 Fix do `pnpm archive` (Wayback SPN2 + auth) 🔴 BLOQUEANTE

**Root-cause confirmado (relatório §5.3):** o `POST web.archive.org/save/{url}` sem auth agora devolve HTTP 200 com HTML interativo (não mais 302 com `Location`); a API JSON do SPN2 responde `401 "You need to be logged in to use Save Page Now."`. **O Wayback passou a exigir autenticação.**

| Sub-tarefa                                         | Dono             | Detalhe                                                                                                                                                                                                                                                              |
| -------------------------------------------------- | ---------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Migrar `scripts/archive.ts` para SPN2 autenticado  | **Claude (TDD)** | `POST /save` com header `Authorization: LOW <accessKey>:<secret>` + `Accept: application/json` → recebe `job_id` → polling em `/save/status/{job_id}` até obter `timestamp` → montar `archive_url`. Reescrever `extractArchiveUrl` (não há mais header de redirect). |
| Testes unitários das funções puras                 | **Claude (TDD)** | Montar header de auth, parsear resposta de `job`, parsear `status`, construir URL do snapshot — todas puras e testáveis. Caminho ao vivo só roda com credencial.                                                                                                     |
| Gerar credencial S3 do archive.org                 | **André**        | Logar em archive.org → gerar chaves em `archive.org/account/s3.php` → guardar no `.env` (gitignored) como `ARCHIVE_ORG_ACCESS_KEY` / `ARCHIVE_ORG_SECRET_KEY`. **Claude não acessa nem comita `.env`** (deny rule).                                                  |
| Validar `scripts/lib/env.ts` exige as novas chaves | Claude           | Adicionar ao schema de validação de `.env`.                                                                                                                                                                                                                          |

**Critério de DONE (4.1):**

- `pnpm archive <url>` gera snapshot **novo** e retorna `archive_url` que responde HTTP 200.
- Testes unitários novos verdes; cobertura ≥ 80% nas funções novas.
- `pnpm check:archive-urls --recent` passa nas declarações tocadas.

### 4.2 Acesso à fonte oficial gov.br (CAPTCHA) 🟡 DECISÃO

**Problema (relatório §5.2):** gov.br bloqueia CAPTCHA em 3 caminhos (browser ao vivo, snapshot Wayback servido, WebFetch). Mitigação usada no piloto: re-sourcear o **mesmo verbatim** de mídia consolidada acessível (Agência Gov/Brasil EBC, Band, Poder360, Gazeta do Povo).

**Decisão a tomar (André):** para o lote, escolher uma política e padronizá-la:

- **(a)** humano resolve CAPTCHA pontualmente quando a fonte oficial gov.br for desejável, **ou**
- **(b)** padronizar mídia consolidada acessível + **nota de fonte** em `/metodologia` explicando o trade-off.

**Critério de DONE (4.2):** política escrita; se opção (b), nota adicionada a `/metodologia`.

---

## 5. Camada 2 — Lote principal (Sprint 5.3)

**Objetivo:** completar as declarações restantes até a contagem-alvo, com o critério já validado pelo piloto.

| Item                                         | Dono               | Notas                                                                                                      |
| -------------------------------------------- | ------------------ | ---------------------------------------------------------------------------------------------------------- |
| Curadoria das ~40–50 declarações restantes   | **André + Claude** | Pipeline de 9 passos (spec §5.3). O gargalo: 15–30h de trabalho humano (transcrição, sign-off).            |
| Snapshot Wayback em 100% (depende de 4.1)    | Claude             | Cada declaração nova gera snapshot fresco via `pnpm archive` corrigido.                                    |
| Mini-PRs de 10–12 declarações por bloco      | André + Claude     | Evita PR gigante; histórico incremental. Estratégia (por candidato vs por tema) decidida no início do 5.3. |
| `audit:paridade` incremental verde a cada PR | Claude             | Reflete a quota real (ajustada pelos déficits).                                                            |
| `log-editorial.csv` FK match 100%            | Claude             | `validate:log` exit 0.                                                                                     |

**Critério de DONE (Camada 2):**

- Contagem-alvo de declarações atingida (ver §6 para o número exato, função da decisão de déficit).
- `audit:paridade` (modo final) verifica a distribuição-alvo por candidato/tema.
- Todas as validações verdes; PRs mergeados.

**Bloqueio:** depende da Camada 1 (4.1) resolvida.

---

## 6. A contagem-alvo de declarações (função da decisão de déficit)

O número final **não é fixo em 60** — depende da Camada 0 (decisão dos 2 déficits do Flávio):

| Cenário                                                            | Lula     | Flávio   | Total      | Restantes a produzir (já temos 10) |
| ------------------------------------------------------------------ | -------- | -------- | ---------- | ---------------------------------- |
| **Pleno** (60, paridade 5×6 rígida)                                | 30 (5×6) | 30 (5×6) | **60**     | **50**                             |
| **Recomendação C** (reduz quota Flávio educ.+saúde p/ a realidade) | 30 (5×6) | 20 + N   | **50 + N** | **40 + N**                         |

Onde `N` = total de declarações reais que o Flávio tem em educação + saúde dentro da janela (provavelmente baixo, talvez 0–2 cada).

**Implicação:** a decisão de déficit (Camada 0) precisa anteceder o fechamento da Camada 2, porque define o que `audit:paridade --final-mode` exige. O spec §4.3 já prevê baixar quota apenas para os pares deficitários, documentando em `/metodologia`.

---

## 7. Camada 3 — Release v0.1.0 (Sprint 5.4)

**Objetivo:** auditoria final + publicação do dataset + checkpoint. Espelha o spec Fase 4 §2.2 (definição binária de DONE) e o gate T+0 do spec mestre §15.

| Item                                                   | Dono           | Critério                                                                        |
| ------------------------------------------------------ | -------------- | ------------------------------------------------------------------------------- |
| Auditoria manual de 6 declarações sorteadas (1/tema)   | **André**      | Transcrição conferida vs vídeo + Wayback abre. Erro factual → bloqueia release. |
| `audit:paridade --final-mode`                          | Claude         | "PASS: distribuição-alvo atingida".                                             |
| `audit:distribuicao`                                   | Claude         | `docs/distribuicao-fase4.md` regenerado.                                        |
| Lighthouse SEO ≥ 95 **e** Accessibility ≥ 95 em 3 URLs | André + Claude | 1 perfil, 1 declaração, 1 evento → `docs/lighthouse-fase4.json`.                |
| `pnpm export:dataset`                                  | Claude         | `dist-dataset/atlas-2026-v0.1.0.{jsonl,csv}` + `SCHEMA.md`.                     |
| GitHub Release `v0.1.0`                                | André + Claude | Artefatos anexados; corpo cita commit-SHA de `criterio-selecao.yaml`.           |
| Zenodo DOI                                             | **André**      | Gerado a partir do Release (citação acadêmica).                                 |
| Checkpoint Vault                                       | Claude         | `memory/checkpoint-fase4-completa.md` + `MEMORY.md` aponta como entry point.    |

**Critério de DONE (Camada 3 = DONE do MVP):** todas as condições do spec Fase 4 §2.2 verdadeiras simultaneamente.

---

## 8. Fora do caminho crítico (pós-launch, decisão §0)

Registrado para não se perder — **não bloqueia o `v0.1.0`**:

| Feature                               | Origem | Quando                                                  |
| ------------------------------------- | ------ | ------------------------------------------------------- |
| API JSON pública (`/api/v1/*.json`)   | I4     | Pós-launch; dataset já cobre acadêmico/LLM no MVP       |
| Embed widget (web component + iframe) | I4     | Pós-launch; depende de dataset maduro                   |
| RSS feeds (5 endpoints)               | I6     | Pós-launch; canal de retorno, não de descoberta inicial |
| Newsletter mensal (Buttondown)        | I6     | Pós-launch; operacional                                 |

Cada um terá seu próprio brainstorming → writing-plans quando chegar a hora. Detalhe em `Vault/Decisoes/I4-Compartilhabilidade.md` e `I6-Canal-Ativo-com-Audiencia.md`.

---

## 9. Riscos e bloqueios conhecidos

| Risco                                                         | Severidade | Mitigação                                                                                                                    | Onde        |
| ------------------------------------------------------------- | ---------- | ---------------------------------------------------------------------------------------------------------------------------- | ----------- |
| Wayback auth não destrava (chaves S3 indisponíveis/limitadas) | **Alta**   | Confirmar geração de chaves cedo; fallback = API de disponibilidade para snapshots existentes (não serve para conteúdo novo) | Camada 1    |
| Déficit estrutural se repete em outros pares no lote          | Média      | Piloto já validou o padrão; aplicar recomendação C consistentemente; documentar em `/metodologia`                            | Camada 2    |
| Burnout na curadoria de ~40–50 itens                          | Média      | Mini-PRs incrementais; gate honesto de 6 semanas (spec §6.3); piloto já mediu o ritmo                                        | Camada 2    |
| Misatribuição ao forçar cota deficitária                      | **Alta**   | Regra dura: nunca registrar fala de terceiro como do candidato; quota reduzida > inflação                                    | Camadas 0/2 |

---

## 10. Próximos passos imediatos (quando sair do modo "só mapa")

1. **Paralelo A (Claude, autônomo):** brainstorming → writing-plans → TDD do fix do Wayback (Camada 1.1). É a única peça de design técnico novo e a de maior alavanca.
2. **Paralelo B (André):** decidir os 2 déficits (Camada 0) + iniciar sign-off das 10 drafts.
3. **Após A+B:** gerar credencial S3 (André) → validar `pnpm archive` ao vivo → abrir Sprint 5.3 (lote).
4. **Sprint 5.3 → 5.4:** lote → release, conforme spec Fase 4 §6.4–6.5 (já especificado).

---

## Apêndice — Documentos relacionados

- **Definição de DONE binária:** `docs/superpowers/specs/2026-05-28-atlas-fase4-conteudo-mvp-design.md` §2.2
- **Gate T+0 de lançamento:** `docs/superpowers/specs/2026-05-27-atlas-design.md` §15
- **Estado do piloto + root-cause Wayback:** `docs/superpowers/research/2026-05-28-piloto-relatorio-aprendizados.md`
- **Plan do piloto (Sprint 5.2):** `docs/superpowers/plans/2026-05-28-atlas-fase4-sprint5-2-piloto.md`
- **Corpo de PR do piloto pronto:** `docs/superpowers/research/2026-05-28-piloto-PR-body.md`
- **Decisões estratégicas I1–I6:** [[checkpoint-revisao-premissas-2026-05-28]] + `Vault/Decisoes/`
- **Constraint FK slug vs ULID:** `Vault/Bugs/Candidato-FK-Slug-vs-ULID.md` + CLAUDE.md #9

---

**Status:** mapa consolidado, pronto para revisão do André. Quando aprovado, o próximo passo natural é `writing-plans` para a Camada 1.1 (fix do Wayback) — a peça acionável de maior alavanca.
