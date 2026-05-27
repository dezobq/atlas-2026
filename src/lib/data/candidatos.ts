import { getCollection, getEntry } from "astro:content";
import type { Candidato } from "@types";

export async function getAllCandidatos(): Promise<Candidato[]> {
  const candidatos = await getCollection("candidatos");
  return candidatos.sort((a, b) => a.data.nome.localeCompare(b.data.nome, "pt-BR"));
}

export async function getCandidatoBySlug(slug: string): Promise<Candidato | undefined> {
  const candidatos = await getCollection("candidatos", ({ data }) => data.slug === slug);
  return candidatos[0];
}

export async function getCandidatoById(id: string): Promise<Candidato | undefined> {
  return await getEntry("candidatos", id);
}
