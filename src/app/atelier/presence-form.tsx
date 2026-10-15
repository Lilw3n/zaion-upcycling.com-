"use client";

import { useActionState } from "react";
import { saveAtelierPresence, type ActionState } from "@/server/actions";

export function PresenceForm({
  address,
  published,
  canPublish,
}: {
  address: string;
  published: boolean;
  canPublish: boolean;
}) {
  const [state, action, pending] = useActionState(saveAtelierPresence, null as ActionState);
  return (
    <form action={action} className="grid gap-3 bg-foam p-5">
      <h2 className="font-semibold">Lieu de rendez-vous</h2>
      <p className="text-sm text-ink/70">
        Le siège publié dans les mentions légales reste à Orsay. Cette adresse, si vous la mettez en ligne, apparaît seulement comme lieu de rendez-vous sur le contact et la page atelier.
      </p>
      <label className="text-sm">
        Adresse
        <input name="address" defaultValue={address} className="field mt-1" placeholder="Adresse du local, une fois le bail signé" />
      </label>
      <div className="border border-rust/30 bg-paper p-4 text-sm">
        <p className="font-semibold">Avant de publier</p>
        <ul className="mt-2 list-disc space-y-1 pl-4 text-ink/80">
          <li>L'adresse devient publique : elle est indexée, et des annuaires peuvent la recopier. La retirer du site n'efface pas ces copies.</li>
          <li>Des clients peuvent se présenter sans rendez-vous.</li>
          <li>Sans bail, le local n'est pas un établissement déclaré. Le bailleur, l'assurance et Google peuvent refuser un lieu que vous n'occupez pas légalement.</li>
          <li>Le domicile personnel ne doit jamais servir d'adresse d'atelier sur le site.</li>
        </ul>
      </div>
      {canPublish ? (
        <>
          <label className="flex items-start gap-2 text-sm">
            <input type="checkbox" name="public" defaultChecked={published} className="mt-1" />
            Afficher cette adresse sur le site
          </label>
          <label className="flex items-start gap-2 text-sm">
            <input type="checkbox" name="risks" className="mt-1" />
            Je publie ce lieu en connaissance de ces risques. Ce n'est pas mon domicile, et je peux recevoir du public à cette adresse.
          </label>
        </>
      ) : (
        <p className="text-sm text-ink/70">
          {published
            ? "L'adresse est en ligne. Seule Zaïon peut la publier ; vous pouvez la retirer depuis le pilotage."
            : "Seule Zaïon, connectée avec contact@zaion-upcycling.com, peut mettre cette adresse en ligne."}
        </p>
      )}
      {state?.error && <p className="text-sm text-rust">{state.error}</p>}
      {state?.ok && <p className="text-sm text-moss">{state.ok}</p>}
      <button className="btn" disabled={pending}>{canPublish ? "Enregistrer" : "Enregistrer le brouillon"}</button>
    </form>
  );
}
