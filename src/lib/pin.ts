"use client";

import { useEffect, useState } from "react";
import { STAGE_QUERY } from "./screens";

/* Motion preference selects storytelling; viewport geometry only selects
   its composition. Phones retain the same chapters and effects. */
export const PIN_QUERY = "(prefers-reduced-motion: no-preference)";

export const REDUCE_QUERY = "(prefers-reduced-motion: reduce)";

/** False on the server and first paint; then tracks the media query live. */
export function useMediaQuery(query: string) {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia(query);
    const sync = () => setMatches(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, [query]);

  return matches;
}

/** True once a pin-capable viewport is confirmed. */
export function usePinned() {
  return useMediaQuery(PIN_QUERY);
}

/** True once a viewport that holds a pinned stage is confirmed (the
    Tailwind `stage:` variant). Mount a stage's WebGL or video only then,
    so the hidden layout never runs it. */
export function useStaged() {
  return useMediaQuery(STAGE_QUERY);
}

/** Both CSS-selected layouts are present in SSR. After hydration only the
    chosen layout stays mounted, so hidden scroll subscriptions go idle. */
export function useMotionLayout() {
  const [enabled, setEnabled] = useState<boolean | null>(null);
  useEffect(() => {
    const query = window.matchMedia(STAGE_QUERY);
    const sync = () => setEnabled(query.matches);
    sync();
    query.addEventListener("change", sync);
    return () => query.removeEventListener("change", sync);
  }, []);
  return enabled;
}
