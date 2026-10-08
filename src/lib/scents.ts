import type { Scent } from "@/types";

/* "Metsä · Pihka · Sammal" → "Metsä, pihka, sammal" — one calm notes line
   for display surfaces (index rows, modal), no separator-dot strips. */
export function notesLine(profile: string): string {
  return profile
    .split(" · ")
    .map((w, i) => (i === 0 ? w : w.toLowerCase()))
    .join(", ");
}

export const SCENTS: Scent[] = [
  {
    id: "havu",
    name: "Havu",
    nameEn: "Forest Pine",
    description: "Pihkaista havua, kosteaa sammalta ja kylmää talvi-ilmaa. Rauhoittava tuoksu, joka vie metsään.",
    descriptionEn: "Resinous pine, damp moss, and cold winter air. A calm scent that takes you into the forest.",
    profile: "Metsä · Pihka · Sammal",
    profileEn: "Forest · Resin · Moss",
    jarColor: "green",
    waxColor: "#5C7A48",
    ambientColor: "#5C7A48",
    image: "/images/scent-havu.jpg",
    burnTime: "~36h",
    price: "9\u00a0€",
    tags: ["Lasipurkki", "Bambukansi", "100% Soijavaha", "10% Sheabutter", "Puuvillasydän"],
    tagsEn: ["Glass jar", "Bamboo lid", "100% soy wax", "10% shea butter", "Cotton wick"],
  },
  {
    id: "havu-vanilja",
    name: "Havu-Vanilja",
    nameEn: "Pine & Vanilla",
    description: "Pehmeää havua ja lämmintä vaniljaa. Kodikas tuoksu, kuin takkatuli talvimökissä.",
    descriptionEn: "Soft pine and warm vanilla. Cozy, like a fireplace in a winter cabin.",
    profile: "Havu · Vanilja · Lämpö",
    profileEn: "Pine · Vanilla · Warmth",
    jarColor: "white",
    waxColor: "#C8A96E",
    ambientColor: "#C8A96E",
    image: "/images/scent-havu-vanilja.jpg",
    burnTime: "~36h",
    price: "9\u00a0€",
    tags: ["Lasipurkki", "Bambukansi", "100% Soijavaha", "10% Sheabutter", "Puuvillasydän"],
    tagsEn: ["Glass jar", "Bamboo lid", "100% soy wax", "10% shea butter", "Cotton wick"],
  },
  {
    id: "vanilja",
    name: "Vanilja",
    nameEn: "Pure Vanilla",
    description: "Aitoa, kermaista vaniljaa ilman makeutta. Lämmin ja lohdullinen.",
    descriptionEn: "Real, creamy vanilla without the sweetness. Warm and comforting.",
    profile: "Vanilja · Kerma · Syvyys",
    profileEn: "Vanilla · Cream · Depth",
    jarColor: "white",
    waxColor: "#D4A96A",
    ambientColor: "#D4A96A",
    image: "/images/scent-vanilja.jpg",
    burnTime: "~36h",
    price: "9\u00a0€",
    tags: ["Lasipurkki", "Bambukansi", "100% Soijavaha", "10% Sheabutter", "Puuvillasydän"],
    tagsEn: ["Glass jar", "Bamboo lid", "100% soy wax", "10% shea butter", "Cotton wick"],
  },
  {
    id: "mustikka",
    name: "Mustikka",
    nameEn: "Wild Blueberry",
    description: "Suomalaista metsämustikkaa. Raikas ja kevyen makea, kuin kesäpäivä metsässä.",
    descriptionEn: "Finnish wild blueberry. Fresh and lightly sweet, like a summer day in the forest.",
    profile: "Mustikka · Raikas · Luonto",
    profileEn: "Blueberry · Fresh · Nature",
    jarColor: "red",
    waxColor: "#6B4A8C",
    ambientColor: "#6B4A8C",
    image: "/images/scent-mustikka.jpg",
    burnTime: "~36h",
    price: "9\u00a0€",
    tags: ["Lasipurkki", "Bambukansi", "100% Soijavaha", "10% Sheabutter", "Puuvillasydän"],
    tagsEn: ["Glass jar", "Bamboo lid", "100% soy wax", "10% shea butter", "Cotton wick"],
  },
  {
    id: "mustikka-vanilja",
    name: "Mustikka-Vanilja",
    nameEn: "Blueberry Vanilla",
    description: "Mustikan raikkautta ja vaniljan makeutta. Hedelmäinen ja lämmin.",
    descriptionEn: "Blueberry freshness and vanilla sweetness. Fruity and warm.",
    profile: "Mustikka · Vanilja · Marjainen",
    profileEn: "Blueberry · Vanilla · Berry",
    jarColor: "red",
    waxColor: "#8B5A6A",
    ambientColor: "#8B5A6A",
    image: "/images/scent-mustikka-vanilja.jpg",
    burnTime: "~36h",
    price: "9\u00a0€",
    tags: ["Lasipurkki", "Bambukansi", "100% Soijavaha", "10% Sheabutter", "Puuvillasydän"],
    tagsEn: ["Glass jar", "Bamboo lid", "100% soy wax", "10% shea butter", "Cotton wick"],
  },
];

/** Finnish typographic euro: figure, no-break space, symbol. */
export function formatEuro(n: number): string {
  return `${n}\u00a0€`;
}

export const FEATURED_SCENT_ID = "mustikka-vanilja";
export const HOME_FEATURED_SCENT_ID = "havu";

export const PRICE_TABLE: Record<number, number> = {
  1: 9, 2: 18, 3: 25, 4: 34, 5: 40, 6: 47,
};

export function calcPrice(total: number): number {
  if (total <= 0) return 0;
  if (total <= 6) return PRICE_TABLE[total] ?? total * 9;
  return 47 + (total - 6) * 9;
}
