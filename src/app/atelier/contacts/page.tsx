import { desc } from "drizzle-orm";
import { db } from "@/db";
import { leads } from "@/db/schema";
import { formatDate, leadStatusLabel } from "@/lib/format";
import { deleteLead } from "@/server/actions";
import { LeadForm } from "./lead-form";

export default async function ContactsPage() {
  const rows = await db.select().from(leads).orderBy(desc(leads.createdAt));
  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-serif text-4xl">Contacts</h1>
        <p className="mt-2 text-sm text-ink/70">Visiteurs, demandes de devis et clients qui commandent.</p>
      </div>
      <LeadForm />
      <div className="space-y-3">
        {rows.map((lead) => (
          <details key={lead.id} className="bg-foam p-4">
            <summary className="cursor-pointer">
              <span className="font-semibold">{lead.name}</span>
              <span className="ml-3 text-sm text-ink/60">{leadStatusLabel[lead.status] ?? lead.status} · {lead.source} · {formatDate(lead.createdAt)}</span>
            </summary>
            <div className="mt-4">
              <LeadForm lead={lead} />
              <form action={deleteLead} className="mt-2">
                <input type="hidden" name="id" value={lead.id} />
                <button className="text-xs underline">Retirer ce contact</button>
              </form>
            </div>
          </details>
        ))}
      </div>
    </div>
  );
}
