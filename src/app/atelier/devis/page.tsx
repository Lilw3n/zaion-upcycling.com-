import Link from "next/link";
import { desc } from "drizzle-orm";
import { db } from "@/db";
import { quoteFields, quotes } from "@/db/schema";
import { categoryLabel, euros, formatDate, quoteStatusLabel } from "@/lib/format";
import { NewQuoteForm } from "./new-quote-form";

export default async function QuotesPage() {
  const rows = await db.select().from(quotes).orderBy(desc(quotes.createdAt));
  const fields = await db.select().from(quoteFields);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-serif text-4xl">Devis</h1>
        <p className="mt-2 text-sm text-ink/70">Chaque dossier liste les informations de montage. Une case vide et obligatoire reste à demander.</p>
      </div>
      <NewQuoteForm />
      <div className="overflow-auto">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead className="text-xs uppercase tracking-wide text-ink/50">
            <tr>
              <th className="py-2">Dossier</th>
              <th>Contact</th>
              <th>Univers</th>
              <th>Montage</th>
              <th>Statut</th>
              <th>HT</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((quote) => {
              const own = fields.filter((field) => field.quoteId === quote.id);
              const missing = own.filter((field) => field.required && !field.value).length;
              return (
                <tr key={quote.id} className="border-t border-line">
                  <td className="py-3">
                    <Link href={`/atelier/devis/${quote.id}`} className="font-semibold underline">{quote.number}</Link>
                    <p>{quote.title}</p>
                    <p className="text-xs text-ink/50">{formatDate(quote.createdAt)}</p>
                  </td>
                  <td>{quote.contactName}<br />{quote.email}</td>
                  <td>{categoryLabel[quote.category] ?? quote.category}</td>
                  <td>{missing ? `${missing} manquante${missing > 1 ? "s" : ""}` : "Complet"}</td>
                  <td>{quoteStatusLabel[quote.status] ?? quote.status}</td>
                  <td>{quote.amountHtCents != null ? euros(quote.amountHtCents) : "—"}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
