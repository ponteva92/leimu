"use client";

import { useEffect } from "react";
import { useStore } from "./store";
import type { CheckoutStep, Lang, LastOrder, CartItem } from "@/types";

const KEY = "leimu-store";

type Persisted = {
  cart?: CartItem[];
  lang?: Lang;
  checkoutStep?: CheckoutStep;
  lastOrder?: LastOrder | null;
};

export function StoreProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) {
        const data = JSON.parse(raw) as Persisted;
        const lang: Lang = data.lang === "en" ? "en" : "fi";
        const step = data.checkoutStep;
        const checkoutStep: CheckoutStep =
          step === "checkout" || step === "summary" || step === "thankyou" || step === "configure"
            ? step
            : "configure";
        useStore.setState({
          cart: Array.isArray(data.cart) ? data.cart : [],
          lang,
          checkoutStep,
          lastOrder: data.lastOrder ?? null,
        });
      }
    } catch {
      /* ignore bad storage */
    }
    document.documentElement.lang = useStore.getState().lang;
    useStore.getState().setHydrated(true);

    const unsub = useStore.subscribe((s) => {
      try {
        localStorage.setItem(
          KEY,
          JSON.stringify({
            cart: s.cart,
            lang: s.lang,
            checkoutStep: s.checkoutStep,
            lastOrder: s.lastOrder,
          }),
        );
      } catch {
        /* quota */
      }
      document.documentElement.lang = s.lang;
    });
    return unsub;
  }, []);

  return <>{children}</>;
}
