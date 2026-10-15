import { ContactForm } from "./contact-form";
import { publicAtelierAddress } from "@/components/public-address";

export default async function ContactPage() {
  const atelier = await publicAtelierAddress();
  return (
    <div className="mx-auto grid max-w-5xl gap-10 px-4 py-12 md:grid-cols-2">
      <div>
        <h1 className="font-serif text-5xl">Contact</h1>
        <p className="mt-4 text-ink/75">Zaïon Upcycling · Zaïon Naceur</p>
        <a className="mt-4 block text-lg" href="tel:+33614922565">06 14 92 25 65</a>
        <a className="block" href="mailto:contact@zaion-upcycling.com">contact@zaion-upcycling.com</a>
        {atelier ? (
          <p className="mt-6 text-sm text-ink/80">
            Rendez-vous : {atelier}. Le siège indiqué dans les mentions légales reste distinct de ce lieu.
          </p>
        ) : (
          <p className="mt-6 text-sm text-ink/70">Les rendez-vous se conviennent par message. Aucun local n'est ouvert au public pour le moment.</p>
        )}
        <p className="mt-4 text-sm text-ink/70">Pour un chiffrage avec dimensions et assemblage, le formulaire de devis est plus précis.</p>
      </div>
      <ContactForm />
    </div>
  );
}
