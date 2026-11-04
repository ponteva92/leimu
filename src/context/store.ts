import { create } from "zustand";
import type { StoreState, JarColor, Scent } from "@/types";
import { calcPrice, SCENTS } from "@/lib/scents";

export const useStore = create<StoreState>((set, get) => ({
  config: { jar: "white", quantities: {}, message: "" },
  cart: [],
  modalScent: null,
  contactOpen: false,
  lang: "fi",

  setJar: (jar: JarColor) =>
    set((state) => ({ config: { ...state.config, jar } })),

  setQuantity: (scentId: string, qty: number) =>
    set((state) => {
      if (!SCENTS.some((scent) => scent.id === scentId) || !Number.isSafeInteger(qty)) return state;
      const others = Object.entries(state.config.quantities).reduce((sum, [id, value]) => sum + (id === scentId ? 0 : value), 0);
      return {
      config: {
        ...state.config,
        quantities: { ...state.config.quantities, [scentId]: Math.max(0, Math.min(qty, 6 - others)) },
      },
    }; }),

  setMessage: (message: string) =>
    set((state) => ({ config: { ...state.config, message } })),

  openModal: (scent: Scent) => set({ modalScent: scent }),
  closeModal: () => set({ modalScent: null }),

  openContact: () => set({ contactOpen: true }),
  closeContact: () => set({ contactOpen: false }),

  toggleLang: () =>
    set((state) => ({ lang: state.lang === "fi" ? "en" : "fi" })),

  totalQty: () => {
    const { quantities } = get().config;
    return Object.values(quantities).reduce((sum, q) => sum + q, 0);
  },

  totalPrice: () => calcPrice(get().totalQty()),

  addToCart: (jarColor: JarColor, quantities: Record<string, number>) => {
    set((state) => ({
      cart: [...state.cart, { id: globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`, jarColor, quantities }],
      config: { ...state.config, quantities: {} },
    }));
  },

  removeFromCart: (id: string) =>
    set((state) => ({ cart: state.cart.filter((item) => item.id !== id) })),

  clearCart: () => set({ cart: [] }),

  cartTotalQty: () => {
    return get().cart.reduce((sum, item) =>
      sum + Object.values(item.quantities).reduce((s, q) => s + q, 0), 0);
  },

  cartTotalPrice: () => calcPrice(get().cartTotalQty()),

  /* ─── Home hero ─── true while the dark hero sits under the fixed bar ─── */
  heroUnderBar: true,
  setHeroUnderBar: (heroUnderBar: boolean) => set({ heroUnderBar }),
  /* true while the hero stage is still on screen, so its canvases draw */
  heroActive: true,
  setHeroActive: (heroActive: boolean) => set({ heroActive }),
  /* true while a later dark stage (the gift ceremony) sits under the bar */
  darkStageUnderBar: false,
  setDarkStageUnderBar: (darkStageUnderBar: boolean) => set({ darkStageUnderBar }),

  /* ─── Cursor ─── */
  cursorType: "default" as "default" | "pointer" | "magnetic",
  setCursorType: (type: "default" | "pointer" | "magnetic") => set({ cursorType: type }),
}));
