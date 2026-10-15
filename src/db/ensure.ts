import { neon } from "@neondatabase/serverless";
import bcrypt from "bcryptjs";
import { randomBytes } from "node:crypto";
import { eq, sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/neon-http";
import { staffAccounts } from "@/lib/access";
import * as schema from "./schema";
import { users } from "./schema";

const url = process.env.DATABASE_URL;
if (!url) throw new Error("DATABASE_URL manquant");
const db = drizzle(neon(url), { schema });

let catalogReady: Promise<void> | null = null;

export function ensureCatalog() {
  catalogReady ??= (async () => {
    await db.execute(sql`ALTER TABLE products ADD COLUMN IF NOT EXISTS price_ht_cents integer`);
    await db.execute(sql`ALTER TABLE products ADD COLUMN IF NOT EXISTS price_basis text DEFAULT 'ttc'`);
    await db.execute(sql`ALTER TABLE products ADD COLUMN IF NOT EXISTS unit text`);
    await db.execute(sql`ALTER TABLE orders ADD COLUMN IF NOT EXISTS atelier_note text`);
    await db.execute(sql`ALTER TABLE orders ADD COLUMN IF NOT EXISTS payment_ref text`);
    await db.execute(sql`ALTER TABLE orders ADD COLUMN IF NOT EXISTS promo_code text`);
    await db.execute(sql`ALTER TABLE orders ADD COLUMN IF NOT EXISTS discount_cents integer NOT NULL DEFAULT 0`);
    await db.execute(sql`ALTER TABLE orders ADD COLUMN IF NOT EXISTS referral_credit_cents integer NOT NULL DEFAULT 0`);
    await db.execute(sql`ALTER TABLE orders ADD COLUMN IF NOT EXISTS referrer_name text`);
    await db.execute(sql`ALTER TABLE orders ADD COLUMN IF NOT EXISTS example boolean NOT NULL DEFAULT false`);
    await db.execute(sql`ALTER TABLE orders ADD COLUMN IF NOT EXISTS checkout_session text`);
    await db.execute(sql`ALTER TABLE orders ADD COLUMN IF NOT EXISTS payment_alert boolean NOT NULL DEFAULT false`);
    await db.execute(sql`ALTER TABLE revenues ADD COLUMN IF NOT EXISTS example boolean NOT NULL DEFAULT false`);
    await db.execute(sql`ALTER TABLE charges ADD COLUMN IF NOT EXISTS example boolean NOT NULL DEFAULT false`);
    await db.execute(sql`ALTER TABLE leads ADD COLUMN IF NOT EXISTS example boolean NOT NULL DEFAULT false`);
    await db.execute(sql`ALTER TABLE quotes ADD COLUMN IF NOT EXISTS example boolean NOT NULL DEFAULT false`);
    await db.execute(sql`UPDATE orders SET example = true WHERE id = 'ord_demo'`);
    await db.execute(sql`UPDATE revenues SET example = true WHERE id IN ('rev_demo', 'rev_banq', 'rev_chenille')`);
    await db.execute(sql`UPDATE charges SET example = true WHERE id IN ('chg_urssaf', 'chg_rc_naut', 'chg_rc_mob', 'chg_rc_evt', 'chg_dmg', 'chg_net', 'chg_host')`);
    await db.execute(sql`UPDATE leads SET example = true WHERE id IN ('lead_camille', 'lead_hotel', 'lead_bruxelles')`);
    await db.execute(sql`UPDATE quotes SET example = true WHERE id IN ('quo_wing', 'quo_banquette')`);
    await db.execute(sql`CREATE TABLE IF NOT EXISTS promos (
      id text PRIMARY KEY,
      code text NOT NULL UNIQUE,
      label text NOT NULL,
      kind text NOT NULL,
      value integer NOT NULL,
      referrer_name text,
      referrer_email text,
      referrer_rate integer,
      active boolean NOT NULL DEFAULT true,
      max_uses integer,
      uses integer NOT NULL DEFAULT 0,
      created_at timestamptz NOT NULL DEFAULT now()
    )`);
    await db.execute(sql`CREATE TABLE IF NOT EXISTS media (
      id text PRIMARY KEY,
      mime text NOT NULL,
      data text NOT NULL
    )`);
  })();
  return catalogReady;
}

let ready: Promise<void> | null = null;

export function ensureAuthSchema() {
  ready ??= (async () => {
    await db.execute(sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS google_sub text`);
    await db.execute(sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS auth_provider text DEFAULT 'password'`);
    await db.execute(sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS email_verified boolean NOT NULL DEFAULT true`);
    await db.execute(sql`CREATE UNIQUE INDEX IF NOT EXISTS users_google_sub_unique ON users (google_sub)`);
    await db.execute(sql`CREATE TABLE IF NOT EXISTS auth_tokens (
      id text PRIMARY KEY,
      email text NOT NULL,
      token_hash text NOT NULL,
      purpose text NOT NULL,
      expires_at timestamptz NOT NULL,
      used boolean NOT NULL DEFAULT false
    )`);
    await db.execute(sql`ALTER TABLE auth_tokens ADD COLUMN IF NOT EXISTS payload text`);
    await db.execute(sql`ALTER TABLE auth_tokens ADD COLUMN IF NOT EXISTS attempts integer NOT NULL DEFAULT 0`);

    for (const account of staffAccounts) {
      const [existing] = await db.select().from(users).where(eq(users.email, account.email));
      if (!existing) {
        await db.insert(users).values({
          id: `usr_${crypto.randomUUID().slice(0, 10)}`,
          email: account.email,
          name: account.name,
          role: account.role,
          emailVerified: true,
          authProvider: "password",
          passwordHash: await bcrypt.hash(randomBytes(24).toString("hex"), 10),
        });
        continue;
      }
      if (existing.role !== account.role || !existing.emailVerified) {
        await db.update(users).set({ role: account.role, emailVerified: true }).where(eq(users.id, existing.id));
      }
    }
  })();
  return ready;
}
