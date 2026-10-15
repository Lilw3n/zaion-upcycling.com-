import { db } from "@/db";
import { charges } from "@/db/schema";
import { chargeKindLabel, euros } from "@/lib/format";
import { deleteCharge, toggleCharge } from "@/server/actions";
import { ChargeForm } from "./charge-form";

const order = ["urssaf", "rc_pro", "dommages", "internet", "hebergement", "equipement"];

export default async function ChargesPage() {
  const rows = await db.select().from(charges);
  rows.sort((a, b) => order.indexOf(a.kind) - order.indexOf(b.kind));
  const grouped = order.map((kind) => ({
    kind,
    rows: rows.filter((row) => row.kind === kind),
    total: rows.filter((row) => row.kind === kind).reduce((sum, row) => sum + row.amountCents, 0),
  }));

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-serif text-4xl">Charges</h1>
        <p className="mt-2 max-w-2xl text-sm text-ink/70">
          URSSAF, RC Pro par activité, dommages aux biens, internet et hébergement. Les primes à zéro sont des lignes à compléter. La police RC 4442402N est celle citée pour l'activité.
        </p>
      </div>
      <div className="grid gap-3 md:grid-cols-3">
        {grouped.filter((group) => group.kind !== "equipement").map((group) => (
          <div key={group.kind} className="bg-foam p-4">
            <p className="text-xs uppercase tracking-wide text-ink/50">{chargeKindLabel[group.kind]}</p>
            <p className="mt-1 text-2xl font-semibold">{euros(group.total)}</p>
          </div>
        ))}
      </div>
      <ChargeForm />
      <div className="space-y-6">
        {grouped.map((group) => (
          <section key={group.kind}>
            <h2 className="font-semibold">{chargeKindLabel[group.kind]}</h2>
            <div className="mt-2 space-y-2">
              {group.rows.map((row) => (
                <article key={row.id} className="grid gap-2 bg-foam p-4 md:grid-cols-[1.4fr_0.6fr_0.6fr_auto] md:items-center">
                  <div>
                    <p className="font-medium">{row.label}</p>
                    <p className="text-sm text-ink/60">
                      {[row.activity, row.provider, row.reference, row.period].filter(Boolean).join(" · ")}
                    </p>
                    {row.notes && <p className="mt-1 text-sm">{row.notes}</p>}
                  </div>
                  <p className="font-semibold">{row.amountCents ? euros(row.amountCents) : "À renseigner"}</p>
                  <form action={toggleCharge}>
                    <input type="hidden" name="id" value={row.id} />
                    <button className="text-sm underline">{row.paid ? "Payée" : "À payer"}</button>
                  </form>
                  <form action={deleteCharge}>
                    <input type="hidden" name="id" value={row.id} />
                    <button className="text-xs underline">Retirer</button>
                  </form>
                </article>
              ))}
              {!group.rows.length && <p className="text-sm text-ink/50">Aucune ligne.</p>}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
