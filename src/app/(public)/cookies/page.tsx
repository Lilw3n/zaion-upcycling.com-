import type { Metadata } from "next";
import { Legal } from "@/components/legal";

export const metadata: Metadata = { title: "Cookies" };

export default function CookiesPage() {
  return (
    <Legal title="Cookies">
      <p>Google Tag Manager (GTM-MB75LQ4V) se charge sur chaque page. Les balises configurées dans ce conteneur, par exemple une mesure d'audience, peuvent déposer des cookies Google. Leur durée et leur finalité dépendent des balises actives dans le conteneur.</p>
      <h2>Cookie indispensable</h2>
      <p>Le cookie <span className="font-medium">zaion_session</span> est déposé lorsque vous vous connectez. Il maintient la session pendant quatorze jours, en httpOnly. Il est nécessaire pour accéder au compte, à l'atelier ou au pilotage. Il ne sert pas à vous suivre d'un site à l'autre.</p>
      <h2>Mémoire du navigateur</h2>
      <ul>
        <li>Le panier est enregistré localement sous le nom zaion-cart, sur votre appareil, jusqu'à la commande ou jusqu'à ce que vous le vidiez.</li>
        <li>Le choix « Compris » du bandeau est enregistré localement sous zaion-cookie-ok, pour ne pas réafficher l'information à chaque page.</li>
      </ul>
      <h2>Google</h2>
      <p>Si vous choisissez la connexion Google, vous quittez un instant le site vers Google. Google peut alors déposer ses propres cookies, selon ses règles. Cette étape n'a lieu que sur ce clic, et seulement une fois le compte Google de l'atelier relié.</p>
      <h2>Maîtrise</h2>
      <p>Vous pouvez supprimer ces données dans les réglages de votre navigateur. Sans le cookie de session, il faudra vous reconnecter. Sans la mémoire locale, le panier se vide.</p>
    </Legal>
  );
}
