# Piloto Sprint 5.2 — 10/12 declarações reais + fix slug/ULID

> Corpo de PR pronto (Task 10). Abrir com:
> `gh pr create --base main --head feat/fase4-sprint5-2-piloto --title "feat(fase4): piloto Sprint 5.2 — 10/12 declarações + fix slug/ULID" --body-file docs/superpowers/research/2026-05-28-piloto-PR-body.md`
> (precisa de `git push -u origin feat/fase4-sprint5-2-piloto` antes — aguarda seu OK.)

## O que é

Piloto editorial da Fase 4: declarações reais de candidatos com fonte primária + snapshot Wayback + **sign-off humano pendente**. Valida o critério editorial v1.1 antes do lote (Sprint 5.3).

## Conteúdo

- **10/12 declarações** publicadas em `data/declaracoes/`, todas com `validador="pendente"` — **este PR é o gate de sign-off**. Lula **6/6** temas; Flávio **4/6**.
- **Fix crítico `e8a2149`** (slug/ULID): 6 pontos chaveavam a FK de candidato pelo ULID `data.id` em vez do slug → o perfil do candidato renderizava "0 declarações" (bug invisível ao CI). Corrigido + 2 testes de regressão + `Vault/Bugs/Candidato-FK-Slug-vs-ULID.md` + CLAUDE.md constraint #9.
- **2 déficits documentados** (Flávio × educação, Flávio × saúde): sem fala direta de 1ª pessoa na janela — Risco F4-5 confirmado. Ver `docs/superpowers/research/2026-05-28-piloto-relatorio-aprendizados.md`.

## Revisão / sign-off (André)

- [ ] Conferir **verbatim / datas / casing** das 10 declarações (cada draft traz flags `confirmar verbatim` e, quando aplicável, `elevar à fonte oficial`). Checklist: `docs/superpowers/templates/sign-off-checklist.md`.
- [ ] **Decidir os 2 déficits**: A) novo lead · B) N2 · **C) documentar (recomendado)** — relatório §3.
- [ ] Trocar `validador="pendente"` → `André` nas declarações assinadas (log + considerar campo).
- [ ] ⚠️ **🟡6 saúde**: citação genérica ("nunca antes um governo entregou tanto") — revisar fit de tema.
- [ ] ⚠️ **🟡7 educação**: NÃO confundir com a fala editada que a Lupa desmentiu; esta é a fala real do Prouni 31/03/2026.

## Pré-condições do lote (NÃO bloqueiam este PR)

- `pnpm archive` (Save Page Now) falhando para todos os domínios — investigar antes do Sprint 5.3.
- Acesso à fonte oficial gov.br (CAPTCHA em browser/snapshot/WebFetch).

## Gates

CI verde: `format:check` · `lint` · `typecheck` · `validate-data` · `validate:log` · `audit:paridade` (setup) · `test` (171/171) · `build`. `audit:paridade --piloto-mode` = **10/12 honesto** (faltam apenas os 2 pares do Flávio).

🤖 Generated with [Claude Code](https://claude.com/claude-code)
