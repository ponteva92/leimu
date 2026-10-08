"use client";

/* ════════════════════════════════════════════════════════════════════════
   LEIMU — Tuotteet gift (chapter "Lahja")
   ------------------------------------------------------------------------
   What comes with every order: the sealed thank-you card, then the gift
   set in photographs and in words.

   On the stage: screen this sheet pulls up over the last 40svh of the
   craft film's track while that stage recedes. Elsewhere it follows the
   craft chapter in normal flow, after a drawn rule. The sealed message
   keeps its flow layout here; home holds the only pinned ceremony.

   Where pins run (md and up, motion allowed), each photo of the gift set
   enters with its own frame's rise up the screen. A wipe opens a frame
   from the bottom, which suits a frame shorter than the screen; a taller
   one would show bare paper for most of its rise, so its photo settles
   from a slight zoom instead. The copy arrives once, so it is never read
   while it moves.
   ════════════════════════════════════════════════════════════════════════ */

import { useRef, type ReactNode } from "react";
import Image from "next/image";
import {
  easeOut, motion, useInView, useScroll, useTransform, type MotionValue,
} from "framer-motion";
import { ArrowRight } from "@phosphor-icons/react";
import { useStore } from "@/context/store";
import { usePinned } from "@/lib/pin";
import { coverVars, type Span } from "@/lib/timeline";
import {
  fadeUpItem, headingCinematic, staggerCinematic, VIEWPORT_NEAR,
} from "@/lib/motionVariants";
import { DrawnRule } from "@/components/DrawnRule";
import { GiftCeremony } from "@/components/GiftCeremony";
import { WipeStill } from "@/components/story/WipeStill";
import { useWillChange } from "@/components/story/hooks";
import { COVER_SVH as CRAFT_COVER_SVH } from "./CraftChapter";

type Lang = "fi" | "en";

/* A frame's rise, from its top entering the screen to its foot entering. */
const RISE: Span = [0, 1];
/** The zoom a settling photo starts from, as the craft film's does. */
const SETTLE_ZOOM = 1.08;
const SIZES = "(max-width: 768px) 100vw, 50vw";

const COPY = {
  chapter: { fi: "Lahja", en: "Gift" },
  eyebrow: { fi: "Luksusta arjen keskelle", en: "Luxury for the everyday" },
  cta: { fi: "Tee tilaus", en: "Place an order" },
  bag: { fi: "Ilmainen lahjapussi jokaiseen tilaukseen", en: "A free gift bag with every order" },
  caption: { fi: "Tyylikäs lahjapussi + vahasinetti", en: "Elegant gift bag + wax seal" },
  candles: { fi: "Kolme LEIMU-kynttilää", en: "Three LEIMU candles" },
  studio: { fi: "Kynttilät valmiina studiossa", en: "Finished candles in the studio" },
  lit: {
    fi: "Palava LEIMU-kynttilä mustikoiden, vaniljan ja havun keskellä",
    en: "A lit LEIMU candle among blueberries, vanilla and pine",
  },
  set: { fi: "LEIMU-lahjasetti", en: "LEIMU gift set" },
};

const HEADING: Record<Lang, ReactNode> = {
  fi: <>Enemmän kuin<br />pelkkä <em>kynttilä.</em></>,
  en: <>More than<br />just a <em>candle.</em></>,
};

const STRONG = "font-medium text-[var(--ink)]";

const BODY: Record<Lang, ReactNode> = {
  fi: (
    <>
      <p className="text-lg">
        LEIMU on pala luksusta arjen keskelle, hetki, joka kuuluu vain sinulle.
        Jokainen kynttilä saapuu <span className={STRONG}>tyylikkäässä lahjapussissa</span>,
        joka on viimeistelty viimeistä yksityiskohtaa myöten.
      </p>
      <p>
        Kiitoskortti on kuoressa, jonka sulkee{" "}
        <span className={STRONG}>käsinleimattu vahasinetti</span>, LEIMU-logolla
        koristeltu, aito leima, joka tekee jokaisesta tilauksesta pienen seremonian.
      </p>
      <p>
        Sopii täydellisesti lahjaksi rakkaalle tai itsensä hemmotteluun. Koska
        jokainen ansaitsee hetken, joka tuntuu erityiseltä.
      </p>
    </>
  ),
  en: (
    <>
      <p className="text-lg">
        LEIMU is a piece of luxury in the middle of everyday life, a moment that
        belongs to you alone. Every candle arrives in{" "}
        <span className={STRONG}>an elegant gift bag</span>, finished down to the
        last detail.
      </p>
      <p>
        The thank-you card comes in an envelope closed with a{" "}
        <span className={STRONG}>hand-stamped wax seal</span>: a real seal bearing
        the LEIMU logo, which turns every order into a small ceremony.
      </p>
      <p>
        A perfect gift for someone dear, or a treat for yourself. Because everyone
        deserves a moment that feels special.
      </p>
    </>
  ),
};

/* The photo settles from a slight zoom over its frame's rise. */
function Settle({ p, children }: { p: MotionValue<number>; children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const scale = useTransform(p, RISE, [SETTLE_ZOOM, 1], { ease: easeOut });
  useWillChange(p, [RISE], [ref]);

  return (
    <motion.div ref={ref} className="absolute inset-0" style={{ scale }}>
      {children}
    </motion.div>
  );
}

/* ── Plate ─────────────────────────────────────────────────────────────
   A photo in a paper well. The well fades up once as it comes into view;
   when `scrubbed`, the photo also enters with its frame's rise, by the
   reveal that suits the frame (see top).                                 */
function Plate({ src, alt, reveal, scrubbed, className = "", frameClassName, children }: {
  src: string;
  alt: string;
  reveal: "settle" | "wipe";
  scrubbed: boolean;
  /** The well's place in its grid. */
  className?: string;
  /** The frame's shape. */
  frameClassName: string;
  /** Held still above the photo, such as a caption. */
  children?: ReactNode;
}) {
  const frameRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress: p } = useScroll({
    target: frameRef,
    offset: ["start end", "end end"],
  });
  // Load a viewport ahead. The wipe starts with its photo clipped, and
  // lazy loading waits for a clipped photo to be uncovered.
  const near = useInView(frameRef, { once: true, margin: "100% 0px" });

  const photo = (
    <Image
      src={src}
      alt={alt}
      fill
      loading={near ? "eager" : "lazy"}
      sizes={SIZES}
      className="object-cover"
    />
  );
  let still = photo;
  if (scrubbed) {
    still =
      reveal === "wipe" ? (
        <WipeStill p={p} arrive={RISE}>{photo}</WipeStill>
      ) : (
        <Settle p={p}>{photo}</Settle>
      );
  }

  return (
    <motion.div
      variants={fadeUpItem}
      initial="hidden"
      whileInView="visible"
      viewport={VIEWPORT_NEAR}
      className={`paper-well ${className}`.trim()}
    >
      <div
        ref={frameRef}
        className={`relative isolate overflow-hidden rounded-[calc(var(--radius-lg)-6px)] ${frameClassName}`}
      >
        {still}
        {children}
      </div>
    </motion.div>
  );
}

export function GiftChapter() {
  const lang = useStore((s) => s.lang);
  const scrubbed = usePinned();

  return (
    <section
      id="lahja"
      aria-label={COPY.chapter[lang]}
      data-tone="light"
      className="relative z-10 bg-[var(--bg)] stage:-mt-[var(--cover)] stage:shadow-[0_-24px_70px_-18px_rgba(26,24,20,0.2)]"
      style={coverVars(CRAFT_COVER_SVH)}
    >
      <div aria-hidden="true" className="sheet-seam hidden stage:block" />
      {/* In flow no sheet edge sets the chapters apart, so a rule does. */}
      <div className="mx-auto max-w-7xl px-6 md:px-10 stage:hidden">
        <DrawnRule />
      </div>

      <GiftCeremony ctaHref="#configurator" />

      <div className="mx-auto max-w-7xl px-6 md:px-10">
        <DrawnRule />

        {/* From md the tall plate fills both rows, so its foot lines up
            with the second landscape plate. */}
        <div className="grid gap-5 py-24 md:grid-cols-2">
          <Plate
            src="/images/3-kynttilaata.png"
            alt={COPY.candles[lang]}
            reveal="settle"
            scrubbed={scrubbed}
            className="md:row-span-2"
            frameClassName="aspect-[3/4] md:aspect-auto md:h-full"
          />
          <Plate
            src="/images/process-5.jpg"
            alt={COPY.studio[lang]}
            reveal="wipe"
            scrubbed={scrubbed}
            frameClassName="aspect-[5/4]"
          />
          <Plate
            src="/images/launch-kuva.png"
            alt={COPY.lit[lang]}
            reveal="wipe"
            scrubbed={scrubbed}
            frameClassName="aspect-[5/4]"
          />
        </div>

        <div className="grid items-center gap-16 pb-24 md:grid-cols-2">
          <motion.div
            variants={staggerCinematic}
            initial="hidden"
            whileInView="visible"
            viewport={VIEWPORT_NEAR}
          >
            <motion.p variants={fadeUpItem} className="tag-mono mb-3">
              {COPY.eyebrow[lang]}
            </motion.p>
            <motion.h2
              variants={headingCinematic}
              className="heading-display mb-8 text-4xl text-[var(--ink)] md:text-5xl"
            >
              {HEADING[lang]}
            </motion.h2>
            <motion.div
              variants={fadeUpItem}
              className="max-w-[65ch] space-y-5 leading-relaxed text-[var(--ink-soft)]"
            >
              {BODY[lang]}
            </motion.div>
            <motion.div
              variants={fadeUpItem}
              className="mt-10 flex flex-col items-start gap-4 sm:flex-row sm:items-center"
            >
              <a
                href="#configurator"
                className="inline-flex items-center gap-2 rounded-full bg-[var(--ink)] px-7 py-3.5 font-sans text-[13px] font-medium uppercase tracking-[0.08em] text-[var(--bg)] transition-colors duration-200 hover:bg-[var(--accent-2-strong)] focus-visible:rounded-full"
              >
                {COPY.cta[lang]}
                <ArrowRight size={13} weight="light" aria-hidden="true" />
              </a>
              <span className="tag-mono">{COPY.bag[lang]}</span>
            </motion.div>
          </motion.div>

          <Plate
            src="/images/Lahjasetti mainos.png"
            alt={COPY.set[lang]}
            reveal="settle"
            scrubbed={scrubbed}
            frameClassName="aspect-[1/1.1]"
          >
            <div className="absolute inset-x-5 bottom-5">
              <span className="caption-plaque inline-block px-4 py-2 font-mono text-[12px] uppercase tracking-[0.16em]">
                {COPY.caption[lang]}
              </span>
            </div>
          </Plate>
        </div>
      </div>
    </section>
  );
}
