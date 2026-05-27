# Atlas dos Candidatos · 2026

> Memória factual da eleição presidencial brasileira de 2026.
> Declarações com fonte primária. Sem julgamento editorial.

Atlas é uma base **pública, aberta e indexável** de declarações documentais
feitas por candidatos à presidência do Brasil em 2026. Cada declaração tem
fonte primária verificável (vídeo timestamped, transcrição oficial, link
arquivado). O Atlas **não emite veredito** sobre veracidade — quando há
veredito de fact-checker reconhecido (Lupa, Aos Fatos, Comprova, etc),
agregamos com transparência de atribuição.

## Status

🏗️ Em desenvolvimento — Fase 1 (Fundação). Lançamento previsto: pós-MVP.

## Stack

- [Astro 5](https://astro.build/) + [React 19](https://react.dev/) (islands)
- [Tailwind v4](https://tailwindcss.com/) + [shadcn/ui](https://ui.shadcn.com/)
- [Geist Sans/Mono](https://vercel.com/font)
- [Zod](https://zod.dev/) para schemas + JSON Schema para validação externa
- Dados em markdown + YAML no git

## Desenvolvimento

```bash
pnpm install
pnpm dev          # http://localhost:4321
pnpm build        # build estático
pnpm test         # vitest
pnpm lint         # eslint
pnpm typecheck    # astro check
pnpm validate-data
```

Requer Node 22 LTS e pnpm 9+.

## Licenças

- **Código**: [MIT](LICENSE)
- **Dataset**: CC-BY 4.0 (atribuição obrigatória)
- **Conteúdo editorial**: CC-BY 4.0

## Contribuir

Veja [`docs/CONTRIBUTING.md`](docs/CONTRIBUTING.md), [`docs/METODOLOGIA.md`](docs/METODOLOGIA.md)
e [`docs/CODE_OF_CONDUCT.md`](docs/CODE_OF_CONDUCT.md).

## Design

Spec completo do projeto em [`docs/superpowers/specs/2026-05-27-atlas-design.md`](docs/superpowers/specs/2026-05-27-atlas-design.md).
