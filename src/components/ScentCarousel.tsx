"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { featuredScents } from "@/lib/scents";
import { COPY } from "@/lib/copy";
import { useStore } from "@/context/store";
import type { Scent } from "@/types";

export function ScentCarousel({
  onSelect,
  onHover,
  onLeave,
  labelledBy,
}: {
  onSelect: (scent: Scent) => void;
  onHover?: (waxColor: string) => void;
  onLeave?: () => void;
  labelledBy?: string;
}) {
  const { lang } = useStore();
  const scents = featuredScents();
  const scrollerRef = useRef<HTMLDivElement>(null);
  const reduceRef = useRef(false);

  useEffect(() => {
    reduceRef.current = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }, []);

  const scrollByCard = (dir: -1 | 1) => {
    const el = scrollerRef.current;
    if (!el) return;
    const card = el.querySelector<HTMLElement>("[data-scent-card]");
    const delta = (card?.offsetWidth ?? 280) + 16;
    el.scrollBy({
      left: dir * delta,
      behavior: reduceRef.current ? "auto" : "smooth",
    });
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowRight") {
      e.preventDefault();
      scrollByCard(1);
    } else if (e.key === "ArrowLeft") {
      e.preventDefault();
      scrollByCard(-1);
    }
  };

  return (
    <div className="relative">
      <button
        type="button"
        className="absolute left-0 top-1/2 z-20 hidden h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-[var(--line)] bg-[var(--bg)]/90 text-[var(--ink)] shadow-e2 backdrop-blur-sm md:flex"
        onClick={() => scrollByCard(-1)}
        aria-label={COPY.scent.prev[lang]}
      >
        <svg width="14" height="14" viewBox="0 0 12 12" fill="none" aria-hidden="true">
          <path d="M8 2 4 6l4 4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
      <button
        type="button"
        className="absolute right-0 top-1/2 z-20 hidden h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-[var(--line)] bg-[var(--bg)]/90 text-[var(--ink)] shadow-e2 backdrop-blur-sm md:flex"
        onClick={() => scrollByCard(1)}
        aria-label={COPY.scent.next[lang]}
      >
        <svg width="14" height="14" viewBox="0 0 12 12" fill="none" aria-hidden="true">
          <path d="M4 2l4 4-4 4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-y-0 left-0 z-10 w-10 md:w-16"
        style={{ background: "linear-gradient(to right, var(--bg), transparent)" }}
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-y-0 right-0 z-10 w-10 md:w-16"
        style={{ background: "linear-gradient(to left, var(--bg), transparent)" }}
      />

      <div
        ref={scrollerRef}
        role="region"
        aria-labelledby={labelledBy}
        aria-label={labelledBy ? undefined : COPY.scent.region[lang]}
        tabIndex={0}
        data-lenis-prevent
        onKeyDown={onKeyDown}
        className="flex gap-4 overflow-x-auto scroll-smooth px-1 py-2 outline-none [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        style={{ scrollSnapType: "x mandatory" }}
      >
        {scents.map((scent) => (
          <ScentCard
            key={scent.id}
            scent={scent}
            lang={lang}
            onSelect={onSelect}
            onHover={onHover}
            onLeave={onLeave}
          />
        ))}
      </div>
    </div>
  );
}

function ScentCard({
  scent, lang, onSelect, onHover, onLeave,
}: {
  scent: Scent;
  lang: "fi" | "en";
  onSelect: (s: Scent) => void;
  onHover?: (waxColor: string) => void;
  onLeave?: () => void;
}) {
  return (
    <motion.button
      type="button"
      data-scent-card
      onClick={() => onSelect(scent)}
      onMouseEnter={() => onHover?.(scent.waxColor)}
      onMouseLeave={() => onLeave?.()}
      whileHover={{ y: -4 }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: "spring", stiffness: 380, damping: 26 }}
      className="group relative flex shrink-0 flex-col overflow-hidden rounded-2xl border border-[var(--line)] bg-[var(--bg)] text-left"
      style={{
        width: "min(70vw, 17.5rem)",
        scrollSnapAlign: "start",
      }}
    >
      <div className="relative aspect-square w-full overflow-hidden">
        <Image
          src={scent.image}
          alt={lang === "fi" ? scent.name : scent.nameEn}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-105"
          sizes="(max-width: 768px) 70vw, 280px"
        />
        <div className="absolute inset-0 flex items-center justify-center bg-[var(--ink)]/0 transition-colors duration-300 group-hover:bg-[var(--ink)]/15">
          <span className="tag-mono rounded-full border border-white/25 bg-black/35 px-2.5 py-1 text-[8px] !text-white opacity-0 shadow-md backdrop-blur-md transition-opacity group-hover:opacity-100">
            {COPY.scent.learn[lang]}
          </span>
        </div>
      </div>
      <div className="bg-[var(--ink)] p-3 pb-4">
        <p className="font-serif text-lg italic leading-tight text-white">
          {lang === "fi" ? scent.name : scent.nameEn}
        </p>
        <p className="tag-mono mt-1 text-[8px] !text-white/75">
          {lang === "fi" ? scent.profile : scent.profileEn}
        </p>
        <p className="mt-2 font-serif text-xl text-white">{scent.price}</p>
      </div>
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 bottom-0 h-0.5 origin-left scale-x-0 bg-gradient-to-r from-[var(--accent)] to-[var(--accent-2)] transition-transform duration-300 group-hover:scale-x-100"
      />
    </motion.button>
  );
}
