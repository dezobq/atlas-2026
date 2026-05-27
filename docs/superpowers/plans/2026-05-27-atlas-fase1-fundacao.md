# Atlas dos Candidatos 2026 — Fase 1: Fundação (Sprints 0-2)

> **For agentic workers:** REQUIRED SUB-SKILL: Use `superpowers:subagent-driven-development` (recommended) or `superpowers:executing-plans` to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Estabelecer fundação técnica do Atlas — projeto Astro inicializado com TypeScript estrito, design system completo (Tailwind v4 + shadcn/ui + Geist), modelo de dados schematizado e validado via Zod + JSON Schema, governance docs publicados, CI funcional. Ao final desta fase: projeto roda local com `pnpm dev`, build estático passa Lighthouse 95+, schemas validam, lint+typecheck+test verdes no CI.

**Architecture:** Astro 5 estático com TypeScript estrito, React 19 islands restritas a interatividade pontual, Tailwind v4 com design tokens centralizados em CSS, shadcn/ui para componentes primitivos. Modelo de dados via Astro Content Collections com Zod (validação build-time) + JSON Schema gerado de Zod (validação externa em PRs/CI). Persistência inicial: markdown + YAML em git.

**Tech Stack:** Astro 5, React 19, TypeScript 5.6+, Tailwind v4, shadcn/ui, Geist Sans/Mono (via @fontsource-variable), Lucide React, Zod 3.23+, zod-to-json-schema 3, Ajv 8, Vitest 2, ESLint 9 (flat config), Prettier 3, pnpm 9, Node 22 LTS.

**Referência spec:** `docs/superpowers/specs/2026-05-27-atlas-design.md` (commit 903e559). Seções específicas referenciadas em cada task.

---

## File Structure (Fase 1)

```
atlas/
├── .github/
│   ├── ISSUE_TEMPLATE/
│   │   ├── bug.yml
│   │   └── duvida.yml
│   ├── workflows/
│   │   └── ci.yml
│   └── pull_request_template.md
├── .vscode/
│   └── settings.json
├── data/
│   ├── candidatos/
│   │   └── .gitkeep
│   ├── eventos/
│   │   └── .gitkeep
│   ├── declaracoes/
│   │   └── .gitkeep
│   ├── temas/
│   │   ├── economia.yaml
│   │   ├── saude.yaml
│   │   └── seguranca-publica.yaml
│   └── schemas/
│       ├── candidato.schema.json
│       ├── evento.schema.json
│       ├── declaracao.schema.json
│       └── tema.schema.json
├── public/
│   ├── favicon.svg
│   ├── robots.txt
│   └── humans.txt
├── scripts/
│   ├── generate-json-schemas.ts
│   └── validate-data.ts
├── src/
│   ├── components/
│   │   ├── ui/                   (shadcn primitives a serem instaladas)
│   │   ├── layout/
│   │   │   ├── BaseLayout.astro
│   │   │   ├── Header.astro
│   │   │   └── Footer.astro
│   │   └── shared/
│   │       ├── Disclaimer.astro
│   │       ├── Tag.astro
│   │       └── SkipLink.astro
│   ├── content/
│   │   └── config.ts
│   ├── lib/
│   │   ├── data/
│   │   │   ├── candidatos.ts
│   │   │   ├── eventos.ts
│   │   │   ├── declaracoes.ts
│   │   │   └── temas.ts
│   │   └── utils/
│   │       ├── slugify.ts
│   │       ├── format-date.ts
│   │       └── truncate.ts
│   ├── pages/
│   │   ├── index.astro
│   │   └── 404.astro
│   ├── styles/
│   │   ├── tokens.css
│   │   └── global.css
│   └── types/
│       └── index.ts
├── tests/
│   └── unit/
│       ├── slugify.test.ts
│       ├── format-date.test.ts
│       ├── truncate.test.ts
│       └── data-loaders.test.ts
├── docs/
│   ├── superpowers/
│   │   ├── specs/2026-05-27-atlas-design.md  (já existe)
│   │   └── plans/
│   │       └── 2026-05-27-atlas-fase1-fundacao.md  (este arquivo)
│   ├── README.md
│   ├── CONTRIBUTING.md
│   ├── CODE_OF_CONDUCT.md
│   ├── SECURITY.md
│   ├── GOVERNANCE.md
│   └── SCHEMA.md
├── .editorconfig
├── .prettierrc.json
├── .prettierignore
├── eslint.config.js
├── astro.config.mjs
├── tsconfig.json
├── vitest.config.ts
├── package.json
├── pnpm-lock.yaml
├── LICENSE
├── README.md
└── .gitignore                    (já existe)
```

---

## Pré-requisitos (verificar antes de começar)

- [ ] Node 22 LTS instalado (`node --version` → v22.x)
- [ ] pnpm 9+ instalado (`pnpm --version` → 9.x)
- [ ] git configurado (`user.email` e `user.name` já feitos no setup do repo)
- [ ] Diretório do projeto: `C:\Users\dezob\Projects\atlas`
- [ ] Repo git inicializado (commit inicial 903e559 do spec já existe)

---

# SPRINT 0 — Setup do Projeto

Estabelece projeto Astro com toolchain completo, design system base, governance docs. Ao final: `pnpm dev` abre site placeholder estilizado.

---

### Task 1: Inicializar projeto Astro com TypeScript estrito

**Spec ref:** Seção 6.1 (stack consolidada)

**Files:**
- Create: `package.json`
- Create: `astro.config.mjs`
- Create: `tsconfig.json`
- Create: `src/env.d.ts`

- [ ] **Step 1: Criar package.json mínimo**

Cria o arquivo `package.json` na raiz com conteúdo exato:

```json
{
  "name": "atlas-2026",
  "version": "0.0.0",
  "private": true,
  "type": "module",
  "engines": {
    "node": ">=22.0.0",
    "pnpm": ">=9.0.0"
  },
  "scripts": {
    "dev": "astro dev",
    "build": "astro build",
    "preview": "astro preview",
    "astro": "astro",
    "typecheck": "astro check",
    "lint": "eslint . --max-warnings=0",
    "lint:fix": "eslint . --fix",
    "format": "prettier --write .",
    "format:check": "prettier --check .",
    "test": "vitest run",
    "test:watch": "vitest",
    "validate-data": "tsx scripts/validate-data.ts",
    "generate-schemas": "tsx scripts/generate-json-schemas.ts"
  },
  "dependencies": {
    "astro": "^5.0.0",
    "@astrojs/react": "^4.0.0",
    "@astrojs/check": "^0.9.0",
    "react": "^19.0.0",
    "react-dom": "^19.0.0"
  },
  "devDependencies": {
    "@types/react": "^19.0.0",
    "@types/react-dom": "^19.0.0",
    "typescript": "^5.6.0",
    "tsx": "^4.19.0"
  }
}
```

- [ ] **Step 2: Instalar dependências**

Comando:
```bash
pnpm install
```

Expected output: instala Astro 5, React 19, TypeScript 5.6+ e tsx. Cria `pnpm-lock.yaml` e `node_modules/`.

- [ ] **Step 3: Criar tsconfig.json estrito**

Cria `tsconfig.json` na raiz:

```json
{
  "extends": "astro/tsconfigs/strict",
  "include": [".astro/types.d.ts", "**/*", "src/env.d.ts"],
  "exclude": ["dist", "node_modules"],
  "compilerOptions": {
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "exactOptionalPropertyTypes": true,
    "noImplicitOverride": true,
    "noFallthroughCasesInSwitch": true,
    "verbatimModuleSyntax": true,
    "moduleResolution": "bundler",
    "module": "ESNext",
    "target": "ES2022",
    "jsx": "react-jsx",
    "jsxImportSource": "react",
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"],
      "@components/*": ["src/components/*"],
      "@lib/*": ["src/lib/*"],
      "@styles/*": ["src/styles/*"],
      "@types": ["src/types/index.ts"]
    }
  }
}
```

- [ ] **Step 4: Criar src/env.d.ts**

Cria `src/env.d.ts`:

```ts
/// <reference path="../.astro/types.d.ts" />
```

- [ ] **Step 5: Criar astro.config.mjs**

Cria `astro.config.mjs` na raiz:

```js
import { defineConfig } from "astro/config";
import react from "@astrojs/react";

export default defineConfig({
  site: "https://atlas2026.example.com",
  output: "static",
  trailingSlash: "never",
  build: {
    format: "directory",
    assets: "_assets",
  },
  integrations: [react()],
  prefetch: {
    prefetchAll: false,
    defaultStrategy: "viewport",
  },
  vite: {
    resolve: {
      alias: {
        "@": new URL("./src", import.meta.url).pathname,
      },
    },
  },
});
```

Nota: `site` é placeholder; valor final é cravado na Fase 3 quando domínio for adquirido.

- [ ] **Step 6: Criar diretórios obrigatórios**

```bash
mkdir -p src/pages src/components/layout src/components/shared src/components/ui src/content src/lib/data src/lib/utils src/styles src/types public scripts tests/unit
```

PowerShell equivalente:
```powershell
$dirs = "src/pages","src/components/layout","src/components/shared","src/components/ui","src/content","src/lib/data","src/lib/utils","src/styles","src/types","public","scripts","tests/unit"
$dirs | ForEach-Object { New-Item -ItemType Directory -Force -Path $_ | Out-Null }
```

- [ ] **Step 7: Verificar build vazio**

Cria página placeholder mínima `src/pages/index.astro`:

```astro
---
const title = "Atlas dos Candidatos 2026";
---
<html lang="pt-BR">
  <head>
    <meta charset="UTF-8" />
    <title>{title}</title>
  </head>
  <body>
    <h1>{title}</h1>
    <p>Setup em andamento — Sprint 0.</p>
  </body>
</html>
```

Roda:
```bash
pnpm dev
```

Expected: servidor Astro inicia em `http://localhost:4321/`. Página mostra "Atlas dos Candidatos 2026". Encerra com Ctrl+C.

- [ ] **Step 8: Commit**

```bash
git add package.json pnpm-lock.yaml tsconfig.json astro.config.mjs src/
git commit -m "feat(setup): inicializar projeto Astro 5 com TypeScript estrito"
```

---

### Task 2: Configurar ESLint 9, Prettier 3 e Vitest

**Spec ref:** Seção 16 (TEP — automação de checks)

**Files:**
- Create: `eslint.config.js`
- Create: `.prettierrc.json`
- Create: `.prettierignore`
- Create: `.editorconfig`
- Create: `vitest.config.ts`
- Modify: `package.json`

- [ ] **Step 1: Instalar dependências de lint e teste**

```bash
pnpm add -D eslint@^9.0.0 @eslint/js typescript-eslint eslint-plugin-astro eslint-plugin-jsx-a11y eslint-plugin-react eslint-plugin-react-hooks prettier@^3.0.0 prettier-plugin-astro prettier-plugin-tailwindcss vitest@^2.0.0 @vitest/coverage-v8 jsdom @testing-library/react @testing-library/jest-dom
```

Expected: pacotes adicionados em `devDependencies`.

- [ ] **Step 2: Criar eslint.config.js (flat config)**

Cria `eslint.config.js` na raiz:

```js
import js from "@eslint/js";
import tseslint from "typescript-eslint";
import astroPlugin from "eslint-plugin-astro";
import jsxA11y from "eslint-plugin-jsx-a11y";
import react from "eslint-plugin-react";
import reactHooks from "eslint-plugin-react-hooks";

export default [
  js.configs.recommended,
  ...tseslint.configs.recommendedTypeChecked,
  ...astroPlugin.configs.recommended,
  {
    files: ["**/*.{ts,tsx}"],
    languageOptions: {
      parserOptions: {
        project: "./tsconfig.json",
        tsconfigRootDir: import.meta.dirname,
      },
    },
    plugins: {
      "jsx-a11y": jsxA11y,
      react,
      "react-hooks": reactHooks,
    },
    rules: {
      ...react.configs.recommended.rules,
      ...reactHooks.configs.recommended.rules,
      "react/react-in-jsx-scope": "off",
      "@typescript-eslint/consistent-type-imports": "error",
      "@typescript-eslint/no-unused-vars": [
        "error",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
      ],
      "@typescript-eslint/no-explicit-any": "error",
      "no-console": ["warn", { allow: ["warn", "error"] }],
    },
    settings: { react: { version: "detect" } },
  },
  {
    files: ["scripts/**/*.ts"],
    rules: {
      "no-console": "off",
    },
  },
  {
    ignores: ["dist/", "node_modules/", ".astro/", "data/schemas/"],
  },
];
```

- [ ] **Step 3: Criar .prettierrc.json**

Cria `.prettierrc.json` na raiz:

```json
{
  "semi": true,
  "singleQuote": false,
  "trailingComma": "all",
  "printWidth": 100,
  "tabWidth": 2,
  "useTabs": false,
  "endOfLine": "lf",
  "plugins": ["prettier-plugin-astro", "prettier-plugin-tailwindcss"],
  "overrides": [
    { "files": "*.astro", "options": { "parser": "astro" } }
  ]
}
```

- [ ] **Step 4: Criar .prettierignore**

```
dist/
node_modules/
.astro/
pnpm-lock.yaml
data/schemas/
*.min.*
```

- [ ] **Step 5: Criar .editorconfig**

```
root = true

[*]
charset = utf-8
end_of_line = lf
indent_style = space
indent_size = 2
trim_trailing_whitespace = true
insert_final_newline = true

[*.md]
trim_trailing_whitespace = false
```

- [ ] **Step 6: Criar vitest.config.ts**

```ts
import { defineConfig } from "vitest/config";
import { getViteConfig } from "astro/config";

export default defineConfig(
  getViteConfig({
    test: {
      environment: "jsdom",
      globals: true,
      include: ["tests/**/*.test.{ts,tsx}"],
      coverage: {
        provider: "v8",
        reporter: ["text", "html", "lcov"],
        exclude: [
          "node_modules/",
          "dist/",
          ".astro/",
          "tests/",
          "scripts/",
          "**/*.config.*",
          "**/*.d.ts",
        ],
        thresholds: {
          lines: 80,
          functions: 80,
          branches: 75,
          statements: 80,
        },
      },
    },
  }),
);
```

- [ ] **Step 7: Verificar lint e prettier rodam**

```bash
pnpm lint
pnpm format:check
```

Expected: ambos passam (sem warnings/erros no estado atual mínimo).

Se `format:check` reportar arquivos não formatados, rode `pnpm format` e commite as formatações.

- [ ] **Step 8: Commit**

```bash
git add eslint.config.js .prettierrc.json .prettierignore .editorconfig vitest.config.ts package.json pnpm-lock.yaml
git commit -m "chore(tooling): adicionar ESLint 9, Prettier 3, Vitest 2 com config estrita"
```

---

### Task 3: Setup Tailwind v4 com design tokens

**Spec ref:** Seção 6.1 (stack), Seção 8.2 (visual identity)

**Files:**
- Modify: `astro.config.mjs`
- Modify: `package.json`
- Create: `src/styles/tokens.css`
- Create: `src/styles/global.css`

- [ ] **Step 1: Instalar Tailwind v4**

Tailwind v4 usa novo plugin Vite (`@tailwindcss/vite`). Não precisa do `tailwindcss/postcss` separado.

```bash
pnpm add -D tailwindcss@^4.0.0 @tailwindcss/vite@^4.0.0
```

- [ ] **Step 2: Atualizar astro.config.mjs para incluir Tailwind**

Atualiza `astro.config.mjs` adicionando `tailwindcss()` ao array `plugins` do Vite:

```js
import { defineConfig } from "astro/config";
import react from "@astrojs/react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  site: "https://atlas2026.example.com",
  output: "static",
  trailingSlash: "never",
  build: {
    format: "directory",
    assets: "_assets",
  },
  integrations: [react()],
  prefetch: {
    prefetchAll: false,
    defaultStrategy: "viewport",
  },
  vite: {
    plugins: [tailwindcss()],
    resolve: {
      alias: {
        "@": new URL("./src", import.meta.url).pathname,
      },
    },
  },
});
```

- [ ] **Step 3: Criar src/styles/tokens.css**

Cria `src/styles/tokens.css` com design tokens. Paleta sóbria slate/zinc + accent neutro (cinza-âmbar). Evita verde/vermelho (sugerem veredito político).

```css
@layer base {
  :root {
    /* Espaços (8px scale) */
    --space-1: 0.25rem;   /* 4px  */
    --space-2: 0.5rem;    /* 8px  */
    --space-3: 0.75rem;   /* 12px */
    --space-4: 1rem;      /* 16px */
    --space-5: 1.5rem;    /* 24px */
    --space-6: 2rem;      /* 32px */
    --space-8: 3rem;      /* 48px */
    --space-10: 4rem;     /* 64px */
    --space-12: 6rem;     /* 96px */

    /* Tipografia (escala modular 1.250) */
    --text-xs: 0.75rem;
    --text-sm: 0.875rem;
    --text-base: 1rem;
    --text-lg: 1.125rem;
    --text-xl: 1.25rem;
    --text-2xl: 1.5rem;
    --text-3xl: 1.875rem;
    --text-4xl: 2.25rem;
    --text-5xl: 3rem;

    /* Famílias */
    --font-sans: "Geist Variable", ui-sans-serif, system-ui, -apple-system, "Segoe UI", sans-serif;
    --font-mono: "Geist Mono Variable", ui-monospace, "JetBrains Mono", "SFMono-Regular", monospace;

    /* Pesos */
    --weight-regular: 400;
    --weight-medium: 500;
    --weight-semibold: 600;
    --weight-bold: 700;

    /* Cores neutras — modo claro */
    --color-bg: oklch(98% 0.005 280);              /* near-white slate */
    --color-bg-elevated: oklch(100% 0 0);          /* pure white */
    --color-bg-muted: oklch(96% 0.005 280);
    --color-fg: oklch(20% 0.02 280);               /* near-black slate */
    --color-fg-muted: oklch(50% 0.02 280);
    --color-fg-subtle: oklch(65% 0.015 280);
    --color-border: oklch(90% 0.005 280);
    --color-border-strong: oklch(78% 0.01 280);

    /* Accent neutro — âmbar suave (sem viés político) */
    --color-accent: oklch(70% 0.13 70);
    --color-accent-fg: oklch(20% 0.02 70);
    --color-accent-muted: oklch(95% 0.03 70);

    /* Estados */
    --color-focus: oklch(60% 0.20 250);            /* azul para foco */
    --color-info: oklch(60% 0.15 230);
    --color-warning: oklch(70% 0.18 60);

    /* Sombras (sutis, Linear-style) */
    --shadow-sm: 0 1px 2px 0 oklch(20% 0.02 280 / 0.05);
    --shadow: 0 1px 3px 0 oklch(20% 0.02 280 / 0.08), 0 1px 2px 0 oklch(20% 0.02 280 / 0.04);
    --shadow-md: 0 4px 6px -1px oklch(20% 0.02 280 / 0.08), 0 2px 4px -2px oklch(20% 0.02 280 / 0.04);
    --shadow-lg: 0 10px 15px -3px oklch(20% 0.02 280 / 0.08), 0 4px 6px -4px oklch(20% 0.02 280 / 0.04);

    /* Raio de borda */
    --radius-sm: 0.25rem;
    --radius: 0.5rem;
    --radius-md: 0.625rem;
    --radius-lg: 0.875rem;

    /* Larguras de container */
    --container-narrow: 42rem;       /* 672px — leitura confortável */
    --container-default: 64rem;      /* 1024px — listas */
    --container-wide: 80rem;         /* 1280px — dashboards */

    /* Transições */
    --transition-fast: 150ms cubic-bezier(0.4, 0, 0.2, 1);
    --transition-base: 250ms cubic-bezier(0.4, 0, 0.2, 1);
  }

  @media (prefers-color-scheme: dark) {
    :root {
      --color-bg: oklch(15% 0.02 280);
      --color-bg-elevated: oklch(18% 0.02 280);
      --color-bg-muted: oklch(22% 0.02 280);
      --color-fg: oklch(95% 0.005 280);
      --color-fg-muted: oklch(70% 0.015 280);
      --color-fg-subtle: oklch(55% 0.02 280);
      --color-border: oklch(28% 0.02 280);
      --color-border-strong: oklch(38% 0.02 280);
      --color-accent: oklch(75% 0.13 70);
      --color-accent-fg: oklch(15% 0.02 70);
      --color-accent-muted: oklch(25% 0.04 70);
    }
  }
}
```

- [ ] **Step 4: Criar src/styles/global.css**

```css
@import "tailwindcss";
@import "./tokens.css";

@theme inline {
  --color-bg: var(--color-bg);
  --color-fg: var(--color-fg);
  --color-fg-muted: var(--color-fg-muted);
  --color-border: var(--color-border);
  --color-accent: var(--color-accent);
  --font-family-sans: var(--font-sans);
  --font-family-mono: var(--font-mono);
  --radius-default: var(--radius);
}

@layer base {
  * {
    border-color: var(--color-border);
  }

  html {
    font-family: var(--font-sans);
    background-color: var(--color-bg);
    color: var(--color-fg);
    -webkit-font-smoothing: antialiased;
    text-rendering: optimizeLegibility;
  }

  body {
    margin: 0;
    line-height: 1.6;
    min-height: 100vh;
  }

  ::selection {
    background-color: var(--color-accent-muted);
    color: var(--color-accent-fg);
  }

  :focus-visible {
    outline: 2px solid var(--color-focus);
    outline-offset: 2px;
    border-radius: var(--radius-sm);
  }

  h1, h2, h3, h4, h5, h6 {
    font-weight: var(--weight-semibold);
    line-height: 1.2;
    letter-spacing: -0.01em;
    margin: 0;
  }

  h1 { font-size: var(--text-4xl); letter-spacing: -0.02em; }
  h2 { font-size: var(--text-3xl); letter-spacing: -0.015em; }
  h3 { font-size: var(--text-2xl); }
  h4 { font-size: var(--text-xl); }

  p { margin: 0; }

  a {
    color: var(--color-fg);
    text-decoration: underline;
    text-decoration-thickness: 1px;
    text-underline-offset: 0.15em;
    transition: color var(--transition-fast);
  }

  a:hover {
    color: var(--color-accent);
  }

  code, pre, kbd {
    font-family: var(--font-mono);
    font-size: 0.92em;
  }

  blockquote {
    border-left: 3px solid var(--color-accent);
    padding-left: var(--space-4);
    margin: 0;
    color: var(--color-fg-muted);
    font-style: normal;
  }
}

@layer utilities {
  .container-narrow {
    max-width: var(--container-narrow);
    margin-inline: auto;
    padding-inline: var(--space-4);
  }
  .container-default {
    max-width: var(--container-default);
    margin-inline: auto;
    padding-inline: var(--space-4);
  }
  .container-wide {
    max-width: var(--container-wide);
    margin-inline: auto;
    padding-inline: var(--space-4);
  }
}
```

- [ ] **Step 5: Importar global.css na página de teste**

Atualiza `src/pages/index.astro`:

```astro
---
import "@styles/global.css";
const title = "Atlas dos Candidatos 2026";
---
<html lang="pt-BR">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>{title}</title>
  </head>
  <body>
    <main class="container-narrow" style="padding-block: var(--space-8);">
      <h1>{title}</h1>
      <p>Sprint 0 — Tailwind v4 + design tokens ativos.</p>
    </main>
  </body>
</html>
```

- [ ] **Step 6: Verificar build com Tailwind**

```bash
pnpm dev
```

Expected: página abre em `http://localhost:4321/` com tipografia base, container limitado, cores neutras. Encerra com Ctrl+C.

```bash
pnpm build
```

Expected: build estático gera `dist/` sem erros.

- [ ] **Step 7: Commit**

```bash
git add astro.config.mjs package.json pnpm-lock.yaml src/styles/ src/pages/index.astro
git commit -m "feat(design): adicionar Tailwind v4 e design tokens (paleta sóbria slate/âmbar)"
```

---

### Task 4: Setup shadcn/ui (componentes primitivos)

**Spec ref:** Seção 6.1 (stack)

**Files:**
- Create: `components.json`
- Create: `src/lib/utils/cn.ts`
- Modify: `package.json`

- [ ] **Step 1: Instalar dependências base do shadcn/ui**

```bash
pnpm add class-variance-authority clsx tailwind-merge tailwindcss-animate lucide-react
pnpm add -D @types/node
```

- [ ] **Step 2: Criar components.json (config do shadcn CLI)**

Cria `components.json` na raiz:

```json
{
  "$schema": "https://ui.shadcn.com/schema.json",
  "style": "new-york",
  "rsc": false,
  "tsx": true,
  "tailwind": {
    "config": "",
    "css": "src/styles/global.css",
    "baseColor": "neutral",
    "cssVariables": true
  },
  "aliases": {
    "components": "@/components",
    "utils": "@/lib/utils/cn",
    "ui": "@/components/ui",
    "lib": "@/lib",
    "hooks": "@/hooks"
  },
  "iconLibrary": "lucide"
}
```

- [ ] **Step 3: Criar utilitário cn (class-variance helper)**

Cria `src/lib/utils/cn.ts`:

```ts
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}
```

- [ ] **Step 4: Instalar 3 componentes shadcn iniciais (Button, Badge, Separator)**

```bash
pnpm dlx shadcn@latest add button badge separator --yes
```

Expected: arquivos criados em `src/components/ui/button.tsx`, `badge.tsx`, `separator.tsx`.

Nota: se o CLI pedir confirmação interativa, responda "Yes". Se falhar com "components.json not detected", verifique paths no Step 2.

- [ ] **Step 5: Testar import de componente shadcn**

Atualiza `src/pages/index.astro` para usar o Button:

```astro
---
import "@styles/global.css";
import { Button } from "@/components/ui/button";
const title = "Atlas dos Candidatos 2026";
---
<html lang="pt-BR">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>{title}</title>
  </head>
  <body>
    <main class="container-narrow" style="padding-block: var(--space-8);">
      <h1>{title}</h1>
      <p>Sprint 0 — shadcn/ui integrado.</p>
      <div style="margin-top: var(--space-4); display: flex; gap: var(--space-3);">
        <Button>Botão padrão</Button>
        <Button variant="outline" client:load>Botão outline (interativo)</Button>
      </div>
    </main>
  </body>
</html>
```

```bash
pnpm dev
```

Expected: dois botões renderizam. Primeiro estático (Astro), segundo hidratado (React island).

- [ ] **Step 6: Commit**

```bash
git add components.json package.json pnpm-lock.yaml src/lib/utils/cn.ts src/components/ui/ src/pages/index.astro
git commit -m "feat(ui): adicionar shadcn/ui com Button, Badge, Separator iniciais"
```

---

### Task 5: Importar Geist Sans e Geist Mono

**Spec ref:** Seção 8.2 (visual identity)

**Files:**
- Modify: `package.json`
- Modify: `src/styles/global.css`

- [ ] **Step 1: Instalar fontes Geist via @fontsource-variable**

```bash
pnpm add @fontsource-variable/geist @fontsource-variable/geist-mono
```

- [ ] **Step 2: Importar fontes no global.css**

Adiciona no TOPO de `src/styles/global.css` (antes de `@import "tailwindcss"`):

```css
@import "@fontsource-variable/geist/index.css";
@import "@fontsource-variable/geist-mono/index.css";
```

Verifica que `--font-sans` e `--font-mono` em `tokens.css` referem-se a `Geist Variable` e `Geist Mono Variable` — já está correto no Task 3.

- [ ] **Step 3: Verificar fonte aplicada**

```bash
pnpm dev
```

Expected: ao inspecionar elementos no DevTools, a fonte computada deve ser `Geist Variable`.

- [ ] **Step 4: Commit**

```bash
git add package.json pnpm-lock.yaml src/styles/global.css
git commit -m "feat(typography): adicionar Geist Sans e Geist Mono variable fonts"
```

---

### Task 6: Adicionar LICENSE MIT e README inicial

**Spec ref:** Seção 10.1 (licenças)

**Files:**
- Create: `LICENSE`
- Create: `README.md`

- [ ] **Step 1: Criar LICENSE (MIT)**

Cria `LICENSE` na raiz:

```
MIT License

Copyright (c) 2026 Atlas dos Candidatos 2026

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

- [ ] **Step 2: Criar README.md inicial**

Cria `README.md` na raiz (versão minimal — README robusto entra na Fase 3):

````markdown
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
````

- [ ] **Step 3: Commit**

```bash
git add LICENSE README.md
git commit -m "docs: adicionar LICENSE MIT e README inicial"
```

---

### Task 7: Criar docs de governança

**Spec ref:** Seção 10.2 (arquivos obrigatórios)

**Files:**
- Create: `docs/CONTRIBUTING.md`
- Create: `docs/CODE_OF_CONDUCT.md`
- Create: `docs/SECURITY.md`
- Create: `docs/GOVERNANCE.md`

- [ ] **Step 1: Criar docs/CONTRIBUTING.md**

````markdown
# Contribuindo com o Atlas

O Atlas existe para ser **auditável e corrigível**. Toda contribuição é
bem-vinda — desde correções de typo até sugestões de fontes que faltam.

## Princípios

1. **Fonte primária obrigatória.** Nenhuma declaração entra sem URL, timestamp
   e snapshot (Wayback ou local).
2. **Sem veredito.** O Atlas não classifica como verdade/mentira. Vereditos são
   agregados de fact-checkers reconhecidos via campo `vereditos_externos`.
3. **Igual rigor para todos.** Mesma régua editorial para cada candidato.
4. **Auditabilidade.** Toda edição vira commit. Histórico permanece visível.

## Como contribuir

### Correções factuais

Abra uma issue usando o template **"Correção factual"**. Inclua:

- Link da declaração no Atlas
- Que parte está errada (timestamp, citação, atribuição, etc)
- Fonte que comprova a correção

### Sugestões de fonte

Abra uma issue usando o template **"Fonte sugerida"**. Inclua:

- Candidato
- Data do evento
- Fonte primária (URL oficial, vídeo, transcrição)
- Trecho da declaração
- Tema principal

Editores avaliam e, se aceito, criam a entrada.

### Pull requests de código

1. Fork e branch a partir de `main`
2. Faça commits seguindo [Conventional Commits em PT-BR](https://www.conventionalcommits.org/)
3. Rode `pnpm lint`, `pnpm typecheck`, `pnpm test`, `pnpm validate-data`
   antes de abrir PR
4. PR deve passar todos os checks do CI
5. Descreva claramente o "porquê" no PR

### Pull requests de dados

Pedidos de adição/edição de declarações via PR também são aceitos. Mesma régua
de validação. CI roda `validate-data` em todo PR.

## Setup local

Veja [`README.md`](../README.md).

## Comunicação

Issues no GitHub são o canal principal. Não usamos Slack/Discord.

## Código de conduta

Veja [`CODE_OF_CONDUCT.md`](CODE_OF_CONDUCT.md).
````

- [ ] **Step 2: Criar docs/CODE_OF_CONDUCT.md**

Use o [Contributor Covenant 2.1](https://www.contributor-covenant.org/version/2/1/code_of_conduct/) traduzido em PT-BR.

````markdown
# Código de Conduta — Pacto de Contribuidores

## Nosso compromisso

Nós, membros, contribuidores e líderes nos comprometemos a tornar a
participação em nossa comunidade uma experiência livre de assédio para
todos, independente da idade, tamanho corporal, deficiência visível ou
invisível, etnia, características sexuais, identidade e expressão de gênero,
nível de experiência, educação, status socioeconômico, nacionalidade,
aparência pessoal, raça, religião ou identidade e orientação sexual.

Nós nos comprometemos a agir e interagir de maneiras que contribuam para uma
comunidade aberta, acolhedora, diversa, inclusiva e saudável.

## Nossos padrões

Exemplos de comportamento que contribuem para um ambiente positivo:

- Demonstrar empatia e bondade
- Respeitar opiniões, pontos de vista e experiências diferentes
- Dar e aceitar feedback construtivo
- Aceitar responsabilidade e pedir desculpas àqueles afetados por nossos
  erros, aprendendo com a experiência
- Foco no que é melhor não apenas para nós como indivíduos, mas para a
  comunidade em geral

Exemplos de comportamento inaceitável:

- O uso de linguagem ou imagens sexualizadas, e atenção sexual ou avanços
  de qualquer tipo
- Trolling, comentários insultantes ou depreciativos, e ataques pessoais ou
  políticos
- Assédio público ou privado
- Publicar informações privadas de terceiros, como endereço físico ou de
  e-mail, sem sua permissão explícita
- Outras condutas que poderiam ser razoavelmente consideradas inapropriadas
  em um ambiente profissional

## Responsabilidades de aplicação

Os mantenedores são responsáveis por esclarecer e aplicar os nossos padrões
de comportamento aceitável e tomarão ações corretivas apropriadas e justas
em resposta a qualquer comportamento que julguem inadequado, ameaçador,
ofensivo ou prejudicial.

## Escopo

Este Código de Conduta se aplica em todos os espaços do projeto, e também se
aplica quando um indivíduo está representando oficialmente a comunidade em
espaços públicos.

## Aplicação

Casos de comportamento abusivo, assediante ou de outra forma inaceitável
podem ser reportados via [issue privada no GitHub Security Advisories](https://github.com/security/advisories)
ou via o e-mail listado em [`SECURITY.md`](SECURITY.md).

Todas as queixas serão revisadas e investigadas prontamente e de forma justa.

Todos os líderes da comunidade são obrigados a respeitar a privacidade e
segurança de quem relata qualquer incidente.

## Atribuição

Este Código de Conduta é adaptado do [Contributor Covenant][homepage], versão 2.1,
disponível em https://www.contributor-covenant.org/version/2/1/code_of_conduct.html.

[homepage]: https://www.contributor-covenant.org
````

- [ ] **Step 3: Criar docs/SECURITY.md**

````markdown
# Política de Segurança

## Disclosure de vulnerabilidades

Se você descobrir uma vulnerabilidade de segurança no Atlas (XSS,
injeção, vazamento de dados, scraping malicioso, etc), **não abra issue
pública**.

Em vez disso:

1. Use [GitHub Security Advisories](https://docs.github.com/en/code-security/security-advisories/guidance-on-reporting-and-writing-information-about-vulnerabilities/privately-reporting-a-security-vulnerability)
   privadas
2. Ou envie e-mail para `seguranca@atlas2026.example.com` (atualizar com
   endereço real quando domínio for adquirido na Fase 3)

Você receberá resposta em até 7 dias.

## Disclosure de problemas factuais

Erros em conteúdo (citação errada, timestamp errado, atribuição errada) NÃO
são problemas de segurança. Use o template público de issue **"Correção
factual"**.

## Política de fix

Vulnerabilidades de severidade alta serão corrigidas e divulgadas
publicamente em até 30 dias após o relato. Severidade média/baixa: 90 dias.
````

- [ ] **Step 4: Criar docs/GOVERNANCE.md**

````markdown
# Governança do Atlas

## Decisão final

O Atlas tem **um mantenedor único** com responsabilidade editorial e técnica
final. A comunidade contribui via issues e PRs; o mantenedor decide o que
entra.

## Critérios de inclusão de declarações

Definidos em [`METODOLOGIA.md`](METODOLOGIA.md) (a ser publicado na Fase 3).
Aplicáveis a TODOS os candidatos com a mesma régua, sem exceção.

## Processo de correção factual

1. Issue aberta com template "Correção factual"
2. Mantenedor avalia em até 7 dias
3. Se aceita: commit de correção com referência à issue
4. Histórico permanece visível via `git log` e seção "Edições recentes" da
   página da declaração

## Processo de PRs externos

1. CI deve passar (lint + typecheck + test + validate-data)
2. Revisão do mantenedor
3. Aceito ou rejeitado com justificativa pública

## Não-aceitamos

- Contribuições financeiras de partidos, campanhas, ou candidatos
- Parcerias editoriais com veículos politicamente posicionados
- Pedidos de remoção de declarações documentadas com fonte primária válida

## Aceitamos

- Doações via Open Collective (a partir da Fase 2+, se ativado)
- Grants de fundações cívicas (Mozilla, Knight, MacArthur, Itaú Social, etc)
  com disclosure pública
- Contribuições técnicas e editoriais via PR/issue

## Disclaimer

O Atlas **não é um fact-checker**. É uma camada de infraestrutura factual.
Para vereditos sobre veracidade, consulte fact-checkers reconhecidos
(Lupa, Aos Fatos, Comprova, Estadão Verifica) — linkados quando disponíveis
em cada declaração.
````

- [ ] **Step 5: Commit**

```bash
git add docs/CONTRIBUTING.md docs/CODE_OF_CONDUCT.md docs/SECURITY.md docs/GOVERNANCE.md
git commit -m "docs(governance): adicionar CONTRIBUTING, CODE_OF_CONDUCT, SECURITY, GOVERNANCE"
```

---

### Task 8: Adicionar issue templates e PR template

**Spec ref:** Seção 10.3 (issue templates)

**Files:**
- Create: `.github/ISSUE_TEMPLATE/bug.yml`
- Create: `.github/ISSUE_TEMPLATE/duvida.yml`
- Create: `.github/pull_request_template.md`

Nota: templates de "correção-factual.yml" e "fonte-sugerida.yml" entram na Fase 3 (quando há conteúdo público para corrigir). Aqui criamos só os dois iniciais.

- [ ] **Step 1: Criar bug.yml**

Cria `.github/ISSUE_TEMPLATE/bug.yml`:

```yaml
name: 🐛 Bug técnico
description: Reportar bug no site, scripts ou infraestrutura do Atlas.
title: "[bug] "
labels: ["bug", "triage"]
body:
  - type: markdown
    attributes:
      value: |
        Obrigado por reportar. Este template é para bugs técnicos.
        Para erros de conteúdo (citações, timestamps), use **Correção factual**.

  - type: textarea
    id: description
    attributes:
      label: Descrição do bug
      description: O que está acontecendo? O que você esperava que acontecesse?
      placeholder: |
        Esperado: ...
        Atual: ...
    validations:
      required: true

  - type: textarea
    id: reproduction
    attributes:
      label: Passos para reproduzir
      placeholder: |
        1. Acessar URL ...
        2. Clicar em ...
        3. Ver erro
    validations:
      required: true

  - type: input
    id: url
    attributes:
      label: URL onde ocorre
      placeholder: https://...
    validations:
      required: false

  - type: input
    id: browser
    attributes:
      label: Navegador e versão
      placeholder: Chrome 130, Firefox 132, Safari 17
    validations:
      required: false

  - type: textarea
    id: console
    attributes:
      label: Erros no console (se houver)
      render: text
    validations:
      required: false
```

- [ ] **Step 2: Criar duvida.yml**

Cria `.github/ISSUE_TEMPLATE/duvida.yml`:

```yaml
name: ❓ Dúvida
description: Pergunta sobre metodologia, projeto ou uso.
title: "[dúvida] "
labels: ["question"]
body:
  - type: markdown
    attributes:
      value: |
        Antes de abrir, confira `docs/METODOLOGIA.md` (Fase 3+) e `docs/GOVERNANCE.md`.

  - type: textarea
    id: question
    attributes:
      label: Sua dúvida
    validations:
      required: true

  - type: textarea
    id: context
    attributes:
      label: Contexto (opcional)
      description: Onde você encontrou o tema da sua dúvida.
```

- [ ] **Step 3: Criar pull_request_template.md**

Cria `.github/pull_request_template.md`:

```markdown
## Descrição

<!-- O que este PR faz? Por quê? -->

## Tipo

- [ ] `feat` — nova funcionalidade
- [ ] `fix` — correção de bug
- [ ] `docs` — apenas documentação
- [ ] `chore` — manutenção
- [ ] `data` — adição/edição de declaração, evento, candidato, tema

## Checklist

- [ ] Commits seguem [Conventional Commits PT-BR](https://www.conventionalcommits.org/)
- [ ] `pnpm lint` passou
- [ ] `pnpm typecheck` passou
- [ ] `pnpm test` passou
- [ ] `pnpm validate-data` passou (se tocou em `data/`)
- [ ] PR linka issue relacionada (se houver): Closes #

## Para PRs de dados

- [ ] Fonte primária linkada
- [ ] Timestamp registrado (se vídeo/áudio)
- [ ] Wayback URL incluída
- [ ] Tema principal atribuído
- [ ] `tipo_estrutural` preenchido

## Notas para revisor (opcional)
```

- [ ] **Step 4: Commit**

```bash
git add .github/
git commit -m "ci: adicionar issue templates (bug, dúvida) e PR template"
```

---

# SPRINT 1 — Infra Base de Layouts

Estabelece sistema de layouts, header, footer, componentes shared, página 404. Ao final: navegação básica funciona com tipografia premium e densidade controlada.

---

### Task 9: Criar BaseLayout

**Spec ref:** Seção 8 (interface), Seção 8.2 (visual identity)

**Files:**
- Create: `src/components/layout/BaseLayout.astro`
- Modify: `src/pages/index.astro`

- [ ] **Step 1: Criar BaseLayout.astro**

Cria `src/components/layout/BaseLayout.astro`:

```astro
---
import "@styles/global.css";
import Header from "@components/layout/Header.astro";
import Footer from "@components/layout/Footer.astro";
import SkipLink from "@components/shared/SkipLink.astro";

interface Props {
  title: string;
  description?: string;
  canonicalUrl?: string;
  noindex?: boolean;
}

const {
  title,
  description = "Memória factual da eleição presidencial brasileira de 2026. Declarações com fonte primária. Sem julgamento editorial.",
  canonicalUrl,
  noindex = false,
} = Astro.props;

const fullTitle = title === "Atlas dos Candidatos 2026"
  ? title
  : `${title} · Atlas dos Candidatos 2026`;

const canonical = canonicalUrl ?? new URL(Astro.url.pathname, Astro.site).toString();
---
<!doctype html>
<html lang="pt-BR">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="generator" content={Astro.generator} />

    <title>{fullTitle}</title>
    <meta name="description" content={description} />
    <link rel="canonical" href={canonical} />

    {noindex && <meta name="robots" content="noindex" />}

    <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
  </head>
  <body>
    <SkipLink />
    <Header />
    <main id="main-content" tabindex="-1">
      <slot />
    </main>
    <Footer />
  </body>
</html>
```

- [ ] **Step 2: Atualizar index.astro para usar BaseLayout**

```astro
---
import BaseLayout from "@components/layout/BaseLayout.astro";
---
<BaseLayout title="Atlas dos Candidatos 2026">
  <section class="container-narrow" style="padding-block: var(--space-10);">
    <h1>Atlas dos Candidatos 2026</h1>
    <p style="margin-top: var(--space-4); color: var(--color-fg-muted); font-size: var(--text-lg);">
      Memória factual da eleição presidencial brasileira de 2026.
      Declarações com fonte primária. Sem julgamento editorial.
    </p>
  </section>
</BaseLayout>
```

- [ ] **Step 3: Commit (depois de criar Header, Footer, SkipLink — próximas tasks)**

Aguardar até Task 12 para commitar tudo junto.

---

### Task 10: Criar Header + Footer

**Spec ref:** Seção 8.3 (layout home), Seção 8.2 (densidade alta + microinterações)

**Files:**
- Create: `src/components/layout/Header.astro`
- Create: `src/components/layout/Footer.astro`

- [ ] **Step 1: Criar Header.astro**

```astro
---
const currentPath = Astro.url.pathname;

const navItems = [
  { href: "/candidatos", label: "Candidatos" },
  { href: "/temas", label: "Temas" },
  { href: "/eventos", label: "Eventos" },
  { href: "/dataset", label: "Dataset" },
  { href: "/metodologia", label: "Metodologia" },
];

const isActive = (href: string) =>
  href === "/"
    ? currentPath === "/"
    : currentPath.startsWith(href);
---
<header
  role="banner"
  style="
    border-bottom: 1px solid var(--color-border);
    background-color: var(--color-bg-elevated);
    position: sticky;
    top: 0;
    z-index: 50;
    backdrop-filter: saturate(140%) blur(8px);
  "
>
  <div
    class="container-wide"
    style="
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding-block: var(--space-3);
      gap: var(--space-6);
    "
  >
    <a
      href="/"
      style="
        font-weight: var(--weight-semibold);
        font-size: var(--text-lg);
        letter-spacing: -0.02em;
        text-decoration: none;
      "
      aria-label="Atlas — página inicial"
    >
      Atlas <span style="color: var(--color-fg-muted); font-weight: var(--weight-regular);">2026</span>
    </a>

    <nav aria-label="Navegação principal" style="display: flex; gap: var(--space-5);">
      {navItems.map((item) => (
        <a
          href={item.href}
          aria-current={isActive(item.href) ? "page" : undefined}
          style={`
            font-size: var(--text-sm);
            text-decoration: none;
            color: ${isActive(item.href) ? "var(--color-fg)" : "var(--color-fg-muted)"};
            font-weight: ${isActive(item.href) ? "var(--weight-medium)" : "var(--weight-regular)"};
            transition: color var(--transition-fast);
          `}
        >
          {item.label}
        </a>
      ))}
    </nav>

    <div style="display: flex; gap: var(--space-3); align-items: center;">
      <a
        href="/buscar"
        style="
          font-size: var(--text-sm);
          color: var(--color-fg-muted);
          text-decoration: none;
        "
        aria-label="Buscar"
      >
        Buscar
      </a>
      <a
        href="https://github.com/atlas2026"
        rel="noopener external"
        style="
          font-size: var(--text-sm);
          color: var(--color-fg-muted);
          text-decoration: none;
        "
      >
        GitHub
      </a>
    </div>
  </div>
</header>
```

Nota: URL do GitHub é placeholder; ajustar na Fase 3 quando repo público for criado.

- [ ] **Step 2: Criar Footer.astro**

```astro
---
const year = new Date().getFullYear();
---
<footer
  role="contentinfo"
  style="
    border-top: 1px solid var(--color-border);
    margin-top: var(--space-12);
    padding-block: var(--space-8);
    background-color: var(--color-bg-muted);
  "
>
  <div
    class="container-wide"
    style="
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
      gap: var(--space-6);
    "
  >
    <div>
      <p style="font-weight: var(--weight-semibold); margin-bottom: var(--space-2);">Atlas dos Candidatos 2026</p>
      <p style="color: var(--color-fg-muted); font-size: var(--text-sm); line-height: 1.5;">
        Infraestrutura factual da eleição presidencial brasileira de 2026.
      </p>
    </div>

    <div>
      <p style="font-weight: var(--weight-medium); margin-bottom: var(--space-2); font-size: var(--text-sm);">Navegar</p>
      <ul style="list-style: none; padding: 0; display: flex; flex-direction: column; gap: var(--space-1); font-size: var(--text-sm);">
        <li><a href="/candidatos">Candidatos</a></li>
        <li><a href="/temas">Temas</a></li>
        <li><a href="/eventos">Eventos</a></li>
        <li><a href="/dataset">Dataset</a></li>
      </ul>
    </div>

    <div>
      <p style="font-weight: var(--weight-medium); margin-bottom: var(--space-2); font-size: var(--text-sm);">Projeto</p>
      <ul style="list-style: none; padding: 0; display: flex; flex-direction: column; gap: var(--space-1); font-size: var(--text-sm);">
        <li><a href="/metodologia">Metodologia</a></li>
        <li><a href="/sobre">Sobre</a></li>
        <li><a href="/contribuir">Contribuir</a></li>
      </ul>
    </div>

    <div>
      <p style="font-weight: var(--weight-medium); margin-bottom: var(--space-2); font-size: var(--text-sm);">Open-source</p>
      <ul style="list-style: none; padding: 0; display: flex; flex-direction: column; gap: var(--space-1); font-size: var(--text-sm);">
        <li><a href="https://github.com/atlas2026" rel="noopener external">GitHub</a></li>
        <li>Código MIT</li>
        <li>Dataset CC-BY 4.0</li>
      </ul>
    </div>
  </div>

  <div
    class="container-wide"
    style="
      margin-top: var(--space-6);
      padding-top: var(--space-4);
      border-top: 1px solid var(--color-border);
      display: flex;
      flex-wrap: wrap;
      justify-content: space-between;
      gap: var(--space-3);
      color: var(--color-fg-subtle);
      font-size: var(--text-xs);
    "
  >
    <p>© {year} Atlas dos Candidatos 2026</p>
    <p>O Atlas não é um fact-checker. É infraestrutura factual.</p>
  </div>
</footer>
```

- [ ] **Step 3: Verificar build**

```bash
pnpm dev
```

Expected: header sticky aparece no topo, footer aparece no rodapé com 4 colunas. Encerra com Ctrl+C.

- [ ] **Step 4: Commit (junto com Tasks 11 e 12 — próximas)**

---

### Task 11: Componentes shared (Disclaimer, Tag, SkipLink)

**Spec ref:** Seção 13 (riscos — disclaimer prominente)

**Files:**
- Create: `src/components/shared/Disclaimer.astro`
- Create: `src/components/shared/Tag.astro`
- Create: `src/components/shared/SkipLink.astro`

- [ ] **Step 1: Criar SkipLink.astro (a11y)**

```astro
---
---
<a
  href="#main-content"
  style="
    position: absolute;
    left: -9999px;
    top: 0;
    z-index: 100;
    padding: var(--space-2) var(--space-4);
    background-color: var(--color-bg-elevated);
    color: var(--color-fg);
    text-decoration: none;
    border-radius: var(--radius);
    border: 2px solid var(--color-focus);
    font-weight: var(--weight-medium);
  "
  onfocus="this.style.left='var(--space-3)'; this.style.top='var(--space-3)';"
  onblur="this.style.left='-9999px';"
>
  Pular para conteúdo principal
</a>
```

- [ ] **Step 2: Criar Disclaimer.astro**

```astro
---
interface Props {
  variant?: "default" | "prominent" | "inline";
}
const { variant = "default" } = Astro.props;

const styles = {
  default: "padding: var(--space-3) var(--space-4); border: 1px solid var(--color-border); border-radius: var(--radius); background-color: var(--color-bg-muted); font-size: var(--text-sm); color: var(--color-fg-muted);",
  prominent: "padding: var(--space-4) var(--space-5); border-left: 3px solid var(--color-accent); background-color: var(--color-accent-muted); font-size: var(--text-base);",
  inline: "font-size: var(--text-xs); color: var(--color-fg-subtle);",
};
---
<aside role="note" aria-label="Aviso" style={styles[variant]}>
  <slot>
    <strong style="font-weight: var(--weight-medium);">Atlas não é um fact-checker.</strong>
    O Atlas apresenta declarações com fonte primária linkada, sem emitir
    veredito sobre veracidade. Quando há veredito de fact-checker reconhecido
    (Lupa, Aos Fatos, Comprova, etc), apresentamos com atribuição.
  </slot>
</aside>
```

- [ ] **Step 3: Criar Tag.astro**

```astro
---
interface Props {
  href?: string;
  variant?: "default" | "structural" | "neutral";
  size?: "sm" | "md";
}
const { href, variant = "default", size = "sm" } = Astro.props;

const baseStyle = `
  display: inline-flex;
  align-items: center;
  gap: var(--space-1);
  font-family: var(--font-mono);
  text-decoration: none;
  border-radius: var(--radius-sm);
  font-weight: var(--weight-medium);
  letter-spacing: 0;
  transition: all var(--transition-fast);
`;

const sizeStyle = size === "sm"
  ? "padding: 2px 6px; font-size: var(--text-xs);"
  : "padding: 4px 8px; font-size: var(--text-sm);";

const variantStyle = {
  default: "background-color: var(--color-bg-muted); color: var(--color-fg-muted); border: 1px solid var(--color-border);",
  structural: "background-color: var(--color-accent-muted); color: var(--color-accent-fg); border: 1px solid var(--color-accent);",
  neutral: "background-color: transparent; color: var(--color-fg-subtle); border: 1px solid var(--color-border);",
}[variant];

const fullStyle = `${baseStyle} ${sizeStyle} ${variantStyle}`;
const Tag = href ? "a" : "span";
---
<Tag href={href} style={fullStyle}>
  <slot />
</Tag>
```

- [ ] **Step 4: Verificar componentes na home**

Atualiza `src/pages/index.astro`:

```astro
---
import BaseLayout from "@components/layout/BaseLayout.astro";
import Disclaimer from "@components/shared/Disclaimer.astro";
import Tag from "@components/shared/Tag.astro";
---
<BaseLayout title="Atlas dos Candidatos 2026">
  <section class="container-narrow" style="padding-block: var(--space-10);">
    <h1>Atlas dos Candidatos 2026</h1>
    <p style="margin-top: var(--space-4); color: var(--color-fg-muted); font-size: var(--text-lg); max-width: 60ch;">
      Memória factual da eleição presidencial brasileira de 2026.
      Declarações com fonte primária. Sem julgamento editorial.
    </p>

    <div style="margin-top: var(--space-6); display: flex; gap: var(--space-2); flex-wrap: wrap;">
      <Tag>economia</Tag>
      <Tag>saúde</Tag>
      <Tag variant="structural">promessa</Tag>
      <Tag variant="structural">dado_numerico</Tag>
    </div>

    <div style="margin-top: var(--space-8);">
      <Disclaimer variant="prominent" />
    </div>
  </section>
</BaseLayout>
```

```bash
pnpm dev
```

Expected: tags renderizadas em monoespaçada, Disclaimer prominente com borda accent.

- [ ] **Step 5: Commit (Tasks 9-12)**

Aguardar Task 12.

---

### Task 12: Criar página 404

**Spec ref:** Princípio 5 (URLs nunca quebram)

**Files:**
- Create: `src/pages/404.astro`

- [ ] **Step 1: Criar 404.astro**

```astro
---
import BaseLayout from "@components/layout/BaseLayout.astro";
---
<BaseLayout title="Página não encontrada" noindex>
  <section
    class="container-narrow"
    style="padding-block: var(--space-12); text-align: center;"
  >
    <p
      style="
        font-family: var(--font-mono);
        font-size: var(--text-sm);
        color: var(--color-fg-subtle);
        letter-spacing: 0.05em;
        text-transform: uppercase;
      "
    >
      Erro 404
    </p>
    <h1 style="margin-top: var(--space-3);">Página não encontrada</h1>
    <p
      style="
        margin-top: var(--space-4);
        color: var(--color-fg-muted);
        font-size: var(--text-lg);
      "
    >
      O endereço que você tentou acessar não existe ou foi movido.
    </p>

    <nav
      style="
        margin-top: var(--space-8);
        display: flex;
        gap: var(--space-3);
        justify-content: center;
        flex-wrap: wrap;
      "
      aria-label="Páginas alternativas"
    >
      <a href="/" style="font-size: var(--text-sm);">Página inicial</a>
      <span aria-hidden="true" style="color: var(--color-fg-subtle);">·</span>
      <a href="/candidatos" style="font-size: var(--text-sm);">Candidatos</a>
      <span aria-hidden="true" style="color: var(--color-fg-subtle);">·</span>
      <a href="/buscar" style="font-size: var(--text-sm);">Buscar</a>
    </nav>
  </section>
</BaseLayout>
```

- [ ] **Step 2: Verificar 404**

```bash
pnpm dev
```

Acessa `http://localhost:4321/rota-inexistente`. Expected: página 404 estilizada.

- [ ] **Step 3: Commit (consolidado Tasks 9-12)**

```bash
git add src/components/layout/ src/components/shared/ src/pages/
git commit -m "feat(layout): adicionar BaseLayout, Header, Footer, Disclaimer, Tag, 404"
```

---

### Task 13: View Transitions API + favicon

**Spec ref:** Seção 8.2 (microinterações)

**Files:**
- Modify: `src/components/layout/BaseLayout.astro`
- Create: `public/favicon.svg`
- Create: `public/humans.txt`

- [ ] **Step 1: Adicionar ClientRouter (View Transitions) ao BaseLayout**

Modifica `src/components/layout/BaseLayout.astro` adicionando o `<ClientRouter />` no `<head>`:

```astro
---
import "@styles/global.css";
import { ClientRouter } from "astro:transitions";
import Header from "@components/layout/Header.astro";
import Footer from "@components/layout/Footer.astro";
import SkipLink from "@components/shared/SkipLink.astro";

interface Props {
  title: string;
  description?: string;
  canonicalUrl?: string;
  noindex?: boolean;
}

const {
  title,
  description = "Memória factual da eleição presidencial brasileira de 2026. Declarações com fonte primária. Sem julgamento editorial.",
  canonicalUrl,
  noindex = false,
} = Astro.props;

const fullTitle = title === "Atlas dos Candidatos 2026"
  ? title
  : `${title} · Atlas dos Candidatos 2026`;

const canonical = canonicalUrl ?? new URL(Astro.url.pathname, Astro.site).toString();
---
<!doctype html>
<html lang="pt-BR">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="generator" content={Astro.generator} />

    <title>{fullTitle}</title>
    <meta name="description" content={description} />
    <link rel="canonical" href={canonical} />

    {noindex && <meta name="robots" content="noindex" />}

    <link rel="icon" type="image/svg+xml" href="/favicon.svg" />

    <ClientRouter />
  </head>
  <body>
    <SkipLink />
    <Header />
    <main id="main-content" tabindex="-1">
      <slot />
    </main>
    <Footer />
  </body>
</html>
```

- [ ] **Step 2: Criar favicon.svg minimalista**

Cria `public/favicon.svg`:

```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">
  <rect width="32" height="32" rx="6" fill="#1a1a1a"/>
  <text
    x="16"
    y="22"
    font-family="ui-monospace, SFMono-Regular, monospace"
    font-size="18"
    font-weight="600"
    text-anchor="middle"
    fill="#ffffff"
  >A</text>
</svg>
```

- [ ] **Step 3: Criar humans.txt**

Cria `public/humans.txt`:

```
/* TEAM */
Atlas dos Candidatos 2026
Site: atlas2026.example.com
Source: github.com/atlas2026

/* THANKS */
Lupa, Aos Fatos, Comprova, Estadão Verifica
TSE, Câmara, Senado
Astro, Tailwind, shadcn/ui, Vercel
```

- [ ] **Step 4: Commit**

```bash
git add src/components/layout/BaseLayout.astro public/favicon.svg public/humans.txt
git commit -m "feat(ux): adicionar View Transitions, favicon, humans.txt"
```

---

# SPRINT 2 — Modelo de Dados

Estabelece schemas Zod, Astro Content Collections, geração de JSON Schemas, scripts de validação e CI. Ao final: schemas validam, tipos derivam automaticamente, CI bloqueia PRs com dados inválidos.

---

### Task 14: Setup Vitest com testes utilitários iniciais

**Spec ref:** Seção 16 (TEP)

**Files:**
- Create: `src/lib/utils/slugify.ts`
- Create: `src/lib/utils/format-date.ts`
- Create: `src/lib/utils/truncate.ts`
- Create: `tests/unit/slugify.test.ts`
- Create: `tests/unit/format-date.test.ts`
- Create: `tests/unit/truncate.test.ts`

- [ ] **Step 1: Escrever teste falho de slugify**

Cria `tests/unit/slugify.test.ts`:

```ts
import { describe, it, expect } from "vitest";
import { slugify } from "@/lib/utils/slugify";

describe("slugify", () => {
  it("converte string simples para slug", () => {
    expect(slugify("Hello World")).toBe("hello-world");
  });

  it("remove acentos portugueses", () => {
    expect(slugify("São Paulo")).toBe("sao-paulo");
    expect(slugify("educação")).toBe("educacao");
    expect(slugify("açúcar e atenção")).toBe("acucar-e-atencao");
  });

  it("remove caracteres especiais", () => {
    expect(slugify("R$ 1.000,00!")).toBe("r-1-000-00");
    expect(slugify("E-mail@domínio.com")).toBe("e-mail-dominio-com");
  });

  it("colapsa múltiplos espaços e hifens", () => {
    expect(slugify("a  b   c")).toBe("a-b-c");
    expect(slugify("a---b")).toBe("a-b");
  });

  it("remove hifens das pontas", () => {
    expect(slugify("--abc--")).toBe("abc");
    expect(slugify("   xyz   ")).toBe("xyz");
  });

  it("retorna string vazia para entrada vazia", () => {
    expect(slugify("")).toBe("");
    expect(slugify("   ")).toBe("");
  });

  it("preserva números", () => {
    expect(slugify("Sprint 2026")).toBe("sprint-2026");
  });
});
```

- [ ] **Step 2: Rodar teste e verificar falha**

```bash
pnpm test
```

Expected: FAIL com erro "Cannot find module '@/lib/utils/slugify'" ou similar.

- [ ] **Step 3: Implementar slugify**

Cria `src/lib/utils/slugify.ts`:

```ts
export function slugify(input: string): string {
  return input
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}
```

- [ ] **Step 4: Rodar teste e verificar passa**

```bash
pnpm test
```

Expected: 7 testes passam.

- [ ] **Step 5: Escrever testes de format-date**

Cria `tests/unit/format-date.test.ts`:

```ts
import { describe, it, expect } from "vitest";
import { formatDateBR, formatDateLong, formatRelative } from "@/lib/utils/format-date";

describe("formatDateBR", () => {
  it("formata data ISO em dd/mm/aaaa", () => {
    expect(formatDateBR("2026-11-02T21:34:00.000Z")).toBe("02/11/2026");
  });

  it("formata Date object", () => {
    expect(formatDateBR(new Date(2026, 10, 2))).toBe("02/11/2026");
  });
});

describe("formatDateLong", () => {
  it("formata por extenso em PT-BR", () => {
    expect(formatDateLong("2026-11-02T12:00:00.000Z")).toMatch(/02 de novembro de 2026/);
  });
});

describe("formatRelative", () => {
  it("retorna 'hoje' para data atual", () => {
    expect(formatRelative(new Date())).toBe("hoje");
  });

  it("retorna 'ontem' para 1 dia atrás", () => {
    const ontem = new Date();
    ontem.setDate(ontem.getDate() - 1);
    expect(formatRelative(ontem)).toBe("ontem");
  });

  it("retorna 'há X dias' para 2-29 dias atrás", () => {
    const haDias = new Date();
    haDias.setDate(haDias.getDate() - 5);
    expect(formatRelative(haDias)).toBe("há 5 dias");
  });
});
```

- [ ] **Step 6: Implementar format-date**

Cria `src/lib/utils/format-date.ts`:

```ts
function toDate(input: string | Date): Date {
  return input instanceof Date ? input : new Date(input);
}

export function formatDateBR(input: string | Date): string {
  const d = toDate(input);
  const dia = String(d.getUTCDate()).padStart(2, "0");
  const mes = String(d.getUTCMonth() + 1).padStart(2, "0");
  const ano = d.getUTCFullYear();
  return `${dia}/${mes}/${ano}`;
}

export function formatDateLong(input: string | Date): string {
  const d = toDate(input);
  return d.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });
}

export function formatRelative(input: string | Date): string {
  const d = toDate(input);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return "hoje";
  if (diffDays === 1) return "ontem";
  if (diffDays < 30) return `há ${diffDays} dias`;
  if (diffDays < 365) {
    const meses = Math.floor(diffDays / 30);
    return `há ${meses} mês${meses === 1 ? "" : "es"}`;
  }
  const anos = Math.floor(diffDays / 365);
  return `há ${anos} ano${anos === 1 ? "" : "s"}`;
}
```

- [ ] **Step 7: Escrever e implementar truncate**

Cria `tests/unit/truncate.test.ts`:

```ts
import { describe, it, expect } from "vitest";
import { truncate } from "@/lib/utils/truncate";

describe("truncate", () => {
  it("retorna texto curto sem alteração", () => {
    expect(truncate("abc", 10)).toBe("abc");
  });

  it("trunca texto longo e adiciona ellipsis", () => {
    expect(truncate("Lorem ipsum dolor sit amet", 11)).toBe("Lorem ipsum…");
  });

  it("não corta no meio de palavra", () => {
    expect(truncate("Lorem ipsum dolor sit amet", 13)).toBe("Lorem ipsum…");
  });

  it("respeita maxLength exato em limites de palavra", () => {
    expect(truncate("uma duas tres quatro", 8)).toBe("uma duas…");
  });

  it("retorna string vazia para entrada vazia", () => {
    expect(truncate("", 10)).toBe("");
  });
});
```

Cria `src/lib/utils/truncate.ts`:

```ts
export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;

  const cut = text.slice(0, maxLength);
  const lastSpace = cut.lastIndexOf(" ");

  if (lastSpace > 0) {
    return cut.slice(0, lastSpace) + "…";
  }
  return cut + "…";
}
```

- [ ] **Step 8: Rodar todos os testes**

```bash
pnpm test
```

Expected: todos os testes passam (slugify 7 + format-date 5 + truncate 5 = 17 testes).

- [ ] **Step 9: Commit**

```bash
git add src/lib/utils/ tests/unit/
git commit -m "feat(utils): adicionar slugify, format-date, truncate com testes Vitest"
```

---

### Task 15: Criar schemas Zod para entidades

**Spec ref:** Seção 5 (modelo de dados completo)

**Files:**
- Create: `src/content/config.ts`
- Create: `src/types/index.ts`

- [ ] **Step 1: Instalar Zod e ulid**

```bash
pnpm add zod ulid
pnpm add -D zod-to-json-schema
```

- [ ] **Step 2: Criar src/content/config.ts com todos os schemas**

Astro 5 usa Content Collections com glob loaders. Crava todos os schemas em um arquivo:

```ts
import { defineCollection, z, reference } from "astro:content";
import { glob } from "astro/loaders";

const fonteTipoEnum = z.enum([
  "youtube_oficial",
  "tse",
  "camara",
  "senado",
  "diario_oficial",
  "midia_consolidada",
  "rede_social_oficial",
]);

const tipoEstruturalEnum = z.enum([
  "promessa",
  "dado_numerico",
  "atribuicao_a_terceiro",
  "afirmacao_historica",
  "comparacao",
  "afirmacao_sobre_pesquisa",
  "compromisso_politico",
  "interpretacao_pessoal",
]);

const eventoTipoEnum = z.enum([
  "debate",
  "entrevista",
  "comicio",
  "post_rede_social",
  "sabatina",
  "declaracao_oficial",
]);

const veiculoVeredito = z.enum([
  "Lupa",
  "Aos Fatos",
  "Comprova",
  "Estadão Verifica",
  "Agência Pública",
  "BBC Verify",
  "outro",
]);

const contaOficialSchema = z.object({
  plataforma: z.enum(["youtube", "x", "instagram", "facebook", "tiktok"]),
  handle: z.string().min(1),
  url: z.string().url(),
  verificada: z.boolean(),
});

const candidatos = defineCollection({
  loader: glob({ base: "./data/candidatos", pattern: "*.yaml" }),
  schema: z.object({
    id: z.string().min(1),
    slug: z.string().regex(/^[a-z0-9-]+$/),
    nome: z.string().min(1),
    foto_url: z.string().url().optional(),
    partido: z.string().min(1),
    biografia_minima: z.string().min(10).max(500),
    contas_oficiais: z.array(contaOficialSchema).default([]),
    criado_em: z.string().datetime(),
    atualizado_em: z.string().datetime(),
  }),
});

const temas = defineCollection({
  loader: glob({ base: "./data/temas", pattern: "*.yaml" }),
  schema: z.object({
    id: z.string().min(1),
    slug: z.string().regex(/^[a-z0-9-]+$/),
    nome: z.string().min(1),
    descricao_curta: z.string().min(10).max(280),
    nivel: z.enum(["primario", "secundario"]),
    tema_pai_id: z.string().nullable().optional(),
  }),
});

const eventos = defineCollection({
  loader: glob({ base: "./data/eventos", pattern: "*.yaml" }),
  schema: z.object({
    id: z.string().min(1),
    titulo: z.string().min(1),
    data: z.string().datetime(),
    tipo: eventoTipoEnum,
    local: z.object({
      fisico: z.string().nullable(),
      digital: z.string().nullable(),
    }),
    duracao_minutos: z.number().int().positive().nullable(),
    fonte_primaria_url: z.string().url(),
    fonte_primaria_tipo: fonteTipoEnum,
    archive_url: z.string().url(),
    candidatos_envolvidos: z.array(
      z.object({ candidato_id: z.string().min(1) }),
    ).min(1),
    descricao: z.string().min(10),
    criado_em: z.string().datetime(),
    atualizado_em: z.string().datetime(),
  }),
});

const declaracoes = defineCollection({
  loader: glob({ base: "./data/declaracoes", pattern: "*.md" }),
  schema: z.object({
    id: z.string().min(1),
    slug: z.string().regex(/^[a-z0-9-]+$/),
    candidato_id: z.string().min(1),
    evento_id: z.string().min(1),

    texto: z.string().min(1),
    timestamp_no_evento: z.string().regex(/^\d{2}:\d{2}:\d{2}$/).nullable(),
    contexto: z.string().min(10).max(500),

    tema_principal: z.string().min(1),
    temas_secundarios: z.array(z.string()).default([]),

    tipo_estrutural: z.array(tipoEstruturalEnum).min(1),

    fonte_primaria_url: z.string().url(),
    fonte_primaria_tipo: fonteTipoEnum,
    archive_url: z.string().url(),
    snapshot_interno_path: z.string().nullable().optional(),

    contexto_adicional: z.object({
      texto: z.string().min(10),
      fontes: z.array(
        z.object({
          tipo: z.string().min(1),
          url: z.string().url(),
          data: z.string().datetime(),
        }),
      ).min(1),
    }).nullable().optional(),

    vereditos_externos: z.array(
      z.object({
        veiculo: veiculoVeredito,
        classificacao: z.string().min(1),
        url: z.string().url(),
        data: z.string().datetime(),
        citacao_curta: z.string().min(1).max(300),
      }),
    ).default([]),

    versao: z.number().int().positive(),
    criado_em: z.string().datetime(),
    atualizado_em: z.string().datetime(),
  }),
});

export const collections = {
  candidatos,
  temas,
  eventos,
  declaracoes,
};
```

- [ ] **Step 3: Criar src/types/index.ts (reexport de tipos derivados)**

```ts
import type { CollectionEntry } from "astro:content";

export type Candidato = CollectionEntry<"candidatos">;
export type Tema = CollectionEntry<"temas">;
export type Evento = CollectionEntry<"eventos">;
export type Declaracao = CollectionEntry<"declaracoes">;

export type CandidatoData = Candidato["data"];
export type TemaData = Tema["data"];
export type EventoData = Evento["data"];
export type DeclaracaoData = Declaracao["data"];

export type FonteTipo =
  | "youtube_oficial"
  | "tse"
  | "camara"
  | "senado"
  | "diario_oficial"
  | "midia_consolidada"
  | "rede_social_oficial";

export type TipoEstrutural =
  | "promessa"
  | "dado_numerico"
  | "atribuicao_a_terceiro"
  | "afirmacao_historica"
  | "comparacao"
  | "afirmacao_sobre_pesquisa"
  | "compromisso_politico"
  | "interpretacao_pessoal";

export type EventoTipo =
  | "debate"
  | "entrevista"
  | "comicio"
  | "post_rede_social"
  | "sabatina"
  | "declaracao_oficial";
```

- [ ] **Step 4: Verificar typecheck**

```bash
pnpm typecheck
```

Expected: passa sem erros (collections vazias mas schemas válidos).

- [ ] **Step 5: Commit**

```bash
git add package.json pnpm-lock.yaml src/content/config.ts src/types/index.ts
git commit -m "feat(data): adicionar schemas Zod para Candidato, Tema, Evento, Declaração"
```

---

### Task 16: Criar dados iniciais de Temas

**Spec ref:** Seção 5.4 (modelo Tema)

**Files:**
- Create: `data/temas/economia.yaml`
- Create: `data/temas/saude.yaml`
- Create: `data/temas/seguranca-publica.yaml`
- Create: `data/temas/educacao.yaml`
- Create: `data/temas/meio-ambiente.yaml`
- Create: `data/temas/politica-externa.yaml`

- [ ] **Step 1: Criar 6 temas primários iniciais**

Para cada arquivo abaixo, o nome do arquivo deve coincidir com o `slug`.

`data/temas/economia.yaml`:
```yaml
id: TEMA_ECONOMIA
slug: economia
nome: Economia
descricao_curta: Inflação, juros, câmbio, política fiscal, impostos, crescimento e mercado de trabalho.
nivel: primario
tema_pai_id: null
```

`data/temas/saude.yaml`:
```yaml
id: TEMA_SAUDE
slug: saude
nome: Saúde
descricao_curta: SUS, planos de saúde, medicamentos, vacinação, gestão hospitalar e políticas sanitárias.
nivel: primario
tema_pai_id: null
```

`data/temas/seguranca-publica.yaml`:
```yaml
id: TEMA_SEGURANCA_PUBLICA
slug: seguranca-publica
nome: Segurança Pública
descricao_curta: Polícia, sistema prisional, combate ao crime organizado, drogas e violência urbana.
nivel: primario
tema_pai_id: null
```

`data/temas/educacao.yaml`:
```yaml
id: TEMA_EDUCACAO
slug: educacao
nome: Educação
descricao_curta: Ensino básico, médio, superior, financiamento educacional, professores e estrutura escolar.
nivel: primario
tema_pai_id: null
```

`data/temas/meio-ambiente.yaml`:
```yaml
id: TEMA_MEIO_AMBIENTE
slug: meio-ambiente
nome: Meio Ambiente
descricao_curta: Amazônia, desmatamento, clima, emissões, agronegócio sustentável e povos originários.
nivel: primario
tema_pai_id: null
```

`data/temas/politica-externa.yaml`:
```yaml
id: TEMA_POLITICA_EXTERNA
slug: politica-externa
nome: Política Externa
descricao_curta: Diplomacia, blocos econômicos, relações bilaterais e posicionamento em organismos internacionais.
nivel: primario
tema_pai_id: null
```

- [ ] **Step 2: Verificar Content Collections lê os temas**

```bash
pnpm dev
```

Expected: sem erros de validação ao buildar. Astro detecta os 6 arquivos.

```bash
pnpm typecheck
```

Expected: passa.

- [ ] **Step 3: Commit**

```bash
git add data/temas/
git commit -m "data(temas): adicionar 6 temas primários (economia, saúde, segurança, educação, ambiente, externa)"
```

---

### Task 17: Criar data loaders

**Spec ref:** Seção 5 (modelo de dados), Seção 6.3 (arquitetura em camadas)

**Files:**
- Create: `src/lib/data/candidatos.ts`
- Create: `src/lib/data/temas.ts`
- Create: `src/lib/data/eventos.ts`
- Create: `src/lib/data/declaracoes.ts`
- Create: `tests/unit/data-loaders.test.ts`

- [ ] **Step 1: Escrever teste falho de data loaders**

Cria `tests/unit/data-loaders.test.ts`:

```ts
import { describe, it, expect } from "vitest";
import { getAllTemas, getTemaBySlug } from "@/lib/data/temas";

describe("temas loader", () => {
  it("retorna todos os temas primários", async () => {
    const temas = await getAllTemas();
    expect(temas.length).toBeGreaterThanOrEqual(6);
    expect(temas.every((t) => t.data.nivel === "primario")).toBe(true);
  });

  it("retorna tema por slug", async () => {
    const economia = await getTemaBySlug("economia");
    expect(economia).toBeDefined();
    expect(economia?.data.nome).toBe("Economia");
  });

  it("retorna undefined para slug inexistente", async () => {
    const fake = await getTemaBySlug("tema-inexistente");
    expect(fake).toBeUndefined();
  });

  it("temas ordenados por nome", async () => {
    const temas = await getAllTemas();
    const nomes = temas.map((t) => t.data.nome);
    const sorted = [...nomes].sort((a, b) => a.localeCompare(b, "pt-BR"));
    expect(nomes).toEqual(sorted);
  });
});
```

- [ ] **Step 2: Rodar teste e verificar falha**

```bash
pnpm test
```

Expected: FAIL com "Cannot find module @/lib/data/temas".

- [ ] **Step 3: Implementar loader de temas**

Cria `src/lib/data/temas.ts`:

```ts
import { getCollection, getEntry } from "astro:content";
import type { Tema } from "@types";

export async function getAllTemas(): Promise<Tema[]> {
  const temas = await getCollection("temas");
  return temas.sort((a, b) =>
    a.data.nome.localeCompare(b.data.nome, "pt-BR"),
  );
}

export async function getTemaBySlug(slug: string): Promise<Tema | undefined> {
  const temas = await getCollection("temas", ({ data }) => data.slug === slug);
  return temas[0];
}

export async function getTemaById(id: string): Promise<Tema | undefined> {
  return await getEntry("temas", id);
}
```

- [ ] **Step 4: Implementar loader de candidatos**

Cria `src/lib/data/candidatos.ts`:

```ts
import { getCollection, getEntry } from "astro:content";
import type { Candidato } from "@types";

export async function getAllCandidatos(): Promise<Candidato[]> {
  const candidatos = await getCollection("candidatos");
  return candidatos.sort((a, b) =>
    a.data.nome.localeCompare(b.data.nome, "pt-BR"),
  );
}

export async function getCandidatoBySlug(
  slug: string,
): Promise<Candidato | undefined> {
  const candidatos = await getCollection(
    "candidatos",
    ({ data }) => data.slug === slug,
  );
  return candidatos[0];
}

export async function getCandidatoById(
  id: string,
): Promise<Candidato | undefined> {
  return await getEntry("candidatos", id);
}
```

- [ ] **Step 5: Implementar loader de eventos**

Cria `src/lib/data/eventos.ts`:

```ts
import { getCollection, getEntry } from "astro:content";
import type { Evento } from "@types";

export async function getAllEventos(): Promise<Evento[]> {
  const eventos = await getCollection("eventos");
  return eventos.sort(
    (a, b) => new Date(b.data.data).getTime() - new Date(a.data.data).getTime(),
  );
}

export async function getEventoById(
  id: string,
): Promise<Evento | undefined> {
  return await getEntry("eventos", id);
}

export async function getEventosByCandidato(
  candidatoId: string,
): Promise<Evento[]> {
  const eventos = await getCollection("eventos", ({ data }) =>
    data.candidatos_envolvidos.some((c) => c.candidato_id === candidatoId),
  );
  return eventos.sort(
    (a, b) => new Date(b.data.data).getTime() - new Date(a.data.data).getTime(),
  );
}
```

- [ ] **Step 6: Implementar loader de declarações**

Cria `src/lib/data/declaracoes.ts`:

```ts
import { getCollection, getEntry } from "astro:content";
import type { Declaracao } from "@types";

export async function getAllDeclaracoes(): Promise<Declaracao[]> {
  const declaracoes = await getCollection("declaracoes");
  return declaracoes.sort(
    (a, b) =>
      new Date(b.data.criado_em).getTime() -
      new Date(a.data.criado_em).getTime(),
  );
}

export async function getDeclaracaoById(
  id: string,
): Promise<Declaracao | undefined> {
  return await getEntry("declaracoes", id);
}

export async function getDeclaracoesByCandidato(
  candidatoId: string,
): Promise<Declaracao[]> {
  const declaracoes = await getCollection(
    "declaracoes",
    ({ data }) => data.candidato_id === candidatoId,
  );
  return declaracoes.sort(
    (a, b) =>
      new Date(b.data.criado_em).getTime() -
      new Date(a.data.criado_em).getTime(),
  );
}

export async function getDeclaracoesByTema(
  temaSlug: string,
): Promise<Declaracao[]> {
  const declaracoes = await getCollection(
    "declaracoes",
    ({ data }) =>
      data.tema_principal === temaSlug ||
      data.temas_secundarios.includes(temaSlug),
  );
  return declaracoes.sort(
    (a, b) =>
      new Date(b.data.criado_em).getTime() -
      new Date(a.data.criado_em).getTime(),
  );
}

export async function getDeclaracoesByEvento(
  eventoId: string,
): Promise<Declaracao[]> {
  const declaracoes = await getCollection(
    "declaracoes",
    ({ data }) => data.evento_id === eventoId,
  );
  return declaracoes.sort((a, b) => {
    if (a.data.timestamp_no_evento && b.data.timestamp_no_evento) {
      return a.data.timestamp_no_evento.localeCompare(
        b.data.timestamp_no_evento,
      );
    }
    return 0;
  });
}
```

- [ ] **Step 7: Rodar testes**

```bash
pnpm test
```

Expected: testes de temas passam (4 testes). Total acumulado: 21 testes verdes.

- [ ] **Step 8: Commit**

```bash
git add src/lib/data/ tests/unit/data-loaders.test.ts
git commit -m "feat(data): adicionar loaders para candidatos, temas, eventos, declarações"
```

---

### Task 18: Gerar JSON Schemas a partir de Zod

**Spec ref:** Seção 11 (dataset paralelo), Seção 16 (TEP)

**Files:**
- Create: `scripts/generate-json-schemas.ts`
- Create: `data/schemas/.gitkeep`
- Modify: `package.json`

- [ ] **Step 1: Criar script de geração**

Cria `scripts/generate-json-schemas.ts`:

```ts
/* eslint-disable no-console */
import { writeFileSync, mkdirSync } from "node:fs";
import { join } from "node:path";
import { z } from "zod";
import { zodToJsonSchema } from "zod-to-json-schema";

const fonteTipoEnum = z.enum([
  "youtube_oficial",
  "tse",
  "camara",
  "senado",
  "diario_oficial",
  "midia_consolidada",
  "rede_social_oficial",
]);

const tipoEstruturalEnum = z.enum([
  "promessa",
  "dado_numerico",
  "atribuicao_a_terceiro",
  "afirmacao_historica",
  "comparacao",
  "afirmacao_sobre_pesquisa",
  "compromisso_politico",
  "interpretacao_pessoal",
]);

const eventoTipoEnum = z.enum([
  "debate",
  "entrevista",
  "comicio",
  "post_rede_social",
  "sabatina",
  "declaracao_oficial",
]);

const veiculoVeredito = z.enum([
  "Lupa",
  "Aos Fatos",
  "Comprova",
  "Estadão Verifica",
  "Agência Pública",
  "BBC Verify",
  "outro",
]);

const contaOficialSchema = z.object({
  plataforma: z.enum(["youtube", "x", "instagram", "facebook", "tiktok"]),
  handle: z.string().min(1),
  url: z.string().url(),
  verificada: z.boolean(),
});

const candidatoSchema = z.object({
  id: z.string().min(1),
  slug: z.string().regex(/^[a-z0-9-]+$/),
  nome: z.string().min(1),
  foto_url: z.string().url().optional(),
  partido: z.string().min(1),
  biografia_minima: z.string().min(10).max(500),
  contas_oficiais: z.array(contaOficialSchema).default([]),
  criado_em: z.string().datetime(),
  atualizado_em: z.string().datetime(),
});

const temaSchema = z.object({
  id: z.string().min(1),
  slug: z.string().regex(/^[a-z0-9-]+$/),
  nome: z.string().min(1),
  descricao_curta: z.string().min(10).max(280),
  nivel: z.enum(["primario", "secundario"]),
  tema_pai_id: z.string().nullable().optional(),
});

const eventoSchema = z.object({
  id: z.string().min(1),
  titulo: z.string().min(1),
  data: z.string().datetime(),
  tipo: eventoTipoEnum,
  local: z.object({
    fisico: z.string().nullable(),
    digital: z.string().nullable(),
  }),
  duracao_minutos: z.number().int().positive().nullable(),
  fonte_primaria_url: z.string().url(),
  fonte_primaria_tipo: fonteTipoEnum,
  archive_url: z.string().url(),
  candidatos_envolvidos: z
    .array(z.object({ candidato_id: z.string().min(1) }))
    .min(1),
  descricao: z.string().min(10),
  criado_em: z.string().datetime(),
  atualizado_em: z.string().datetime(),
});

const declaracaoSchema = z.object({
  id: z.string().min(1),
  slug: z.string().regex(/^[a-z0-9-]+$/),
  candidato_id: z.string().min(1),
  evento_id: z.string().min(1),
  texto: z.string().min(1),
  timestamp_no_evento: z
    .string()
    .regex(/^\d{2}:\d{2}:\d{2}$/)
    .nullable(),
  contexto: z.string().min(10).max(500),
  tema_principal: z.string().min(1),
  temas_secundarios: z.array(z.string()).default([]),
  tipo_estrutural: z.array(tipoEstruturalEnum).min(1),
  fonte_primaria_url: z.string().url(),
  fonte_primaria_tipo: fonteTipoEnum,
  archive_url: z.string().url(),
  snapshot_interno_path: z.string().nullable().optional(),
  contexto_adicional: z
    .object({
      texto: z.string().min(10),
      fontes: z
        .array(
          z.object({
            tipo: z.string().min(1),
            url: z.string().url(),
            data: z.string().datetime(),
          }),
        )
        .min(1),
    })
    .nullable()
    .optional(),
  vereditos_externos: z
    .array(
      z.object({
        veiculo: veiculoVeredito,
        classificacao: z.string().min(1),
        url: z.string().url(),
        data: z.string().datetime(),
        citacao_curta: z.string().min(1).max(300),
      }),
    )
    .default([]),
  versao: z.number().int().positive(),
  criado_em: z.string().datetime(),
  atualizado_em: z.string().datetime(),
});

const outDir = join(process.cwd(), "data", "schemas");
mkdirSync(outDir, { recursive: true });

function write(name: string, schema: z.ZodSchema): void {
  const jsonSchema = zodToJsonSchema(schema, {
    name,
    $refStrategy: "none",
  });
  const path = join(outDir, `${name}.schema.json`);
  writeFileSync(path, JSON.stringify(jsonSchema, null, 2) + "\n", "utf-8");
  console.log(`✓ ${path}`);
}

write("candidato", candidatoSchema);
write("tema", temaSchema);
write("evento", eventoSchema);
write("declaracao", declaracaoSchema);

console.log("\n✅ JSON Schemas gerados com sucesso.");
```

Nota: schemas são duplicados entre `src/content/config.ts` e `scripts/generate-json-schemas.ts`. Justificativa: `src/content/config.ts` usa imports do Astro (`astro:content`, `astro/loaders`) que não funcionam fora do build do Astro. Manter o script auto-contido evita gambiarra. Quando schemas mudarem, **atualizar nos DOIS lugares** — documentar isso em `docs/SCHEMA.md` (Task 20).

- [ ] **Step 2: Adicionar .gitkeep para preservar diretório**

```bash
touch data/schemas/.gitkeep
```

PowerShell: `New-Item -ItemType File -Force -Path "data/schemas/.gitkeep" | Out-Null`

- [ ] **Step 3: Rodar geração**

```bash
pnpm generate-schemas
```

Expected output:
```
✓ <path>/data/schemas/candidato.schema.json
✓ <path>/data/schemas/tema.schema.json
✓ <path>/data/schemas/evento.schema.json
✓ <path>/data/schemas/declaracao.schema.json

✅ JSON Schemas gerados com sucesso.
```

- [ ] **Step 4: Verificar arquivos gerados**

```bash
ls data/schemas/
```

Expected: `candidato.schema.json`, `tema.schema.json`, `evento.schema.json`, `declaracao.schema.json`.

- [ ] **Step 5: Commit**

```bash
git add scripts/generate-json-schemas.ts data/schemas/
git commit -m "feat(schemas): gerar JSON Schemas a partir de Zod (script generate-schemas)"
```

---

### Task 19: Script validate-data com Ajv

**Spec ref:** Seção 16 (TEP — schema validation no CI)

**Files:**
- Create: `scripts/validate-data.ts`
- Modify: `package.json`

- [ ] **Step 1: Instalar Ajv e yaml**

```bash
pnpm add -D ajv ajv-formats yaml gray-matter
```

- [ ] **Step 2: Criar scripts/validate-data.ts**

```ts
/* eslint-disable no-console */
import { readFileSync, readdirSync, existsSync } from "node:fs";
import { join, extname, basename } from "node:path";
import Ajv, { type ValidateFunction } from "ajv";
import addFormats from "ajv-formats";
import { parse as parseYaml } from "yaml";
import matter from "gray-matter";

const ajv = new Ajv({ allErrors: true, strict: false });
addFormats(ajv);

const SCHEMAS_DIR = join(process.cwd(), "data", "schemas");
const DATA_DIR = join(process.cwd(), "data");

const collections = [
  { dir: "candidatos", ext: ".yaml", schema: "candidato.schema.json" },
  { dir: "temas", ext: ".yaml", schema: "tema.schema.json" },
  { dir: "eventos", ext: ".yaml", schema: "evento.schema.json" },
  { dir: "declaracoes", ext: ".md", schema: "declaracao.schema.json" },
];

function loadSchema(filename: string): ValidateFunction {
  const path = join(SCHEMAS_DIR, filename);
  if (!existsSync(path)) {
    throw new Error(
      `Schema não encontrado: ${path}. Rode 'pnpm generate-schemas' antes.`,
    );
  }
  const raw = readFileSync(path, "utf-8");
  return ajv.compile(JSON.parse(raw) as object);
}

function parseFile(path: string, ext: string): unknown {
  const raw = readFileSync(path, "utf-8");
  if (ext === ".yaml") {
    return parseYaml(raw);
  }
  if (ext === ".md") {
    const { data } = matter(raw);
    return data;
  }
  throw new Error(`Extensão não suportada: ${ext}`);
}

let totalFiles = 0;
let totalErrors = 0;

for (const collection of collections) {
  const dir = join(DATA_DIR, collection.dir);
  if (!existsSync(dir)) {
    console.log(`⚠ Pulando ${collection.dir} (diretório não existe)`);
    continue;
  }

  const validate = loadSchema(collection.schema);
  const files = readdirSync(dir).filter(
    (f) => extname(f) === collection.ext && !f.startsWith("."),
  );

  if (files.length === 0) {
    console.log(`ℹ ${collection.dir}: 0 arquivos`);
    continue;
  }

  console.log(`\n📂 Validando ${collection.dir} (${files.length} arquivos)`);

  for (const file of files) {
    totalFiles += 1;
    const path = join(dir, file);

    try {
      const data = parseFile(path, collection.ext);
      const valid = validate(data);

      if (!valid) {
        totalErrors += 1;
        console.error(`  ✗ ${basename(file)}`);
        for (const err of validate.errors ?? []) {
          console.error(`     - ${err.instancePath || "(root)"} ${err.message}`);
        }
      } else {
        console.log(`  ✓ ${basename(file)}`);
      }
    } catch (e) {
      totalErrors += 1;
      console.error(`  ✗ ${basename(file)}: ${(e as Error).message}`);
    }
  }
}

console.log(`\n${"=".repeat(60)}`);
console.log(`Total: ${totalFiles} arquivos · Erros: ${totalErrors}`);

if (totalErrors > 0) {
  console.error(`\n❌ Validação falhou.`);
  process.exit(1);
}

console.log(`\n✅ Todos os dados são válidos.`);
process.exit(0);
```

- [ ] **Step 3: Rodar validação**

```bash
pnpm validate-data
```

Expected output (dado que só há temas):
```
📂 Validando temas (6 arquivos)
  ✓ economia.yaml
  ✓ educacao.yaml
  ✓ meio-ambiente.yaml
  ✓ politica-externa.yaml
  ✓ saude.yaml
  ✓ seguranca-publica.yaml

============================================================
Total: 6 arquivos · Erros: 0

✅ Todos os dados são válidos.
```

- [ ] **Step 4: Teste de regressão — introduzir erro intencional**

Edita temporariamente `data/temas/economia.yaml` removendo o campo `nivel`:

```yaml
id: TEMA_ECONOMIA
slug: economia
nome: Economia
descricao_curta: Inflação, juros, câmbio, política fiscal, impostos, crescimento e mercado de trabalho.
# nivel: primario  (removido para teste)
tema_pai_id: null
```

Roda `pnpm validate-data`. Expected: FAIL com erro indicando `nivel` é obrigatório.

Restaura o campo `nivel: primario` e roda novamente. Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add scripts/validate-data.ts package.json pnpm-lock.yaml
git commit -m "feat(ci): adicionar validate-data com Ajv para schema validation"
```

---

### Task 20: CI workflow no GitHub Actions

**Spec ref:** Seção 16 (TEP)

**Files:**
- Create: `.github/workflows/ci.yml`

- [ ] **Step 1: Criar workflow CI**

Cria `.github/workflows/ci.yml`:

```yaml
name: CI

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

env:
  NODE_VERSION: "22"
  PNPM_VERSION: "9"

jobs:
  lint-and-test:
    name: Lint, typecheck, test, validate
    runs-on: ubuntu-latest
    timeout-minutes: 10

    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup pnpm
        uses: pnpm/action-setup@v4
        with:
          version: ${{ env.PNPM_VERSION }}

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: pnpm

      - name: Install dependencies
        run: pnpm install --frozen-lockfile

      - name: Format check
        run: pnpm format:check

      - name: Lint
        run: pnpm lint

      - name: Typecheck
        run: pnpm typecheck

      - name: Generate JSON Schemas
        run: pnpm generate-schemas

      - name: Validate data
        run: pnpm validate-data

      - name: Run tests
        run: pnpm test

      - name: Build
        run: pnpm build
```

- [ ] **Step 2: Commit**

```bash
git add .github/workflows/ci.yml
git commit -m "ci: adicionar workflow GitHub Actions (lint, typecheck, test, validate-data, build)"
```

- [ ] **Step 3: Validar localmente toda a pipeline**

Roda todos os checks sequencialmente:

```bash
pnpm format:check && pnpm lint && pnpm typecheck && pnpm generate-schemas && pnpm validate-data && pnpm test && pnpm build
```

Expected: tudo verde.

Se algum falhar, corrigir antes de seguir.

---

### Task 21: SCHEMA.md documentando estrutura

**Spec ref:** Seção 10.2 (arquivos obrigatórios)

**Files:**
- Create: `docs/SCHEMA.md`

- [ ] **Step 1: Criar docs/SCHEMA.md**

````markdown
# Schema do Atlas

Esta página descreve o schema dos dados do Atlas em linguagem humana.
Para validação automatizada, veja `data/schemas/*.schema.json` (gerados de Zod).

## Entidades

### Candidato

Pessoa física registrada como candidata à presidência da República no Brasil
em 2026. Identificada por `id` (ULID) e `slug` único.

**Campos obrigatórios:**
- `id` — identificador único (string ULID)
- `slug` — slug URL-safe (kebab-case, ASCII apenas)
- `nome` — nome completo registrado no TSE
- `partido` — partido político no momento da declaração
- `biografia_minima` — 10-500 caracteres descrevendo factualmente o candidato
- `contas_oficiais` — array de contas verificadas em plataformas digitais
- `criado_em`, `atualizado_em` — timestamps ISO 8601

**Campos opcionais:**
- `foto_url` — URL da foto oficial

### Tema

Tópico amplo usado para classificar declarações. Hierarquia opcional via
`tema_pai_id`.

**Campos obrigatórios:**
- `id`, `slug`, `nome`, `descricao_curta`, `nivel`

**Níveis:** `primario` (top-level) ou `secundario` (subtema).

### Evento

Ocorrência identificável onde uma ou mais declarações foram feitas. Ex.:
debate, entrevista, comício, post em rede social.

**Campos obrigatórios:**
- `id`, `titulo`, `data` (ISO 8601), `tipo`
- `local` — objeto `{ fisico, digital }` (cada um pode ser null)
- `fonte_primaria_url` — link canônico da gravação/transcrição completa
- `fonte_primaria_tipo` — categoria da fonte
- `archive_url` — snapshot Wayback Machine
- `candidatos_envolvidos` — array com pelo menos 1 candidato
- `descricao` — contexto editorial neutro

### Declaração (entidade central)

Trecho específico do que um candidato disse, sempre com fonte primária.

**Campos obrigatórios:**
- `id`, `slug`, `candidato_id`, `evento_id`
- `texto` — citação literal
- `timestamp_no_evento` — HH:MM:SS (ou `null` se não aplicável)
- `contexto` — 10-500 caracteres neutros descrevendo o que foi perguntado
- `tema_principal` — slug do tema principal
- `temas_secundarios` — array opcional de outros temas
- `tipo_estrutural` — array de tags estruturais (não-veredito)
- `fonte_primaria_url`, `fonte_primaria_tipo`, `archive_url`
- `versao` — incrementado a cada edição
- `criado_em`, `atualizado_em`

**Campos opcionais:**
- `snapshot_interno_path` — backup local se Wayback falhar
- `contexto_adicional` — fato circundante documentável
- `vereditos_externos` — array de vereditos de fact-checkers reconhecidos

## Tipos enumerados

### `tipo_estrutural`

Taxonomia neutra que classifica a declaração por **forma**, não por
**veracidade**:

- `promessa` — compromisso futuro
- `dado_numerico` — afirmação com valor quantitativo
- `atribuicao_a_terceiro` — "X disse Y" / "Fonte Z afirmou"
- `afirmacao_historica` — fato passado declarado
- `comparacao` — confronto entre situações/períodos
- `afirmacao_sobre_pesquisa` — citação de pesquisa/estudo
- `compromisso_politico` — promessa política partidária
- `interpretacao_pessoal` — opinião declarada como tal

### `fonte_primaria_tipo`

- `youtube_oficial` — canal oficial do candidato
- `tse` — Tribunal Superior Eleitoral
- `camara`, `senado` — atas/transcrições
- `diario_oficial`
- `midia_consolidada` — G1, Folha, Estadão, UOL, BBC Brasil, Reuters
- `rede_social_oficial` — X/Instagram/Facebook/TikTok com selo verificado

### `evento.tipo`

- `debate`, `entrevista`, `comicio`
- `post_rede_social`, `sabatina`, `declaracao_oficial`

## Manutenção dos schemas

Os schemas vivem em dois lugares (intencionalmente duplicados):

1. **`src/content/config.ts`** — Zod schemas usados pelas Astro Content
   Collections (validação build-time + tipos TypeScript).
2. **`scripts/generate-json-schemas.ts`** — Zod schemas reexportados (sem
   imports do Astro) usados para gerar JSON Schemas para validação externa.

**Quando o modelo mudar, atualize NOS DOIS lugares e rode:**

```bash
pnpm generate-schemas
pnpm validate-data
pnpm typecheck
```

## Validação

- **Build-time (Astro):** Astro Content Collections validam automaticamente
  durante `pnpm build` e `pnpm dev`. Erros bloqueiam build.
- **CI / PR externo:** script `pnpm validate-data` valida cada arquivo em
  `data/` contra os JSON Schemas em `data/schemas/`. Roda no GitHub Actions.

## ID gerador

Use ULID para `id` (ordenável lexicograficamente, prefixado por timestamp):

```ts
import { ulid } from "ulid";
const id = ulid(); // "01H7VS..."
```

## Slug gerador

Use o utilitário `slugify`:

```ts
import { slugify } from "@/lib/utils/slugify";
const slug = slugify("São Paulo"); // "sao-paulo"
```
````

- [ ] **Step 2: Commit**

```bash
git add docs/SCHEMA.md
git commit -m "docs(schema): documentar entidades e tipos do modelo de dados"
```

---

# Checkpoint Final da Fase 1

Antes de declarar Fase 1 completa, verificar manualmente:

### Verificação técnica

- [ ] `pnpm dev` abre site em `http://localhost:4321/` com header, footer, home, 404 funcionais
- [ ] `pnpm build` gera `dist/` sem erros
- [ ] `pnpm lint` passa sem warnings
- [ ] `pnpm typecheck` passa sem erros
- [ ] `pnpm test` mostra 21+ testes passando (slugify 7 + format-date 5 + truncate 5 + temas 4+)
- [ ] `pnpm generate-schemas` gera 4 JSON Schemas em `data/schemas/`
- [ ] `pnpm validate-data` valida os 6 temas iniciais sem erros
- [ ] `pnpm format:check` reporta arquivos formatados

### Verificação de conteúdo

- [ ] LICENSE MIT presente
- [ ] README.md presente
- [ ] `docs/CONTRIBUTING.md`, `CODE_OF_CONDUCT.md`, `SECURITY.md`, `GOVERNANCE.md`, `SCHEMA.md` presentes
- [ ] Issue templates de bug e dúvida configurados
- [ ] PR template configurado
- [ ] 6 temas primários em `data/temas/`

### Verificação visual

- [ ] Tipografia Geist Sans renderiza na home
- [ ] Tipografia Geist Mono renderiza nas tags
- [ ] Paleta sóbria (slate/zinc/âmbar) sem verde/vermelho
- [ ] View Transitions ativam ao navegar entre páginas
- [ ] Header sticky no topo
- [ ] Footer 4 colunas no rodapé
- [ ] Skip link aparece ao tabular
- [ ] Focus visible em todos elementos focáveis
- [ ] Dark mode automático funciona (testar com prefers-color-scheme)

### Verificação de CI

- [ ] Workflow `.github/workflows/ci.yml` presente
- [ ] (Após push pro GitHub) job passa todos os steps

Quando todos os itens acima ✓, **Fase 1 completa**.

---

# Self-Review (executado pelo planejador)

## 1. Spec coverage

| Seção do spec | Tarefa que implementa |
|---|---|
| Seção 3 (princípios) | Refletidos em `docs/GOVERNANCE.md`, Disclaimer.astro |
| Seção 5 (modelo de dados) | Tasks 15-17 (Zod, loaders, types) |
| Seção 6 (stack) | Tasks 1-5 (Astro, ESLint, Tailwind, shadcn, Geist) |
| Seção 8.1 (rotas) | Tasks 9, 12 (BaseLayout + 404) — rotas adicionais nas Fases 2-3 |
| Seção 8.2 (visual identity) | Tasks 3, 5 (design tokens, Geist) |
| Seção 8.3 (layout) | Task 11 (componentes shared) — DeclaracaoFull na Fase 2 |
| Seção 10 (open-source) | Task 6 (LICENSE), Task 7 (governance), Task 8 (issue templates) |
| Seção 13 (riscos — disclaimer) | Task 11 (Disclaimer component), Task 9 (BaseLayout) |
| Seção 16 (TEP) | Tasks 2 (Vitest), 19 (validate-data), 20 (CI) |
| Seção 17 (futuras) | Fora desta fase (Fases 2-3+) |

**Gaps identificados:**
- ✓ Sem gaps. Seção 17 (futuras) é explicitamente roadmap V2.
- Pagefind, structured data, OG dinâmico estão na Fase 2 (Plan 2).
- Conteúdo real de candidatos/declarações está na Fase 3 (Plan 3).

## 2. Placeholder scan

- ✓ Nenhum "TBD", "TODO" sem código.
- ✓ Cada step com código mostra o código completo.
- ✓ URL placeholders identificados: `atlas2026.example.com` em `astro.config.mjs` e `humans.txt`, `github.com/atlas2026` em Header/Footer. Marcados como "ajustar na Fase 3 quando domínio for adquirido" em Tasks 1 e 10.

## 3. Type consistency

- ✓ `Candidato` / `Tema` / `Evento` / `Declaracao` consistentes entre `src/content/config.ts` e `src/types/index.ts` (este reexporta de `astro:content`).
- ✓ Funções `getAllX()`, `getXBySlug()`, `getXById()` padronizadas em todos os loaders.
- ✓ `tipo_estrutural` é array em todos os usos.
- ✓ `fonte_primaria_tipo` enum idêntico entre Evento e Declaração.

## 4. Notas adicionais

- Duplicação intencional dos schemas entre `src/content/config.ts` e `scripts/generate-json-schemas.ts` documentada em `docs/SCHEMA.md`.
- Pagefind não está nesta fase porque depende de conteúdo real para indexar — vai na Fase 2 (Plan 2).
- ID generation (ULID) e slug generation (utilitário existente) documentados em SCHEMA.md mas tasks de geração efetiva entram na Fase 3 quando há conteúdo.
