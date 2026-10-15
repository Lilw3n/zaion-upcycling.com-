import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { and, eq } from "drizzle-orm";
import { categories } from "@/data/catalogue";
import { stories } from "@/data/stories";
import { db } from "@/db";
import { products } from "@/db/schema";
import { ProductCard } from "@/components/product-card";
import Link from "next/link";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const category = categories.find((item) => item.slug === slug);
  return { title: category?.label ?? "Univers", description: stories[slug]?.kicker };
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
          <p className="mt-3 max-w-2xl text-lg text-white/85">{story.kicker}</p>
        </div>
      </section>
      <div className="mx-auto max-w-6xl px-4 py-12">
        <h2 className="max-w-3xl font-serif text-4xl">{story.title}</h2>
        <div className="mt-6 max-w-3xl space-y-4 text-ink/80">
          {story.blocks.map((block, index) => {
            if (block.kind === "h") return <h3 key={index} className="pt-4 font-serif text-2xl text-ink">{block.text}</h3>;
            if (block.kind === "list") {
              return (
                <ul key={index} className="list-disc space-y-1 pl-5">
                  {block.items.map((item) => <li key={item}>{item}</li>)}
                </ul>
              );
            }
            return <p key={index}>{block.text}</p>;
          })}
        </div>
        <Link href={`/devis?univers=${slug}`} className="btn mt-8">Devis {category.label.toLowerCase()}</Link>
        <h2 className="mt-14 font-serif text-3xl">Les pièces</h2>
        <div className="mt-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
          {rows.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
        {!rows.length && <p className="mt-6 text-ink/70">Les pièces de cet univers se chiffrent sur devis.</p>}
      </div>
    </div>
  );
}
