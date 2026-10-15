"use server";

import bcrypt from "bcryptjs";
import { count, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { db } from "@/db";
import {
  charges,
  leads,
  orderItems,
  orders,
  products,
  quoteFields,
  quotes,
  revenues,
  users,
  type Role,
} from "@/db/schema";
import { splitTtc } from "@/lib/format";
import { readSettings, setSetting } from "@/lib/finance";
import { assemblyQuestions } from "@/lib/questions";
import { clearSession, getSession, homeFor, setSession, type Session } from "@/lib/session";

export type ActionState = { error?: string; ok?: string } | null;

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

export async function loginAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const email = clean(formData.get("email"), 180).toLowerCase();
  const password = String(formData.get("password") ?? "");
  const next = clean(formData.get("next"), 200);
  const [user] = await db.select().from(users).where(eq(users.email, email));
  if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
    return { error: "Identifiants incorrects." };
  }
  const role = user.role as Role;
  await setSession({ id: user.id, email: user.email, name: user.name, role });
  redirect(next.startsWith("/") ? next : homeFor(role));
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
  const [existing] = await db.select().from(users).where(eq(users.email, email));
  if (existing) return { error: "Un compte existe déjà avec cet e-mail." };
  const id = uid("usr");
  await db.insert(users).values({
    id,
    name,
    email,
    phone: phone || null,
    role: "client",
    passwordHash: await bcrypt.hash(password, 10),
  });
  await setSession({ id, email, name, role: "client" });
  redirect("/compte");
}

export async function changePasswordAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const session = await getSession();
  if (!session) redirect("/connexion");
  const current = String(formData.get("current") ?? "");
  const next = String(formData.get("next") ?? "");
  if (next.length < 8) return { error: "Le nouveau mot de passe doit faire 8 caractères." };
  const [user] = await db.select().from(users).where(eq(users.id, session.id));
  if (!user || !(await bcrypt.compare(current, user.passwordHash))) {
    return { error: "Mot de passe actuel incorrect." };
  }
  await db.update(users).set({ passwordHash: await bcrypt.hash(next, 10) }).where(eq(users.id, user.id));
  return { ok: "Mot de passe mis à jour." };
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
      if (!(await bcrypt.compare(password, existing.passwordHash))) {
        return { error: "Cet e-mail a déjà un compte. Le mot de passe ne correspond pas." };
      }
      session = { id: existing.id, email: existing.email, name: existing.name, role: existing.role as Role };
    } else {
      const id = uid("usr");
      await db.insert(users).values({
        id,
        name,
        email,
        phone: phone || null,
        address,
        role: "client",
        passwordHash: await bcrypt.hash(password, 10),
      });
      session = { id, email, name, role: "client" };
    }
    await setSession(session);
  }

  const prefs = await readSettings();
  const totalCents = lines.reduce((sum, line) => sum + line.lineCents, 0);
  const { htCents, vatCents } = splitTtc(totalCents, prefs.vatRate);
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
    totalCents,
    commissionCents,
    commissionRate: prefs.commissionRate,
    note: note || null,
  });
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
  });
  revalidatePath("/atelier/revenus");
  revalidatePath("/pilotage");
  return { ok: "Recette ajoutée." };
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

export async function updateProduct(formData: FormData) {
  await staff();
  const id = clean(formData.get("id"), 40);
  const raw = clean(formData.get("price"), 20).replace(",", ".");
  const priceCents = raw === "" ? null : Math.round(Number(raw) * 100);
  await db
    .update(products)
    .set({
      priceCents: priceCents != null && Number.isFinite(priceCents) ? priceCents : null,
      purchasable: formData.get("purchasable") === "on" && priceCents != null,
      active: formData.get("active") === "on",
    })
    .where(eq(products.id, id));
  revalidatePath("/boutique");
  revalidatePath("/atelier/produits");
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
