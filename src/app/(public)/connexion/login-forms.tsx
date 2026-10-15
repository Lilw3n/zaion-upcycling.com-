"use client";

import Link from "next/link";
import { Suspense, useActionState } from "react";
import { useSearchParams } from "next/navigation";
import { loginAction, magicLinkAction, type ActionState } from "@/server/actions";

const errors: Record<string, string> = {
  google: "La connexion Google n'est pas encore reliée au compte de l'atelier.",
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
  const [linkState, linkAction, linkPending] = useActionState(magicLinkAction, null as ActionState);

  return (
    <div className="mt-8 space-y-8">
      {notice && <p className="text-sm text-rust">{notice}</p>}
      <form action={passwordAction} className="grid gap-3">
        <input type="hidden" name="next" value={next} />
        <label>E-mail<input name="email" type="email" required className="field" /></label>
        <label>Mot de passe<input name="password" type="password" required className="field" /></label>
        {passwordState?.error && <p className="text-sm text-rust">{passwordState.error}</p>}
        <button className="btn" disabled={passwordPending}>{passwordPending ? "Connexion…" : "Entrer"}</button>
      </form>

      <form action={linkAction} className="grid gap-3 border-t border-line pt-6">
        <p className="text-sm font-semibold">Lien par e-mail</p>
        <p className="text-sm text-ink/65">
          {ionosReady
            ? "Un lien est envoyé depuis la messagerie IONOS de l'atelier."
            : "Prévu sur la boîte IONOS de contact@zaion-upcycling.com, après le transfert depuis l'hébergeur actuel."}
        </p>
        <label>E-mail<input name="email" type="email" required className="field" /></label>
        {linkState?.error && <p className="text-sm text-rust">{linkState.error}</p>}
        {linkState?.ok && <p className="text-sm text-moss">{linkState.ok}</p>}
        <button className="btn-line" disabled={linkPending}>{linkPending ? "Envoi…" : "Recevoir un lien"}</button>
      </form>

      <div className="border-t border-line pt-6">
        <p className="text-sm font-semibold">Google</p>
        <p className="mt-1 text-sm text-ink/65">
          {googleReady
            ? "Le compte Google de l'atelier est relié."
            : "Le bouton est en place. Il s'ouvrira quand le compte Google de Zaïon sera relié."}
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
        Pas encore de compte ? <Link href="/inscription" className="underline">Créer un accès client</Link>
      </p>
    </div>
  );
}
