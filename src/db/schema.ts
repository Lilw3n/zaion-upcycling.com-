import { boolean, integer, pgTable, text, timestamp } from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: text("id").primaryKey(),
  email: text("email").notNull().unique(),
  name: text("name").notNull(),
  passwordHash: text("password_hash").notNull(),
  role: text("role").notNull(),
  phone: text("phone"),
  address: text("address"),
  googleSub: text("google_sub"),
  authProvider: text("auth_provider").default("password"),
  emailVerified: boolean("email_verified").notNull().default(true),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const authTokens = pgTable("auth_tokens", {
  id: text("id").primaryKey(),
  email: text("email").notNull(),
  tokenHash: text("token_hash").notNull(),
  purpose: text("purpose").notNull(),
  payload: text("payload"),
  attempts: integer("attempts").notNull().default(0),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  used: boolean("used").notNull().default(false),
});

export const settings = pgTable("settings", {
  key: text("key").primaryKey(),
  value: text("value").notNull(),
});

export const products = pgTable("products", {
  id: text("id").primaryKey(),
  slug: text("slug").notNull().unique(),
  name: text("name").notNull(),
  category: text("category").notNull(),
  summary: text("summary").notNull(),
  description: text("description").notNull(),
  priceCents: integer("price_cents"),
  priceHtCents: integer("price_ht_cents"),
  priceBasis: text("price_basis").notNull().default("ttc"),
  unit: text("unit"),
  compareAtCents: integer("compare_at_cents"),
  image: text("image").notNull(),
  purchasable: boolean("purchasable").notNull().default(true),
  active: boolean("active").notNull().default(true),
});

export const orders = pgTable("orders", {
  id: text("id").primaryKey(),
  number: text("number").notNull(),
  userId: text("user_id"),
  customerName: text("customer_name").notNull(),
  customerEmail: text("customer_email").notNull(),
  phone: text("phone"),
  address: text("address"),
  status: text("status").notNull(),
  subtotalCents: integer("subtotal_cents").notNull(),
  vatCents: integer("vat_cents").notNull(),
  totalCents: integer("total_cents").notNull(),
  commissionCents: integer("commission_cents").notNull(),
  commissionRate: integer("commission_rate").notNull(),
  note: text("note"),
  atelierNote: text("atelier_note"),
  paymentRef: text("payment_ref"),
  promoCode: text("promo_code"),
  discountCents: integer("discount_cents").notNull().default(0),
  referralCreditCents: integer("referral_credit_cents").notNull().default(0),
  referrerName: text("referrer_name"),
  example: boolean("example").notNull().default(false),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const promos = pgTable("promos", {
  id: text("id").primaryKey(),
  code: text("code").notNull().unique(),
  label: text("label").notNull(),
  kind: text("kind").notNull(),
  value: integer("value").notNull(),
  referrerName: text("referrer_name"),
  referrerEmail: text("referrer_email"),
  referrerRate: integer("referrer_rate"),
  active: boolean("active").notNull().default(true),
  maxUses: integer("max_uses"),
  uses: integer("uses").notNull().default(0),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const media = pgTable("media", {
  id: text("id").primaryKey(),
  mime: text("mime").notNull(),
  data: text("data").notNull(),
});

export const orderItems = pgTable("order_items", {
  id: text("id").primaryKey(),
  orderId: text("order_id").notNull(),
  productSlug: text("product_slug"),
  name: text("name").notNull(),
  qty: integer("qty").notNull(),
  unitCents: integer("unit_cents").notNull(),
});

export const quotes = pgTable("quotes", {
  id: text("id").primaryKey(),
  number: text("number").notNull(),
  contactName: text("contact_name").notNull(),
  email: text("email").notNull(),
  phone: text("phone"),
  category: text("category").notNull(),
  title: text("title").notNull(),
  status: text("status").notNull(),
  message: text("message"),
  amountHtCents: integer("amount_ht_cents"),
  example: boolean("example").notNull().default(false),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const quoteFields = pgTable("quote_fields", {
  id: text("id").primaryKey(),
  quoteId: text("quote_id").notNull(),
  label: text("label").notNull(),
  value: text("value"),
  required: boolean("required").notNull().default(true),
  sort: integer("sort").notNull().default(0),
});

export const leads = pgTable("leads", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email"),
  phone: text("phone"),
  source: text("source").notNull(),
  status: text("status").notNull(),
  notes: text("notes"),
  example: boolean("example").notNull().default(false),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const revenues = pgTable("revenues", {
  id: text("id").primaryKey(),
  label: text("label").notNull(),
  occurredOn: text("occurred_on").notNull(),
  amountHtCents: integer("amount_ht_cents").notNull(),
  vatRate: integer("vat_rate").notNull(),
  commissionCents: integer("commission_cents").notNull(),
  orderId: text("order_id"),
  voided: boolean("voided").notNull().default(false),
  example: boolean("example").notNull().default(false),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const charges = pgTable("charges", {
  id: text("id").primaryKey(),
  kind: text("kind").notNull(),
  activity: text("activity"),
  label: text("label").notNull(),
  provider: text("provider"),
  reference: text("reference"),
  period: text("period").notNull(),
  amountCents: integer("amount_cents").notNull(),
  paid: boolean("paid").notNull().default(false),
  example: boolean("example").notNull().default(false),
  notes: text("notes"),
});

export type Role = "superadmin" | "atelier" | "client";
export type User = typeof users.$inferSelect;
export type Product = typeof products.$inferSelect;
export type Order = typeof orders.$inferSelect;
export type OrderItem = typeof orderItems.$inferSelect;
export type Quote = typeof quotes.$inferSelect;
export type QuoteField = typeof quoteFields.$inferSelect;
export type Lead = typeof leads.$inferSelect;
export type Revenue = typeof revenues.$inferSelect;
export type Charge = typeof charges.$inferSelect;
