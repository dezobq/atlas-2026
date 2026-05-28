import { pathToFileURL } from "node:url";
import { writeFileSync, mkdirSync, readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import matter from "gray-matter";
import {
  loadCandidatos,
  loadDeclaracoes,
  loadEventos,
  ENUM_VALIDOS,
  type CandidatoYaml,
  type DeclaracaoFrontmatter,
  type EventoYaml,
} from "./lib/data-loaders";

export type AuditMode = "setup" | "piloto" | "final";

export interface AuditInput {
  mode: AuditMode;
  candidatos: CandidatoYaml[];
  declaracoes: DeclaracaoFrontmatter[];
  eventos: EventoYaml[];
  eventoDeDeclaracao: Map<string, string>;
}

export interface AuditResult {
  ok: boolean;
  errors: string[];
  report: string;
}

// Janela de elegibilidade da Fase 4 (spec §4.2)
const JANELA_INICIO = new Date("2025-05-15T00:00:00.000Z").getTime();
const JANELA_FIM = new Date("2026-05-15T23:59:59.999Z").getTime();

export function auditarParidade(input: AuditInput): AuditResult {
  const { mode, candidatos, declaracoes, eventos, eventoDeDeclaracao } = input;
  const errors: string[] = [];
  const lines: string[] = [];

  lines.push(`# Auditoria de Paridade Fase 4`);
  lines.push(``);
  lines.push(`- Modo: \`${mode}\``);
  lines.push(`- Candidatos: ${candidatos.length}`);
  lines.push(`- Declarações: ${declaracoes.length}`);
  lines.push(`- Eventos: ${eventos.length}`);
  lines.push(``);

  // 1. Número de candidatos
  if (mode === "setup") {
    if (candidatos.length !== 0 && candidatos.length !== 2) {
      errors.push(
        `setup-mode: esperado 0 ou 2 candidatos em data/candidatos/, encontrado ${candidatos.length}`,
      );
    }
  } else {
    if (candidatos.length !== 2) {
      errors.push(
        `${mode}-mode: esperado exatamente 2 candidatos, encontrado ${candidatos.length}`,
      );
    }
  }

  // 2. Número de declarações
  if (mode === "piloto" && declaracoes.length !== 12) {
    errors.push(
      `piloto-mode: esperado exatamente 12 declarações (1 × 6 temas × 2 candidatos), encontrado ${declaracoes.length}`,
    );
  }
  if (mode === "final" && declaracoes.length !== 60) {
    errors.push(
      `final-mode: esperado exatamente 60 declarações (5 × 6 temas × 2 candidatos), encontrado ${declaracoes.length}`,
    );
  }
  if (declaracoes.length > 60) {
    errors.push(
      `declarações em excesso: ${declaracoes.length} (máximo permitido na Fase 4: 60)`,
    );
  }

  // 3. Distribuição por (candidato × tema)
  const matriz = new Map<string, number>();
  for (const d of declaracoes) {
    const key = `${d.candidato_id}::${d.tema_principal}`;
    matriz.set(key, (matriz.get(key) ?? 0) + 1);
  }

  if (mode === "final") {
    for (const c of candidatos) {
      for (const t of ENUM_VALIDOS.TEMA_VALIDOS) {
        const count = matriz.get(`${c.id}::${t}`) ?? 0;
        if (count !== 5) {
          errors.push(
            `final-mode: ${c.id} tem ${count} declaração(ões) em ${t}, esperado 5`,
          );
        }
      }
    }
  } else if (mode === "piloto") {
    for (const c of candidatos) {
      for (const t of ENUM_VALIDOS.TEMA_VALIDOS) {
        const count = matriz.get(`${c.id}::${t}`) ?? 0;
        if (count !== 1) {
          errors.push(
            `piloto-mode: ${c.id} tem ${count} declaração(ões) em ${t}, esperado 1`,
          );
        }
      }
    }
  } else {
    // setup/cumulativo: permite ≤ 5 por (candidato, tema)
    for (const [key, count] of matriz) {
      if (count > 5) {
        errors.push(`incremental: ${key} tem ${count} declarações (máximo 5)`);
      }
    }
  }

  // 4. archive_url em 100%
  for (const d of declaracoes) {
    if (!d.archive_url || d.archive_url.trim() === "") {
      errors.push(`declaração ${d.id} sem archive_url Wayback`);
    }
  }

  // 5. Janela temporal
  for (const d of declaracoes) {
    const evId = eventoDeDeclaracao.get(d.id);
    if (!evId) {
      errors.push(`declaração ${d.id} sem evento_id mapeado`);
      continue;
    }
    const evento = eventos.find((e) => e.id === evId);
    if (!evento) {
      errors.push(
        `declaração ${d.id} referencia evento_id=${evId} inexistente`,
      );
      continue;
    }
    const ts = Date.parse(evento.data);
    if (Number.isNaN(ts)) {
      errors.push(`evento ${evento.id} tem data inválida: ${evento.data}`);
      continue;
    }
    if (ts < JANELA_INICIO || ts > JANELA_FIM) {
      errors.push(
        `declaração ${d.id} em evento ${evento.id} (data=${evento.data}) fora da janela [2025-05-15, 2026-05-15]`,
      );
    }
  }

  if (errors.length > 0) {
    lines.push(`## ❌ ${errors.length} problema(s)`);
    lines.push(``);
    for (const e of errors) lines.push(`- ${e}`);
  } else {
    lines.push(`## ✅ PASS`);
    lines.push(``);
    lines.push(
      `Todas as invariantes da Fase 4 satisfeitas para o modo "${mode}".`,
    );
  }

  return { ok: errors.length === 0, errors, report: lines.join("\n") };
}

function loadEventoDeDeclaracaoMap(): Map<string, string> {
  const map = new Map<string, string>();
  const decDir = join(process.cwd(), "data", "declaracoes");
  try {
    const files = readdirSync(decDir).filter(
      (f: string) => f.endsWith(".md") && !f.startsWith("."),
    );
    for (const file of files) {
      const raw = readFileSync(join(decDir, file), "utf-8");
      const { data } = matter(raw);
      if (data.id && data.evento_id) {
        map.set(data.id as string, data.evento_id as string);
      }
    }
  } catch {
    // diretório não existe ou vazio
  }
  return map;
}

function isMain(): boolean {
  return import.meta.url === pathToFileURL(process.argv[1] ?? "").href;
}

function parseMode(args: string[]): AuditMode {
  if (args.includes("--final-mode")) return "final";
  if (args.includes("--piloto-mode")) return "piloto";
  return "setup";
}

if (isMain()) {
  const candidatos = loadCandidatos();
  const declaracoes = loadDeclaracoes();
  const eventos = loadEventos();
  const eventoDeDeclaracao = loadEventoDeDeclaracaoMap();

  const mode = parseMode(process.argv.slice(2));
  const { ok, errors, report } = auditarParidade({
    mode,
    candidatos,
    declaracoes,
    eventos,
    eventoDeDeclaracao,
  });

  const outPath = join(process.cwd(), "docs", "audit-fase4.md");
  mkdirSync(join(process.cwd(), "docs"), { recursive: true });
  writeFileSync(outPath, report + "\n", "utf-8");

  if (ok) {
    console.log(
      `✅ Auditoria de paridade (${mode}) PASS — relatório em docs/audit-fase4.md`,
    );
    process.exit(0);
  } else {
    console.error(
      `❌ Auditoria de paridade (${mode}) falhou com ${errors.length} problema(s):`,
    );
    for (const e of errors) console.error(`  - ${e}`);
    console.error(`\nRelatório completo: docs/audit-fase4.md`);
    process.exit(1);
  }
}
