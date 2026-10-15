import { readSettings } from "@/lib/finance";

export async function publicAtelierAddress() {
  const settings = await readSettings();
  if (!settings.atelierPublic) return "";
  return settings.atelierAddress.trim();
}
