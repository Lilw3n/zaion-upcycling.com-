"use client";

import Link from "next/link";
import { useActionState } from "react";
import { registerAction, type ActionState } from "@/server/actions";

export default function RegisterPage() {
  const [state, action, pending] = useActionState(registerAction, null as ActionState);
  return (
    <div className="mx-auto max-w-md px-4 py-16">
      <h1 className="font-serif text-5xl">Créer un compte</h1>
      <p className="mt-3 text-ink/70">Pour passer commande et suivre la fabrication.</p>
      <form action={action} className="mt-8 grid gap-3">
        <label>Nom<input name="name" required className="field" /></label>
        <label>E-mail<input name="email" type="email" required className="field" /></label>
        <label>Téléphone<input name="phone" className="field" /></label>
        <label>Mot de passe<input name="password" type="password" minLength={8} required className="field" /></label>
        {state?.error && <p className="text-sm text-rust">{state.error}</p>}
        <button className="btn" disabled={pending}>Créer le compte</button>
      </form>
      <p className="mt-6 text-sm">Déjà inscrit ? <Link className="underline" href="/connexion">Se connecter</Link></p>
    </div>
  );
}
