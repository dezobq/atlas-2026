import { describe, it, expect } from "vitest";
import type { Person, WithContext } from "schema-dts";
import { safeJsonLd } from "@/lib/seo/safe-json-ld";

describe("safeJsonLd", () => {
  it("serializa um objeto Schema.org Person com @context", () => {
    const person: WithContext<Person> = {
      "@context": "https://schema.org",
      "@type": "Person",
      name: "Candidato A",
    };
    const output = safeJsonLd(person);
    expect(output).toContain('"@context":"https://schema.org"');
    expect(output).toContain('"@type":"Person"');
    expect(output).toContain('"name":"Candidato A"');
  });

  it("escapa < para impedir fechamento prematuro de <script>", () => {
    const person: WithContext<Person> = {
      "@context": "https://schema.org",
      "@type": "Person",
      name: "</script><img src=x onerror=alert(1)>",
    };
    const output = safeJsonLd(person);
    expect(output).not.toContain("</script>");
    expect(output).toContain("\\u003C/script\\u003E");
  });

  it("escapa > & ' para injeção HTML segura", () => {
    const person: WithContext<Person> = {
      "@context": "https://schema.org",
      "@type": "Person",
      name: "A > B & C 'quoted'",
    };
    const output = safeJsonLd(person);
    expect(output).not.toContain(">");
    expect(output).not.toContain("&");
    expect(output).not.toContain("'");
    expect(output).toContain("\\u003E");
    expect(output).toContain("\\u0026");
    expect(output).toContain("\\u0027");
  });

  it("preserva caracteres unicode portugueses normalmente", () => {
    const person: WithContext<Person> = {
      "@context": "https://schema.org",
      "@type": "Person",
      name: "João Não-Açúcar",
    };
    const output = safeJsonLd(person);
    expect(output).toContain("João Não-Açúcar");
  });
});
