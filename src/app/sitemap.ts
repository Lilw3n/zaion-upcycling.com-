import type { MetadataRoute } from "next";
import { eq } from "drizzle-orm";
import { categories } from "@/data/catalogue";
import { db } from "@/db";
import { ensureCatalog } from "@/db/ensure";
import { products } from "@/db/schema";

const site = "https://zaion-upcycling.com";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  await ensureCatalog();
  const pages = ["", "/boutique", "/a-propos", "/contact", "/devis", "/partenaires", "/mentions-legales", "/cgv", "/politique-de-confidentialite", "/cookies"];
  const rows = await db.select({ slug: products.slug }).from(products).where(eq(products.active, true));
  const now = new Date();
  return [
    ...pages.map((path) => ({ url: `${site}${path || "/"}`, lastModified: now })),
    ...categories.map((item) => ({ url: `${site}/univers/${item.slug}`, lastModified: now })),
    ...rows.map((item) => ({ url: `${site}/produit/${item.slug}`, lastModified: now })),
  ];
}
