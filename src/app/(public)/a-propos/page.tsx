import type { Metadata } from "next";
import Link from "next/link";
import { publicAtelierAddress } from "@/components/public-address";

export const metadata: Metadata = { title: "L'atelier" };

export default async function AboutPage() {
  const atelier = await publicAtelierAddress();
  return (
    <article className="mx-auto max-w-3xl px-4 py-12">
      <p className="text-xs uppercase tracking-[0.2em] text-ink/50">Zaïon Upcycling</p>
      <h1 className="mt-2 font-serif text-5xl">Faciliter pour durer</h1>
      <p className="mt-6 text-lg">Zaïon Naceur conçoit, répare et transforme des matériaux techniques pour leur donner une seconde vie.</p>
      <img src="/realisations/soudeuse.jpg" alt="Presse de soudure haute fréquence" className="mt-8 w-full object-cover" />
      <div className="mt-8 space-y-4 text-ink/80">
        <p>Voiles, structures gonflables, mobilier, textiles techniques : chaque projet part d'une matière existante, d'un usage et d'une contrainte. L'objectif est de faire durer l'existant plutôt que de le remplacer.</p>
        <p>Le geste s'est construit chez North Sails et Wanikou, sur la réparation et la transformation des voiles, puis chez Michelin Inflatable Solutions, au cœur des déchets textiles industriels. En un an, l'optimisation des plans de découpe et un écosystème de partenaires ont réduit 35 % des déchets de l'atelier : 10 % en imbriquant des pièces plus petites dans les chutes, 25 % en faisant circuler les matières vers d'autres savoir-faire.</p>
        <p>Ce réseau compte notamment Captain Néo, 909 Upcycling, La Virgule, l'ENSAV et K-ren, spécialiste des housses antifouling. Une même toile peut devenir wing, banquette, housse ou volume scénographique.</p>
        <p>L'atelier travaille la couture technique et la soudure haute fréquence. Les devis demandent donc la matière, les dimensions, le type d'assemblage, les renforts et les contraintes d'usage avant de chiffrer.</p>
        {atelier && <p>Les rendez-vous se tiennent au {atelier}. Ce lieu n'est pas le siège indiqué dans les mentions légales.</p>}
      </div>
      <div className="mt-8 grid grid-cols-3 gap-2">
        <img src="/realisations/wing.jpeg" alt="Wing sur la plage" className="aspect-square object-cover" />
        <img src="/realisations/donut.jpg" alt="Assise gonflable" className="aspect-square object-cover" />
        <img src="/realisations/arche.png" alt="Arche gonflable en atelier" className="aspect-square object-cover" />
      </div>
      <Link href="/devis" className="btn mt-8">Parler d'un projet</Link>
    </article>
  );
}
