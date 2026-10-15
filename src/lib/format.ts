export function euros(cents: number) {
  return new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR" }).format(cents / 100);
}

export function formatPrice(cents: number | null) {
  if (cents == null) return "Sur devis";
  return euros(cents);
}

export function formatDate(value: Date | string) {
  const date = typeof value === "string" ? new Date(value) : value;
  return new Intl.DateTimeFormat("fr-FR", { dateStyle: "medium" }).format(date);
}

export function unitOf(description: string) {
  const text = description.toLowerCase();
  if (text.includes("m³") || text.includes("m3") || text.includes("mètre cube")) return "m³";
  if (text.includes("m²") || text.includes("m2") || text.includes("mètre carré")) return "m²";
  return "pièce";
}

export function splitTtc(totalCents: number, vatRate: number) {
  const vatCents = Math.round((totalCents * vatRate) / (100 + vatRate));
  return { vatCents, htCents: totalCents - vatCents };
}

export const orderStatusLabel: Record<string, string> = {
  recue: "Reçue",
  confirmee: "Confirmée",
  fabrication: "En fabrication",
  prete: "Prête",
  livree: "Livrée",
  annulee: "Annulée",
};

export const quoteStatusLabel: Record<string, string> = {
  nouveau: "Nouveau",
  infos: "Infos à demander",
  envoye: "Envoyé",
  accepte: "Accepté",
  refuse: "Refusé",
};

export const leadStatusLabel: Record<string, string> = {
  nouveau: "Nouveau",
  contacte: "Contacté",
  devis: "Devis",
  gagne: "Gagné",
  perdu: "Perdu",
};

export const chargeKindLabel: Record<string, string> = {
  urssaf: "URSSAF",
  rc_pro: "RC Pro",
  dommages: "Dommages aux biens",
  internet: "Internet",
  hebergement: "Hébergement",
  equipement: "Équipement",
};

export const categoryLabel: Record<string, string> = {
  nautisme: "Nautisme",
  mobilier: "Mobilier",
  evenementiel: "Événementiel",
  mode: "Mode",
  transmission: "Transmission",
  atelier: "Bureau d'études",
};
