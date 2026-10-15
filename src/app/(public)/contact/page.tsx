"use client";

import { useActionState } from "react";
import { contactLead, type ActionState } from "@/server/actions";

export default function ContactPage() {
  const [state, action, pending] = useActionState(contactLead, null as ActionState);
  return (
    <div className="mx-auto grid max-w-5xl gap-10 px-4 py-12 md:grid-cols-2">
      <div>
        <h1 className="font-serif text-5xl">Contact</h1>
        <p className="mt-4 text-ink/75">Zaïon Upcycling · Zaïon Naceur</p>
        <a className="mt-4 block text-lg" href="tel:+33614922565">06 14 92 25 65</a>
        <a className="block" href="mailto:contact@zaion-upcycling.com">contact@zaion-upcycling.com</a>
        <p className="mt-6 text-sm text-ink/70">Pour un chiffrage avec dimensions et assemblage, le formulaire de devis est plus précis.</p>
      </div>
      <form action={action} className="grid gap-3 bg-foam p-5">
        <label>Nom<input name="name" required className="field" /></label>
        <label>E-mail<input type="email" name="email" required className="field" /></label>
        <label>Téléphone<input name="phone" className="field" /></label>
        <label>Message<textarea name="message" required className="field min-h-32" /></label>
        {state?.error && <p className="text-sm text-rust">{state.error}</p>}
        {state?.ok && <p className="text-sm text-moss">{state.ok}</p>}
        <button className="btn" disabled={pending}>Envoyer</button>
      </form>
    </div>
  );
}
