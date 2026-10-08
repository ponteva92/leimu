/* Scroll timelines for pinned chapters.

   A chapter's track is TRACK svh tall and holds a STAGE svh sticky stage.
   Its scroll progress p runs from 0 to 1 while the stage is pinned, over
   TRACK - STAGE svh of scrolling. The next sheet pulls up COVER svh over
   the stage, so the cover takes the last COVER / (TRACK - STAGE) of p.
   Every window below is a pair of progress values [from, to]. */

import type { CSSProperties } from "react";

export type Span = [number, number];

/* The track height and the pull-up read CSS variables set from the same
   constants the timeline uses, so the pin math cannot drift from the
   classes (`stage:h-[var(--track)]`, `-mt-[var(--cover)]`). */
export const trackVars = (trackSvh: number) => ({ "--track": `${trackSvh}svh` }) as CSSProperties;
export const coverVars = (coverSvh: number) => ({ "--cover": `${coverSvh}svh` }) as CSSProperties;

/** Progress at which the next sheet starts to cover the stage. */
export function coverStart(trackSvh: number, coverSvh: number, stageSvh = 100) {
  return 1 - coverSvh / (trackSvh - stageSvh);
}

/** Evenly spaced beats: after a `head` that holds the opening, each beat
    gets an equal slot, and its transition takes the first `fill` of that
    slot while the rest holds. The `tail` holds the last beat; the cover
    runs inside it. Windows before the first beat and after the last sit
    outside 0–1, so the opening is already in place and the final beat
    never leaves. */
export function beatWindows(count: number, { head, tail, fill = 0.7 }: { head: number; tail: number; fill?: number }) {
  const slot = (1 - head - tail) / count;
  return (k: number): Span => {
    if (k < 0) return [-2, -1];
    if (k >= count) return [2, 3];
    const start = head + k * slot;
    return [start, start + slot * fill];
  };
}

/** A point part-way through a window. By default, where one caption has
    faded out and the next starts to arrive. */
export const mid = ([a, b]: Span, t = 0.45) => a + (b - a) * t;
