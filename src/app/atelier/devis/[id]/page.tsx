import Link from "next/link";
import { notFound } from "next/navigation";
import { asc, eq } from "drizzle-orm";
import { db } from "@/db";
import { quoteFields, quotes } from "@/db/schema";
import { addQuoteField, deleteQuoteField, saveQuoteField, updateQuote } from "@/server/actions";
import { quoteStatusLabel } from "@/lib/format";

export default async function QuoteDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [quote] = await db.select().from(quotes).where(eq(quotes.id, id));
  if (!quote) notFound();
  const fields = await db.select().from(quoteFields).where(eq(quoteFields.quoteId, id)).orderBy(asc(quoteFields.sort));
  const missing = fields.filter((field) => field.required && !field.value);

  return (
    <div className="space-y-8">
      <div>
        <Link href="/atelier/devis" className="text-sm underline">Tous les devis</Link>
        <h1 className="mt-2 font-serif text-4xl">{quote.number}</h1>
        <p className="text-ink/60">{quote.contactName} · {quote.email} {quote.phone ? `· ${quote.phone}` : ""}</p>
      </div>

      {missing.length > 0 && (
        <div className="border border-rust/40 bg-white p-4 text-sm">
          <p className="font-semibold">Informations de montage encore à demander</p>
          <ul className="mt-2 list-disc pl-5">
            {missing.map((field) => <li key={field.id}>{field.label}</li>)}
          </ul>
        </div>
      )}

      <form action={updateQuote} className="grid gap-3 bg-foam p-4 md:grid-cols-2">
        <input type="hidden" name="id" value={quote.id} />
        <label className="text-sm md:col-span-2">Objet<input name="title" defaultValue={quote.title} className="field mt-1" /></label>
        <label className="text-sm">
          Statut
          <select name="status" defaultValue={quote.status} className="field mt-1">
            {Object.entries(quoteStatusLabel).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
          </select>
        </label>
        <label className="text-sm">
          Montant HT (€)
          <input name="amount" defaultValue={quote.amountHtCents != null ? (quote.amountHtCents / 100).toFixed(2) : ""} className="field mt-1" />
        </label>
        <label className="text-sm md:col-span-2">Message<textarea name="message" defaultValue={quote.message ?? ""} className="field mt-1 min-h-24" /></label>
        <button className="btn">Enregistrer le devis</button>
      </form>

      <section className="space-y-3">
        <h2 className="font-semibold">Grille de montage</h2>
        {fields.map((field) => (
          <form key={field.id} action={saveQuoteField} className="grid gap-2 bg-foam p-3 md:grid-cols-[1fr_1.4fr_auto_auto] md:items-end">
            <input type="hidden" name="id" value={field.id} />
            <input type="hidden" name="quoteId" value={quote.id} />
            <label className="text-xs">Question<input name="label" defaultValue={field.label} className="field mt-1" /></label>
            <label className="text-xs">Réponse<input name="value" defaultValue={field.value ?? ""} className={`field mt-1 ${field.required && !field.value ? "border-rust" : ""}`} /></label>
            <label className="flex items-center gap-2 text-xs"><input type="checkbox" name="required" defaultChecked={field.required} /> Obligatoire</label>
            <div className="flex gap-2">
              <button className="btn px-3 py-2 text-xs">Sauver</button>
            </div>
          </form>
        ))}
        {fields.map((field) => (
          <form key={`${field.id}-del`} action={deleteQuoteField} className="-mt-2 text-right">
            <input type="hidden" name="id" value={field.id} />
            <input type="hidden" name="quoteId" value={quote.id} />
            <button className="text-xs underline text-ink/50">Retirer « {field.label} »</button>
          </form>
        ))}
      </section>

      <form action={addQuoteField} className="grid gap-3 bg-sand p-4 md:grid-cols-[1fr_1fr_auto]">
        <input type="hidden" name="quoteId" value={quote.id} />
        <input name="label" required placeholder="Nouvelle question de montage" className="field" />
        <input name="value" placeholder="Réponse, si déjà connue" className="field" />
        <label className="flex items-center gap-2 text-sm"><input type="checkbox" name="required" defaultChecked /> À demander</label>
        <button className="btn md:col-span-3">Ajouter une information</button>
      </form>
    </div>
  );
}
