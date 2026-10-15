import { desc } from "drizzle-orm";
import { db } from "@/db";
import { ensureCatalog } from "@/db/ensure";
import { promos } from "@/db/schema";
import { euros } from "@/lib/format";
import { deletePromo, setPromoActive } from "@/server/actions";
import { OfferForm } from "./offer-form";

const kindLabel: Record<string, string> = {
  percent: "Pourcentage",
  amount: "Montant",
  referral: "Parrainage",
};

export default async function OffersPage() {
  await ensureCatalog();
  const rows = await db.select().from(promos).orderBy(desc(promos.createdAt));
  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="font-serif text-4xl">Promos et parrainage</h1>
        <p className="mt-2 text-sm text-ink/70">
          Le client saisit le code au moment de la commande. Une promo baisse le total. Un parrainage baisse le total et note la part à reverser au parrain.
        </p>
      </div>
      <OfferForm />
      <div className="space-y-3">
        {rows.map((promo) => (
          <article key={promo.id} className="bg-foam p-4">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="font-semibold">{promo.code} · {promo.label}</p>
                <p className="text-sm text-ink/70">
                  {kindLabel[promo.kind] ?? promo.kind}
                  {" · "}
                  {promo.kind === "amount" ? `${euros(promo.value)} de remise` : `${promo.value} % pour le client`}
                  {promo.kind === "referral" ? ` · ${promo.referrerName}, ${promo.referrerRate ?? 0} % du HT` : ""}
                </p>
                <p className="text-sm text-ink/60">
                  {promo.uses} utilisation{promo.uses > 1 ? "s" : ""}
                  {promo.maxUses != null ? ` sur ${promo.maxUses}` : ""}
                  {" · "}
                  {promo.active ? "actif" : "arrêté"}
                </p>
              </div>
              <div className="flex gap-3">
                <form action={setPromoActive}>
                  <input type="hidden" name="id" value={promo.id} />
                  <input type="hidden" name="active" value={promo.active ? "0" : "1"} />
                  <button className="text-sm underline">{promo.active ? "Arrêter" : "Réactiver"}</button>
                </form>
                <form action={deletePromo}>
                  <input type="hidden" name="id" value={promo.id} />
                  <button className="text-sm text-rust underline">Supprimer</button>
                </form>
              </div>
            </div>
          </article>
        ))}
        {!rows.length && <p className="text-sm text-ink/60">Aucun code pour le moment.</p>}
      </div>
    </div>
  );
}
