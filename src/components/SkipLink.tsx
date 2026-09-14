"use client";

import { COPY } from "@/lib/copy";
import { useStore } from "@/context/store";

export function SkipLink() {
  const { lang } = useStore();
  return (
    <a
      href="#main"
      className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[100] focus:rounded-md focus:bg-[var(--ink)] focus:px-4 focus:py-2 focus:font-mono focus:text-xs focus:uppercase focus:tracking-[0.15em] focus:text-[var(--bg)]"
    >
      {COPY.nav.skip[lang]}
    </a>
  );
}
