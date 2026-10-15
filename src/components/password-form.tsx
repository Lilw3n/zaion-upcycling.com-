"use client";

import { useActionState } from "react";
import { changePasswordAction, confirmChangedPasswordAction, type ActionState } from "@/server/actions";

export function PasswordForm() {
  const [state, action, pending] = useActionState(changePasswordAction, null as ActionState);
  const [confirmState, confirmAction, confirmPending] = useActionState(confirmChangedPasswordAction, null as ActionState);
  const showCode = (state?.step === "code" || confirmState?.step === "code") && !confirmState?.ok;

  if (showCode) {
    return (
      <form action={confirmAction} className="grid gap-2 md:grid-cols-[1fr_auto]">
        <input name="code" inputMode="numeric" autoComplete="one-time-code" required placeholder="Code reçu par e-mail" className="field" />
        <button className="btn" disabled={confirmPending}>{confirmPending ? "Vérification…" : "Confirmer"}</button>
        {state?.ok && <p className="text-sm text-moss md:col-span-2">{state.ok}</p>}
        {confirmState?.error && <p className="text-sm text-rust md:col-span-2">{confirmState.error}</p>}
      </form>
    );
  }

  return (
    <form action={action} className="grid gap-2">
      <p className="text-sm text-ink/70">L'ancien mot de passe n'est pas demandé. Un code à 6 chiffres part sur l'adresse du compte, puis le nouveau mot de passe est enregistré.</p>
      <div className="grid gap-2 md:grid-cols-[1fr_auto]">
        <input name="next" type="password" minLength={8} required placeholder="Nouveau mot de passe" className="field" autoComplete="new-password" />
        <button className="btn" disabled={pending}>{pending ? "Envoi…" : "Recevoir le code"}</button>
      </div>
      {state?.error && <p className="text-sm text-rust">{state.error}</p>}
      {confirmState?.ok && <p className="text-sm text-moss">{confirmState.ok}</p>}
    </form>
  );
}
