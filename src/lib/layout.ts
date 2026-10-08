/* ════════════════════════════════════════════════════════════════════════
   LEIMU — layout cache for scroll-linked code
   ------------------------------------------------------------------------
   Reading a box while the page scrolls can force the browser to finish
   layout in the middle of a frame, and under smooth scrolling that hitch
   shows as a stutter. Scroll handlers here work from boxes measured in
   document space only when layout may have changed (load, resize, web
   fonts, the body changing size). Each frame they place those boxes
   against the live scroll position with plain arithmetic.
   ════════════════════════════════════════════════════════════════════════ */

type Measure = () => void;

const measures = new Set<Measure>();
let pending = 0;
let teardown: (() => void) | null = null;

function flush() {
  pending = 0;
  measures.forEach((measure) => measure());
}

function schedule() {
  if (!pending) pending = requestAnimationFrame(flush);
}

function listen() {
  const observer = new ResizeObserver(schedule);
  observer.observe(document.body);
  window.addEventListener("resize", schedule);
  window.addEventListener("load", schedule);
  document.fonts?.ready.then(schedule);
  return () => {
    observer.disconnect();
    window.removeEventListener("resize", schedule);
    window.removeEventListener("load", schedule);
    cancelAnimationFrame(pending);
    pending = 0;
  };
}

/** Runs `measure` now, then again (at most once a frame) whenever layout
    may have changed. Returns the unsubscribe. */
export function onRelayout(measure: Measure) {
  measures.add(measure);
  if (!teardown) teardown = listen();
  measure();
  return () => {
    measures.delete(measure);
    if (measures.size > 0 || !teardown) return;
    teardown();
    teardown = null;
  };
}

/** A box in document coordinates. A sticky box also records the offset it
    sticks at and the bottom edge of the block that holds it. */
export type Box = {
  top: number;
  height: number;
  left: number;
  right: number;
  sticky?: { at: number; limit: number };
};

/** Null when the element renders no box (display: none, or inside a hidden
    layout). A sticky element is measured at its resting place in flow,
    which assumes it leads its parent, as every pinned stage here does. */
export function measureBox(el: HTMLElement): Box | null {
  if (el.getClientRects().length === 0) return null;
  const y = window.scrollY;
  const rect = el.getBoundingClientRect();
  const style = getComputedStyle(el);
  const parent = el.parentElement;
  if (style.position === "sticky" && parent) {
    const block = parent.getBoundingClientRect();
    return {
      top: block.top + y,
      height: rect.height,
      left: rect.left,
      right: rect.right,
      sticky: { at: parseFloat(style.top) || 0, limit: block.bottom + y },
    };
  }
  return { top: rect.top + y, height: rect.height, left: rect.left, right: rect.right };
}

/** Where the box's top edge sits in the viewport at scroll position `y`. */
export function viewTop({ top, height, sticky }: Box, y: number) {
  if (!sticky) return top - y;
  return Math.min(Math.max(top - y, sticky.at), sticky.limit - height - y);
}

/** The fixed header's bar (h-16): 4rem at the root font size. */
export function barHeight() {
  return 4 * parseFloat(getComputedStyle(document.documentElement).fontSize);
}
