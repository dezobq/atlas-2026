import type { Event as SchemaEvent, Person, WithContext } from "schema-dts";
import type { Candidato, Evento } from "@/types";

/**
 * Constrói o JSON-LD Schema.org/Event para um evento.
 *
 * Inclui performer[] como Person inline para cada candidato envolvido
 * (filtrado contra a lista de candidatos passada, ignora referências órfãs).
 *
 * Schema.org/Event: https://schema.org/Event
 */
export function buildEventSchema(
  evento: Evento,
  candidatos: Candidato[],
  siteUrl: string,
): WithContext<SchemaEvent> {
  const candidatosPorId = new Map(candidatos.map((c) => [c.data.id, c]));

  const performer: Person[] = evento.data.candidatos_envolvidos
    .map((c) => candidatosPorId.get(c.candidato_id))
    .filter((c): c is Candidato => c !== undefined)
    .map((c) => ({
      "@type": "Person" as const,
      name: c.data.nome,
      url: `${siteUrl}/candidatos/${c.data.slug}`,
    }));

  const schema: WithContext<SchemaEvent> = {
    "@context": "https://schema.org",
    "@type": "Event",
    name: evento.data.titulo,
    description: evento.data.descricao,
    startDate: evento.data.data,
    url: `${siteUrl}/eventos/${evento.data.id}`,
    performer,
  };

  if (evento.data.local.fisico) {
    schema.location = {
      "@type": "Place",
      name: evento.data.local.fisico,
    };
  }

  return schema;
}
