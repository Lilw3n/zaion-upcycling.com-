"use client";

import { useActionState } from "react";
import { changePasswordAction, type ActionState } from "@/server/actions";

export function PasswordForm() {
  const [state, action, pending] = useActionState(changePasswordAction, null as ActionState);
  return (
    <form action={action} className="grid gap-2 md:grid-cols-3">
      <input name="current" type="password" required placeholder="Mot de passe actuel" className="field" />
      <input name="next" type="password" minLength={8} required placeholder="Nouveau mot de passe" className="field" />
      <button className="btn" disabled={pending}>Changer</button>
      {state?.error && <p className="text-sm text-rust md:col-span-3">{state.error}</p>}
      {state?.ok && <p className="text-sm text-moss md:col-span-3">{state.ok}</p>}
    </form>
  );
}
