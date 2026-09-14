import type {
  Scent, JarColor, CartItem, OrderLineInput, PriceResult, LocalizedTag,
} from "@/types";

const MATERIAL_TAGS: LocalizedTag[] = [
  { fi: "Lasipurkki", en: "Glass jar" },
  { fi: "Bambukansi", en: "Bamboo lid" },
  { fi: "100% Soijavaha", en: "100% soy wax" },
  { fi: "10% Sheabutter", en: "10% shea butter" },
  { fi: "Puuvillasydän", en: "Cotton wick" },
];

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
    price: "9€",
    tags: MATERIAL_TAGS,
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
    price: "9€",
    tags: MATERIAL_TAGS,
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
    price: "9€",
    tags: MATERIAL_TAGS,
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
    price: "9€",
    tags: MATERIAL_TAGS,
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
    price: "9€",
    tags: MATERIAL_TAGS,
  },
];

export const PRICE_TABLE: Record<number, number> = {
  1: 9, 2: 18, 3: 25, 4: 34, 5: 40, 6: 47,
};

export const DELIVERY_FEE = 8;
const JAR_IDS: JarColor[] = ["white", "green", "red"];

export function featuredScents(): Scent[] {
  const mustikka = SCENTS.find((s) => s.id === "mustikka");
  const rest = SCENTS.filter((s) => s.id !== "mustikka");
  return mustikka ? [mustikka, ...rest] : [...SCENTS];
}

export function scentById(id: string): Scent | undefined {
  return SCENTS.find((s) => s.id === id);
}

export function calcPrice(total: number): number {
  if (total <= 0) return 0;
  if (total <= 6) return PRICE_TABLE[total] ?? total * 9;
  return 47 + (total - 6) * 9;
}

export function flattenCart(cart: CartItem[]): OrderLineInput[] {
  const lines: OrderLineInput[] = [];
  for (const item of cart) {
    for (const [scentId, qty] of Object.entries(item.quantities)) {
      if (qty > 0) lines.push({ scentId, jarColor: item.jarColor, qty });
    }
  }
  return lines;
}

export function priceOrder(
  items: OrderLineInput[],
  delivery: "pickup" | "post",
  code?: string,
  opts?: { discountCode?: string; discountPercent?: number },
): PriceResult {
  if (!items.length) return { ok: false, error: "Empty cart." };

  const validIds = new Set(SCENTS.map((s) => s.id));
  const validJars = new Set<string>(JAR_IDS);
  let totalCandles = 0;

  for (const item of items) {
    if (!validIds.has(item.scentId)) return { ok: false, error: "Unknown scent." };
    if (!validJars.has(item.jarColor)) return { ok: false, error: "Unknown jar." };
    if (!Number.isInteger(item.qty) || item.qty < 1) {
      return { ok: false, error: "Invalid quantity." };
    }
    totalCandles += item.qty;
  }

  const basePrice = calcPrice(totalCandles);
  const envCode = (opts?.discountCode ?? "").trim().toUpperCase();
  const envPct = opts?.discountPercent ?? 0;
  const submitted = (code ?? "").trim().toUpperCase();

  let discountAmount = 0;
  let codeApplied = false;

  if (submitted) {
    if (!envCode || submitted !== envCode || !(envPct > 0)) {
      return { ok: false, error: "Invalid code." };
    }
    discountAmount = Math.floor(basePrice * (envPct / 100));
    codeApplied = true;
  }

  const deliveryFee = delivery === "post" ? DELIVERY_FEE : 0;
  return {
    ok: true,
    totalCandles,
    basePrice,
    discountAmount,
    deliveryFee,
    total: basePrice - discountAmount + deliveryFee,
    codeApplied,
  };
}
