"use client";

/**
 * Preloader — the first second.
 *
 * Holds a calm, neutral curtain over the page until the things that would
 * otherwise "pop" are ready: web fonts (document.fonts.ready) and the
 * window load event. A short minimum keeps the wordmark from flickering on
 * fast loads; a hard cap guarantees we never trap the user. The curtain
 * then lifts on the Premium Ease curve.
 */
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const EASE_PREMIUM = [0.22, 1, 0.36, 1] as const;

export function Preloader() {
  const [done, setDone] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const start = performance.now();

    const finish = () => {
      if (cancelled) return;
      const elapsed = performance.now() - start;
      const MIN_MS = 650; // let the mark breathe at least this long
      window.setTimeout(() => {
        if (!cancelled) setDone(true);
      }, Math.max(0, MIN_MS - elapsed));
    };

    const fontsReady: Promise<unknown> =
      typeof document !== "undefined" && "fonts" in document
        ? (document as Document & { fonts: FontFaceSet }).fonts.ready
        : Promise.resolve();

    const windowLoaded = new Promise<void>((resolve) => {
      if (document.readyState === "complete") resolve();
      else window.addEventListener("load", () => resolve(), { once: true });
    });

    Promise.all([fontsReady, windowLoaded]).then(finish);

    // Safety: never hold the curtain longer than 4s.
    const cap = window.setTimeout(() => {
      if (!cancelled) setDone(true);
    }, 4000);

    return () => {
      cancelled = true;
      window.clearTimeout(cap);
    };
  }, []);

  return (
    <AnimatePresence>
      {!done && (
        <motion.div
          className="fixed inset-0 z-[10000] flex items-center justify-center"
          style={{ backgroundColor: "var(--bg)" }}
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, filter: "blur(8px)" }}
          transition={{ duration: 0.9, ease: EASE_PREMIUM }}
          aria-hidden="true"
        >
          <div className="flex flex-col items-center gap-7">
            <motion.span
              className="font-serif text-3xl md:text-4xl tracking-[0.34em] text-[var(--ink)]"
              initial={{ opacity: 0.35 }}
              animate={{ opacity: [0.35, 1, 0.35] }}
              transition={{ duration: 2.6, repeat: Infinity, ease: "easeInOut" }}
            >
              LEIMU
            </motion.span>
            <div className="relative h-px w-28 overflow-hidden bg-[var(--line)]">
              <motion.div
                className="absolute inset-y-0 left-0 bg-[var(--accent-2)]"
                initial={{ width: "0%" }}
                animate={{ width: "100%" }}
                transition={{ duration: 2.4, ease: EASE_PREMIUM }}
              />
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
