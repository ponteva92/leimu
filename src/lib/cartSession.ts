import type { CartItem, ConfiguratorState, JarColor } from "@/types";
import { SCENTS } from "./scents";

export const CART_SESSION_KEY = "leimu-cart-v1";
const jars: JarColor[] = ["white", "green", "red"];
const jar = (value: unknown): JarColor => jars.includes(value as JarColor) ? value as JarColor : "white";

function quantities(value: unknown) {
  const clean: Record<string, number> = {};
  if (!value || typeof value !== "object") return clean;
  let remaining = 6;
  for (const scent of SCENTS) {
    const qty = (value as Record<string, unknown>)[scent.id];
    if (typeof qty === "number" && Number.isSafeInteger(qty) && qty > 0) {
      clean[scent.id] = Math.min(qty, remaining);
      remaining -= clean[scent.id];
    }
  }
  return clean;
}

/** Deliberately exclude messages, contact details, and transient UI state. */
export function parseCartSession(raw: string): { cart: CartItem[]; config: ConfiguratorState } | null {
  try {
    const saved = JSON.parse(raw);
    if (!saved || typeof saved !== "object") return null;
    const cart: CartItem[] = Array.isArray(saved.cart) ? saved.cart.flatMap((item: CartItem, index: number) => {
      if (!item || !jars.includes(item.jarColor)) return [];
      const clean = quantities(item.quantities);
      if (!Object.values(clean).some((qty) => qty > 0)) return [];
      return [{ id: typeof item.id === "string" ? item.id : `restored-${index}`, jarColor: item.jarColor, quantities: clean }];
    }) : [];
    return { cart, config: { jar: jar(saved.config?.jar), quantities: quantities(saved.config?.quantities), message: "" } };
  } catch {
    return null;
  }
}
