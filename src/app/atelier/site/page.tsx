import { SiteForm } from "./site-form";
import { readSiteCopy } from "@/lib/site-copy";

export default async function SiteEditorPage() {
  const copy = await readSiteCopy();
  return (
    <div className="mx-auto max-w-3xl space-y-4">
      <h1 className="font-serif text-4xl">Textes du site</h1>
      <p className="text-sm text-ink/70">
        Ces textes apparaissent sur l'accueil, la page atelier, le contact et les univers. Les pièces se modifient dans Pièces. Les mentions légales, le téléphone, l'e-mail et l'adresse du siège restent fixes.
      </p>
      <SiteForm copy={copy} />
    </div>
  );
}
