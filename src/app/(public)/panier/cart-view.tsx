"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { priceCart } from "@/server/actions";
import { euros } from "@/lib/format";
import { useCart } from "@/components/cart-provider";

type Line = { slug: string; name: string; image: string; qty: number; unitCents: number; lineCents: number };

export function CartView() {
  const { items, setQty, remove } = useCart();
  const [lines, setLines] = useState<Line[]>([]);

  useEffect(() => {
    let cancelled = false;
    priceCart(items).then((next) => {
      if (!cancelled) setLines(next);
    });
    return () => {
      cancelled = true;
    };
  }, [items]);

  if (!items.length) {
    return (
      <div className="mt-8 bg-foam p-8">
        <p>Votre panier est vide.</p>
        <Link href="/boutique" className="btn mt-4">Continuer</Link>
      </div>
    );
  }

  const total = lines.reduce((sum, line) => sum + line.lineCents, 0);

  return (
    <div className="mt-8 space-y-4">
      {lines.map((line) => (
        <div key={line.slug} className="grid grid-cols-[96px_1fr_auto] gap-4 bg-foam p-3">
          <img src={line.image} alt="" className="h-24 w-24 object-cover" />
          <div>
            <Link href={`/produit/${line.slug}`} className="font-medium">{line.name}</Link>
            <p className="text-sm text-ink/60">{euros(line.unitCents)} TTC</p>
            <div className="mt-2 flex items-center gap-2">
              <button className="btn-line px-3 py-1" onClick={() => setQty(line.slug, line.qty - 1)} disabled={line.qty <= 1}>−</button>
              <span>{line.qty}</span>
              <button className="btn-line px-3 py-1" onClick={() => setQty(line.slug, line.qty + 1)}>+</button>
              <button className="text-sm underline" onClick={() => remove(line.slug)}>Retirer</button>
            </div>
          </div>
          <p className="font-semibold">{euros(line.lineCents)}</p>
        </div>
      ))}
      <div className="flex items-center justify-between bg-ink px-5 py-4 text-paper">
        <span>Total TTC</span>
        <strong className="text-xl">{euros(total)}</strong>
      </div>
      <Link href="/commande" className="btn">Valider la commande</Link>
    </div>
  );
}
