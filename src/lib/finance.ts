import { eq } from "drizzle-orm";
import { db } from "@/db";
import { settings, type Charge, type Revenue } from "@/db/schema";

export async function readSettings() {
  const rows = await db.select().from(settings);
  const map = Object.fromEntries(rows.map((row) => [row.key, row.value]));
  return {
    commissionRate: Number(map.commission_rate ?? 10),
    commissionVisible: map.commission_visible === "1",
    vatRate: Number(map.vat_rate ?? 20),
    atelierAddress: map.atelier_address ?? "",
    atelierPublic: map.atelier_public === "1",
  };
}

export async function setSetting(key: string, value: string) {
  const existing = await db.select().from(settings).where(eq(settings.key, key));
  if (existing[0]) {
    await db.update(settings).set({ value }).where(eq(settings.key, key));
  } else {
    await db.insert(settings).values({ key, value });
  }
}

function tally(revenues: Revenue[], charges: Charge[]) {
  const active = revenues.filter((row) => !row.voided);
  const ht = active.reduce((sum, row) => sum + row.amountHtCents, 0);
  const vat = active.reduce((sum, row) => sum + Math.round((row.amountHtCents * row.vatRate) / 100), 0);
  const commission = active.reduce((sum, row) => sum + row.commissionCents, 0);
  const chargeTotal = charges.reduce((sum, row) => sum + row.amountCents, 0);
  const unpaid = charges.filter((row) => !row.paid).reduce((sum, row) => sum + row.amountCents, 0);
  return {
    ht,
    vat,
    ttc: ht + vat,
    commission,
    afterCommission: ht - commission,
    charges: chargeTotal,
    unpaid,
    result: ht - commission - chargeTotal,
  };
}

export function summarize(revenues: Revenue[], charges: Charge[]) {
  return {
    real: tally(revenues.filter((row) => !row.example), charges.filter((row) => !row.example)),
    withExamples: tally(revenues, charges),
  };
}
