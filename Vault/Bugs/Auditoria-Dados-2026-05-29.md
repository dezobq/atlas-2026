---
tags: [audit, qualidade-dados, neutralidade, workflow]
created: 2026-05-29
updated: 2026-05-29
status: resolvido
dependencies:
  - "[[Postura-Editorial]]"
  - "[[Flavio-Bolsonaro]]"
---

# Auditoria de Dados · 2026-05-29 (workflow read-only)

Registro da primeira execução do workflow dinâmico **`/atlas-auditoria-readonly`** (7 agentes, verificação adversarial). Auditoria sobre o estado do `data/` em 2026-05-29. Read-only por desenho; as correções foram aplicadas em passo separado após aprovação do curador.

> Não é um bug técnico clássico — é um registro de QA de qualidade de dados. Vive em `Bugs/` por falta de pasta `Auditorias/` (decisão a reavaliar). Forma "problema → fix → detecção de regressão" justifica o encaixe.

## Inventário no momento da auditoria

- **Candidatos:** 2 (`lula-luiz-inacio` / PT, `bolsonaro-flavio` / PL)
- **Temas:** 6 (economia, educacao, meio-ambiente, politica-externa, saude, seguranca-publica)
- **Declarações:** 0 · **Eventos:** 0 (Fase 4 / conteúdo MVP ainda pendente neste checkout; `log-editorial.csv` só com cabeçalho)

## Achados confirmados pelo cético + fix aplicado

### 1. Neutralidade editorial — `data/temas/meio-ambiente.yaml` (severidade: baixa)

O qualificador valorativo **"agronegócio sustentável"** destoava do padrão dos outros 5 temas, que usam só substantivos neutros. Fricção com a [[Postura-Editorial]] ("tecnicista neutro radical, sem veredito próprio").

- **Fix:** `agronegócio sustentável` → `agronegócio`.

### 2. Coerência de fontes — `data/candidatos/bolsonaro-flavio.yaml` (severidade real: baixa)

Descasamento `handle` (`@flaviobolsonaro`) ↔ `url` (`youtube.com/flaviobolsonaro`, formato custom URL legado, sem `/@`). **Não detectável por schema** (cross-field).

- **Verificação antes do fix:** ambas as URLs resolvem (HTTP 200) para o **mesmo canal** — `canonical: youtube.com/channel/UCl2HptoHv6PjZMQAwTdA--Q`, og:title "Flavio Bolsonaro". O link **não estava quebrado**; era só inconsistência de formato. Por isso a severidade real é baixa, não média.
- **Fix:** `url` → `https://www.youtube.com/@flaviobolsonaro` (alinha ao handle, mesmo canal).

## Falso positivo descartado pela verificação adversarial

- **Capitalização do handle do Lula** (X `@LulaOficial` vs Instagram `@lulaoficial`): o cético descartou — é o comportamento real do Instagram (normaliza para minúsculo). Cada entrada é internamente coerente. **Nenhuma ação.**

> Este descarte é o valor central do padrão: sem o cético, o falso positivo de "viés/erro" teria entrado no relatório.

## Como detectar regressão

1. Rodar `pnpm validate-data` (pega quebras de schema — não pega neutralidade/coerência cross-field).
2. Rodar o workflow **`/atlas-auditoria-readonly`** (pega as camadas semânticas que o schema não cobre). Reusável a cada lote de declarações.

## Pendências sinalizadas

- Campo `atualizado_em` de `bolsonaro-flavio.yaml` permaneceu `2026-05-28` (não alterado — aguardando definição de processo de timestamp).
- Quando a ingestão começar, monitorar **paridade de declarações/temas entre candidatos** (risco de desequilíbrio editorial só se materializa com volume).

## Links

- Decisão que esta sessão originou: [[AI-Policy-Processo-Reproduzivel]]
- Postura: [[Postura-Editorial]]
