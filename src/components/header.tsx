"use client";

import Link from "next/link";
import { useState } from "react";
import { Menu, ShoppingBag, X } from "lucide-react";
import { categories } from "@/data/catalogue";
import { useCart } from "./cart-provider";
import type { Session } from "@/lib/session";

const links = [
  ...categories.map((item) => ({ href: `/univers/${item.slug}`, label: item.label })),
  { href: "/boutique", label: "Boutique" },
  { href: "/devis", label: "Devis" },
];

export function Header({ session }: { session: Session | null }) {
  const { items } = useCart();
  const [open, setOpen] = useState(false);
  const count = items.reduce((sum, item) => sum + item.qty, 0);
  const account = !session ? "/connexion" : session.role === "superadmin" ? "/pilotage" : session.role === "atelier" ? "/atelier" : "/compte";
  const accountLabel = !session ? "Se connecter" : session.role === "client" ? "Mes commandes" : session.role === "atelier" ? "Atelier" : "Pilotage";

  return (
    <header className="sticky top-0 z-40">
      <div className="bg-sea text-paper">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-2 text-xs tracking-wide">
          <p>Faciliter pour durer</p>
          <div className="flex gap-4">
            <a href="tel:+33614922565">06 14 92 25 65</a>
            <a href="mailto:contact@zaion-upcycling.com">contact@zaion-upcycling.com</a>
          </div>
        </div>
      </div>
      <div className="border-b border-line bg-foam/95 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center gap-4 px-4 py-3">
          <Link href="/" className="shrink-0">
            <img src="/logo.png" alt="Zaïon" className="h-10 w-auto" />
          </Link>
          <nav className="hidden flex-1 items-center justify-center gap-5 text-sm font-medium lg:flex">
            {links.map((link) => (
              <Link key={link.href} href={link.href} className="hover:text-rust">
                {link.label}
              </Link>
            ))}
          </nav>
          <form action="/boutique" className="hidden md:block">
            <input name="q" placeholder="Rechercher" className="field w-40 py-2 text-sm" />
          </form>
          <Link href="/panier" className="relative ml-auto inline-flex items-center gap-1 text-sm font-medium">
            <ShoppingBag size={18} />
            <span className="hidden sm:inline">Panier</span>
            <span className="grid h-5 min-w-5 place-items-center rounded-full bg-ink px-1 text-[11px] text-white">{count}</span>
          </Link>
          <Link href={account} className="hidden text-sm font-medium sm:inline">
            {accountLabel}
          </Link>
          <button className="lg:hidden" onClick={() => setOpen((value) => !value)} aria-label="Menu">
            {open ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
        {open && (
          <div className="space-y-2 border-t border-line px-4 py-4 lg:hidden">
            {links.map((link) => (
              <Link key={link.href} href={link.href} className="block py-1" onClick={() => setOpen(false)}>
                {link.label}
              </Link>
            ))}
            <Link href={account} className="block py-1" onClick={() => setOpen(false)}>
              {accountLabel}
            </Link>
          </div>
        )}
      </div>
    </header>
  );
}
