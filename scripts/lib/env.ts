import { existsSync } from "node:fs";
import { resolve } from "node:path";

const envPath = resolve(process.cwd(), ".env");
if (existsSync(envPath)) {
  process.loadEnvFile(envPath);
}

export function requireEnv(name: string): string {
  const value = process.env[name];
  if (value === undefined || value === "") {
    throw new Error(
      `Variável de ambiente obrigatória "${name}" não definida. ` +
        `Copie .env.example para .env e preencha o valor.`,
    );
  }
  return value;
}

export function getEnv(name: string, defaultValue: string): string {
  const value = process.env[name];
  return value === undefined || value === "" ? defaultValue : value;
}
