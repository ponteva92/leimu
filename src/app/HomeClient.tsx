"use client";

import { useCallback, useEffect, useRef, type RefObject } from "react";
import { motion, useMotionValueEvent, useScroll } from "framer-motion";
import { ArrowRight } from "@phosphor-icons/react";
import { useStore } from "@/context/store";
import { ScentModal } from "@/components/ScentModal";
import {
  headingReveal, headingCinematic, fadeUpItem,
  staggerCinematic, VIEWPORT_NEAR,
} from "@/lib/motionVariants";
import { barHeight, measureBox, onRelayout } from "@/lib/layout";
import { coverVars } from "@/lib/timeline";
import { HeroCandle, COVER_SVH as HERO_COVER_SVH } from "@/components/hero/HeroCandle";
import { GiftCeremony, COVER_SVH as SEAL_COVER_SVH } from "@/components/GiftCeremony";
import { CraftFilm, COVER_SVH as CRAFT_COVER_SVH } from "@/components/home/CraftFilm";
import { ScentLibrary } from "@/components/home/ScentLibrary";
import { QuoteWall } from "@/components/home/QuoteWall";
import { ChapterRail, type Chapter } from "@/components/story/ChapterRail";
import { CountUp } from "@/components/story/CountUp";
import { DrawnRule } from "@/components/DrawnRule";

/* ─── Craft Ledger ──────────────────────────────────
   Three true numerals on one hairline band, tabular mono. The old fourth
   "stat" (one batch at a time) was words posing as a number; that fact
   lives in the story copy below. Numerals count up once as the band
   enters — a ledger being tallied, not a dashboard being scrubbed. */
function CraftLedger() {
  const lang = useStore((s) => s.lang);

  const stats = [
    { value: 100, suffix: "%", label: { fi: "Soijavahaa", en: "Soy wax" } },
    { value: 36, prefix: "~", suffix: " h", label: { fi: "Paloaika", en: "Burn time" } },
    { value: 5, label: { fi: "Tuoksua", en: "Scents" } },
  ];

  return (
    <section className="border-y border-[var(--line)] bg-[var(--bg-2)]">
      <motion.div
        className="max-w-6xl mx-auto px-6 md:px-10 py-10 md:py-12 grid grid-cols-3 gap-6 text-center md:text-left"
        variants={staggerCinematic}
        initial="hidden"
        whileInView="visible"
        viewport={VIEWPORT_NEAR}
      >
        {stats.map((s) => (
          <motion.div key={s.label.fi} variants={fadeUpItem} className="flex flex-col gap-1.5">
            <p className="font-mono text-2xl md:text-3xl tracking-tight tabular-nums text-[var(--ink)]">
              <CountUp prefix={s.prefix} value={s.value} suffix={s.suffix} />
            </p>
            <p className="tag-mono">{s.label[lang]}</p>
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
}

/* ─── Instagram Feed (Behold widget, deferred) ────────────────────
   The third-party script loads once the page has loaded and scrolling
   has paused for a second, at the next idle moment, so the feed starts
   loading while the reader is still rather than mid-scroll. The
   container reserves height so the feed never shifts layout. Real
   photos beat any placeholder grid. */
function InstagramFeed() {
  const lang = useStore((s) => s.lang);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const mount = () => {
      if (!document.querySelector("script[data-behold]")) {
        const s = document.createElement("script");
        s.type = "module";
        s.src = "https://w.behold.so/widget.js";
        s.setAttribute("data-behold", "1");
        document.head.appendChild(s);
      }
      if (!el.querySelector("behold-widget")) {
        const w = document.createElement("behold-widget");
        w.setAttribute("feed-id", "Z0vXK9Le7HnNNay5tri8");
        el.appendChild(w);
      }
    };

    let idle = 0;
    let quiet = 0;
    // Mount after a second without scrolling, at the next idle moment.
    const wait = () => {
      window.clearTimeout(quiet);
      if (idle) window.cancelIdleCallback(idle);
      idle = 0;
      quiet = window.setTimeout(() => {
        if (typeof window.requestIdleCallback === "function") {
          idle = window.requestIdleCallback(run, { timeout: 1000 });
        } else {
          run();
        }
      }, 1000);
    };
    const run = () => {
      window.removeEventListener("scroll", wait);
      mount();
    };
    const start = () => {
      window.addEventListener("scroll", wait, { passive: true });
      wait();
    };
    if (document.readyState === "complete") start();
    else window.addEventListener("load", start, { once: true });
    return () => {
      window.removeEventListener("load", start);
      window.removeEventListener("scroll", wait);
      window.clearTimeout(quiet);
      if (idle) window.cancelIdleCallback(idle);
    };
  }, []);

  return (
    <section className="py-24 px-6 md:px-10 max-w-7xl mx-auto">
      <div className="flex items-end justify-between mb-10 flex-wrap gap-4">
        <motion.h2
          className="heading-display text-5xl md:text-6xl text-[var(--ink)]"
          variants={headingReveal}
          initial="hidden"
          whileInView="visible"
          viewport={VIEWPORT_NEAR}
        >
          {lang === "fi" ? <>@leimucandles <em>Instagramissa.</em></> : <>@leimucandles on <em>Instagram.</em></>}
        </motion.h2>
        <a
          href="https://www.instagram.com/leimucandles/"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 tag-mono hover:text-[var(--ink)] transition-colors"
        >
          {lang === "fi" ? "Avaa Instagram" : "Open Instagram"}
          <ArrowRight size={13} weight="light" aria-hidden="true" />
        </a>
      </div>
      <div ref={containerRef} className="w-full min-h-[320px]" />
    </section>
  );
}

/* ─── Materials index — ledger, no icon boxes ───────────────────── */
function MaterialsIndex() {
  const lang = useStore((s) => s.lang);

  const rows = [
    {
      name: { fi: "Soijavaha", en: "Soy wax" },
      spec: "100%",
      desc: {
        fi: "Luonnollinen soijavaha palaa puhtaasti ja pidempään kuin parafiini. Ei nokea.",
        en: "Natural soy wax burns cleanly and longer than paraffin. No soot.",
      },
    },
    {
      name: { fi: "Sheabutter", en: "Shea butter" },
      spec: "~10%",
      desc: {
        fi: "Samettinen koostumus, pidentää paloaikaa luonnollisesti.",
        en: "Velvety texture, extends burn time naturally.",
      },
    },
    {
      name: { fi: "Puuvillasydän", en: "Cotton wick" },
      spec: "100%",
      desc: {
        fi: "Ei metallia, ei sinkkiä. Puhdas, hiljainen liekki loppuun asti.",
        en: "No metal, no zinc. A clean, quiet flame all the way through.",
      },
    },
    {
      name: { fi: "Bambukansi", en: "Bamboo lid" },
      spec: "1",
      desc: {
        fi: "Uusiutuva, biohajoava kansi maapallon nopeimmin kasvavasta materiaalista.",
        en: "Renewable, biodegradable lid made from the fastest-growing material on earth.",
      },
    },
  ];

  return (
    <section className="border-t border-[var(--line)] bg-[var(--bg-2)]">
      <div className="mx-auto max-w-7xl px-6 py-16 md:px-10 md:py-24">
        <div className="grid gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:gap-20">
          <motion.div
            variants={staggerCinematic}
            initial="hidden"
            whileInView="visible"
            viewport={VIEWPORT_NEAR}
          >
            <motion.p variants={fadeUpItem} className="tag-mono mb-4">
              {lang === "fi" ? "Raaka-aineet" : "Materials"}
            </motion.p>
            <motion.h2
              variants={headingCinematic}
              className="heading-display text-4xl text-[var(--ink)] md:text-5xl"
            >
              {lang === "fi" ? (
                <>Tarjoan valikoidut, laadukkaat <em>raaka-aineet.</em></>
              ) : (
                <>Selected, uncompromising <em>materials.</em></>
              )}
            </motion.h2>
          </motion.div>

          <motion.ul
            variants={staggerCinematic}
            initial="hidden"
            whileInView="visible"
            viewport={VIEWPORT_NEAR}
          >
            {rows.map((row, i) => (
              <motion.li
                key={row.name.en}
                variants={fadeUpItem}
                className="relative grid grid-cols-[5.5rem_1fr] gap-4 py-5 md:grid-cols-[6.5rem_minmax(0,11rem)_1fr] md:gap-8"
              >
                {/* Each row's rule draws itself in; the last row closes the ledger. */}
                <DrawnRule className="absolute inset-x-0 top-0" />
                {i === rows.length - 1 && <DrawnRule className="absolute inset-x-0 bottom-0" />}
                <p className="font-mono text-lg tabular-nums text-[var(--ink)]">{row.spec}</p>
                <p className="font-serif text-xl italic text-[var(--ink)]">{row.name[lang]}</p>
                <p className="col-span-2 text-[15px] leading-relaxed text-[var(--ink-soft)] md:col-span-1">
                  {row.desc[lang]}
                </p>
              </motion.li>
            ))}
          </motion.ul>
        </div>
      </div>
    </section>
  );
}

/* ─── Hero hand-off ────────────────────────────────────────────────
   Watches the paper sheet's top edge. While the hero is still under the
   header bar the bar stays dark glass; once the sheet covers the hero
   completely, both WebGL loops park. Works for the pinned desktop hero
   and the in-flow phone hero alike. The sheet is measured only when
   layout may have changed (lib/layout), and the store hears only the
   flips, so scrolling never re-renders the page. */
function useHeroSheet(sheetRef: RefObject<HTMLDivElement>) {
  const { scrollY } = useScroll();
  const cache = useRef<{ top: number; bar: number } | null>(null);

  const update = useCallback(() => {
    const c = cache.current;
    if (!c) return;
    const top = c.top - scrollY.get();
    const store = useStore.getState();
    const underBar = top > c.bar;
    if (store.heroUnderBar !== underBar) store.setHeroUnderBar(underBar);
    const active = top > 0;
    if (store.heroActive !== active) store.setHeroActive(active);
  }, [scrollY]);

  useMotionValueEvent(scrollY, "change", update);

  useEffect(() => {
    const unsubscribe = onRelayout(() => {
      const sheet = sheetRef.current;
      const box = sheet && measureBox(sheet);
      cache.current = box ? { top: box.top, bar: barHeight() } : null;
      update();
    });
    return () => {
      unsubscribe();
      const store = useStore.getState();
      store.setHeroUnderBar(true);
      store.setHeroActive(true);
    };
  }, [sheetRef, update]);
}

const CHAPTERS: Chapter[] = [
  { id: "liekki", label: { fi: "Liekki", en: "Flame" } },
  { id: "kasityo", label: { fi: "Käsityö", en: "Craft" } },
  { id: "tuoksut", label: { fi: "Tuoksut", en: "Scents" } },
  { id: "sinetti", label: { fi: "Sinetti", en: "Seal" } },
  { id: "aanet", label: { fi: "Äänet", en: "Voices" } },
];

/* ─── Page ──────────────────────────────────────────────────────────
   On desktop the hero pins for its ignition, then this opaque, higher-z
   sheet rises over it. The craft film pins the same way, and the scent
   library rises over its last stretch as a second sheet. On large
   screens (the `stage` screen) the gift ceremony pins too, and the
   quote wall rises over it as a third. Phones and reduced motion keep
   everything in normal flow. Each sheet marks its tone (data-tone) for
   the chapter rail, which inks every tick to match the surface beneath
   it. */
export function HomeClient() {
  const sheetRef = useRef<HTMLDivElement>(null);
  useHeroSheet(sheetRef);

  return (
    <>
      <ScentModal />
      <HeroCandle />
      <ChapterRail chapters={CHAPTERS} startRef={sheetRef} />
      {/* The pull-up is HeroCandle's COVER_SVH. */}
      <div
        ref={sheetRef}
        data-tone="light"
        className="relative z-10 bg-[var(--bg)] shadow-[0_-24px_70px_-18px_rgba(26,24,20,0.28)] md:motion-safe:-mt-[var(--cover)]"
        style={coverVars(HERO_COVER_SVH)}
      >
        <div aria-hidden="true" className="sheet-seam" />
        <CraftLedger />
        <CraftFilm />
        {/* The pull-up is CraftFilm's COVER_SVH. */}
        <div
          data-tone="light"
          className="relative z-10 bg-[var(--bg)] md:motion-safe:-mt-[var(--cover)] md:motion-safe:shadow-[0_-24px_70px_-18px_rgba(26,24,20,0.2)]"
          style={coverVars(CRAFT_COVER_SVH)}
        >
          <div aria-hidden="true" className="sheet-seam hidden md:motion-safe:block" />
          <ScentLibrary />
        </div>
        <GiftCeremony chapter />
        {/* The pull-up is GiftCeremony's COVER_SVH. */}
        <div
          data-tone="light"
          className="relative z-10 bg-[var(--bg)] stage:-mt-[var(--cover)] stage:shadow-[0_-24px_70px_-18px_rgba(26,24,20,0.2)]"
          style={coverVars(SEAL_COVER_SVH)}
        >
          <div aria-hidden="true" className="sheet-seam hidden stage:block" />
          <QuoteWall />
        </div>
        <InstagramFeed />
        <MaterialsIndex />
      </div>
    </>
  );
}
