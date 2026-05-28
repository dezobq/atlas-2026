import { pathToFileURL } from "node:url";
import { execSync } from "node:child_process";
import { loadDeclaracoes, loadEventos } from "./lib/data-loaders";

export interface UrlFailure {
  url: string;
  status: number | null;
  error: string | null;
}

export interface CheckResult {
  ok: boolean;
  total: number;
  failures: UrlFailure[];
}

export async function verificarArchiveUrls(urls: string[]): Promise<CheckResult> {
  const failures: UrlFailure[] = [];
  for (const url of urls) {
    try {
      const res = await fetch(url, { method: "HEAD" });
      if (!res.ok) {
        failures.push({ url, status: res.status, error: null });
      }
    } catch (e) {
      failures.push({ url, status: null, error: (e as Error).message });
    }
  }
  return { ok: failures.length === 0, total: urls.length, failures };
}

function urlsModoRecent(): string[] {
  try {
    const diff = execSync("git diff --name-only HEAD~1 HEAD", { encoding: "utf-8" });
    const arquivosAlterados = diff.split("\n").filter((f) => f.trim());
    const declaracoes = loadDeclaracoes().filter((d) =>
      arquivosAlterados.some((f) => f.includes("declaracoes/") && f.includes(d.id)),
    );
    const eventos = loadEventos().filter((e) =>
      arquivosAlterados.some((f) => f.includes("eventos/") && f.includes(e.id)),
    );
    const urls: string[] = [];
    for (const d of declaracoes) if (d.archive_url) urls.push(d.archive_url);
    // Eventos não têm archive_url no tipo minimal; --all cobre todos.
    void eventos;
    return Array.from(new Set(urls));
  } catch {
    return [];
  }
}

function urlsModoAll(): string[] {
  const declaracoes = loadDeclaracoes();
  const urls: string[] = [];
  for (const d of declaracoes) if (d.archive_url) urls.push(d.archive_url);
  return Array.from(new Set(urls));
}

function isMain(): boolean {
  return import.meta.url === pathToFileURL(process.argv[1] ?? "").href;
}

if (isMain()) {
  const args = process.argv.slice(2);
  const isRecent = args.includes("--recent");
  const urls = isRecent ? urlsModoRecent() : urlsModoAll();

  if (urls.length === 0) {
    console.log(`ℹ Nenhuma URL Wayback para checar (modo: ${isRecent ? "--recent" : "--all"}).`);
    process.exit(0);
  }

  console.log(`🔍 Checando ${urls.length} URL(s) Wayback (modo: ${isRecent ? "--recent" : "--all"})...`);
  const { ok, total, failures } = await verificarArchiveUrls(urls);

  if (ok) {
    console.log(`✅ Todas as ${total} URLs Wayback retornaram HEAD 200 OK.`);
    process.exit(0);
  } else {
    console.error(`❌ ${failures.length}/${total} URLs Wayback falharam:`);
    for (const f of failures) {
      console.error(`  - ${f.url} (status=${f.status ?? "ERR"}, erro=${f.error ?? "-"})`);
    }
    process.exit(1);
  }
}
