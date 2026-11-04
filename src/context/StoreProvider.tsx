"use client";

import { useEffect } from "react";
import { useStore } from "@/context/store";
import { CART_SESSION_KEY, parseCartSession } from "@/lib/cartSession";

// Zustand works client-side — this wrapper ensures proper hydration
// when using SSR in Next.js App Router.
export function StoreProvider({ children }: { children: React.ReactNode }) {
  const lang = useStore((s) => s.lang);

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem(CART_SESSION_KEY);
      const restored = raw && parseCartSession(raw);
      if (restored) useStore.setState(restored);
    } catch { /* Storage may be unavailable in private browsing. */ }
    return useStore.subscribe((state, previous) => {
      if (state.cart === previous.cart && state.config.jar === previous.config.jar && state.config.quantities === previous.config.quantities) return;
      try {
        sessionStorage.setItem(CART_SESSION_KEY, JSON.stringify({
          cart: state.cart,
          config: { jar: state.config.jar, quantities: state.config.quantities },
        }));
      } catch { /* Ordering still works when storage is disabled. */ }
    });
  }, []);

  // <html lang> follows the language toggle, so screen readers switch
  // pronunciation along with the copy (the server always renders "fi").
  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  return <>{children}</>;
}
