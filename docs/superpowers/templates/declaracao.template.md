---
# Template de declaração — copiar para data/declaracoes/<id>.md e preencher.
#
# id: formato YYYY-MM-DD-<candidato-slug>-<tema>-<descritor-curto>
#     ex: 2025-08-15-lula-luiz-inacio-economia-juros-selic
# slug: mesmo valor do id (regex /^[a-z0-9-]+$/)
# timestamp_no_evento: HH:MM:SS (ou null se fonte não tem timing)
# texto: literal, palavra por palavra, sem aspas externas
# contexto: 1–2 frases factuais ("Em resposta a X, candidato disse Y")
# tipo_estrutural: array com 1+ valores do enum
# tema_principal: slug de data/temas/ (economia, saude, etc)
# temas_secundarios: array de slugs (pode ser vazio)
# datas (criado_em, atualizado_em, vereditos_externos[].data): ISO 8601 em UTC
#     com sufixo Z (ex: 2025-11-30T23:30:00.000Z). Offsets -03:00 FALHAM no schema.

id: "<ID>"
slug: "<SLUG_IGUAL_AO_ID>"
candidato_id: "<SLUG_DO_CANDIDATO>" # = nome do arquivo em data/candidatos/ (ex: lula-luiz-inacio), NÃO o ULID
evento_id: "<ULID_DO_EVENTO>" # = nome do arquivo em data/eventos/ (o ULID de 26 chars)

texto: |
  <TRECHO_LITERAL_DA_DECLARAÇÃO_REVISADO_CONTRA_O_VÍDEO>

timestamp_no_evento: "<HH:MM:SS_OU_NULL>"
contexto: "<DESCRIÇÃO_FACTUAL_DO_CONTEXTO>"

tema_principal: "<SLUG_DE_TEMA>"
temas_secundarios: []

tipo_estrutural:
  - "<UM_OU_MAIS_DE: promessa|dado_numerico|atribuicao_a_terceiro|afirmacao_historica|comparacao|afirmacao_sobre_pesquisa|compromisso_politico|interpretacao_pessoal>"

fonte_primaria_url: "<URL_CANÔNICA>"
fonte_primaria_tipo: "<youtube_oficial|tse|camara|senado|diario_oficial|midia_consolidada|rede_social_oficial>"
archive_url: "<WAYBACK_URL>"
snapshot_interno_path: null

contexto_adicional: null # ou objeto {texto, fontes: [...]} quando houver fonte rigorosa

vereditos_externos: [] # array de {veiculo, classificacao, url, data, citacao_curta}

versao: 1
criado_em: "<ISO_8601>"
atualizado_em: "<ISO_8601>"
---

<!-- Corpo Markdown opcional para narrativa contextual.
     Não duplica os campos do frontmatter; serve só para texto editorial extra. -->
