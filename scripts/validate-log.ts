import { pathToFileURL } from "node:url";
import {
  loadDeclaracoes,
  loadLogEditorial,
  ENUM_VALIDOS,
  type DeclaracaoFrontmatter,
  type LogLine,
} from "./lib/data-loaders";

export interface ValidationResult {
  ok: boolean;
  errors: string[];
}

export function validarLog(
  declaracoes: DeclaracaoFrontmatter[],
  log: LogLine[],
): ValidationResult {
  const errors: string[] = [];
  const declSet = new Set(declaracoes.map((d) => d.id));
  const logSet = new Set<string>();
  const logCount = new Map<string, number>();

  for (const line of log) {
    logCount.set(line.declaracao_id, (logCount.get(line.declaracao_id) ?? 0) + 1);
    if (!declSet.has(line.declaracao_id)) {
      errors.push(
        `log-editorial.csv: linha referencia declaracao_id=${line.declaracao_id} que não existe em data/declaracoes/`,
      );
    }
    logSet.add(line.declaracao_id);

    if (!line.motivo_inclusao.match(/^cascata-[1-5]:/)) {
      errors.push(
        `log-editorial.csv: declaracao_id=${line.declaracao_id} tem motivo_inclusao sem prefixo "cascata-N:" (1-5). Valor: "${line.motivo_inclusao}"`,
      );
    }

    if (!ENUM_VALIDOS.TEMA_VALIDOS.includes(line.tema)) {
      errors.push(
        `log-editorial.csv: declaracao_id=${line.declaracao_id} tem tema inválido "${line.tema}". Válidos: ${ENUM_VALIDOS.TEMA_VALIDOS.join(", ")}`,
      );
    }
    if (!ENUM_VALIDOS.TIPO_ESTRUTURAL_VALIDOS.includes(line.tipo_estrutural)) {
      errors.push(
        `log-editorial.csv: declaracao_id=${line.declaracao_id} tem tipo_estrutural inválido "${line.tipo_estrutural}".`,
      );
    }
    if (!ENUM_VALIDOS.FONTE_TIPO_VALIDOS.includes(line.fonte_tipo)) {
      errors.push(
        `log-editorial.csv: declaracao_id=${line.declaracao_id} tem fonte_tipo inválido "${line.fonte_tipo}".`,
      );
    }
  }

  for (const [id, count] of logCount) {
    if (count > 1) {
      errors.push(`log-editorial.csv: declaracao_id=${id} aparece em ${count} linhas (duplicada)`);
    }
  }

  for (const d of declaracoes) {
    if (!logSet.has(d.id)) {
      errors.push(
        `data/declaracoes/${d.id}.md: declaração sem entrada correspondente em log-editorial.csv`,
      );
    }
  }

  return { ok: errors.length === 0, errors };
}

function isMain(): boolean {
  return import.meta.url === pathToFileURL(process.argv[1] ?? "").href;
}

if (isMain()) {
  const declaracoes = loadDeclaracoes();
  const log = loadLogEditorial();
  const { ok, errors } = validarLog(declaracoes, log);

  if (ok) {
    console.log(`✅ log-editorial.csv: ${log.length} linhas, FK match 100% (${declaracoes.length} declarações).`);
    process.exit(0);
  } else {
    console.error(`❌ log-editorial.csv tem ${errors.length} problema(s):`);
    for (const e of errors) console.error(`  - ${e}`);
    process.exit(1);
  }
}
