import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { ClearCart } from "@/components/clear-cart";
import { db } from "@/db";
import { orderItems, orders } from "@/db/schema";
import { euros, formatDate, orderStatusLabel } from "@/lib/format";
import { zaionStripeReady } from "@/lib/providers";
import { startCardPayment } from "@/server/actions";
import { getSession } from "@/lib/session";

const steps = ["recue", "confirmee", "fabrication", "prete", "livree"];

export default async function OrderPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ neuf?: string; carte?: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/connexion");
  const { id } = await params;
  const { neuf, carte } = await searchParams;
  const [order] = await db.select().from(orders).where(eq(orders.id, id));
  if (!order || (order.userId !== session.id && session.role === "client")) notFound();
  const items = await db.select().from(orderItems).where(eq(orderItems.orderId, order.id));
  const index = steps.indexOf(order.status);

  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      {neuf === "1" && <ClearCart />}
      <Link href="/compte" className="text-sm underline">Mes commandes</Link>
      <h1 className="mt-3 font-serif text-5xl">{order.number}</h1>
      <p className="mt-2 text-ink/60">{formatDate(order.createdAt)} · {orderStatusLabel[order.status]}</p>
      {order.status !== "annulee" && (
        <ol className="mt-6 grid grid-cols-5 gap-2 text-center text-xs">
          {steps.map((step, stepIndex) => (
            <li key={step} className={`px-2 py-3 ${stepIndex <= index ? "bg-ink text-white" : "bg-sand"}`}>
              {orderStatusLabel[step]}
            </li>
          ))}
        </ol>
      )}
      <div className="mt-8 space-y-3">
        {items.map((item) => (
          <div key={item.id} className="flex justify-between bg-foam px-4 py-3">
            <span>{item.name} × {item.qty}</span>
            <span>{euros(item.unitCents * item.qty)}</span>
          </div>
        ))}
      </div>
      <dl className="mt-6 space-y-1 text-sm">
        <div className="flex justify-between"><dt>HT</dt><dd>{euros(order.subtotalCents)}</dd></div>
        <div className="flex justify-between"><dt>TVA</dt><dd>{euros(order.vatCents)}</dd></div>
        {order.discountCents > 0 && <div className="flex justify-between"><dt>Remise {order.promoCode}</dt><dd>−{euros(order.discountCents)}</dd></div>}
        <div className="flex justify-between text-base font-semibold"><dt>TTC</dt><dd>{euros(order.totalCents)}</dd></div>
      </dl>
      {order.paymentRef?.startsWith("manuel") && <p className="mt-4 text-sm text-moss">Paiement manuel enregistré par l'atelier.</p>}
      {zaionStripeReady() && !order.paymentRef && order.status !== "annulee" && (
        <form action={startCardPayment} className="mt-6">
          <input type="hidden" name="id" value={order.id} />
          <button className="btn">Payer par carte</button>
        </form>
      )}
      {carte === "attente" && <p className="mt-4 text-sm">La commande est notée. Le paiement carte attend la clé Stripe de Zaïon.</p>}
      {carte === "echec" && <p className="mt-4 text-sm text-rust">Le paiement carte n'a pas pu s'ouvrir. La commande reste enregistrée.</p>}
      <p className="mt-6 text-sm text-ink/70">{order.address}</p>
      {order.note && <p className="mt-2 text-sm">{order.note}</p>}
    </div>
  );
}
