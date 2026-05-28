import { pathToFileURL } from "node:url";
import { writeFileSync, mkdirSync } from "node:fs";
import { join } from "node:path";
import { loadDeclaracoes, type DeclaracaoFrontmatter } from "./lib/data-loaders";

export interface DistribuicaoResult {
  totalDeclaracoes: number;
  percentComVereditoExterno: number;
  tiposPorCandidato: Map<string, Set<string>>;
  distribuicaoFonte: Map<string, number>; // % do total
}

function pct(n: number, total: number): number {
  if (total === 0) return 0;
  return Math.round((n / total) * 100);
}

export function calcularDistribuicao(declaracoes: DeclaracaoFrontmatter[]): DistribuicaoResult {
  const total = declaracoes.length;
  const comVeredito = declaracoes.filter(
    (d) => Array.isArray(d.vereditos_externos) && d.vereditos_externos.length > 0,
  ).length;

  const tiposPorCandidato = new Map<string, Set<string>>();
  for (const d of declaracoes) {
    if (!tiposPorCandidato.has(d.candidato_id)) {
      tiposPorCandidato.set(d.candidato_id, new Set());
    }
    for (const t of d.tipo_estrutural) {
      tiposPorCandidato.get(d.candidato_id)!.add(t);
    }
  }

  const fonteCount = new Map<string, number>();
  for (const d of declaracoes) {
    fonteCount.set(d.fonte_primaria_tipo, (fonteCount.get(d.fonte_primaria_tipo) ?? 0) + 1);
  }
  const distribuicaoFonte = new Map<string, number>();
  for (const [k, v] of fonteCount) {
    distribuicaoFonte.set(k, pct(v, total));
  }

  return {
    totalDeclaracoes: total,
    percentComVereditoExterno: pct(comVeredito, total),
    tiposPorCandidato,
    distribuicaoFonte,
  };
}

function renderMarkdown(r: DistribuicaoResult): string {
  const lines: string[] = [];
  lines.push(`# Distribuição editorial Fase 4`);
  lines.push(``);
  lines.push(`- Total de declarações: **${r.totalDeclaracoes}**`);
  lines.push(`- % com veredito externo: **${r.percentComVereditoExterno}%**`);
  lines.push(``);

  lines.push(`## Tipos estruturais cobertos por candidato`);
  lines.push(``);
  lines.push(`| Candidato | Tipos distintos | Tipos |`);
  lines.push(`|---|---|---|`);
  for (const [cand, tipos] of r.tiposPorCandidato) {
    lines.push(`| ${cand} | ${tipos.size}/8 | ${Array.from(tipos).join(", ")} |`);
  }
  lines.push(``);

  lines.push(`## Distribuição de fonte_primaria_tipo`);
  lines.push(``);
  lines.push(`| Fonte | % |`);
  lines.push(`|---|---|`);
  for (const [fonte, p] of r.distribuicaoFonte) {
    lines.push(`| ${fonte} | ${p}% |`);
  }

  return lines.join("\n");
}

function isMain(): boolean {
  return import.meta.url === pathToFileURL(process.argv[1] ?? "").href;
}

if (isMain()) {
  const declaracoes = loadDeclaracoes();
  const result = calcularDistribuicao(declaracoes);
  const md = renderMarkdown(result);

  const outPath = join(process.cwd(), "docs", "distribuicao-fase4.md");
  mkdirSync(join(process.cwd(), "docs"), { recursive: true });
  writeFileSync(outPath, md + "\n", "utf-8");

  console.log(
    `✅ Distribuição calculada para ${result.totalDeclaracoes} declarações — docs/distribuicao-fase4.md`,
  );
  process.exit(0);
}
