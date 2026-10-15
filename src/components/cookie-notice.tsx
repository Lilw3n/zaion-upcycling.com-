"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

export function CookieNotice() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setOpen(localStorage.getItem("zaion-cookie-ok") !== "1");
  }, []);

  if (!open) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-50 border-t border-line bg-foam px-4 py-4 shadow-lg">
      <div className="mx-auto flex max-w-6xl flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <p className="text-sm text-ink/80">
          Un cookie de session sert à vous reconnaître quand vous êtes connecté. Le panier reste dans votre navigateur. Google Tag Manager mesure la visite selon les balises du conteneur.{" "}
          <Link href="/cookies" className="underline">Voir le détail</Link>
        </p>
        <button
          className="btn shrink-0"
          onClick={() => {
            localStorage.setItem("zaion-cookie-ok", "1");
            setOpen(false);
          }}
        >
          Compris
        </button>
      </div>
    </div>
  );
}
