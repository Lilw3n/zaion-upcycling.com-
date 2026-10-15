import { euros } from "@/lib/format";

export function ExampleMark() {
  return <span className="ml-2 inline-block rounded-full bg-sand px-2 py-0.5 align-middle text-[11px] uppercase tracking-wide">Donnée d'exemple</span>;
}

export function MoneyStat({ label, real, withExamples }: { label: string; real: number; withExamples: number }) {
  return (
    <div className="bg-foam p-4">
      <p className="text-xs uppercase tracking-[0.14em] text-ink/50">{label}</p>
      <p className="mt-2 text-2xl font-semibold">{euros(real)}</p>
      <p className="mt-1 text-sm text-ink/60">Avec les données d'exemple : {euros(withExamples)}</p>
    </div>
  );
}
