import type { Metadata } from "next";
import { Fraunces, Outfit } from "next/font/google";
import { CartProvider } from "@/components/cart-provider";
import "./globals.css";

const outfit = Outfit({ subsets: ["latin"], variable: "--font-outfit" });
const fraunces = Fraunces({ subsets: ["latin"], variable: "--font-fraunces" });

export const metadata: Metadata = {
  title: { default: "Zaïon Upcycling — Faciliter pour durer", template: "%s — Zaïon Upcycling" },
  description: "Création, réparation et réemploi de voiles, structures gonflables, mobilier et textiles techniques.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body className={`${outfit.variable} ${fraunces.variable} font-sans antialiased`}>
        <CartProvider>{children}</CartProvider>
      </body>
    </html>
  );
}
