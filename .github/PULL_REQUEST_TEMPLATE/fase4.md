## Sprint

<!-- Marque um -->

- [ ] 5.1 Setup
- [ ] 5.2 Piloto
- [ ] 5.3 Lote
- [ ] 5.4 Polimento

## Mudança editorial

- [ ] N declarações novas: \_\_\_
- [ ] N entradas em log-editorial.csv: \_\_\_
- [ ] Candidatos envolvidos: \_\_\_

## Auditoria automatizada

- [ ] `pnpm validate-data`: PASS
- [ ] `pnpm audit:paridade`: PASS — output:
  ```
  <colar output>
  ```
- [ ] `pnpm audit:distribuicao`: rodado (link para `docs/distribuicao-fase4.md`)
- [ ] `pnpm check:archive-urls --recent`: PASS

## Auditoria humana

- [ ] Sign-off por declaração: \_\_\_/\_\_\_ (checklist do §5.5 do design marcada)
- [ ] Wayback abre para todas as N URLs
- [ ] Transcrição confere com fonte primária (integral em 5.1/5.2/5.4; amostral em 5.3)

## Build

- [ ] `pnpm format:check`: PASS
- [ ] `pnpm lint`: PASS
- [ ] `pnpm typecheck`: PASS
- [ ] `pnpm test`: PASS (N testes)
- [ ] `pnpm build:full`: PASS (N páginas no dist)

## Risco residual conhecido

<!-- vazio | descreve riscos aceitos conscientemente -->

## Referências

- Spec: `docs/superpowers/specs/2026-05-28-atlas-fase4-conteudo-mvp-design.md`
- Plan: `docs/superpowers/plans/2026-05-28-atlas-fase4-sprint5-1-setup-editorial.md`
