import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { eq } from "drizzle-orm";

function loadEnv() {
  const text = readFileSync(resolve(".env.local"), "utf8");
  for (const line of text.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const index = trimmed.indexOf("=");
    if (index === -1) continue;
    const key = trimmed.slice(0, index);
    if (!process.env[key]) process.env[key] = trimmed.slice(index + 1);
  }
}

loadEnv();

async function main() {
  const { neon } = await import("@neondatabase/serverless");
  const { drizzle } = await import("drizzle-orm/neon-http");
  const schema = await import("../src/db/schema");
  const { catalogue } = await import("../src/data/catalogue");
  const db = drizzle(neon(process.env.DATABASE_URL!), { schema });
  const existing = await db.select().from(schema.products);
  const bySlug = new Map(existing.map((row) => [row.slug, row]));
  let inserted = 0;
  let updated = 0;
  for (const [index, item] of catalogue.entries()) {
    const values = {
      name: item.name,
      category: item.category,
      summary: item.summary,
      description: item.description,
      priceCents: item.priceCents,
      compareAtCents: item.compareAtCents,
      image: item.image,
      purchasable: item.purchasable,
      active: true,
    };
    const current = bySlug.get(item.slug);
    if (!current) {
      await db.insert(schema.products).values({ id: `prd_${index + 1}`, slug: item.slug, ...values });
      inserted += 1;
      continue;
    }
    await db.update(schema.products).set(values).where(eq(schema.products.slug, item.slug));
    updated += 1;
  }
  console.log(`produits insérés ${inserted}, mis à jour ${updated}, total catalogue ${catalogue.length}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
