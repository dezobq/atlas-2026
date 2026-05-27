import { getCollection, getEntry } from "astro:content";
import type { Declaracao } from "@types";

export async function getAllDeclaracoes(): Promise<Declaracao[]> {
  const declaracoes = await getCollection("declaracoes");
  return declaracoes.sort(
    (a, b) => new Date(b.data.criado_em).getTime() - new Date(a.data.criado_em).getTime(),
  );
}

export async function getDeclaracaoById(id: string): Promise<Declaracao | undefined> {
  return await getEntry("declaracoes", id);
}

export async function getDeclaracoesByCandidato(candidatoId: string): Promise<Declaracao[]> {
  const declaracoes = await getCollection(
    "declaracoes",
    ({ data }) => data.candidato_id === candidatoId,
  );
  return declaracoes.sort(
    (a, b) => new Date(b.data.criado_em).getTime() - new Date(a.data.criado_em).getTime(),
  );
}

export async function getDeclaracoesByTema(temaSlug: string): Promise<Declaracao[]> {
  const declaracoes = await getCollection(
    "declaracoes",
    ({ data }) => data.tema_principal === temaSlug || data.temas_secundarios.includes(temaSlug),
  );
  return declaracoes.sort(
    (a, b) => new Date(b.data.criado_em).getTime() - new Date(a.data.criado_em).getTime(),
  );
}

export async function getDeclaracoesByEvento(eventoId: string): Promise<Declaracao[]> {
  const declaracoes = await getCollection("declaracoes", ({ data }) => data.evento_id === eventoId);
  return declaracoes.sort((a, b) => {
    if (a.data.timestamp_no_evento && b.data.timestamp_no_evento) {
      return a.data.timestamp_no_evento.localeCompare(b.data.timestamp_no_evento);
    }
    return 0;
  });
}
