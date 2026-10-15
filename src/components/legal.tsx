import Link from "next/link";

export function Legal({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <article className="mx-auto max-w-3xl px-4 py-12">
      <p className="text-xs uppercase tracking-[0.18em] text-ink/50">Zaïon Upcycling</p>
      <h1 className="mt-2 font-serif text-5xl">{title}</h1>
      <div className="mt-8 space-y-4 text-[15px] leading-relaxed text-ink/85 [&_h2]:pt-4 [&_h2]:font-serif [&_h2]:text-2xl [&_h2]:text-ink [&_ul]:list-disc [&_ul]:space-y-1 [&_ul]:pl-5">
        {children}
      </div>
      <p className="mt-10 flex flex-wrap gap-4 text-sm">
        <Link className="underline" href="/mentions-legales">Mentions légales</Link>
        <Link className="underline" href="/cgv">CGV</Link>
        <Link className="underline" href="/politique-de-confidentialite">Confidentialité</Link>
        <Link className="underline" href="/cookies">Cookies</Link>
      </p>
    </article>
  );
}
