import Link from "next/link";
import { notFound } from "next/navigation";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { ensureCatalog } from "@/db/ensure";
import { products } from "@/db/schema";
import { readSettings } from "@/lib/finance";
import { DeleteProduct } from "../delete-product";
import { ProductForm } from "../product-form";

export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  await ensureCatalog();
  const { id } = await params;
  const [product, settings] = await Promise.all([
    db.select().from(products).where(eq(products.id, id)).then((rows) => rows[0]),
    readSettings(),
  ]);
  if (!product) notFound();
  return (
    <div className="mx-auto max-w-3xl space-y-4">
      <Link href="/atelier/produits" className="text-sm underline">Toutes les pièces</Link>
      <h1 className="font-serif text-4xl">{product.name}</h1>
      <p className="text-sm text-ink/60">Adresse publique : /produit/{product.slug}</p>
      <ProductForm product={product} vatRate={settings.vatRate} />
      <DeleteProduct id={product.id} name={product.name} />
    </div>
  );
}
