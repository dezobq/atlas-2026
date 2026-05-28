# Dossiê de Curadoria — Piloto Sprint 5.2 (12 declarações)

> **Gerado por pesquisa web em 2026-05-28** (Claude + 11 agentes de pesquisa paralelos). Cada item é um **lead a verificar** — NÃO é conteúdo publicável. Datas marcadas "verificar" vieram de snippets/slugs, não da fonte primária aberta. Aplica o Step 1 do Apêndice A do plan `2026-05-28-atlas-fase4-sprint5-2-piloto.md` para os 12 pares (tema × candidato).
>
> **Como usar:** este é o insumo do **Step 2** (André valida + aplica cascata §4.4). Para cada par, escolha 1 declaração, depois siga o Apêndice A (Steps 3–12) com suas credenciais.
>
> - Lula: `candidato_id: 01KSQDGYBHGRTNYGSMCMPAAKH4` · slug `lula-luiz-inacio`
> - Flávio: `candidato_id: 01KSQDGYBJK8N8YJAWXHXSPA33` · slug `bolsonaro-flavio`
> - Janela: **[2025-05-16, 2026-05-16]**

---

## ⚠️ Descoberta crítica do piloto (decisão do André necessária)

A pesquisa confirmou empiricamente o **Risco F4-5** (quota inviável) do spec §6.3. Há **assimetria estrutural de cobertura** entre os dois candidatos:

| Par (Flávio)              | Situação                                                                                                                | Implicação                                   |
| ------------------------- | ----------------------------------------------------------------------------------------------------------------------- | -------------------------------------------- |
| Flávio × Saúde            | **Escassa.** ~2 falas próprias; o resto é boato desmentido (Lupa/Aos Fatos) ou plano conduzido por terceiro (Queiroga)  | Difícil 1 declaração própria com fonte forte |
| Flávio × Educação         | **Escassa.** Só 3 pronunciamentos no Senado (conteúdo educacional a confirmar); material temático é pré-janela (2024)   | Idem                                         |
| Flávio × Meio Ambiente    | **Escassa.** 4 leads, ~2–3 eventos distintos, todos N2                                                                  | Idem                                         |
| Flávio × Segurança        | ✅ **Resolvido pela extensão da janela:** Marcha 19/05/2026, Trump 26/05/2026 agora in-window. Material denso e diverso | OK — sem lacuna                              |
| Flávio × Política Externa | ✅ **Resolvido:** Washington 26–27/05/2026 agora in-window + Israel jan/2026 + Magnitsky dez/2025                       | OK — farto                                   |

Lula tem cobertura farta e in-window nos 6 temas. **A quota "1 por tema × candidato" do piloto é viável para Lula, tensionada para Flávio.**

**Nenhum dos 12 leads tem veredito de fact-checker reconhecido sobre a fala específica** (cascata-2 não desempata em nenhum par). O único veredito Flávio×Saúde é sobre um _boato desmentido_, não uma fala dele — registrável como `atribuicao_a_terceiro`, mas é caso editorial delicado.

### ✅ Decisão tomada (2026-05-28): janela estendida para [2025-05-16, 2026-05-28]

André autorizou estender o fim da janela para a data da curadoria, documentado como **Errata** em `/metodologia`, no spec §4.2 e no enforcement `audit-paridade.ts`. A `data_corte` da seleção de candidatos (16/05/2026) permanece locked.

**Efeito:** Flávio × Segurança e Flávio × Política Externa passam a ter material denso in-window. **Lacuna residual** (coberta pela extensão? Não — é escassez real de cobertura, não de janela): **Flávio × Saúde, Educação, Meio Ambiente** seguem rasos. Para esses 3, a opção pragmática é aceitar fonte **N2** (mídia consolidada) e registrar no relatório de aprendizados (Task 9) — sem inventar nem inflar quota.

---

## LULA

### Lula × Economia — recomendado: pronunciamento isenção do IR (30/11/2025)

| #    | data       | trecho/título                                                              | URL                                                                                                                                                                                                                                          | tipo                  | fonte                          | janela | veredito |
| ---- | ---------- | -------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------- | ------------------------------ | ------ | -------- |
| 1 ⭐ | 2025-11-30 | "...deve injetar R$ 28 bilhões na economia" (isenção do IR)                | https://www.youtube.com/watch?v=YSoq8dC_V1U (Governo do Brasil — confirmar canal) · transcrição: https://www.gov.br/planalto/pt-br/acompanhe-o-planalto/noticias/2025/11/pronunciamento-do-presidente-lula-sobre-isencao-do-imposto-de-renda | dado_numerico         | youtube_oficial/N1 (confirmar) | ✅     | não      |
| 2    | 2025-07-01 | "Não me conformo com taxa de juros a 15%" (Plano Safra)                    | https://www.cnnbrasil.com.br/economia/macroeconomia/nao-me-conformo-com-taxa-de-juros-a-15-diz-lula/                                                                                                                                         | interpretacao_pessoal | midia_consolidada/N2           | ✅     | não      |
| 3    | ~2026-03   | "Esperava que o BC baixasse os juros em pelo menos 0,5%... só baixou 0,25" | https://agenciabrasil.ebc.com.br/economia/noticia/2026-03/lula-questiona-bc-sobre-corte-da-selic-esperava-pelo-menos-05                                                                                                                      | interpretacao_pessoal | N1/N2                          | ✅     | não      |
| 4    | ~2026-01   | "Temos a obrigação de brigar para que ele melhore" (salário mínimo)        | https://www.gov.br/planalto/pt-br/acompanhe-o-planalto/noticias/2026/01/201ctemos-a-obrigacao-de-brigar-para-que-ele-melhore201d-diz-lula-sobre-o-salario-minimo                                                                             | compromisso_politico  | diario_oficial/N1              | ✅     | não      |

### Lula × Saúde — recomendado: R$ 39 bi + "Nunca antes um governo entregou tanto" (dez/2025)

| #    | data        | trecho/título                                                                | URL                                                                                                                                                                                                                        | tipo                 | fonte                | janela | veredito |
| ---- | ----------- | ---------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------- | -------------------- | ------ | -------- |
| 1 ⭐ | 2025-12     | "Nunca antes um governo entregou tanto" (R$ 39 bi educação/saúde/saneamento) | https://www.gov.br/planalto/pt-br/acompanhe-o-planalto/noticias/2025/12/lula-anuncia-r-39-bilhoes-para-educacao-saude-e-saneamento-201cnunca-antes-um-governo-entregou-tanto201d                                           | comparacao           | gov.br/N1            | ✅     | não      |
| 2    | 2026-02     | "mais de 14 milhões de cirurgias pelo SUS em 2025" (Bahia)                   | https://www.gov.br/planalto/pt-br/acompanhe-o-planalto/noticias/2026/02/lula-destaca-entregas-de-saude-na-bahia-revela-que-pais-fez-mais-de-14-milhoes-de-cirurgias-pelo-sus-em-2025-e-defende-reestruturacao-da-seguranca | dado_numerico        | gov.br/N1            | ✅     | não      |
| 3    | ~2025-09    | Mutirão Nacional Redução das Filas do SUS (pronunciamento)                   | https://www.gov.br/planalto/pt-br/acompanhe-o-planalto/discursos-e-pronunciamentos/2025/09/pronunciamento-do-presidente-lula-durante-o-mutirao-nacional-para-reducao-das-filas-do-sus                                      | compromisso_politico | diario_oficial/N1    | ✅     | não      |
| 4    | ~2025-10-08 | Sanção da Lei 15.233/2025 "Agora Tem Especialistas"                          | https://www.poder360.com.br/poder-saude/lula-sanciona-agora-tem-especialistas-para-reduzir-filas-do-sus/                                                                                                                   | compromisso_politico | midia_consolidada/N2 | ✅     | não      |

### Lula × Educação — recomendado: "A elite brasileira nunca quis que vocês estudassem" (mar/2026)

| #    | data       | trecho/título                                                         | URL                                                                                                                                                                                                | tipo                  | fonte                                     | janela | veredito |
| ---- | ---------- | --------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------- | ----------------------------------------- | ------ | -------- |
| 1 ⭐ | 2026-03    | "A elite brasileira nunca quis que vocês estudassem" (21 anos Prouni) | https://www.gov.br/planalto/pt-br/acompanhe-o-planalto/noticias/2026/03/presidente-lula-participa-de-evento-que-celebra-21-anos-do-programa-universidade-para-todos-e-avancos-da-politica-de-cotas | interpretacao_pessoal | diario_oficial/N1 (vídeo via Agência Gov) | ✅     | não      |
| 2    | 2025-10    | "quer alcançar pelo menos 6 milhões de estudantes" (Pé-de-Meia)       | https://agenciabrasil.ebc.com.br/educacao/noticia/2025-10/lula-defende-universalizacao-do-pe-de-meia                                                                                               | compromisso_politico  | midia_consolidada/N2                      | ✅     | não      |
| 3    | 2026-03    | "Brasil atinge meta: 66% das crianças alfabetizadas na idade certa"   | https://agenciabrasil.ebc.com.br/educacao/noticia/2026-03/brasil-atinge-meta-com-66-das-criancas-alfabetizadas-em-idade-certa                                                                      | dado_numerico         | midia_consolidada/N2                      | ✅     | não      |
| 4    | 2025-10-31 | Sanção da lei do Sistema Nacional de Educação                         | https://agenciabrasil.ebc.com.br/educacao/noticia/2025-10/lula-sanciona-lei-que-cria-o-sistema-nacional-de-educacao                                                                                | compromisso_politico  | midia_consolidada/N2                      | ✅     | não      |

> Nota: o vídeo do canal @LulaOficial não apareceu nas buscas; fontes com vídeo são da Agência Gov (EBC). Item icônico "Pé-de-Meia é uma revolução" (20/02/2025) está **fora da janela**.

### Lula × Segurança — recomendado: lançamento Programa Brasil Contra o Crime Organizado (12/05/2026)

| #    | data       | trecho/título                                                                   | URL                                                                                                                                                                                    | tipo                 | fonte                | janela      | veredito |
| ---- | ---------- | ------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------- | -------------------- | ----------- | -------- |
| 1 ⭐ | 2026-05-12 | "Em pouco tempo, não serão donos de nenhum território" (lançamento do programa) | https://www.gov.br/planalto/pt-br/acompanhe-o-planalto/noticias/2026/05/programa-brasil-contra-o-crime-organizado-201cem-pouco-tempo-nao-serao-donos-de-nenhum-territorio201d-diz-lula | promessa             | diario_oficial/N1    | ✅ (limite) | não      |
| 2    | 2026-05-12 | Programa de R$ 11 bilhões (R$ 1 bi União + R$ 10 bi estados/municípios)         | https://agenciabrasil.ebc.com.br/politica/noticia/2026-05/governo-lanca-programa-de-r-11-bilhoes-contra-o-crime-organizado                                                             | dado_numerico        | midia_consolidada/N2 | ✅          | não      |
| 3    | 2025-11    | Lula trata projetos prioritários de Segurança Pública (PL Antifacção)           | https://www.gov.br/planalto/pt-br/acompanhe-o-planalto/noticias/2025/11/lula-trata-com-ministros-projetos-prioritarios-de-seguranca-publica-para-o-governo                             | compromisso_politico | diario_oficial/N1    | ✅          | não      |

> ✅ Itens "PEC da Segurança / governadores reféns / Ministério em 15 dias" (2026-05-22) agora **in-window** com a janela estendida — material adicional disponível se preferir a #1 atual.

### Lula × Meio Ambiente — recomendado: aporte US$ 1 bi no TFFF (COP30, nov/2025)

| #    | data       | trecho/título                                                            | URL                                                                                                                                         | tipo                 | fonte                        | janela | veredito |
| ---- | ---------- | ------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------- | -------------------- | ---------------------------- | ------ | -------- |
| 1 ⭐ | 2025-11-06 | "US$ 1 bilhão no TFFF; Brasil liderará pelo exemplo"                     | https://cop30.br/en/news-about-cop30/lula-announces-1-billion-contribution-to-the-tropical-forests-forever-fund-brazil-will-lead-by-example | compromisso_politico | N1/N2 (portal oficial COP30) | ✅     | não      |
| 2    | 2025-11    | Íntegra discurso abertura COP30: "tragédia do presente", roadmap fósseis | https://agenciabrasil.ebc.com.br/meio-ambiente/noticia/2025-11/confira-integra-do-discurso-de-lula-na-abertura-da-cop30-em-belem            | compromisso_politico | midia_consolidada/N2         | ✅     | não      |
| 3    | 2025-11    | "Extrair petróleo na Foz do Amazonas vai requerer novo aval"             | https://agenciabrasil.ebc.com.br/meio-ambiente/noticia/2025-11/extrair-petroleo-na-foz-do-amazonas-vai-requerer-novo-aval-diz-lula          | compromisso_politico | midia_consolidada/N2         | ✅     | não      |
| 4    | 2025-10    | "Desmatamento -11,08% na Amazônia e -11,49% no Cerrado em 2025"          | https://agenciagov.ebc.com.br/noticias/202510/em-2025-desmatamento-tem-reducao-de-11-08-na-amazonia-e-11-49-no-cerrado                      | dado_numerico        | midia_consolidada/N2         | ✅     | não      |

### Lula × Política Externa — recomendado: discurso AGNU (set/2025) ou Mercosul-UE

| #    | data       | trecho/título                                                          | URL                                                                                                                              | tipo                  | fonte                            | janela | veredito |
| ---- | ---------- | ---------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------- | --------------------- | -------------------------------- | ------ | -------- |
| 1 ⭐ | 2025-09    | Discurso abertura AGNU: "mundo em desordem", crise do multilateralismo | https://news.un.org/pt/story/2025/09/1851067 (localizar vídeo UN WebTV/Planalto p/ trecho exato)                                 | interpretacao_pessoal | midia_consolidada/N2 (vídeo ONU) | ✅     | não      |
| 2    | 2025-07-07 | "Ninguém determinou que o dólar é a moeda padrão" (BRICS Rio)          | https://agenciabrasil.ebc.com.br/politica/noticia/2025-07/lula-diz-que-brics-seguira-discutindo-alternativas-ao-dolar            | interpretacao_pessoal | midia_consolidada/N2             | ✅     | não      |
| 3    | 2025-11    | "Acordo Mercosul-UE será assinado em 20 de dezembro"                   | https://agenciabrasil.ebc.com.br/internacional/noticia/2025-11/acordo-mercosul-ue-sera-assinado-em-20-de-dezembro-diz-lula       | promessa              | midia_consolidada/N2             | ✅     | não      |
| 4    | 2025-09    | Após Zelensky: "não há saída militar para a guerra"                    | https://agenciabrasil.ebc.com.br/internacional/noticia/2025-09/lula-encontra-zelensky-e-diz-que-nao-ha-saida-militar-para-guerra | interpretacao_pessoal | midia_consolidada/N2             | ✅     | não      |

---

## FLÁVIO BOLSONARO

### Flávio × Economia — recomendado: crítica ao STF sobre IOF (04/07/2025)

| #    | data       | trecho/título                                                                      | URL                                                                                                                                             | tipo                  | fonte                | janela         | veredito |
| ---- | ---------- | ---------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------- | --------------------- | -------------------- | -------------- | -------- |
| 1 ⭐ | 2025-07-04 | "não cabe ao STF ajudar o governo federal na questão do aumento de impostos" (IOF) | https://www12.senado.leg.br/noticias/materias/2025/07/04/iof-proposta-de-conciliacao-do-stf-repercute-no-senado                                 | atribuicao_a_terceiro | senado/N1            | ✅             | não      |
| 2    | ~2026      | "Tesouraço": corte de impostos/gasto/burocracia p/ juros mais baixos               | https://www.gazetadopovo.com.br/eleicoes/2026/flavio-bolsonaro-tesouraco-gastos-impostos/                                                       | compromisso_politico  | midia_consolidada/N2 | ✅ (verificar) | não      |
| 3    | ~2026-04   | Reajustar gastos sociais só pela inflação + privatizar Correios                    | https://www.correiobraziliense.com.br/politica/2026/04/7403233-flavio-avalia-reajuste-de-gastos-sociais-pela-inflacao-e-mais-privatizacoes.html | promessa              | midia_consolidada/N2 | ✅ (verificar) | não      |

### Flávio × Saúde — ESCASSA (decisão A–D necessária)

| #   | data       | trecho/título                                                        | URL                                                                                                                      | tipo                  | fonte                | janela | veredito              |
| --- | ---------- | -------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------ | --------------------- | -------------------- | ------ | --------------------- |
| 1   | 2026-04-15 | Lupa: "Flávio NÃO disse que vai privatizar o SUS" (boato desmentido) | https://www.agencialupa.org/noticias/2026/04/15/flavio-bolsonaro-nao-disse-que-vai-privatizar-o-sus-se-for-eleito        | atribuicao_a_terceiro | midia_consolidada/N2 | ✅     | ✅ Lupa (sobre boato) |
| 2   | 2026-04    | Aos Fatos: idem (boato desmentido)                                   | https://www.aosfatos.org/noticias/falso-flavio-bolsonaro-disse-privatizar-sus-se-eleito-presidente/                      | atribuicao_a_terceiro | midia_consolidada/N2 | ✅     | ✅ Aos Fatos          |
| 3   | ~2026      | "Plano Real da Saúde" (proposta via equipe; Queiroga conduz)         | https://www.cnnbrasil.com.br/blogs/gustavo-uribe/eleicoes/flavio-deve-propor-plano-real-da-saude-em-programa-de-governo/ | compromisso_politico  | midia_consolidada/N2 | ✅     | não                   |

> ⚠️ Quase nenhuma fala própria de 1ª pessoa sobre saúde com fonte primária. Os únicos vereditos são sobre boato. Decisão editorial necessária.

### Flávio × Educação — ESCASSA (decisão A–D necessária)

| #   | data       | trecho/título                                          | URL                                                                                 | tipo        | fonte     | janela | veredito |
| --- | ---------- | ------------------------------------------------------ | ----------------------------------------------------------------------------------- | ----------- | --------- | ------ | -------- |
| 1   | 2025-12-03 | Pronunciamento Senado (confirmar se trata de educação) | https://www25.senado.leg.br/web/atividade/pronunciamentos/-/p/pronunciamento/518947 | a verificar | senado/N1 | ✅     | não      |
| 2   | 2025-10-07 | Pronunciamento Senado (tema a confirmar)               | https://www25.senado.leg.br/web/atividade/pronunciamentos/-/p/pronunciamento/517369 | a verificar | senado/N1 | ✅     | não      |
| 3   | 2025-06-25 | Pronunciamento Senado (tema a confirmar)               | https://www25.senado.leg.br/web/atividade/pronunciamentos/-/p/pronunciamento/514523 | a verificar | senado/N1 | ✅     | não      |

> ⚠️ Material temático de educação de Flávio é majoritariamente pré-janela (2024). Confirmar conteúdo dos pronunciamentos no texto taquigráfico do Senado.

### Flávio × Segurança — recomendado: "neutralizar facções" (Marcha dos Prefeitos, 19/05/2026)

| #    | data       | trecho/título                                                                                                                | URL                                                                                                                                                                          | tipo                  | fonte                                                                 | janela                | veredito |
| ---- | ---------- | ---------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------- | --------------------------------------------------------------------- | --------------------- | -------- |
| 1 ⭐ | 2026-05-19 | "Marginais de CV e de PCC, ouçam: ... vai todo mundo ser preso ou neutralizado pelas nossas polícias" (Marcha dos Prefeitos) | https://www.infomoney.com.br/politica/flavio-promete-endurecer-combate-ao-crime-e-fala-em-neutralizar-faccoes/                                                               | compromisso_politico  | midia_consolidada/N2 (buscar post oficial @flaviobolsonaro p/ elevar) | ✅ (janela estendida) | não      |
| 2    | 2026-05-26 | Pediu a Trump que EUA classifiquem PCC e Comando Vermelho como organizações terroristas                                      | https://www.cnnbrasil.com.br/politica/flavio-diz-que-pediu-que-trump-classifique-pcc-e-cv-como-grupos-terroristas/                                                           | compromisso_politico  | midia_consolidada/N2                                                  | ✅ (janela estendida) | não      |
| 3    | ~2025-07   | Relatório CSP: legítima defesa policial / "atiram para matar... policial não pode ser injustamente punido"                   | https://ndmais.com.br/politica/matar-bandido-em-legitima-defesa-pode-ganhar-novas-hipoteses/ (cruzar c/ https://www25.senado.leg.br/web/atividade/materias/-/materia/138227) | interpretacao_pessoal | midia_consolidada/N2 + senado/N1                                      | ✅                    | não      |
| 4    | 2026-05-19 | Ministério da Segurança com orçamento próprio, monitoramento em tempo real e IA p/ veículos roubados                         | https://www.cnnbrasil.com.br/politica/flavio-diz-que-pediu-que-trump-classifique-pcc-e-cv-como-grupos-terroristas/ (confirmar fonte primária do trecho)                      | promessa              | midia_consolidada/N2                                                  | ✅ (janela estendida) | não      |

> ✅ Tema de cobertura **forte** para Flávio. O item #3 (CSP legítima defesa) é a alternativa com lastro N1 no Senado, se preferir fonte primária a saliência midiática.

### Flávio × Meio Ambiente — ESCASSA (decisão A–D necessária)

| #    | data     | trecho/título                                                       | URL                                                                                                                             | tipo                  | fonte                | janela         | veredito                           |
| ---- | -------- | ------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------- | --------------------- | -------------------- | -------------- | ---------------------------------- |
| 1 ⭐ | ~2026-04 | "Com R$ 350 mi dava pra construir 40 UPAs" (crítica a navios COP30) | https://www.gazetadopovo.com.br/republica/flavio-e-nikolas-criticam-gasto-milionario-do-governo-lula-com-navios-na-cop30/       | comparacao            | midia_consolidada/N2 | ✅ (verificar) | TCU validou contratação (contexto) |
| 2    | ~2026-02 | "Margem Equatorial travada por visão ideológica no licenciamento"   | https://www.gazetadopovo.com.br/eleicoes/2026/em-nova-entrevista-flavio-bolsonaro-aposta-em-discurso-duro-na-seguranca-publica/ | interpretacao_pessoal | midia_consolidada/N2 | ✅             | não                                |
| 3    | ~2026-02 | "Petrobras deve ser mantida sob controle estatal"                   | https://www.brasil247.com/brasil/flavio-bolsonaro-diz-que-petrobras-deve-ser-mantida-sob-controle-estatal                       | compromisso_politico  | midia_consolidada/N2 | ✅             | não                                |

> ⚠️ 4 leads, ~2–3 eventos distintos, todos N2. Sem discurso de plenário ambiental in-window.

### Flávio × Política Externa — recomendado: Acordos de Isaac / Israel (jan/2026)

| #    | data       | trecho/título                                                                                                                                                                   | URL                                                                                                                                                                                     | tipo                  | fonte                | janela                | veredito |
| ---- | ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------- | -------------------- | --------------------- | -------- |
| 1 ⭐ | ~2026-01   | "Se depender de mim, o Brasil assinará os Acordos de Isaac em janeiro de 2027"                                                                                                  | https://www.metropoles.com/mundo/a-promessa-de-flavio-bolsonaro-a-netanyahu-durante-jantar-em-israel                                                                                    | compromisso_politico  | midia_consolidada/N2 | ✅                    | não      |
| 2    | ~2026-01   | Promessa de retomar integralmente relações comerciais com Israel a partir de 2027                                                                                               | https://www.gazetadopovo.com.br/eleicoes/2026/flavio-bolsonaro-promete-retomar-relacoes-comerciais-com-israel/                                                                          | promessa              | midia_consolidada/N2 | ✅                    | não      |
| 3    | 2025-12-12 | Associou recuo dos EUA sobre Moraes (Magnitsky) ao avanço da anistia                                                                                                            | https://www.congressoemfoco.com.br/noticia/114855/flavio-associa-recuo-dos-eua-sobre-moraes-a-avanco-da-anistia                                                                         | interpretacao_pessoal | midia_consolidada/N2 | ✅                    | não      |
| 4    | 2026-05-26 | Após encontro com Trump na Casa Branca: acordo comercial "na escala dos maiores acordos da história recente"; sob seu governo "não haveria necessidade de retaliação ao Brasil" | confirmar fonte primária — cruzar https://www.cartacapital.com.br/politica/flavio-bolsonaro-vai-a-casa-branca-e-publica-foto-ao-lado-de-trump/ (evitar veículos de baixa credibilidade) | promessa              | midia_consolidada/N2 | ✅ (janela estendida) | não      |

> ✅ Tema **farto** com a janela estendida. Verificar data exata da viagem (26–27/05) ≤ 28/05.

---

## Próximos passos (Apêndice A, Steps 3–12, por declaração)

1. André decide A–D para os 3 pares escassos do Flávio.
2. Para cada par, cravar 1 lead (⭐ = recomendação da cascata).
3. Confirmar canal/URL canônica (abre o vídeo/fonte → define `fonte_primaria_tipo`).
4. Rodar pipeline com credenciais (`scrape:youtube`/`scrape:url` + `archive`); revisar transcrição palavra-por-palavra; anotar timestamp.
5. Claude gera `data/eventos/<ULID>.yaml` + `data/declaracoes/<id>.md` + linha do `log-editorial.csv` (formato UTC `Z`).
6. `pnpm validate-data && pnpm validate:log` → exit 0.
