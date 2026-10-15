import type { Metadata } from "next";
import { Legal } from "@/components/legal";
import { company } from "@/lib/company";

export const metadata: Metadata = { title: "Politique de confidentialité" };

export default function PrivacyPage() {
  return (
    <Legal title="Politique de confidentialité">
      <p>Cette politique décrit comment {company.brand} traite les données des visiteurs, clients et demandeurs de devis, conformément au règlement général sur la protection des données et à la loi Informatique et Libertés.</p>
      <h2>Responsable</h2>
      <p>{company.name}, {company.form.toLowerCase()}, {company.address}. Contact : {company.email}, {company.phone}. SIRET {company.siret}.</p>
      <h2>Données concernées</h2>
      <ul>
        <li>Identité et contact : nom, e-mail, téléphone, adresse de livraison ou d'intervention.</li>
        <li>Compte : mot de passe chiffré, rôle, et, si vous choisissez Google, l'identifiant fourni par Google.</li>
        <li>Commandes, devis, matières, dimensions, assemblage, notes de montage et échanges.</li>
        <li>Données de gestion de l'atelier : recettes, TVA, charges, contacts. Elles ne sont visibles que des comptes habilités.</li>
        <li>Journaux techniques limités à l'hébergement, nécessaires au fonctionnement et à la sécurité.</li>
      </ul>
      <h2>Pourquoi</h2>
      <ul>
        <li>Répondre à une demande de devis ou de contact, et exécuter une commande.</li>
        <li>Tenir le compte client et l'espace atelier.</li>
        <li>Établir les factures, le suivi de TVA et les obligations comptables.</li>
        <li>Envoyer un lien de connexion, lorsque la messagerie IONOS sera reliée.</li>
        <li>Sécuriser l'accès aux espaces.</li>
      </ul>
      <p>La base est l'exécution du contrat ou des mesures précontractuelles, l'obligation légale comptable, et l'intérêt légitime à répondre aux messages et à protéger le site. Le mot de passe et la création de compte reposent sur votre demande.</p>
      <h2>Durée</h2>
      <p>Les prospects et devis non conclus sont conservés trois ans après le dernier échange. Les pièces comptables, commandes et factures sont conservées dix ans. Le compte est conservé tant qu'il est actif, puis effacé ou archivé sur demande, sous réserve des obligations légales. Les liens de connexion expirent au bout de trente minutes.</p>
      <h2>Destinataires</h2>
      <p>L'atelier et les personnes qu'elle habilite. Les prestataires suivants n'agissent que pour héberger ou acheminer :</p>
      <ul>
        <li>{company.hostName}, hébergement du site.</li>
        <li>Neon, hébergement de la base de données, dans l'Union européenne (Francfort).</li>
        <li>{company.mailProvider}, envoi des e-mails de connexion, dès que la boîte {company.email} y sera ouverte.</li>
        <li>Google, via Tag Manager (GTM-MB75LQ4V), pour la mesure de visite selon les balises actives dans le conteneur.</li>
        <li>Google, si vous cliquez sur « Continuer avec Google » : Google transmet alors l'adresse vérifiée, le nom et un identifiant.</li>
      </ul>
      <p>Les données ne sont ni vendues, ni cédées à des régies publicitaires.</p>
      <h2>Vos droits</h2>
      <p>Vous pouvez demander l'accès, la rectification, l'effacement, la limitation, l'opposition et la portabilité de vos données, ainsi que le retrait d'un consentement lorsque le traitement en dépend. Écrivez à {company.email}. Vous pouvez aussi saisir la CNIL, 3 place de Fontenoy, TSA 80715, 75334 Paris Cedex 07.</p>
      <h2>Sécurité</h2>
      <p>Les mots de passe sont stockés sous forme d'empreinte. La session est un cookie httpOnly. L'accès atelier et pilotage est réservé aux rôles correspondants.</p>
    </Legal>
  );
}
