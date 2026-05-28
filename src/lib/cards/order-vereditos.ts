export interface VereditoInput {
  veiculo: string;
  classificacao: string;
  url: string;
  data: string;
  citacao_curta: string;
}

const SEM_REGISTRO_RE = /sem\s+registro/i;

export function orderVereditos(vereditos: VereditoInput[]): VereditoInput[] {
  if (vereditos.length === 0) return [];
  const useful = vereditos.filter((v) => !SEM_REGISTRO_RE.test(v.classificacao));
  const semRegistro = vereditos.filter((v) => SEM_REGISTRO_RE.test(v.classificacao));
  const prioritized = [...useful, ...semRegistro];
  return prioritized.slice(0, 3).sort((a, b) => a.veiculo.localeCompare(b.veiculo, "pt-BR"));
}
