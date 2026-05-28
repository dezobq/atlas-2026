export function titleFontSize(declarationLength: number, multiplier: number): number {
  let base: number;
  if (declarationLength <= 120) base = 72;
  else if (declarationLength <= 300) base = 54;
  else base = 40;
  return Math.round(base * multiplier * 10) / 10;
}
