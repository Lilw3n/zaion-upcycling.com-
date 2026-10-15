import Link from "next/link";
import { db } from "@/db";
import { ensureCatalog } from "@/db/ensure";
import { products } from "@/db/schema";
import { categoryLabel, euros, productUnit } from "@/lib/format";

export default async function ProductsAdminPage() {
  await ensureCatalog();
  const rows = await db.select().from(products);
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-serif text-4xl">Pièces</h1>
          <p className="mt-2 max-w-2xl text-sm text-ink/70">
            Ajouter une pièce, ouvrir une ligne pour modifier le prix, la photo et le texte, puis la supprimer depuis sa fiche. La boutique affiche toujours le TTC.
          </p>
        </div>
        <Link href="/atelier/produits/nouveau" className="btn">Ajouter une pièce</Link>
      </div>
      <div className="space-y-3">
        {rows.map((product) => (
          <Link key={product.id} href={`/atelier/produits/${product.id}`} className="grid items-center gap-3 bg-foam p-3 md:grid-cols-[72px_1fr_auto]">
            <img src={product.image} alt="" className="h-16 w-16 object-cover" />
            <div>
              <p className="font-medium">{product.name}</p>
              <p className="text-xs text-ink/50">{categoryLabel[product.category] ?? product.category} · {product.active ? "visible" : "masquée"}</p>
            </div>
            <p className="text-sm">
              {product.priceCents == null ? "Sur devis" : `${euros(product.priceCents)} TTC / ${productUnit(product)}`}
              {product.priceHtCents != null && product.priceCents != null ? ` · ${euros(product.priceHtCents)} HT` : ""}
            </p>
          </Link>
        ))}
      </div>
    </div>
  );
}
