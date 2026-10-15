"use client";

import { useActionState } from "react";
import { saveRevenue, type ActionState } from "@/server/actions";

export function RevenueForm({ vatRate }: { vatRate: number }) {
  const [state, action, pending] = useActionState(saveRevenue, null as ActionState);
  return (
    <form action={action} className="grid gap-2 bg-foam p-4 md:grid-cols-4">
      <input name="label" required placeholder="Libellé" className="field md:col-span-2" />
      <input name="date" type="date" required className="field" />
      <input name="amount" required placeholder="Montant HT" className="field" />
      <input name="vat" defaultValue={vatRate} className="field" />
      {state?.error && <p className="text-sm text-rust md:col-span-4">{state.error}</p>}
      {state?.ok && <p className="text-sm text-moss md:col-span-4">{state.ok}</p>}
      <button className="btn md:col-span-4" disabled={pending}>Ajouter la recette</button>
    </form>
  );
}
