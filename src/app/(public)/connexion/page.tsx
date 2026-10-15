"use client";

import Link from "next/link";
import { useActionState } from "react";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { loginAction, type ActionState } from "@/server/actions";

function Form() {
  const params = useSearchParams();
  const [state, action, pending] = useActionState(loginAction, null as ActionState);
  return (
    <form action={action} className="mt-8 grid gap-3">
      <input type="hidden" name="next" value={params.get("next") ?? ""} />
      <label>E-mail<input name="email" type="email" required className="field" /></label>
      <label>Mot de passe<input name="password" type="password" required className="field" /></label>
      {state?.error && <p className="text-sm text-rust">{state.error}</p>}
      <button className="btn" disabled={pending}>{pending ? "Connexion…" : "Entrer"}</button>
    </form>
  );
}

export default function LoginPage() {
  return (
    <div className="mx-auto max-w-md px-4 py-16">
      <h1 className="font-serif text-5xl">Connexion</h1>
      <p className="mt-3 text-ink/70">Clients, atelier et pilotage utilisent la même porte.</p>
      <Suspense>
        <Form />
      </Suspense>
      <p className="mt-6 text-sm">
        Pas encore de compte ? <Link href="/inscription" className="underline">Créer un accès client</Link>
      </p>
    </div>
  );
}
