"use client";

import { useActionState } from "react";
import Link from "next/link";
import { categories } from "@/data/catalogue";
import type { SiteCopy } from "@/lib/site-copy";
import { saveSiteCopyAction, type ActionState } from "@/server/actions";

export function SiteForm({ copy }: { copy: SiteCopy }) {
  const [state, action, pending] = useActionState(saveSiteCopyAction, null as ActionState);
  return (
    <form action={action} className="space-y-8">
      <fieldset className="grid gap-3 bg-foam p-4">
        <legend className="px-2 font-semibold">Accueil</legend>
        <p className="text-sm text-ink/60">Le grand texte sur la photo, le passage sur le parcours, les légendes des vidéos et l'appel en bas de page. <Link className="underline" href="/">Voir l'accueil</Link></p>
        <label>Sur-titre<input name="heroKicker" defaultValue={copy.heroKicker} className="field" /></label>
        <label>Titre<input name="heroTitle" defaultValue={copy.heroTitle} className="field" /></label>
        <label>Texte<textarea name="heroText" defaultValue={copy.heroText} className="field min-h-24" /></label>
        <label>Petit titre du parcours<input name="terrainEyebrow" defaultValue={copy.terrainEyebrow} className="field" /></label>
        <label>Titre du parcours<input name="terrainTitle" defaultValue={copy.terrainTitle} className="field" /></label>
        <label>Parcours, premier paragraphe<textarea name="terrainP1" defaultValue={copy.terrainP1} className="field min-h-28" /></label>
        <label>Parcours, second paragraphe<textarea name="terrainP2" defaultValue={copy.terrainP2} className="field min-h-24" /></label>
        <label>Légende de la première vidéo<input name="video1" defaultValue={copy.video1} className="field" /></label>
        <label>Légende de la seconde vidéo<input name="video2" defaultValue={copy.video2} className="field" /></label>
        <label>Bas de page, sur-titre<input name="closingEyebrow" defaultValue={copy.closingEyebrow} className="field" /></label>
        <label>Bas de page, titre<input name="closingTitle" defaultValue={copy.closingTitle} className="field" /></label>
        <label>Bas de page, texte<textarea name="closingText" defaultValue={copy.closingText} className="field min-h-20" /></label>
      </fieldset>

      <fieldset className="grid gap-3 bg-foam p-4">
        <legend className="px-2 font-semibold">L'atelier</legend>
        <p className="text-sm text-ink/60">Un saut de ligne entre deux paragraphes. <Link className="underline" href="/a-propos">Voir la page</Link></p>
        <label>Sur-titre<input name="aboutKicker" defaultValue={copy.aboutKicker} className="field" /></label>
        <label>Titre<input name="aboutTitle" defaultValue={copy.aboutTitle} className="field" /></label>
        <label>Introduction<textarea name="aboutLead" defaultValue={copy.aboutLead} className="field min-h-20" /></label>
        <label>Texte<textarea name="aboutBody" defaultValue={copy.aboutBody} className="field min-h-64" /></label>
      </fieldset>

      <fieldset className="grid gap-3 bg-foam p-4">
        <legend className="px-2 font-semibold">Contact</legend>
        <p className="text-sm text-ink/60">Le téléphone et l'e-mail restent ceux des mentions légales. <Link className="underline" href="/contact">Voir la page</Link></p>
        <label>Phrase sous les coordonnées<textarea name="contactNote" defaultValue={copy.contactNote} className="field min-h-20" /></label>
      </fieldset>

      {categories.map((item) => {
        const row = copy.universes[item.slug];
        return (
          <fieldset key={item.slug} className="grid gap-3 bg-foam p-4">
            <legend className="px-2 font-semibold">{item.label}</legend>
            <p className="text-sm text-ink/60">
              Une ligne qui commence par <span className="font-mono"># </span> devient un sous-titre. Une ligne qui commence par <span className="font-mono">- </span> devient une puce. Laissez une ligne vide entre les blocs.{" "}
              <Link className="underline" href={`/univers/${item.slug}`}>Voir la page</Link>
            </p>
            <label>Accroche de la mosaïque<input name={`u_${item.slug}_blurb`} defaultValue={row.blurb} className="field" /></label>
            <label>Chapô<input name={`u_${item.slug}_kicker`} defaultValue={row.kicker} className="field" /></label>
            <label>Titre<input name={`u_${item.slug}_title`} defaultValue={row.title} className="field" /></label>
            <label>Texte<textarea name={`u_${item.slug}_body`} defaultValue={row.body} className="field min-h-72" /></label>
          </fieldset>
        );
      })}

      {state?.error && <p className="text-sm text-rust">{state.error}</p>}
      {state?.ok && <p className="text-sm text-moss">{state.ok}</p>}
      <button className="btn" disabled={pending}>{pending ? "Enregistrement…" : "Enregistrer les textes"}</button>
    </form>
  );
}
