import type { Scent } from "@/types";

export const SCENTS: Scent[] = [
  {
    id: "havu",
    name: "Havu",
    nameEn: "Forest Pine",
    description: "Syvään metsään johdattava tuoksu — pihkainen havupuu, kostea sammal ja kylmä talvi-ilma. Rauhoittava ja maanläheinen.",
    descriptionEn: "A deep forest journey — resinous pine, damp moss, and cold winter air. Calming and grounding.",
    profile: "Metsä · Pihka · Sammal",
    profileEn: "Forest · Resin · Moss",
    jarColor: "green",
    waxColor: "#5C7A48",
    ambientColor: "#5C7A48",
    image: "/images/scent-havu.jpg",
    burnTime: "~36h",
    price: "9€",
    tags: ["Lasipurkki", "Bambukansi", "100% Soijavaha", "10% Sheabutter", "Puuvillasyöän"],
  },
  {
    id: "havu-vanilja",
    name: "Havu-Vanilja",
    nameEn: "Pine & Vanilla",
    description: "Pehmeän havun ja lämpimän vaniljan kohtaaminen. Skandinaavinen kodikkuus — kuin takkavalkea talvisessa mökissä.",
    descriptionEn: "Soft pine meets warm vanilla — Nordic coziness like a fireplace in a winter cabin.",
    profile: "Havu · Vanilja · Lämpö",
    profileEn: "Pine · Vanilla · Warmth",
    jarColor: "white",
    waxColor: "#C8A96E",
    ambientColor: "#C8A96E",
    image: "/images/scent-havu-vanilja.jpg",
    burnTime: "~36h",
    price: "9€",
    tags: ["Lasipurkki", "Bambukansi", "100% Soijavaha", "10% Sheabutter", "Puuvillasyöän"],
  },
  {
    id: "vanilja",
    name: "Vanilja",
    nameEn: "Pure Vanilla",
    description: "Aito, kermainen vanilja ilman makeisuutta. Lämmin, syvä ja lohduttava — ajaton klassikko.",
    descriptionEn: "Genuine creamy vanilla without sweetness. Warm, deep and comforting — a timeless classic.",
    profile: "Vanilja · Kerma · Syvyys",
    profileEn: "Vanilla · Cream · Depth",
    jarColor: "white",
    waxColor: "#D4A96A",
    ambientColor: "#D4A96A",
    image: "/images/scent-vanilja.jpg",
    burnTime: "~36h",
    price: "9€",
    tags: ["Lasipurkki", "Bambukansi", "100% Soijavaha", "10% Sheabutter", "Puuvillasyöän"],
  },
  {
    id: "mustikka",
    name: "Mustikka",
    nameEn: "Wild Blueberry",
    description: "Suomalainen metsämustikka parhaimmillaan — raikas, kevyesti makeä ja puhdas. Kesäpäivä metsässä lasissa.",
    descriptionEn: "Finnish wild blueberry at its finest — fresh, lightly sweet and clean. A summer forest day in a jar.",
    profile: "Mustikka · Raikas · Luonto",
    profileEn: "Blueberry · Fresh · Nature",
    jarColor: "red",
    waxColor: "#6B4A8C",
    ambientColor: "#6B4A8C",
    image: "/images/scent-mustikka.jpg",
    burnTime: "~36h",
    price: "9€",
    tags: ["Lasipurkki", "Bambukansi", "100% Soijavaha", "10% Sheabutter", "Puuvillasyöän"],
  },
  {
    id: "mustikka-vanilja",
    name: "Mustikka-Vanilja",
    nameEn: "Blueberry Vanilla",
    description: "Mustikan raikkaus kohtaa vaniljan suloisuuden. Hedelmäinen, lämmin ja kerroksellinen — täydellinen tasapaino.",
    descriptionEn: "Blueberry freshness meets vanilla sweetness. Fruity, warm and layered — perfect balance.",
    profile: "Mustikka · Vanilja · Hedelmä",
    profileEn: "Blueberry · Vanilla · Fruit",
    jarColor: "red",
    waxColor: "#8B5A6A",
    ambientColor: "#8B5A6A",
    image: "/images/scent-mustikka-vanilja.jpg",
    burnTime: "~36h",
    price: "9€",
    tags: ["Lasipurkki", "Bambukansi", "100% Soijavaha", "10% Sheabutter", "Puuvillasyöän"],
  },
];

export const PRICE_TABLE: Record<number, number> = {
  1: 9, 2: 18, 3: 25, 4: 34, 5: 40, 6: 47,
};

export function calcPrice(total: number): number {
  if (total <= 0) return 0;
  if (total <= 6) return PRICE_TABLE[total] ?? total * 9;
  return 47 + (total - 6) * 9;
}
