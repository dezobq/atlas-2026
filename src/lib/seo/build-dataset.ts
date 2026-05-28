import type { Dataset, DataDownload, WithContext } from "schema-dts";

export interface DatasetMeta {
  version: string;
  downloads: Array<{ format: string; url: string }>;
  totalDeclaracoes: number;
}

/**
 * Constrói o JSON-LD Schema.org/Dataset para a página /dataset.
 *
 * Inclui:
 * - distribution[]: cada formato (JSONL, CSV) como DataDownload
 * - license: CC-BY 4.0
 * - version + numberOfItems (totalDeclaracoes)
 *
 * Schema.org/Dataset: https://schema.org/Dataset
 */
export function buildDatasetSchema(
  meta: DatasetMeta,
  siteUrl: string,
): WithContext<Dataset> & { numberOfItems: number } {
  const distribution: DataDownload[] = meta.downloads.map((d) => ({
    "@type": "DataDownload" as const,
    encodingFormat: d.format,
    contentUrl: d.url,
  }));

  const schema: WithContext<Dataset> & { numberOfItems: number } = {
    "@context": "https://schema.org",
    "@type": "Dataset",
    name: "Atlas dos Candidatos 2026 — Declarações",
    description:
      "Memória factual de declarações de candidatos à presidência do Brasil em 2026, com fonte primária verificável (vídeo timestamped, transcrição oficial, link arquivado) e vereditos externos quando disponíveis.",
    url: `${siteUrl}/dataset`,
    license: "https://creativecommons.org/licenses/by/4.0/",
    version: meta.version,
    numberOfItems: meta.totalDeclaracoes,
    distribution,
    creator: {
      "@type": "Organization",
      name: "Atlas dos Candidatos 2026",
      url: siteUrl,
    },
  };

  return schema;
}
