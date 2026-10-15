"use client";

import { useActionState } from "react";
import { chargeKindLabel, categoryLabel } from "@/lib/format";
import { saveCharge, type ActionState } from "@/server/actions";

export function ChargeForm() {
  const [state, action, pending] = useActionState(saveCharge, null as ActionState);
  return (
    <form action={action} className="grid gap-2 bg-foam p-4 md:grid-cols-3">
      <select name="kind" className="field">
        {Object.entries(chargeKindLabel).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
      </select>
      <select name="activity" className="field" defaultValue="">
        <option value="">Activité, si RC Pro</option>
        {Object.entries(categoryLabel).map(([value, label]) => <option key={value} value={label}>{label}</option>)}
      </select>
      <input name="period" required placeholder="Période, ex. 2026-T4" className="field" />
      <input name="label" required placeholder="Libellé" className="field md:col-span-2" />
      <input name="amount" required placeholder="Montant €" className="field" />
      <input name="provider" placeholder="Organisme" className="field" />
      <input name="reference" placeholder="N° de police ou facture" className="field" />
      <label className="flex items-center gap-2 text-sm"><input type="checkbox" name="paid" /> Déjà payée</label>
      <label className="flex items-center gap-2 text-sm md:col-span-2"><input type="checkbox" name="example" defaultChecked={false} /> Donnée d'exemple</label>
      <textarea name="notes" placeholder="Note" className="field md:col-span-3" />
      {state?.error && <p className="text-sm text-rust md:col-span-3">{state.error}</p>}
      {state?.ok && <p className="text-sm text-moss md:col-span-3">{state.ok}</p>}
      <button className="btn md:col-span-3" disabled={pending}>Enregistrer la charge</button>
    </form>
  );
}
