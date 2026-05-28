import { readFileSync, readdirSync, existsSync } from "node:fs";
import { join, extname } from "node:path";
import { parse as parseYaml } from "yaml";
import matter from "gray-matter";
import Papa from "papaparse";

export interface DeclaracaoFrontmatter {
  id: string;
  candidato_id: string;
  tema_principal: string;
  tipo_estrutural: string[];
  fonte_primaria_tipo: string;
  archive_url: string;
  vereditos_externos?: Array<{ veiculo: string }>;
}

export interface LogLine {
  declaracao_id: string;
  candidato_id: string;
  tema: string;
  tipo_estrutural: string;
  fonte_tipo: string;
  tem_veredito_externo: string; // "true" | "false" (CSV é string)
  motivo_inclusao: string;
  curador: string;
  validador: string;
  data_inclusao: string;
}

export interface CandidatoYaml {
  id: string;
  slug: string;
  nome: string;
}

export interface EventoYaml {
  id: string;
  data: string;
}

const DATA_DIR = join(process.cwd(), "data");

export function loadDeclaracoes(): DeclaracaoFrontmatter[] {
  const dir = join(DATA_DIR, "declaracoes");
  if (!existsSync(dir)) return [];
  return readdirSync(dir)
    .filter((f) => extname(f) === ".md" && !f.startsWith("."))
    .map((f) => {
      const raw = readFileSync(join(dir, f), "utf-8");
      const { data } = matter(raw);
      return data as DeclaracaoFrontmatter;
    });
}

export function loadCandidatos(): CandidatoYaml[] {
  const dir = join(DATA_DIR, "candidatos");
  if (!existsSync(dir)) return [];
  return readdirSync(dir)
    .filter((f) => extname(f) === ".yaml" && !f.startsWith("."))
    .map((f) => parseYaml(readFileSync(join(dir, f), "utf-8")) as CandidatoYaml);
}

export function loadEventos(): EventoYaml[] {
  const dir = join(DATA_DIR, "eventos");
  if (!existsSync(dir)) return [];
  return readdirSync(dir)
    .filter((f) => extname(f) === ".yaml" && !f.startsWith("."))
    .map((f) => parseYaml(readFileSync(join(dir, f), "utf-8")) as EventoYaml);
}

export function loadLogEditorial(): LogLine[] {
  const path = join(DATA_DIR, "log-editorial.csv");
  if (!existsSync(path)) return [];
  const raw = readFileSync(path, "utf-8");
  const result = Papa.parse<LogLine>(raw, { header: true, skipEmptyLines: true });
  return result.data;
}

const TEMA_VALIDOS = [
  "economia",
  "saude",
  "educacao",
  "seguranca-publica",
  "meio-ambiente",
  "politica-externa",
];
const TIPO_ESTRUTURAL_VALIDOS = [
  "promessa",
  "dado_numerico",
  "atribuicao_a_terceiro",
  "afirmacao_historica",
  "comparacao",
  "afirmacao_sobre_pesquisa",
  "compromisso_politico",
  "interpretacao_pessoal",
];
const FONTE_TIPO_VALIDOS = [
  "youtube_oficial",
  "tse",
  "camara",
  "senado",
  "diario_oficial",
  "midia_consolidada",
  "rede_social_oficial",
];

export const ENUM_VALIDOS = {
  TEMA_VALIDOS,
  TIPO_ESTRUTURAL_VALIDOS,
  FONTE_TIPO_VALIDOS,
} as const;
