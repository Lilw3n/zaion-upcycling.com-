import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { products } from "@/db/schema";
import { categoryLabel, euros, productUnit } from "@/lib/format";
import { AddButton } from "@/components/add-button";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const [product] = await db.select().from(products).where(eq(products.slug, slug));
  return {
    title: product?.name ?? "Pièce",
    description: product?.summary,
    alternates: product ? { canonical: `/produit/${product.slug}` } : undefined,
  };
}

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const [product] = await db.select().from(products).where(eq(products.slug, slug));
  if (!product || !product.active) notFound();
  const unit = productUnit(product);

  return (
    <div className="mx-auto grid max-w-6xl gap-10 px-4 py-12 md:grid-cols-2">
      <img src={product.image} alt={product.name} className="w-full bg-sand object-cover" />
      <div>
        <Link href={`/univers/${product.category}`} className="text-xs uppercase tracking-[0.18em] text-ink/50">
          {categoryLabel[product.category] ?? product.category}
        </Link>
        <h1 className="mt-2 font-serif text-4xl md:text-5xl">{product.name}</h1>
        <div className="mt-5">
          {product.compareAtCents && product.priceCents != null && product.compareAtCents > product.priceCents && (
            <p className="text-sm text-ink/40 line-through">{euros(product.compareAtCents)}</p>
          )}
          <p className="text-3xl font-semibold">{product.priceCents == null ? "Sur devis" : euros(product.priceCents)}</p>
          {product.priceCents != null && (
            <p className="text-sm text-ink/60">
              {product.priceHtCents != null ? `${euros(product.priceHtCents)} HT · ` : ""}
              {euros(product.priceCents)} TTC / {unit}. La quantité du panier correspond à cette unité.
            </p>
          )}
        </div>
        <p className="prose-copy mt-6 text-ink/80">{product.description}</p>
        <div className="mt-8 flex flex-wrap gap-3">
          {product.purchasable && product.priceCents != null ? (
            <AddButton slug={product.slug} label="Ajouter au panier" />
          ) : null}
          <Link href={`/devis?sujet=${encodeURIComponent(product.name)}&univers=${product.category}`} className="btn-line">
            Demander un devis
          </Link>
        </div>
      </div>
    </div>
  );
}
