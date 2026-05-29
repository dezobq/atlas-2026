import { readFileSync, readdirSync, existsSync } from "node:fs";
import { join, extname, basename } from "node:path";
import Ajv from "ajv";
import type { ValidateFunction } from "ajv";
import addFormats from "ajv-formats";
import { parse as parseYaml } from "yaml";
import matter from "gray-matter";

const ajv = new Ajv({ allErrors: true, strict: false });
addFormats(ajv);

const SCHEMAS_DIR = join(process.cwd(), "data", "schemas");
const DATA_DIR = join(process.cwd(), "data");

const collections = [
  { dir: "candidatos", ext: ".yaml", schema: "candidato.schema.json" },
  { dir: "temas", ext: ".yaml", schema: "tema.schema.json" },
  { dir: "eventos", ext: ".yaml", schema: "evento.schema.json" },
  { dir: "declaracoes", ext: ".md", schema: "declaracao.schema.json" },
  { dir: "criterio-selecao", ext: ".yaml", schema: "criterio-selecao.schema.json" },
];

function loadSchema(filename: string): ValidateFunction {
  const path = join(SCHEMAS_DIR, filename);
  if (!existsSync(path)) {
    throw new Error(`Schema não encontrado: ${path}. Rode 'pnpm generate-schemas' antes.`);
  }
  const raw = readFileSync(path, "utf-8");
  return ajv.compile(JSON.parse(raw) as object);
}

function parseFile(path: string, ext: string): unknown {
  const raw = readFileSync(path, "utf-8");
  if (ext === ".yaml") {
    return parseYaml(raw);
  }
  if (ext === ".md") {
    const { data } = matter(raw);
    return data;
  }
  throw new Error(`Extensão não suportada: ${ext}`);
}

let totalFiles = 0;
let totalErrors = 0;

for (const collection of collections) {
  const dir = join(DATA_DIR, collection.dir);
  if (!existsSync(dir)) {
    console.log(`⚠ Pulando ${collection.dir} (diretório não existe)`);
    continue;
  }

  const validate = loadSchema(collection.schema);
  const files = readdirSync(dir).filter((f) => extname(f) === collection.ext && !f.startsWith("."));

  if (files.length === 0) {
    console.log(`ℹ ${collection.dir}: 0 arquivos`);
    continue;
  }

  console.log(`\n📂 Validando ${collection.dir} (${files.length} arquivos)`);

  for (const file of files) {
    totalFiles += 1;
    const path = join(dir, file);

    try {
      const data = parseFile(path, collection.ext);
      const valid = validate(data);

      if (!valid) {
        totalErrors += 1;
        console.error(`  ✗ ${basename(file)}`);
        for (const err of validate.errors ?? []) {
          console.error(`     - ${err.instancePath || "(root)"} ${err.message}`);
        }
      } else {
        console.log(`  ✓ ${basename(file)}`);
      }
    } catch (e) {
      totalErrors += 1;
      console.error(`  ✗ ${basename(file)}: ${(e as Error).message}`);
    }
  }
}

console.log(`\n${"=".repeat(60)}`);
console.log(`Total: ${totalFiles} arquivos · Erros: ${totalErrors}`);

if (totalErrors > 0) {
  console.error(`\n❌ Validação falhou.`);
  process.exit(1);
}

// Validação do log editorial (Fase 4+)
console.log(`\n${"=".repeat(60)}`);
console.log(`Validando log editorial...`);
try {
  const { validarLog } = await import("./validate-log.js");
  const { loadDeclaracoes, loadLogEditorial } = await import("./lib/data-loaders.js");
  const result = validarLog(loadDeclaracoes(), loadLogEditorial());
  if (!result.ok) {
    console.error(`❌ log-editorial.csv tem ${result.errors.length} problema(s):`);
    for (const e of result.errors) console.error(`  - ${e}`);
    process.exit(1);
  }
  console.log(`✅ log-editorial.csv: validado.`);
} catch (e) {
  console.error(`❌ Erro ao validar log: ${(e as Error).message}`);
  process.exit(1);
}

// Validação semântica de proveniência (AI Policy P1)
console.log(`\n${"=".repeat(60)}`);
console.log(`Validando proveniência...`);
try {
  const { validarProveniencia } = await import("./validate-proveniencia.js");
  const { loadDeclaracoes } = await import("./lib/data-loaders.js");
  const result = validarProveniencia(loadDeclaracoes());
  if (!result.ok) {
    console.error(`❌ proveniencia tem ${result.errors.length} problema(s):`);
    for (const e of result.errors) console.error(`  - ${e}`);
    process.exit(1);
  }
  console.log(`✅ proveniencia: validada.`);
} catch (e) {
  console.error(`❌ Erro ao validar proveniência: ${(e as Error).message}`);
  process.exit(1);
}

console.log(`\n✅ Todos os dados são válidos.`);
process.exit(0);
