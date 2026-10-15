import Link from "next/link";
import { categories } from "@/data/catalogue";

export function Footer() {
  return (
    <footer className="mt-20 bg-sea text-paper">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-14 md:grid-cols-4">
        <div>
          <img src="/logo.png" alt="Zaïon" className="mb-4 h-10 brightness-0 invert" />
          <p className="text-sm text-sand">Création, réparation et réemploi de textiles techniques. Faciliter pour durer.</p>
        </div>
        <div>
          <p className="mb-3 text-xs uppercase tracking-[0.18em] text-sand">Univers</p>
          <ul className="space-y-2 text-sm">
            {categories.map((item) => (
              <li key={item.slug}>
                <Link href={`/univers/${item.slug}`}>{item.label}</Link>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <p className="mb-3 text-xs uppercase tracking-[0.18em] text-sand">Atelier</p>
          <ul className="space-y-2 text-sm">
            <li><Link href="/boutique">Boutique</Link></li>
            <li><Link href="/devis">Demander un devis</Link></li>
            <li><Link href="/a-propos">L'atelier</Link></li>
            <li><Link href="/contact">Contact</Link></li>
            <li><Link href="/compte">Suivre une commande</Link></li>
          </ul>
        </div>
        <div>
          <p className="mb-3 text-xs uppercase tracking-[0.18em] text-sand">Contact</p>
          <p className="text-sm">Zaïon Naceur</p>
          <a className="mt-2 block text-sm" href="tel:+33614922565">06 14 92 25 65</a>
          <a className="block text-sm" href="mailto:contact@zaion-upcycling.com">contact@zaion-upcycling.com</a>
          <p className="mt-4 text-sm text-sand">Du lundi au vendredi, réponse sous 24 h ouvrées.</p>
        </div>
      </div>
      <div className="border-t border-white/10">
        <div className="mx-auto flex max-w-6xl flex-wrap gap-4 px-4 py-4 text-xs text-sand">
          <Link href="/mentions-legales">Mentions légales</Link>
          <Link href="/cgv">CGV</Link>
          <Link href="/politique-de-confidentialite">Confidentialité</Link>
          <Link href="/cookies">Cookies</Link>
          <span>© {new Date().getFullYear()} Zaïon Upcycling</span>
        </div>
      </div>
    </footer>
  );
}
