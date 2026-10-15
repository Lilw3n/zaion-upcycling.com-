import type { Metadata } from "next";

export const metadata: Metadata = { title: "Mentions légales" };

export default function LegalPage() {
  return (
    <article className="mx-auto max-w-3xl space-y-4 px-4 py-12">
      <h1 className="font-serif text-5xl">Mentions légales</h1>
      <p>Éditeur : Zaïon Naceur, micro-entrepreneur, Zaïon Upcycling.</p>
      <p>Activité : fabrication d'objets surcyclés et réparation.</p>
      <p>SIRET : 985 037 373. TVA : FR50985037373. RCS Evry.</p>
      <p>Établissement : 1 rue de la Troche, 91400 Orsay.</p>
      <p>Contact : contact@zaion-upcycling.com · 06 14 92 25 65.</p>
      <p>Hébergement : Vercel Inc., 440 N Barranca Ave #4133, Covina, CA 91723, États-Unis. Le code source est versionné sur GitHub.</p>
      <p>Les photos de réalisations illustrent le travail de l'atelier. Les informations de compte, devis, commandes et gestion restent accessibles aux seules personnes habilitées.</p>
    </article>
  );
}
