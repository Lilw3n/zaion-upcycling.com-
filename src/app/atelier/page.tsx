import Link from "next/link";
import { desc } from "drizzle-orm";
import { PasswordForm } from "@/components/password-form";
import { db } from "@/db";
import { charges, leads, quotes, revenues } from "@/db/schema";
import { ExampleMark, MoneyStat } from "@/components/example-mark";
import { quoteStatusLabel } from "@/lib/format";
import { readSettings, summarize } from "@/lib/finance";
import { suggestedAtelierAddress } from "@/lib/places";
import { getSession } from "@/lib/session";
import { PresenceForm } from "./presence-form";

export default async function AtelierHome() {
  const [revenueRows, chargeRows, quoteRows, leadRows, settings, session] = await Promise.all([
    db.select().from(revenues),
    db.select().from(charges),
    db.select().from(quotes).orderBy(desc(quotes.createdAt)),
    db.select().from(leads).orderBy(desc(leads.createdAt)),
    readSettings(),
    getSession(),
  ]);
  const stats = summarize(revenueRows, chargeRows);
  const missing = quoteRows.filter((quote) => quote.status === "infos").length;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-serif text-4xl">Atelier</h1>
        <p className="mt-2 max-w-2xl text-sm text-ink/70">
          Le premier montant est le réel. La ligne suivante ajoute les données d'exemple. Aujourd'hui, sans vente enregistrée, le réel est à zéro.
        </p>
      </div>
      <div className="flex flex-wrap gap-3">
        <Link href="/atelier/produits/nouveau" className="btn">Ajouter une pièce</Link>
        <Link href="/atelier/commandes" className="btn-line">Commandes</Link>
        <Link href="/atelier/offres" className="btn-line">Promos et parrainage</Link>
      </div>
      <div className="grid gap-3 md:grid-cols-4">
        <MoneyStat label="CA HT" real={stats.real.ht} withExamples={stats.withExamples.ht} />
        <MoneyStat label="TVA" real={stats.real.vat} withExamples={stats.withExamples.vat} />
        <MoneyStat label="CA TTC" real={stats.real.ttc} withExamples={stats.withExamples.ttc} />
        <MoneyStat label="Charges saisies" real={stats.real.charges} withExamples={stats.withExamples.charges} />
      </div>
      {settings.commissionVisible && (
        <div className="grid gap-3 md:grid-cols-2">
          <MoneyStat label="Part partenaire" real={stats.real.commission} withExamples={stats.withExamples.commission} />
          <MoneyStat label="Reste après part, avant charges" real={stats.real.afterCommission} withExamples={stats.withExamples.afterCommission} />
        </div>
      )}
      <div className="grid gap-6 lg:grid-cols-2">
        <section className="bg-foam p-5">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold">Devis en cours</h2>
            <Link href="/atelier/devis" className="text-sm underline">{missing} à compléter</Link>
          </div>
          <ul className="mt-4 space-y-2 text-sm">
            {quoteRows.slice(0, 5).map((quote) => (
              <li key={quote.id}>
                <Link href={`/atelier/devis/${quote.id}`} className="flex justify-between gap-3 hover:underline">
                  <span>{quote.number} · {quote.title}{quote.example && <ExampleMark />}</span>
                  <span>{quoteStatusLabel[quote.status]}</span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
        <section className="bg-foam p-5">
          <h2 className="font-semibold">Derniers contacts</h2>
          <ul className="mt-4 space-y-2 text-sm">
            {leadRows.slice(0, 5).map((lead) => (
              <li key={lead.id} className="flex justify-between gap-3">
                <span>{lead.name}{lead.example && <ExampleMark />}</span>
                <span className="text-ink/60">{lead.source}</span>
              </li>
            ))}
          </ul>
        </section>
      </div>
      <PresenceForm
        address={settings.atelierAddress || suggestedAtelierAddress()}
        published={settings.atelierPublic}
        canPublish={session?.role === "atelier"}
      />
      <section className="bg-foam p-5">
        <h2 className="font-semibold">Mot de passe</h2>
        <div className="mt-3"><PasswordForm /></div>
      </section>
    </div>
  );
}

