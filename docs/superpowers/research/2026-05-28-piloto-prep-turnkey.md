# Worksheet Turnkey — Verificação + Sign-off do Piloto (12 declarações)

> **Fluxo:** Claude preparou tudo (metadados + `archive_url` real + texto-candidato sinalizado). **Você:** abre cada fonte/snapshot no browser, confere o `texto` **palavra-por-palavra**, corrige, marca o sign-off. **Depois:** Claude gera os arquivos `data/eventos/*.yaml` + `data/declaracoes/*.md` + linhas do `log-editorial.csv` (UTC `Z`) e roda as validações.
>
> ⚠️ **Todo `texto_candidato` foi extraído via WebFetch (modelo sumarizador) — NÃO é verbatim confiável.** Tratar como _sugestão a verificar contra a fonte primária_. Datas com `XX`/`T00:00:00Z` são placeholders a confirmar.
>
> Janela vigente: **[2025-05-16, 2026-05-28]** (Errata — ver [[Extensao-Janela-Temporal]]).

## Legenda de status

- 🟢 **PRONTO P/ VERIFICAR** — texto-candidato + `archive_url` real. Você só confere o texto e assina.
- 🟡 **TEXTO PENDENTE** — `archive_url` ok (ou a gerar), mas o texto precisa que você abra a fonte e copie o verbatim (gov.br tem CAPTCHA p/ o Claude).
- 🟠 **VERIFICAR FONTE** — citação parafraseada/nome suspeito; precisa de confirmação cuidadosa.
- 🔴 **LACUNA** — sem lead válido na janela; precisa de nova fonte OU decisão de quota/N2.

## Placar

| Status                         | Qtd | Quais                                                                         |
| ------------------------------ | --- | ----------------------------------------------------------------------------- |
| 🟢 Pronto p/ verificar         | 4   | Lula MeioAmb · Flávio Economia · Flávio Segurança · Flávio MeioAmb            |
| 🟡 Texto pendente (você copia) | 5   | Lula Economia · Lula Saúde · Lula Educação · Lula Segurança · Lula PolExterna |
| 🟠 Verificar fonte             | 1   | Flávio PolExterna                                                             |
| 🔴 Lacuna real                 | 2   | **Flávio Educação** · **Flávio Saúde**                                        |

**Tradução:** ~10 declarações são alcançáveis (4 imediatas + 5 que você copia o verbatim + 1 a verificar). **2 são lacunas reais** que precisam da sua decisão (achar outro lead, ou aplicar N2/reduzir quota — vide [[Extensao-Janela-Temporal]] e relatório de aprendizados Task 9).

---

## 🟢 1. Lula × Meio Ambiente — PRONTO

- **declaracao_id:** `2025-11-10-lula-luiz-inacio-meio-ambiente-cop30-tragedia-presente`
- **candidato_id:** `01KSQDGYBHGRTNYGSMCMPAAKH4` · **tema:** meio-ambiente · **tipo_estrutural:** `["interpretacao_pessoal"]`
- **evento.titulo:** Abertura da COP30 — Belém
- **evento.data:** `2025-11-10T13:00:00.000Z` ⚠️ confirmar horário
- **evento.tipo:** `declaracao_oficial` · **fonte_primaria_tipo:** `midia_consolidada`
- **fonte_primaria_url:** https://agenciabrasil.ebc.com.br/meio-ambiente/noticia/2025-11/confira-integra-do-discurso-de-lula-na-abertura-da-cop30-em-belem
- **archive_url:** `http://web.archive.org/web/20251205111212/https://agenciabrasil.ebc.com.br/meio-ambiente/noticia/2025-11/confira-integra-do-discurso-de-lula-na-abertura-da-cop30-em-belem` ✅
- **texto_candidato:** ⚠️ VERIFICAR: _"A mudança do clima já não é uma ameaça do futuro. É uma tragédia do presente."_
- **contexto:** Discurso de Lula na abertura da COP30, em Belém, em 10/11/2025.
- **motivo_inclusao:** `cascata-4: discurso de abertura da COP30, evento de altíssima audiência`
- [ ] **SIGN-OFF André**

## 🟢 2. Flávio × Economia — PRONTO (com correção)

- **declaracao_id:** `2025-07-04-bolsonaro-flavio-economia-iof-stf`
- **candidato_id:** `01KSQDGYBJK8N8YJAWXHXSPA33` · **tema:** economia · **tipo_estrutural:** `["atribuicao_a_terceiro"]`
- **evento.titulo:** Reação de Flávio Bolsonaro à decisão do STF sobre o IOF
- **evento.data:** `2025-07-04T00:00:00Z` ⚠️ confirmar
- **evento.tipo:** ⚠️ **`post_rede_social`** (era post, não plenário — correção do agente) · **fonte_primaria_tipo:** `rede_social_oficial` (reconfirmar — Agência Senado reproduziu o post)
- **fonte_primaria_url:** https://www12.senado.leg.br/noticias/materias/2025/07/04/iof-proposta-de-conciliacao-do-stf-repercute-no-senado
- **archive_url:** `http://web.archive.org/web/20250705205343/https://www12.senado.leg.br/noticias/materias/2025/07/04/iof-proposta-de-conciliacao-do-stf-repercute-no-senado` ✅
- **texto_candidato:** ⚠️ VERIFICAR: _"Não cabe ao STF ajudar o governo em suas pautas insanas!"_ (trecho maior: _"Um único juiz (adivinha quem?) suspende decisão dos plenários da Câmara e do Senado tomadas por ampla maioria! [...] Não cabe ao STF ajudar o governo em suas pautas insanas!"_) — **difere da paráfrase original; usar a real**
- **contexto:** Após decisão monocrática do STF suspender o PDL que derrubou o aumento do IOF, Flávio Bolsonaro (PL-RJ) criticou a iniciativa em rede social, reproduzido pela Agência Senado.
- **motivo_inclusao:** `cascata-3: fonte institucional (Agência Senado) reproduzindo declaração do pré-candidato`
- [ ] **SIGN-OFF André** — decidir: fonte é o post original (rede_social_oficial) ou a matéria do Senado (senado)?

## 🟢 3. Flávio × Segurança — PRONTO

- **declaracao_id:** `2026-05-19-bolsonaro-flavio-seguranca-publica-neutralizar-faccoes`
- **candidato_id:** `01KSQDGYBJK8N8YJAWXHXSPA33` · **tema:** seguranca-publica · **tipo_estrutural:** `["compromisso_politico"]`
- **evento.titulo:** Marcha dos Prefeitos 2026
- **evento.data:** `2026-05-19T00:00:00Z` ⚠️ confirmar horário (data ✅ ≤ 28/05)
- **evento.tipo:** `comicio` · **fonte_primaria_tipo:** `midia_consolidada`
- **fonte_primaria_url:** https://www.infomoney.com.br/politica/flavio-promete-endurecer-combate-ao-crime-e-fala-em-neutralizar-faccoes/
- **archive_url:** `http://web.archive.org/web/20260520025254/https://www.infomoney.com.br/politica/flavio-promete-endurecer-combate-ao-crime-e-fala-em-neutralizar-faccoes/` ✅
- **texto_candidato:** ⚠️ VERIFICAR: _"Marginais de CV e de PCC, ouçam: metam o pé do Brasil até dezembro deste ano, porque se não, a partir do ano que vem, vai todo mundo ser preso ou vai ser neutralizado pelas nossas polícias."_
- **contexto:** Na Marcha dos Prefeitos, em 19/05/2026, Flávio Bolsonaro dirigiu-se a integrantes de facções (CV e PCC) ao prometer endurecer o combate ao crime organizado.
- **motivo_inclusao:** `cascata-4: fala de alta saliência em evento de grande audiência (Marcha dos Prefeitos)`
- [ ] **SIGN-OFF André** — ideal cruzar com vídeo timestamped da fala

## 🟢 4. Flávio × Meio Ambiente — PRONTO [tema escasso, mas lead válido]

- **declaracao_id:** `2026-04-22-bolsonaro-flavio-meio-ambiente-cop30-navios`
- **candidato_id:** `01KSQDGYBJK8N8YJAWXHXSPA33` · **tema:** meio-ambiente · **tipo_estrutural:** `["comparacao"]`
- **evento.titulo:** Flávio Bolsonaro critica gasto do governo com navios na COP30
- **evento.data:** `2026-04-22T00:00:00Z` ⚠️ confirmar horário
- **evento.tipo:** `post_rede_social` · **fonte_primaria_tipo:** `midia_consolidada`
- **fonte_primaria_url:** https://www.gazetadopovo.com.br/republica/flavio-e-nikolas-criticam-gasto-milionario-do-governo-lula-com-navios-na-cop30/
- **archive_url:** `http://web.archive.org/web/20260424070314/https://www.gazetadopovo.com.br/republica/flavio-e-nikolas-criticam-gasto-milionario-do-governo-lula-com-navios-na-cop30/` ✅
- **texto_candidato:** ⚠️ VERIFICAR: _"Com R$ 350 milhões dava pra construir 40 UPAs para atender até 450 pessoas por dia!"_ (autoria = Flávio/"o senador"; NÃO confundir com a fala de Nikolas)
- **contexto:** Em post nas redes sociais, Flávio Bolsonaro criticou o gasto do governo com locação de navios para a COP30, comparando o valor à construção de UPAs.
- **motivo_inclusao:** `cascata-1: tipo "comparacao" (cobertura estrutural) em tema de cobertura escassa`
- [ ] **SIGN-OFF André** — ideal localizar o post original em @flaviobolsonaro p/ elevar a fonte

---

## 🟡 5. Lula × Economia — TEXTO PENDENTE (você copia o verbatim)

- **declaracao_id:** `2025-11-30-lula-luiz-inacio-economia-isencao-ir`
- **candidato_id:** `01KSQDGYBHGRTNYGSMCMPAAKH4` · **tema:** economia · **tipo_estrutural:** `["dado_numerico"]`
- **evento.titulo:** Pronunciamento em cadeia nacional sobre isenção do Imposto de Renda
- **evento.data:** `2025-11-30T23:30:00.000Z` ⚠️ confirmar (30/11 ~20h30 BRT → ~23h30 UTC)
- **evento.tipo:** `declaracao_oficial` · **fonte_primaria_tipo:** `youtube_oficial` (confirmar canal "Governo do Brasil")
- **fonte_primaria_url:** https://www.youtube.com/watch?v=YSoq8dC_V1U
- **archive_url (gov.br):** `http://web.archive.org/web/20251202214810/https://www.gov.br/planalto/pt-br/acompanhe-o-planalto/noticias/2025/11/pronunciamento-do-presidente-lula-sobre-isencao-do-imposto-de-renda/` ✅ · **YouTube:** PENDENTE rodar `pnpm archive`
- **texto_candidato:** ⚠️ **PENDENTE** — gov.br tem CAPTCHA. Abra o vídeo (ou o snapshot gov.br) e copie o trecho dos "R$ 28 bilhões".
- **motivo_inclusao:** `cascata-3: fonte oficial com vídeo; dado numérico`
- [ ] **André: copiar texto verbatim** · [ ] **SIGN-OFF**

## 🟡 6. Lula × Saúde — TEXTO PENDENTE + ARCHIVE A GERAR

- **declaracao_id:** `2025-12-XX-lula-luiz-inacio-saude-entregas-recordes` ⚠️ ajustar dia
- **candidato_id:** `01KSQDGYBHGRTNYGSMCMPAAKH4` · **tema:** saude · **tipo_estrutural:** `["comparacao"]`
- **evento.titulo:** Anúncio de R$ 39 bilhões para educação, saúde e saneamento
- **evento.data:** `2025-12-XXT00:00:00Z` ⚠️ confirmar dia
- **evento.tipo:** `declaracao_oficial` · **fonte_primaria_tipo:** `midia_consolidada`
- **fonte_primaria_url:** https://www.gov.br/planalto/pt-br/acompanhe-o-planalto/noticias/2025/12/lula-anuncia-r-39-bilhoes-para-educacao-saude-e-saneamento-201cnunca-antes-um-governo-entregou-tanto201d
- **archive_url:** PENDENTE — rodar `pnpm archive <url>` (Wayback sem snapshot)
- **texto_candidato:** ⚠️ **PENDENTE** — gov.br CAPTCHA. Citação provável: _"Nunca antes um governo entregou tanto"_ — confirmar verbatim na fonte.
- **motivo_inclusao:** `cascata-1: tipo "comparacao" superlativa`
- [ ] **André: rodar archive + copiar texto** · [ ] **SIGN-OFF**

## 🟡 7. Lula × Educação — TEXTO PENDENTE + ARCHIVE A GERAR

- **declaracao_id:** `2026-03-XX-lula-luiz-inacio-educacao-elite-estudo` ⚠️ ajustar dia
- **candidato_id:** `01KSQDGYBHGRTNYGSMCMPAAKH4` · **tema:** educacao · **tipo_estrutural:** `["interpretacao_pessoal"]`
- **evento.titulo:** Evento dos 21 anos do Prouni e avanços da política de cotas
- **evento.data:** `2026-03-XXT00:00:00Z` ⚠️ confirmar dia
- **evento.tipo:** `declaracao_oficial` · **fonte_primaria_tipo:** `midia_consolidada`
- **fonte_primaria_url:** https://www.gov.br/planalto/pt-br/acompanhe-o-planalto/noticias/2026/03/presidente-lula-participa-de-evento-que-celebra-21-anos-do-programa-universidade-para-todos-e-avancos-da-politica-de-cotas
- **archive_url:** PENDENTE — rodar `pnpm archive <url>`
- **texto_candidato:** ⚠️ **PENDENTE** — gov.br CAPTCHA. Citação provável: _"A elite brasileira nunca quis que vocês estudassem"_ — confirmar verbatim.
- **motivo_inclusao:** `cascata-1: tipo "interpretacao_pessoal"`
- [ ] **André: rodar archive + copiar texto** · [ ] **SIGN-OFF**

## 🟡 8. Lula × Segurança — TEXTO PENDENTE (archive ✅)

- **declaracao_id:** `2026-05-12-lula-luiz-inacio-seguranca-publica-territorio-faccoes`
- **candidato_id:** `01KSQDGYBHGRTNYGSMCMPAAKH4` · **tema:** seguranca-publica · **tipo_estrutural:** `["promessa"]`
- **evento.titulo:** Lançamento do Programa Brasil Contra o Crime Organizado
- **evento.data:** `2026-05-12T00:00:00Z` ⚠️ confirmar horário
- **evento.tipo:** `declaracao_oficial` · **fonte_primaria_tipo:** `midia_consolidada`
- **fonte_primaria_url:** https://www.gov.br/planalto/pt-br/acompanhe-o-planalto/noticias/2026/05/programa-brasil-contra-o-crime-organizado-201cem-pouco-tempo-nao-serao-donos-de-nenhum-territorio201d-diz-lula
- **archive_url:** `http://web.archive.org/web/20260520193734/https://www.gov.br/planalto/pt-br/acompanhe-o-planalto/noticias/2026/05/programa-brasil-contra-o-crime-organizado-201cem-pouco-tempo-nao-serao-donos-de-nenhum-territorio201d-diz-lula` ✅
- **texto_candidato:** ⚠️ **PENDENTE** — gov.br CAPTCHA. Provável: _"Em pouco tempo, não serão donos de nenhum território"_ — confirmar verbatim.
- **motivo_inclusao:** `cascata-1: tipo "promessa"`
- [ ] **André: copiar texto** · [ ] **SIGN-OFF**

## 🟡 9. Lula × Política Externa — TEXTO A ESCOLHER (archive ✅)

- **declaracao_id:** `2025-07-10-lula-luiz-inacio-politica-externa-dolar-brics` ⚠️ confirmar data da fala
- **candidato_id:** `01KSQDGYBHGRTNYGSMCMPAAKH4` · **tema:** politica-externa · **tipo_estrutural:** `["interpretacao_pessoal"]`
- **evento.titulo:** Encerramento da Cúpula do BRICS no Rio de Janeiro
- **evento.data:** `2025-07-11T01:09:00Z` ⚠️ fonte data 10/07 22:09 (fuso a confirmar)
- **evento.tipo:** `entrevista` · **fonte_primaria_tipo:** `midia_consolidada`
- **fonte_primaria_url:** https://agenciabrasil.ebc.com.br/politica/noticia/2025-07/lula-diz-que-brics-seguira-discutindo-alternativas-ao-dolar
- **archive_url:** `http://web.archive.org/web/20251216063714/https://agenciabrasil.ebc.com.br/politica/noticia/2025-07/lula-diz-que-brics-seguira-discutindo-alternativas-ao-dolar` ✅
- **texto_candidato:** ⚠️ a frase "dólar é a moeda padrão" NÃO está verbatim nesta fonte. Presentes (verificar): _"Por que eu sou obrigado a ficar lastreado pelo dólar, que eu não controlo?"_ / _"Nós estamos discutindo, inclusive, a possibilidade de ter uma moeda própria..."_ — **você escolhe a citação real**
- **motivo_inclusao:** `cascata-1: tipo "interpretacao_pessoal"`
- [ ] **André: escolher/confirmar citação** · [ ] **SIGN-OFF**

---

## 🟠 10. Flávio × Política Externa — VERIFICAR FONTE

- **declaracao_id:** `2026-01-26-bolsonaro-flavio-politica-externa-acordos-isaac` ⚠️ confirmar
- **candidato_id:** `01KSQDGYBJK8N8YJAWXHXSPA33` · **tema:** politica-externa · **tipo_estrutural:** `["compromisso_politico"]`
- **evento.titulo:** Jantar com Netanyahu em Israel
- **evento.data:** `2026-01-26T00:00:00Z` ⚠️ confirmar
- **evento.tipo:** `declaracao_oficial` · **fonte_primaria_tipo:** `midia_consolidada`
- **fonte_primaria_url:** https://www.metropoles.com/mundo/a-promessa-de-flavio-bolsonaro-a-netanyahu-durante-jantar-em-israel
- **archive_url:** PENDENTE — rodar `pnpm archive <url>`
- **texto_candidato:** ⚠️ **PARAFRASEADO** — a fonte não traz citação direta entre aspas. ⚠️ **"Acordos de Isaac" pode ser confusão com "Acordos de Abraão" (Abraham Accords)** — confirmar o nome exato. Pode exigir outra fonte com fala direta.
- **motivo_inclusao:** `cascata-1: tipo "compromisso_politico"`
- [ ] **André: verificar citação/nome + rodar archive** · [ ] **SIGN-OFF**

---

## 🔴 11. Flávio × Educação — LACUNA

- **Situação:** o lead (pronunciamento Senado 03/12/2025) é sobre **STF/Lei 1079**, **não educação**. Nenhuma fala de Flávio sobre educação foi localizada **dentro da janela** (material temático dele é de 2024, fora).
- **Decisão necessária (André):** (a) buscar outro lead de educação na janela; (b) aceitar fonte N2 fraca; ou (c) **reduzir quota** nesse par e registrar no relatório (Task 9) como déficit estrutural — opção explícita do spec §4.3/§6.3.
- [ ] **André: decidir A/B/C**

## 🔴 12. Flávio × Saúde — LACUNA

- **Situação:** só há reportagem de coluna (CNN/Gustavo Uribe) parafraseando o "Plano Real da Saúde" conduzido por Queiroga — **sem fala direta de 1ª pessoa de Flávio**. Os únicos vereditos (Lupa/Aos Fatos) são sobre um **boato desmentido** (privatizar o SUS), não fala dele.
- **Decisão necessária (André):** (a) achar fala própria de Flávio sobre saúde na janela; (b) registrar a checagem do boato como `atribuicao_a_terceiro` (caso editorial delicado); ou (c) **reduzir quota** + nota no relatório.
- [ ] **André: decidir A/B/C**

---

## Próximo passo

1. Você trabalha este worksheet (verifica os 🟢 + copia verbatim dos 🟡 + decide 🟠/🔴).
2. Me devolve os textos confirmados (ou edita este arquivo direto).
3. Eu gero `data/eventos/*.yaml` + `data/declaracoes/*.md` + `log-editorial.csv`, rodo `validate-data && validate:log && audit:paridade`, e abro o PR.

**As 2 lacunas (🔴) confirmam empiricamente o Risco F4-5 do spec** — entram no relatório de aprendizados (Task 9) independentemente da decisão.
