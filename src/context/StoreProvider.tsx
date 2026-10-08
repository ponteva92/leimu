"use client";

import { useEffect } from "react";
import { useStore } from "@/context/store";

// Zustand works client-side — this wrapper ensures proper hydration
// when using SSR in Next.js App Router.
export function StoreProvider({ children }: { children: React.ReactNode }) {
  const lang = useStore((s) => s.lang);

  // <html lang> follows the language toggle, so screen readers switch
  // pronunciation along with the copy (the server always renders "fi").
  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  return <>{children}</>;
}
