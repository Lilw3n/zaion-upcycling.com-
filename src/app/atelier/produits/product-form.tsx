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
  const [photoNote, setPhotoNote] = useState("");
  const [photoError, setPhotoError] = useState("");

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
              const input = event.currentTarget;
              const file = input.files?.[0];
              if (!file) {
                setPreview(product?.image ?? "");
                setPhotoNote("");
                setPhotoError("");
                return;
              }
              void fitPhoto(file).then((fitted) => {
                if ("error" in fitted) {
                  input.value = "";
                  setPreview(product?.image ?? "");
                  setPhotoNote("");
                  setPhotoError(fitted.error);
                  return;
                }
                const data = new DataTransfer();
                data.items.add(fitted.file);
                input.files = data.files;
                setPreview(fitted.url);
                setPhotoError("");
                setPhotoNote("Recadrée au format de la boutique et allégée.");
              });
            }}
          />
        </label>
        <p className="text-sm text-ink/60">JPEG, PNG ou WebP. La photo est recadrée en portrait, comme la carte de la boutique, puis allégée pour passer sous 2 Mo.</p>
        {photoError && <p className="text-sm text-rust">{photoError}</p>}
        {photoNote && <p className="text-sm text-moss">{photoNote}</p>}
        {preview && <img src={preview} alt="" className="aspect-[4/5] w-44 bg-sand object-cover" />}
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

async function fitPhoto(file: File): Promise<{ error: string } | { file: File; url: string }> {
  const image = await loadImage(file);
  if (!image) return { error: "Cette photo n'a pas pu être lue. Choisissez un JPEG, un PNG ou un WebP." };
  const ratio = 4 / 5;
  const sw = image.naturalWidth;
  const sh = image.naturalHeight;
  let sx = 0;
  let sy = 0;
  let sWidth = sw;
  let sHeight = sh;
  if (sw / sh > ratio) {
    sWidth = sh * ratio;
    sx = (sw - sWidth) / 2;
  } else {
    sHeight = sw / ratio;
    sy = (sh - sHeight) / 2;
  }
  const width = Math.min(1200, Math.round(sWidth));
  const height = Math.round(width / ratio);
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext("2d");
  if (!context) return { error: "Le recadrage n'a pas pu se faire dans ce navigateur." };
  context.drawImage(image, sx, sy, sWidth, sHeight, 0, 0, width, height);
  let quality = 0.86;
  let blob = await canvasToJpeg(canvas, quality);
  while (blob && blob.size > 1_800_000 && quality > 0.5) {
    quality -= 0.12;
    blob = await canvasToJpeg(canvas, quality);
  }
  if (!blob || blob.size > 2_000_000) return { error: "Même recadrée, la photo reste trop lourde." };
  const fitted = new File([blob], "photo.jpg", { type: "image/jpeg" });
  return { file: fitted, url: URL.createObjectURL(fitted) };
}

function loadImage(file: File) {
  return new Promise<HTMLImageElement | null>((resolve) => {
    const url = URL.createObjectURL(file);
    const image = new Image();
    image.onload = () => {
      URL.revokeObjectURL(url);
      resolve(image);
    };
    image.onerror = () => {
      URL.revokeObjectURL(url);
      resolve(null);
    };
    image.src = url;
  });
}

function canvasToJpeg(canvas: HTMLCanvasElement, quality: number) {
  return new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/jpeg", quality));
}
