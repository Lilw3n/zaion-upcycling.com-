"use server";

import bcrypt from "bcryptjs";
import { createHash, randomBytes } from "node:crypto";
import { count, eq } from "drizzle-orm";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { db } from "@/db";
import { ensureAuthSchema, ensureCatalog } from "@/db/ensure";
import {
  authTokens,
  charges,
  leads,
  orderItems,
  media,
  orders,
  products,
  promos,
  quoteFields,
  quotes,
  revenues,
  users,
  type Role,
} from "@/db/schema";
import { roleForEmail } from "@/lib/access";
import { consumeCode, issueCode } from "@/lib/codes";
import { company } from "@/lib/company";
import { splitTtc } from "@/lib/format";
import { sendMailboxMail } from "@/lib/mail";
import { ionosReady, zaionStripeReady } from "@/lib/providers";
import { createZaionCheckout } from "@/lib/stripe";
import { readSettings, setSetting } from "@/lib/finance";
import { copyFromForm } from "@/lib/site-copy";
import { categories } from "@/data/catalogue";
import { isPersonalHome } from "@/lib/places";
import { assemblyQuestions } from "@/lib/questions";
import { clearSession, getSession, homeFor, setSession, type Session } from "@/lib/session";

export type ActionState = { error?: string; ok?: string; step?: "code"; email?: string; paymentUrl?: string } | null;

function uid(prefix: string) {
  return `${prefix}_${crypto.randomUUID().slice(0, 10)}`;
}

function clean(value: FormDataEntryValue | null, max = 500) {
  return String(value ?? "").trim().slice(0, max);
}

async function actor(roles: Role[]): Promise<Session> {
  const session = await getSession();
  if (!session || !roles.includes(session.role)) {
    redirect("/connexion");
  }
  return session;
}

async function touchLead(input: { name: string; email: string; phone?: string; source: string; status: string; notes: string }) {
  const email = input.email.toLowerCase();
  const existing = email ? await db.select().from(leads).where(eq(leads.email, email)) : [];
  if (existing[0]) {
    await db
      .update(leads)
      .set({
        name: input.name || existing[0].name,
        phone: input.phone || existing[0].phone,
        source: input.source,
        status: input.status,
        notes: [existing[0].notes, input.notes].filter(Boolean).join("\n"),
      })
      .where(eq(leads.id, existing[0].id));
    return;
  }
  await db.insert(leads).values({
    id: uid("lead"),
    name: input.name || "Visiteur",
    email,
    phone: input.phone || null,
    source: input.source,
    status: input.status,
    notes: input.notes,
  });
}

async function openSession(user: { id: string; email: string; name: string; role: string }, next: string): Promise<never> {
  const expected = roleForEmail(user.email);
  const role = (expected === "client" ? user.role : expected) as Role;
  if (role !== user.role) {
    await db.update(users).set({ role }).where(eq(users.id, user.id));
  }
  await setSession({ id: user.id, email: user.email, name: user.name, role });
  redirect(next.startsWith("/") ? next : homeFor(role));
}

export async function loginAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const email = clean(formData.get("email"), 180).toLowerCase();
  const password = String(formData.get("password") ?? "");
  const next = clean(formData.get("next"), 200);
  await ensureAuthSchema();
  const [user] = await db.select().from(users).where(eq(users.email, email));
  if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
    return { error: "Identifiants incorrects." };
  }
  if (!user.emailVerified) {
    return { error: "Confirmez d'abord l'adresse avec le code reçu par e-mail." };
  }
  return openSession(user, next);
}

export async function magicLinkAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const email = clean(formData.get("email"), 180).toLowerCase();
  if (!email) return { error: "Indiquez votre e-mail." };
  if (!ionosReady()) {
    return {
      error: "Le lien par e-mail sera envoyé depuis la boîte IONOS de l'atelier, dès qu'elle remplacera l'hébergeur actuel. En attendant, connectez-vous avec votre mot de passe.",
    };
  }
  await ensureAuthSchema();
  const [user] = await db.select().from(users).where(eq(users.email, email));
  if (user) {
    const token = randomBytes(32).toString("hex");
    await db.insert(authTokens).values({
      id: uid("tok"),
      email,
      tokenHash: createHash("sha256").update(token).digest("hex"),
      purpose: "magic",
      expiresAt: new Date(Date.now() + 30 * 60 * 1000),
      used: false,
    });
    const headerList = await headers();
    const host = headerList.get("x-forwarded-host") || headerList.get("host");
    const proto = headerList.get("x-forwarded-proto") || "https";
    const link = `${proto}://${host}/api/auth/lien?token=${token}`;
    await sendMailboxMail({
      to: email,
      subject: `Connexion à ${company.brand}`,
      text: `Bonjour,\n\nPour ouvrir votre espace Zaïon Upcycling, utilisez ce lien dans les 30 minutes :\n${link}\n\nSi vous n'êtes pas à l'origine de cette demande, ignorez ce message.\n\n${company.name}\n${company.email}`,
    });
  }
  return { ok: "Si un compte correspond à cet e-mail, le lien de connexion vient d'être envoyé." };
}

export async function logoutAction() {
  await clearSession();
  redirect("/");
}

export async function registerAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const name = clean(formData.get("name"), 120);
  const email = clean(formData.get("email"), 180).toLowerCase();
  const phone = clean(formData.get("phone"), 40);
  const password = String(formData.get("password") ?? "");
  if (!name || !email || password.length < 8) {
    return { error: "Nom, e-mail et mot de passe (8 caractères minimum) sont requis." };
  }
  await ensureAuthSchema();
  const [existing] = await db.select().from(users).where(eq(users.email, email));
  if (existing) return { error: "Un compte existe déjà avec cet e-mail. Connectez-vous ou demandez un code pour le mot de passe." };
  const sent = await issueCode({
    email,
    purpose: "signup",
    payload: JSON.stringify({ name, phone, passwordHash: await bcrypt.hash(password, 10) }),
  });
  if (sent.error) return { error: sent.error };
  return { ok: sent.ok, step: "code", email };
}

export async function confirmSignupAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const email = clean(formData.get("email"), 180).toLowerCase();
  const code = clean(formData.get("code"), 12);
  await ensureAuthSchema();
  const result = await consumeCode(email, "signup", code);
  if (result.error || result.payload == null) return { error: result.error || "Code incorrect.", step: "code", email };
  const pending = JSON.parse(result.payload) as { name: string; phone: string; passwordHash: string };
  const [existing] = await db.select().from(users).where(eq(users.email, email));
  if (existing) return { error: "Un compte existe déjà avec cet e-mail." };
  const id = uid("usr");
  const role = roleForEmail(email);
  await db.insert(users).values({
    id,
    name: pending.name,
    email,
    phone: pending.phone || null,
    role,
    emailVerified: true,
    authProvider: "password",
    passwordHash: pending.passwordHash,
  });
  await setSession({ id, email, name: pending.name, role });
  redirect(homeFor(role));
}

export async function requestPasswordCodeAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const email = clean(formData.get("email"), 180).toLowerCase();
  if (!email) return { error: "Indiquez votre e-mail." };
  if (!ionosReady()) {
    return { error: "Le code partira depuis contact@zaion-upcycling.com dès que la boîte sera reliée au serveur." };
  }
  await ensureAuthSchema();
  const [user] = await db.select().from(users).where(eq(users.email, email));
  if (user) {
    const sent = await issueCode({ email, purpose: "reset" });
    if (sent.error) return { error: sent.error };
  }
  return { ok: "Si un compte correspond à cet e-mail, le code vient d'être envoyé.", step: "code", email };
}

export async function confirmPasswordCodeAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const email = clean(formData.get("email"), 180).toLowerCase();
  const code = clean(formData.get("code"), 12);
  const password = String(formData.get("password") ?? "");
  if (password.length < 8) return { error: "Le mot de passe doit faire 8 caractères.", step: "code", email };
  await ensureAuthSchema();
  const result = await consumeCode(email, "reset", code);
  if (result.error) return { error: result.error, step: "code", email };
  const [user] = await db.select().from(users).where(eq(users.email, email));
  if (!user) return { error: "Aucun compte ne correspond à cet e-mail." };
  await db.update(users).set({ passwordHash: await bcrypt.hash(password, 10), emailVerified: true, authProvider: "password" }).where(eq(users.id, user.id));
  return openSession(user, "");
}

export async function changePasswordAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const session = await getSession();
  if (!session) redirect("/connexion");
  const next = String(formData.get("next") ?? "");
  if (next.length < 8) return { error: "Le nouveau mot de passe doit faire 8 caractères." };
  await ensureAuthSchema();
  const [user] = await db.select().from(users).where(eq(users.id, session.id));
  if (!user) return { error: "Compte introuvable." };
  const sent = await issueCode({
    email: user.email,
    purpose: "password",
    payload: JSON.stringify({ passwordHash: await bcrypt.hash(next, 10) }),
  });
  if (sent.error) return { error: sent.error };
  return { ok: sent.ok, step: "code", email: user.email };
}

export async function confirmChangedPasswordAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const session = await getSession();
  if (!session) redirect("/connexion");
  const code = clean(formData.get("code"), 12);
  await ensureAuthSchema();
  const result = await consumeCode(session.email, "password", code);
  if (result.error || !result.payload) return { error: result.error || "Code incorrect.", step: "code", email: session.email };
  const pending = JSON.parse(result.payload) as { passwordHash: string };
  await db.update(users).set({ passwordHash: pending.passwordHash }).where(eq(users.id, session.id));
  return { ok: "Mot de passe mis à jour." };
}

export async function updateProfileAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const session = await getSession();
  if (!session) redirect("/connexion");
  const name = clean(formData.get("name"), 120);
  const phone = clean(formData.get("phone"), 40);
  const address = clean(formData.get("address"), 400);
  if (!name) return { error: "Le nom est requis." };
  await ensureAuthSchema();
  const sent = await issueCode({
    email: session.email,
    purpose: "profile",
    payload: JSON.stringify({ name, phone, address }),
  });
  if (sent.error) return { error: sent.error };
  return { ok: sent.ok, step: "code", email: session.email };
}

export async function confirmProfileAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const session = await getSession();
  if (!session) redirect("/connexion");
  const code = clean(formData.get("code"), 12);
  await ensureAuthSchema();
  const result = await consumeCode(session.email, "profile", code);
  if (result.error || !result.payload) return { error: result.error || "Code incorrect.", step: "code", email: session.email };
  const pending = JSON.parse(result.payload) as { name: string; phone: string; address: string };
  await db.update(users).set({
    name: pending.name,
    phone: pending.phone || null,
    address: pending.address || null,
  }).where(eq(users.id, session.id));
  await setSession({ ...session, name: pending.name });
  return { ok: "Coordonnées mises à jour." };
}

export async function priceCart(items: { slug: string; qty: number }[]) {
  const rows = await db.select().from(products);
  const bySlug = new Map(rows.map((row) => [row.slug, row]));
  return items
    .map((item) => {
      const product = bySlug.get(item.slug);
      const qty = Math.max(1, Math.min(99, Math.round(Number(item.qty) || 1)));
      if (!product || !product.active || !product.purchasable || product.priceCents == null) return null;
      return {
        slug: product.slug,
        name: product.name,
        image: product.image,
        qty,
        unitCents: product.priceCents,
        lineCents: product.priceCents * qty,
      };
    })
    .filter((line): line is NonNullable<typeof line> => Boolean(line));
}

async function readOffer(rawCode: string, grossCents: number, vatRate: number) {
  const code = rawCode.trim().toUpperCase().replace(/\s+/g, "");
  if (!code) {
    return { code: null, promoId: null, discountCents: 0, totalCents: grossCents, referralCreditCents: 0, referrerName: null };
  }
  await ensureCatalog();
  const [promo] = await db.select().from(promos).where(eq(promos.code, code));
  if (!promo || !promo.active) return { error: "Ce code n'est pas valable." };
  if (promo.maxUses != null && promo.uses >= promo.maxUses) return { error: "Ce code a atteint son nombre d'utilisations." };
  const discountCents = promo.kind === "amount"
    ? Math.min(promo.value, grossCents)
    : Math.min(grossCents, Math.round((grossCents * promo.value) / 100));
  const totalCents = grossCents - discountCents;
  const { htCents } = splitTtc(totalCents, vatRate);
  const referralCreditCents = promo.kind === "referral" ? Math.round((htCents * (promo.referrerRate ?? 0)) / 100) : 0;
  return {
    code: promo.code,
    promoId: promo.id,
    discountCents,
    totalCents,
    referralCreditCents,
    referrerName: promo.referrerName,
  };
}

export async function placeOrder(_prev: ActionState, formData: FormData): Promise<ActionState> {
  let parsed: { slug: string; qty: number }[] = [];
  try {
    parsed = JSON.parse(clean(formData.get("cart"), 8000) || "[]");
  } catch {
    return { error: "Panier illisible." };
  }
  const lines = await priceCart(parsed);
  if (!lines.length) return { error: "Le panier ne contient aucune pièce commandable." };

  const name = clean(formData.get("name"), 120);
  const email = clean(formData.get("email"), 180).toLowerCase();
  const phone = clean(formData.get("phone"), 40);
  const address = clean(formData.get("address"), 400);
  const note = clean(formData.get("note"), 800);
  const password = String(formData.get("password") ?? "");
  if (!name || !email || !address) return { error: "Nom, e-mail et adresse sont requis." };

  let session = await getSession();
  if (!session) {
    if (password.length < 8) return { error: "Choisissez un mot de passe de 8 caractères pour suivre la commande." };
    const [existing] = await db.select().from(users).where(eq(users.email, email));
    if (existing) {
      if (!existing.emailVerified) {
        return { error: "Confirmez d'abord l'adresse avec le code reçu par e-mail." };
      }
      if (!(await bcrypt.compare(password, existing.passwordHash))) {
        return { error: "Cet e-mail a déjà un compte. Le mot de passe ne correspond pas." };
      }
      const role = (roleForEmail(existing.email) === "client" ? existing.role : roleForEmail(existing.email)) as Role;
      session = { id: existing.id, email: existing.email, name: existing.name, role };
    } else {
      return { error: "Créez le compte et confirmez le code reçu par e-mail, puis revenez à la commande." };
    }
    await setSession(session);
  }

  const prefs = await readSettings();
  const grossCents = lines.reduce((sum, line) => sum + line.lineCents, 0);
  const offer = await readOffer(clean(formData.get("code"), 40), grossCents, prefs.vatRate);
  if ("error" in offer) return offer;
  const { htCents, vatCents } = splitTtc(offer.totalCents, prefs.vatRate);
  const commissionCents = Math.round((htCents * prefs.commissionRate) / 100);
  const [{ value }] = await db.select({ value: count() }).from(orders);
  const id = uid("ord");
  const number = `Z-2026-${String(Number(value) + 1).padStart(4, "0")}`;
  await db.insert(orders).values({
    id,
    number,
    userId: session.id,
    customerName: name,
    customerEmail: email,
    phone: phone || null,
    address,
    status: "recue",
    subtotalCents: htCents,
    vatCents,
    totalCents: offer.totalCents,
    commissionCents,
    commissionRate: prefs.commissionRate,
    note: note || null,
    promoCode: offer.code,
    discountCents: offer.discountCents,
    referralCreditCents: offer.referralCreditCents,
    referrerName: offer.referrerName,
  });
  if (offer.promoId) {
    const [promo] = await db.select().from(promos).where(eq(promos.id, offer.promoId));
    if (promo) await db.update(promos).set({ uses: promo.uses + 1 }).where(eq(promos.id, promo.id));
  }
  await db.insert(orderItems).values(
    lines.map((line) => ({
      id: uid("itm"),
      orderId: id,
      productSlug: line.slug,
      name: line.name,
      qty: line.qty,
      unitCents: line.unitCents,
    })),
  );
  await db.insert(revenues).values({
    id: uid("rev"),
    label: `Commande ${number}`,
    occurredOn: new Date().toISOString().slice(0, 10),
    amountHtCents: htCents,
    vatRate: prefs.vatRate,
    commissionCents,
    orderId: id,
    voided: false,
  });
  await touchLead({
    name,
    email,
    phone,
    source: "commande",
    status: "gagne",
    notes: `Commande ${number}`,
  });
  revalidatePath("/atelier");
  revalidatePath("/pilotage");
  if (clean(formData.get("pay"), 20) === "card") {
    if (!zaionStripeReady()) {
      redirect(`/compte/commandes/${id}?neuf=1&carte=attente`);
    }
    const headerList = await headers();
    const host = headerList.get("x-forwarded-host") || headerList.get("host") || "zaion-upcycling.com";
    const proto = headerList.get("x-forwarded-proto") || "https";
    const checkout = await createZaionCheckout({
      order: { id, number, customerEmail: email, totalCents: offer.totalCents },
      origin: `${proto}://${host}`,
    });
    if ("id" in checkout && checkout.url) {
      await db.update(orders).set({ checkoutSession: checkout.id }).where(eq(orders.id, id));
      redirect(checkout.url);
    }
    redirect(`/compte/commandes/${id}?neuf=1&carte=echec`);
  }
  redirect(`/compte/commandes/${id}?neuf=1`);
}

export async function requestQuote(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const contactName = clean(formData.get("name"), 120);
  const email = clean(formData.get("email"), 180).toLowerCase();
  const phone = clean(formData.get("phone"), 40);
  const category = clean(formData.get("category"), 40) || "nautisme";
  const title = clean(formData.get("title"), 160);
  const message = clean(formData.get("message"), 2000);
  if (!contactName || !email || !title) return { error: "Nom, e-mail et objet sont requis." };

  const answers = assemblyQuestions.map((label, index) => ({
    label,
    value: clean(formData.get(`q_${index}`), 500),
    sort: index,
  }));
  const missing = answers.some((field) => !field.value);
  const [{ value }] = await db.select({ value: count() }).from(quotes);
  const id = uid("quo");
  await db.insert(quotes).values({
    id,
    number: `D-2026-${String(Number(value) + 1).padStart(4, "0")}`,
    contactName,
    email,
    phone: phone || null,
    category,
    title,
    status: missing ? "infos" : "nouveau",
    message: message || null,
  });
  await db.insert(quoteFields).values(
    answers.map((field) => ({
      id: uid("fld"),
      quoteId: id,
      label: field.label,
      value: field.value || null,
      required: true,
      sort: field.sort,
    })),
  );
  await touchLead({
    name: contactName,
    email,
    phone,
    source: "devis",
    status: "devis",
    notes: title,
  });
  revalidatePath("/atelier/devis");
  return { ok: "Demande envoyée. Zaïon revient vers vous avec le chiffrage, ou les précisions de montage encore nécessaires." };
}

export async function contactLead(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const name = clean(formData.get("name"), 120);
  const email = clean(formData.get("email"), 180).toLowerCase();
  const phone = clean(formData.get("phone"), 40);
  const message = clean(formData.get("message"), 2000);
  if (!name || !email || !message) return { error: "Nom, e-mail et message sont requis." };
  await touchLead({ name, email, phone, source: "visiteur", status: "nouveau", notes: message });
  revalidatePath("/atelier/contacts");
  return { ok: "Message reçu. Zaïon vous répond dès que possible." };
}

async function staff() {
  return actor(["atelier", "superadmin"]);
}

export async function createQuote(_prev: ActionState, formData: FormData): Promise<ActionState> {
  await staff();
  const contactName = clean(formData.get("name"), 120);
  const email = clean(formData.get("email"), 180).toLowerCase();
  const title = clean(formData.get("title"), 160);
  const category = clean(formData.get("category"), 40) || "nautisme";
  if (!contactName || !title) return { error: "Nom et objet sont requis." };
  const [{ value }] = await db.select({ value: count() }).from(quotes);
  const id = uid("quo");
  await db.insert(quotes).values({
    id,
    number: `D-2026-${String(Number(value) + 1).padStart(4, "0")}`,
    contactName,
    email: email || "à-completer@zaion-upcycling.com",
    phone: clean(formData.get("phone"), 40) || null,
    category,
    title,
    status: "infos",
    message: clean(formData.get("message"), 2000) || null,
    example: formData.get("example") === "on",
  });
  await db.insert(quoteFields).values(
    assemblyQuestions.map((label, sort) => ({
      id: uid("fld"),
      quoteId: id,
      label,
      value: null,
      required: true,
      sort,
    })),
  );
  revalidatePath("/atelier/devis");
  redirect(`/atelier/devis/${id}`);
}

export async function updateQuote(formData: FormData) {
  await staff();
  const id = clean(formData.get("id"), 40);
  const amount = clean(formData.get("amount"), 20).replace(",", ".");
  await db
    .update(quotes)
    .set({
      status: clean(formData.get("status"), 20) || "nouveau",
      title: clean(formData.get("title"), 160),
      message: clean(formData.get("message"), 2000) || null,
      amountHtCents: amount ? Math.round(Number(amount) * 100) : null,
    })
    .where(eq(quotes.id, id));
  revalidatePath(`/atelier/devis/${id}`);
}

export async function addQuoteField(formData: FormData) {
  await staff();
  const quoteId = clean(formData.get("quoteId"), 40);
  const label = clean(formData.get("label"), 180);
  if (!label) return;
  await db.insert(quoteFields).values({
    id: uid("fld"),
    quoteId,
    label,
    value: clean(formData.get("value"), 500) || null,
    required: formData.get("required") === "on",
    sort: 100,
  });
  await db.update(quotes).set({ status: "infos" }).where(eq(quotes.id, quoteId));
  revalidatePath(`/atelier/devis/${quoteId}`);
}

export async function saveQuoteField(formData: FormData) {
  await staff();
  const id = clean(formData.get("id"), 40);
  const quoteId = clean(formData.get("quoteId"), 40);
  await db
    .update(quoteFields)
    .set({
      label: clean(formData.get("label"), 180),
      value: clean(formData.get("value"), 800) || null,
      required: formData.get("required") === "on",
    })
    .where(eq(quoteFields.id, id));
  revalidatePath(`/atelier/devis/${quoteId}`);
}

export async function deleteQuoteField(formData: FormData) {
  await staff();
  const id = clean(formData.get("id"), 40);
  const quoteId = clean(formData.get("quoteId"), 40);
  await db.delete(quoteFields).where(eq(quoteFields.id, id));
  revalidatePath(`/atelier/devis/${quoteId}`);
}

export async function saveLead(_prev: ActionState, formData: FormData): Promise<ActionState> {
  await staff();
  const id = clean(formData.get("id"), 40);
  const payload = {
    name: clean(formData.get("name"), 120),
    email: clean(formData.get("email"), 180).toLowerCase() || null,
    phone: clean(formData.get("phone"), 40) || null,
    source: clean(formData.get("source"), 40) || "manuel",
    status: clean(formData.get("status"), 20) || "nouveau",
    notes: clean(formData.get("notes"), 2000) || null,
    example: formData.get("example") === "on",
  };
  if (!payload.name) return { error: "Le nom est requis." };
  if (id) await db.update(leads).set(payload).where(eq(leads.id, id));
  else await db.insert(leads).values({ id: uid("lead"), ...payload });
  revalidatePath("/atelier/contacts");
  return { ok: "Contact enregistré." };
}

export async function deleteLead(formData: FormData) {
  await staff();
  await db.delete(leads).where(eq(leads.id, clean(formData.get("id"), 40)));
  revalidatePath("/atelier/contacts");
}

export async function saveRevenue(_prev: ActionState, formData: FormData): Promise<ActionState> {
  await staff();
  const label = clean(formData.get("label"), 160);
  const occurredOn = clean(formData.get("date"), 10);
  const amount = Number(clean(formData.get("amount"), 20).replace(",", "."));
  const vatRate = Number(clean(formData.get("vat"), 4) || 20);
  if (!label || !occurredOn || !Number.isFinite(amount)) return { error: "Libellé, date et montant HT sont requis." };
  const prefs = await readSettings();
  const amountHtCents = Math.round(amount * 100);
  await db.insert(revenues).values({
    id: uid("rev"),
    label,
    occurredOn,
    amountHtCents,
    vatRate,
    commissionCents: Math.round((amountHtCents * prefs.commissionRate) / 100),
    voided: false,
    example: formData.get("example") === "on",
  });
  revalidatePath("/atelier/revenus");
  revalidatePath("/pilotage");
  return { ok: "Recette ajoutée." };
}

export async function deleteExampleOrder(formData: FormData) {
  await staff();
  await ensureCatalog();
  const id = clean(formData.get("id"), 40);
  const [order] = await db.select().from(orders).where(eq(orders.id, id));
  if (!order?.example) return;
  await db.delete(orderItems).where(eq(orderItems.orderId, id));
  await db.delete(revenues).where(eq(revenues.orderId, id));
  await db.delete(orders).where(eq(orders.id, id));
  revalidatePath("/atelier/commandes");
  revalidatePath("/atelier/revenus");
  revalidatePath("/atelier");
  revalidatePath("/pilotage");
}

export async function deleteExampleQuote(formData: FormData) {
  await staff();
  await ensureCatalog();
  const id = clean(formData.get("id"), 40);
  const [quote] = await db.select().from(quotes).where(eq(quotes.id, id));
  if (!quote?.example) return;
  await db.delete(quoteFields).where(eq(quoteFields.quoteId, id));
  await db.delete(quotes).where(eq(quotes.id, id));
  revalidatePath("/atelier/devis");
  revalidatePath("/atelier");
}

export async function deleteRevenue(formData: FormData) {
  await staff();
  await db.delete(revenues).where(eq(revenues.id, clean(formData.get("id"), 40)));
  revalidatePath("/atelier/revenus");
  revalidatePath("/pilotage");
}

export async function saveCharge(_prev: ActionState, formData: FormData): Promise<ActionState> {
  await staff();
  const label = clean(formData.get("label"), 160);
  const kind = clean(formData.get("kind"), 30);
  const amount = Number(clean(formData.get("amount"), 20).replace(",", "."));
  const period = clean(formData.get("period"), 20);
  if (!label || !kind || !period || !Number.isFinite(amount)) return { error: "Type, libellé, période et montant sont requis." };
  const id = clean(formData.get("id"), 40);
  const payload = {
    kind,
    activity: clean(formData.get("activity"), 60) || null,
    label,
    provider: clean(formData.get("provider"), 120) || null,
    reference: clean(formData.get("reference"), 80) || null,
    period,
    amountCents: Math.round(amount * 100),
    paid: formData.get("paid") === "on",
    notes: clean(formData.get("notes"), 800) || null,
    example: formData.get("example") === "on",
  };
  if (id) await db.update(charges).set(payload).where(eq(charges.id, id));
  else await db.insert(charges).values({ id: uid("chg"), ...payload });
  revalidatePath("/atelier/charges");
  revalidatePath("/pilotage");
  return { ok: "Charge enregistrée." };
}

export async function toggleCharge(formData: FormData) {
  await staff();
  const id = clean(formData.get("id"), 40);
  const [row] = await db.select().from(charges).where(eq(charges.id, id));
  if (!row) return;
  await db.update(charges).set({ paid: !row.paid }).where(eq(charges.id, id));
  revalidatePath("/atelier/charges");
}

export async function deleteCharge(formData: FormData) {
  await staff();
  await db.delete(charges).where(eq(charges.id, clean(formData.get("id"), 40)));
  revalidatePath("/atelier/charges");
  revalidatePath("/pilotage");
}

export async function recordManualPayment(formData: FormData) {
  await staff();
  await ensureCatalog();
  const id = clean(formData.get("id"), 40);
  const detail = clean(formData.get("detail"), 80);
  const [order] = await db.select().from(orders).where(eq(orders.id, id));
  if (!order || order.status === "annulee") return;
  if (order.paymentRef && !order.paymentRef.startsWith("manuel")) return;
  await db.update(orders).set({
    paymentRef: detail ? `manuel:${detail}` : "manuel",
    status: order.status === "recue" ? "confirmee" : order.status,
  }).where(eq(orders.id, id));
  revalidatePath("/atelier/commandes");
  revalidatePath("/pilotage");
  revalidatePath(`/compte/commandes/${id}`);
}

export async function updateOrderStatus(formData: FormData) {
  await staff();
  const id = clean(formData.get("id"), 40);
  const status = clean(formData.get("status"), 20);
  await db.update(orders).set({ status }).where(eq(orders.id, id));
  const [revenue] = await db.select().from(revenues).where(eq(revenues.orderId, id));
  if (revenue) {
    await db.update(revenues).set({ voided: status === "annulee" }).where(eq(revenues.id, revenue.id));
  }
  revalidatePath("/atelier/commandes");
  revalidatePath("/pilotage");
  revalidatePath(`/compte/commandes/${id}`);
}

const productUnits = new Set(["pièce", "m²", "m³", "ml", "heure"]);

function slugify(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 72);
}

async function storePhoto(file: FormDataEntryValue | null): Promise<null | { error: string } | { url: string }> {
  if (!(file instanceof File) || file.size === 0) return null;
  if (file.size > 2_000_000) return { error: "La photo dépasse 2 Mo." };
  if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
    return { error: "La photo doit être un JPEG, un PNG ou un WebP." };
  }
  const id = uid("img");
  const bytes = Buffer.from(await file.arrayBuffer());
  await db.insert(media).values({ id, mime: file.type, data: bytes.toString("base64") });
  return { url: `/media/${id}` };
}

async function readProductFields(formData: FormData) {
  await ensureCatalog();
  const prefs = await readSettings();
  const name = clean(formData.get("name"), 160);
  const summary = clean(formData.get("summary"), 280);
  const description = clean(formData.get("description"), 8000);
  const category = clean(formData.get("category"), 40);
  const unit = clean(formData.get("unit"), 20);
  const universes = new Set(["nautisme", "mobilier", "evenementiel", "mode", "transmission", "atelier"]);
  const basis = clean(formData.get("basis"), 8) === "ht" ? "ht" : "ttc";
  const raw = clean(formData.get("price"), 20).replace(",", ".");
  const amount = raw === "" ? null : Math.round(Number(raw) * 100);
  const cardSummary = summary || description.replace(/\s+/g, " ").slice(0, 180);
  if (!name || !description) return { error: "Le titre et la description sont requis." };
  if (!universes.has(category)) return { error: "Choisissez un univers." };
  if (!productUnits.has(unit)) return { error: "Choisissez une unité." };
  if (amount != null && (!Number.isFinite(amount) || amount < 0)) return { error: "Le prix n'est pas lisible." };
  const vat = prefs.vatRate;
  const priceCents = amount == null ? null : basis === "ht" ? Math.round((amount * (100 + vat)) / 100) : amount;
  const priceHtCents = amount == null ? null : basis === "ht" ? amount : Math.round((amount * 100) / (100 + vat));
  const photo = await storePhoto(formData.get("photo"));
  if (photo && "error" in photo) return photo;
  return {
    name,
    summary: cardSummary,
    description,
    category,
    unit,
    priceBasis: basis,
    priceCents,
    priceHtCents,
    image: photo && "url" in photo ? photo.url : "",
    purchasable: formData.get("purchasable") === "on" && priceCents != null,
    active: formData.get("active") === "on",
  };
}

export async function createProduct(_prev: ActionState, formData: FormData): Promise<ActionState> {
  await staff();
  const fields = await readProductFields(formData);
  if ("error" in fields) return fields;
  if (!fields.image) return { error: "Ajoutez une photo." };
  let slug = slugify(fields.name) || uid("piece");
  const [taken] = await db.select({ id: products.id }).from(products).where(eq(products.slug, slug));
  if (taken) slug = `${slug}-${uid("p").slice(-4)}`;
  const id = uid("prd");
  await db.insert(products).values({ id, slug, compareAtCents: null, ...fields });
  revalidatePath("/boutique");
  revalidatePath("/atelier/produits");
  redirect(`/atelier/produits/${id}`);
}

export async function updateProduct(_prev: ActionState, formData: FormData): Promise<ActionState> {
  await staff();
  const id = clean(formData.get("id"), 40);
  const [current] = await db.select().from(products).where(eq(products.id, id));
  if (!current) return { error: "Pièce introuvable." };
  const fields = await readProductFields(formData);
  if ("error" in fields) return fields;
  await db
    .update(products)
    .set({ ...fields, image: fields.image || current.image })
    .where(eq(products.id, id));
  revalidatePath("/boutique");
  revalidatePath(`/produit/${current.slug}`);
  revalidatePath("/atelier/produits");
  revalidatePath(`/atelier/produits/${id}`);
  return { ok: "Pièce enregistrée." };
}

export async function dismissPaymentAlert(formData: FormData) {
  await staff();
  const id = clean(formData.get("id"), 40);
  await db.update(orders).set({ paymentAlert: false }).where(eq(orders.id, id));
  revalidatePath("/atelier");
  revalidatePath("/pilotage");
}

export async function saveOrderNote(formData: FormData) {
  await staff();
  await ensureCatalog();
  const id = clean(formData.get("id"), 40);
  await db.update(orders).set({ atelierNote: clean(formData.get("atelierNote"), 1200) || null }).where(eq(orders.id, id));
  revalidatePath("/atelier/commandes");
}

function eurosToCents(raw: string) {
  const normalized = raw.replace(/\s/g, "").replace(",", ".");
  if (!/^\d+(\.\d{1,2})?$/.test(normalized)) return null;
  return Math.round(Number(normalized) * 100);
}

async function openPaymentLink(order: { id: string; number: string; customerEmail: string; totalCents: number }, lineName: string) {
  const headerList = await headers();
  const host = headerList.get("x-forwarded-host") || headerList.get("host") || "zaion-upcycling.com";
  const proto = headerList.get("x-forwarded-proto") || "https";
  return createZaionCheckout({
    order: { ...order, lineName },
    origin: `${proto}://${host}`,
  });
}

export async function requestClientPayment(_prev: ActionState, formData: FormData): Promise<ActionState> {
  await staff();
  await ensureCatalog();
  if (!zaionStripeReady()) {
    return { error: "Le lien Stripe attend la clé ZAION_STRIPE_SECRET_KEY du compte de Zaïon." };
  }
  const clientId = clean(formData.get("clientId"), 40);
  const label = clean(formData.get("label"), 160);
  const totalCents = eurosToCents(clean(formData.get("amount"), 20));
  if (!label) return { error: "Indiquez ce que le client paie." };
  if (totalCents == null || totalCents < 50) return { error: "Le montant carte minimum est 0,50 €." };

  let name = clean(formData.get("name"), 120);
  let email = clean(formData.get("email"), 180).toLowerCase();
  let phone = clean(formData.get("phone"), 40);
  let userId: string | null = null;

  if (clientId && clientId !== "nouveau") {
    const [client] = await db.select().from(users).where(eq(users.id, clientId));
    if (!client) return { error: "Ce client n'existe plus." };
    userId = client.id;
    name = client.name;
    email = client.email;
    phone = phone || client.phone || "";
  } else {
    if (!name || !email.includes("@")) return { error: "Nom et e-mail du nouveau client sont requis." };
    const [existing] = await db.select().from(users).where(eq(users.email, email));
    if (existing) {
      userId = existing.id;
      name = existing.name;
    } else {
      userId = uid("usr");
      await db.insert(users).values({
        id: userId,
        email,
        name,
        passwordHash: await bcrypt.hash(randomBytes(24).toString("hex"), 10),
        role: "client",
        phone: phone || null,
        authProvider: "password",
        emailVerified: true,
      });
    }
  }

  const prefs = await readSettings();
  const { htCents, vatCents } = splitTtc(totalCents, prefs.vatRate);
  const commissionCents = Math.round((htCents * prefs.commissionRate) / 100);
  const [{ value }] = await db.select({ value: count() }).from(orders);
  const id = uid("ord");
  const number = `Z-2026-${String(Number(value) + 1).padStart(4, "0")}`;
  await db.insert(orders).values({
    id,
    number,
    userId,
    customerName: name,
    customerEmail: email,
    phone: phone || null,
    address: "Lien de paiement envoyé par l'atelier",
    status: "recue",
    subtotalCents: htCents,
    vatCents,
    totalCents,
    commissionCents,
    commissionRate: prefs.commissionRate,
    note: label,
  });
  await db.insert(orderItems).values({
    id: uid("itm"),
    orderId: id,
    productSlug: "reglement",
    name: label,
    qty: 1,
    unitCents: totalCents,
  });
  await touchLead({ name, email, phone, source: "paiement", status: "devis", notes: `${number} · ${label}` });

  const checkout = await openPaymentLink({ id, number, customerEmail: email, totalCents }, label);
  if (!("url" in checkout) || !checkout.url) {
    revalidatePath("/atelier/commandes");
    return { error: ("error" in checkout && checkout.error) || "La commande est créée, le lien Stripe n'a pas pu s'ouvrir." };
  }
  await db.update(orders).set({ checkoutSession: checkout.id }).where(eq(orders.id, id));
  let mailed = false;
  if (ionosReady()) {
    try {
      const sent = await sendMailboxMail({
        to: email,
        subject: `Paiement Zaïon Upcycling · ${number}`,
        text: `Bonjour ${name},\n\nZaïon vous adresse un paiement de ${(totalCents / 100).toFixed(2).replace(".", ",")} € pour : ${label}.\n\nRéglez-le ici :\n${checkout.url}\n\n${company.name}\n${company.email}`,
      });
      mailed = sent.sent;
    } catch {
      mailed = false;
    }
  }
  revalidatePath("/atelier/commandes");
  revalidatePath("/atelier/contacts");
  return {
    ok: mailed
      ? `Lien envoyé à ${email}. La commande ${number} compte dans le réel seulement une fois payée.`
      : `Lien prêt pour ${name}. Copiez-le : la boîte du site n'envoie pas encore les e-mails. La commande ${number} compte dans le réel seulement une fois payée.`,
    paymentUrl: checkout.url,
  };
}

export async function staffPaymentLink(_prev: ActionState, formData: FormData): Promise<ActionState> {
  await staff();
  await ensureCatalog();
  const id = clean(formData.get("id"), 40);
  const [order] = await db.select().from(orders).where(eq(orders.id, id));
  if (!order || order.status === "annulee" || order.paymentRef) return { error: "Cette commande n'attend plus de paiement." };
  const [item] = await db.select().from(orderItems).where(eq(orderItems.orderId, id));
  const checkout = await openPaymentLink(order, item?.name || `Commande ${order.number}`);
  if (!("url" in checkout) || !checkout.url) return { error: ("error" in checkout && checkout.error) || "Stripe n'a pas ouvert le lien." };
  await db.update(orders).set({ checkoutSession: checkout.id }).where(eq(orders.id, id));
  return { ok: "Lien prêt à envoyer.", paymentUrl: checkout.url };
}

export async function startCardPayment(formData: FormData) {
  const session = await getSession();
  if (!session) redirect("/connexion");
  await ensureCatalog();
  const id = clean(formData.get("id"), 40);
  const [order] = await db.select().from(orders).where(eq(orders.id, id));
  if (!order || (order.userId !== session.id && session.role === "client")) redirect("/compte");
  if (order.paymentRef || order.status === "annulee") redirect(`/compte/commandes/${id}`);
  const headerList = await headers();
  const host = headerList.get("x-forwarded-host") || headerList.get("host") || "zaion-upcycling.com";
  const proto = headerList.get("x-forwarded-proto") || "https";
  const checkout = await createZaionCheckout({
    order: { id: order.id, number: order.number, customerEmail: order.customerEmail, totalCents: order.totalCents },
    origin: `${proto}://${host}`,
  });
  if (!("id" in checkout) || !checkout.url) redirect(`/compte/commandes/${id}?carte=echec`);
  await db.update(orders).set({ checkoutSession: checkout.id }).where(eq(orders.id, id));
  redirect(checkout.url);
}

export async function saveAtelierPresence(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const session = await staff();
  const address = clean(formData.get("address"), 180);
  const wantsPublic = formData.get("public") === "on";
  const accepted = formData.get("risks") === "on";
  if (wantsPublic) {
    if (session.role !== "atelier") {
      return { error: "Seule Zaïon peut publier cette adresse. Depuis le pilotage, on peut seulement la retirer." };
    }
    if (!accepted) return { error: "Cochez la confirmation des risques pour publier l'adresse." };
    if (address.length < 12) return { error: "Indiquez l'adresse complète du lieu de rendez-vous." };
    if (isPersonalHome(address)) {
      return { error: "Le domicile ne se publie pas sur le site. Il reste réservé à Google, avec l'adresse masquée." };
    }
  }
  await setSetting("atelier_address", address);
  await setSetting("atelier_public", wantsPublic ? "1" : "0");
  revalidatePath("/contact");
  revalidatePath("/a-propos");
  revalidatePath("/atelier");
  revalidatePath("/pilotage");
  return { ok: wantsPublic ? "L'adresse est en ligne, comme lieu de rendez-vous." : "Adresse enregistrée. Elle n'apparaît pas sur le site." };
}

export async function unpublishAtelier() {
  await actor(["superadmin", "atelier"]);
  await setSetting("atelier_public", "0");
  revalidatePath("/contact");
  revalidatePath("/a-propos");
  revalidatePath("/atelier");
  revalidatePath("/pilotage");
}

export async function saveCommission(_prev: ActionState, formData: FormData): Promise<ActionState> {
  await actor(["superadmin"]);
  const rate = Math.round(Number(clean(formData.get("rate"), 6).replace(",", ".")));
  if (!Number.isFinite(rate) || rate < 0 || rate > 80) return { error: "Le taux doit être un entier entre 0 et 80 %." };
  await setSetting("commission_rate", String(rate));
  await setSetting("commission_visible", formData.get("visible") === "on" ? "1" : "0");
  const vat = Number(clean(formData.get("vat"), 4));
  if (Number.isFinite(vat) && vat >= 0 && vat <= 30) await setSetting("vat_rate", String(vat));
  revalidatePath("/pilotage");
  revalidatePath("/atelier");
  return { ok: "Réglages enregistrés. Les prochaines commandes utilisent ce taux." };
}

export async function deleteProduct(formData: FormData) {
  await staff();
  await ensureCatalog();
  const id = clean(formData.get("id"), 40);
  const [current] = await db.select().from(products).where(eq(products.id, id));
  if (!current) redirect("/atelier/produits");
  await db.delete(products).where(eq(products.id, id));
  revalidatePath("/boutique");
  revalidatePath(`/produit/${current.slug}`);
  revalidatePath("/atelier/produits");
  redirect("/atelier/produits");
}

export async function savePromo(_prev: ActionState, formData: FormData): Promise<ActionState> {
  await staff();
  await ensureCatalog();
  const code = clean(formData.get("code"), 24).toUpperCase().replace(/\s+/g, "");
  const label = clean(formData.get("label"), 120);
  const kind = clean(formData.get("kind"), 20);
  const raw = Number(clean(formData.get("value"), 12).replace(",", "."));
  if (!/^[A-Z0-9-]{3,24}$/.test(code)) return { error: "Le code fait 3 à 24 lettres ou chiffres." };
  if (!label) return { error: "Donnez un nom à l'offre." };
  if (!["percent", "amount", "referral"].includes(kind)) return { error: "Choisissez le type d'offre." };
  if (!Number.isFinite(raw) || raw <= 0) return { error: "Indiquez la valeur de la remise." };
  const value = kind === "amount" ? Math.round(raw * 100) : Math.round(raw);
  if (kind !== "amount" && (value < 1 || value > 80)) return { error: "Le pourcentage va de 1 à 80." };
  if (kind === "amount" && value > 100_000_00) return { error: "Le montant est trop élevé." };
  const referrerName = clean(formData.get("referrerName"), 120) || null;
  const referrerEmail = clean(formData.get("referrerEmail"), 180).toLowerCase() || null;
  const referrerRate = Math.round(Number(clean(formData.get("referrerRate"), 6).replace(",", ".")) || 0);
  if (kind === "referral" && !referrerName) return { error: "Indiquez le nom du parrain." };
  if (kind === "referral" && (referrerRate < 0 || referrerRate > 30)) return { error: "La part du parrain va de 0 à 30 % du HT." };
  const maxRaw = clean(formData.get("maxUses"), 6);
  const maxUses = maxRaw ? Math.round(Number(maxRaw)) : null;
  if (maxUses != null && (!Number.isFinite(maxUses) || maxUses < 1)) return { error: "Le nombre d'utilisations n'est pas lisible." };
  const [taken] = await db.select({ id: promos.id }).from(promos).where(eq(promos.code, code));
  if (taken) return { error: "Ce code existe déjà." };
  await db.insert(promos).values({
    id: uid("pro"),
    code,
    label,
    kind,
    value,
    referrerName: kind === "referral" ? referrerName : null,
    referrerEmail: kind === "referral" ? referrerEmail : null,
    referrerRate: kind === "referral" ? referrerRate : null,
    active: true,
    maxUses,
    uses: 0,
  });
  revalidatePath("/atelier/offres");
  return { ok: "Offre enregistrée." };
}

export async function setPromoActive(formData: FormData) {
  await staff();
  await ensureCatalog();
  const id = clean(formData.get("id"), 40);
  await db.update(promos).set({ active: formData.get("active") === "1" }).where(eq(promos.id, id));
  revalidatePath("/atelier/offres");
}

export async function deletePromo(formData: FormData) {
  await staff();
  await ensureCatalog();
  const id = clean(formData.get("id"), 40);
  await db.delete(promos).where(eq(promos.id, id));
  revalidatePath("/atelier/offres");
}

export async function saveSiteCopyAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  await staff();
  await setSetting("site_copy", JSON.stringify(copyFromForm(formData)));
  revalidatePath("/");
  revalidatePath("/a-propos");
  revalidatePath("/contact");
  for (const item of categories) revalidatePath(`/univers/${item.slug}`);
  revalidatePath("/atelier/site");
  return { ok: "Textes enregistrés. Ils sont en ligne sur le site." };
}
