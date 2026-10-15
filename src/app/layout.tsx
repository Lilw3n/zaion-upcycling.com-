import type { Metadata } from "next";
import { Fraunces, Outfit } from "next/font/google";
import Script from "next/script";
import { CartProvider } from "@/components/cart-provider";
import "./globals.css";

const GTM_ID = "GTM-MB75LQ4V";

const outfit = Outfit({ subsets: ["latin"], variable: "--font-outfit" });
const fraunces = Fraunces({ subsets: ["latin"], variable: "--font-fraunces" });

export const metadata: Metadata = {
  metadataBase: new URL("https://zaion-upcycling.com"),
  title: { default: "Zaïon Upcycling — couture, voile et upcycling", template: "%s — Zaïon Upcycling" },
  description: "Atelier de couture technique : réparation de voile de kitesurf et wing, sellerie, bâche, toile d'ombrage, barnum et upcycling textile, à Marseille et en Bouches-du-Rhône.",
  keywords: ["upcycling", "couture", "kitesurf", "voile", "wing", "sellerie", "barnum", "toile d'ombrage", "bâche", "Marseille", "Aubagne"],
  openGraph: {
    title: "Zaïon Upcycling — couture, voile et upcycling",
    description: "Réparation et création textile : kitesurf, wing, sellerie, bâches, toiles d'ombrage et barnums.",
    locale: "fr_FR",
    type: "website",
    url: "https://zaion-upcycling.com",
  },
  alternates: { canonical: "/" },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body className={`${outfit.variable} ${fraunces.variable} font-sans antialiased`}>
        <Script id="google-tag-manager" strategy="beforeInteractive">
          {`(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','${GTM_ID}');`}
        </Script>
        <noscript>
          <iframe
            src={`https://www.googletagmanager.com/ns.html?id=${GTM_ID}`}
            height="0"
            width="0"
            style={{ display: "none", visibility: "hidden" }}
          />
        </noscript>
        <CartProvider>{children}</CartProvider>
      </body>
    </html>
  );
}
