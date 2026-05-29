# Fix do `pnpm archive` (Wayback SPN2 autenticado) — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Restaurar a geração de snapshots Wayback migrando `scripts/archive.ts` do fluxo antigo (POST `/save/{url}` + leitura de header de redirect, hoje quebrado porque o Wayback passou a exigir autenticação) para a **API SPN2 autenticada** (POST `/save` com `Authorization: LOW`, polling de `job_id`, construção da URL a partir do `timestamp`).

**Architecture:** Separar o protocolo em **funções puras testáveis** (montagem de header/URLs, parsing de `job_id` e de status) + um **orquestrador `requestSnapshot`** que recebe `fetch` e `sleep` injetados (testável com mock, sem rede). O CLI `run()` injeta o `fetch` real e as credenciais de `.env`. Mudança cirúrgica num único arquivo de script + seu teste; sem novas dependências (usa `fetch` e `URLSearchParams` nativos do Node 22).

**Tech Stack:** Node 22 nativo + `tsx`, Vitest, `fetch`/`URLSearchParams` globais. Sem libs novas.

**Root-cause de referência:** `docs/superpowers/research/2026-05-28-piloto-relatorio-aprendizados.md` §5.3.

**Pré-condições verificadas em 2026-05-28:**

- `scripts/archive.ts` atual exporta `buildSaveUrl`, `extractArchiveUrl`, `hashUrl` + `run()`. `extractArchiveUrl` lê `Content-Location`/`Location` (não mais presentes) → **código morto após esta mudança**.
- `scripts/lib/env.ts` exporta `requireEnv(name)` (lança se ausente/vazia) e `getEnv(name, default)`. Não precisa mudar.
- `tests/unit/scripts/archive.test.ts` testa `buildSaveUrl`, `extractArchiveUrl`, `hashUrl`. Os 2 primeiros describe-blocks saem na Task 5.
- `scripts/check-archive-urls.ts` faz HEAD nas `archive_url` — **não muda** (consumidor downstream do snapshot, agnóstico de como foi gerado).
- Deny rule de segurança: **arquivos `.env*` não podem ser lidos/editados pelo agente.** A criação da credencial e a edição de `.env`/`.env.example` são do André (Task 6).

**Branch policy:** trabalhar na branch atual `feat/fase4-sprint5-2-piloto` é aceitável (o fix é pré-condição do lote), **ou** criar `fix/wayback-spn2-auth` a partir de `main` se preferir isolar. Recomendado: branch própria a partir de `main`, pois o fix é independente do conteúdo do piloto e pode mergear antes.

---

## File Structure

**Modificados:**

| Arquivo | Mudança |
| ------- | ------- |
| `scripts/archive.ts` | Substituir protocolo antigo pelo SPN2 autenticado: novas funções puras + orquestrador + `run()` reescrito; remover `buildSaveUrl`/`extractArchiveUrl` |
| `tests/unit/scripts/archive.test.ts` | Adicionar testes das funções novas + orquestrador; remover testes de `buildSaveUrl`/`extractArchiveUrl` |
| `scripts/README.md` | Documentar a nova exigência de credencial `ARCHIVE_ORG_*` |
| `CLAUDE.md` (projeto) | Atualizar a linha de credenciais do bloco de pipeline |

**Editados pelo André (deny rule — agente não toca):**

| Arquivo | Mudança |
| ------- | ------- |
| `.env.example` | Adicionar `ARCHIVE_ORG_ACCESS_KEY=` e `ARCHIVE_ORG_SECRET_KEY=` (template) |
| `.env` | Preencher as 2 chaves reais geradas em archive.org/account/s3.php |

**NÃO mexer:**

- `scripts/lib/env.ts` — `requireEnv` já é genérico.
- `scripts/check-archive-urls.ts` — consumidor downstream, agnóstico.
- `vitest.config.ts`, `tests/__mocks__/astro-content.ts` — constraint do projeto.

---

## Task 1: Funções puras de montagem (header de auth + URLs)

**Files:**

- Modify: `scripts/archive.ts`
- Test: `tests/unit/scripts/archive.test.ts`

- [ ] **Step 1: Escrever os testes que falham**

Adicionar ao topo de `tests/unit/scripts/archive.test.ts` (após os imports existentes, importando as novas funções):

```typescript
import { buildAuthHeader, buildStatusUrl, buildArchiveUrl } from "../../../scripts/archive";

describe("buildAuthHeader", () => {
  it("monta header LOW no formato access:secret", () => {
    expect(buildAuthHeader("KEY123", "SEC456")).toBe("LOW KEY123:SEC456");
  });
});

describe("buildStatusUrl", () => {
  it("monta a URL de status a partir do job_id", () => {
    expect(buildStatusUrl("ac58789b-f3ca")).toBe(
      "https://web.archive.org/save/status/ac58789b-f3ca",
    );
  });
});

describe("buildArchiveUrl", () => {
  it("monta o snapshot a partir de timestamp + original_url", () => {
    expect(buildArchiveUrl("20180326070330", "http://example.com/")).toBe(
      "https://web.archive.org/web/20180326070330/http://example.com/",
    );
  });
});
```

- [ ] **Step 2: Rodar e ver falhar**

Run: `pnpm test -- tests/unit/scripts/archive.test.ts`
Expected: FAIL — `buildAuthHeader`/`buildStatusUrl`/`buildArchiveUrl` não exportados.

- [ ] **Step 3: Implementar as funções**

Adicionar a `scripts/archive.ts` (logo após os imports; manter `hashUrl` existente onde está):

```typescript
const SPN2_SAVE_ENDPOINT = "https://web.archive.org/save";

export function buildAuthHeader(accessKey: string, secret: string): string {
  return `LOW ${accessKey}:${secret}`;
}

export function buildStatusUrl(jobId: string): string {
  return `https://web.archive.org/save/status/${jobId}`;
}

export function buildArchiveUrl(timestamp: string, originalUrl: string): string {
  return `https://web.archive.org/web/${timestamp}/${originalUrl}`;
}
```

- [ ] **Step 4: Rodar e ver passar**

Run: `pnpm test -- tests/unit/scripts/archive.test.ts`
Expected: PASS nos 3 novos describe (os antigos de `buildSaveUrl`/`extractArchiveUrl` continuam passando por ora).

- [ ] **Step 5: Commit**

```bash
git add scripts/archive.ts tests/unit/scripts/archive.test.ts
git commit -m "feat(archive): adicionar funções puras de montagem SPN2 (auth + URLs)"
```

---

## Task 2: Parsing de `job_id` e de status SPN2

**Files:**

- Modify: `scripts/archive.ts`
- Test: `tests/unit/scripts/archive.test.ts`

- [ ] **Step 1: Escrever os testes que falham**

Adicionar a `tests/unit/scripts/archive.test.ts` (e incluir `parseJobId`, `parseStatus` no import de `scripts/archive`):

```typescript
import { parseJobId, parseStatus } from "../../../scripts/archive";

describe("parseJobId", () => {
  it("extrai job_id de uma resposta válida do POST /save", () => {
    expect(parseJobId({ url: "http://x/", job_id: "ac58789b" })).toBe("ac58789b");
  });

  it("lança quando job_id está ausente (ex.: resposta de auth)", () => {
    expect(() => parseJobId({ message: "You need to be logged in" })).toThrow(/job_id/);
  });

  it("lança quando o corpo não é objeto (ex.: HTML)", () => {
    expect(() => parseJobId("<html>")).toThrow();
  });
});

describe("parseStatus", () => {
  it("reconhece pending", () => {
    expect(parseStatus({ status: "pending", job_id: "x" })).toEqual({ state: "pending" });
  });

  it("reconhece success com timestamp e original_url", () => {
    expect(
      parseStatus({
        status: "success",
        timestamp: "20180326070330",
        original_url: "http://example.com/",
      }),
    ).toEqual({
      state: "success",
      timestamp: "20180326070330",
      originalUrl: "http://example.com/",
    });
  });

  it("reconhece error e usa a message do SPN2", () => {
    expect(
      parseStatus({
        status: "error",
        message: "Couldn't resolve host",
        status_ext: "error:invalid-host-resolution",
      }),
    ).toEqual({ state: "error", message: "Couldn't resolve host" });
  });

  it("trata resposta sem campo status como erro", () => {
    expect(parseStatus({}).state).toBe("error");
  });
});
```

- [ ] **Step 2: Rodar e ver falhar**

Run: `pnpm test -- tests/unit/scripts/archive.test.ts`
Expected: FAIL — `parseJobId`/`parseStatus` não exportados.

- [ ] **Step 3: Implementar**

Adicionar a `scripts/archive.ts`:

```typescript
export function parseJobId(body: unknown): string {
  if (typeof body === "object" && body !== null && "job_id" in body) {
    const id = (body as Record<string, unknown>).job_id;
    if (typeof id === "string" && id.length > 0) return id;
  }
  throw new Error(
    "SPN2 /save não retornou job_id. Verifique ARCHIVE_ORG_ACCESS_KEY/ARCHIVE_ORG_SECRET_KEY no .env.",
  );
}

export type SnapshotStatus =
  | { state: "pending" }
  | { state: "success"; timestamp: string; originalUrl: string }
  | { state: "error"; message: string };

export function parseStatus(body: unknown): SnapshotStatus {
  if (typeof body !== "object" || body === null || !("status" in body)) {
    return { state: "error", message: "Resposta de status SPN2 sem campo 'status'." };
  }
  const rec = body as Record<string, unknown>;
  if (rec.status === "pending") return { state: "pending" };
  if (rec.status === "success") {
    const timestamp = rec.timestamp;
    const originalUrl = rec.original_url;
    if (typeof timestamp === "string" && typeof originalUrl === "string") {
      return { state: "success", timestamp, originalUrl };
    }
    return { state: "error", message: "Status 'success' sem timestamp/original_url." };
  }
  const message =
    typeof rec.message === "string"
      ? rec.message
      : typeof rec.status_ext === "string"
        ? rec.status_ext
        : "Erro desconhecido do SPN2.";
  return { state: "error", message };
}
```

- [ ] **Step 4: Rodar e ver passar**

Run: `pnpm test -- tests/unit/scripts/archive.test.ts`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add scripts/archive.ts tests/unit/scripts/archive.test.ts
git commit -m "feat(archive): adicionar parsing de job_id e status SPN2"
```

---

## Task 3: Orquestrador `requestSnapshot` (fetch + sleep injetados)

**Files:**

- Modify: `scripts/archive.ts`
- Test: `tests/unit/scripts/archive.test.ts`

- [ ] **Step 1: Escrever os testes que falham**

Adicionar a `tests/unit/scripts/archive.test.ts` (incluir `requestSnapshot`, e os tipos `FetchLike`, `FetchResponseLike` no import):

```typescript
import { requestSnapshot, type FetchLike, type FetchResponseLike } from "../../../scripts/archive";

function jsonResponse(body: unknown): FetchResponseLike {
  return {
    ok: true,
    status: 200,
    json: () => Promise.resolve(body),
    text: () => Promise.resolve(""),
  };
}

describe("requestSnapshot", () => {
  it("retorna o archive_url no caminho feliz (pending → success)", async () => {
    const queue: FetchResponseLike[] = [
      jsonResponse({ url: "http://x/", job_id: "job1" }), // POST /save
      jsonResponse({ status: "pending", job_id: "job1" }), // status 1
      jsonResponse({ status: "success", timestamp: "20260101000000", original_url: "http://x/" }),
    ];
    const fetchFn: FetchLike = () => {
      const next = queue.shift();
      if (!next) throw new Error("mock de fetch esgotado");
      return Promise.resolve(next);
    };
    const sleeps: number[] = [];
    const sleep = (ms: number): Promise<void> => {
      sleeps.push(ms);
      return Promise.resolve();
    };

    const result = await requestSnapshot("http://x/", {
      fetchFn,
      sleep,
      accessKey: "K",
      secret: "S",
      pollIntervalMs: 10,
      maxAttempts: 5,
    });

    expect(result).toBe("https://web.archive.org/web/20260101000000/http://x/");
    expect(sleeps).toEqual([10]); // dormiu 1× entre o pending e o success
  });

  it("lança quando o SPN2 retorna status error", async () => {
    const queue: FetchResponseLike[] = [
      jsonResponse({ url: "http://x/", job_id: "job1" }),
      jsonResponse({ status: "error", message: "host bloqueado" }),
    ];
    const fetchFn: FetchLike = () => {
      const next = queue.shift();
      if (!next) throw new Error("mock de fetch esgotado");
      return Promise.resolve(next);
    };

    await expect(
      requestSnapshot("http://x/", {
        fetchFn,
        sleep: () => Promise.resolve(),
        accessKey: "K",
        secret: "S",
        maxAttempts: 5,
      }),
    ).rejects.toThrow(/host bloqueado/);
  });

  it("lança timeout quando nunca sai de pending", async () => {
    const fetchFn: FetchLike = (u) =>
      Promise.resolve(
        u.includes("/status/")
          ? jsonResponse({ status: "pending", job_id: "job1" })
          : jsonResponse({ url: "http://x/", job_id: "job1" }),
      );

    await expect(
      requestSnapshot("http://x/", {
        fetchFn,
        sleep: () => Promise.resolve(),
        accessKey: "K",
        secret: "S",
        pollIntervalMs: 1,
        maxAttempts: 3,
      }),
    ).rejects.toThrow(/timeout/i);
  });
});
```

- [ ] **Step 2: Rodar e ver falhar**

Run: `pnpm test -- tests/unit/scripts/archive.test.ts`
Expected: FAIL — `requestSnapshot`/`FetchLike`/`FetchResponseLike` não exportados.

- [ ] **Step 3: Implementar tipos + orquestrador**

Adicionar a `scripts/archive.ts`:

```typescript
export interface FetchResponseLike {
  ok: boolean;
  status: number;
  json(): Promise<unknown>;
  text(): Promise<string>;
}

export type FetchLike = (
  url: string,
  init?: { method?: string; headers?: Record<string, string>; body?: string },
) => Promise<FetchResponseLike>;

export interface SnapshotDeps {
  fetchFn: FetchLike;
  sleep: (ms: number) => Promise<void>;
  accessKey: string;
  secret: string;
  pollIntervalMs?: number;
  maxAttempts?: number;
}

const DEFAULT_POLL_INTERVAL_MS = 5000;
const DEFAULT_MAX_ATTEMPTS = 24; // ~2 min a 5s/poll

export async function requestSnapshot(url: string, deps: SnapshotDeps): Promise<string> {
  const auth = buildAuthHeader(deps.accessKey, deps.secret);
  const pollInterval = deps.pollIntervalMs ?? DEFAULT_POLL_INTERVAL_MS;
  const maxAttempts = deps.maxAttempts ?? DEFAULT_MAX_ATTEMPTS;

  const saveRes = await deps.fetchFn(SPN2_SAVE_ENDPOINT, {
    method: "POST",
    headers: {
      Accept: "application/json",
      Authorization: auth,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({ url }).toString(),
  });

  let saveBody: unknown;
  try {
    saveBody = await saveRes.json();
  } catch {
    throw new Error(
      `SPN2 /save respondeu conteúdo não-JSON (status ${saveRes.status}). Credencial ausente/inválida?`,
    );
  }
  const jobId = parseJobId(saveBody);

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const statusRes = await deps.fetchFn(buildStatusUrl(jobId), {
      headers: { Accept: "application/json", Authorization: auth },
    });
    const parsed = parseStatus(await statusRes.json());
    if (parsed.state === "success") {
      return buildArchiveUrl(parsed.timestamp, parsed.originalUrl);
    }
    if (parsed.state === "error") {
      throw new Error(`SPN2 falhou ao arquivar: ${parsed.message}`);
    }
    await deps.sleep(pollInterval);
  }

  throw new Error(
    `SPN2 não concluiu o snapshot em ${maxAttempts} tentativas (timeout). Tente novamente mais tarde.`,
  );
}
```

> Nota de tipo: `pollIntervalMs`/`maxAttempts` são opcionais com `?? default` — compatível com `exactOptionalPropertyTypes: true` do projeto (lê-se, não se atribui `undefined`).

- [ ] **Step 4: Rodar e ver passar**

Run: `pnpm test -- tests/unit/scripts/archive.test.ts`
Expected: PASS (todos os describe, incluindo os 3 de `requestSnapshot`).

- [ ] **Step 5: Commit**

```bash
git add scripts/archive.ts tests/unit/scripts/archive.test.ts
git commit -m "feat(archive): orquestrador requestSnapshot com polling SPN2 testável"
```

---

## Task 4: Reescrever o CLI `run()` para usar SPN2 + credenciais

**Files:**

- Modify: `scripts/archive.ts` (função `run()` + import de `requireEnv`)

- [ ] **Step 1: Adicionar import de `requireEnv`**

No topo de `scripts/archive.ts`, adicionar à lista de imports:

```typescript
import { requireEnv } from "./lib/env";
```

- [ ] **Step 2: Substituir o corpo de `run()`**

Trocar a função `run()` inteira (da versão antiga que usa `buildSaveUrl`/`extractArchiveUrl`) por:

```typescript
async function run(): Promise<void> {
  const url = process.argv[2];
  if (!url) {
    logger.error("Uso: pnpm archive <url>");
    process.exit(1);
  }

  const accessKey = requireEnv("ARCHIVE_ORG_ACCESS_KEY");
  const secret = requireEnv("ARCHIVE_ORG_SECRET_KEY");

  const outDir = join(CACHE_DIR, "archive");
  mkdirSync(outDir, { recursive: true });

  logger.info(`Arquivando via Wayback SPN2: ${url}`);
  logger.info("(pode levar 30-120s; aguardando o job concluir...)");

  const sleep = (ms: number): Promise<void> => new Promise((resolve) => setTimeout(resolve, ms));
  const fetchFn: FetchLike = (u, init) => fetch(u, init);

  const archiveUrl = await requestSnapshot(url, { fetchFn, sleep, accessKey, secret });

  const hash = hashUrl(url);
  const recordPath = join(outDir, `${hash}.txt`);
  writeFileSync(recordPath, `${new Date().toISOString()}\n${url}\n${archiveUrl}\n`, "utf-8");

  logger.success(`Snapshot criado:\n  ${archiveUrl}`);
  logger.info(`Registro: ${recordPath}`);
}
```

> Se o `typecheck` reclamar de `fetch(u, init)` não casar com `FetchLike`, envolver com cast mínimo: `const fetchFn: FetchLike = (u, init) => fetch(u, init) as Promise<FetchResponseLike>;` — `Response` é estruturalmente compatível, então o cast costuma ser desnecessário.

- [ ] **Step 3: Rodar typecheck**

Run: `pnpm typecheck`
Expected: PASS (0 erros). Se houver erro de tipo no `fetchFn`, aplicar o cast da nota acima.

- [ ] **Step 4: Commit**

```bash
git add scripts/archive.ts
git commit -m "feat(archive): conectar run() ao fluxo SPN2 autenticado com credenciais .env"
```

---

## Task 5: Remover código morto (`buildSaveUrl`, `extractArchiveUrl`) + testes órfãos

> Estas funções pertenciam ao fluxo antigo (header de redirect). A mudança das Tasks 1–4 as torna código morto — remoção autorizada pelo princípio Surgical Changes (dead code criado pelas próprias mudanças).

**Files:**

- Modify: `scripts/archive.ts`
- Modify: `tests/unit/scripts/archive.test.ts`

- [ ] **Step 1: Remover as funções de `scripts/archive.ts`**

Apagar as definições de `buildSaveUrl` e `extractArchiveUrl` (e nada mais — `hashUrl` permanece).

- [ ] **Step 2: Remover os testes órfãos**

Em `tests/unit/scripts/archive.test.ts`, apagar os describe-blocks `"buildSaveUrl"` e `"extractArchiveUrl"`, e remover `buildSaveUrl`/`extractArchiveUrl` do import. Manter o describe `"hashUrl"`.

- [ ] **Step 3: Rodar a suite do arquivo + typecheck + lint**

Run: `pnpm test -- tests/unit/scripts/archive.test.ts`
Expected: PASS (sem referências a símbolos removidos).

Run: `pnpm typecheck`
Expected: PASS.

Run: `pnpm lint`
Expected: PASS (`--max-warnings=0`). Atenção a imports não usados deixados para trás.

- [ ] **Step 4: Commit**

```bash
git add scripts/archive.ts tests/unit/scripts/archive.test.ts
git commit -m "refactor(archive): remover buildSaveUrl/extractArchiveUrl do fluxo antigo"
```

---

## Task 6: Documentar a credencial + verificação ao vivo (gate humano)

> A geração da credencial e a edição de `.env*` são do **André** (deny rule de segurança impede o agente). As edições de `scripts/README.md` e `CLAUDE.md` o agente faz.

**Files:**

- Modify: `scripts/README.md` (agente)
- Modify: `CLAUDE.md` projeto (agente)
- Edit por André: `.env.example`, `.env`

- [ ] **Step 1 (André): gerar chaves S3 e preencher `.env`**

1. Logar/criar conta em https://archive.org
2. Gerar chaves em https://archive.org/account/s3.php
3. No `.env` (gitignored), adicionar:

```
ARCHIVE_ORG_ACCESS_KEY=<access key gerada>
ARCHIVE_ORG_SECRET_KEY=<secret key gerada>
```

4. No `.env.example` (versionado), adicionar o template (sem valores):

```
# Internet Archive Save Page Now 2 — gerar em https://archive.org/account/s3.php
ARCHIVE_ORG_ACCESS_KEY=
ARCHIVE_ORG_SECRET_KEY=
```

- [ ] **Step 2 (agente): documentar em `scripts/README.md`**

Na seção de pré-requisitos/credenciais do `scripts/README.md`, adicionar a linha sobre as novas variáveis:

```markdown
- `pnpm archive <url>` requer credencial do Internet Archive (Save Page Now 2). Gere as chaves S3 em https://archive.org/account/s3.php e defina `ARCHIVE_ORG_ACCESS_KEY` e `ARCHIVE_ORG_SECRET_KEY` no `.env`. Sem elas, o Wayback responde 401 (passou a exigir autenticação em 2026).
```

- [ ] **Step 3 (agente): atualizar a linha de credenciais no `CLAUDE.md` do projeto**

Localizar em `CLAUDE.md` a linha:

```
Credenciais necessárias em `.env` (template em `.env.example`): `OPENAI_API_KEY`, `FIRECRAWL_API_KEY`.
```

Substituir por:

```
Credenciais necessárias em `.env` (template em `.env.example`): `OPENAI_API_KEY`, `FIRECRAWL_API_KEY`, `ARCHIVE_ORG_ACCESS_KEY`, `ARCHIVE_ORG_SECRET_KEY`.
```

- [ ] **Step 4 (agente): commit das docs**

```bash
git add scripts/README.md CLAUDE.md
git commit -m "docs(archive): documentar credencial ARCHIVE_ORG_* para SPN2"
```

- [ ] **Step 5 (André + agente): verificação ao vivo (end-to-end)**

Com o `.env` preenchido:

```bash
pnpm archive https://example.com/
```

Expected: log `Snapshot criado:` com uma URL `https://web.archive.org/web/<timestamp>/https://example.com/`.

Verificar que a URL responde 200 (copiar a URL gerada):

```bash
pnpm check:archive-urls --all
```

Ou checar manualmente a URL gerada no browser. Expected: HTTP 200, snapshot visível.

> Este step é o **critério de DONE real** do fix — não pode ser automatizado sem credencial. Registrar o resultado (URL gerada + 200 OK) na descrição do PR.

- [ ] **Step 6: Suite completa antes do PR**

```bash
pnpm format:check
pnpm lint
pnpm typecheck
pnpm test
pnpm build
```

Expected: todos exit 0. Abrir PR com Conventional Commit PT-BR no squash; corpo cita a URL de snapshot gerada como evidência.

---

## Self-Review

### 1. Spec coverage (contra o root-cause §5.3 do relatório)

| Requisito do root-cause | Coberto em |
| ----------------------- | ---------- |
| Migrar para SPN2 `POST /save` com `Authorization: LOW <key>:<secret>` + `Accept: application/json` | Task 3 (`requestSnapshot`) |
| Receber `job_id` | Task 2 (`parseJobId`) + Task 3 |
| Polling em `/save/status/{job_id}` até obter `timestamp` | Task 3 (loop) + Task 1 (`buildStatusUrl`) |
| Reescrever `extractArchiveUrl` (sem header de redirect) | Task 5 (remoção) + Task 1 (`buildArchiveUrl` substitui) |
| Funções puras TDD-áveis; caminho ao vivo só com credencial | Tasks 1–3 (puras/mock) + Task 6 (ao vivo) |
| Credencial no `.env` (`ARCHIVE_ORG_ACCESS_KEY`/`SECRET_KEY`), agente não toca `.env` | Task 4 (`requireEnv`) + Task 6 (André) |

Sem gaps.

### 2. Placeholder scan

Nenhum `TBD`/`TODO`/"handle errors". Os `<access key gerada>` na Task 6 são valores que o André preenche (deny rule), claramente marcados como ação humana — não placeholders de plano.

### 3. Type consistency

- `FetchLike`/`FetchResponseLike` definidos na Task 3, usados nos testes da Task 3 e no `run()` da Task 4 — nomes idênticos. ✅
- `SnapshotStatus` (`{state:"pending"|"success"|"error"}`) definido na Task 2; consumido na Task 3 com os mesmos campos (`timestamp`, `originalUrl`, `message`). ✅
- `requestSnapshot(url, deps)` assinatura consistente entre teste (Task 3) e `run()` (Task 4): `{ fetchFn, sleep, accessKey, secret, pollIntervalMs?, maxAttempts? }`. ✅
- `SPN2_SAVE_ENDPOINT` definido na Task 1, usado na Task 3. ✅
- `requireEnv` importado na Task 4 bate com a export real de `scripts/lib/env.ts`. ✅

---

**Status:** plano completo, pronto para execução. Salvo em `docs/superpowers/plans/2026-05-28-fix-wayback-spn2-auth.md`.
