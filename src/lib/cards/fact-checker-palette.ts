export const FALLBACK_COLOR = "#737373";

type KnownFactChecker =
  | "Lupa"
  | "Aos Fatos"
  | "Comprova"
  | "Estadão Verifica"
  | "Agência Pública"
  | "BBC Verify";

const PALETTE: Record<KnownFactChecker, string> = {
  Lupa: "#E20E0E",
  "Aos Fatos": "#1A9E5E",
  Comprova: "#1E5AAF",
  "Estadão Verifica": "#3F3F3F",
  "Agência Pública": "#E67E22",
  "BBC Verify": "#B40000",
};

export function factCheckerColor(veiculo: string): string {
  return (PALETTE as Record<string, string>)[veiculo] ?? FALLBACK_COLOR;
}
