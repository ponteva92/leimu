"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight } from "@phosphor-icons/react";
import { useStore } from "@/context/store";
import { formatEuro } from "@/lib/scents";

/** A quiet way out of the narrative, available once its opening action leaves. */
export function OrderShortcut() {
  const pathname = usePathname();
  const lang = useStore((state) => state.lang);
  const quantity = useStore((state) => state.cartTotalQty());
  const price = useStore((state) => state.cartTotalPrice());
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setVisible(false);
    if (pathname !== "/" && pathname !== "/tarina") return;
    const opening = Array.from(document.querySelectorAll<HTMLElement>("[data-order-entry]")).find((el) => el.getClientRects().length > 0);
    const ending = document.querySelector<HTMLElement>("[data-final-order]");
    const ceremony = document.querySelector<HTMLElement>("#sinetti");
    if (!opening) return;
    let openingVisible = true;
    let endingVisible = false;
    let ceremonyVisible = false;
    const observer = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (entry.target === opening) openingVisible = entry.isIntersecting;
        if (entry.target === ending) endingVisible = entry.isIntersecting;
        if (entry.target === ceremony) ceremonyVisible = entry.isIntersecting;
      }
      setVisible(!openingVisible && !endingVisible && !ceremonyVisible && window.scrollY > 100);
    }, { rootMargin: "-72px 0px 0px" });
    observer.observe(opening);
    if (ending) observer.observe(ending);
    // The ceremony has its own order action and needs the full small screen.
    if (ceremony) observer.observe(ceremony);
    return () => observer.disconnect();
  }, [pathname]);

  return (
    <AnimatePresence>
      {visible && <motion.aside className="order-shortcut" aria-label={lang === "fi" ? "Valitse oma LEIMU" : "Choose your LEIMU"}
        initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 12 }} transition={{ duration: 0.2 }}>
        <div>
          <p className="font-serif text-lg leading-tight">{quantity ? (lang === "fi" ? "Sinun LEIMUsi" : "Your LEIMU") : (lang === "fi" ? "Oma hetkesi." : "Your moment.")}</p>
          <p className="mt-1 text-xs text-[var(--ink-mute)]">{quantity ? `${quantity} ${lang === "fi" ? "kpl" : "pcs"} · ${formatEuro(price)}` : `${lang === "fi" ? "Alkaen" : "From"} ${formatEuro(9)} · ${lang === "fi" ? "oma viesti mukana" : "your message included"}`}</p>
        </div>
        <Link href="/tuotteet#configurator" className="button-ink shrink-0">
          {quantity ? (lang === "fi" ? "Jatka tilausta" : "Your order") : (lang === "fi" ? "Valitse oma" : "Choose yours")}
          <ArrowRight size={15} aria-hidden="true" />
        </Link>
      </motion.aside>}
    </AnimatePresence>
  );
}
