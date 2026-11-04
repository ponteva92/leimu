"use client";

/* ════════════════════════════════════════════════════════════════════════
   LEIMU — scroll story hooks
   ------------------------------------------------------------------------
   Shared by every pinned chapter. The hooks work from a chapter's own
   scroll progress p (0 to 1 while its stage is pinned), or from layout
   measured ahead of time (see lib/layout), so none of them reads layout
   while the page scrolls.
   ════════════════════════════════════════════════════════════════════════ */

import { useCallback, useEffect, useRef, useState, type RefObject } from "react";
import {
  useInView, useMotionValue, useMotionValueEvent, useScroll, useTransform, type MotionValue,
} from "framer-motion";
import { useStore } from "@/context/store";
import { barHeight, measureBox, onRelayout, type Box } from "@/lib/layout";
import type { Span } from "@/lib/timeline";

/** Cached geometry maps native scrolling to the track's three phases:
    - `approach`: the track's top rises from the screen's foot to its top;
    - `p`: the stage is pinned;
    - `leave`: the track's foot rises from the screen's foot to its top.
    Track and cover use stable svh while the visible stage may use dvh.
    Browser chrome can resize that stage without moving these cuts. */
export function useTrackProgress(trackRef: RefObject<HTMLElement>, trackSvh: number) {
  const { scrollY } = useScroll();
  const approach = useMotionValue(0);
  const p = useMotionValue(0);
  const leave = useMotionValue(0);
  const geometry = useRef<{ top: number; height: number; stage: number; view: number } | null>(null);
  const update = useCallback(() => {
    const box = geometry.current;
    if (!box) return;
    const y = scrollY.get() - box.top;
    const range = Math.max(1, box.height - box.stage);
    const clamp = (v: number) => Math.max(0, Math.min(1, v));
    approach.set(clamp((y + box.view) / box.view));
    p.set(clamp(y / range));
    leave.set(clamp((y - range) / box.stage));
  }, [scrollY, approach, p, leave]);
  useMotionValueEvent(scrollY, "change", update);
  useEffect(() => onRelayout(() => {
    const track = trackRef.current;
    const box = track && measureBox(track);
    const stage = track?.querySelector<HTMLElement>(".story-stage") ?? track?.firstElementChild;
    geometry.current = box && box.height > 0 ? {
      top: box.top,
      height: box.height,
      // Track and cover share stable svh. Derive that unit from the real
      // track rather than the changing browser chrome height: a dvh-only
      // resize must never change the narrative at the same scroll position.
      stage: trackSvh > 100 ? box.height * 100 / trackSvh :
        stage instanceof HTMLElement ? stage.offsetHeight : window.innerHeight,
      view: window.innerHeight,
    } : null;
    update();
  }), [trackRef, trackSvh, update]);
  return { approach, p, leave };
}

/** The stage steps back a touch while the next sheet covers it. */
export function useCoverRecede(p: MotionValue<number>, start: number, to = 0.96) {
  return useTransform(p, [start, 1], [1, to]);
}

/** Items that reveal in reading order as their grid scrolls up the screen,
    finishing as its last row enters. Each item's window starts `stagger`
    after the one before. `near` turns true a viewport ahead: fetch what
    the reveals will uncover then, since lazy loading waits for clipped
    images to be uncovered. */
export function useStaggeredReveal(ref: RefObject<HTMLElement>, count: number, stagger = 0.07) {
  const { scrollYProgress: p } = useScroll({ target: ref, offset: ["start end", "end end"] });
  const near = useInView(ref, { once: true, margin: "100% 0px" });
  const span = 1 - stagger * (count - 1);
  return { p, near, at: (i: number): Span => [i * stagger, i * stagger + span] };
}

/* Every promoted layer holds its own GPU memory, and its text loses
   subpixel anti-aliasing. Promote moving layers only while one of their
   windows runs, starting a little ahead so the first frame of motion is
   already composited, and never at the clamped ends of the scroll. */
const LEAD = 0.04;

/** Sets will-change on `refs` while `p` is inside any of the windows.
    `will` names what moves: a layer whose opacity changes needs
    "opacity" in it too, or Chrome repaints the layer. Windows outside
    0–1 never move and are ignored. */
export function useWillChange(
  p: MotionValue<number>,
  windows: (Span | undefined)[],
  refs: RefObject<HTMLElement>[],
  will = "transform",
) {
  const moving = windows.filter((w): w is Span => !!w && w[1] > 0 && w[0] < 1);
  const key = moving.map((w) => w.join()).join(";");
  const latest = useRef({ moving, refs, will });
  latest.current = { moving, refs, will };
  const on = useRef(false);

  const sync = useCallback((v: number) => {
    const { moving, refs, will } = latest.current;
    const next = v > 0 && v < 1 && moving.some(([a, b]) => v > a - LEAD && v < b + LEAD);
    if (next === on.current) return;
    on.current = next;
    for (const ref of refs) {
      if (ref.current) ref.current.style.willChange = next ? will : "";
    }
  }, []);

  useMotionValueEvent(p, "change", sync);
  useEffect(() => sync(p.get()), [p, sync, key]);
}

const REST_MS = 200;

/** For a layer that scales up. A promoted layer keeps the raster of its
    starting scale, so one held promoted at a larger scale stays soft.
    This promotes the layer only while `value` changes, and demotes it
    once `value` has rested for REST_MS, so it repaints sharp. */
export function useWillChangeWhileMoving(
  value: MotionValue<number>,
  refs: RefObject<HTMLElement>[],
  will = "transform",
) {
  const latest = useRef({ refs, will });
  latest.current = { refs, will };
  const on = useRef(false);
  const timer = useRef<number>();

  const set = useCallback((next: boolean) => {
    if (next === on.current) return;
    on.current = next;
    const { refs, will } = latest.current;
    for (const ref of refs) {
      if (ref.current) ref.current.style.willChange = next ? will : "";
    }
  }, []);

  useMotionValueEvent(value, "change", () => {
    window.clearTimeout(timer.current);
    set(true);
    timer.current = window.setTimeout(() => set(false), REST_MS);
  });
  useEffect(() => () => window.clearTimeout(timer.current), []);
}

/** Whether a pinned stage still shows once its track has ended. The stage
    then rides up under the next sheet, which pulls up `coverSvh` over it;
    past that point, plus a small margin, the sheet covers the whole stage.
    Loops on the stage (WebGL, video) run only while this is true. */
export function useStageShown(leave: MotionValue<number>, coverSvh: number) {
  const hiddenFrom = 1 - coverSvh / 100 + 0.02;
  const shown = useTransform(leave, (v) => v < hiddenFrom);
  const [active, setActive] = useState(true);
  useMotionValueEvent(shown, "change", setActive);
  return active;
}

/** Holds the bar in dark glass while a dark stage sits under it.

    A pinned stage can't tell from scroll distance alone, so the track's
    box, measured on relayout, is placed against the scroll position.
    - `from`: the share of the pinned scroll after which the room reads as
      dark, for a room that darkens once pinned. Without it the room is
      dark as soon as its top reaches the bar.
    - `cover`: how far the next sheet pulls up over the stage, in svh.
      Once that sheet reaches the bar, the bar follows the sheet's tone.
    - `stageRef`: the stage marks the room's tone on itself as data-tone,
      which the chapter rail reads. The sheet that covers the room marks
      its own tone, so the stage reports only the room.

    A hidden track (the flow fallback) has no box and never reads as dark.
    On unmount the bar is released, if this stage was holding it. */
export function useDarkStageSync(
  trackRef: RefObject<HTMLElement>,
  { stageRef, from, cover }: { stageRef?: RefObject<HTMLElement>; from?: number; cover: number },
) {
  const { scrollY } = useScroll();
  const cache = useRef<{ box: Box; vh: number; bar: number } | null>(null);
  const dark = useRef(false);

  const update = useCallback(() => {
    const c = cache.current;
    let entered = false;
    let next = false;
    if (c) {
      const top = c.box.top - scrollY.get();
      const range = c.box.height - c.vh;
      entered = from === undefined ? top <= c.bar : range > 0 && -top > from * range;
      next = entered && top + c.box.height - (cover / 100) * c.vh > c.bar;
    }
    if (dark.current !== next) {
      dark.current = next;
      useStore.getState().setDarkStageUnderBar(next);
    }
    const stage = stageRef?.current;
    const tone = entered ? "dark" : "light";
    if (stage && stage.dataset.tone !== tone) stage.dataset.tone = tone;
  }, [scrollY, stageRef, from, cover]);

  useMotionValueEvent(scrollY, "change", update);

  useEffect(() => {
    const unsubscribe = onRelayout(() => {
      const track = trackRef.current;
      const box = track && measureBox(track);
      const pinnedTrack = track?.matches(".story-track") ? track : track?.querySelector<HTMLElement>(".story-track");
      const units = pinnedTrack ? parseFloat(getComputedStyle(pinnedTrack).getPropertyValue("--track")) : 0;
      const stageHeight = pinnedTrack && units > 100 ? pinnedTrack.offsetHeight * 100 / units : window.innerHeight;
      cache.current = box ? { box, vh: stageHeight, bar: barHeight() } : null;
      update();
    });
    return () => {
      unsubscribe();
      if (dark.current) {
        dark.current = false;
        useStore.getState().setDarkStageUnderBar(false);
      }
    };
  }, [trackRef, update]);
}
