import type { Person, WithContext } from "schema-dts";
import type { Candidato } from "@/types";

/**
 * Constrói o JSON-LD Schema.org/Person para um candidato.
 *
 * Inclui apenas contas oficiais verificadas em `sameAs` (sinal de confiança
 * para crawlers). Inclui `memberOf` como PoliticalParty quando partido existe.
 *
 * Fonte do tipo: schema-dts (Context7 /google/schema-dts).
 */
export function buildPersonSchema(candidato: Candidato, siteUrl: string): WithContext<Person> {
  const { data } = candidato;
  const sameAs = data.contas_oficiais.filter((c) => c.verificada).map((c) => c.url);

  const schema: WithContext<Person> = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: data.nome,
    url: `${siteUrl}/candidatos/${data.slug}`,
    description: data.biografia_minima,
    memberOf: {
      "@type": "PoliticalParty",
      name: data.partido,
    },
  };

  if (data.foto_url) {
    schema.image = data.foto_url;
  }
  if (sameAs.length > 0) {
    schema.sameAs = sameAs;
  }

  return schema;
}
