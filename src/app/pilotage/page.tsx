import Link from "next/link";
import { PasswordForm } from "@/components/password-form";
import { db } from "@/db";
import { charges, revenues, users } from "@/db/schema";
import { MoneyStat } from "@/components/example-mark";
import { readSettings, summarize } from "@/lib/finance";
import { googleReady, ionosReady, zaionStripePublishableReady, zaionStripeReady } from "@/lib/providers";
import { googleServiceAddress } from "@/lib/places";
import { CommissionForm } from "./commission-form";
import { unpublishAtelier } from "@/server/actions";

export default async function PilotagePage() {
  const [revenueRows, chargeRows, people, settings] = await Promise.all([
    db.select().from(revenues),
    db.select().from(charges),
    db.select().from(users),
    readSettings(),
  ]);
  const stats = summarize(revenueRows, chargeRows);
  const googleAddress = googleServiceAddress();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-serif text-4xl">Pilotage</h1>
        <p className="mt-2 max-w-2xl text-sm text-ink/70">
          Votre part est calculée sur le chiffre d'affaires HT. Elle reste dans les livres même lorsqu'elle est masquée dans l'espace atelier. Le CA et la TVA affichés à Zaïon ne sont pas réduits : seule la ligne « part partenaire » apparaît ou disparaît.
        </p>
      </div>
      <div className="grid gap-3 md:grid-cols-4">
        <MoneyStat label="CA HT" real={stats.real.ht} withExamples={stats.withExamples.ht} />
        <MoneyStat label="Votre part" real={stats.real.commission} withExamples={stats.withExamples.commission} />
        <MoneyStat label="Reste atelier" real={stats.real.afterCommission} withExamples={stats.withExamples.afterCommission} />
        <MoneyStat label="Après charges" real={stats.real.result} withExamples={stats.withExamples.result} />
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
      <section className="bg-foam p-5 text-sm">
        <h2 className="font-semibold">Google, en attendant le bail</h2>
        <p className="mt-3 text-ink/80">
          Le domicile sert de point de vérification pour une fiche « zone desservie », avec l'adresse masquée. Il n'est pas imprimé sur le site. Secteur affiché : Marseille, Aubagne et les Bouches-du-Rhône. Quand un bail existera pour l'atelier, la fiche pourra être déplacée.
        </p>
        <p className="mt-3">{googleAddress || "Adresse non renseignée dans GOOGLE_SERVICE_ADDRESS."}</p>
        <p className="mt-3 text-ink/60">La fiche se crée avec le compte Google de Zaïon. Montrer le domicile comme vitrine exposerait l'adresse et contredirait une activité sans accueil du public.</p>
      </section>
      <section className="bg-foam p-5 text-sm">
        <h2 className="font-semibold">Adresse d'atelier sur le site</h2>
        {settings.atelierPublic ? (
          <>
            <p className="mt-3">En ligne, comme lieu de rendez-vous : {settings.atelierAddress}</p>
            <form action={unpublishAtelier} className="mt-3">
              <button className="btn">Retirer du site</button>
            </form>
          </>
        ) : (
          <p className="mt-3 text-ink/80">
            Hors ligne{settings.atelierAddress ? ` (brouillon : ${settings.atelierAddress})` : ""}. Seule Zaïon peut l'activer, depuis son espace, après lecture des risques.
          </p>
        )}
      </section>
      <section className="bg-foam p-5 text-sm">
        <h2 className="font-semibold">Encaissement et part</h2>
        <p className="mt-3 text-ink/80">
          L'argent des clients doit arriver sur le Stripe de Zaïon, vers son RIB. Brancher ce RIB sur un autre compte Stripe ferait de ce compte le vendeur : son chiffre d'affaires et sa TVA ne correspondraient plus aux encaissements.
        </p>
        <p className="mt-3 text-ink/80">
          La part se prélève avec Stripe Connect, en frais d'application. Le client paie le compte de Zaïon. Stripe reverse automatiquement le taux déjà réglé ici, calculé sur le HT, vers le compte plateforme. Elle doit accepter cette liaison. Le compte Stripe déjà ouvert sur cette machine est Lead Hunter : il ne doit pas encaisser Zaïon. SumUp reste le terminal de carte, sans partage automatique.
        </p>
        <p className="mt-3 text-ink/60">
          Tant que Connect n'est pas relié, la part reste une ligne de pilotage, réglée à part par facture ou virement.
        </p>
        <p className="mt-3 text-ink/80">
          {zaionStripeReady()
            ? "Le paiement carte est ouvert : la clé secrète encaisse sur le compte Stripe de Zaïon."
            : "Le paiement carte attend ZAION_STRIPE_SECRET_KEY, la clé secrète du compte Stripe de Zaïon. Ce n'est pas le compte Lead Hunter de cette machine."}
          {zaionStripePublishableReady()
            ? " La clé publiable est enregistrée."
            : " La clé publiable se range dans NEXT_PUBLIC_ZAION_STRIPE_PUBLISHABLE_KEY."}
        </p>
        <p className="mt-3 text-ink/80">
          Paiement manuel, sans débit carte :{" "}
          <a className="underline" href="https://dashboard.stripe.com/settings/billing/invoice" target="_blank" rel="noopener noreferrer">ouvrir le réglage Stripe</a>.
          Sur le site, admin et super admin le notent dans <a className="underline" href="/atelier/commandes">les commandes</a>.
        </p>
      </section>
      <section className="bg-foam p-5">
        <h2 className="font-semibold">Connexions à brancher</h2>
        <ul className="mt-3 space-y-2 text-sm">
          <li>Messagerie IONOS : {ionosReady() ? "reliée, les codes de vérification partent." : "en attente du mot de passe de la boîte contact@zaion-upcycling.com. Variables IONOS_SMTP_USER et IONOS_SMTP_PASSWORD."}</li>
          <li>Google : {googleReady() ? "relié. L'adresse ouvre le rôle prévu : super admin ou admin." : "en attente de GOOGLE_CLIENT_ID et GOOGLE_CLIENT_SECRET. URI de redirection : /api/auth/google/callback."}</li>
          <li>Stripe, clé publiable : {zaionStripePublishableReady() ? "enregistrée (NEXT_PUBLIC_ZAION_STRIPE_PUBLISHABLE_KEY)." : "en attente de NEXT_PUBLIC_ZAION_STRIPE_PUBLISHABLE_KEY, elle commence par pk_."}</li>
          <li>Stripe, clé secrète : {zaionStripeReady() ? "enregistrée (ZAION_STRIPE_SECRET_KEY). Le paiement carte est ouvert." : "en attente de ZAION_STRIPE_SECRET_KEY. Clé secrète sk_ ou clé restreinte rk_."}</li>
        </ul>
      </section>
      <section className="bg-foam p-5">
        <h2 className="font-semibold">Votre mot de passe</h2>
        <div className="mt-3"><PasswordForm /></div>
      </section>
    </div>
  );
}
