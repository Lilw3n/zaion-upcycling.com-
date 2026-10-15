import type { Metadata } from "next";
import { zaionStripeReady } from "@/lib/providers";
import { CheckoutForm } from "./checkout-form";
import { getSession } from "@/lib/session";

export const metadata: Metadata = { title: "Commande" };

export default async function CheckoutPage() {
  const session = await getSession();
  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="font-serif text-5xl">Commande</h1>
      <p className="mt-3 text-ink/70">Les prix du panier sont recalculés à la validation. La TVA est de 20 %.</p>
      <CheckoutForm session={session} card={zaionStripeReady()} />
    </div>
  );
}
