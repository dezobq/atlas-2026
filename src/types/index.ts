import type { CollectionEntry } from "astro:content";

export type Candidato = CollectionEntry<"candidatos">;
export type Tema = CollectionEntry<"temas">;
export type Evento = CollectionEntry<"eventos">;
export type Declaracao = CollectionEntry<"declaracoes">;

export type CandidatoData = Candidato["data"];
export type TemaData = Tema["data"];
export type EventoData = Evento["data"];
export type DeclaracaoData = Declaracao["data"];

export type FonteTipo =
  | "youtube_oficial"
  | "tse"
  | "camara"
  | "senado"
  | "diario_oficial"
  | "midia_consolidada"
  | "rede_social_oficial";

export type TipoEstrutural =
  | "promessa"
  | "dado_numerico"
  | "atribuicao_a_terceiro"
  | "afirmacao_historica"
  | "comparacao"
  | "afirmacao_sobre_pesquisa"
  | "compromisso_politico"
  | "interpretacao_pessoal";

export type EventoTipo =
  | "debate"
  | "entrevista"
  | "comicio"
  | "post_rede_social"
  | "sabatina"
  | "declaracao_oficial";
