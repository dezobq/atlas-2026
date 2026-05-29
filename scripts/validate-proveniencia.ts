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

    const ids = new Set(p.camadas.map((c) => c.id));
    if (ids.size !== p.camadas.length) {
      errors.push(`${d.id}: proveniencia.camadas tem id duplicado`);
    }
    if (!p.camadas.some((c) => c.camada === 0)) {
      errors.push(`${d.id}: proveniencia precisa de ao menos uma camada factual (camada 0)`);
    }

    for (const c of p.camadas) {
      if (c.camada === 0 && c.ancora.length > 0) {
        errors.push(`${d.id}: camada ${c.id} (C0 factual) não pode ter ancora`);
      }
      if (c.camada > 0 && c.ancora.length === 0) {
        errors.push(`${d.id}: camada ${c.id} (derivada/analítica) precisa de ancora`);
      }
      for (const a of c.ancora) {
        const alvo = p.camadas.find((x) => x.id === a);
        if (!alvo) {
          errors.push(`${d.id}: camada ${c.id} ancora em "${a}" que não existe`);
        } else if (alvo.camada > c.camada) {
          errors.push(
            `${d.id}: camada ${c.id} (C${c.camada}) ancora em C${alvo.camada} (camada superior) — proibido`,
          );
        }
      }
    }

    for (const h of p.humano_revisou) {
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
