import { readdirSync, readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import { createHash } from "node:crypto";
import { join, basename, extname } from "node:path";
import { pathToFileURL } from "node:url";
import matter from "gray-matter";
import { generateCard } from "../src/lib/cards/generate-card";
import { generateQrSvg } from "../src/lib/cards/generate-qr";
import { CARD_FORMATS, type CardFormat } from "../src/lib/cards/format-config";
import { orderVereditos } from "../src/lib/cards/order-vereditos";
import { logger } from "./lib/logger";

const DECLARACOES_DIR = join(process.cwd(), "data", "declaracoes");
const CARDS_DIR = join(process.cwd(), "public", "cards");
const TEMPLATE_VERSION = "v1.0.0";

interface DeclaracaoFrontmatter {
  id: string;
  texto: string;
  candidato_id: string;
  evento_id?: string;
  criado_em: string;
  vereditos_externos?: Array<{
    veiculo: string;
    classificacao: string;
    url: string;
    data: string;
    citacao_curta: string;
  }>;
}

function contentHash(fm: DeclaracaoFrontmatter): string {
  const payload = JSON.stringify({ ...fm, _tpl: TEMPLATE_VERSION });
  return createHash("sha256").update(payload).digest("hex").slice(0, 12);
}

async function main(): Promise<void> {
  if (!existsSync(DECLARACOES_DIR)) {
    logger.warn(`Sem declarações em ${DECLARACOES_DIR}; nada a gerar.`);
    return;
  }
  const files = readdirSync(DECLARACOES_DIR).filter((f) => extname(f) === ".md");
  logger.info(`Encontradas ${files.length} declarações.`);

  for (const file of files) {
    const id = basename(file, ".md");
    const raw = readFileSync(join(DECLARACOES_DIR, file), "utf-8");
    const { data } = matter(raw);
    const fm = data as DeclaracaoFrontmatter;
    const hash = contentHash(fm);
    const outDir = join(CARDS_DIR, id);
    const hashFile = join(outDir, `.hash-${hash}`);

    if (existsSync(hashFile)) {
      logger.debug(`[skip] ${id} (cache hit)`);
      continue;
    }

    mkdirSync(outDir, { recursive: true });
    const url = `https://atlas-2026.pages.dev/declaracoes/${id}`;
    const qrSvg = await generateQrSvg(url, { width: 120 });
    const vereditos = orderVereditos(fm.vereditos_externos ?? []).map((v) => ({
      veiculo: v.veiculo,
      classificacao: v.classificacao,
    }));
    const cardData = {
      declaracao: fm.texto,
      candidato: fm.candidato_id,
      data: new Date(fm.criado_em).toLocaleDateString("pt-BR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      }),
      evento: fm.evento_id ?? "",
      vereditos,
      url,
      qrSvg,
    };

    for (const fmt of Object.keys(CARD_FORMATS) as CardFormat[]) {
      const out = join(outDir, `${fmt}.png`);
      const buf = await generateCard(cardData, fmt);
      writeFileSync(out, buf);
      logger.info(`[ok] ${id}/${fmt}.png`);
    }

    writeFileSync(hashFile, hash);
  }

  logger.info("✅ Cards gerados.");
}

const isMain = process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href;
if (isMain) {
  main().catch((err) => {
    logger.error(err instanceof Error ? err : String(err));
    process.exit(1);
  });
}
