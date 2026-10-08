"use client";

/* ════════════════════════════════════════════════════════════════════════
   LEIMU — Craft film (home chapter "Käsityö")
   ------------------------------------------------------------------------
   Pinned (md+, motion allowed): a 400svh track holds a 100svh sticky stage.
   The studio still and headline open the chapter, then four beats of the
   process (materials, pour, cure, finishing) wipe up through the same
   frame while their captions crossfade beside it. A rolling step counter
   and an amber hairline keep the place. The last stretch of the track is
   the cover: the stage recedes as the scent library sheet rises over it.

   Phones and reduced motion get the same content in normal flow: the
   opening, then the beats in a swipe rail (phones) or a grid (desktop).
   ════════════════════════════════════════════════════════════════════════ */

import { useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  easeInOut, easeOut, motion, useInView, useTransform,
  type MotionValue,
} from "framer-motion";
import { ArrowRight } from "@phosphor-icons/react";
import { useStore } from "@/context/store";
import { useMediaQuery } from "@/lib/pin";
import { CRAFT_BEATS, PROCESS_STEPS } from "@/lib/process";
import { beatWindows, coverStart, mid, trackVars } from "@/lib/timeline";
import {
  fadeUpItem, headingCinematic, staggerCinematic, VIEWPORT_NEAR,
} from "@/lib/motionVariants";
import { Crossfade } from "@/components/story/Crossfade";
import { StepTitle } from "@/components/story/StepTitle";
import { WipeStill } from "@/components/story/WipeStill";
import { useCoverRecede, useTrackProgress, useWillChange } from "@/components/story/hooks";

type Lang = "fi" | "en";

/* ── Timeline ──────────────────────────────────────────────────────────
   The track's height and the scent library sheet's pull-up in HomeClient
   read these through CSS variables, so the classes can't drift from the
   timeline (see lib/timeline).                                           */
const TRACK_SVH = 400;
export const COVER_SVH = 40;
const COVER_START = coverStart(TRACK_SVH, COVER_SVH);

const BEATS = CRAFT_BEATS.length;
/** Scroll window of beat k's transition. */
const wipe = beatWindows(BEATS, {
  head: 0.08, // the opening holds before the first wipe
  tail: 0.2, // the last beat holds; the cover runs inside this stretch
});

const STEP_TOTAL = String(PROCESS_STEPS.length).padStart(2, "0");

/* The counter strip rolls one number per beat after the first. */
const COUNTER_INPUT = CRAFT_BEATS.slice(1).flatMap((_, j) => wipe(j + 1));
const COUNTER_OUTPUT = CRAFT_BEATS.slice(1).flatMap((_, j) => [
  `${(-j * 100) / BEATS}%`,
  `${(-(j + 1) * 100) / BEATS}%`,
]);

/* The hairline fills one step per beat, in time with the counter. */
const FILL_INPUT = CRAFT_BEATS.flatMap((_, k) => wipe(k));
const FILL_OUTPUT = CRAFT_BEATS.flatMap((_, k) => [k / BEATS, (k + 1) / BEATS]);

const OPENING_SRC = "/images/process-5.jpg";

const COPY = {
  tag: { fi: "Käsityö", en: "Craft" },
  step: { fi: "Vaihe", en: "Step" },
  body: {
    fi: "Jokainen kynttilä valmistettu käsityönä, yksi kerrallaan. Soijavahaa ja sheabutteria, suomalaisen metsän tuoksuilla. Kaikki purkit ovat läpikuultavaa maitolasia.",
    en: "Each candle is made by hand, one at a time. Soy wax and shea butter, scented like the Finnish forest. Every jar is translucent frosted milk glass.",
  },
  alt: {
    fi: "Kynttilän valmistus Oulussa, yksi purkki kerrallaan",
    en: "Candle making in Oulu, one jar at a time",
  },
  story: { fi: "Lue koko tarina", en: "Read full story" },
  rail: { fi: "Valmistuksen vaiheet", en: "How a candle is made" },
};

/* ── Shared pieces ────────────────────────────────────────────────── */
function CraftHeading({ lang }: { lang: Lang }) {
  return lang === "fi" ? (
    <>Pienestä intohimosta syntyi <em>LEIMU.</em></>
  ) : (
    <>From a small passion, <em>LEIMU</em> was born.</>
  );
}

function StoryLink({ lang }: { lang: Lang }) {
  return (
    <Link
      href="/tarina"
      className="group inline-flex min-h-11 w-fit items-center gap-2 tag-mono text-[var(--accent-2-text)] transition-colors hover:text-[var(--ink)]"
    >
      {COPY.story[lang]}
      <ArrowRight
        size={13}
        weight="light"
        aria-hidden="true"
        className="transition-transform duration-base group-hover:translate-x-1"
      />
    </Link>
  );
}

function StudioPlaque() {
  return (
    <span className="caption-plaque absolute bottom-4 left-4 z-10 px-3 py-2 font-mono text-[12px] uppercase tracking-[0.16em]">
      Oulu · Studio
    </span>
  );
}

/* ── Film still ────────────────────────────────────────────────────────
   Still i arrives on beat i-1 and gives way on beat i, settling from a
   slight zoom as it wipes in and dimming under the next still.           */
function FilmStill({ p, index, src, alt, eager = false }: {
  p: MotionValue<number>;
  index: number;
  src: string;
  alt: string;
  eager?: boolean;
}) {
  return (
    <WipeStill p={p} arrive={wipe(index - 1)} leave={wipe(index)} zoom={1.12} shade={0.45}>
      <Image
        src={src}
        alt={alt}
        fill
        loading={eager ? "eager" : "lazy"}
        className="object-cover"
        sizes="(min-width: 1280px) 660px, 50vw"
      />
    </WipeStill>
  );
}

/* ── Step counter ──────────────────────────────────────────────────────
   "Vaihe 04 / 06": the number rolls up a strip as each beat lands. It is
   decorative; each step heading carries the same label for screen readers. */
function StepCounter({ p, lang }: { p: MotionValue<number>; lang: Lang }) {
  const first = wipe(0);
  const opacity = useTransform(p, [mid(first), first[1]], [0, 1]);
  const y = useTransform(p, COUNTER_INPUT, COUNTER_OUTPUT, { ease: easeInOut });

  return (
    <motion.p
      aria-hidden="true"
      className="tag-mono flex items-center gap-[0.6em] leading-[1.2em]"
      style={{ opacity }}
    >
      <span>{COPY.step[lang]}</span>
      <span className="block h-[1.2em] overflow-hidden">
        <motion.span className="block" style={{ y }}>
          {CRAFT_BEATS.map((step) => (
            <span key={step.num} className="block h-[1.2em]">
              {step.num}
            </span>
          ))}
        </motion.span>
      </span>
      <span>/ {STEP_TOTAL}</span>
    </motion.p>
  );
}

function BeatProgress({ p }: { p: MotionValue<number> }) {
  const scaleX = useTransform(p, FILL_INPUT, FILL_OUTPUT, { ease: easeInOut });

  return (
    <div aria-hidden="true" className="relative h-px w-full bg-[var(--line)]">
      <motion.div className="absolute inset-0 origin-left bg-[var(--accent-2)]" style={{ scaleX }} />
    </div>
  );
}

/* ── Pinned film ───────────────────────────────────────────────────── */
function Film({ lang }: { lang: Lang }) {
  const trackRef = useRef<HTMLDivElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);
  const settleRef = useRef<HTMLDivElement>(null);
  const { approach, p } = useTrackProgress(trackRef, TRACK_SVH);
  // The stage's approach, before it pins: the opening still settles in.
  const settle = useTransform(approach, [0, 1], [1.1, 1], { ease: easeOut });
  const recede = useCoverRecede(p, COVER_START);
  useWillChange(approach, [[0, 1]], [settleRef]);
  useWillChange(p, [[COVER_START, 1]], [gridRef]);
  // Hidden stills sit outside the frame's clip, where lazy loading would
  // wait until each wipe had already begun. Fetch them as the track nears.
  const near = useInView(trackRef, { once: true, margin: "100% 0px" });

  return (
    <div
      ref={trackRef}
      data-pin-rest={0}
      className="relative hidden md:motion-safe:block md:motion-safe:h-[var(--track)]"
      style={trackVars(TRACK_SVH)}
    >
      <div className="sticky top-0 flex h-[100svh] items-center">
        <motion.div
          ref={gridRef}
          className="mx-auto grid w-full max-w-7xl origin-top grid-cols-2 items-center gap-10 px-10 lg:grid-cols-[1.15fr_0.85fr] lg:gap-16"
          style={{ scale: recede }}
        >
          <div className="paper-well">
            <div className="relative isolate aspect-[4/5] max-h-[72svh] w-full overflow-hidden rounded-[calc(var(--radius-lg)-6px)] lg:aspect-[5/4]">
              <motion.div ref={settleRef} className="absolute inset-0" style={{ scale: settle }}>
                <FilmStill p={p} index={0} src={OPENING_SRC} alt={COPY.alt[lang]} />
                {CRAFT_BEATS.map((step, k) => (
                  <FilmStill
                    key={step.num}
                    p={p}
                    index={k + 1}
                    src={step.img}
                    alt={step.title[lang]}
                    eager={near}
                  />
                ))}
              </motion.div>
              <StudioPlaque />
            </div>
          </div>

          <motion.div
            className="flex flex-col gap-8"
            variants={staggerCinematic}
            initial="hidden"
            whileInView="visible"
            viewport={VIEWPORT_NEAR}
          >
            <motion.div variants={fadeUpItem} className="flex items-center justify-between gap-6">
              <p className="tag-mono">{COPY.tag[lang]}</p>
              <StepCounter p={p} lang={lang} />
            </motion.div>

            <div className="grid">
              <Crossfade p={p} arrive={wipe(-1)} leave={wipe(0)}>
                <motion.h2
                  variants={headingCinematic}
                  className="heading-display text-5xl text-[var(--ink)] xl:text-6xl"
                >
                  <CraftHeading lang={lang} />
                </motion.h2>
                <motion.p
                  variants={fadeUpItem}
                  className="mt-6 max-w-[46ch] leading-relaxed text-[var(--ink-soft)]"
                >
                  {COPY.body[lang]}
                </motion.p>
              </Crossfade>
              {CRAFT_BEATS.map((step, k) => (
                <Crossfade key={step.num} p={p} arrive={wipe(k)} leave={wipe(k + 1)}>
                  <h3 className="heading-display text-4xl text-[var(--ink)] xl:text-5xl">
                    <span className="sr-only">
                      {COPY.step[lang]} {step.num} / {STEP_TOTAL}:{" "}
                    </span>
                    <StepTitle title={step.title[lang]} />
                  </h3>
                  <p className="mt-5 max-w-[46ch] leading-relaxed text-[var(--ink-soft)]">
                    {step.desc[lang]}
                  </p>
                  <p className="tag-mono mt-6 leading-relaxed">{step.data[lang]}</p>
                </Crossfade>
              ))}
            </div>

            <motion.div variants={fadeUpItem}>
              <BeatProgress p={p} />
            </motion.div>
            <motion.div variants={fadeUpItem} className="-mt-3">
              <StoryLink lang={lang} />
            </motion.div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}

/* ── Stacked fallback (phones, reduced motion) ─────────────────────── */
function Stacked({ lang }: { lang: Lang }) {
  // The beats scroll sideways only on phones; elsewhere they form a grid
  // and the region needs no tab stop.
  const isRail = useMediaQuery("(max-width: 767px)");

  return (
    <div className="mx-auto max-w-7xl px-6 py-16 md:px-10 md:py-24 md:motion-safe:hidden">
      <div className="grid items-center gap-10 md:grid-cols-[1.15fr_0.85fr] md:gap-16">
        <div className="paper-well">
          <div className="relative isolate aspect-[4/5] overflow-hidden rounded-[calc(var(--radius-lg)-6px)] md:aspect-[5/4]">
            <Image
              src={OPENING_SRC}
              alt={COPY.alt[lang]}
              fill
              className="object-cover"
              sizes="(max-width: 767px) 100vw, 55vw"
            />
            <StudioPlaque />
          </div>
        </div>

        <motion.div
          className="flex flex-col gap-6"
          variants={staggerCinematic}
          initial="hidden"
          whileInView="visible"
          viewport={VIEWPORT_NEAR}
        >
          <motion.p variants={fadeUpItem} className="tag-mono">
            {COPY.tag[lang]}
          </motion.p>
          <motion.h2
            variants={headingCinematic}
            className="heading-display text-5xl text-[var(--ink)] md:text-6xl"
          >
            <CraftHeading lang={lang} />
          </motion.h2>
          <motion.p
            variants={fadeUpItem}
            className="max-w-[65ch] leading-relaxed text-[var(--ink-soft)]"
          >
            {COPY.body[lang]}
          </motion.p>
        </motion.div>
      </div>

      <div
        role="region"
        aria-label={COPY.rail[lang]}
        tabIndex={isRail ? 0 : undefined}
        className="-mx-6 mt-14 snap-x snap-mandatory scroll-px-6 overflow-x-auto md:mx-0 md:mt-20 md:overflow-visible"
      >
        <ol className="flex w-max gap-4 px-6 md:grid md:w-auto md:grid-cols-2 md:gap-x-6 md:gap-y-12 md:px-0 xl:grid-cols-4">
          {CRAFT_BEATS.map((step) => (
            <li key={step.num} className="w-[78vw] snap-start md:w-auto">
              <div className="paper-well">
                <div className="relative aspect-[4/5] overflow-hidden rounded-[calc(var(--radius-lg)-6px)]">
                  <Image
                    src={step.img}
                    alt={step.title[lang]}
                    fill
                    className="object-cover"
                    sizes="(max-width: 767px) 78vw, (max-width: 1279px) 50vw, 25vw"
                  />
                </div>
              </div>
              <p className="tag-mono mt-5">
                {COPY.step[lang]} {step.num} / {STEP_TOTAL}
              </p>
              <h3 className="heading-display mt-2 text-3xl text-[var(--ink)]">
                <StepTitle title={step.title[lang]} />
              </h3>
              <p className="mt-3 leading-relaxed text-[var(--ink-soft)]">{step.desc[lang]}</p>
              <p className="tag-mono mt-4 leading-relaxed">{step.data[lang]}</p>
            </li>
          ))}
        </ol>
      </div>

      <div className="mt-10">
        <StoryLink lang={lang} />
      </div>
    </div>
  );
}

export function CraftFilm() {
  const lang = useStore((s) => s.lang);

  return (
    <section id="kasityo" aria-label={COPY.tag[lang]}>
      <Film lang={lang} />
      <Stacked lang={lang} />
    </section>
  );
}
