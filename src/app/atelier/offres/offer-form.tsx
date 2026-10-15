"use client";

import { useActionState, useState } from "react";
import { savePromo, type ActionState } from "@/server/actions";

export function OfferForm() {
  const [state, action, pending] = useActionState(savePromo, null as ActionState);
  const [kind, setKind] = useState("percent");
  return (
    <form action={action} className="grid gap-3 bg-foam p-4">
      <div className="grid gap-3 md:grid-cols-2">
        <label className="grid gap-1 text-sm">
          Code
          <input name="code" required className="field" placeholder="ETE10" />
        </label>
        <label className="grid gap-1 text-sm">
          Nom
          <input name="label" required className="field" placeholder="Soldes d'été, parrainage Camille…" />
        </label>
      </div>
      <div className="grid gap-3 md:grid-cols-3">
        <label className="grid gap-1 text-sm">
          Type
          <select name="kind" value={kind} onChange={(event) => setKind(event.target.value)} className="field">
            <option value="percent">Promo en pourcentage</option>
            <option value="amount">Promo en euros</option>
            <option value="referral">Code de parrainage</option>
          </select>
        </label>
        <label className="grid gap-1 text-sm">
          {kind === "amount" ? "Remise TTC (€)" : "Remise pour le client (%)"}
          <input name="value" required inputMode="decimal" className="field" placeholder={kind === "amount" ? "15" : "10"} />
        </label>
        <label className="grid gap-1 text-sm">
          Utilisations max
          <input name="maxUses" inputMode="numeric" className="field" placeholder="Vide = illimité" />
        </label>
      </div>
      {kind === "referral" && (
        <div className="grid gap-3 md:grid-cols-3">
          <label className="grid gap-1 text-sm">Parrain<input name="referrerName" className="field" /></label>
          <label className="grid gap-1 text-sm">E-mail du parrain<input name="referrerEmail" type="email" className="field" /></label>
          <label className="grid gap-1 text-sm">
            Part du parrain (% du HT)
            <input name="referrerRate" inputMode="decimal" className="field" placeholder="5" />
          </label>
        </div>
      )}
      <p className="text-sm text-ink/60">
        La remise s'applique au total TTC. La part du parrain est notée sur la commande, elle n'est pas prélevée automatiquement.
      </p>
      {state?.error && <p className="text-sm text-rust">{state.error}</p>}
      {state?.ok && <p className="text-sm text-moss">{state.ok}</p>}
      <button className="btn w-fit" disabled={pending}>{pending ? "Enregistrement…" : "Créer l'offre"}</button>
    </form>
  );
}
