import type { Metadata } from "next";
import Link from "next/link";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { ensureCatalog } from "@/db/ensure";
import { orders } from "@/db/schema";
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
