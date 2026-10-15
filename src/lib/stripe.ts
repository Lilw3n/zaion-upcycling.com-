import { zaionStripeReady } from "@/lib/providers";

type CheckoutOrder = {
  id: string;
  number: string;
  customerEmail: string;
  totalCents: number;
};

export async function createZaionCheckout(input: { order: CheckoutOrder; origin: string }) {
  if (!zaionStripeReady()) return { error: "La clé Stripe de Zaïon n'est pas enregistrée." as const };
  const body = new URLSearchParams();
  body.set("mode", "payment");
  body.set("customer_email", input.order.customerEmail);
  body.set("client_reference_id", input.order.id);
  body.set("metadata[orderId]", input.order.id);
  body.set("success_url", `${input.origin}/commande/merci?session_id={CHECKOUT_SESSION_ID}`);
  body.set("cancel_url", `${input.origin}/compte/commandes/${input.order.id}`);
  body.set("line_items[0][quantity]", "1");
  body.set("line_items[0][price_data][currency]", "eur");
  body.set("line_items[0][price_data][unit_amount]", String(input.order.totalCents));
  body.set("line_items[0][price_data][product_data][name]", `Commande ${input.order.number}`);
  const response = await fetch("https://api.stripe.com/v1/checkout/sessions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.ZAION_STRIPE_SECRET_KEY}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body,
  });
  const payload = (await response.json()) as { url?: string; error?: { message?: string } };
  if (!response.ok || !payload.url) {
    return { error: "Stripe n'a pas ouvert le paiement. Vérifiez que la clé est bien celle du compte de Zaïon." as const };
  }
  return { url: payload.url };
}

export async function readZaionCheckout(sessionId: string) {
  if (!zaionStripeReady() || !sessionId.startsWith("cs_")) return null;
  const response = await fetch(`https://api.stripe.com/v1/checkout/sessions/${sessionId}`, {
    headers: { Authorization: `Bearer ${process.env.ZAION_STRIPE_SECRET_KEY}` },
  });
  if (!response.ok) return null;
  return (await response.json()) as { id: string; payment_status?: string; metadata?: { orderId?: string }; client_reference_id?: string };
}
