import { createReadStream, writeFileSync, mkdirSync, existsSync } from "node:fs";
import { basename, extname, join } from "node:path";
import { pathToFileURL } from "node:url";
import OpenAI from "openai";
import { CACHE_DIR } from "./lib/paths";
import { requireEnv } from "./lib/env";
import { logger } from "./lib/logger";

type WhisperSegment = {
  id: number;
  start: number;
  end: number;
  text: string;
};

function formatTimestamp(seconds: number): string {
  const total = Math.floor(seconds);
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  return [h, m, s].map((n) => String(n).padStart(2, "0")).join(":");
}

export function formatSegmentsAsTimestamps(segments: WhisperSegment[]): string {
  return segments.map((seg) => `[${formatTimestamp(seg.start)}] ${seg.text.trim()}`).join("\n");
}

async function run(): Promise<void> {
  const audioPath = process.argv[2];
  if (!audioPath) {
    logger.error("Uso: pnpm transcribe <path-do-audio.mp3>");
    process.exit(1);
  }

  if (!existsSync(audioPath)) {
    logger.error(`Arquivo não encontrado: ${audioPath}`);
    process.exit(1);
  }

  const apiKey = requireEnv("OPENAI_API_KEY");
  const client = new OpenAI({ apiKey });

  const outDir = join(CACHE_DIR, "transcripts");
  mkdirSync(outDir, { recursive: true });

  const baseName = basename(audioPath, extname(audioPath));
  logger.info(`Transcrevendo ${baseName} via Whisper API (pt-BR)...`);

  const response = await client.audio.transcriptions.create({
    file: createReadStream(audioPath),
    model: "whisper-1",
    language: "pt",
    response_format: "verbose_json",
  });

  const outPath = join(outDir, `${baseName}.json`);
  writeFileSync(outPath, JSON.stringify(response, null, 2), "utf-8");
  logger.success(`Transcrição salva em ${outPath}`);

  const segments = (response as { segments?: WhisperSegment[] }).segments ?? [];
  if (segments.length > 0) {
    const timestamped = formatSegmentsAsTimestamps(segments);
    const txtPath = join(outDir, `${baseName}.txt`);
    writeFileSync(txtPath, timestamped, "utf-8");
    logger.success(`Versão timestamped salva em ${txtPath}`);
    logger.info("\nPrimeiros 500 caracteres:\n" + timestamped.slice(0, 500));
  } else {
    const text = (response as { text?: string }).text;
    logger.warn("Resposta sem segments — apenas texto bruto disponível.");
    logger.info("\nTexto:\n" + (typeof text === "string" ? text : ""));
  }
}

const isMain = import.meta.url === pathToFileURL(process.argv[1] ?? "").href;
if (isMain) {
  run().catch((err: unknown) => {
    logger.error(err instanceof Error ? err : String(err));
    process.exit(1);
  });
}
