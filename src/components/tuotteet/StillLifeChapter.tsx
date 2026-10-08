"use client";

/* ════════════════════════════════════════════════════════════════════════
   LEIMU — Tuotteet still life (chapter "Asetelma")
   ------------------------------------------------------------------------
   Left: the page's h1 and its promise. Right: the products photo. On
   desktop it melts out of dark wax on load (R3F); the plain photograph
   beneath is always the first paint.

   Pinned (md+, motion allowed): a 200svh track holds a 100svh sticky stage.
   From 20 to 50svh of scroll the photo dims toward dusk, and the body turns
   from how to order to how each candle is made. On a desktop the canvas
   dims the photo while its wax seals keep glowing; a tablet has no canvas,
   so an ink veil dims it instead. Over the last 40svh the scents sheet
   pulls up over the stage while it recedes. Phones and reduced motion get
   the same content in normal flow.
   ════════════════════════════════════════════════════════════════════════ */

import { useEffect, useRef, useState, type ComponentType } from "react";
import { motion, useTransform } from "framer-motion";
import { useStore } from "@/context/store";
import { EASE_PREMIUM } from "@/lib/motionVariants";
import { FINE_QUERY, REDUCE_QUERY, useMediaQuery, usePinned } from "@/lib/pin";
import { beatWindows, coverStart, trackVars } from "@/lib/timeline";
import { LogoMark } from "@/components/LogoMark";
import { SafeWebGL } from "@/components/SafeWebGL";
import { Crossfade } from "@/components/story/Crossfade";
import { useCoverRecede, useStageShown, useTrackProgress, useWillChange } from "@/components/story/hooks";
import type { HeroImageCanvasProps } from "./HeroImageCanvas";
import { HeroPhoto } from "./HeroPhoto";

const TRACK_SVH = 200;
/** How far the scents sheet pulls up over the stage. */
export const COVER_SVH = 40;
const COVER_START = coverStart(TRACK_SVH, COVER_SVH);
/* One wipe: the photo dims and the body turns over the same stretch. */
const wipe = beatWindows(1, { head: 0.2, tail: 0.5, fill: 1 });

const BODY = "w-full max-w-md text-base leading-relaxed text-[var(--ink-soft)] [text-wrap:wrap]";

const COPY = {
  fi: {
    eyebrow: "LEIMU · Tuotteet",
    l1: "Kynttilä, joka on",
    l2: "täysin sinun",
    lead: "Valitse purkin väri ja tuoksut, lisää koriin ja tilaa helposti.",
    craft:
      "Jokainen LEIMU valetaan käsin yksi purkki kerrallaan, 100 % soijavahasta ja sheabutterista, puhtaalla puuvillasydämellä ja Suomen luontoon inspiroituneilla tuoksuilla, läpikuultavaan maitolasipurkkiin. Viimeistelynä käsinleimattu vahasinetti ja tyylikäs lahjapussi. Pala luonnollista rauhaa, joka on täysin sinun.",
    alt: "LEIMU-kynttilät, bambukannet ja kultaiset vahasinetit",
  },
  en: {
    eyebrow: "LEIMU · Products",
    l1: "A candle that is",
    l2: "entirely yours",
    lead: "Choose your jar colour and scents, add to cart and order with ease.",
    craft:
      "Every LEIMU is hand-poured one jar at a time: 100% soy wax and shea butter, a pure cotton wick, and scents inspired by Finnish nature, in a translucent frosted milk-glass jar. Finished with a hand-stamped wax seal and an elegant gift bag. A piece of natural calm that is entirely yours.",
    alt: "LEIMU candles, bamboo lids and gold wax seals",
  },
} as const;

export function StillLifeChapter() {
  const lang = useStore((s) => s.lang);
  const t = COPY[lang] ?? COPY.fi;

  // Three.js never ships on the server or to a phone: the canvas chunk
  // loads only once a fine-pointer desktop is confirmed.
  const desktop = useMediaQuery(FINE_QUERY);
  const still = useMediaQuery(REDUCE_QUERY);
  const [Canvas, setCanvas] = useState<ComponentType<HeroImageCanvasProps> | null>(null);
  useEffect(() => {
    if (!desktop) return;
    let cancelled = false;
    import("./HeroImageCanvas").then((mod) => {
      if (!cancelled) setCanvas(() => mod.default);
    });
    return () => {
      cancelled = true;
    };
  }, [desktop]);

  const pinned = usePinned();
  const trackRef = useRef<HTMLDivElement>(null);
  const recedeRef = useRef<HTMLDivElement>(null);
  const veilRef = useRef<HTMLDivElement>(null);
  const track = useTrackProgress(trackRef, TRACK_SVH);
  const p = useTransform(track.p, (v) => (pinned ? v : 0));
  const dusk = useTransform(p, wipe(0), [0, 1]);
  // The tablet's veil stops short of the canvas's dusk, which keeps the
  // seals alight; a flat veil that dark would leave a black box.
  const veil = useTransform(dusk, [0, 1], [0, 0.5]);
  const recede = useCoverRecede(p, COVER_START);
  useWillChange(p, [[COVER_START, 1]], [recedeRef]);
  useWillChange(p, [wipe(0)], [veilRef], "opacity");

  // After the track ends, the stage rides up under the sheet. The canvas
  // loop runs only while some of it still shows. In flow the canvas renders
  // only on change, so this matters only while pinned.
  const active = useStageShown(track.leave, COVER_SVH);

  return (
    <div
      ref={trackRef}
      id="asetelma"
      className="relative md:motion-safe:h-[var(--track)]"
      style={trackVars(TRACK_SVH)}
    >
      <section
        data-tone="light"
        aria-label={t.eyebrow}
        className="relative z-0 flex min-h-[100svh] items-center overflow-hidden bg-[var(--bg)] md:motion-safe:sticky md:motion-safe:top-0 md:motion-safe:h-[100svh] md:motion-safe:min-h-0"
      >
        <motion.div ref={recedeRef} className="relative z-10 w-full" style={{ scale: recede }}>
          <div className="mx-auto grid w-full min-w-0 max-w-7xl grid-cols-1 items-center gap-10 px-6 pt-28 pb-16 md:grid-cols-2 md:gap-14 md:px-10 md:py-0">
            <motion.div
              className="order-2 flex min-w-0 flex-col gap-6 md:order-1"
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.9, ease: EASE_PREMIUM, delay: 0.15 }}
            >
              <div className="flex items-center gap-3">
                <LogoMark />
                <p className="tag-mono">{t.eyebrow}</p>
              </div>

              <h1 className="font-serif leading-[0.92] text-[var(--ink)]">
                <span className="block overflow-hidden pb-[0.05em]">
                  <motion.span
                    className="block text-2xl font-light tracking-tight text-[var(--ink-soft)] md:text-3xl"
                    initial={{ y: "115%", scale: 1.04 }}
                    animate={{ y: "0%", scale: 1 }}
                    transition={{ duration: 1.0, ease: EASE_PREMIUM, delay: 0.25 }}
                  >
                    {t.l1}
                  </motion.span>
                </span>
                <span className="mt-1 block overflow-hidden pb-[0.08em]">
                  <motion.span
                    className="block text-[clamp(2.4rem,12vw,6rem)] italic md:text-8xl"
                    initial={{ y: "115%", scale: 1.04 }}
                    animate={{ y: "0%", scale: 1 }}
                    transition={{ duration: 1.15, ease: EASE_PREMIUM, delay: 0.42 }}
                  >
                    {t.l2}
                  </motion.span>
                </span>
              </h1>

              {/* Pinned: how to order, then how each candle is made, in one
                  cell. In flow the two read as one paragraph. */}
              <div className="hidden md:motion-safe:grid">
                <Crossfade p={p} arrive={wipe(-1)} leave={wipe(0)}>
                  <p className={BODY}>{t.lead}</p>
                </Crossfade>
                <Crossfade p={p} arrive={wipe(0)} leave={wipe(1)}>
                  <p className={BODY}>{t.craft}</p>
                </Crossfade>
              </div>
              <p className={`${BODY} md:motion-safe:hidden`}>
                {t.lead} {t.craft}
              </p>
            </motion.div>

            {/* The page's largest paint: it shows at once, with no entrance. */}
            <div
              className="relative order-1 h-[46svh] min-h-[300px] w-full overflow-hidden rounded-3xl border border-[var(--line)] md:order-2 md:h-[min(78svh,calc(100svh-9.5rem))]"
              style={{ boxShadow: "0 30px 80px -34px rgba(26,24,20,0.55)" }}
            >
              <HeroPhoto alt={t.alt} />
              {Canvas && desktop && (
                <SafeWebGL fallback={null}>
                  <Canvas dusk={dusk} active={active} still={still} />
                </SafeWebGL>
              )}
              {pinned && !desktop && (
                <motion.div
                  ref={veilRef}
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-0 bg-[var(--ink)]"
                  style={{ opacity: veil }}
                />
              )}
            </div>
          </div>
        </motion.div>
      </section>
    </div>
  );
}
