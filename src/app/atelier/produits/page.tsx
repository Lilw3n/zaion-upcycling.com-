import { db } from "@/db";
import { products } from "@/db/schema";
import { categoryLabel } from "@/lib/format";
import { updateProduct } from "@/server/actions";

export default async function ProductsAdminPage() {
  const rows = await db.select().from(products);
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-4xl">Pièces</h1>
        <p className="mt-2 text-sm text-ink/70">Prix TTC affiché en boutique. Décochez « en vente » pour un article sur devis uniquement.</p>
      </div>
      <div className="space-y-3">
        {rows.map((product) => (
          <form key={product.id} action={updateProduct} className="grid items-center gap-3 bg-foam p-3 md:grid-cols-[72px_1fr_140px_auto_auto]">
            <img src={product.image} alt="" className="h-16 w-16 object-cover" />
            <div>
              <p className="font-medium">{product.name}</p>
              <p className="text-xs text-ink/50">{categoryLabel[product.category] ?? product.category}</p>
            </div>
            <input type="hidden" name="id" value={product.id} />
            <input name="price" defaultValue={product.priceCents != null ? (product.priceCents / 100).toString() : ""} placeholder="Prix TTC" className="field" />
            <label className="text-sm"><input type="checkbox" name="purchasable" defaultChecked={product.purchasable} /> En vente</label>
            <label className="text-sm"><input type="checkbox" name="active" defaultChecked={product.active} /> Visible</label>
            <button className="btn md:col-start-5">Sauver</button>
          </form>
        ))}
      </div>
    </div>
  );
}
