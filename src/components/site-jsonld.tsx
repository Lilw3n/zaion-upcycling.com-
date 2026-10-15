export function SiteJsonLd() {
  const data = {
    "@context": "https://schema.org",
    "@type": "ProfessionalService",
    name: "Zaïon Upcycling",
    url: "https://zaion-upcycling.com",
    image: "https://zaion-upcycling.com/logo.png",
    telephone: "+33614922565",
    email: "contact@zaion-upcycling.com",
    description: "Couture technique, réparation de voiles de kitesurf et wing, sellerie, bâches, toiles d'ombrage, barnums et upcycling textile.",
    areaServed: ["Marseille", "Aubagne", "Bouches-du-Rhône"],
    knowsAbout: ["couture", "kitesurf", "voile", "wingfoil", "sellerie", "bâche", "toile d'ombrage", "barnum", "upcycling"],
    priceRange: "€€",
  };
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }} />;
}
