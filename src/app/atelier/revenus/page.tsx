import { desc } from "drizzle-orm";
import { db } from "@/db";
import { revenues } from "@/db/schema";
import { euros } from "@/lib/format";
import { readSettings, summarize } from "@/lib/finance";
import { deleteRevenue } from "@/server/actions";
import { RevenueForm } from "./revenue-form";

export default async function RevenuesPage() {
  const rows = await db.select().from(revenues).orderBy(desc(revenues.occurredOn));
  const settings = await readSettings();
  const stats = summarize(rows, []);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-serif text-4xl">Revenus</h1>
        <p className="mt-2 max-w-2xl text-sm text-ink/70">
          Chiffre d'affaires hors taxes, TVA et TTC. Les commandes confirmées arrivent ici. Une commande annulée est retirée des totaux.
        </p>
      </div>
      <div className="grid gap-3 md:grid-cols-3">
        <Tile label="CA HT" value={euros(stats.ht)} />
        <Tile label="TVA" value={euros(stats.vat)} />
        <Tile label="CA TTC" value={euros(stats.ttc)} />
      </div>
      {settings.commissionVisible && (
        <div className="grid gap-3 md:grid-cols-2">
          <Tile label="Part partenaire" value={euros(stats.commission)} />
          <Tile label="Activité après part" value={euros(stats.afterCommission)} />
        </div>
      )}
      <RevenueForm vatRate={settings.vatRate} />
      <div className="overflow-auto">
        <table className="w-full min-w-[680px] text-left text-sm">
          <thead className="text-xs uppercase tracking-wide text-ink/50">
            <tr>
              <th className="py-2">Date</th>
              <th>Libellé</th>
              <th>HT</th>
              <th>TVA</th>
              <th>TTC</th>
              {settings.commissionVisible && <th>Part</th>}
              <th></th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => {
              const vat = Math.round((row.amountHtCents * row.vatRate) / 100);
              return (
                <tr key={row.id} className={`border-t border-line ${row.voided ? "text-ink/40 line-through" : ""}`}>
                  <td className="py-3">{row.occurredOn}</td>
                  <td>{row.label}</td>
                  <td>{euros(row.amountHtCents)}</td>
                  <td>{euros(vat)} <span className="text-xs">({row.vatRate} %)</span></td>
                  <td>{euros(row.amountHtCents + vat)}</td>
                  {settings.commissionVisible && <td>{euros(row.commissionCents)}</td>}
                  <td>
                    <form action={deleteRevenue}>
                      <input type="hidden" name="id" value={row.id} />
                      <button className="text-xs underline">Retirer</button>
                    </form>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function Tile({ label, value }: { label: string; value: string }) {
  return <div className="bg-foam p-4"><p className="text-xs uppercase tracking-wide text-ink/50">{label}</p><p className="mt-1 text-2xl font-semibold">{value}</p></div>;
}
