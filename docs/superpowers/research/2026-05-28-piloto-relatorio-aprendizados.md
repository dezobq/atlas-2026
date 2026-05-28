# Relatório de Aprendizados — Piloto Sprint 5.2 (Task 9)

> **Status:** piloto executado a **10/12 declarações** publicadas (branch `feat/fase4-sprint5-2-piloto`, commits `8d1c605` · `e8a2149` · `287aff8` · `f3bb516`). Todas `validador="pendente"` — sign-off humano pendente no PR. **2 déficits estruturais** restantes + decisão editorial + sign-off são do André.
>
> Este relatório cumpre a Task 9 do plan e produz a **decisão escrita sobre prosseguir** para o lote (Sprint 5.3).

---

## 1. Resumo executivo

O piloto validou o critério editorial v1.1 e o pipeline ponta-a-ponta. **10 das 12 declarações-alvo foram preparadas com fonte primária acessível + verbatim confirmado + snapshot Wayback existente**, todas pendentes de sign-off. Os **2 itens não alcançados são déficits estruturais reais** (Flávio × Educação e Flávio × Saúde): não há fala direta de 1ª pessoa do pré-candidato nesses temas dentro da janela, em nenhuma fonte acessível — **confirma empiricamente o Risco F4-5** do spec.

**Recomendação:** **GO condicional** para o lote (Sprint 5.3), com 3 pré-condições técnicas (§5) resolvidas antes de escalar de 10 → 60 declarações.

---

## 2. Resultado quantitativo

| Candidato  | Tema             | tipo_estrutural       | Fonte (acessível) | Estado                     |
| ---------- | ---------------- | --------------------- | ----------------- | -------------------------- |
| Lula       | meio-ambiente    | interpretacao_pessoal | Agência Brasil    | ✅ pendente                |
| Lula       | economia         | dado_numerico         | Band              | ✅ pendente                |
| Lula       | saúde            | comparacao            | Agência Gov       | ✅ pendente ⚠️ fit de tema |
| Lula       | educação         | interpretacao_pessoal | Poder360          | ✅ pendente                |
| Lula       | segurança        | promessa              | Conexão Tocantins | ✅ pendente                |
| Lula       | política externa | interpretacao_pessoal | Agência Brasil    | ✅ pendente                |
| Flávio     | economia         | atribuicao_a_terceiro | Agência Senado    | ✅ pendente                |
| Flávio     | segurança        | compromisso_politico  | InfoMoney         | ✅ pendente                |
| Flávio     | meio-ambiente    | comparacao            | Gazeta do Povo    | ✅ pendente                |
| Flávio     | política externa | compromisso_politico  | Gazeta do Povo    | ✅ pendente                |
| **Flávio** | **educação**     | —                     | —                 | 🔴 **déficit**             |
| **Flávio** | **saúde**        | —                     | —                 | 🔴 **déficit**             |

**Lula 6/6 · Flávio 4/6 · Total 10/12.** Cobertura de tipos estruturais (Lula): 4 distintos (interpretacao_pessoal, dado_numerico, comparacao, promessa). Diversidade boa; sem inflar.

---

## 3. Os 2 déficits estruturais (Risco F4-5) — análise A/B/C

### 🔴 Flávio × Educação

- **Evidência:** as fontes disponíveis na janela são (a) análises/críticas de terceiros (sindicatos, colunas de opinião) sobre o _programa_ de Flávio, e (b) o documento de programa descrito em 3ª pessoa. **Nenhuma fala direta de 1ª pessoa** dele sobre educação foi localizada na janela. Material temático próprio é de 2024 (fora da janela).

### 🔴 Flávio × Saúde

- **Evidência:** o "Plano Real da Saúde" é descrito por colunistas (Diário do Poder, CNN/Uribe); a única **citação direta** pertence ao ex-ministro **Queiroga**, não a Flávio. As checagens (Lupa/Aos Fatos/Terra) referem-se a um **boato desmentido** (privatizar o SUS), não a uma fala dele.

### Opções (decisão do André)

- **A) Buscar outro lead na janela.** Baixa probabilidade — duas rodadas de pesquisa (worksheet + esta sessão) não acharam fala direta acessível.
- **B) Aceitar fonte N2 fraca / `atribuicao_a_terceiro`.** **Não recomendado**: registrar a fala do Queiroga ou um boato como "declaração de Flávio" é **misattribuição** — fere a regra dura de não atribuir a um candidato palavras que não são dele. Seria um precedente editorial perigoso para uma base que se vende como verbatim-verificável.
- **C) Reduzir quota nesses 2 pares + documentar o déficit.** **RECOMENDADO** — é a saída explicitamente prevista no spec §4.3/§6.3 ("registrar a lacuna abertamente em vez de inflar artificialmente"). Mantém a integridade e a régua igual para todos.

> **Recomendação:** **C**. O piloto entrega **10/12 + 2 déficits documentados** — um resultado honesto e defensável. A decisão final é sua, no sign-off.

---

## 4. Validação do critério editorial v1.1

- **Janela temporal** (Errata [2025-05-16, 2026-05-28]): funcionou; todos os eventos publicados caem na janela (audit confirma).
- **Paridade rígida + cascata:** o `audit:paridade --piloto-mode` agora reporta com precisão (1 por par), após o fix do bug de chave (§5.1). `motivo_inclusao` com prefixo `cascata-N:` em 100% das linhas (validado por `validate:log`).
- **Sem veredito próprio:** mantido — `vereditos_externos: []` em todas; nenhuma classificação de veracidade emitida.
- **Lock de candidatos:** mantido (data_corte 2026-05-16 inalterada).

---

## 5. Aprendizados técnicos (pré-condições para o lote)

1. **[RESOLVIDO] Bug FK slug vs ULID** — 6 pontos chaveavam o join de candidato pelo ULID `data.id` em vez do slug; perfil do candidato ficava vazio e o audit piloto falhava-fantasma, **tudo invisível ao CI**. Corrigido (commit `e8a2149`) + 2 testes de regressão + `Vault/Bugs/Candidato-FK-Slug-vs-ULID.md` + CLAUDE.md constraint #9.
2. **[PRÉ-CONDIÇÃO] gov.br bloqueia CAPTCHA em 3 caminhos** (browser ao vivo, snapshot Wayback servido, WebFetch). Para o lote, a fonte oficial gov.br exige um humano (resolver CAPTCHA) ou outro mecanismo. Mitigação usada no piloto: re-sourcear o **mesmo verbatim** de mídia consolidada acessível (Agência Gov/Brasil EBC, Band, Poder360, Gazeta do Povo, Conexão Tocantins).
3. **[PRÉ-CONDIÇÃO — ROOT-CAUSE CONFIRMADO] `pnpm archive` (Save Page Now) quebrado.** Diagnóstico (2026-05-28): o `POST web.archive.org/save/{url}` (sem auth) agora devolve **HTTP 200 com a página HTML interativa** (≈145 KB), não mais um 302 com `Location`/`Content-Location` — por isso `scripts/archive.ts` acha que não há snapshot. A API JSON do SPN2 (`Accept: application/json`) responde **`401 "You need to be logged in to use Save Page Now."`** → **o Wayback passou a EXIGIR autenticação**. Correção:
   - **Código (agente pode):** migrar `scripts/archive.ts` para a API SPN2 — `POST /save` com `Authorization: LOW <accessKey>:<secret>` + `Accept: application/json` → recebe `job_id` → faz polling em `/save/status/{job_id}` até obter o `timestamp`. Atualizar `extractArchiveUrl` (não há mais header de redirect). Funções puras (montar header, parsear job/status) são TDD-áveis; o caminho ao vivo só testa com a credencial.
   - **Credencial (André):** criar/logar conta archive.org → gerar chaves S3 em `archive.org/account/s3.php` → guardar no `.env` (gitignored) como `ARCHIVE_ORG_ACCESS_KEY`/`ARCHIVE_ORG_SECRET_KEY`. O agente NÃO acessa nem comita `.env`.
   - **Mitigação atual:** snapshots **já existentes** via API de disponibilidade (`archive.org/wayback/available`) — funcionou para as 10. Sem isso, gerar novos snapshots (lote, 60 decl.) fica bloqueado.
4. **[PROCESSO] Verbatim via WebFetch** é razoável para _strings curtas literais_ de páginas acessíveis, mas **não é confiável como verdade final** — por isso todo draft fica `validador="pendente"` + flag "confirmar verbatim". O modelo "agente prepara / humano assina" se mostrou adequado.

---

## 6. Qualidade de fonte (nota para o sign-off)

Várias declarações foram sourceadas de mídia consolidada porque a fonte oficial (gov.br) estava bloqueada. No sign-off, considere **elevar à fonte primária oficial** onde aplicável (pronunciamentos no canal Governo do Brasil / releases gov.br / Agência Senado), mantendo o snapshot. Itens marcados nos comentários DRAFT: 🟡5 (Band→gov.br/YouTube), 🟡8 (Conexão Tocantins→gov.br/Planalto).

---

## 7. Decisão Go/No-Go para o lote (Sprint 5.3)

**GO condicional.** O critério e o pipeline estão validados; o conteúdo é alcançável com integridade. Antes de escalar 10 → 60:

1. Resolver o `pnpm archive` (§5.3) — sem archive confiável, 60 declarações não publicam.
2. Definir o acesso à fonte oficial gov.br (§5.2) — humano no loop para CAPTCHA, ou padronizar mídia consolidada + nota de fonte.
3. Decidir os 2 déficits do Flávio (§3, recomendação C) e refletir a quota real no `audit --final-mode`.
4. Sign-off humano das 10 atuais + abertura do PR do piloto antes de iniciar o lote.
