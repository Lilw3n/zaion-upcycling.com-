"use client";

import { useActionState, useState } from "react";
import { requestClientPayment, staffPaymentLink, type ActionState } from "@/server/actions";

export function PaymentRequestForm({ clients }: { clients: { id: string; name: string; email: string }[] }) {
  const [state, action, pending] = useActionState(requestClientPayment, null as ActionState);
  const [clientId, setClientId] = useState(clients[0]?.id ?? "nouveau");
  const chosen = clients.find((client) => client.id === clientId);

  return (
    <form action={action} className="grid gap-3 bg-foam p-4 md:grid-cols-2">
      <div className="md:col-span-2">
        <h2 className="font-semibold">Envoyer un paiement Stripe</h2>
        <p className="mt-1 text-sm text-ink/70">Le lien se rattache à un client déjà créé, ou en crée un avec le nom et l'e-mail. Le montant entre dans le réel seulement après le paiement.</p>
      </div>
      <label className="text-sm">
        Client
        <select name="clientId" value={clientId} onChange={(event) => setClientId(event.target.value)} className="field mt-1">
          {clients.map((client) => (
            <option key={client.id} value={client.id}>{client.name} · {client.email}</option>
          ))}
          <option value="nouveau">Nouveau client</option>
        </select>
      </label>
      <label className="text-sm">
        Montant TTC (€)
        <input name="amount" inputMode="decimal" required placeholder="120,00" className="field mt-1" />
      </label>
      <label className="text-sm">
        Nom
        <input name="name" defaultValue={chosen?.name ?? ""} key={`name-${clientId}`} required={clientId === "nouveau"} className="field mt-1" readOnly={clientId !== "nouveau"} />
      </label>
      <label className="text-sm">
        E-mail
        <input name="email" type="email" defaultValue={chosen?.email ?? ""} key={`email-${clientId}`} required={clientId === "nouveau"} className="field mt-1" readOnly={clientId !== "nouveau"} />
      </label>
      <label className="text-sm md:col-span-2">
        Libellé
        <input name="label" required placeholder="Acompte banquette, réparation voile…" className="field mt-1" />
      </label>
      <div className="md:col-span-2">
        <button className="btn" disabled={pending}>{pending ? "Ouverture…" : "Créer le lien Stripe"}</button>
        {state?.error && <p className="mt-2 text-sm text-rust">{state.error}</p>}
        {state?.ok && <p className="mt-2 text-sm text-moss">{state.ok}</p>}
        {state?.paymentUrl && <StripeLinkBar url={state.paymentUrl} />}
      </div>
    </form>
  );
}

export function PaymentLinkButton({ orderId }: { orderId: string }) {
  const [state, action, pending] = useActionState(staffPaymentLink, null as ActionState);
  return (
    <form action={action} className="mt-3">
      <input type="hidden" name="id" value={orderId} />
      <button className="btn" disabled={pending}>{pending ? "Ouverture…" : "Lien Stripe à envoyer"}</button>
      {state?.error && <p className="mt-2 text-sm text-rust">{state.error}</p>}
      {state?.paymentUrl && <StripeLinkBar url={state.paymentUrl} />}
    </form>
  );
}

function StripeLinkBar({ url }: { url: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <div className="mt-3 flex flex-wrap items-center gap-2">
      <a className="btn" href={url} target="_blank" rel="noopener noreferrer">Ouvrir</a>
      <button
        type="button"
        className="btn"
        onClick={async () => {
          await navigator.clipboard.writeText(url);
          setCopied(true);
        }}
      >
        {copied ? "Copié" : "Copier"}
      </button>
      <input readOnly value={url} className="field min-w-0 flex-1" onFocus={(event) => event.currentTarget.select()} />
    </div>
  );
}
