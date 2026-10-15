export function ionosReady() {
  return Boolean(process.env.IONOS_SMTP_USER && process.env.IONOS_SMTP_PASSWORD);
}

export function googleReady() {
  return Boolean(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET);
}

export function safeNext(value: string | null | undefined) {
  if (!value || !value.startsWith("/") || value.startsWith("//")) return "";
  return value.slice(0, 200);
}
