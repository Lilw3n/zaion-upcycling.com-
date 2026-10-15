import Link from "next/link";
import { desc } from "drizzle-orm";
import { PasswordForm } from "@/components/password-form";
import { db } from "@/db";
import { charges, leads, quotes, revenues } from "@/db/schema";
import { euros, quoteStatusLabel } from "@/lib/format";
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
          Devis, contacts, chiffre d'affaires, TVA et charges. Les montants d'ouverture sont à remplacer par vos relevés.
        </p>
      </div>
      <div className="grid gap-3 md:grid-cols-4">
        <Stat label="CA HT" value={euros(stats.ht)} />
        <Stat label="TVA" value={euros(stats.vat)} />
        <Stat label="CA TTC" value={euros(stats.ttc)} />
        <Stat label="Charges saisies" value={euros(stats.charges)} />
      </div>
      {settings.commissionVisible && (
        <div className="grid gap-3 md:grid-cols-2">
          <Stat label="Part partenaire" value={euros(stats.commission)} />
          <Stat label="Reste après part, avant charges" value={euros(stats.afterCommission)} />
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
                  <span>{quote.number} · {quote.title}</span>
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
                <span>{lead.name}</span>
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

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-foam p-4">
      <p className="text-xs uppercase tracking-[0.14em] text-ink/50">{label}</p>
      <p className="mt-2 text-2xl font-semibold">{value}</p>
    </div>
  );
}
