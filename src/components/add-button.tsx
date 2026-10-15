"use client";

import { useState } from "react";
import { useCart } from "./cart-provider";

export function AddButton({ slug, label = "Ajouter" }: { slug: string; label?: string }) {
  const { add } = useCart();
  const [done, setDone] = useState(false);
  return (
    <button
      className="btn px-3 py-2 text-xs"
      onClick={() => {
        add(slug, 1);
        setDone(true);
        setTimeout(() => setDone(false), 1200);
      }}
    >
      {done ? "Ajouté" : label}
    </button>
  );
}
