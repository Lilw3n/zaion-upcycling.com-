import type { Metadata } from "next";
import Link from "next/link";
import { publicAtelierAddress } from "@/components/public-address";
import { readSiteCopy } from "@/lib/site-copy";

export const metadata: Metadata = { title: "L'atelier" };

export default async function AboutPage() {
  const [atelier, copy] = await Promise.all([publicAtelierAddress(), readSiteCopy()]);
  return (
    <article className="mx-auto max-w-3xl px-4 py-12">
      <p className="text-xs uppercase tracking-[0.2em] text-ink/50">{copy.aboutKicker}</p>
      <h1 className="mt-2 font-serif text-5xl">{copy.aboutTitle}</h1>
      <p className="mt-6 text-lg">{copy.aboutLead}</p>
      <img src="/realisations/soudeuse.jpg" alt="Presse de soudure haute fréquence" className="mt-8 w-full object-cover" />
      <div className="mt-8 space-y-4 text-ink/80">
        {copy.aboutBody.replace(/\r\n/g, "\n").split(/\n{2,}/).map((paragraph) => paragraph.trim()).filter(Boolean).map((paragraph, index) => (
          <p key={index}>{paragraph}</p>
        ))}
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
