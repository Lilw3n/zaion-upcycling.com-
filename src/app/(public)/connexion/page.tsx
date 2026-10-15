import type { Metadata } from "next";
import { googleReady, ionosReady } from "@/lib/providers";
import { LoginForms } from "./login-forms";

export const metadata: Metadata = { title: "Connexion" };

export default function LoginPage() {
  return (
    <div className="mx-auto max-w-md px-4 py-16">
      <h1 className="font-serif text-5xl">Connexion</h1>
      <p className="mt-3 text-ink/70">Clients, atelier et pilotage utilisent la même porte : mot de passe, code par e-mail ou Google.</p>
      <LoginForms googleReady={googleReady()} ionosReady={ionosReady()} />
    </div>
  );
}
