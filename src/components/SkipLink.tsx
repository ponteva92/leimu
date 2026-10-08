"use client";

import { useStore } from "@/context/store";

/* data-native-scroll: a real anchor jump moves keyboard focus into <main>. */
export function SkipLink() {
  const lang = useStore((s) => s.lang);

  return (
    <a
      href="#main"
      data-native-scroll
      className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[100] focus:rounded-md focus:bg-[var(--ink)] focus:px-4 focus:py-2 focus:font-mono focus:text-xs focus:uppercase focus:tracking-[0.15em] focus:text-[var(--bg)]"
    >
      {lang === "fi" ? "Siirry sisältöön" : "Skip to content"}
    </a>
  );
}
