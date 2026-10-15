import { and, eq, isNotNull, isNull } from "drizzle-orm";
import { db } from "@/db";
import { orders } from "@/db/schema";
import { euros } from "@/lib/format";
import { syncPendingCardPayments } from "@/lib/card-payment";
import { dismissPaymentAlert } from "@/server/actions";

export async function PaymentAlerts() {
  await syncPendingCardPayments();
  const [paid, waiting] = await Promise.all([
    db.select().from(orders).where(eq(orders.paymentAlert, true)),
    db.select().from(orders).where(and(isNotNull(orders.checkoutSession), isNull(orders.paymentRef))),
  ]);
  const received = paid.filter((order) => !order.example);
  const pending = waiting.filter((order) => !order.example && order.status !== "annulee");
  if (!received.length && !pending.length) return null;

  return (
    <div className="mb-6 space-y-2">
      {received.map((order) => (
        <form key={order.id} action={dismissPaymentAlert} className="flex flex-wrap items-center justify-between gap-3 bg-moss px-4 py-3 text-sm text-paper">
          <p>Paiement reçu · {order.number} · {order.customerName} · {euros(order.totalCents)}</p>
          <input type="hidden" name="id" value={order.id} />
          <button className="underline">J'ai vu</button>
        </form>
      ))}
      {pending.map((order) => (
        <p key={order.id} className="bg-sand px-4 py-3 text-sm">
          En attente de paiement · {order.number} · {order.customerName} · {euros(order.totalCents)}
        </p>
      ))}
    </div>
  );
}
