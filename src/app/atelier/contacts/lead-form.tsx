"use client";

import { useActionState } from "react";
import type { Lead } from "@/db/schema";
import { leadStatusLabel } from "@/lib/format";
import { saveLead, type ActionState } from "@/server/actions";

export function LeadForm({ lead }: { lead?: Lead }) {
  const [state, action, pending] = useActionState(saveLead, null as ActionState);
  return (
    <form action={action} className="grid gap-2 md:grid-cols-2">
      {lead && <input type="hidden" name="id" value={lead.id} />}
      <input name="name" required defaultValue={lead?.name} placeholder="Nom" className="field" />
      <input name="email" type="email" defaultValue={lead?.email ?? ""} placeholder="E-mail" className="field" />
      <input name="phone" defaultValue={lead?.phone ?? ""} placeholder="Téléphone" className="field" />
      <select name="source" defaultValue={lead?.source ?? "manuel"} className="field">
        <option value="visiteur">Visiteur</option>
        <option value="devis">Devis</option>
        <option value="commande">Commande</option>
        <option value="manuel">Saisi à la main</option>
      </select>
      <select name="status" defaultValue={lead?.status ?? "nouveau"} className="field">
        {Object.entries(leadStatusLabel).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
      </select>
      <textarea name="notes" defaultValue={lead?.notes ?? ""} placeholder="Notes" className="field min-h-20 md:col-span-2" />
      <label className="flex items-center gap-2 text-sm md:col-span-2"><input type="checkbox" name="example" defaultChecked={lead?.example ?? false} /> Donnée d'exemple</label>
      {state?.error && <p className="text-sm text-rust md:col-span-2">{state.error}</p>}
      {state?.ok && <p className="text-sm text-moss md:col-span-2">{state.ok}</p>}
      <button className="btn" disabled={pending}>{lead ? "Mettre à jour" : "Ajouter le contact"}</button>
    </form>
  );
}
