import Link from "next/link";
import { desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { orders } from "@/db/schema";
import { euros, formatDate, orderStatusLabel } from "@/lib/format";
import { getSession } from "@/lib/session";
import { redirect } from "next/navigation";

export default async function AccountPage() {
  const session = await getSession();
  if (!session) redirect("/connexion?next=/compte");
  const rows = await db.select().from(orders).where(eq(orders.userId, session.id)).orderBy(desc(orders.createdAt));

  return (
    <div className="mx-auto max-w-4xl px-4 py-12">
      <p className="text-xs uppercase tracking-[0.18em] text-ink/50">Espace client</p>
      <h1 className="font-serif text-5xl">Bonjour {session.name}</h1>
      <p className="mt-3 text-ink/70">Vos commandes, de la réception à la livraison.</p>
      <div className="mt-8 space-y-3">
        {rows.map((order) => (
          <Link key={order.id} href={`/compte/commandes/${order.id}`} className="grid gap-2 bg-foam p-4 md:grid-cols-[1fr_auto_auto] md:items-center">
            <div>
              <p className="font-semibold">{order.number}</p>
              <p className="text-sm text-ink/60">{formatDate(order.createdAt)}</p>
            </div>
            <p>{orderStatusLabel[order.status] ?? order.status}</p>
            <p className="font-semibold">{euros(order.totalCents)}</p>
          </Link>
        ))}
        {!rows.length && <p>Aucune commande pour le moment. <Link className="underline" href="/boutique">Voir la boutique</Link></p>}
      </div>
    </div>
  );
}
