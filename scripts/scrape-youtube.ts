import { writeFileSync, mkdirSync } from "node:fs";
import { join } from "node:path";
import { pathToFileURL } from "node:url";
import youtubedl from "youtube-dl-exec";
import { CACHE_DIR } from "./lib/paths";
import { logger } from "./lib/logger";

const YOUTUBE_ID_RE = /(?:v=|youtu\.be\/|embed\/|shorts\/)([\w-]{11})/;

export function extractVideoId(url: string): string | null {
  const match = YOUTUBE_ID_RE.exec(url);
  return match?.[1] ?? null;
}

function formatDuration(totalSeconds: number): string {
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;
  return [h, m, s].map((n) => String(n).padStart(2, "0")).join(":");
}

export function summarizeMetadata(metadata: Record<string, unknown>): string {
  const title = typeof metadata.title === "string" ? metadata.title : "(sem título)";
  const duration = typeof metadata.duration === "number" ? metadata.duration : 0;
  const uploader = typeof metadata.uploader === "string" ? metadata.uploader : "(desconhecido)";
  const uploadDate = typeof metadata.upload_date === "string" ? metadata.upload_date : "?";
  return `${title}\n  Duração: ${formatDuration(duration)}\n  Canal: ${uploader}\n  Data: ${uploadDate}`;
}

async function run(): Promise<void> {
  const url = process.argv[2];
  if (!url) {
    logger.error("Uso: pnpm scrape:youtube <url-do-youtube>");
    process.exit(1);
  }

  const videoId = extractVideoId(url);
  if (!videoId) {
    logger.error(`URL não parece ser do YouTube: ${url}`);
    process.exit(1);
  }

  const outDir = join(CACHE_DIR, "youtube");
  mkdirSync(outDir, { recursive: true });

  logger.info(`Baixando metadata de ${videoId}...`);
  const metadata = (await youtubedl(url, {
    dumpSingleJson: true,
    noCheckCertificates: true,
    noWarnings: true,
  })) as Record<string, unknown>;

  const metadataPath = join(outDir, `${videoId}.json`);
  writeFileSync(metadataPath, JSON.stringify(metadata, null, 2), "utf-8");
  logger.success(`Metadata salva em ${metadataPath}`);

  logger.info(`Extraindo áudio MP3...`);
  await youtubedl(url, {
    extractAudio: true,
    audioFormat: "mp3",
    audioQuality: 0,
    output: join(outDir, "%(id)s.%(ext)s"),
    noCheckCertificates: true,
    noWarnings: true,
  });
  logger.success(`Áudio salvo em ${join(outDir, `${videoId}.mp3`)}`);

  logger.info("\n" + summarizeMetadata(metadata));
}

const isMain = import.meta.url === pathToFileURL(process.argv[1] ?? "").href;
if (isMain) {
  run().catch((err: unknown) => {
    logger.error(err instanceof Error ? err : String(err));
    process.exit(1);
  });
}
