import Link from "next/link";
import { readSettings } from "@/lib/finance";
import { ProductForm } from "../product-form";

export default async function NewProductPage() {
  const settings = await readSettings();
  return (
    <div className="mx-auto max-w-3xl space-y-4">
      <Link href="/atelier/produits" className="text-sm underline">Toutes les pièces</Link>
      <h1 className="font-serif text-4xl">Nouvelle pièce</h1>
      <p className="text-sm text-ink/70">Photo, titre, description, prix saisi en HT ou en TTC, et unité. Les deux montants sont calculés avec la TVA de {settings.vatRate} %.</p>
      <ProductForm vatRate={settings.vatRate} />
    </div>
  );
}
