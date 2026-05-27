/**
 * Testes unitários dos loaders de dados (temas).
 *
 * astro:content é mapeado via alias Vite (vitest.config.ts) para
 * tests/__mocks__/astro-content.ts, que expõe vi.fn() para
 * getCollection/getEntry. Isso evita a necessidade do Astro Vite plugin
 * em runtime de testes — o módulo virtual é substituído por stubs controláveis.
 *
 * Bug 5 resolvido em Plan 2 Task 3 via Approach B (alias Vite + mock local).
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { getCollection } from "astro:content";
import { getAllTemas, getTemaBySlug } from "@/lib/data/temas";

// Tipo mínimo compatível com CollectionEntry<"temas">
interface TemaEntry {
  id: string;
  collection: "temas";
  data: {
    id: string;
    slug: string;
    nome: string;
    descricao_curta: string;
    nivel: "primario" | "secundario";
    tema_pai_id?: string | null;
  };
}

const mockGetCollection = vi.mocked(getCollection);

function makeTema(
  id: string,
  nome: string,
  slug: string,
  nivel: "primario" | "secundario" = "primario",
): TemaEntry {
  return {
    id,
    collection: "temas",
    data: {
      id,
      slug,
      nome,
      descricao_curta: `Descrição de teste para ${nome}`,
      nivel,
      tema_pai_id: null,
    },
  };
}

const temasMock: TemaEntry[] = [
  makeTema("economia", "Economia", "economia"),
  makeTema("educacao", "Educação", "educacao"),
  makeTema("saude", "Saúde", "saude"),
  makeTema("seguranca", "Segurança", "seguranca"),
  makeTema("meio-ambiente", "Meio Ambiente", "meio-ambiente"),
  makeTema("tecnologia", "Tecnologia", "tecnologia"),
];

describe("temas loader (mocked astro:content via alias Vite)", () => {
  beforeEach(() => {
    mockGetCollection.mockReset();
  });

  it("retorna todos os temas primários", async () => {
    mockGetCollection.mockResolvedValue(temasMock);
    const temas = await getAllTemas();
    expect(temas.length).toBeGreaterThanOrEqual(6);
    expect(temas.every((t) => t.data.nivel === "primario")).toBe(true);
  });

  it("retorna tema por slug", async () => {
    // getAllTemas e getTemaBySlug chamam getCollection com filtro opcional.
    // Simulamos o comportamento real: aplicar o filtro ao mock dataset.
    mockGetCollection.mockImplementation(async (_col, filter) => {
      await Promise.resolve();
      const all = temasMock;
      return filter ? all.filter(filter) : all;
    });
    const economia = await getTemaBySlug("economia");
    expect(economia).toBeDefined();
    expect(economia?.data.nome).toBe("Economia");
  });

  it("retorna undefined para slug inexistente", async () => {
    mockGetCollection.mockImplementation(async (_col, filter) => {
      await Promise.resolve();
      const all = temasMock;
      return filter ? all.filter(filter) : all;
    });
    const fake = await getTemaBySlug("tema-inexistente");
    expect(fake).toBeUndefined();
  });

  it("temas ordenados por nome", async () => {
    mockGetCollection.mockResolvedValue(temasMock);
    const temas = await getAllTemas();
    const nomes = temas.map((t) => t.data.nome);
    const sorted = [...nomes].sort((a, b) => a.localeCompare(b, "pt-BR"));
    expect(nomes).toEqual(sorted);
  });
});
