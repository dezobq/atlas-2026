function toDate(input: string | Date): Date {
  return input instanceof Date ? input : new Date(input);
}

export function formatDateBR(input: string | Date): string {
  const d = toDate(input);
  const dia = String(d.getUTCDate()).padStart(2, "0");
  const mes = String(d.getUTCMonth() + 1).padStart(2, "0");
  const ano = d.getUTCFullYear();
  return `${dia}/${mes}/${ano}`;
}

export function formatDateLong(input: string | Date): string {
  const d = toDate(input);
  return d.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });
}

export function formatRelative(input: string | Date): string {
  const d = toDate(input);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return "hoje";
  if (diffDays === 1) return "ontem";
  if (diffDays < 30) return `há ${diffDays} dias`;
  if (diffDays < 365) {
    const meses = Math.floor(diffDays / 30);
    return `há ${meses} mês${meses === 1 ? "" : "es"}`;
  }
  const anos = Math.floor(diffDays / 365);
  return `há ${anos} ano${anos === 1 ? "" : "s"}`;
}
