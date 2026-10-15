import type { Metadata } from "next";
import { and, eq, ilike, or } from "drizzle-orm";
import { db } from "@/db";
import { products } from "@/db/schema";
import { categories } from "@/data/catalogue";
import { ProductCard } from "@/components/product-card";
import { categoryLabel } from "@/lib/format";

export const metadata: Metadata = { title: "Boutique" };

export default async function ShopPage({ searchParams }: { searchParams: Promise<{ q?: string; categorie?: string }> }) {
  const { q = "", categorie = "" } = await searchParams;
  const filters = [eq(products.active, true)];
  if (categorie) filters.push(eq(products.category, categorie));
  if (q.trim()) {
    const like = `%${q.trim()}%`;
    filters.push(or(ilike(products.name, like), ilike(products.summary, like), ilike(products.description, like))!);
  }
  const rows = await db.select().from(products).where(and(...filters));

  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <p className="text-xs uppercase tracking-[0.2em] text-ink/50">Catalogue</p>
      <h1 className="font-serif text-5xl">Boutique</h1>
      <p className="mt-3 max-w-2xl text-ink/70">
        Pièces prêtes à commander et fabrications au mètre. Les prix affichés sont TTC. Le sur-mesure passe par un devis, avec les détails de montage.
      </p>
      <form className="mt-6 flex flex-wrap gap-2" action="/boutique">
        <input name="q" defaultValue={q} placeholder="Rechercher" className="field max-w-xs" />
        <select name="categorie" defaultValue={categorie} className="field max-w-xs">
          <option value="">Tous les univers</option>
          {categories.map((item) => (
            <option key={item.slug} value={item.slug}>{item.label}</option>
          ))}
          <option value="atelier">Bureau d'études</option>
        </select>
        <button className="btn">Filtrer</button>
      </form>
      <p className="mt-6 text-sm text-ink/60">
        {rows.length} pièce{rows.length > 1 ? "s" : ""} {categorie ? `· ${categoryLabel[categorie] ?? categorie}` : ""}
      </p>
      <div className="mt-4 grid grid-cols-2 gap-3 lg:grid-cols-4">
        {rows.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
      {!rows.length && <p className="mt-10 text-ink/70">Aucune pièce ne correspond. Écrivez à l'atelier pour un devis.</p>}
    </div>
  );
}
