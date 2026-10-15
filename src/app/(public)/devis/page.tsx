"use client";

import { Suspense, useActionState } from "react";
import { useSearchParams } from "next/navigation";
import { categories } from "@/data/catalogue";
import { assemblyQuestions } from "@/lib/questions";
import { requestQuote, type ActionState } from "@/server/actions";

function Form() {
  const params = useSearchParams();
  const [state, action, pending] = useActionState(requestQuote, null as ActionState);
  return (
    <form action={action} className="grid gap-3">
      <div className="grid gap-3 md:grid-cols-2">
        <label>Nom<input name="name" required className="field" /></label>
        <label>E-mail<input type="email" name="email" required className="field" /></label>
        <label>Téléphone<input name="phone" className="field" /></label>
        <label>
          Univers
          <select name="category" defaultValue={params.get("univers") ?? "nautisme"} className="field">
            {categories.map((item) => (
              <option key={item.slug} value={item.slug}>{item.label}</option>
            ))}
            <option value="atelier">Bureau d'études</option>
          </select>
        </label>
      </div>
      <label>Objet<input name="title" required className="field" defaultValue={params.get("sujet") ?? ""} /></label>
      <label>Votre idée<textarea name="message" className="field min-h-24" placeholder="Usage, lieu, contrainte principale" /></label>
      <fieldset className="grid gap-3 border border-line p-4">
        <legend className="px-2 text-sm font-semibold">Montage de la pièce</legend>
        <p className="text-sm text-ink/60">Plus ces informations sont précises, plus le devis est juste. Laissez vide ce que vous ne savez pas encore : l'atelier vous les redemandera.</p>
        {assemblyQuestions.map((label, index) => (
          <label key={label} className="text-sm">
            {label}
            <input name={`q_${index}`} className="field mt-1" />
          </label>
        ))}
      </fieldset>
      {state?.error && <p className="text-sm text-rust">{state.error}</p>}
      {state?.ok && <p className="text-sm text-moss">{state.ok}</p>}
      <button className="btn" disabled={pending}>Envoyer la demande</button>
    </form>
  );
}

export default function QuotePage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="font-serif text-5xl">Demander un devis</h1>
      <p className="mt-3 text-ink/70">Réparation, structure gonflable, mobilier ou pièce unique : partez de la matière et de l'assemblage.</p>
      <div className="mt-8">
        <Suspense>
          <Form />
        </Suspense>
      </div>
    </div>
  );
}
