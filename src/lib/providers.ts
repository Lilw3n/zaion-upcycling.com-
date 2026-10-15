export function ionosReady() {
  return Boolean(process.env.IONOS_SMTP_USER && process.env.IONOS_SMTP_PASSWORD);
}

export function googleReady() {
  return Boolean(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET);
}

export function zaionStripeReady() {
  const key = process.env.ZAION_STRIPE_SECRET_KEY || "";
  return key.startsWith("sk_") || key.startsWith("rk_");
}

export function zaionStripePublishableReady() {
  const key = process.env.NEXT_PUBLIC_ZAION_STRIPE_PUBLISHABLE_KEY || "";
  return key.startsWith("pk_");
}

export function safeNext(value: string | null | undefined) {
  if (!value || !value.startsWith("/") || value.startsWith("//")) return "";
  return value.slice(0, 200);
}
