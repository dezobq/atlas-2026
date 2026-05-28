import type { Quotation, WithContext } from "schema-dts";
import type { Candidato, Declaracao } from "@/types";

/**
 * Constrói o JSON-LD Schema.org/Quotation para uma declaração.
 *
 * Inclui:
 * - text: o texto exato da declaração
 * - spokenByCharacter: Person inline referenciando o candidato (sem alias completo)
 * - citation: URL da fonte primária
 * - url: URL canônica da página da declaração no Atlas
 *
 * Schema.org/Quotation: https://schema.org/Quotation
 */
export function buildQuotationSchema(
  declaracao: Declaracao,
  candidato: Candidato,
  siteUrl: string,
): WithContext<Quotation> {
  return {
    "@context": "https://schema.org",
    "@type": "Quotation",
    text: declaracao.data.texto,
    spokenByCharacter: {
      "@type": "Person",
      name: candidato.data.nome,
      url: `${siteUrl}/candidatos/${candidato.data.slug}`,
    },
    citation: declaracao.data.fonte_primaria_url,
    url: `${siteUrl}/declaracoes/${declaracao.data.id}`,
    dateCreated: declaracao.data.criado_em,
  };
}
