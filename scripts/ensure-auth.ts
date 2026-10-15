import { readFileSync } from "node:fs";
import { resolve } from "node:path";

for (const line of readFileSync(resolve(".env.local"), "utf8").split(/\r?\n/)) {
  const trimmed = line.trim();
  if (!trimmed || trimmed.startsWith("#")) continue;
  const index = trimmed.indexOf("=");
  if (index === -1) continue;
  const key = trimmed.slice(0, index);
  if (!process.env[key]) process.env[key] = trimmed.slice(index + 1);
}

async function main() {
  const { ensureAuthSchema } = await import("../src/db/ensure");
  await ensureAuthSchema();
  console.log("Schéma de connexion à jour.");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
