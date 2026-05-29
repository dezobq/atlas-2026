export const meta = {
  name: 'atlas-auditoria-readonly',
  description: 'Auditoria read-only do atlas: estrutura, neutralidade editorial e coerencia de fontes, com verificacao adversarial de cada achado',
  phases: [
    { title: 'Inventario', detail: 'mapear artefatos e cobertura em data/' },
    { title: 'Auditar', detail: 'uma dimensao por agente em paralelo' },
    { title: 'Verificar', detail: 'cetico confirma cada achado' },
  ],
}

const ROOT = 'C:/Users/dezob/Projects/atlas'

const INVENTORY_SCHEMA = {
  type: 'object',
  properties: {
    candidatos: { type: 'array', items: { type: 'string' } },
    temas: { type: 'array', items: { type: 'string' } },
    declaracoes_count: { type: 'integer' },
    eventos_count: { type: 'integer' },
    coverage_notes: { type: 'string' },
  },
  required: ['candidatos', 'temas', 'declaracoes_count', 'eventos_count', 'coverage_notes'],
}

const FINDINGS_SCHEMA = {
  type: 'object',
  properties: {
    dimension: { type: 'string' },
    findings: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          severity: { type: 'string', enum: ['alta', 'media', 'baixa'] },
          file: { type: 'string' },
          issue: { type: 'string' },
          evidence: { type: 'string' },
          suggestion: { type: 'string' },
        },
        required: ['severity', 'file', 'issue', 'evidence', 'suggestion'],
      },
    },
  },
  required: ['dimension', 'findings'],
}

const VERDICT_SCHEMA = {
  type: 'object',
  properties: {
    confirmed: { type: 'boolean' },
    reasoning: { type: 'string' },
  },
  required: ['confirmed', 'reasoning'],
}

phase('Inventario')
const inv = await agent(
  `Voce e um auditor READ-ONLY do projeto atlas (memoria factual da eleicao 2026, sem julgamento editorial). NAO modifique nenhum arquivo.
Explore a pasta de dados em ${ROOT}/data usando ferramentas de leitura/busca (Read, Grep, Bash ls).
Liste:
- todos os candidatos (arquivos em data/candidatos/*.yaml) pelo slug
- todos os temas (arquivos em data/temas/*.yaml) pelo nome do arquivo
- quantas declaracoes existem (procure data/declaracoes ou similar; se nao houver, 0)
- quantos eventos existem (procure data/eventos; se nao houver, 0)
- coverage_notes: observacoes sobre lacunas de cobertura (ex.: temas sem declaracoes, desequilibrio entre candidatos).
Retorne os dados estruturados.`,
  { schema: INVENTORY_SCHEMA, phase: 'Inventario', label: 'inventario' }
)

const invSummary = `Candidatos: ${(inv?.candidatos || []).join(', ') || 'nenhum'}. Temas: ${(inv?.temas || []).join(', ') || 'nenhum'}. Declaracoes: ${inv?.declaracoes_count ?? '?'}. Eventos: ${inv?.eventos_count ?? '?'}.`

const DIMENSIONS = [
  {
    key: 'estrutura',
    prompt: `Auditoria READ-ONLY de CONFORMIDADE ESTRUTURAL no atlas (${ROOT}). NAO modifique arquivos.
Contexto: ${invSummary}
Leia os schemas em ${ROOT}/data/schemas/*.schema.json e compare com os arquivos reais em ${ROOT}/data/candidatos/*.yaml e ${ROOT}/data/temas/*.yaml.
Procure: campos obrigatorios ausentes, formatos invalidos (datas, URIs, slugs), IDs/eneums fora do permitido, inconsistencias de tipo.
Para CADA problema real, registre file, issue, evidence (trecho exato), suggestion. Se nao houver problemas, retorne findings vazio.`,
  },
  {
    key: 'neutralidade',
    prompt: `Auditoria READ-ONLY de NEUTRALIDADE EDITORIAL no atlas (${ROOT}). NAO modifique arquivos.
O projeto se compromete a NAO emitir julgamento editorial: apenas fatos com fonte. Leia os textos em ${ROOT}/data/candidatos/*.yaml (biografia_minima) e ${ROOT}/data/temas/*.yaml (descricoes).
Procure: adjetivos valorativos, enquadramento tendencioso, elogio/critica implicita, linguagem nao-neutra, assimetria de tratamento entre candidatos.
IMPORTANTE: fato verificavel e neutro NAO e vies. Seja conservador. Para cada problema real, registre file, issue, evidence (trecho exato), suggestion de reescrita neutra. Se nada, findings vazio.`,
  },
  {
    key: 'fontes',
    prompt: `Auditoria READ-ONLY de COERENCIA DE FONTES E LINKS no atlas (${ROOT}). NAO modifique arquivos.
Leia ${ROOT}/data/candidatos/*.yaml (contas_oficiais: plataforma/handle/url/verificada) e quaisquer declaracoes existentes.
Procure incoerencias SEMANTICAS que um validador de schema NAO pega: url cuja plataforma nao bate com o campo declarado, handle inconsistente com a url, fonte_primaria_tipo que nao corresponde ao dominio da fonte_primaria_url, marcacoes 'verificada: true' sem plausibilidade.
NAO faca requisicoes de rede; avalie por coerencia interna. Para cada problema, registre file, issue, evidence, suggestion. Se nada, findings vazio.`,
  },
]

const audited = await pipeline(
  DIMENSIONS,
  (d) => agent(d.prompt, { schema: FINDINGS_SCHEMA, phase: 'Auditar', label: `audit:${d.key}` }),
  (review, d) =>
    parallel(
      ((review && review.findings) || []).map((f) => () =>
        agent(
          `Voce e um CETICO rigoroso revisando um achado de auditoria do atlas (dimensao: ${review.dimension}).
Achado: "${f.issue}"
Arquivo: ${f.file}
Evidencia citada: "${f.evidence}"
Severidade alegada: ${f.severity}
Tarefa: leia o arquivo real em ${ROOT}/${f.file} (ou o caminho indicado) e determine se este e um problema GENUINO ou um falso positivo.
Default para confirmed=false se houver duvida. So confirme se a evidencia comprova claramente o problema. Para 'neutralidade', lembre: fato neutro NAO e vies.
Retorne confirmed (bool) e reasoning curto.`,
          { schema: VERDICT_SCHEMA, phase: 'Verificar', label: `verify:${d.key}` }
        ).then((v) => ({ ...f, dimension: review.dimension, verdict: v }))
      )
    )
)

const all = audited.flat().filter(Boolean)
const confirmed = all.filter((f) => f.verdict && f.verdict.confirmed)
const rejected = all.filter((f) => !(f.verdict && f.verdict.confirmed))

log(`Inventario: ${invSummary}`)
log(`Achados: ${all.length} brutos -> ${confirmed.length} confirmados, ${rejected.length} descartados pelo cetico`)

return {
  inventory: inv,
  confirmed,
  rejected: rejected.map((f) => ({ dimension: f.dimension, issue: f.issue, motivo_descarte: f.verdict && f.verdict.reasoning })),
}
