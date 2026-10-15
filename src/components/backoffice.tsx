"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { logoutAction } from "@/server/actions";
import type { Session } from "@/lib/session";

const links = [
  { href: "/atelier", label: "Tableau de bord" },
  { href: "/atelier/devis", label: "Devis" },
  { href: "/atelier/contacts", label: "Contacts" },
  { href: "/atelier/revenus", label: "Revenus" },
  { href: "/atelier/charges", label: "Charges" },
  { href: "/atelier/commandes", label: "Commandes" },
  { href: "/atelier/produits", label: "Pièces" },
  { href: "/atelier/offres", label: "Promos et parrainage" },
  { href: "/atelier/site", label: "Textes du site" },
];

export function Backoffice({
  session,
  area,
  commissionVisible,
  children,
}: {
  session: Session;
  area: "atelier" | "pilotage";
  commissionVisible: boolean;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  return (
    <div className="min-h-screen bg-paper md:grid md:grid-cols-[240px_1fr]">
      <aside className="bg-sea text-paper md:min-h-screen">
        <div className="px-5 py-6">
          <Link href="/" className="font-serif text-2xl">Zaïon</Link>
          <p className="mt-1 text-xs uppercase tracking-[0.16em] text-sand">{area === "pilotage" ? "Pilotage" : "Atelier"}</p>
        </div>
        <nav className="flex gap-1 overflow-auto px-3 pb-4 md:block md:space-y-1">
          {session.role === "superadmin" && (
            <NavLink href="/pilotage" active={pathname === "/pilotage"}>Ma part</NavLink>
          )}
          {links.map((link) => (
            <NavLink key={link.href} href={link.href} active={link.href === "/atelier" ? pathname === "/atelier" : pathname.startsWith(link.href)}>
              {link.label}
            </NavLink>
          ))}
        </nav>
        <form action={logoutAction} className="px-4 py-4">
          <button className="text-sm text-sand underline">Se déconnecter</button>
        </form>
      </aside>
      <div>
        {session.role === "superadmin" && area === "atelier" && (
          <p className="bg-sand px-6 py-2 text-sm">
            Aperçu de l'espace atelier.
            {commissionVisible ? " La part partenaire est visible." : " La part partenaire est masquée ici."}{" "}
            <Link href="/pilotage" className="underline">Ouvrir le pilotage</Link>
          </p>
        )}
        <div className="px-4 py-8 md:px-8">{children}</div>
      </div>
    </div>
  );
}

function NavLink({ href, active, children }: { href: string; active: boolean; children: React.ReactNode }) {
  return (
    <Link href={href} className={`block whitespace-nowrap rounded-full px-3 py-2 text-sm ${active ? "bg-white text-ink" : "text-paper/80 hover:bg-white/10"}`}>
      {children}
    </Link>
  );
}
