import { and, eq, isNotNull, isNull } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/db";
import { orders, revenues, type Order } from "@/db/schema";
import { readSettings } from "@/lib/finance";
import { readZaionCheckout } from "@/lib/stripe";

export async function confirmCardPayment(order: Order, sessionId: string) {
  if (order.paymentRef || order.example) return;
  await db
    .update(orders)
    .set({
      status: order.status === "recue" ? "confirmee" : order.status,
      paymentRef: sessionId,
      paymentAlert: true,
    })
    .where(eq(orders.id, order.id));
  const [already] = await db.select({ id: revenues.id }).from(revenues).where(eq(revenues.orderId, order.id));
  if (!already) {
    const prefs = await readSettings();
    await db.insert(revenues).values({
      id: `rev_${crypto.randomUUID().slice(0, 10)}`,
      label: `Commande ${order.number}`,
      occurredOn: new Date().toISOString().slice(0, 10),
      amountHtCents: order.subtotalCents,
      vatRate: prefs.vatRate,
      commissionCents: order.commissionCents,
      orderId: order.id,
      voided: false,
    });
  }
  revalidatePath("/atelier");
  revalidatePath("/atelier/commandes");
  revalidatePath("/atelier/revenus");
  revalidatePath("/pilotage");
}

export async function syncPendingCardPayments() {
  const pending = await db
    .select()
    .from(orders)
    .where(and(isNotNull(orders.checkoutSession), isNull(orders.paymentRef)));
  for (const order of pending) {
    if (!order.checkoutSession || order.example || order.status === "annulee") continue;
    const session = await readZaionCheckout(order.checkoutSession);
    if (session?.payment_status === "paid") await confirmCardPayment(order, session.id);
  }
}
