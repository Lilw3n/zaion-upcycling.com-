import type { Metadata } from "next";
import Link from "next/link";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/db";
import { ensureCatalog } from "@/db/ensure";
import { orders, revenues } from "@/db/schema";
import { readSettings } from "@/lib/finance";
import { readZaionCheckout } from "@/lib/stripe";

export const metadata: Metadata = { title: "Paiement" };

export default async function PaymentThanksPage({ searchParams }: { searchParams: Promise<{ session_id?: string }> }) {
  await ensureCatalog();
  const { session_id: sessionId = "" } = await searchParams;
  const checkout = await readZaionCheckout(sessionId);
  const orderId = checkout?.metadata?.orderId || checkout?.client_reference_id;
  let paid = false;
  if (checkout?.payment_status === "paid" && orderId) {
    const [order] = await db.select().from(orders).where(eq(orders.id, orderId));
    if (order && order.status === "recue") {
      await db.update(orders).set({ status: "confirmee", paymentRef: checkout.id }).where(eq(orders.id, order.id));
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
        revalidatePath("/atelier");
        revalidatePath("/atelier/revenus");
        revalidatePath("/pilotage");
      }
    }
    paid = Boolean(order);
  }

  return (
    <div className="mx-auto max-w-xl px-4 py-16">
      <h1 className="font-serif text-5xl">{paid ? "Paiement reçu" : "Retour du paiement"}</h1>
      <p className="mt-4 text-ink/75">
        {paid
          ? "La commande est confirmée. L'argent est encaissé sur le compte Stripe de l'atelier."
          : "Le paiement n'est pas encore confirmé. La commande reste visible dans votre espace."}
      </p>
      {orderId && <Link href={`/compte/commandes/${orderId}`} className="btn mt-8">Voir la commande</Link>}
    </div>
  );
}
