import { readFileSync, writeFileSync, mkdirSync, readdirSync } from "node:fs";
import { join, basename, extname } from "node:path";
import { pathToFileURL } from "node:url";
import satori from "satori";
import { Resvg } from "@resvg/resvg-js";
import matter from "gray-matter";
import { OG_DIR, DECLARACOES_DIR } from "./lib/paths";
import { logger } from "./lib/logger";

const WIDTH = 1200;
const HEIGHT = 630;
const ASSETS_FONT_DIR = join(process.cwd(), "assets", "fonts");

type FrontmatterMinimo = {
  id: string;
  texto: string;
  candidato_id: string;
  criado_em: string;
};

export function truncateCitacao(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  const cut = text.slice(0, maxLength);
  if (text[maxLength] === " ") return cut + "…";
  const lastSpace = cut.lastIndexOf(" ");
  return (lastSpace > 0 ? cut.slice(0, lastSpace) : cut) + "…";
}

export function ogImagePath(id: string): string {
  return join(OG_DIR, `${id}.png`);
}

function buildJsx(citacao: string, candidato: string, data: string): unknown {
  const truncated = truncateCitacao(citacao, 220);
  const dataFmt = new Date(data).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });
  return {
    type: "div",
    props: {
      style: {
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        padding: 80,
        backgroundColor: "#fafafa",
        fontFamily: "Geist",
      },
      children: [
        {
          type: "div",
          props: {
            style: { fontSize: 24, color: "#888", fontWeight: 500 },
            children: "ATLAS DOS CANDIDATOS · 2026",
          },
        },
        {
          type: "div",
          props: {
            style: {
              fontSize: 48,
              color: "#171717",
              lineHeight: 1.2,
              fontWeight: 500,
              letterSpacing: "-0.02em",
            },
            children: `"${truncated}"`,
          },
        },
        {
          type: "div",
          props: {
            style: {
              fontSize: 22,
              color: "#4d4d4d",
              display: "flex",
              gap: 16,
            },
            children: [
              { type: "span", props: { children: candidato } },
              { type: "span", props: { style: { color: "#a1a1a1" }, children: "·" } },
              { type: "span", props: { children: dataFmt } },
            ],
          },
        },
      ],
    },
  };
}

async function renderOg(
  jsx: unknown,
  fonts: Array<{ name: string; data: Buffer; weight: 400 | 500; style: "normal" }>,
): Promise<Buffer> {
  const svg = await satori(jsx as never, { width: WIDTH, height: HEIGHT, fonts });
  const resvg = new Resvg(svg, {
    fitTo: { mode: "width", value: WIDTH },
    font: { loadSystemFonts: false },
  });
  return resvg.render().asPng();
}

async function run(): Promise<void> {
  const fonts = [
    {
      name: "Geist",
      data: readFileSync(join(ASSETS_FONT_DIR, "Geist-Regular.ttf")),
      weight: 400 as const,
      style: "normal" as const,
    },
    {
      name: "Geist",
      data: readFileSync(join(ASSETS_FONT_DIR, "Geist-Medium.ttf")),
      weight: 500 as const,
      style: "normal" as const,
    },
  ];

  mkdirSync(OG_DIR, { recursive: true });

  let declaracoes: string[] = [];
  try {
    declaracoes = readdirSync(DECLARACOES_DIR).filter((f) => extname(f) === ".md");
  } catch {
    logger.warn(`Diretório ${DECLARACOES_DIR} ainda não existe. Nada a gerar.`);
    return;
  }

  if (declaracoes.length === 0) {
    logger.warn(`Nenhuma declaração em ${DECLARACOES_DIR}. Nada a gerar.`);
    return;
  }

  logger.info(`Gerando ${declaracoes.length} OG image(s)...`);

  for (const file of declaracoes) {
    const path = join(DECLARACOES_DIR, file);
    const parsed = matter(readFileSync(path, "utf-8"));
    const fm = parsed.data as FrontmatterMinimo;
    if (!fm.id || !fm.texto || !fm.candidato_id || !fm.criado_em) {
      logger.warn(`${file}: frontmatter incompleto, pulando.`);
      continue;
    }
    const jsx = buildJsx(fm.texto, fm.candidato_id, fm.criado_em);
    const png = await renderOg(jsx, fonts);
    const outPath = ogImagePath(fm.id);
    writeFileSync(outPath, png);
    logger.success(`${basename(file)} → ${outPath}`);
  }

  logger.info(`\nTotal: ${declaracoes.length} OG image(s) gerada(s) em ${OG_DIR}`);
}

const isMain = import.meta.url === pathToFileURL(process.argv[1] ?? "").href;
if (isMain) {
  run().catch((err: unknown) => {
    logger.error(err instanceof Error ? err : String(err));
    process.exit(1);
  });
}
