export function truncateDeclaracao(text: string, maxLength = 280): string {
  if (text.length <= maxLength) return text;
  const cut = text.slice(0, maxLength);
  if (text[maxLength] === " ") return cut + "…";
  const lastSpace = cut.lastIndexOf(" ");
  return (lastSpace > 0 ? cut.slice(0, lastSpace + 1) : cut) + "…";
}
