import Link from "next/link";
import type { Product } from "@/db/schema";
import { euros, productUnit } from "@/lib/format";
import { AddButton } from "./add-button";

export function ProductCard({ product }: { product: Product }) {
  const unit = productUnit(product);
  return (
    <article className="flex flex-col bg-foam">
      <Link href={`/produit/${product.slug}`} className="block bg-sand">
        <img src={product.image} alt={product.name} className="aspect-[4/5] w-full object-cover" />
      </Link>
      <div className="flex flex-1 flex-col gap-3 p-4">
        <Link href={`/produit/${product.slug}`} className="font-medium leading-snug">
          {product.name}
        </Link>
        <p className="line-clamp-2 text-sm text-ink/70">{product.summary}</p>
        <div className="mt-auto flex items-end justify-between gap-3">
          <div>
            {product.compareAtCents && product.priceCents != null && product.compareAtCents > product.priceCents && (
              <p className="text-xs text-ink/40 line-through">{euros(product.compareAtCents)}</p>
            )}
            <p className="font-semibold">{product.priceCents == null ? "Sur devis" : euros(product.priceCents)}</p>
            {product.priceCents != null && <p className="text-[11px] uppercase tracking-wide text-ink/50">TTC / {unit}</p>}
          </div>
          {product.purchasable && product.priceCents != null ? (
            <AddButton slug={product.slug} />
          ) : (
            <Link href={`/devis?sujet=${encodeURIComponent(product.name)}&univers=${product.category}`} className="text-sm font-semibold underline">
              Devis
            </Link>
          )}
        </div>
      </div>
    </article>
  );
}
