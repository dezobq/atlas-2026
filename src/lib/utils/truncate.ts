export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;

  const cut = text.slice(0, maxLength);
  const nextChar = text.charAt(maxLength);

  // If the cut ends exactly on a word boundary (next char is space),
  // keep the entire cut and append ellipsis.
  if (nextChar === " ") {
    return cut + "…";
  }

  // Otherwise, back up to the last space in the cut so we don't break a word.
  const lastSpace = cut.lastIndexOf(" ");
  if (lastSpace > 0) {
    return cut.slice(0, lastSpace) + "…";
  }

  return cut + "…";
}
