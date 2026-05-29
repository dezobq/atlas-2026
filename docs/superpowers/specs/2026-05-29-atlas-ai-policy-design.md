---
título: "Atlas dos Candidatos · 2026 — Nova AI Policy: O Processo é a Autoridade"
versão: "0.1 (rascunho de brainstorming)"
status: "design em brainstorming · PENDENTE revisão do curador + parecer jurídico eleitoral"
autor: "André Queiroz (curador) + Claude (rascunho)"
data_criação: "2026-05-29"
spec_pai: "docs/superpowers/specs/2026-05-27-atlas-design.md"
supersede: "spec mestre §7.1 ('AI não gera conteúdo') + spec Fase 4 §5.1–5.4"
licença_conteúdo: "CC-BY 4.0"
licença_código: "MIT"
---

# Atlas — Nova AI Policy: "O Processo é a Autoridade"

> **Escopo:** redefine como a IA participa do Atlas. **Inverte** o princípio fundador §7.1 do spec mestre ("AI não gera conteúdo") e **reescreve** a seção 5 (workflow operacional / AI policy) da Fase 4. Mantém intactos: postura editorial neutra, paridade rígida, e — crucialmente — a regra de **nunca emitir juízo próprio de veracidade** ([[Sem-Veredito-Proprio]]).
>
> ⚠️ **Este design não vai a produção sem parecer jurídico eleitoral** (ver §6). Desenhar é livre; publicar exige o gate.

---

## 1. TL;DR

A política antiga protegia credibilidade **proibindo** a IA de gerar conteúdo. A nova política protege credibilidade **tornando todo output da IA rastreável, verificável e repetível** — sob um método público que qualquer terceiro reproduz.

A autoridade migra de _"confie no curador"_ para **_"não confie — reproduza"_**. Essa é a forma como a ciência confere credibilidade, e é o que torna o Atlas valioso para mídia, academia e LLMs sem virar "slop de IA com verniz de autoridade".

Motivação (todas validadas pelo curador): **escala / anti-burnout**, **valor para academia+LLMs**, **confiabilidade via verificação**, e **visão agent-native** (humano governa o sistema; o sistema opera).

---

## 2. Princípio reitor e a linha vermelha

### 2.1 Princípio reitor (substitui §7.1 do spec mestre)

> **A IA pode operar qualquer etapa do pipeline. A credibilidade do Atlas não vem de restringir a IA — vem de um método público sob o qual todo dado publicado é rastreável, verificável e repetível. O processo é a autoridade.**

### 2.2 A linha vermelha — O Método (inegociável, igual para humano e IA)

Todo dado publicado é, **simultaneamente**:

| Propriedade     | Significado operacional                                                                                                            | Gate (falha → não publica)        |
| --------------- | ---------------------------------------------------------------------------------------------------------------------------------- | --------------------------------- |
| **Rastreável**  | liga a uma fonte primária **e** à sua origem de produção (quem/qual modelo gerou)                                                  | proveniência ausente/inválida     |
| **Verificável** | pode ser conferido contra a fonte por terceiros; no pipeline, passa por **verificação adversarial independente** antes de publicar | verificação não atingiu quórum    |
| **Repetível**   | produzido por método determinístico e re-executável (def. operacional em §4.3)                                                     | método não reproduz a propriedade |
| **Documentado** | o método que o gerou é público e versionado                                                                                        | método não registrado             |

**Confiável é a consequência, não um quinto requisito.** Um dado que satisfaz as quatro _é_ confiável por construção.

### 2.3 Fronteira síntese / juízo (mantém [[Sem-Veredito-Proprio]])

| Operação                                                                                    | Permitido? | Razão                                                                                |
| ------------------------------------------------------------------------------------------- | ---------- | ------------------------------------------------------------------------------------ |
| **Síntese com proveniência** — "3 fontes Tier-1 afirmam X; 2 divergem; eis links e números" | ✅ Sim     | meta-análise rastreável; continua _catálogo_                                         |
| **Juízo próprio de veracidade** — "esta declaração é falsa"                                 | ❌ Não     | vira _editora_: risco jurídico, perde proteção de catálogo, vira alvo de polarização |

A IA **organiza e contrasta** o que as fontes dizem; o Atlas **nunca** declara quem está certo.

---

## 3. As três camadas de confiança

Aplicação do Método campo a campo no schema de declaração, por nível de intervenção da IA. As camadas tornam a fronteira "fato vs. derivado" **física**, não apenas uma promessa.

### Camada 0 · Factual — _o que foi dito + de onde_

- **Campos:** `texto` (citação verbatim), `fonte_primaria_url`/`tipo`, `archive_url`, `timestamp_no_evento`, `candidato_id`, `evento_id`.
- **Regra:** nada é redigido ou opinado. Extração **verbatim** + metadados de fonte. A IA pode _transcrever_ (Whisper); **nunca parafraseia** a citação.
- **Fidelidade (decisão):** **híbrido por confiança** — verificação adversarial automatizada por padrão (N verificadores independentes conferem o trecho contra a fonte; só passa com convergência); **humano entra como exceção** acionada por divergência ou baixa confiança.

### Camada 1 · Derivada — _a organização do fato_

- **Campos:** `contexto`, `tipo_estrutural`, `tema_principal`, `temas_secundarios`, `slug`, e novos campos de resumo/paráfrase **rotulada**.
- **Regra:** **a IA redige e classifica** (é aqui que "IA redige texto" vive). Cada item **ancorado** a um trecho de C0. Conteúdo sintético → rotulado (§5.3, §6).
- **Gate:** verificação adversarial confirma classificação correta, fidelidade ao C0 e **ausência de descontextualização** (exigência da norma — §6).

### Camada 2 · Analítica — _as relações entre fatos_

- **Campos:** `vereditos_externos` (agrega fact-checkers), `contexto_adicional`, e novos campos de **síntese cross-declaração**.
- **Regra:** síntese com proveniência, **sem juízo próprio**. É uma _função reproduzível_ de C0+C1+fontes externas.
- **Gate:** cada afirmação sintética liga às C0/C1 que a sustentam; verificação confirma que a síntese **não extrapola** as fontes.

---

## 4. Proveniência e _method-as-code_

### 4.1 Bloco de proveniência por declaração (nível declaração, não por-campo — YAGNI)

```yaml
proveniencia:
  metodo: "atlas-pipeline@1.4.0" # workflow versionado que produziu
  fonte_ancora: "youtube:UCxxxx@00:14:32" # C0: de onde saiu
  camadas:
    C0_texto: { origem: "whisper-large-v3", verificacao: "adversarial-3/3", confianca: 0.98 }
    C1_contexto: { origem: "claude-opus-4-8", ancora: "C0_texto", verificacao: "adversarial-2/3" }
    C2_sintese:
      {
        origem: "claude-opus-4-8",
        ancora: ["C0", "fontes_externas"],
        verificacao: "adversarial-3/3",
      }
  humano_revisou: ["C0_texto"] # exceção acionada (baixa confiança)
  gerado_em: "2026-05-29T..."
```

### 4.2 _Method-as-code_ faseado

- **Fase 1 (agora):** todo workflow/agente que produz dado é **versionado em git**; a proveniência aponta para `metodo@versão`.
- **Fase 2:** pipeline re-executável — dadas as fontes em `.cache/`, re-rodar regenera as camadas derivadas.
- **Fase 3 (ambição):** _reproduction kit_ publicado **junto ao dataset** (fontes + workflows + instruções). "Não confie, clone e rode."

### 4.3 Definição operacional de "repetível" — **convergência verificável**

LLM não é determinístico bit-a-bit. Portanto **repetível ≠ texto idêntico**. Repetível significa: **re-executar o método produz output que passa os mesmos gates** (ancorado + verificação adversarial converge). A propriedade é reproduzível; o byte não. Os artefatos versionados em git/`.cache` são o **registro** que torna a auditoria possível.

---

## 5. Governança humana e salvaguardas

### 5.1 De _verificador_ a _governador_ (reescreve RACI da Fase 4 §5.2)

O humano deixa de **verificar cada item** e passa a **governar o sistema que verifica cada item**.

| Papel humano                       | O quê                                                                                                                     | Obrigatório?                        |
| ---------------------------------- | ------------------------------------------------------------------------------------------------------------------------- | ----------------------------------- |
| **Governador do método**           | aprova mudanças em pipeline, prompts, critérios, modelos pinados; cada versão do método é assinada antes de produzir dado | ✅ **sim**                          |
| **Decisor de exceções**            | toca itens que os gates sinalizam (baixa confiança / divergência)                                                         | ✅ sim (quando acionado)            |
| **Auditor de amostra**             | confere amostra aleatória contínua; calibra os gates                                                                      | ✅ sim                              |
| Decisão de inclusão item-a-item    | —                                                                                                                         | ❌ **não** (ver §5.2)               |
| Sign-off de síntese C2 item-a-item | —                                                                                                                         | ❌ não (coberto por gate + amostra) |

### 5.2 Inclusão automatizada sob cascata determinística (mitiga F4-1)

A decisão de _quais_ declarações entram é **automatizada**, porém **somente** como aplicação mecânica da cascata de saliência (Fase 4 §4.4): determinística, pública, reproduzível (re-rodar → mesma seleção). **Empates/ambiguidades escalam ao curador como exceção.** Assim a seleção não é juízo da IA, e sim execução de um critério que o curador governou — fechando o maior risco do projeto (acusação de viés político na escolha).

### 5.3 Transparência: rótulo proeminente + proveniência sob demanda

- **Aviso de IA é proeminente** (exigência da norma — §6): todo conteúdo sintético (C1/C2) é inequivocamente marcado como gerado/alterado por IA.
- **Detalhe de proveniência é sob demanda:** o bloco completo (§4.1) fica acessível mas não atravanca a leitura.
- Nada é ocultado; a "seletividade" é no _detalhe_, nunca no _aviso_.

### 5.4 Gates mecânicos (CI) + salvaguarda anti-"vício compartilhado"

- As 4 garantias viram **CI executável** (estende os `audit-*` existentes): proveniência válida · quórum de verificação · método versionado · `archive_url` 200.
- **Diversidade deliberada de verificadores:** lentes distintas (e, onde possível, modelos distintos) para evitar que verificadores idênticos "concordem errado". A amostra humana é a calibração externa.

---

## 6. Conformidade eleitoral (TSE 2026) — _design-for-compliance_

> **Correção factual:** a norma vigente para **2026** é a **Resolução TSE nº 23.610/2019, art. 9º-B, com redação dada pela Resolução nº 23.755/2026** (02/03/2026). O spec mestre / Fase 4 citavam a **23.732/2024** (ciclo anterior) — **corrigir nas referências**.

A fonte oficial **não distingue** explicitamente conteúdo jornalístico/informativo de propaganda quanto à rotulagem de IA. Portanto, **não assumimos isenção**: desenhamos como se a norma aplicasse.

**Salvaguardas embutidas:**

1. **Rótulo proeminente** ("explícito, destacado e acessível") de todo conteúdo sintético C1/C2 (§5.3).
2. **Camadas como blindagem:** C0 (fala real verbatim transcrita) é **documentação de fala pública**, não "conteúdo criado por IA"; só C1/C2 são sintéticos.
3. **Modo "Janela de Silêncio":** congelar publicação/republicação de itens com camada IA de **72h antes a 24h depois** do pleito.
4. **Nunca gerar mídia sintética** (áudio/vídeo/imagem) — apenas texto ancorado. Evita o núcleo da proibição de deepfake.
5. **Gate anti-descontextualização:** a verificação adversarial de C1 checa explicitamente que paráfrase/contexto não descontextualizam (proibido por nome na norma).
6. **Gate jurídico antes de produção:** parecer de advogado eleitoral confirmando a abordagem é **pré-requisito de publicação**.

**Sanção de referência (motiva o rigor):** multa R$ 5.000–30.000 + remoção imediata (art. 57-D, Lei 9.504/97).

---

## 7. Mapa de impacto (anti-regressão)

| Artefato                                                | Mudança                                                                              | Peso        |
| ------------------------------------------------------- | ------------------------------------------------------------------------------------ | ----------- |
| Spec mestre §7.1 ("AI não gera conteúdo")               | **invertido** → §2.1 deste doc                                                       | 🔴 alto     |
| Spec Fase 4 §5.1–5.4 (RACI, pipeline, AI policy)        | reescrita: humano governa método                                                     | 🔴 alto     |
| `/metodologia` (página pública)                         | nova narrativa + rótulo IA + citação legal correta                                   | 🔴 alto     |
| [[Dominios/Postura-Editorial]]                          | "AI não gera conteúdo" → O Método; postura neutra **mantida**                        | 🟡 médio    |
| [[Sem-Veredito-Proprio]]                                | mantém juízo-não; **adiciona** nuance síntese-sim                                    | 🟡 médio    |
| **Nova Decisão no Vault**                               | `Decisoes/AI-Policy-Processo-Reproduzivel.md`                                        | 🟢 novo     |
| `data/schemas/declaracao.schema.json` + Zod `config.ts` | adicionar bloco `proveniencia` (⚠️ **Zod 3**, constraint do projeto)                 | 🟡 médio    |
| CI / scripts                                            | novos gates: `validate-proveniencia`, quórum de verificação, modo janela-de-silêncio | 🟡 médio    |
| Referências legais (mestre + Fase 4)                    | 23.732/2024 → 23.610/2019 art. 9º-B (red. 23.755/2026)                               | 🟢 correção |

---

## 8. Critério de DONE (do design) e gates mecânicos da política

**DONE deste design:** spec revisado e aprovado pelo curador + Decisão registrada no Vault + plano de implementação criado (writing-plans).

**Gates mecânicos que a implementação deve materializar** (cada um exit-code 0/1, bloqueante em CI):

1. `validate-proveniencia` — todo dado publicado tem bloco de proveniência válido (origem + âncora + verificação).
2. quórum de verificação adversarial registrado por camada (C0 ≥ acordado; C1/C2 ≥ acordado).
3. método (`metodo@versão`) existe e está versionado em git.
4. `check:archive-urls` — fontes primárias 200 (já existe).
5. rótulo de IA presente em todo campo C1/C2 (gate de transparência).
6. modo janela-de-silêncio: bloqueia publicação de itens com camada IA na janela 72h/24h.

---

## 9. Riscos e mitigações (novos, criados por esta política)

| #    | Risco                                                                          | Sev.  | Mitigação                                                                                 |
| ---- | ------------------------------------------------------------------------------ | ----- | ----------------------------------------------------------------------------------------- |
| AP-1 | **Erosão de confiança** se a mudança for percebida como "agora é feito por IA" | Alta  | comunicação do reframe ("não confie, reproduza") + proveniência aberta + reproduction kit |
| AP-2 | **Vício compartilhado** dos verificadores (concordam errado)                   | Alta  | diversidade de lentes/modelos + amostra humana calibradora (§5.4)                         |
| AP-3 | **Descontextualização** por paráfrase de IA (C1)                               | Alta  | gate anti-descontextualização + citação literal C0 sempre acessível ao lado               |
| AP-4 | **Exposição legal eleitoral** (TSE 2026)                                       | Alta  | §6 design-for-compliance + gate jurídico antes de produção                                |
| AP-5 | **Cascata de saliência subjetiva** reintroduz viés na seleção                  | Alta  | cascata 100% determinística; empate → exceção humana (§5.2)                               |
| AP-6 | **Inflação de escala** sem qualidade (gerar muito, verificar mal)              | Média | gates bloqueantes + amostra humana + métrica de convergência                              |
| AP-7 | Falsa atribuição (declaração de outro atribuída ao candidato)                  | Alta  | verificação C0 contra fonte + proveniência + amostra                                      |

---

## 10. Alternativas consideradas (registro das bifurcações deste brainstorming)

- **Arquitetura:** A (camadas) · B (proveniência por-campo) · C (method-as-code). **Escolhido: A+C faseado**, com B simples (por declaração). B-completo rejeitado por verbosidade (YAGNI).
- **Âncora de credibilidade:** processo reproduzível _(escolhido)_ · síntese-sem-veredito · editora-com-veredito · curadoria-humana-visível.
- **Fidelidade C0:** híbrido por confiança _(escolhido)_ · totalmente adversarial · humano-sempre.
- **Repetível:** convergência verificável _(escolhido)_ · artefato-versionado · determinismo-forte.
- **Sign-off humano:** governança do método + amostra/exceções _(escolhido)_; inclusão item-a-item e C2-sempre **rejeitados** em favor de cascata determinística + gate.
- **Conformidade:** design-for-compliance _(escolhido)_ · faseamento por risco legal · parecer-antes-do-spec.

---

## 11. Próximos passos

1. **Curador revisa este spec** e aprova ou ajusta.
2. **Registrar Decisão no Vault** (`Decisoes/AI-Policy-Processo-Reproduzivel.md`) com rationale + alternativas + sinais de revisão.
3. **Gate jurídico:** consulta a advogado eleitoral sobre aderência à Res. 23.610/2019 art. 9º-B (red. 23.755/2026) — **antes de qualquer produção**.
4. **Invocar `writing-plans`** para decompor a implementação (schema + proveniência, gates de CI, modo janela-de-silêncio, reescrita de `/metodologia`, atualização do spec mestre e Fase 4).

---

## Apêndice — Decisões travadas no brainstorming (2026-05-29)

Todas confirmadas pelo curador, uma a uma:

- Motivação: escala + valor acadêmico/LLM + confiabilidade + agent-native (as quatro).
- Inegociável: proveniência (expandido para o Método de 4 garantias).
- Flexibilizado: IA redige texto derivado (C1), síntese (C2), rotulagem seletiva no detalhe.
- Âncora: o processo é a autoridade.
- Fidelidade C0: híbrido por confiança.
- Repetível: convergência verificável.
- Governança: humano governa método + amostra + exceções; inclusão por cascata determinística.
- Conformidade: design-for-compliance + gate jurídico.
