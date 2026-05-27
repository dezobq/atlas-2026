import { describe, it, expect } from "vitest";
import { formatDateBR, formatDateLong, formatRelative } from "@/lib/utils/format-date";

describe("formatDateBR", () => {
  it("formata data ISO em dd/mm/aaaa", () => {
    expect(formatDateBR("2026-11-02T21:34:00.000Z")).toBe("02/11/2026");
  });

  it("formata Date object", () => {
    expect(formatDateBR(new Date(Date.UTC(2026, 10, 2)))).toBe("02/11/2026");
  });
});

describe("formatDateLong", () => {
  it("formata por extenso em PT-BR", () => {
    expect(formatDateLong("2026-11-02T12:00:00.000Z")).toMatch(/02 de novembro de 2026/);
  });
});

describe("formatRelative", () => {
  it("retorna 'hoje' para data atual", () => {
    expect(formatRelative(new Date())).toBe("hoje");
  });

  it("retorna 'ontem' para 1 dia atrás", () => {
    const ontem = new Date();
    ontem.setDate(ontem.getDate() - 1);
    expect(formatRelative(ontem)).toBe("ontem");
  });

  it("retorna 'há X dias' para 2-29 dias atrás", () => {
    const haDias = new Date();
    haDias.setDate(haDias.getDate() - 5);
    expect(formatRelative(haDias)).toBe("há 5 dias");
  });
});
