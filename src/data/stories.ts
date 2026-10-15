export type StoryBlock =
  | { kind: "p"; text: string }
  | { kind: "h"; text: string }
  | { kind: "list"; items: string[] };

export const stories: Record<string, { kicker: string; title: string; blocks: StoryBlock[] }> = {
  nautisme: {
    kicker: "Conception et réparation de voiles et d'équipement nautique",
    title: "Réparation technique de voiles, à Marseille et au-delà",
    blocks: [
      { kind: "p", text: "Spécialiste de la réparation technique de voiles : kitesurf, bateau, planche à voile. L'atelier intervient aussi sur les structures gonflables, wingfoil et kayak." },
      { kind: "p", text: "Déchirure, couture endommagée, renfort à refaire ou remise en état complète : chaque réparation utilise des coutures adaptées au sel et aux UV, avec une attention portée à la solidité et à la durée." },
      { kind: "p", text: "Les matières upcyclées sont privilégiées, en particulier les chutes de production de Wanikou, partenaire kitesurf avec lequel l'atelier collabore régulièrement." },
      { kind: "h", text: "Réparations et réalisations" },
      {
        kind: "list",
        items: [
          "Voiles de kitesurf, wingfoil et kayak",
          "Voiles de bateau",
          "Voiles de planche à voile",
          "Boudins et structures gonflables nautiques",
          "Housses, sellerie, coussins, protections et équipements sur mesure pour bateau",
          "Renforts, reprises de coutures et réparations techniques",
        ],
      },
      { kind: "p", text: "Chaque pièce est étudiée au cas par cas, pour choisir la technique et les matières les plus adaptées. Les prix au mètre ou à la pièce ci-dessous servent de base. Un devis précise le montage." },
    ],
  },
  mobilier: {
    kicker: "Mobilier et confection textile",
    title: "Des créations pensées pour vos espaces",
    blocks: [
      { kind: "p", text: "L'atelier conçoit et réalise du mobilier et des éléments textiles sur mesure, pour la restauration, le nautisme et l'événementiel." },
      { kind: "p", text: "Chaque réalisation s'intègre au lieu, avec une attention au confort, à l'esthétique et à la qualité des finitions." },
      { kind: "h", text: "Banquettes, assises et transats" },
      { kind: "p", text: "De la banquette de restaurant aux assises pour bateaux et yachts, les pièces suivent vos dimensions. Banquettes de restaurant, banquettes de bateau, bains de soleil et transats, avec des finitions choisies pour l'usage." },
      { kind: "h", text: "Rideaux et habillage" },
      { kind: "p", text: "Rideaux et éléments textiles habillent un restaurant, un bateau, un yacht ou un événement. L'atelier accompagne le choix des dimensions, des matières et des finitions pour que l'ensemble tienne avec le lieu." },
      { kind: "p", text: "Les pièces en boutique sont des modèles de référence. Le sur-mesure, les coloris et les matières disponibles se confirment au devis. Photo non contractuelle." },
    ],
  },
  evenementiel: {
    kicker: "Structures gonflables et créations textiles sur mesure",
    title: "Des volumes textiles qui prennent vie",
    blocks: [
      { kind: "p", text: "Fabrication de structures textiles pour l'art, la culture, l'événementiel et la scénographie. De la petite pièce aux installations monumentales, les matières techniques et légères donnent des volumes résistants, adaptés à leur usage." },
      { kind: "p", text: "L'expérience du nautisme et de la couture technique permet des formes complexes, en air capté ou à air soufflé, selon le projet." },
      { kind: "h", text: "Fabrication textile et structures gonflables" },
      { kind: "p", text: "Chaque projet part d'un concept, d'un dessin ou d'un cahier des charges. L'atelier intervient sur la fabrication, l'assemblage, les coutures, les renforts et les volumes, de toutes tailles. Air capté, air soufflé, textiles techniques, matières souples et légères : la technique suit la forme et l'usage." },
      { kind: "h", text: "Sculptures gonflables monumentales — Bruxelles" },
      { kind: "p", text: "Fabrication technique d'une série de sculptures gonflables monumentales imaginées par une artiste, pour un événement de la Ville de Bruxelles. Inspirées des formes du kitesurf, certaines pièces atteignaient 7 mètres. Réalisées sur mesure à partir du design fourni, en tant que fabricante." },
      { kind: "h", text: "Installation gonflable immersive — 10 mètres" },
      { kind: "p", text: "Structure de 10 mètres de long et d'environ 2 mètres de diamètre, pour plusieurs expositions d'art contemporain en France. Textile léger, air soufflé, le public peut entrer. La surface sert aussi de support de projection, et la structure devient un espace immersif." },
      { kind: "h", text: "Assises et poufs gonflables" },
      { kind: "p", text: "Assises en air capté, formes et dimensions variées, légères et souples. Poufs gonflables à partir de chutes de sellerie nautique et de tissus Sunbrella : des matières résistantes destinées à être jetées, reprises en pièces uniques." },
      { kind: "h", text: "Des projets hors normes" },
      {
        kind: "list",
        items: [
          "Installations artistiques",
          "Expositions et art contemporain",
          "Scénographies",
          "Festivals",
          "Événements culturels",
          "Événements de marque",
          "Décors et structures événementielles",
          "Mobilier et assises gonflables",
          "Créations textiles monumentales",
        ],
      },
      { kind: "p", text: "La chenille monumentale se commande au mètre cube. Un dessin, un concept ou une simple idée de forme peuvent devenir un volume : le devis part de là." },
    ],
  },
  mode: {
    kicker: "Création, transformation, retouches et upcycling",
    title: "Donner une seconde vie à un tissu",
    blocks: [
      { kind: "p", text: "Transformer une pièce existante ou créer un accessoire unique : chaque projet est adapté à la demande. De la robe de mariée transformée aux retouches, en passant par les vêtements, sacs et accessoires, les matières changent selon ce qui est disponible." },
      { kind: "h", text: "Création et confection" },
      { kind: "p", text: "Des pièces uniques, pensées selon le style et les matières en stock." },
      {
        kind: "list",
        items: [
          "Robes",
          "Pantalons",
          "Sacoches et bananes",
          "Pochettes, trousses et tote bags",
          "Sacs et accessoires",
          "Pièces textiles personnalisées",
        ],
      },
      { kind: "h", text: "Transformation de vêtements" },
      { kind: "p", text: "Un vêtement peut être réinventé plutôt que remplacé. Une robe de mariée composée d'un haut type combinaison-pantalon a été transformée en robe avec une jupe : la cliente a gardé l'esprit de la robe, avec la silhouette voulue." },
      { kind: "h", text: "Retouches et réparations" },
      {
        kind: "list",
        items: [
          "Ourlets",
          "Ajustements",
          "Retouches",
          "Réparations de trous et d'accrocs",
          "Modifications de coupe",
          "Transformations de vêtements",
        ],
      },
      { kind: "h", text: "Des matières existantes, de nouvelles créations" },
      { kind: "p", text: "Sacoches, bananes et accessoires naissent de chutes textiles. Des K-way ont été réalisés à partir de chutes de Michelin Inflatable Solutions. Les pièces en boutique — bob, banane, pochette, trousse, chouchou, tote bag — sont des modèles prêts, chacun unique selon les voiles du moment." },
    ],
  },
  transmission: {
    kicker: "Cours de couture et de réparation",
    title: "Apprendre à faire durer",
    blocks: [
      { kind: "p", text: "Cours de couture et partage des techniques pour apprendre à réparer, transformer et faire durer. L'atelier ouvre ses portes pour des sessions sur mesure : couture technique, soudure plastique et conception de structures gonflables." },
      { kind: "p", text: "On peut venir réparer son propre matériel de glisse, kite ou wing, ou apprendre à monter une pièce textile. Piqueuse, surjeteuse, lecture d'une matière, geste de réparation." },
      { kind: "h", text: "Réserver des heures" },
      { kind: "p", text: "Le cours se commande à l'heure, 16 € TTC. Une initiation ou un coup de main de 3 heures, ou un accompagnement plus long pour un gabarit, un patron et un assemblage. Après la réservation, l'atelier propose un programme et des créneaux." },
      { kind: "p", text: "Les cours collectifs et les ateliers partagés se construisent aussi sur devis, selon le nombre de personnes et le geste à transmettre." },
    ],
  },
};
