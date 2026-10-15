"use client";

import { useActionState } from "react";
import { contactLead, type ActionState } from "@/server/actions";

export function ContactForm() {
  const [state, action, pending] = useActionState(contactLead, null as ActionState);
  return (
    <form action={action} className="grid gap-3 bg-foam p-5">
      <label>Nom<input name="name" required className="field" /></label>
      <label>E-mail<input type="email" name="email" required className="field" /></label>
      <label>Téléphone<input name="phone" className="field" /></label>
      <label>Message<textarea name="message" required className="field min-h-32" /></label>
      {state?.error && <p className="text-sm text-rust">{state.error}</p>}
      {state?.ok && <p className="text-sm text-moss">{state.ok}</p>}
      <button className="btn" disabled={pending}>Envoyer</button>
    </form>
  );
}
