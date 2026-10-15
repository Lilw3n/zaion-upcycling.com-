import { desc } from "drizzle-orm";
import { db } from "@/db";
import { ensureCatalog } from "@/db/ensure";
import { orderItems, orders, users } from "@/db/schema";
import { ExampleMark } from "@/components/example-mark";
import { euros, formatDate, orderStatusLabel } from "@/lib/format";
import { getSession } from "@/lib/session";
import { readSettings } from "@/lib/finance";
import { deleteExampleOrder, recordManualPayment, saveOrderNote, updateOrderStatus } from "@/server/actions";
import { PaymentLinkButton, PaymentRequestForm } from "./payment-request";

export default async function OrdersAdminPage() {
  await ensureCatalog();
  const [rows, items, settings, session, people] = await Promise.all([
    db.select().from(orders).orderBy(desc(orders.createdAt)),
    db.select().from(orderItems),
    readSettings(),
    getSession(),
    db.select({ id: users.id, name: users.name, email: users.email, role: users.role }).from(users),
  ]);
  const clients = people.filter((person) => person.role === "client").map(({ id, name, email }) => ({ id, name, email }));
  const showCommission = session?.role === "superadmin" || settings.commissionVisible;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-4xl">Commandes</h1>
        <p className="mt-2 text-sm text-ink/70">Suivez l'avancement. Le client voit le même statut. Annuler retire la commande du chiffre d'affaires.</p>
        <p className="mt-2 text-sm text-ink/70">
          Le paiement manuel (virement, espèces, SumUp) se note sur chaque commande. Le réglage Stripe correspondant est ici :{" "}
          <a className="underline" href="https://dashboard.stripe.com/settings/billing/invoice" target="_blank" rel="noopener noreferrer">configurer le paiement manuel</a>.
          Admin et super admin utilisent le même bouton.
        </p>
      </div>
      <PaymentRequestForm clients={clients} />
      <div className="space-y-4">
        {rows.map((order) => (
          <article key={order.id} className="bg-foam p-4">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="font-semibold">{order.number} · {euros(order.totalCents)} TTC{order.example && <ExampleMark />}</p>
                <p className="text-sm">{order.customerName} · {order.customerEmail}{order.phone ? ` · ${order.phone}` : ""}</p>
                <p className="text-sm text-ink/60">{formatDate(order.createdAt)} · HT {euros(order.subtotalCents)} · TVA {euros(order.vatCents)}</p>
                {order.discountCents > 0 && <p className="text-sm text-moss">Code {order.promoCode} · remise {euros(order.discountCents)}</p>}
                {order.referrerName && <p className="text-sm text-ink/60">Parrain {order.referrerName} · part notée {euros(order.referralCreditCents)}</p>}
                {showCommission && <p className="text-sm text-ink/60">Part partenaire {euros(order.commissionCents)}</p>}
                <p className="text-sm">{order.address}</p>
                {order.checkoutSession && !order.paymentRef && <p className="text-sm text-rust">En attente du paiement Stripe</p>}
                {order.paymentRef?.startsWith("manuel") && <p className="text-sm text-moss">Payée manuellement{order.paymentRef.length > 6 ? ` · ${order.paymentRef.slice(7)}` : ""}</p>}
                {order.paymentRef && !order.paymentRef.startsWith("manuel") && <p className="text-sm text-moss">Payée par carte</p>}
              </div>
              <form action={updateOrderStatus} className="flex gap-2">
                <input type="hidden" name="id" value={order.id} />
                <select name="status" defaultValue={order.status} className="field">
                  {Object.entries(orderStatusLabel).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
                </select>
                <button className="btn">Mettre à jour</button>
              </form>
            </div>
            <ul className="mt-3 space-y-1 text-sm">
              {items.filter((item) => item.orderId === order.id).map((item) => (
                <li key={item.id} className="flex justify-between gap-3">
                  <span>{item.name} × {item.qty}</span>
                  <span>{euros(item.unitCents * item.qty)}</span>
                </li>
              ))}
            </ul>
            {order.status !== "annulee" && !order.paymentRef && !order.example && <PaymentLinkButton orderId={order.id} />}
            {order.status !== "annulee" && (!order.paymentRef || order.paymentRef.startsWith("manuel")) && (
              <form action={recordManualPayment} className="mt-3 flex flex-wrap items-end gap-2">
                <input type="hidden" name="id" value={order.id} />
                <label className="text-sm">
                  Paiement manuel
                  <input name="detail" className="field mt-1" placeholder="Virement, espèces, SumUp…" />
                </label>
                <button className="btn">Enregistrer le paiement manuel</button>
              </form>
            )}
            {order.example && (
              <form action={deleteExampleOrder} className="mt-3">
                <input type="hidden" name="id" value={order.id} />
                <button className="text-sm text-rust underline">Supprimer cette donnée d'exemple</button>
              </form>
            )}
            {order.note && <p className="mt-3 text-sm text-ink/70">Note du client : {order.note}</p>}
            <form action={saveOrderNote} className="mt-3 grid gap-2">
              <input type="hidden" name="id" value={order.id} />
              <label className="text-sm">
                Note d'atelier
                <textarea name="atelierNote" defaultValue={order.atelierNote ?? ""} className="field mt-1 min-h-20" />
              </label>
              <button className="btn w-fit">Enregistrer la note</button>
            </form>
          </article>
        ))}
        {!rows.length && <p>Aucune commande.</p>}
      </div>
    </div>
  );
}
