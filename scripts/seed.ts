import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import bcrypt from "bcryptjs";

function loadEnv() {
  const text = readFileSync(resolve(".env.local"), "utf8");
  for (const line of text.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const index = trimmed.indexOf("=");
    if (index === -1) continue;
    const key = trimmed.slice(0, index);
    if (!process.env[key]) process.env[key] = trimmed.slice(index + 1);
  }
}

loadEnv();

async function main() {
  const { neon } = await import("@neondatabase/serverless");
  const { drizzle } = await import("drizzle-orm/neon-http");
  const schema = await import("../src/db/schema");
  const { catalogue } = await import("../src/data/catalogue");
  const sql = neon(process.env.DATABASE_URL!);
  const statements = [
    `CREATE TABLE IF NOT EXISTS users (
      id text PRIMARY KEY,
      email text NOT NULL UNIQUE,
      name text NOT NULL,
      password_hash text NOT NULL,
      role text NOT NULL,
      phone text,
      address text,
      created_at timestamptz NOT NULL DEFAULT now()
    )`,
    `CREATE TABLE IF NOT EXISTS settings (key text PRIMARY KEY, value text NOT NULL)`,
    `CREATE TABLE IF NOT EXISTS products (
      id text PRIMARY KEY,
      slug text NOT NULL UNIQUE,
      name text NOT NULL,
      category text NOT NULL,
      summary text NOT NULL,
      description text NOT NULL,
      price_cents integer,
      compare_at_cents integer,
      image text NOT NULL,
      purchasable boolean NOT NULL DEFAULT true,
      active boolean NOT NULL DEFAULT true
    )`,
    `CREATE TABLE IF NOT EXISTS orders (
      id text PRIMARY KEY,
      number text NOT NULL,
      user_id text,
      customer_name text NOT NULL,
      customer_email text NOT NULL,
      phone text,
      address text,
      status text NOT NULL,
      subtotal_cents integer NOT NULL,
      vat_cents integer NOT NULL,
      total_cents integer NOT NULL,
      commission_cents integer NOT NULL,
      commission_rate integer NOT NULL,
      note text,
      created_at timestamptz NOT NULL DEFAULT now()
    )`,
    `CREATE TABLE IF NOT EXISTS order_items (
      id text PRIMARY KEY,
      order_id text NOT NULL,
      product_slug text,
      name text NOT NULL,
      qty integer NOT NULL,
      unit_cents integer NOT NULL
    )`,
    `CREATE TABLE IF NOT EXISTS quotes (
      id text PRIMARY KEY,
      number text NOT NULL,
      contact_name text NOT NULL,
      email text NOT NULL,
      phone text,
      category text NOT NULL,
      title text NOT NULL,
      status text NOT NULL,
      message text,
      amount_ht_cents integer,
      created_at timestamptz NOT NULL DEFAULT now()
    )`,
    `CREATE TABLE IF NOT EXISTS quote_fields (
      id text PRIMARY KEY,
      quote_id text NOT NULL,
      label text NOT NULL,
      value text,
      required boolean NOT NULL DEFAULT true,
      sort integer NOT NULL DEFAULT 0
    )`,
    `CREATE TABLE IF NOT EXISTS leads (
      id text PRIMARY KEY,
      name text NOT NULL,
      email text,
      phone text,
      source text NOT NULL,
      status text NOT NULL,
      notes text,
      created_at timestamptz NOT NULL DEFAULT now()
    )`,
    `CREATE TABLE IF NOT EXISTS revenues (
      id text PRIMARY KEY,
      label text NOT NULL,
      occurred_on text NOT NULL,
      amount_ht_cents integer NOT NULL,
      vat_rate integer NOT NULL,
      commission_cents integer NOT NULL,
      order_id text,
      voided boolean NOT NULL DEFAULT false,
      created_at timestamptz NOT NULL DEFAULT now()
    )`,
    `CREATE TABLE IF NOT EXISTS charges (
      id text PRIMARY KEY,
      kind text NOT NULL,
      activity text,
      label text NOT NULL,
      provider text,
      reference text,
      period text NOT NULL,
      amount_cents integer NOT NULL,
      paid boolean NOT NULL DEFAULT false,
      notes text
    )`,
  ];
  for (const statement of statements) await sql.query(statement);

  const db = drizzle(sql, { schema });
  const existing = await db.select().from(schema.users).limit(1);
  if (existing.length) {
    console.log("Déjà initialisé.");
    return;
  }

  const adminEmail = process.env.SUPERADMIN_EMAIL || "courtier972@gmail.com";
  const atelierEmail = process.env.ATELIER_EMAIL || "contact@zaion-upcycling.com";
  const clientEmail = process.env.DEMO_CLIENT_EMAIL || "client@zaion-upcycling.com";
  await db.insert(schema.users).values([
    {
      id: "usr_superadmin",
      email: adminEmail,
      name: "Super admin",
      role: "superadmin",
      passwordHash: await bcrypt.hash(process.env.SUPERADMIN_PASSWORD || "change-moi", 10),
    },
    {
      id: "usr_atelier",
      email: atelierEmail,
      name: "Zaïon Naceur",
      role: "atelier",
      phone: "+33614922565",
      passwordHash: await bcrypt.hash(process.env.ATELIER_PASSWORD || "change-moi", 10),
    },
    {
      id: "usr_client",
      email: clientEmail,
      name: "Camille Laurent",
      role: "client",
      phone: "+33601020304",
      address: "12 quai des Belges, 13001 Marseille",
      passwordHash: await bcrypt.hash(process.env.DEMO_CLIENT_PASSWORD || "change-moi", 10),
    },
  ]);

  await db.insert(schema.settings).values([
    { key: "commission_rate", value: "10" },
    { key: "commission_visible", value: "0" },
    { key: "vat_rate", value: "20" },
  ]);

  await db.insert(schema.products).values(
    catalogue.map((item, index) => ({
      id: `prd_${index + 1}`,
      slug: item.slug,
      name: item.name,
      category: item.category,
      summary: item.summary,
      description: item.description,
      priceCents: item.priceCents,
      compareAtCents: item.compareAtCents,
      image: item.image,
      purchasable: item.purchasable,
      active: true,
    })),
  );

  await db.insert(schema.leads).values([
    {
      id: "lead_camille",
      name: "Camille Laurent",
      email: clientEmail,
      phone: "+33601020304",
      source: "visiteur",
      status: "devis",
      notes: "Réparation d'une aile de wing, toile qui se décolle près du bord d'attaque.",
    },
    {
      id: "lead_hotel",
      name: "Hôtel du Port",
      email: "direction@hotel-du-port.example",
      phone: "+33491000000",
      source: "manuel",
      status: "contacte",
      notes: "Banquette de salle, 2,40 m, tissu marine à définir.",
    },
    {
      id: "lead_bruxelles",
      name: "Scénographie Bruxelles",
      email: "prod@scene-bruxelles.example",
      source: "devis",
      status: "gagne",
      notes: "Chenille gonflable pour exposition, air soufflé, rétroprojection.",
    },
  ]);

  await db.insert(schema.quotes).values([
    {
      id: "quo_wing",
      number: "D-2026-0001",
      contactName: "Camille Laurent",
      email: clientEmail,
      phone: "+33601020304",
      category: "nautisme",
      title: "Réparation aile de wing",
      status: "infos",
      message: "Décollement sur le bord d'attaque après une session.",
    },
    {
      id: "quo_banquette",
      number: "D-2026-0002",
      contactName: "Hôtel du Port",
      email: "direction@hotel-du-port.example",
      category: "mobilier",
      title: "Banquette salle 2,40 m",
      status: "envoye",
      amountHtCents: 158333,
      message: "Assise restaurant, usage intensif, antimousse.",
    },
  ]);

  await db.insert(schema.quoteFields).values([
    { id: "fld_1", quoteId: "quo_wing", label: "Matière", value: "Dacron / bladder", required: true, sort: 0 },
    { id: "fld_2", quoteId: "quo_wing", label: "Dimensions", value: "5 m² environ", required: true, sort: 1 },
    { id: "fld_3", quoteId: "quo_wing", label: "Type d'assemblage (couture, soudure HF, collage)", value: null, required: true, sort: 2 },
    { id: "fld_4", quoteId: "quo_wing", label: "Renforts", value: null, required: true, sort: 3 },
    { id: "fld_5", quoteId: "quo_wing", label: "Photos du défaut", value: null, required: true, sort: 4 },
    { id: "fld_6", quoteId: "quo_banquette", label: "Dimensions", value: "240 x 70 x 45 cm", required: true, sort: 0 },
    { id: "fld_7", quoteId: "quo_banquette", label: "Matière", value: "Sunbrella ou chute nautique", required: true, sort: 1 },
    { id: "fld_8", quoteId: "quo_banquette", label: "Type d'assemblage (couture, soudure HF, collage)", value: "Couture + garnissage", required: true, sort: 2 },
    { id: "fld_9", quoteId: "quo_banquette", label: "Quantité", value: "1", required: true, sort: 3 },
  ]);

  await db.insert(schema.orders).values({
    id: "ord_demo",
    number: "Z-2026-0001",
    userId: "usr_client",
    customerName: "Camille Laurent",
    customerEmail: clientEmail,
    phone: "+33601020304",
    address: "12 quai des Belges, 13001 Marseille",
    status: "fabrication",
    subtotalCents: 36750,
    vatCents: 7350,
    totalCents: 44100,
    commissionCents: 3675,
    commissionRate: 10,
    note: "Bob, cours et pouf gonflable.",
  });
  await db.insert(schema.orderItems).values([
    { id: "itm_1", orderId: "ord_demo", productSlug: "chapeau-bob", name: "CHAPEAU / BOB", qty: 1, unitCents: 3500 },
    { id: "itm_2", orderId: "ord_demo", productSlug: "cours-particuliers-ateliers-creatifs", name: "Cours Particuliers & Ateliers Créatifs", qty: 1, unitCents: 1600 },
    { id: "itm_3", orderId: "ord_demo", productSlug: "pouf-gonflable", name: "Pouf gonflable", qty: 1, unitCents: 39000 },
  ]);

  await db.insert(schema.revenues).values([
    {
      id: "rev_demo",
      label: "Commande Z-2026-0001",
      occurredOn: "2026-09-12",
      amountHtCents: 36750,
      vatRate: 20,
      commissionCents: 3675,
      orderId: "ord_demo",
      voided: false,
    },
    {
      id: "rev_banq",
      label: "Banquette Hôtel du Port — acompte",
      occurredOn: "2026-08-20",
      amountHtCents: 79167,
      vatRate: 20,
      commissionCents: 7917,
      voided: false,
    },
    {
      id: "rev_chenille",
      label: "Chenille scénographie — solde",
      occurredOn: "2026-07-03",
      amountHtCents: 477917,
      vatRate: 20,
      commissionCents: 47792,
      voided: false,
    },
  ]);

  await db.insert(schema.charges).values([
    {
      id: "chg_urssaf",
      kind: "urssaf",
      label: "Cotisation URSSAF",
      provider: "URSSAF",
      period: "2026-T3",
      amountCents: 186000,
      paid: false,
      notes: "Montant d'ouverture à remplacer par l'échéance réelle.",
    },
    {
      id: "chg_rc_naut",
      kind: "rc_pro",
      activity: "Nautisme",
      label: "RC Pro — activité nautique",
      provider: "Assureur",
      reference: "4442402N",
      period: "2026",
      amountCents: 0,
      paid: false,
      notes: "Police citée sur la convention d'atelier. Prime à renseigner.",
    },
    {
      id: "chg_rc_mob",
      kind: "rc_pro",
      activity: "Mobilier",
      label: "RC Pro — mobilier et sellerie",
      period: "2026",
      amountCents: 0,
      paid: false,
      notes: "À ventiler par activité.",
    },
    {
      id: "chg_rc_evt",
      kind: "rc_pro",
      activity: "Événementiel",
      label: "RC Pro — structures événementielles",
      period: "2026",
      amountCents: 0,
      paid: false,
      notes: "À ventiler par activité.",
    },
    {
      id: "chg_dmg",
      kind: "dommages",
      label: "Dommages aux biens — atelier et matériel",
      period: "2026",
      amountCents: 0,
      paid: false,
      notes: "Presse, bras long, stock de toile. Montant à renseigner.",
    },
    {
      id: "chg_net",
      kind: "internet",
      label: "Internet atelier",
      period: "2026-10",
      amountCents: 3990,
      paid: true,
      notes: "Exemple mensuel, à ajuster.",
    },
    {
      id: "chg_host",
      kind: "hebergement",
      label: "Hébergement du site et nom de domaine",
      provider: "Vercel / GitHub",
      period: "2026-10",
      amountCents: 2400,
      paid: true,
      notes: "Exemple mensuel, à ajuster.",
    },
    {
      id: "chg_mcg",
      kind: "equipement",
      label: "Machine bras long MCG20001",
      provider: "Michelin Inflatable Solutions",
      reference: "SAJ/2026/0569",
      period: "2026-06",
      amountCents: 379920,
      paid: true,
      notes: "TTC. HT 3 166,00 €, TVA 633,20 €. Échéance 16/07/2026.",
    },
    {
      id: "chg_thimo",
      kind: "equipement",
      label: "Presse de reprise Thimotron + bras long",
      provider: "Michelin Inflatable Solutions",
      reference: "FC883",
      period: "2024-04",
      amountCents: 111120,
      paid: true,
      notes: "TTC. Facture du 18/04/2024. Un devis de reprise Thimotron T2 (HF Développement, D 26 09 1002) est en cours.",
    },
  ]);

  console.log("Base initialisée.");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
