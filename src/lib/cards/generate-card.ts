import { readFileSync } from "node:fs";
import { join } from "node:path";
import satori from "satori";
import { Resvg } from "@resvg/resvg-js";
import { CARD_FORMATS, type CardFormat } from "./format-config";
import { buildCardTemplate, type CardData } from "./card-template";

const FONTS_DIR = join(process.cwd(), "assets", "fonts");
const FONT_REGULAR = readFileSync(join(FONTS_DIR, "Geist-Regular.ttf"));
const FONT_MEDIUM = readFileSync(join(FONTS_DIR, "Geist-Medium.ttf"));

export async function generateCard(data: CardData, format: CardFormat): Promise<Buffer> {
  const cfg = CARD_FORMATS[format];
  const tpl = buildCardTemplate(data, format);
  const svg = await satori(tpl as never, {
    width: cfg.width,
    height: cfg.height,
    fonts: [
      { name: "Geist", data: FONT_REGULAR, weight: 400, style: "normal" },
      { name: "Geist", data: FONT_MEDIUM, weight: 500, style: "normal" },
    ],
  });
  const resvg = new Resvg(svg, { fitTo: { mode: "width", value: cfg.width } });
  return resvg.render().asPng();
}
