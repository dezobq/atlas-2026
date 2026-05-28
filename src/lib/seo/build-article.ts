import type { Article, WithContext } from "schema-dts";
import type { Candidato, Declaracao } from "@/types";

const HEADLINE_MAX_TEXT_CHARS = 110;

function truncateForHeadline(text: string): string {
  if (text.length <= HEADLINE_MAX_TEXT_CHARS) {
    return text;
  }
  return `${text.slice(0, HEADLINE_MAX_TEXT_CHARS).trimEnd()}…`;
}

/**
 * Constrói o JSON-LD Schema.org/Article wrapping para a página de uma declaração.
 *
 * O Atlas é o autor editorial (Organization). O candidato aparece como
 * sujeito da Quotation (separado em JSONLDQuotation).
 *
 * Schema.org/Article: https://schema.org/Article
 */
export function buildArticleSchema(
  declaracao: Declaracao,
  candidato: Candidato,
  siteUrl: string,
): WithContext<Article> {
  const truncated = truncateForHeadline(declaracao.data.texto);
  const headline = `${candidato.data.nome}: "${truncated}"`;
  const pageUrl = `${siteUrl}/declaracoes/${declaracao.data.id}`;

  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline,
    author: {
      "@type": "Organization",
      name: "Atlas dos Candidatos 2026",
      url: siteUrl,
    },
    datePublished: declaracao.data.criado_em,
    dateModified: declaracao.data.atualizado_em,
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": pageUrl,
    },
  };
}
