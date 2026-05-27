import type { Thing, WithContext } from "schema-dts";

/**
 * Serializa um objeto JSON-LD para inclusão segura em <script type="application/ld+json">.
 *
 * Escapa caracteres que poderiam fechar a tag <script> prematuramente ou
 * permitir injeção de HTML: <, >, &, '.
 *
 * Padrão recomendado por schema-dts (fonte: Context7 /google/schema-dts).
 */
export function safeJsonLd<T extends Thing>(data: WithContext<T>): string {
  return JSON.stringify(data)
    .replace(/</g, "\\u003C")
    .replace(/>/g, "\\u003E")
    .replace(/&/g, "\\u0026")
    .replace(/'/g, "\\u0027");
}
