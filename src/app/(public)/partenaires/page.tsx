import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Partenaire — assurance, mutuelle et crédit",
  description: "Leads Opportunities, courtier en assurance, mutuelle et crédit, partenaire du site Zaïon Upcycling. Conseil à Nancy et dossiers suivis en France.",
  alternates: { canonical: "/partenaires" },
};

export default function PartnersPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16">
      <p className="text-xs uppercase tracking-[0.2em] text-ink/50">Partenaire</p>
      <h1 className="mt-2 font-serif text-5xl">Assurance, mutuelle et crédit</h1>
      <p className="mt-4 text-ink/80">
        Le site de l'atelier est réalisé par Wendy Buchet. À côté de ce travail, elle accompagne des projets d'assurance, de mutuelle et de crédit avec Leads Opportunities, cabinet ancré à Nancy, avec des dossiers suivis partout en France.
      </p>
      <p className="mt-4 text-ink/80">
        Mutuelle santé, assurances, crédit immobilier et financement. Le premier échange est sans engagement. Zaïon Upcycling ne vend pas ces contrats : la demande part vers Leads Opportunities.
      </p>
      <div className="mt-8 bg-foam p-6">
        <p className="font-semibold">Leads Opportunities</p>
        <p className="mt-2 text-sm text-ink/70">Wendy Buchet · courtier inscrit à l'ORIAS · Nancy et la métropole</p>
        <p className="mt-4 text-sm">
          <a className="underline" href="tel:+33651366222">06 51 36 62 22</a>
          <br />
          <a className="underline" href="mailto:contact@leadsopportunities.fr">contact@leadsopportunities.fr</a>
        </p>
        <a className="btn mt-6" href="https://www.leadsopportunities.fr/">Voir Leads Opportunities</a>
      </div>
      <p className="mt-8 text-sm text-ink/60">
        Les mentions du courtage, dont le numéro ORIAS, sont publiées sur le site du partenaire. Pour une voile, une bâche ou une sellerie, restez sur <Link className="underline" href="/devis">le devis de l'atelier</Link>.
      </p>
    </div>
  );
}
