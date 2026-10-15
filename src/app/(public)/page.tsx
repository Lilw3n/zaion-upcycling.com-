import Link from "next/link";
import { eq } from "drizzle-orm";
import { categories } from "@/data/catalogue";
import { db } from "@/db";
import { products } from "@/db/schema";
import { ProductCard } from "@/components/product-card";

export default async function HomePage() {
  const featured = (await db.select().from(products).where(eq(products.active, true))).slice(0, 8);

  return (
    <>
      <section className="relative min-h-[78vh] bg-sea text-white">
        <video className="absolute inset-0 h-full w-full object-cover opacity-70" autoPlay muted loop playsInline poster="/realisations/wing.jpeg">
          <source src="/videos/voile-gonflee.mp4" type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-gradient-to-r from-black/75 via-black/35 to-transparent" />
        <div className="relative mx-auto flex min-h-[78vh] max-w-6xl flex-col justify-end px-4 py-16">
          <p className="text-xs uppercase tracking-[0.28em] text-sand">Textile technique · réemploi</p>
          <h1 className="mt-3 max-w-3xl font-serif text-5xl leading-none md:text-7xl">Faciliter pour durer.</h1>
          <p className="mt-5 max-w-xl text-lg text-white/85">
            Je conçois, répare et transforme voiles, structures gonflables, mobilier et pièces sur mesure. Le réemploi avant le remplacement.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/boutique" className="btn bg-white text-ink hover:bg-sand">Voir les pièces</Link>
            <Link href="/devis" className="btn border border-white bg-transparent">Décrire un projet</Link>
          </div>
        </div>
      </section>

      <section className="mx-auto -mt-8 max-w-6xl px-4">
        <form action="/boutique" className="grid gap-3 bg-foam p-4 shadow-sm md:grid-cols-[1fr_1fr_auto] md:items-end">
          <label className="text-sm">
            De quel univers s'agit-il ?
            <select name="categorie" className="field mt-1">
              <option value="">Tous les univers</option>
              {categories.map((item) => (
                <option key={item.slug} value={item.slug}>{item.label}</option>
              ))}
            </select>
          </label>
          <label className="text-sm">
            Une pièce, une matière, une marque
            <input name="q" className="field mt-1" placeholder="Wing, banquette, housse…" />
          </label>
          <button className="btn h-11">Go</button>
        </form>
      </section>

      <section className="mx-auto mt-16 max-w-6xl px-4">
        <div className="mb-6 flex items-end justify-between">
          <h2 className="font-serif text-4xl">Les univers</h2>
          <Link href="/a-propos" className="text-sm underline">L'atelier</Link>
        </div>
        <div className="grid gap-3 md:grid-cols-5">
          {categories.map((item) => (
            <Link key={item.slug} href={`/univers/${item.slug}`} className="group relative min-h-64 overflow-hidden bg-sea">
              <img src={item.image} alt="" className="absolute inset-0 h-full w-full object-cover opacity-80 transition duration-500 group-hover:scale-105" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/75 to-black/10" />
              <div className="absolute inset-x-0 bottom-0 p-4 text-white">
                <p className="font-serif text-2xl">{item.label}</p>
                <p className="mt-1 text-sm text-white/80">{item.blurb}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className="mx-auto mt-20 max-w-6xl px-4">
        <div className="mb-6 flex items-end justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-ink/50">Boutique</p>
            <h2 className="font-serif text-4xl">Pièces et réparations</h2>
          </div>
          <Link href="/boutique" className="text-sm underline">Tout voir</Link>
        </div>
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          {featured.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      <section className="mx-auto mt-20 grid max-w-6xl gap-10 px-4 md:grid-cols-2 md:items-center">
        <img src="/realisations/abris.jpg" alt="Structure gonflable monumentale" className="aspect-[4/3] w-full object-cover" />
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-ink/50">Terrain</p>
          <h2 className="mt-2 font-serif text-4xl">Une expertise née des voiles, prolongée dans l'industrie.</h2>
          <p className="mt-4 text-ink/80">
            Formée auprès de North Sails et de Wanikou, puis chez Michelin Inflatable Solutions, Zaïon répare et transforme des matières techniques exigeantes. En un an dans l'atelier Michelin, la démarche a réduit 35 % des déchets textiles : 10 % par l'imbrication des découpes, 25 % par un réseau de réemploi.
          </p>
          <p className="mt-4 text-ink/80">
            Captain Néo, 909 Upcycling, La Virgule, l'ENSAV et K-ren prolongent ce travail : une matière peut changer de fonction sans perdre sa valeur.
          </p>
          <Link href="/a-propos" className="btn mt-6">Lire le parcours</Link>
        </div>
      </section>

      <section className="mx-auto mt-20 max-w-6xl px-4">
        <h2 className="font-serif text-4xl">En mouvement</h2>
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <figure className="bg-foam">
            <video controls playsInline poster="/realisations/wing.jpeg" className="aspect-video w-full bg-black object-cover">
              <source src="/videos/voile-gonflee.mp4" type="video/mp4" />
            </video>
            <figcaption className="p-4 text-sm">Voile gonflable — collaboration textile et performance nautique.</figcaption>
          </figure>
          <figure className="bg-foam">
            <video controls playsInline poster="/realisations/kite.png" className="aspect-video w-full bg-black object-cover">
              <source src="/videos/fouling.mp4" type="video/mp4" />
            </video>
            <figcaption className="p-4 text-sm">Housses antifouling, avec K-ren : protéger les coques sans les traiter plus que nécessaire.</figcaption>
          </figure>
        </div>
      </section>

      <section className="mx-auto mt-20 max-w-6xl bg-ink px-6 py-14 text-paper md:px-12">
        <p className="text-xs uppercase tracking-[0.22em] text-sand">Un projet ?</p>
        <h2 className="mt-2 max-w-2xl font-serif text-4xl md:text-5xl">Une voile, une banquette, une structure, une matière à ne pas jeter.</h2>
        <p className="mt-4 max-w-xl text-sand">Décrivez la pièce, ses dimensions et la façon dont elle doit être assemblée. Le devis part de là.</p>
        <Link href="/devis" className="btn mt-8 bg-white text-ink">Parlons-en</Link>
      </section>
    </>
  );
}
