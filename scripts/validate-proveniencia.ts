import { pathToFileURL } from "node:url";
import { loadDeclaracoes, type DeclaracaoFrontmatter } from "./lib/data-loaders";

export interface ValidationResult {
  ok: boolean;
  errors: string[];
}

export function validarProveniencia(declaracoes: DeclaracaoFrontmatter[]): ValidationResult {
  const errors: string[] = [];

  for (const d of declaracoes) {
    const p = d.proveniencia;
    if (!p) {
      errors.push(
        `data/declaracoes/${d.id}.md: sem bloco 'proveniencia' (linha vermelha: todo dado é rastreável)`,
      );
      continue;
    }

    // Frontmatter cru (gray-matter) não aplica os defaults do Zod: campos omitidos
    // chegam como undefined e tipos errados (string/número) chegam intactos. Um gate
    // de validação nunca deve lançar exceção — normaliza para [] e reporta o tipo errado.
    const camadas = Array.isArray(p.camadas) ? p.camadas : [];
    const humanoRevisou = Array.isArray(p.humano_revisou) ? p.humano_revisou : [];

    if (!Array.isArray(p.camadas)) {
      errors.push(`${d.id}: proveniencia.camadas precisa ser um array`);
    }
    // humano_revisou tem default [] no schema: omiti-lo é válido; só é erro se presente e não-array.
    if (p.humano_revisou !== undefined && !Array.isArray(p.humano_revisou)) {
      errors.push(`${d.id}: proveniencia.humano_revisou precisa ser um array`);
    }

    const ids = new Set(camadas.map((c) => c.id));
    if (ids.size !== camadas.length) {
      const vistos = new Set<string>();
      const duplicados = new Set<string>();
      for (const c of camadas) {
        if (vistos.has(c.id)) duplicados.add(c.id);
        vistos.add(c.id);
      }
      errors.push(`${d.id}: proveniencia.camadas tem id duplicado: ${[...duplicados].join(", ")}`);
    }
    if (!camadas.some((c) => c.camada === 0)) {
      errors.push(`${d.id}: proveniencia precisa de ao menos uma camada factual (camada 0)`);
    }

    for (const c of camadas) {
      const ancora = Array.isArray(c.ancora) ? c.ancora : [];
      if (c.ancora !== undefined && !Array.isArray(c.ancora)) {
        errors.push(`${d.id}: camada ${c.id} tem ancora que não é um array`);
      }
      if (c.camada === 0 && ancora.length > 0) {
        errors.push(`${d.id}: camada ${c.id} (C0 factual) não pode ter ancora`);
      }
      if (c.camada > 0 && ancora.length === 0) {
        errors.push(`${d.id}: camada ${c.id} (derivada/analítica) precisa de ancora`);
      }
      for (const a of ancora) {
        if (a === c.id) {
          errors.push(`${d.id}: camada ${c.id} ancora em si mesma — proibido`);
          continue;
        }
        const alvo = camadas.find((x) => x.id === a);
        if (!alvo) {
          errors.push(`${d.id}: camada ${c.id} ancora em "${a}" que não existe`);
        } else if (alvo.camada > c.camada) {
          errors.push(
            `${d.id}: camada ${c.id} (C${c.camada}) ancora em C${alvo.camada} (camada superior) — proibido`,
          );
        }
      }
    }

    for (const h of humanoRevisou) {
      if (!ids.has(h)) {
        errors.push(`${d.id}: humano_revisou referencia "${h}" que não é uma camada`);
      }
    }
  }

  return { ok: errors.length === 0, errors };
}

function isMain(): boolean {
  return import.meta.url === pathToFileURL(process.argv[1] ?? "").href;
}

if (isMain()) {
  const declaracoes = loadDeclaracoes();
  const { ok, errors } = validarProveniencia(declaracoes);
  if (ok) {
    console.log(`✅ proveniencia: ${declaracoes.length} declaração(ões) com proveniência válida.`);
    process.exit(0);
  } else {
    console.error(`❌ proveniencia: ${errors.length} problema(s):`);
    for (const e of errors) console.error(`  - ${e}`);
    process.exit(1);
  }
}
