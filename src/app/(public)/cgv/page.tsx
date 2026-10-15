import type { Metadata } from "next";

export const metadata: Metadata = { title: "Conditions générales de vente" };

export default function TermsPage() {
  return (
    <article className="mx-auto max-w-3xl space-y-4 px-4 py-12">
      <h1 className="font-serif text-5xl">Conditions générales de vente</h1>
      <p>Les prix de la boutique sont indiqués en euros TTC. Lorsqu'une pièce est vendue au mètre carré ou au mètre cube, la quantité commandée correspond à cette unité, arrondie au supérieur.</p>
      <p>Les fabrications sur mesure et les réparations font l'objet d'un devis. Le devis décrit la matière, les dimensions, l'assemblage et les renforts. Il est valable 30 jours. La fabrication commence après accord écrit et, le cas échéant, versement de l'acompte indiqué.</p>
      <p>Les délais sont donnés à titre indicatif et confirmés à la commande. Zaïon prévient le client en cas d'aléa matière.</p>
      <p>Les pièces standards non personnalisées peuvent être retournées dans les 14 jours suivant la réception, non utilisées. Les pièces coupées ou assemblées aux mesures du client ne sont pas reprises, conformément à l'exception des biens confectionnés selon les spécifications du consommateur.</p>
      <p>Le transfert des risques a lieu à la livraison. La propriété est réservée jusqu'au paiement complet.</p>
      <p>Tout retard de paiement peut donner lieu à l'indemnité forfaitaire de recouvrement de 40 € prévue par le code de commerce, pour les clients professionnels.</p>
    </article>
  );
}
