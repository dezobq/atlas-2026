---
tags: [bug, dados, fk, candidato, astro-content]
created: 2026-05-28
updated: 2026-05-28
status: ativo
dependencies: []
---

# Bug: FK de candidato resolvida por ULID `data.id` em vez do slug

## Sintoma

Múltiplos sintomas, **todos invisíveis ao CI** (o build retorna arrays vazios, não erro):

- **Página de perfil do candidato** (`/candidatos/<slug>`): mostra "0 declarações documentadas" e timeline vazia, mesmo havendo declarações/eventos do candidato no repositório.
- **`pnpm audit:paridade --piloto-mode` / `--final-mode`**: reporta `"<ULID> tem 0 declaração(ões) em <tema>, esperado 1/5"` para **todos** os pares candidato×tema, mesmo com os dados corretos. (Modo `setup`, usado no CI, NÃO exercita esse caminho — por isso passava.)
- **JSON-LD `Schema.org/Event`**: `performer: []` vazio nas páginas de evento.
- **Cards de declaração** em `/eventos/<id>` e `/temas/<slug>`: renderizam sem o nome do candidato.

## Causa raiz

O candidato tem **dois** identificadores no schema (`src/content/config.ts`):

- `id` — um **ULID** (ex: `01KSQDGYBHGRTNYGSMCMPAAKH4`)
- `slug` — o **nome do arquivo** em `data/candidatos/` (ex: `lula-luiz-inacio`)

Toda a malha de FK usa o **slug**: `data/declaracoes/*.md` e `data/eventos/*.yaml` referenciam o candidato por `candidato_id = <slug>`, e os loaders resolvem por `getEntry("candidatos", id)` onde `id` = nome do arquivo = slug. O ULID `data.id` **não aparece em nenhuma FK** — é um identificador vestigial.

Mas 6 pontos chaveavam o join por `candidato.data.id` / `c.id` (o ULID):

| Arquivo:linha                             | O quê                                                                         |
| ----------------------------------------- | ----------------------------------------------------------------------------- |
| `src/pages/candidatos/[slug].astro:25-26` | `getDeclaracoesByCandidato(candidato.data.id)` / `getEventosByCandidato(...)` |
| `src/lib/seo/build-event.ts:17`           | `new Map(candidatos.map(c => [c.data.id, c]))`                                |
| `src/pages/eventos/[id].astro:28`         | idem (`candidatosPorId`)                                                      |
| `src/pages/temas/[slug].astro:25`         | idem (`candidatosPorId`)                                                      |
| `scripts/audit-paridade.ts:91,100`        | `matriz.get(\`${c.id}::${tema}\`)` (matriz chaveada por slug)                 |

Como `ULID ≠ slug`, `Map.get`/`matriz.get` davam miss → array/contagem vazia. Não havia erro porque `getEntry` retorna `undefined` (não lança) e os componentes degradam graciosamente (`{candidato && ...}`).

**Por que os testes não pegaram:** as fixtures mascaravam o bug forçando `id === slug`:

- `tests/unit/scripts/audit-paridade.test.ts`: `const cand = (slug) => ({ id: slug, slug, nome: slug })`
- `tests/unit/seo/build-event.test.ts`: candidatos com `data.id === slug === "candidato-a"`

`build-person` / `build-quotation` / `build-article` usam `.slug`/`.nome` (não `.data.id`), por isso estavam corretos.

## Solução

Chavear **todos** os joins de candidato pelo **slug**. Diff cirúrgico (5 arquivos de produção, ~18 linhas):

```diff
- getDeclaracoesByCandidato(candidato.data.id)      → candidato.data.slug
- new Map(candidatos.map(c => [c.data.id, c]))       → [c.data.slug, c]   (build-event, eventos, temas)
- matriz.get(`${c.id}::${t}`)                        → `${c.slug}::${t}`   (audit-paridade)
```

Variáveis `candidatosPorId` renomeadas para `candidatosPorSlug` (a armadilha era o nome enganoso). Comentários inline adicionados nos 4 arquivos apontando para este registro.

## Como detectar regressão

- **Testes (RED→GREEN):** 2 testes novos com `id ≠ slug` que falhavam antes do fix:
  - `tests/unit/scripts/audit-paridade.test.ts` → "FK candidato_id resolve por slug (regressão id≠slug)" (piloto + final)
  - `tests/unit/seo/build-event.test.ts` → "resolve performer por slug quando candidato.data.id (ULID) difere do slug"
- **Grep de guarda:** `c.data.id` / `c.id` em contexto de join de candidato deve ser sempre `.slug`. Os únicos `.data.id` legítimos são de `declaracao`/`evento` (cujo `id` = nome do arquivo, usado em URLs).
- **Verificação de página:** após `pnpm build`, `dist/candidatos/<slug>/index.html` deve conter as declarações do candidato (não "0 declarações").

## Links

- Constraint registrada: `CLAUDE.md` seção "Constraints permanentes" (item 9)
- Descoberto durante: `/claude-mem:learn-codebase` (sweep completo do código, 2026-05-28)
- Convenção relacionada: `candidato_id = slug` (templates `docs/superpowers/templates/`)
