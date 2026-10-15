import { db } from "@/db";
import { charges } from "@/db/schema";
import { ExampleMark, MoneyStat } from "@/components/example-mark";
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
    real: rows.filter((row) => row.kind === kind && !row.example).reduce((sum, row) => sum + row.amountCents, 0),
    withExamples: rows.filter((row) => row.kind === kind).reduce((sum, row) => sum + row.amountCents, 0),
  }));

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-serif text-4xl">Charges</h1>
        <p className="mt-2 max-w-2xl text-sm text-ink/70">
          Le premier montant est le réel. La ligne suivante ajoute les données d'exemple. Une charge fictive se coche « Donnée d'exemple » et garde ce libellé.
        </p>
      </div>
      <div className="grid gap-3 md:grid-cols-3">
        {grouped.filter((group) => group.kind !== "equipement").map((group) => (
          <MoneyStat key={group.kind} label={chargeKindLabel[group.kind]} real={group.real} withExamples={group.withExamples} />
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
                    <p className="font-medium">{row.label}{row.example && <ExampleMark />}</p>
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
                    <button className="text-xs underline">{row.example ? "Supprimer cette donnée d'exemple" : "Retirer"}</button>
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
