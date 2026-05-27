import { writeFileSync, mkdirSync } from "node:fs";
import { join } from "node:path";
import { z } from "zod";

const fonteTipoEnum = z.enum([
  "youtube_oficial",
  "tse",
  "camara",
  "senado",
  "diario_oficial",
  "midia_consolidada",
  "rede_social_oficial",
]);

const tipoEstruturalEnum = z.enum([
  "promessa",
  "dado_numerico",
  "atribuicao_a_terceiro",
  "afirmacao_historica",
  "comparacao",
  "afirmacao_sobre_pesquisa",
  "compromisso_politico",
  "interpretacao_pessoal",
]);

const eventoTipoEnum = z.enum([
  "debate",
  "entrevista",
  "comicio",
  "post_rede_social",
  "sabatina",
  "declaracao_oficial",
]);

const veiculoVeredito = z.enum([
  "Lupa",
  "Aos Fatos",
  "Comprova",
  "Estadão Verifica",
  "Agência Pública",
  "BBC Verify",
  "outro",
]);

const contaOficialSchema = z.object({
  plataforma: z.enum(["youtube", "x", "instagram", "facebook", "tiktok"]),
  handle: z.string().min(1),
  url: z.string().url(),
  verificada: z.boolean(),
});

const candidatoSchema = z.object({
  id: z.string().min(1),
  slug: z.string().regex(/^[a-z0-9-]+$/),
  nome: z.string().min(1),
  foto_url: z.string().url().optional(),
  partido: z.string().min(1),
  biografia_minima: z.string().min(10).max(500),
  contas_oficiais: z.array(contaOficialSchema).default([]),
  criado_em: z.string().datetime(),
  atualizado_em: z.string().datetime(),
});

const temaSchema = z.object({
  id: z.string().min(1),
  slug: z.string().regex(/^[a-z0-9-]+$/),
  nome: z.string().min(1),
  descricao_curta: z.string().min(10).max(280),
  nivel: z.enum(["primario", "secundario"]),
  tema_pai_id: z.string().nullable().optional(),
});

const eventoSchema = z.object({
  id: z.string().min(1),
  titulo: z.string().min(1),
  data: z.string().datetime(),
  tipo: eventoTipoEnum,
  local: z.object({
    fisico: z.string().nullable(),
    digital: z.string().nullable(),
  }),
  duracao_minutos: z.number().int().positive().nullable(),
  fonte_primaria_url: z.string().url(),
  fonte_primaria_tipo: fonteTipoEnum,
  archive_url: z.string().url(),
  candidatos_envolvidos: z.array(z.object({ candidato_id: z.string().min(1) })).min(1),
  descricao: z.string().min(10),
  criado_em: z.string().datetime(),
  atualizado_em: z.string().datetime(),
});

const declaracaoSchema = z.object({
  id: z.string().min(1),
  slug: z.string().regex(/^[a-z0-9-]+$/),
  candidato_id: z.string().min(1),
  evento_id: z.string().min(1),
  texto: z.string().min(1),
  timestamp_no_evento: z
    .string()
    .regex(/^\d{2}:\d{2}:\d{2}$/)
    .nullable(),
  contexto: z.string().min(10).max(500),
  tema_principal: z.string().min(1),
  temas_secundarios: z.array(z.string()).default([]),
  tipo_estrutural: z.array(tipoEstruturalEnum).min(1),
  fonte_primaria_url: z.string().url(),
  fonte_primaria_tipo: fonteTipoEnum,
  archive_url: z.string().url(),
  snapshot_interno_path: z.string().nullable().optional(),
  contexto_adicional: z
    .object({
      texto: z.string().min(10),
      fontes: z
        .array(
          z.object({
            tipo: z.string().min(1),
            url: z.string().url(),
            data: z.string().datetime(),
          }),
        )
        .min(1),
    })
    .nullable()
    .optional(),
  vereditos_externos: z
    .array(
      z.object({
        veiculo: veiculoVeredito,
        classificacao: z.string().min(1),
        url: z.string().url(),
        data: z.string().datetime(),
        citacao_curta: z.string().min(1).max(300),
      }),
    )
    .default([]),
  versao: z.number().int().positive(),
  criado_em: z.string().datetime(),
  atualizado_em: z.string().datetime(),
});

const outDir = join(process.cwd(), "data", "schemas");
mkdirSync(outDir, { recursive: true });

function write(name: string, schema: z.ZodTypeAny): void {
  const jsonSchema = z.toJSONSchema(schema, {
    target: "draft-7",
    unrepresentable: "any",
  });
  // Add a top-level $schema reference and title for human readability
  const enriched = {
    $schema: "http://json-schema.org/draft-07/schema#",
    title: name,
    ...jsonSchema,
  };
  const path = join(outDir, `${name}.schema.json`);
  writeFileSync(path, JSON.stringify(enriched, null, 2) + "\n", "utf-8");
  console.log(`✓ ${path}`);
}

write("candidato", candidatoSchema);
write("tema", temaSchema);
write("evento", eventoSchema);
write("declaracao", declaracaoSchema);

console.log("\n✅ JSON Schemas gerados com sucesso.");
