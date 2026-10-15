"use client";

import { useActionState } from "react";
import { categories } from "@/data/catalogue";
import { createQuote, type ActionState } from "@/server/actions";

export function NewQuoteForm() {
  const [state, action, pending] = useActionState(createQuote, null as ActionState);
  return (
    <form action={action} className="grid gap-3 bg-foam p-4 md:grid-cols-2">
      <label className="text-sm">Nom<input name="name" required className="field mt-1" /></label>
      <label className="text-sm">E-mail<input name="email" type="email" className="field mt-1" /></label>
      <label className="text-sm">Téléphone<input name="phone" className="field mt-1" /></label>
      <label className="text-sm">
        Univers
        <select name="category" className="field mt-1">
          {categories.map((item) => (
            <option key={item.slug} value={item.slug}>{item.label}</option>
          ))}
        </select>
      </label>
      <label className="text-sm md:col-span-2">Objet<input name="title" required className="field mt-1" /></label>
      <label className="text-sm md:col-span-2">Note<textarea name="message" className="field mt-1" /></label>
      <label className="flex items-center gap-2 text-sm md:col-span-2"><input type="checkbox" name="example" /> Donnée d'exemple</label>
      {state?.error && <p className="text-sm text-rust md:col-span-2">{state.error}</p>}
      <button className="btn md:col-span-2" disabled={pending}>Ouvrir le dossier</button>
    </form>
  );
}
