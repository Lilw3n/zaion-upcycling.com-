import { Backoffice } from "@/components/backoffice";
import { PaymentAlerts } from "@/components/payment-alerts";
import { readSettings } from "@/lib/finance";
import { getSession } from "@/lib/session";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function PilotageLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  if (!session || session.role !== "superadmin") redirect("/connexion?next=/pilotage");
  const settings = await readSettings();
  return (
    <Backoffice session={session} area="pilotage" commissionVisible={settings.commissionVisible}>
      <PaymentAlerts />
      {children}
    </Backoffice>
  );
}
