"use client";

/* ════════════════════════════════════════════════════════════════════════
   LEIMU — Chapter rail
   ------------------------------------------------------------------------
   An index of a story page's chapters, fixed to the right edge on wide
   screens: one hairline tick per chapter, the current one drawn full
   length in amber. Hovering or focusing the rail opens it into a labelled
   index. It fades in once `startRef` (or the first chapter) rises into
   view and fades out once the last chapter has passed. While hidden its
   links stay in the tab order, and focus brings the rail back. A chapter
   missing from the page drops out of the index.

   Tone: each tick takes the ink of the surface beneath it, so a rail that
   straddles a dark stage and the sheet rising over it splits at the
   sheet's edge. Surfaces mark themselves with data-tone ("dark" or
   "light"). Where marked surfaces overlap, the one later in document
   order wins, which matches how each sheet paints over what comes before
   it. A stage that retones itself mid-scroll is caught by a
   MutationObserver.

   Layout: chapter, surface and row boxes are measured whenever layout may
   have changed (lib/layout), never while the page scrolls.

   Glides: a chapter that pins marks its track with data-pin-rest, the
   scroll progress at which its stage rests in full view, and a click
   glides there. Other chapters glide to their top edge below the header.
   The glide targets the track, never the sticky stage: a pinned sticky
   box reports its top as 0 wherever the page is. Like a native anchor
   jump, a click also puts the chapter's #id in the address bar and moves
   keyboard focus to the chapter.

   Below xl, a 2px amber line along the top edge tracks the whole page.
   ════════════════════════════════════════════════════════════════════════ */

import { useCallback, useEffect, useRef, useState, type MouseEvent, type RefObject } from "react";
import { motion, useMotionValueEvent, useScroll } from "framer-motion";
import { useStore } from "@/context/store";
import { measureBox, onRelayout, viewTop, type Box } from "@/lib/layout";
import { landOn, scrollToTarget } from "@/lib/scroll";

export type Chapter = { id: string; label: { fi: string; en: string } };

type Tone = "light" | "dark";
type RailState = { shown: boolean; active: number; tones: Tone[] };
type Layout = {
  vh: number;
  chapters: Box[];
  start: Box | null;
  surfaces: { el: HTMLElement; box: Box }[];
  rows: { x: number; y: number }[];
};

/** A chapter becomes current once its top edge crosses this share of the viewport. */
const CURRENT_LINE = 0.45;

const hidden = (count: number): RailState => ({
  shown: false,
  active: 0,
  tones: Array<Tone>(count).fill("light"),
});

const keyOf = ({ shown, active, tones }: RailState) => `${shown}:${active}:${tones.join()}`;

const sameIds = (a: Chapter[], b: Chapter[]) =>
  a.length === b.length && a.every((chapter, i) => chapter.id === b[i].id);

function glideTo(id: string) {
  const chapter = document.getElementById(id);
  if (!chapter) return;
  const track = chapter.querySelector<HTMLElement>("[data-pin-rest]");
  // A track hidden by its fallback (short screens, reduced motion) has no box.
  if (track && track.getClientRects().length > 0) {
    const range = Math.max(0, track.offsetHeight - window.innerHeight);
    scrollToTarget(track, { offset: Number(track.dataset.pinRest) * range });
  } else {
    scrollToTarget(chapter);
  }
  landOn(chapter);
}

export function ChapterRail({ chapters, startRef }: {
  chapters: Chapter[];
  startRef?: RefObject<HTMLElement>;
}) {
  const lang = useStore((s) => s.lang);
  const { scrollY, scrollYProgress } = useScroll();
  const navRef = useRef<HTMLElement>(null);
  const rowRefs = useRef<(HTMLLIElement | null)[]>([]);
  const layout = useRef<Layout | null>(null);
  const railHidden = useRef(false);
  const [present, setPresent] = useState(chapters);
  const keyRef = useRef(keyOf(hidden(chapters.length)));
  const [{ shown, active, tones }, setRail] = useState(() => hidden(chapters.length));

  const update = useCallback(() => {
    const l = layout.current;
    if (!l) return;
    const y = scrollY.get();

    let current = 0;
    l.chapters.forEach((box, i) => {
      if (viewTop(box, y) <= l.vh * CURRENT_LINE) current = i;
    });
    const start = l.start ?? l.chapters[0];
    const last = l.chapters[l.chapters.length - 1];
    const next: RailState = {
      shown:
        !!start &&
        viewTop(start, y) < l.vh &&
        (!last || viewTop(last, y) + last.height > l.vh / 2),
      active: current,
      /* The tone beneath each row: the last marked surface, in document
         order, that covers the row's centre. Unmarked ground is paper. */
      tones: l.rows.map(({ x, y: rowY }) => {
        let tone: Tone = "light";
        for (const { el, box } of l.surfaces) {
          const top = viewTop(box, y);
          if (box.left <= x && x < box.right && top <= rowY && rowY < top + box.height) {
            tone = el.dataset.tone === "dark" ? "dark" : "light";
          }
        }
        return tone;
      }),
    };

    const key = keyOf(next);
    if (key === keyRef.current) return;
    keyRef.current = key;
    setRail(next);
  }, [scrollY]);

  const measure = useCallback(() => {
    const nav = navRef.current;
    // Below xl the rail is display: none and has nothing to track.
    railHidden.current = !nav || nav.getClientRects().length === 0;
    if (railHidden.current) {
      layout.current = null;
      return;
    }

    const found: Chapter[] = [];
    const boxes: Box[] = [];
    for (const chapter of chapters) {
      const el = document.getElementById(chapter.id);
      const box = el && measureBox(el);
      if (!box) continue;
      found.push(chapter);
      boxes.push(box);
    }
    // A chapter came or went: re-render the rows, then measure again.
    if (!sameIds(found, present)) {
      layout.current = null;
      setPresent(found);
      return;
    }

    const surfaces: Layout["surfaces"] = [];
    document.querySelectorAll<HTMLElement>("[data-tone]").forEach((el) => {
      const box = measureBox(el);
      if (box) surfaces.push({ el, box });
    });
    // The rail is fixed, so its rows sit still while the page scrolls.
    const rows = present.map((_, i) => {
      const row = rowRefs.current[i];
      if (!row) return { x: NaN, y: NaN };
      const r = row.getBoundingClientRect();
      return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
    });
    const start = startRef?.current ? measureBox(startRef.current) : null;

    layout.current = { vh: window.innerHeight, chapters: boxes, start, surfaces, rows };
    update();
  }, [chapters, present, startRef, update]);

  useMotionValueEvent(scrollY, "change", update);

  useEffect(() => {
    const unsubscribe = onRelayout(measure);
    // A stage that retones itself mid-scroll, possibly after this frame's
    // update. Only a surface the layout doesn't know yet needs a measure.
    const observer = new MutationObserver((records) => {
      // A hidden rail waits for the next relayout.
      if (railHidden.current) return;
      const known = layout.current?.surfaces;
      if (known && records.every((r) => known.some((s) => s.el === r.target))) update();
      else measure();
    });
    observer.observe(document.body, { subtree: true, attributeFilter: ["data-tone"] });
    return () => {
      unsubscribe();
      observer.disconnect();
    };
  }, [measure, update]);

  const onClick = (e: MouseEvent<HTMLAnchorElement>, id: string) => {
    // Modified clicks keep the browser's own behaviour (a new tab, say).
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    e.preventDefault();
    glideTo(id);
  };

  return (
    <>
      <motion.div
        aria-hidden="true"
        className="pointer-events-none fixed inset-x-0 top-0 z-[var(--z-header)] h-[2px] origin-left bg-[var(--accent-2)] xl:hidden"
        style={{ scaleX: scrollYProgress }}
      />
      <nav
        ref={navRef}
        aria-label={lang === "fi" ? "Luvut" : "Chapters"}
        className={[
          "group fixed right-[6px] top-1/2 z-[var(--z-rail)] hidden -translate-y-1/2 transition-opacity duration-500 ease-[var(--ease-out)] motion-reduce:transition-none xl:block",
          shown
            ? "opacity-100"
            : "pointer-events-none opacity-0 focus-within:pointer-events-auto focus-within:opacity-100",
        ].join(" ")}
      >
        <ol>
          {present.map(({ id, label }, i) => {
            const dark = tones[i] === "dark";
            const current = i === active;
            return (
              <li
                key={id}
                ref={(el) => {
                  rowRefs.current[i] = el;
                }}
                className="relative"
              >
                {/* The open index's ground, so labels stay legible over photographs. */}
                <span
                  aria-hidden="true"
                  className={[
                    "pointer-events-none absolute inset-y-0 right-0 w-[calc(100%+6rem)] opacity-0 transition-opacity duration-300 ease-[var(--ease-out)] group-hover:opacity-100 group-focus-within:opacity-100 motion-reduce:transition-none",
                    i === 0 ? "rounded-t-lg" : "",
                    i === present.length - 1 ? "rounded-b-lg" : "",
                    dark ? "bg-[rgba(22,19,15,0.94)]" : "bg-[rgba(247,242,234,0.96)]",
                  ].join(" ")}
                />
                <a
                  href={`#${id}`}
                  data-native-scroll
                  aria-current={current ? "location" : undefined}
                  onClick={(e) => onClick(e, id)}
                  className="group/link relative flex size-[44px] items-center justify-end pr-2"
                >
                  <span
                    className={[
                      "tag-mono pointer-events-none absolute inset-y-0 right-full flex w-24 items-center justify-end whitespace-nowrap pr-2 opacity-0 transition-opacity duration-300 ease-[var(--ease-out)] group-hover:pointer-events-auto group-hover:opacity-100 group-focus-within:pointer-events-auto group-focus-within:opacity-100 motion-reduce:transition-none",
                      dark
                        ? current
                          ? "text-[var(--on-dark)]"
                          : "text-[var(--on-dark-soft)]"
                        : current
                          ? "text-[var(--ink)]"
                          : "text-[var(--ink-mute)]",
                    ].join(" ")}
                  >
                    {label[lang]}
                  </span>
                  <span
                    aria-hidden="true"
                    className={[
                      "w-6 origin-right transition-transform duration-300 ease-[var(--ease-out)] motion-reduce:transition-none",
                      current
                        ? "h-[2px] scale-x-100"
                        : "h-px scale-x-50 group-hover/link:scale-x-100 group-focus-visible/link:scale-x-100",
                      current
                        ? dark
                          ? "bg-[var(--accent-2-on-dark)]"
                          : "bg-[var(--accent-2)]"
                        : dark
                          ? "bg-[var(--on-dark-soft)]"
                          : "bg-[var(--ink-mute)]",
                    ].join(" ")}
                  />
                </a>
              </li>
            );
          })}
        </ol>
      </nav>
    </>
  );
}
