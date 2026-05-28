import { CARD_FORMATS, type CardFormat } from "./format-config";
import { factCheckerColor } from "./fact-checker-palette";
import { titleFontSize } from "./typography-scale";
import { truncateDeclaracao } from "./truncate";

export interface VereditoSimple {
  veiculo: string;
  classificacao: string;
}

export interface CardData {
  declaracao: string;
  candidato: string;
  data: string;
  evento: string;
  vereditos: VereditoSimple[];
  url: string;
  qrSvg: string;
}

const BG = "#FAFAFA";
const TEXT_PRIMARY = "#0A0A0A";
const TEXT_SECONDARY = "#525252";
const DIVIDER = "#E5E5E5";
const ATLAS_MARK = "#171717";

export function buildCardTemplate(
  data: CardData,
  format: CardFormat,
): { type: string; props: Record<string, unknown> } {
  const cfg = CARD_FORMATS[format];
  const declarationTrimmed = truncateDeclaracao(data.declaracao);
  const titleSize = titleFontSize(declarationTrimmed.length, cfg.multiplier);
  const isVertical = cfg.height > cfg.width;
  const padding = isVertical ? 60 : 80;

  return {
    type: "div",
    props: {
      style: {
        width: cfg.width,
        height: cfg.height,
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        backgroundColor: BG,
        padding,
        fontFamily: "Geist",
        color: TEXT_PRIMARY,
      },
      children: [
        wordmark(),
        body(declarationTrimmed, titleSize, data),
        vereditosBlock(data.vereditos, cfg.multiplier),
        footer(data.url, data.qrSvg, cfg.multiplier),
      ],
    },
  };
}

function wordmark() {
  return {
    type: "div",
    props: {
      style: {
        display: "flex",
        flexDirection: "column",
        borderBottom: `1px solid ${DIVIDER}`,
        paddingBottom: 12,
      },
      children: {
        type: "span",
        props: {
          style: { fontSize: 24, fontWeight: 500, color: ATLAS_MARK },
          children: "Atlas dos Candidatos · 2026",
        },
      },
    },
  };
}

function body(declaracao: string, fontSize: number, data: CardData) {
  return {
    type: "div",
    props: {
      style: {
        display: "flex",
        flexDirection: "column",
        gap: 24,
        flex: 1,
        justifyContent: "center",
      },
      children: [
        {
          type: "div",
          props: {
            style: { fontSize, fontWeight: 500, lineHeight: 1.2, color: TEXT_PRIMARY },
            children: `"${declaracao}"`,
          },
        },
        {
          type: "div",
          props: {
            style: { fontSize: 22, fontWeight: 400, color: TEXT_SECONDARY },
            children: `— ${data.candidato} · ${data.data} · ${data.evento}`,
          },
        },
      ],
    },
  };
}

function vereditosBlock(vereditos: VereditoSimple[], multiplier: number) {
  if (vereditos.length === 0) {
    return {
      type: "div",
      props: {
        style: { fontSize: 22 * multiplier, color: TEXT_SECONDARY, fontWeight: 400 },
        children: `Sem veredito de fact-checker reconhecido até ${new Date().toLocaleDateString("pt-BR")}`,
      },
    };
  }

  return {
    type: "div",
    props: {
      style: { display: "flex", flexDirection: "column", gap: 8 },
      children: vereditos.map((v) => ({
        type: "div",
        props: {
          style: {
            display: "flex",
            alignItems: "center",
            gap: 16,
            borderLeft: `4px solid ${factCheckerColor(v.veiculo)}`,
            paddingLeft: 16,
            fontSize: 24 * multiplier,
          },
          children: [
            {
              type: "span",
              props: {
                style: {
                  color: factCheckerColor(v.veiculo),
                  fontSize: 28 * multiplier,
                  fontWeight: 500,
                },
                children: "●",
              },
            },
            {
              type: "span",
              props: { style: { fontWeight: 500, color: TEXT_PRIMARY }, children: v.veiculo },
            },
            {
              type: "span",
              props: {
                style: { fontWeight: 400, color: TEXT_SECONDARY },
                children: v.classificacao,
              },
            },
          ],
        },
      })),
    },
  };
}

function footer(url: string, qrSvg: string, multiplier: number) {
  return {
    type: "div",
    props: {
      style: { display: "flex", justifyContent: "space-between", alignItems: "flex-end" },
      children: [
        {
          type: "div",
          props: {
            style: { display: "flex", flexDirection: "column", gap: 8 },
            children: [
              {
                type: "span",
                props: {
                  style: { fontSize: 20 * multiplier, fontWeight: 500, color: TEXT_PRIMARY },
                  children: url.replace(/^https?:\/\//, ""),
                },
              },
              {
                type: "span",
                props: {
                  style: { fontSize: 18 * multiplier, color: TEXT_SECONDARY },
                  children: "Atlas dos Candidatos · 2026 · Não emite veredito · CC-BY 4.0",
                },
              },
            ],
          },
        },
        {
          type: "img",
          props: {
            src: `data:image/svg+xml;base64,${Buffer.from(qrSvg).toString("base64")}`,
            width: 120,
            height: 120,
          },
        },
      ],
    },
  };
}
