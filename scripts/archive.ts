import { writeFileSync, mkdirSync } from "node:fs";
import { join } from "node:path";
import { createHash } from "node:crypto";
import { pathToFileURL } from "node:url";
import { CACHE_DIR } from "./lib/paths";
import { logger } from "./lib/logger";

export function buildAuthHeader(accessKey: string, secret: string): string {
  return `LOW ${accessKey}:${secret}`;
}

export function buildStatusUrl(jobId: string): string {
  return `https://web.archive.org/save/status/${jobId}`;
}

export function buildArchiveUrl(timestamp: string, originalUrl: string): string {
  return `https://web.archive.org/web/${timestamp}/${originalUrl}`;
}

export function buildSaveUrl(url: string): string {
  return `https://web.archive.org/save/${url}`;
}

export function extractArchiveUrl(headers: Headers): string | null {
  const contentLocation = headers.get("Content-Location");
  if (contentLocation) {
    return contentLocation.startsWith("http")
      ? contentLocation
      : `https://web.archive.org${contentLocation}`;
  }
  const location = headers.get("Location");
  if (location) {
    return location.startsWith("http") ? location : `https://web.archive.org${location}`;
  }
  return null;
}

export function hashUrl(url: string): string {
  return createHash("sha256").update(url).digest("hex").slice(0, 8);
}

async function run(): Promise<void> {
  const url = process.argv[2];
  if (!url) {
    logger.error("Uso: pnpm archive <url>");
    process.exit(1);
  }

  const outDir = join(CACHE_DIR, "archive");
  mkdirSync(outDir, { recursive: true });

  const saveUrl = buildSaveUrl(url);
  logger.info(`Arquivando via Wayback Machine: ${url}`);
  logger.info(`(pode levar 30-90s para snapshot ser criado)`);

  const response = await fetch(saveUrl, {
    method: "POST",
    redirect: "manual",
    headers: {
      "User-Agent": "atlas-2026/0.1 (+https://github.com/dezobq/atlas-2026)",
    },
  });

  const archiveUrl = extractArchiveUrl(response.headers);
  if (!archiveUrl) {
    logger.error(
      `Wayback não retornou URL de snapshot (status ${response.status}). ` +
        "A página pode estar bloqueando arquivamento.",
    );
    process.exit(1);
  }

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
