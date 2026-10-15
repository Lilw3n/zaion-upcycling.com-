import { createHash, randomInt, timingSafeEqual } from "node:crypto";
import { and, desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { authTokens } from "@/db/schema";
import { company } from "@/lib/company";
import { sendMailboxMail } from "@/lib/mail";

const MINUTE = 60 * 1000;
const QUARTER = 15 * MINUTE;

function hashCode(email: string, purpose: string, code: string) {
  return createHash("sha256").update(`${purpose}:${email}:${code}`).digest("hex");
}

function sameHash(left: string, right: string) {
  const a = Buffer.from(left);
  const b = Buffer.from(right);
  return a.length === b.length && timingSafeEqual(a, b);
}

export async function issueCode(input: { email: string; purpose: string; payload?: string }) {
  const email = input.email.toLowerCase();
  const recent = await db
    .select()
    .from(authTokens)
    .where(and(eq(authTokens.email, email), eq(authTokens.purpose, input.purpose), eq(authTokens.used, false)))
    .orderBy(desc(authTokens.expiresAt))
    .limit(1);
  if (recent[0] && recent[0].expiresAt.getTime() - QUARTER > Date.now() - MINUTE) {
    return { error: "Un code vient d'être envoyé. Attendez une minute avant d'en demander un autre." };
  }
  await db
    .update(authTokens)
    .set({ used: true })
    .where(and(eq(authTokens.email, email), eq(authTokens.purpose, input.purpose), eq(authTokens.used, false)));

  const code = String(randomInt(0, 1000000)).padStart(6, "0");
  const id = `tok_${crypto.randomUUID().slice(0, 10)}`;
  await db.insert(authTokens).values({
    id,
    email,
    tokenHash: hashCode(email, input.purpose, code),
    purpose: input.purpose,
    payload: input.payload ?? null,
    attempts: 0,
    expiresAt: new Date(Date.now() + QUARTER),
    used: false,
  });

  try {
    const sent = await sendMailboxMail({
      to: email,
      subject: `Code Zaïon Upcycling : ${code}`,
      text: `Bonjour,\n\nVotre code de vérification est ${code}.\nIl est valable 15 minutes.\n\nSi vous n'êtes pas à l'origine de cette demande, ignorez ce message.\n\n${company.name}\n${company.email}`,
    });
    if (!sent.sent) {
      await db.update(authTokens).set({ used: true }).where(eq(authTokens.id, id));
      return {
        error: "Le code part depuis la boîte contact@zaion-upcycling.com. Son mot de passe n'est pas encore enregistré sur le serveur.",
      };
    }
  } catch {
    await db.update(authTokens).set({ used: true }).where(eq(authTokens.id, id));
    return { error: "L'e-mail n'a pas pu partir. Réessayez dans un moment." };
  }
  return { ok: "Un code à 6 chiffres vient d'être envoyé." as const };
}

export async function consumeCode(email: string, purpose: string, code: string) {
  const value = email.toLowerCase();
  const [row] = await db
    .select()
    .from(authTokens)
    .where(and(eq(authTokens.email, value), eq(authTokens.purpose, purpose), eq(authTokens.used, false)))
    .orderBy(desc(authTokens.expiresAt))
    .limit(1);
  if (!row || row.expiresAt.getTime() < Date.now()) {
    return { error: "Ce code a expiré. Demandez-en un nouveau." };
  }
  if (row.attempts >= 5) {
    await db.update(authTokens).set({ used: true }).where(eq(authTokens.id, row.id));
    return { error: "Trop d'essais. Demandez un nouveau code." };
  }
  if (!sameHash(row.tokenHash, hashCode(value, purpose, code.trim()))) {
    const attempts = row.attempts + 1;
    await db.update(authTokens).set({ attempts, used: attempts >= 5 }).where(eq(authTokens.id, row.id));
    return { error: attempts >= 5 ? "Trop d'essais. Demandez un nouveau code." : "Code incorrect." };
  }
  await db.update(authTokens).set({ used: true }).where(eq(authTokens.id, row.id));
  return { payload: row.payload };
}
