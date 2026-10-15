import { desc } from "drizzle-orm";
import { db } from "@/db";
import { orderItems, orders } from "@/db/schema";
import { euros, formatDate, orderStatusLabel } from "@/lib/format";
import { updateOrderStatus } from "@/server/actions";

export default async function OrdersAdminPage() {
  const rows = await db.select().from(orders).orderBy(desc(orders.createdAt));
  const items = await db.select().from(orderItems);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-4xl">Commandes</h1>
        <p className="mt-2 text-sm text-ink/70">Le client voit le même suivi dans son espace. Annuler une commande la retire du chiffre d'affaires.</p>
      </div>
      <div className="space-y-4">
        {rows.map((order) => (
          <article key={order.id} className="bg-foam p-4">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="font-semibold">{order.number} · {euros(order.totalCents)} TTC</p>
                <p className="text-sm">{order.customerName} · {order.customerEmail}</p>
                <p className="text-sm text-ink/60">{formatDate(order.createdAt)} · HT {euros(order.subtotalCents)} · TVA {euros(order.vatCents)}</p>
                <p className="text-sm">{order.address}</p>
              </div>
              <form action={updateOrderStatus} className="flex gap-2">
                <input type="hidden" name="id" value={order.id} />
                <select name="status" defaultValue={order.status} className="field">
                  {Object.entries(orderStatusLabel).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
                </select>
                <button className="btn">Mettre à jour</button>
              </form>
            </div>
            <ul className="mt-3 text-sm">
              {items.filter((item) => item.orderId === order.id).map((item) => (
                <li key={item.id}>{item.name} × {item.qty}</li>
              ))}
            </ul>
          </article>
        ))}
        {!rows.length && <p>Aucune commande.</p>}
      </div>
    </div>
  );
}
