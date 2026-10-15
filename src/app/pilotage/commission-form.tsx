"use client";

import { useActionState } from "react";
import { saveCommission, type ActionState } from "@/server/actions";

export function CommissionForm({ rate, visible, vat }: { rate: number; visible: boolean; vat: number }) {
  const [state, action, pending] = useActionState(saveCommission, null as ActionState);
  return (
    <form action={action} className="grid gap-3 bg-foam p-5 md:grid-cols-3">
      <label className="text-sm">
        Taux de votre part (%)
        <input name="rate" defaultValue={rate} className="field mt-1" />
      </label>
      <label className="text-sm">
        TVA appliquée aux nouvelles recettes (%)
        <input name="vat" defaultValue={vat} className="field mt-1" />
      </label>
      <label className="mt-6 flex items-center gap-2 text-sm">
        <input type="checkbox" name="visible" defaultChecked={visible} />
        Rendre la part visible dans l'espace atelier
      </label>
      <p className="text-sm text-ink/60 md:col-span-3">
        Décochez pour que Zaïon ne voie pas la ligne. Le taux s'applique aux prochaines commandes et recettes saisies. Les écritures déjà passées gardent le taux du jour.
      </p>
      {state?.error && <p className="text-sm text-rust md:col-span-3">{state.error}</p>}
      {state?.ok && <p className="text-sm text-moss md:col-span-3">{state.ok}</p>}
      <button className="btn" disabled={pending}>Enregistrer</button>
    </form>
  );
}
