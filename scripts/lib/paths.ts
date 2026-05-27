import { resolve } from "node:path";

const root = process.cwd();

export const DATA_DIR = resolve(root, "data");
export const CACHE_DIR = resolve(root, ".cache");
export const PUBLIC_DIR = resolve(root, "public");
export const OG_DIR = resolve(root, "public", "og");
export const DATASET_DIR = resolve(root, "dist-dataset");

export const CANDIDATOS_DIR = resolve(DATA_DIR, "candidatos");
export const TEMAS_DIR = resolve(DATA_DIR, "temas");
export const EVENTOS_DIR = resolve(DATA_DIR, "eventos");
export const DECLARACOES_DIR = resolve(DATA_DIR, "declaracoes");
