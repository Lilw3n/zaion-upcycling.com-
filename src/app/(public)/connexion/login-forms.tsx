"use client";

import Link from "next/link";
import { Suspense, useActionState } from "react";
import { useSearchParams } from "next/navigation";
import { confirmPasswordCodeAction, loginAction, requestPasswordCodeAction, type ActionState } from "@/server/actions";

const errors: Record<string, string> = {
  google: "La connexion Google n'a pas abouti. Réessayez, ou utilisez le mot de passe.",
  lien: "Ce lien a expiré ou a déjà été utilisé.",
};

export function LoginForms({ googleReady, ionosReady }: { googleReady: boolean; ionosReady: boolean }) {
  return (
    <Suspense>
      <Forms googleReady={googleReady} ionosReady={ionosReady} />
    </Suspense>
  );
}

function Forms({ googleReady, ionosReady }: { googleReady: boolean; ionosReady: boolean }) {
  const params = useSearchParams();
  const next = params.get("next") ?? "";
  const notice = errors[params.get("erreur") ?? ""];
  const [passwordState, passwordAction, passwordPending] = useActionState(loginAction, null as ActionState);
  const [codeState, codeAction, codePending] = useActionState(requestPasswordCodeAction, null as ActionState);
  const [confirmState, confirmAction, confirmPending] = useActionState(confirmPasswordCodeAction, null as ActionState);
  const email = confirmState?.email || codeState?.email || "";
  const showCode = Boolean(email) && (codeState?.step === "code" || confirmState?.step === "code") && !confirmState?.ok;

  return (
    <div className="mt-8 space-y-8">
      {notice && <p className="text-sm text-rust">{notice}</p>}
      <form action={passwordAction} className="grid gap-3">
        <input type="hidden" name="next" value={next} />
        <label>E-mail<input name="email" type="email" required className="field" autoComplete="username" /></label>
        <label>Mot de passe<input name="password" type="password" required className="field" autoComplete="current-password" /></label>
        {passwordState?.error && <p className="text-sm text-rust">{passwordState.error}</p>}
        <button className="btn" disabled={passwordPending}>{passwordPending ? "Connexion…" : "Entrer"}</button>
      </form>

      <div className="grid gap-3 border-t border-line pt-6">
        <p className="text-sm font-semibold">Code par e-mail</p>
        <p className="text-sm text-ink/65">
          {ionosReady
            ? "Pour choisir ou retrouver un mot de passe, un code à 6 chiffres part sur l'adresse du compte."
            : "Le code partira depuis contact@zaion-upcycling.com dès que la boîte sera reliée au serveur."}
        </p>
        {showCode ? (
          <form action={confirmAction} className="grid gap-3">
            <input type="hidden" name="email" value={email} />
            <label>Code<input name="code" inputMode="numeric" autoComplete="one-time-code" required className="field" /></label>
            <label>Nouveau mot de passe<input name="password" type="password" minLength={8} required className="field" autoComplete="new-password" /></label>
            {confirmState?.error && <p className="text-sm text-rust">{confirmState.error}</p>}
            <button className="btn" disabled={confirmPending}>{confirmPending ? "Vérification…" : "Enregistrer et entrer"}</button>
          </form>
        ) : (
          <form action={codeAction} className="grid gap-3">
            <label>E-mail<input name="email" type="email" required className="field" /></label>
            {codeState?.error && <p className="text-sm text-rust">{codeState.error}</p>}
            {codeState?.ok && <p className="text-sm text-moss">{codeState.ok}</p>}
            <button className="btn-line" disabled={codePending}>{codePending ? "Envoi…" : "Recevoir un code"}</button>
          </form>
        )}
      </div>

      <div className="border-t border-line pt-6">
        <p className="text-sm font-semibold">Google</p>
        <p className="mt-1 text-sm text-ink/65">
          {googleReady
            ? "Le compte Google ouvre l'espace correspondant à son adresse."
            : "Le bouton s'ouvrira quand l'identifiant Google du site sera enregistré sur le serveur."}
        </p>
        {googleReady ? (
          <a className="btn mt-3 bg-white text-ink" href={`/api/auth/google?next=${encodeURIComponent(next)}`}>
            Continuer avec Google
          </a>
        ) : (
          <button className="btn mt-3 cursor-not-allowed bg-sand text-ink/50" type="button" disabled>
            Continuer avec Google
          </button>
        )}
      </div>
      <p className="text-sm">
        Pas encore de compte ? <Link href="/inscription" className="underline">Créer un accès</Link>
      </p>
    </div>
  );
}
