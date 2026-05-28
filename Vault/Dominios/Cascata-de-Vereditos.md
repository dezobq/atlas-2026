---
tags: [dominio, editorial, vereditos]
created: 2026-05-28
updated: 2026-05-28
status: ativo
dependencies: [[Postura-Editorial]]
---

# Cascata de Vereditos

Como o Atlas agrega (e nunca emite) vereditos sobre declarações.

## Hierarquia das fontes

1. **Tier 1 — Fact-checkers signatários do IFCN brasileiros**
   - [[Fontes/Lupa]] (Agência Lupa)
   - [[Fontes/Aos-Fatos]]
   - [[Fontes/Comprova]] (Projeto Comprova)
2. **Tier 2 — Mídia jornalística com verificação** (Folha Verifica, Estadão Verifica, BBC Brasil Reality Check)
3. **Tier 3 — Sem veredito** — registramos "sem veredito até <data>". Não inventamos.

## Regra de agregação

- Quando ≥1 fonte Tier 1 publicou veredito → mostrar todos, com atribuição clara
- Quando só Tier 2 → mostrar com tag "veredito jornalístico (não-IFCN)"
- Quando nenhuma → tag "sem veredito" + lista de fontes consultadas e data

## Anti-pattern (não fazer)

- Sintetizar vereditos divergentes em um "veredito do Atlas"
- Omitir veredito porque "não concordamos"
- Atrasar publicação esperando veredito (publica-se a declaração com `sem veredito`, atualiza-se depois)

## Schema técnico

Em `data/declaracoes/<id>.md`, campo `vereditos[]`:

```yaml
vereditos:
  - fonte: lupa
    classificacao: falso # literal do fact-checker, sem normalizar
    url: https://lupa.uol.com.br/...
    arquivado: https://web.archive.org/...
    data: 2026-04-20
```

## Links

- Postura geral: [[Postura-Editorial]]
- Fontes detalhadas: [[Fontes/00-MOC]]
- Decisão fundadora: [[Decisoes/Sem-Veredito-Proprio]]
