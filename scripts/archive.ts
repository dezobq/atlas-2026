import { writeFileSync, mkdirSync } from "node:fs";
import { join } from "node:path";
import { createHash } from "node:crypto";
import { pathToFileURL } from "node:url";
import { CACHE_DIR } from "./lib/paths";
import { logger } from "./lib/logger";
import { requireEnv } from "./lib/env";

export function buildAuthHeader(accessKey: string, secret: string): string {
  return `LOW ${accessKey}:${secret}`;
}

export function buildStatusUrl(jobId: string): string {
  return `https://web.archive.org/save/status/${jobId}`;
}

export function buildArchiveUrl(timestamp: string, originalUrl: string): string {
  return `https://web.archive.org/web/${timestamp}/${originalUrl}`;
}

export function hashUrl(url: string): string {
  return createHash("sha256").update(url).digest("hex").slice(0, 8);
}

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

const SPN2_SAVE_ENDPOINT = "https://web.archive.org/save";
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
    let statusBody: unknown;
    try {
      statusBody = await statusRes.json();
    } catch {
      throw new Error(
        `SPN2 /save/status respondeu conteúdo não-JSON (status ${statusRes.status}) na tentativa ${attempt + 1}.`,
      );
    }
    const parsed = parseStatus(statusBody);
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

const isMain = import.meta.url === pathToFileURL(process.argv[1] ?? "").href;
if (isMain) {
  run().catch((err: unknown) => {
    logger.error(err instanceof Error ? err : String(err));
    process.exit(1);
  });
}
