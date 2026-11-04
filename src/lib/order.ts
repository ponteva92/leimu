import { calcPrice } from "./scents";

export const POSTAGE = 8;
export const isDiscountCode = (code: string) => code.trim().toUpperCase() === "LEIMU29";

/** The same pricing rules drive the preview and the server's authoritative total. */
export function orderPricing(quantity: number, delivery: boolean, code = "") {
  const base = calcPrice(quantity);
  const discount = isDiscountCode(code) ? Math.floor(base * 0.15) : 0;
  const postage = delivery ? POSTAGE : 0;
  return { base, discount, postage, total: base - discount + postage };
}

const SCENT_KEYS = ["havu", "havuVanilja", "vanilja", "mustikka", "mustikkaVanilja"] as const;
const JAR_KEYS = ["white", "green", "red"] as const;
const COUNT_KEYS = [...SCENT_KEYS, ...JAR_KEYS] as const;
const text = (value: unknown) => typeof value === "string" ? value.trim() : "";
export const validEmail = (value: string) => /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(value);

export function validateOrder(body: Record<string, unknown>) {
  const fail = (error: string) => ({ ok: false as const, error });
  const tilaaja = text(body.tilaaja);
  const email = text(body.email);
  if (!tilaaja || !validEmail(email)) return fail("Tarkista nimi ja sähköpostiosoite.");
  if (body.delivery !== "Nouto" && body.delivery !== "Posti (+8 €)") {
    return fail("Valitse toimitustapa.");
  }
  for (const key of [...COUNT_KEYS, "totalCandles"] as const) {
    if (typeof body[key] !== "number" || !Number.isSafeInteger(body[key]) || (body[key] as number) < 0) {
      return fail("Tuotemäärien on oltava kokonaislukuja.");
    }
  }
  const counts = Object.fromEntries(COUNT_KEYS.map((key) => [key, body[key] as number])) as Record<typeof COUNT_KEYS[number], number>;
  const totalCandles = SCENT_KEYS.reduce((sum, key) => sum + counts[key], 0);
  const jars = JAR_KEYS.reduce((sum, key) => sum + counts[key], 0);
  if (!Number.isSafeInteger(totalCandles) || totalCandles < 1 || totalCandles !== body.totalCandles || jars !== totalCandles) {
    return fail("Tarkista tilauksen tuotteet ja määrät.");
  }
  const delivery = body.delivery === "Posti (+8 €)";
  const address = delivery ? text(body.address) : "";
  const zip = delivery ? text(body.zip) : "";
  const city = delivery ? text(body.city) : "";
  if (delivery && (!address || !/^\d{5}$/.test(zip) || !city)) {
    return fail("Tarkista toimitusosoite ja viisinumeroinen postinumero.");
  }
  const discountCode = text(body.discountCode);
  if (discountCode && !isDiscountCode(discountCode)) return fail("Alekoodi ei ole voimassa.");
  const price = orderPricing(totalCandles, delivery, discountCode).total;
  if (!Number.isSafeInteger(price) || !text(body.items)) return fail("Tarkista tilauksen sisältö.");
  return {
    ok: true as const,
    order: { tilaaja, email, address, zip, city, delivery: body.delivery, totalCandles, price,
      ...counts, items: text(body.items), personalMessage: text(body.personalMessage) },
  };
}
