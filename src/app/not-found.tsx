import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-xl px-4 py-24">
      <h1 className="font-serif text-5xl">Page introuvable</h1>
      <Link href="/" className="btn mt-6">Retour à l'accueil</Link>
    </div>
  );
}
