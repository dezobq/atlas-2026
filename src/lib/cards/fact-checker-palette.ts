export const FALLBACK_COLOR = "#737373";

const PALETTE: Record<string, string> = {
  Lupa: "#E20E0E",
  "Aos Fatos": "#1A9E5E",
  Comprova: "#1E5AAF",
  "Estadão Verifica": "#3F3F3F",
  "Agência Pública": "#E67E22",
  "BBC Verify": "#B40000",
};

export function factCheckerColor(veiculo: string): string {
  return PALETTE[veiculo] ?? FALLBACK_COLOR;
}
