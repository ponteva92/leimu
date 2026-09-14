"use client";

/**
 * Preloader — skip on return visits (`sessionStorage.leimuSeen`),
 * otherwise lift after ~300ms so the wordmark never traps the user.
 */
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const EASE_PREMIUM = [0.22, 1, 0.36, 1] as const;

export function Preloader() {
  const [done, setDone] = useState(false);

  useEffect(() => {
    let cancelled = false;

    if (sessionStorage.getItem("leimuSeen")) {
      setDone(true);
      return;
    }

    const finish = () => {
      if (cancelled) return;
      sessionStorage.setItem("leimuSeen", "1");
      setDone(true);
    };

    const cap = window.setTimeout(finish, 300);

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
