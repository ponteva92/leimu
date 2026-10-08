"use client";

import { useEffect, useState } from "react";
import { STAGE_QUERY } from "./screens";

/* Where page heroes and the home chapters pin: md and up, with motion
   allowed. Their tracks and stages mirror this with md:motion-safe:
   classes, so the CSS layout and the scroll choreography always agree. */
export const PIN_QUERY = "(min-width: 768px) and (prefers-reduced-motion: no-preference)";

export const REDUCE_QUERY = "(prefers-reduced-motion: reduce)";

/** Where the WebGL backdrops run: md and up, driven by a mouse or trackpad. */
export const FINE_QUERY = "(min-width: 768px) and (pointer: fine)";

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
