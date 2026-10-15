import { ContactForm } from "./contact-form";
import { publicAtelierAddress } from "@/components/public-address";
import { company } from "@/lib/company";
import { readSiteCopy } from "@/lib/site-copy";

export default async function ContactPage() {
  const [atelier, copy] = await Promise.all([publicAtelierAddress(), readSiteCopy()]);
  return (
    <div className="mx-auto grid max-w-5xl gap-10 px-4 py-12 md:grid-cols-2">
      <div>
        <h1 className="font-serif text-5xl">Contact</h1>
        <p className="mt-4 text-ink/75">Zaïon Upcycling · Zaïon Naceur</p>
        <a className="mt-4 block text-lg" href={company.phoneHref}>{company.phone}</a>
        <a className="block" href={`mailto:${company.email}`}>{company.email}</a>
        {atelier ? (
          <p className="mt-6 text-sm text-ink/80">
            Rendez-vous : {atelier}. Le siège indiqué dans les mentions légales reste distinct de ce lieu.
          </p>
        ) : (
          <p className="mt-6 text-sm text-ink/70">Les rendez-vous se conviennent par message. Aucun local n'est ouvert au public pour le moment.</p>
        )}
        <p className="mt-4 text-sm text-ink/70">{copy.contactNote}</p>
      </div>
      <ContactForm />
    </div>
  );
}
