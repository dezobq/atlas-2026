import { getCollection, getEntry } from "astro:content";
import type { Tema } from "@/types";

export async function getAllTemas(): Promise<Tema[]> {
  const temas = await getCollection("temas");
  return temas.sort((a, b) => a.data.nome.localeCompare(b.data.nome, "pt-BR"));
}

export async function getTemaBySlug(slug: string): Promise<Tema | undefined> {
  const temas = await getCollection("temas", ({ data }) => data.slug === slug);
  return temas[0];
}

export async function getTemaById(id: string): Promise<Tema | undefined> {
  return await getEntry("temas", id);
}
