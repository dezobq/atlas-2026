import { describe, it, expect } from "vitest";
import { buildDatasetSchema } from "@/lib/seo/build-dataset";

const testMeta = {
  version: "0.1.0",
  downloads: [
    {
      format: "application/x-ndjson",
      url: "https://atlas-2026.pages.dev/dataset/declaracoes.jsonl",
    },
    { format: "text/csv", url: "https://atlas-2026.pages.dev/dataset/declaracoes.csv" },
  ],
  totalDeclaracoes: 60,
};

describe("buildDatasetSchema", () => {
  it("retorna Dataset com @context e @type", () => {
    const schema = buildDatasetSchema(
      testMeta,
      "https://atlas-2026.pages.dev",
    ) as unknown as Record<string, unknown>;
    expect(schema["@context"]).toBe("https://schema.org");
    expect(schema["@type"]).toBe("Dataset");
  });

  it("inclui name e description fixos do Atlas", () => {
    const schema = buildDatasetSchema(
      { version: "0.1.0", downloads: [], totalDeclaracoes: 0 },
      "https://atlas-2026.pages.dev",
    ) as unknown as Record<string, unknown>;
    expect(schema.name).toBe("Atlas dos Candidatos 2026 — Declarações");
    expect(String(schema.description)).toContain("Memória factual");
  });

  it("inclui licença CC-BY 4.0", () => {
    const schema = buildDatasetSchema(
      { version: "0.1.0", downloads: [], totalDeclaracoes: 0 },
      "https://atlas-2026.pages.dev",
    ) as unknown as Record<string, unknown>;
    expect(schema.license).toBe("https://creativecommons.org/licenses/by/4.0/");
  });

  it("inclui version e numberOfItems", () => {
    const schema = buildDatasetSchema(
      { version: "0.1.0", downloads: [], totalDeclaracoes: 42 },
      "https://atlas-2026.pages.dev",
    ) as unknown as Record<string, unknown>;
    expect(schema.version).toBe("0.1.0");
    expect(schema.numberOfItems).toBe(42);
  });

  it("inclui distribution[] com cada download", () => {
    const schema = buildDatasetSchema(
      testMeta,
      "https://atlas-2026.pages.dev",
    ) as unknown as Record<string, unknown>;
    expect(schema.distribution).toEqual([
      {
        "@type": "DataDownload",
        encodingFormat: "application/x-ndjson",
        contentUrl: "https://atlas-2026.pages.dev/dataset/declaracoes.jsonl",
      },
      {
        "@type": "DataDownload",
        encodingFormat: "text/csv",
        contentUrl: "https://atlas-2026.pages.dev/dataset/declaracoes.csv",
      },
    ]);
  });

  it("inclui creator como Organization Atlas", () => {
    const schema = buildDatasetSchema(
      { version: "0.1.0", downloads: [], totalDeclaracoes: 0 },
      "https://atlas-2026.pages.dev",
    ) as unknown as Record<string, unknown>;
    expect(schema.creator).toEqual({
      "@type": "Organization",
      name: "Atlas dos Candidatos 2026",
      url: "https://atlas-2026.pages.dev",
    });
  });
});
