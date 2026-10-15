import { eq } from "drizzle-orm";
import { categories } from "@/data/catalogue";
import { stories, type StoryBlock } from "@/data/stories";
import { db } from "@/db";
import { settings } from "@/db/schema";

export type SiteCopy = {
  heroKicker: string;
  heroTitle: string;
  heroText: string;
  terrainEyebrow: string;
  terrainTitle: string;
  terrainP1: string;
  terrainP2: string;
  video1: string;
  video2: string;
  closingEyebrow: string;
  closingTitle: string;
  closingText: string;
  aboutKicker: string;
  aboutTitle: string;
  aboutLead: string;
  aboutBody: string;
  contactNote: string;
  universes: Record<string, { blurb: string; kicker: string; title: string; body: string }>;
};

function blocksToText(blocks: StoryBlock[]) {
  return blocks
    .map((block) => {
      if (block.kind === "h") return `# ${block.text}`;
      if (block.kind === "list") return block.items.map((item) => `- ${item}`).join("\n");
      return block.text;
    })
    .join("\n\n");
}

export function textToBlocks(source: string): StoryBlock[] {
  return source
    .replace(/\r\n/g, "\n")
    .split(/\n{2,}/)
    .map((chunk) => chunk.trim())
    .filter(Boolean)
    .map((chunk) => {
      const lines = chunk.split("\n").map((line) => line.trim()).filter(Boolean);
      if (lines.every((line) => line.startsWith("- "))) {
        return { kind: "list" as const, items: lines.map((line) => line.slice(2)) };
      }
      if (lines.length === 1 && lines[0].startsWith("# ")) {
        return { kind: "h" as const, text: lines[0].slice(2) };
      }
      return { kind: "p" as const, text: lines.join(" ") };
    });
}

export function defaultSiteCopy(): SiteCopy {
  return {
    heroKicker: "Textile technique · réemploi",
    heroTitle: "Faciliter pour durer.",
    heroText: "Je conçois, répare et transforme voiles, structures gonflables, mobilier et pièces sur mesure. Le réemploi avant le remplacement.",
    terrainEyebrow: "Terrain",
    terrainTitle: "Une expertise née des voiles, prolongée dans l'industrie.",
    terrainP1: "Formée auprès de North Sails et de Wanikou, puis chez Michelin Inflatable Solutions, Zaïon répare et transforme des matières techniques exigeantes. En un an dans l'atelier Michelin, la démarche a réduit 35 % des déchets textiles : 10 % par l'imbrication des découpes, 25 % par un réseau de réemploi.",
    terrainP2: "Captain Néo, 909 Upcycling, La Virgule, l'ENSAV et K-ren prolongent ce travail : une matière peut changer de fonction sans perdre sa valeur.",
    video1: "Voile gonflable — collaboration textile et performance nautique.",
    video2: "Housses antifouling, avec K-ren : protéger les coques sans les traiter plus que nécessaire.",
    closingEyebrow: "Un projet ?",
    closingTitle: "Une voile, une banquette, une structure, une matière à ne pas jeter.",
    closingText: "Décrivez la pièce, ses dimensions et la façon dont elle doit être assemblée. Le devis part de là.",
    aboutKicker: "Zaïon Upcycling",
    aboutTitle: "Faciliter pour durer",
    aboutLead: "Zaïon Naceur conçoit, répare et transforme des matériaux techniques pour leur donner une seconde vie.",
    aboutBody: [
      "Voiles, structures gonflables, mobilier, textiles techniques : chaque projet part d'une matière existante, d'un usage et d'une contrainte. L'objectif est de faire durer l'existant plutôt que de le remplacer.",
      "Le geste s'est construit chez North Sails et Wanikou, sur la réparation et la transformation des voiles, puis chez Michelin Inflatable Solutions, au cœur des déchets textiles industriels. En un an, l'optimisation des plans de découpe et un écosystème de partenaires ont réduit 35 % des déchets de l'atelier : 10 % en imbriquant des pièces plus petites dans les chutes, 25 % en faisant circuler les matières vers d'autres savoir-faire.",
      "Ce réseau compte notamment Captain Néo, 909 Upcycling, La Virgule, l'ENSAV et K-ren, spécialiste des housses antifouling. Une même toile peut devenir wing, banquette, housse ou volume scénographique.",
      "L'atelier travaille la couture technique et la soudure haute fréquence. Les devis demandent donc la matière, les dimensions, le type d'assemblage, les renforts et les contraintes d'usage avant de chiffrer.",
    ].join("\n\n"),
    contactNote: "Pour un chiffrage avec dimensions et assemblage, le formulaire de devis est plus précis.",
    universes: Object.fromEntries(
      categories.map((item) => {
        const story = stories[item.slug];
        return [item.slug, {
          blurb: item.blurb,
          kicker: story?.kicker ?? "",
          title: story?.title ?? item.label,
          body: story ? blocksToText(story.blocks) : "",
        }];
      }),
    ),
  };
}

function text(value: unknown, fallback: string, max: number) {
  const next = String(value ?? "").replace(/\r\n/g, "\n").trim().slice(0, max);
  return next || fallback;
}

function mergeCopy(saved: Partial<SiteCopy> | null): SiteCopy {
  const base = defaultSiteCopy();
  const universes = saved?.universes ?? {};
  return {
    heroKicker: text(saved?.heroKicker, base.heroKicker, 160),
    heroTitle: text(saved?.heroTitle, base.heroTitle, 180),
    heroText: text(saved?.heroText, base.heroText, 800),
    terrainEyebrow: text(saved?.terrainEyebrow, base.terrainEyebrow, 80),
    terrainTitle: text(saved?.terrainTitle, base.terrainTitle, 220),
    terrainP1: text(saved?.terrainP1, base.terrainP1, 2000),
    terrainP2: text(saved?.terrainP2, base.terrainP2, 2000),
    video1: text(saved?.video1, base.video1, 300),
    video2: text(saved?.video2, base.video2, 300),
    closingEyebrow: text(saved?.closingEyebrow, base.closingEyebrow, 80),
    closingTitle: text(saved?.closingTitle, base.closingTitle, 220),
    closingText: text(saved?.closingText, base.closingText, 600),
    aboutKicker: text(saved?.aboutKicker, base.aboutKicker, 80),
    aboutTitle: text(saved?.aboutTitle, base.aboutTitle, 180),
    aboutLead: text(saved?.aboutLead, base.aboutLead, 500),
    aboutBody: text(saved?.aboutBody, base.aboutBody, 8000),
    contactNote: text(saved?.contactNote, base.contactNote, 500),
    universes: Object.fromEntries(
      categories.map((item) => {
        const fallback = base.universes[item.slug];
        const row = universes[item.slug] ?? {};
        return [item.slug, {
          blurb: text(row.blurb, fallback.blurb, 240),
          kicker: text(row.kicker, fallback.kicker, 240),
          title: text(row.title, fallback.title, 220),
          body: text(row.body, fallback.body, 12000),
        }];
      }),
    ),
  };
}

export async function readSiteCopy() {
  const rows = await db.select().from(settings).where(eq(settings.key, "site_copy"));
  if (!rows[0]) return defaultSiteCopy();
  try {
    return mergeCopy(JSON.parse(rows[0].value) as Partial<SiteCopy>);
  } catch {
    return defaultSiteCopy();
  }
}

export function copyFromForm(formData: FormData) {
  const base = defaultSiteCopy();
  const universes = Object.fromEntries(
      categories.map((item) => [item.slug, {
      blurb: String(formData.get(`u_${item.slug}_blurb`) ?? ""),
      kicker: String(formData.get(`u_${item.slug}_kicker`) ?? ""),
      title: String(formData.get(`u_${item.slug}_title`) ?? ""),
      body: String(formData.get(`u_${item.slug}_body`) ?? ""),
    }]),
  );
  return mergeCopy({
    heroKicker: String(formData.get("heroKicker") ?? ""),
    heroTitle: String(formData.get("heroTitle") ?? ""),
    heroText: String(formData.get("heroText") ?? ""),
    terrainEyebrow: String(formData.get("terrainEyebrow") ?? ""),
    terrainTitle: String(formData.get("terrainTitle") ?? ""),
    terrainP1: String(formData.get("terrainP1") ?? ""),
    terrainP2: String(formData.get("terrainP2") ?? ""),
    video1: String(formData.get("video1") ?? ""),
    video2: String(formData.get("video2") ?? ""),
    closingEyebrow: String(formData.get("closingEyebrow") ?? ""),
    closingTitle: String(formData.get("closingTitle") ?? ""),
    closingText: String(formData.get("closingText") ?? ""),
    aboutKicker: String(formData.get("aboutKicker") ?? ""),
    aboutTitle: String(formData.get("aboutTitle") ?? ""),
    aboutLead: String(formData.get("aboutLead") ?? ""),
    aboutBody: String(formData.get("aboutBody") ?? ""),
    contactNote: String(formData.get("contactNote") ?? ""),
    universes,
  });
}
