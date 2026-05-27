import { readFileSync, writeFileSync, mkdirSync, readdirSync, existsSync } from "node:fs";
import { join, extname } from "node:path";
import { pathToFileURL } from "node:url";
import Papa from "papaparse";
import matter from "gray-matter";
import { DATASET_DIR, DECLARACOES_DIR } from "./lib/paths";
import { logger } from "./lib/logger";

type Declaracao = Record<string, unknown>;

type FlatDeclaracao = {
  id: string;
  slug: string;
  candidato_id: string;
  evento_id: string;
  texto: string;
  timestamp_no_evento: string;
  contexto: string;
  tema_principal: string;
  temas_secundarios: string;
  tipo_estrutural: string;
  fonte_primaria_url: string;
  fonte_primaria_tipo: string;
  archive_url: string;
  snapshot_interno_path: string;
  contexto_adicional_texto: string;
  contexto_adicional_fontes_count: number;
  vereditos_externos_count: number;
  vereditos_externos_veiculos: string;
  versao: number;
  criado_em: string;
  atualizado_em: string;
};

function asString(value: unknown): string {
  if (value === null || value === undefined) return "";
  if (typeof value === "string") return value;
  if (typeof value === "number" || typeof value === "boolean") return String(value);
  return "";
}

function asStringArray(value: unknown): string[] {
  return Array.isArray(value) ? value.map(asString) : [];
}

export function flattenDeclaracao(d: Declaracao): FlatDeclaracao {
  const contextoAdicional = d.contexto_adicional as
    | { texto?: string; fontes?: unknown[] }
    | null
    | undefined;
  const vereditos = (d.vereditos_externos as Array<{ veiculo?: string }> | undefined) ?? [];

  return {
    id: asString(d.id),
    slug: asString(d.slug),
    candidato_id: asString(d.candidato_id),
    evento_id: asString(d.evento_id),
    texto: asString(d.texto),
    timestamp_no_evento: asString(d.timestamp_no_evento),
    contexto: asString(d.contexto),
    tema_principal: asString(d.tema_principal),
    temas_secundarios: asStringArray(d.temas_secundarios).join(";"),
    tipo_estrutural: asStringArray(d.tipo_estrutural).join(";"),
    fonte_primaria_url: asString(d.fonte_primaria_url),
    fonte_primaria_tipo: asString(d.fonte_primaria_tipo),
    archive_url: asString(d.archive_url),
    snapshot_interno_path: asString(d.snapshot_interno_path),
    contexto_adicional_texto: asString(contextoAdicional?.texto),
    contexto_adicional_fontes_count: Array.isArray(contextoAdicional?.fontes)
      ? contextoAdicional.fontes.length
      : 0,
    vereditos_externos_count: vereditos.length,
    vereditos_externos_veiculos: vereditos.map((v) => asString(v.veiculo)).join(";"),
    versao: typeof d.versao === "number" ? d.versao : 0,
    criado_em: asString(d.criado_em),
    atualizado_em: asString(d.atualizado_em),
  };
}

export function toJsonl(items: Array<Record<string, unknown>>): string {
  if (items.length === 0) return "";
  return items.map((item) => JSON.stringify(item)).join("\n") + "\n";
}

export function toCsv(items: Array<Record<string, unknown>>): string {
  return Papa.unparse(items, { header: true, newline: "\n" });
}

const SCHEMA_DOC = `# Atlas Declarações — Dataset

Exportado de \`data/declaracoes/*.md\` pelo script \`scripts/export-dataset.ts\`.

## Formatos

- \`atlas-declaracoes.jsonl\` — uma declaração por linha (JSON Lines)
- \`atlas-declaracoes.csv\` — mesma estrutura achatada em CSV

## Convenções de achatamento

- Arrays de string viram lista separada por \`;\` (ex: \`temas_secundarios\`, \`tipo_estrutural\`)
- \`contexto_adicional\` (objeto opcional) achatado como \`contexto_adicional_texto\` e \`contexto_adicional_fontes_count\`
- \`vereditos_externos\` (array de objetos) virou \`vereditos_externos_count\` + \`vereditos_externos_veiculos\` (lista \`;\`)

## Schema fonte da verdade

O schema completo (tipos, validações) está em \`data/schemas/declaracao.schema.json\` (JSON Schema draft-07).
Para análise programática, prefira o JSONL onde os objetos preservam nesting.

## Licença

CC-BY 4.0 — atribuição obrigatória ao Atlas dos Candidatos · 2026.
`;

function run(): void {
  if (!existsSync(DECLARACOES_DIR)) {
    logger.error(`Diretório de declarações não encontrado: ${DECLARACOES_DIR}`);
    process.exit(1);
  }

  const files = readdirSync(DECLARACOES_DIR).filter((f) => extname(f) === ".md");
  if (files.length === 0) {
    logger.warn(`Nenhuma declaração em ${DECLARACOES_DIR}. Nada a exportar.`);
    return;
  }

  logger.info(`Lendo ${files.length} declaração(ões)...`);
  const declaracoes: Declaracao[] = files.map((f) => {
    const parsed = matter(readFileSync(join(DECLARACOES_DIR, f), "utf-8"));
    return parsed.data;
  });

  const flat = declaracoes.map(flattenDeclaracao);

  mkdirSync(DATASET_DIR, { recursive: true });

  const jsonlPath = join(DATASET_DIR, "atlas-declaracoes.jsonl");
  writeFileSync(jsonlPath, toJsonl(declaracoes), "utf-8");
  logger.success(`JSONL: ${jsonlPath}`);

  const csvPath = join(DATASET_DIR, "atlas-declaracoes.csv");
  writeFileSync(csvPath, toCsv(flat) + "\n", "utf-8");
  logger.success(`CSV: ${csvPath}`);

  const schemaPath = join(DATASET_DIR, "SCHEMA.md");
  writeFileSync(schemaPath, SCHEMA_DOC, "utf-8");
  logger.success(`Doc: ${schemaPath}`);

  logger.info(`\nTotal: ${flat.length} declaração(ões) exportada(s).`);
}

const isMain = import.meta.url === pathToFileURL(process.argv[1] ?? "").href;
if (isMain) {
  try {
    run();
  } catch (err: unknown) {
    logger.error(err instanceof Error ? err : String(err));
    process.exit(1);
  }
}
