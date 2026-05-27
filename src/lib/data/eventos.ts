import { getCollection, getEntry } from "astro:content";
import type { Evento } from "@/types";

export async function getAllEventos(): Promise<Evento[]> {
  const eventos = await getCollection("eventos");
  return eventos.sort((a, b) => new Date(b.data.data).getTime() - new Date(a.data.data).getTime());
}

export async function getEventoById(id: string): Promise<Evento | undefined> {
  return await getEntry("eventos", id);
}

export async function getEventosByCandidato(candidatoId: string): Promise<Evento[]> {
  const eventos = await getCollection("eventos", ({ data }) =>
    data.candidatos_envolvidos.some((c) => c.candidato_id === candidatoId),
  );
  return eventos.sort((a, b) => new Date(b.data.data).getTime() - new Date(a.data.data).getTime());
}
