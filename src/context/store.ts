import { create } from "zustand";
import type { StoreState, JarColor, Scent, CheckoutStep, LastOrder, Lang } from "@/types";
import { calcPrice } from "@/lib/scents";

export const useStore = create<StoreState>((set, get) => ({
  config: { jar: "white", quantities: {}, message: "" },
  cart: [],
  modalScent: null,
  contactOpen: false,
  lang: "fi",
  checkoutStep: "configure",
  lastOrder: null,
  navMenuOpen: false,
  hydrated: false,

  setJar: (jar: JarColor) =>
    set((state) => ({ config: { ...state.config, jar } })),

  setQuantity: (scentId: string, qty: number) =>
    set((state) => ({
      config: {
        ...state.config,
        quantities: { ...state.config.quantities, [scentId]: Math.max(0, qty) },
      },
    })),

  setMessage: (message: string) =>
    set((state) => ({ config: { ...state.config, message } })),

  openModal: (scent: Scent) => set({ modalScent: scent }),
  closeModal: () => set({ modalScent: null }),

  openContact: () => set({ contactOpen: true }),
  closeContact: () => set({ contactOpen: false }),

  toggleLang: () =>
    set((state) => ({ lang: state.lang === "fi" ? "en" : "fi" })),
  setLang: (lang: Lang) => set({ lang }),

  totalQty: () => {
    const { quantities } = get().config;
    return Object.values(quantities).reduce((sum, q) => sum + q, 0);
  },

  totalPrice: () => calcPrice(get().totalQty()),

  addToCart: (jarColor: JarColor, quantities: Record<string, number>) => {
    set((state) => ({
      cart: [...state.cart, { id: Date.now().toString(), jarColor, quantities }],
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

  cursorType: "default" as const,
  setCursorType: (type: "default" | "pointer" | "magnetic") => set({ cursorType: type }),
  isMuted: true,
  toggleMute: () => set((state) => ({ isMuted: !state.isMuted })),

  setCheckoutStep: (checkoutStep: CheckoutStep) => set({ checkoutStep }),
  setLastOrder: (lastOrder: LastOrder | null) => set({ lastOrder }),
  setNavMenuOpen: (navMenuOpen: boolean) => set({ navMenuOpen }),
  setHydrated: (hydrated: boolean) => set({ hydrated }),
}));
