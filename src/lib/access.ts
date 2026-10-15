import type { Role } from "@/db/schema";

const superadmins = ["courtier972@gmail.com", "wendy.buchet.pro@gmail.com"];
const admins = ["contact@zaion-upcycling.com", "zaion.naceur@gmail.com"];

export const staffAccounts: { email: string; name: string; role: Role }[] = [
  { email: "courtier972@gmail.com", name: "Wendy Buchet", role: "superadmin" },
  { email: "wendy.buchet.pro@gmail.com", name: "Wendy Buchet", role: "superadmin" },
  { email: "contact@zaion-upcycling.com", name: "Zaïon Naceur", role: "atelier" },
  { email: "zaion.naceur@gmail.com", name: "Zaïon Naceur", role: "atelier" },
];

export function roleForEmail(email: string): Role {
  const value = email.toLowerCase();
  if (superadmins.includes(value)) return "superadmin";
  if (admins.includes(value)) return "atelier";
  return "client";
}
