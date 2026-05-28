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
