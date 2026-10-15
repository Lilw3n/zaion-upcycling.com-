import type { Metadata } from "next";
import { Legal } from "@/components/legal";
import { company } from "@/lib/company";

export const metadata: Metadata = { title: "Conditions générales de vente" };

export default function TermsPage() {
  return (
    <Legal title="Conditions générales de vente">
      <p>Les présentes conditions s'appliquent aux ventes et prestations de {company.brand}, exploité par {company.name}, {company.micro.toLowerCase()}, {company.address}, SIRET {company.siret}, TVA {company.tva}.</p>
      <h2>Activité</h2>
      <p>L'atelier fabrique des objets surcyclés, répare et transforme des textiles techniques : nautisme, mobilier, événementiel, mode, et propose des cours. Le code NAF déclaré est le {company.naf}. Certaines pièces sont vendues en boutique. Les réparations, les volumes et le mobilier sur mesure font l'objet d'un devis après description de la matière, des dimensions et de l'assemblage.</p>
      <h2>Prix</h2>
      <p>Les prix de la boutique sont en euros, toutes taxes comprises. La TVA au taux en vigueur est indiquée sur la commande. Quand une pièce est vendue au mètre carré ou au mètre cube, la quantité correspond à cette unité, arrondie au supérieur. Un devis est valable trente jours, sauf mention contraire.</p>
      <h2>Commande</h2>
      <p>La validation du panier enregistre la commande et crée le suivi dans l'espace client. Le paiement en ligne n'est pas encore ouvert : l'atelier confirme le moyen de règlement, en général par virement, avant la mise en fabrication ou à la livraison, selon ce qui est écrit sur le devis. La commande n'est ferme qu'après cette confirmation.</p>
      <h2>Délais et livraison</h2>
      <p>Les délais sont indicatifs et confirmés à l'accord. L'atelier prévient en cas d'aléa de matière. La livraison ou l'intervention a lieu à l'adresse indiquée, ou le retrait est convenu avec le client. Le transfert des risques a lieu à la remise. L'atelier conserve la propriété des pièces jusqu'au paiement complet.</p>
      <h2>Rétractation</h2>
      <p>Pour un consommateur, le délai de rétractation est de quatorze jours à compter de la réception, pour une pièce standard non personnalisée, renvoyée non utilisée. Les biens confectionnés selon les spécifications du client, ou nettement personnalisés, ne sont pas repris, conformément à l'article L. 221-28 du code de la consommation. Il en va de même d'un cours ou d'une prestation déjà exécutés, si l'exécution a commencé avant la fin du délai avec l'accord exprès du client et sa reconnaissance de perdre son droit de rétractation.</p>
      <h2>Garanties</h2>
      <p>Le consommateur bénéficie de la garantie légale de conformité et de la garantie des vices cachés. Une réparation est réalisée pour l'usage décrit. Elle ne couvre pas une nouvelle casse, un usage non prévu ou l'usure normale.</p>
      <h2>Professionnels</h2>
      <p>Entre professionnels, un retard de paiement peut donner lieu à l'indemnité forfaitaire de recouvrement de 40 € prévue par le code de commerce, et à des pénalités au taux légal.</p>
      <h2>Médiation</h2>
      <p>Le client consommateur peut recourir gratuitement à un médiateur de la consommation en cas de litige non résolu avec l'atelier. Le médiateur désigné par l'entreprise sera nommé sur cette page dès son adhésion. En attendant, la plateforme européenne de règlement en ligne reste accessible : https://ec.europa.eu/consumers/odr. À défaut d'accord, les tribunaux français sont compétents, et le droit français s'applique.</p>
      <h2>Données</h2>
      <p>Les informations de commande sont traitées comme indiqué dans la politique de confidentialité.</p>
    </Legal>
  );
}
