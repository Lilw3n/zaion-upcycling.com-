import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { and, eq } from "drizzle-orm";
import { categories } from "@/data/catalogue";
import { db } from "@/db";
import { products } from "@/db/schema";
import { ProductCard } from "@/components/product-card";
import Link from "next/link";

const stories: Record<string, { title: string; text: string }> = {
  nautisme: {
    title: "Voiles, wings et aménagements de pont",
    text: "Réparation technique de kites, wings, voiles de bateau et de planche, boudins et sellerie. Les chutes de Wanikou et les toiles marines servent autant que possible, avec des coutures et des soudures tenues pour le sel et l'UV.",
  },
  mobilier: {
    title: "Assises, rideaux et habillages",
    text: "Banquettes de restaurant, bains de soleil, transats de yacht, rideaux de cabine. Chaque pièce est prise aux dimensions du lieu, avec le garnissage et la finition qui correspondent à l'usage.",
  },
  evenementiel: {
    title: "Volumes gonflables et scénographie",
    text: "Structures à air capté ou air soufflé, de l'assise au volume de dix mètres. La chenille monumentale, les arches et les abris deviennent sculpture, écran de projection ou mobilier d'un soir.",
  },
  mode: {
    title: "Créer et transformer",
    text: "Robes, retouches, sacoches, bobs et accessoires. Une robe de mariée peut changer de silhouette. Un K-way peut naître d'une chute industrielle.",
  },
  transmission: {
    title: "Apprendre à faire durer",
    text: "Cours particuliers et ateliers : piqueuse, surjeteuse, lecture d'une matière, geste de réparation. L'atelier partagé sert aussi à transmettre.",
  },
};

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const category = categories.find((item) => item.slug === slug);
  return { title: category?.label ?? "Univers" };
}

export default async function UniversePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const category = categories.find((item) => item.slug === slug);
  const story = stories[slug];
  if (!category || !story) notFound();
  const rows = await db.select().from(products).where(and(eq(products.category, slug), eq(products.active, true)));

  return (
    <div>
      <section className="relative min-h-[46vh] bg-sea text-white">
        <img src={category.image} alt="" className="absolute inset-0 h-full w-full object-cover opacity-60" />
        <div className="absolute inset-0 bg-black/40" />
        <div className="relative mx-auto flex min-h-[46vh] max-w-6xl flex-col justify-end px-4 py-12">
          <p className="text-xs uppercase tracking-[0.22em]">Univers</p>
          <h1 className="font-serif text-6xl">{category.label}</h1>
        </div>
      </section>
      <div className="mx-auto max-w-6xl px-4 py-12">
        <h2 className="max-w-3xl font-serif text-4xl">{story.title}</h2>
        <p className="mt-4 max-w-3xl text-lg text-ink/75">{story.text}</p>
        <Link href={`/devis?univers=${slug}`} className="btn mt-6">Devis {category.label.toLowerCase()}</Link>
        <div className="mt-10 grid grid-cols-2 gap-3 lg:grid-cols-4">
          {rows.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </div>
  );
}
