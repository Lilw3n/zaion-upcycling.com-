"use client";

import { useActionState } from "react";
import { useCart } from "@/components/cart-provider";
import { placeOrder, type ActionState } from "@/server/actions";
import type { Session } from "@/lib/session";
import Link from "next/link";

export function CheckoutForm({ session, card }: { session: Session | null; card: boolean }) {
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
      <label>
        Code promo ou parrainage
        <input name="code" className="field" placeholder="Facultatif" autoComplete="off" />
      </label>
      {!session && (
        <>
          <p className="text-sm text-ink/70">
            Un compte confirmé par e-mail est nécessaire. <Link className="underline" href="/inscription">Créer un accès</Link> ou <Link className="underline" href="/connexion?next=/commande">se connecter</Link>.
          </p>
          <label>
            Mot de passe du compte existant
            <input name="password" type="password" minLength={8} required className="field" autoComplete="current-password" />
          </label>
        </>
      )}
      {state?.error && <p className="text-sm text-rust">{state.error}</p>}
      <div className="flex flex-wrap gap-3">
        <button name="pay" value="later" className="btn" disabled={pending}>{pending ? "Envoi…" : "Confirmer la commande"}</button>
        {card && <button name="pay" value="card" className="btn bg-white text-ink" disabled={pending}>Payer par carte</button>}
      </div>
      {!card && <p className="text-sm text-ink/60">Le paiement par carte s'ouvrira sur le Stripe de Zaïon, dès que sa clé sera enregistrée. En attendant, la commande est notée à l'atelier.</p>}
    </form>
  );
}
