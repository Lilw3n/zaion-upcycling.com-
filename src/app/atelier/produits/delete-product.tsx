"use client";

import { deleteProduct } from "@/server/actions";

export function DeleteProduct({ id, name }: { id: string; name: string }) {
  return (
    <form
      action={deleteProduct}
      onSubmit={(event) => {
        if (!confirm(`Supprimer « ${name} » de la boutique ?`)) event.preventDefault();
      }}
    >
      <input type="hidden" name="id" value={id} />
      <button className="text-sm text-rust underline">Supprimer cette pièce</button>
    </form>
  );
}
