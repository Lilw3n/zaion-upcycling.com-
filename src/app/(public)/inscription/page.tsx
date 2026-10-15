"use client";

import Link from "next/link";
import { useActionState } from "react";
import { confirmSignupAction, registerAction, type ActionState } from "@/server/actions";

export default function RegisterPage() {
  const [state, action, pending] = useActionState(registerAction, null as ActionState);
  const [confirmState, confirmAction, confirmPending] = useActionState(confirmSignupAction, null as ActionState);
  const email = confirmState?.email || state?.email || "";
  const showCode = Boolean(email) && (state?.step === "code" || confirmState?.step === "code");

  return (
    <div className="mx-auto max-w-md px-4 py-16">
      <h1 className="font-serif text-5xl">Créer un compte</h1>
      <p className="mt-3 text-ink/70">Un code à 6 chiffres confirme l'adresse avant l'ouverture du compte.</p>
      {showCode ? (
        <form action={confirmAction} className="mt-8 grid gap-3">
          <input type="hidden" name="email" value={email} />
          <p className="text-sm">Code envoyé à {email}.</p>
          <label>Code<input name="code" inputMode="numeric" autoComplete="one-time-code" required className="field" /></label>
          {confirmState?.error && <p className="text-sm text-rust">{confirmState.error}</p>}
          <button className="btn" disabled={confirmPending}>{confirmPending ? "Vérification…" : "Confirmer le compte"}</button>
        </form>
      ) : (
        <form action={action} className="mt-8 grid gap-3">
          <label>Nom<input name="name" required className="field" /></label>
          <label>E-mail<input name="email" type="email" required className="field" /></label>
          <label>Téléphone<input name="phone" className="field" /></label>
          <label>Mot de passe<input name="password" type="password" minLength={8} required className="field" autoComplete="new-password" /></label>
          {state?.error && <p className="text-sm text-rust">{state.error}</p>}
          <button className="btn" disabled={pending}>{pending ? "Envoi…" : "Recevoir le code"}</button>
        </form>
      )}
      <p className="mt-6 text-sm">Déjà inscrit ? <Link className="underline" href="/connexion">Se connecter</Link></p>
    </div>
  );
}
