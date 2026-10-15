import Link from "next/link";
import { PasswordForm } from "@/components/password-form";
import { db } from "@/db";
import { charges, revenues, users } from "@/db/schema";
import { euros } from "@/lib/format";
import { readSettings, summarize } from "@/lib/finance";
import { googleReady, ionosReady } from "@/lib/providers";
import { CommissionForm } from "./commission-form";

export default async function PilotagePage() {
  const [revenueRows, chargeRows, people, settings] = await Promise.all([
    db.select().from(revenues),
    db.select().from(charges),
    db.select().from(users),
    readSettings(),
  ]);
  const stats = summarize(revenueRows, chargeRows);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-serif text-4xl">Pilotage</h1>
        <p className="mt-2 max-w-2xl text-sm text-ink/70">
          Votre part est calculée sur le chiffre d'affaires HT. Elle reste dans les livres même lorsqu'elle est masquée dans l'espace atelier. Le CA et la TVA affichés à Zaïon ne sont pas réduits : seule la ligne « part partenaire » apparaît ou disparaît.
        </p>
      </div>
      <div className="grid gap-3 md:grid-cols-4">
        <Tile label="CA HT" value={euros(stats.ht)} />
        <Tile label="Votre part" value={euros(stats.commission)} />
        <Tile label="Reste atelier" value={euros(stats.afterCommission)} />
        <Tile label="Après charges" value={euros(stats.result)} />
      </div>
      <CommissionForm rate={settings.commissionRate} visible={settings.commissionVisible} vat={settings.vatRate} />
      <section className="bg-foam p-5">
        <h2 className="font-semibold">Accès</h2>
        <ul className="mt-3 space-y-2 text-sm">
          {people.map((person) => (
            <li key={person.id} className="flex justify-between gap-3">
              <span>{person.name} · {person.email}</span>
              <span className="text-ink/60">{person.role}</span>
            </li>
          ))}
        </ul>
        <p className="mt-4 text-sm">
          L'espace complet de Zaïon est dans <Link href="/atelier" className="underline">Atelier</Link>. Vous y voyez les devis, contacts, revenus, charges, commandes et pièces.
        </p>
      </section>
      <section className="bg-foam p-5">
        <h2 className="font-semibold">Connexions à brancher</h2>
        <ul className="mt-3 space-y-2 text-sm">
          <li>Messagerie IONOS : {ionosReady() ? "reliée, les liens de connexion partent." : "en attente du transfert de la boîte contact@zaion-upcycling.com depuis l'hébergeur actuel. Variables IONOS_SMTP_USER et IONOS_SMTP_PASSWORD."}</li>
          <li>Google : {googleReady() ? "relié." : "en attente du compte Google de l'atelier. Variables GOOGLE_CLIENT_ID et GOOGLE_CLIENT_SECRET. URI de redirection : /api/auth/google/callback."}</li>
        </ul>
      </section>
      <section className="bg-foam p-5">
        <h2 className="font-semibold">Votre mot de passe</h2>
        <div className="mt-3"><PasswordForm /></div>
      </section>
    </div>
  );
}

function Tile({ label, value }: { label: string; value: string }) {
  return <div className="bg-ink p-4 text-paper"><p className="text-xs uppercase tracking-wide text-sand">{label}</p><p className="mt-2 text-2xl font-semibold">{value}</p></div>;
}
