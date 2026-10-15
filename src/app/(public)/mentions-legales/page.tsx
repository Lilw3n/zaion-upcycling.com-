import type { Metadata } from "next";
import { Legal } from "@/components/legal";
import { company } from "@/lib/company";

export const metadata: Metadata = { title: "Mentions légales" };

export default function LegalNoticePage() {
  return (
    <Legal title="Mentions légales">
      <p>Les présentes mentions sont établies conformément à la loi n° 2004-575 du 21 juin 2004 pour la confiance dans l'économie numérique, et aux informations publiées au registre.</p>
      <h2>Éditeur</h2>
      <p>{company.legalName}, {company.form.toLowerCase()}, {company.micro.toLowerCase()}.</p>
      <p>Nom commercial : {company.brand}. Dirigeant : {company.name}, chef d'entreprise.</p>
      <p>Activité déclarée : {company.activity}. {company.otherActivity}. Forme d'exercice : {company.exercise.toLowerCase()}.</p>
      <p>Code NAF / APE : {company.naf} — {company.nafLabel}.</p>
      <p>SIREN : {company.siren}. SIRET du siège : {company.siret}. Numéro de TVA : {company.tva}.</p>
      <p>{company.rcs}, immatriculé le {company.rcsSince}. {company.rne}.</p>
      <p>Siège et établissement principal : {company.address}. Établissement en activité depuis le {company.establishmentSince}. Effectif déclaré : {company.staff}.</p>
      <p>Directeur de la publication : {company.name}.</p>
      <p>Contact : <a className="underline" href={`mailto:${company.email}`}>{company.email}</a> · <a className="underline" href={company.phoneHref}>{company.phone}</a>.</p>
      <h2>Hébergement du site</h2>
      <p>Le site est hébergé par {company.hostName}, {company.hostAddress} ({company.hostSite}).</p>
      <p>La messagerie du nom de domaine reste pour l'instant chez l'hébergeur actuel. L'envoi des liens de connexion est prévu sur {company.mailProvider} ({company.mailHost}), depuis {company.email}, au moment du transfert de la boîte.</p>
      <h2>Activité proposée sur le site</h2>
      <p>Conception, réparation et transformation de textiles techniques : voiles et équipements nautiques, mobilier et sellerie, structures gonflables et scénographie, pièces de mode, cours et ateliers. Les pièces standards se commandent en boutique. Les fabrications sur mesure et les réparations passent par un devis.</p>
      <h2>Propriété</h2>
      <p>Les textes, photographies de réalisations, vidéos et le signe Zaïon sont réservés à l'atelier, sauf mention contraire. Toute reproduction non autorisée est interdite.</p>
      <h2>Données et cookies</h2>
      <p>Le traitement des données est décrit dans la politique de confidentialité. Les traceurs sont décrits dans la page cookies.</p>
    </Legal>
  );
}
