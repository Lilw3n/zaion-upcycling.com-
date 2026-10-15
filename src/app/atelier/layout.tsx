import { Backoffice } from "@/components/backoffice";
import { PaymentAlerts } from "@/components/payment-alerts";
import { readSettings } from "@/lib/finance";
import { getSession } from "@/lib/session";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function AtelierLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  if (!session || (session.role !== "atelier" && session.role !== "superadmin")) redirect("/connexion?next=/atelier");
  const settings = await readSettings();
  return (
    <Backoffice session={session} area="atelier" commissionVisible={settings.commissionVisible}>
      <PaymentAlerts />
      {children}
    </Backoffice>
  );
}
