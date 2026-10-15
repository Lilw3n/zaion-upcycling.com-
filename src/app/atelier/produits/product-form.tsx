"use client";

import { useMemo, useState } from "react";
import { useActionState } from "react";
import { categories } from "@/data/catalogue";
import type { Product } from "@/db/schema";
import { euros, priceUnits } from "@/lib/format";
import { createProduct, updateProduct, type ActionState } from "@/server/actions";

export function ProductForm({ product, vatRate }: { product?: Product; vatRate: number }) {
  const action = product ? updateProduct : createProduct;
  const [state, formAction, pending] = useActionState(action, null as ActionState);
  const [basis, setBasis] = useState(product?.priceBasis === "ht" ? "ht" : "ttc");
  const [price, setPrice] = useState(() => {
    if (!product) return "";
    const cents = product.priceBasis === "ht" ? product.priceHtCents : product.priceCents;
    return cents == null ? "" : (cents / 100).toString();
  });
  const [preview, setPreview] = useState(product?.image ?? "");

  const both = useMemo(() => {
    const amount = Math.round(Number(price.replace(",", ".")) * 100);
    if (!price.trim() || !Number.isFinite(amount) || amount < 0) return null;
    const ttc = basis === "ht" ? Math.round((amount * (100 + vatRate)) / 100) : amount;
    const ht = basis === "ht" ? amount : Math.round((amount * 100) / (100 + vatRate));
    return { ht, ttc };
  }, [basis, price, vatRate]);

  return (
    <form action={formAction} className="grid gap-4 bg-foam p-4">
      {product && <input type="hidden" name="id" value={product.id} />}
      <label className="grid gap-1 text-sm">
        Titre
        <input name="name" required defaultValue={product?.name} className="field" placeholder="Bâche, wing, banquette…" />
      </label>
      <label className="grid gap-1 text-sm">
        Résumé de la carte
        <input name="summary" defaultValue={product?.summary} className="field" placeholder="Une phrase. Vide : le début de la description est repris." />
      </label>
      <label className="grid gap-1 text-sm">
        Description
        <textarea name="description" required defaultValue={product?.description} className="field min-h-40" placeholder="Matière, usage, ce qui est compris dans le prix." />
      </label>
      <label className="grid gap-1 text-sm">
        Univers
        <select name="category" defaultValue={product?.category ?? "nautisme"} className="field">
          {categories.map((item) => (
            <option key={item.slug} value={item.slug}>{item.label}</option>
          ))}
          <option value="atelier">Bureau d'études</option>
        </select>
      </label>
      <div className="grid gap-3">
        <label className="grid gap-1 text-sm">
          Photo {product ? "" : "(obligatoire)"}
          <input
            name="photo"
            type="file"
            accept="image/jpeg,image/png,image/webp"
            required={!product}
            className="block w-full text-sm"
            onChange={(event) => {
              const file = event.target.files?.[0];
              setPreview(file ? URL.createObjectURL(file) : product?.image ?? "");
            }}
          />
        </label>
        <p className="text-sm text-ink/60">JPEG, PNG ou WebP, 2 Mo au plus. La photo s'affiche dans la boutique.</p>
        {preview && <img src={preview} alt="" className="h-44 w-44 object-cover" />}
      </div>
      <div className="grid gap-3 md:grid-cols-3">
        <label className="grid gap-1 text-sm">
          Prix
          <input name="price" inputMode="decimal" value={price} onChange={(event) => setPrice(event.target.value)} placeholder="Vide = sur devis" className="field" />
        </label>
        <label className="grid gap-1 text-sm">
          Ce prix est
          <select name="basis" value={basis} onChange={(event) => setBasis(event.target.value)} className="field">
            <option value="ttc">TTC</option>
            <option value="ht">HT</option>
          </select>
        </label>
        <label className="grid gap-1 text-sm">
          Unité
          <select name="unit" defaultValue={product?.unit ?? "pièce"} className="field">
            {priceUnits.map((item) => (
              <option key={item.value} value={item.value}>{item.label}</option>
            ))}
          </select>
        </label>
      </div>
      {both && (
        <p className="text-sm">
          {euros(both.ht)} HT · {euros(both.ttc)} TTC, TVA {vatRate} %. La boutique affiche le TTC.
        </p>
      )}
      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" name="purchasable" defaultChecked={product ? product.purchasable : true} />
        En vente dans la boutique
      </label>
      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" name="active" defaultChecked={product ? product.active : true} />
        Visible sur le site
      </label>
      {state?.error && <p className="text-sm text-rust">{state.error}</p>}
      {state?.ok && <p className="text-sm text-moss">{state.ok}</p>}
      <button className="btn w-fit" disabled={pending}>{pending ? "Enregistrement…" : product ? "Enregistrer la pièce" : "Créer la pièce"}</button>
    </form>
  );
}
