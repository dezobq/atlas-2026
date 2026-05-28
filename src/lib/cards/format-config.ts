export type CardFormat = "1200x630" | "1200x1200" | "1080x1350" | "1080x1920";

export interface FormatSpec {
  width: number;
  height: number;
  multiplier: number;
}

export const CARD_FORMATS: Record<CardFormat, FormatSpec> = {
  "1200x630": { width: 1200, height: 630, multiplier: 1.0 },
  "1200x1200": { width: 1200, height: 1200, multiplier: 1.0 },
  "1080x1350": { width: 1080, height: 1350, multiplier: 0.95 },
  "1080x1920": { width: 1080, height: 1920, multiplier: 0.9 },
};
