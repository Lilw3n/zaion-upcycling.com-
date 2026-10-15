"use client";

import { useActionState } from "react";
import { confirmProfileAction, updateProfileAction, type ActionState } from "@/server/actions";

export function ProfileForm({ name, phone, address }: { name: string; phone: string; address: string }) {
  const [state, action, pending] = useActionState(updateProfileAction, null as ActionState);
  const [confirmState, confirmAction, confirmPending] = useActionState(confirmProfileAction, null as ActionState);
  const showCode = (state?.step === "code" || confirmState?.step === "code") && !confirmState?.ok;

  return (
    <div className="bg-foam p-5">
      <h2 className="font-semibold">Coordonnées</h2>
      <p className="mt-2 text-sm text-ink/65">Le changement est confirmé par un code envoyé sur l'adresse du compte.</p>
      {showCode ? (
        <form action={confirmAction} className="mt-4 grid gap-2 md:grid-cols-[1fr_auto]">
          <input name="code" inputMode="numeric" autoComplete="one-time-code" required placeholder="Code reçu par e-mail" className="field" />
          <button className="btn" disabled={confirmPending}>{confirmPending ? "Vérification…" : "Confirmer"}</button>
          {state?.ok && <p className="text-sm text-moss md:col-span-2">{state.ok}</p>}
          {confirmState?.error && <p className="text-sm text-rust md:col-span-2">{confirmState.error}</p>}
        </form>
      ) : (
        <form action={action} className="mt-4 grid gap-3">
          <label>Nom<input name="name" required defaultValue={name} className="field" /></label>
          <label>Téléphone<input name="phone" defaultValue={phone} className="field" /></label>
          <label>Adresse<textarea name="address" defaultValue={address} className="field min-h-24" /></label>
          {state?.error && <p className="text-sm text-rust">{state.error}</p>}
          {confirmState?.ok && <p className="text-sm text-moss">{confirmState.ok}</p>}
          <button className="btn w-fit" disabled={pending}>{pending ? "Envoi…" : "Recevoir le code"}</button>
        </form>
      )}
    </div>
  );
}
