import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/atelier", "/pilotage", "/compte", "/api", "/connexion", "/inscription"],
    },
    sitemap: "https://zaion-upcycling.com/sitemap.xml",
  };
}
