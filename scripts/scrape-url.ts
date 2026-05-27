import { writeFileSync, mkdirSync } from "node:fs";
import { join } from "node:path";
import { pathToFileURL } from "node:url";
import Firecrawl from "@mendable/firecrawl-js";
import { CACHE_DIR } from "./lib/paths";
import { requireEnv } from "./lib/env";
import { logger } from "./lib/logger";
import { hashUrl } from "./archive";

export function sanitizeFilename(input: string): string {
  return input
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40);
}

export function isLikelyUrl(input: string): boolean {
  return /^https?:\/\//i.test(input);
}

async function run(): Promise<void> {
  const url = process.argv[2];
  if (!url) {
    logger.error("Uso: pnpm scrape:url <url>");
    process.exit(1);
  }

  if (!isLikelyUrl(url)) {
    logger.error(`URL inválida (esperado http/https): ${url}`);
    process.exit(1);
  }

  const apiKey = requireEnv("FIRECRAWL_API_KEY");
  const firecrawl = new Firecrawl({ apiKey });

  const outDir = join(CACHE_DIR, "scrape");
  mkdirSync(outDir, { recursive: true });

  logger.info(`Scraping ${url} via Firecrawl...`);
  const doc = await firecrawl.scrape(url, {
    formats: [
      "markdown",
      {
        type: "screenshot" as const,
        fullPage: true,
        quality: 80,
        viewport: { width: 1280, height: 800 },
      },
    ],
  });

  const hash = hashUrl(url);

  if (typeof doc.markdown === "string" && doc.markdown.length > 0) {
    const mdPath = join(outDir, `${hash}.md`);
    writeFileSync(mdPath, doc.markdown, "utf-8");
    logger.success(`Markdown (${doc.markdown.length} chars) salvo em ${mdPath}`);
  } else {
    logger.warn("Firecrawl retornou markdown vazio.");
  }

  if (typeof doc.screenshot === "string") {
    const base64 = doc.screenshot.startsWith("data:")
      ? (doc.screenshot.split(",")[1] ?? doc.screenshot)
      : doc.screenshot;
    const imgPath = join(outDir, `${hash}.png`);
    writeFileSync(imgPath, Buffer.from(base64, "base64"));
    logger.success(`Screenshot salvo em ${imgPath}`);
  }
}

const isMain = import.meta.url === pathToFileURL(process.argv[1] ?? "").href;
if (isMain) {
  run().catch((err: unknown) => {
    logger.error(err instanceof Error ? err : String(err));
    process.exit(1);
  });
}
