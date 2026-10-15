"use client";

import { useActionState } from "react";
import { useCart } from "@/components/cart-provider";
import { placeOrder, type ActionState } from "@/server/actions";
import type { Session } from "@/lib/session";
import Link from "next/link";

export function CheckoutForm({ session }: { session: Session | null }) {
  const { items } = useCart();
  const [state, action, pending] = useActionState(placeOrder, null as ActionState);

  if (!items.length) {
    return <p className="mt-8">Le panier est vide. <Link className="underline" href="/boutique">Retour à la boutique</Link></p>;
  }

  return (
    <form
      action={(formData) => {
        formData.set("cart", JSON.stringify(items));
        return action(formData);
      }}
      className="mt-8 grid gap-3"
    >
      <label>Nom<input name="name" required className="field" defaultValue={session?.name ?? ""} /></label>
      <label>E-mail<input name="email" type="email" required className="field" defaultValue={session?.email ?? ""} /></label>
      <label>Téléphone<input name="phone" className="field" /></label>
      <label>Adresse de livraison ou d'intervention<textarea name="address" required className="field min-h-24" /></label>
      <label>Note<textarea name="note" className="field min-h-20" placeholder="Mesures, accès, délai…" /></label>
      {!session && (
        <label>
          Mot de passe pour suivre la commande
          <input name="password" type="password" minLength={8} required className="field" />
        </label>
      )}
      {state?.error && <p className="text-sm text-rust">{state.error}</p>}
      <button className="btn" disabled={pending}>{pending ? "Envoi…" : "Confirmer la commande"}</button>
    </form>
  );
}
