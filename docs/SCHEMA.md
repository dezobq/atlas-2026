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
   imports do Astro) usados para gerar JSON Schemas para validação externa
   via `z.toJSONSchema()` nativo do Zod 4.

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
