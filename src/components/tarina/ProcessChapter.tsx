"use client";

/* ════════════════════════════════════════════════════════════════════════
   LEIMU — Tarina process (chapter "Polku")
   ------------------------------------------------------------------------
   The six steps from raw materials to a finished candle, strung on one
   amber thread.

   Pinned (the stage: screen): a 400svh track holds a 100svh sticky stage.
   After a short hold on the heading, the row of steps travels left while
   the page scrolls down, until the last step rests at the right edge. The
   thread runs from the first step's numeral to the last, and its fill
   grows with the travel, so it reaches step i at travel i/5 on any screen.
   Each numeral lights as the fill arrives, and a counter below the row
   names the step reached. Only the row's travel distance is measured, on
   resize and never on scroll. Over the last 40svh the materials room
   pulls up over the stage while it recedes. Short screens (under 720
   tall) get flatter photos and tighter gaps, so the cards still fit.

   Smaller screens and reduced motion get the steps as a vertical
   timeline whose thread fills as the list scrolls past.
   ════════════════════════════════════════════════════════════════════════ */

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import {
  motion, useInView, useMotionValue, useMotionValueEvent, useScroll, useTransform,
  type MotionValue,
} from "framer-motion";
import { useStore } from "@/context/store";
import { PROCESS_STEPS, type ProcessStep } from "@/lib/process";
import { coverStart, trackVars, type Span } from "@/lib/timeline";
import { DrawnRule } from "@/components/DrawnRule";
import { StepTitle } from "@/components/story/StepTitle";
import { useCoverRecede, useTrackProgress, useWillChange } from "@/components/story/hooks";

type Lang = "fi" | "en";

/* ── Timeline ──────────────────────────────────────────────────────────
   The track's height and the materials room's pull-up read these through
   CSS variables (see lib/timeline).                                      */
const TRACK_SVH = 400;
/** How far the materials room pulls up over the stage. */
export const COVER_SVH = 40;
const COVER_START = coverStart(TRACK_SVH, COVER_SVH);
/* The row holds on the heading, travels, then holds on the last step
   until the cover starts. */
const TRAVEL: Span = [0.1, 0.8];

const LAST = PROCESS_STEPS.length - 1;
const STEP_TOTAL = String(PROCESS_STEPS.length).padStart(2, "0");
/** How much of the travel a numeral takes to light. */
const LIGHT = 0.06;
/** Step i's numeral lights over the last stretch of the thread's fill
    before it, as shares of the travel. The first is lit from the start. */
const lit = (i: number): Span => [i / LAST - LIGHT, i / LAST];
/** The step the counter names at travel t: it turns over midway through
    each numeral's lighting. */
const stepAt = (t: number) => Math.min(LAST, Math.floor((t + LIGHT / 2) * LAST));

/* One sizes string for both layouts, so the browser fetches one file per
   photo: the stage's cards (up to 24rem), the md timeline's column
   (18rem), and the phone column beside the numerals. */
const PHOTO_SIZES = "(min-width: 1024px) 384px, (min-width: 768px) 288px, calc(100vw - 7rem)";

/* ── Copy ──────────────────────────────────────────────────────────── */
const COPY = {
  label: { fi: "Polku", en: "Process" },
  step: { fi: "Vaihe", en: "Step" },
  intro: {
    fi: "Jokainen LEIMU kulkee saman polun raaka-aineista valmiiksi kynttiläksi. Polku on lyhyt, mutta sitä ei oikaista.",
    en: "Every LEIMU travels the same path from raw materials to finished candle. The path is short, but never cut short.",
  },
};

/* ── Shared pieces ────────────────────────────────────────────────── */
function Heading({ lang }: { lang: Lang }) {
  return lang === "fi" ? (
    <>
      Kuusi askelta
      <br />
      <em>liekkiin</em> asti.
    </>
  ) : (
    <>
      Six steps
      <br />
      to the <em>flame.</em>
    </>
  );
}

/* The step's heading sits beside its photo and names it, so the photo
   carries no alt text of its own. */
function StepPhoto({ step, eager, className }: {
  step: ProcessStep;
  eager?: boolean;
  /** The frame's ratio and placement. */
  className: string;
}) {
  return (
    <div className={`paper-well ${className}`}>
      <div className="relative h-full overflow-hidden rounded-[calc(var(--radius-lg)-6px)]">
        <Image
          src={step.img}
          alt=""
          fill
          loading={eager ? "eager" : "lazy"}
          sizes={PHOTO_SIZES}
          className="object-cover"
        />
      </div>
    </div>
  );
}

/* The numerals beside each step are decorative; its heading carries the
   same label for screen readers. */
function StepText({ step, lang, title, className = "" }: {
  step: ProcessStep;
  lang: Lang;
  /** The heading's size. */
  title: string;
  className?: string;
}) {
  return (
    <div className={className}>
      <h3 className={`heading-display text-[var(--ink)] ${title}`}>
        <span className="sr-only">
          {COPY.step[lang]} {step.num} / {STEP_TOTAL}:{" "}
        </span>
        <StepTitle title={step.title[lang]} />
      </h3>
      <p className="mt-3 max-w-[52ch] leading-relaxed text-[var(--ink-soft)]">{step.desc[lang]}</p>
      <p className="tag-mono mt-4 leading-relaxed">{step.data[lang]}</p>
    </div>
  );
}

/* ── Pinned stage ──────────────────────────────────────────────────── */
function StageStep({ step, index, lang, travel, eager }: {
  step: ProcessStep;
  index: number;
  lang: Lang;
  travel: MotionValue<number>;
  eager: boolean;
}) {
  const light = useTransform(travel, lit(index), [0, 1]);

  return (
    <li className="flex w-[var(--card)] shrink-0 flex-col">
      {/* The paper behind the numeral hides the thread where it passes. */}
      <div aria-hidden="true" className="flex h-10 items-center">
        <span className="relative bg-[var(--bg)] pr-4 font-serif text-4xl italic leading-none text-[var(--line)]">
          {step.num}
          <motion.span
            className="absolute left-0 top-0 text-[var(--accent-2-text)]"
            style={{ opacity: light }}
          >
            {step.num}
          </motion.span>
        </span>
      </div>
      <StepPhoto
        step={step}
        eager={eager}
        className="mt-4 aspect-[3/2] [@media(max-height:719px)]:aspect-[16/9]"
      />
      <StepText
        step={step}
        lang={lang}
        title="text-2xl"
        className="mt-6 [@media(max-height:719px)]:mt-4"
      />
    </li>
  );
}

/* The steps' headings carry the same count for screen readers. */
function StepCounter({ travel, lang }: { travel: MotionValue<number>; lang: Lang }) {
  const at = useTransform(travel, stepAt);
  const [step, setStep] = useState(0);
  useMotionValueEvent(at, "change", setStep);

  return (
    <p aria-hidden="true" className="tag-mono mt-6 [@media(max-height:719px)]:mt-4">
      {COPY.step[lang]} {PROCESS_STEPS[step].num} / {STEP_TOTAL}
    </p>
  );
}

function Stage({ lang }: { lang: Lang }) {
  const trackRef = useRef<HTMLDivElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);
  const viewRef = useRef<HTMLDivElement>(null);
  const rowRef = useRef<HTMLDivElement>(null);
  const fillRef = useRef<HTMLDivElement>(null);
  const { p } = useTrackProgress(trackRef, TRACK_SVH);
  const travel = useTransform(p, TRAVEL, [0, 1]);
  // How far the row travels: its overhang past the stage's content box.
  const shift = useMotionValue(0);
  const x = useTransform([travel, shift], ([t, s]: number[]) => -t * s);
  const recede = useCoverRecede(p, COVER_START);
  useWillChange(p, [TRAVEL], [rowRef, fillRef]);
  useWillChange(p, [[COVER_START, 1]], [gridRef]);
  // Steps off to the right sit outside the stage's clip, where lazy loading
  // would wait until each slid in. Fetch them all as the track nears.
  const near = useInView(trackRef, { once: true, margin: "100% 0px" });

  useEffect(() => {
    const view = viewRef.current;
    const row = rowRef.current;
    if (!view || !row) return;
    // Layout widths ignore transforms, so the travel and the recede don't
    // feed back. A hidden stage measures zero and never travels.
    const measure = () => shift.set(Math.max(0, row.offsetWidth - view.clientWidth));
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(view);
    observer.observe(row);
    return () => observer.disconnect();
  }, [shift]);

  return (
    <div
      ref={trackRef}
      data-pin-rest={0}
      className="relative hidden stage:block stage:h-[var(--track)]"
      style={trackVars(TRACK_SVH)}
    >
      {/* Clip, not hidden: a clipped box can't be scrolled sideways by a
          find-in-page or a focus jump. Hidden is the fallback. */}
      <div className="sticky top-0 flex h-[100svh] items-center overflow-hidden overflow-clip pb-6 pt-20">
        <motion.div
          ref={gridRef}
          className="mx-auto w-full max-w-7xl origin-top px-10"
          style={{ scale: recede }}
        >
          <div ref={viewRef}>
            <motion.div ref={rowRef} className="flex w-max items-center gap-24" style={{ x }}>
              <header className="flex w-[26rem] shrink-0 flex-col gap-6">
                <h2 className="heading-display text-6xl text-[var(--ink)]">
                  <Heading lang={lang} />
                </h2>
                <p className="max-w-[34ch] text-lg leading-[1.75] text-[var(--ink-soft)]">
                  {COPY.intro[lang]}
                </p>
              </header>

              <div className="relative [--card:clamp(18rem,40svh,24rem)]">
                {/* Numeral to numeral: it ends where the last card begins. */}
                <div
                  aria-hidden="true"
                  className="absolute left-0 right-[var(--card)] top-5 h-px bg-[var(--line)]"
                >
                  <motion.div
                    ref={fillRef}
                    className="absolute inset-0 origin-left bg-[var(--accent-2)]"
                    style={{ scaleX: travel }}
                  />
                </div>
                <ol className="relative flex gap-16">
                  {PROCESS_STEPS.map((step, i) => (
                    <StageStep
                      key={step.num}
                      step={step}
                      index={i}
                      lang={lang}
                      travel={travel}
                      eager={near}
                    />
                  ))}
                </ol>
              </div>
            </motion.div>
          </div>
          <StepCounter travel={travel} lang={lang} />
        </motion.div>
      </div>
    </div>
  );
}

/* ── Flow fallback (smaller screens, reduced motion) ───────────────────
   A vertical timeline: numerals on the thread, text beside them, and the
   photo below the text on phones or in a third column from md.           */
function Flow({ lang }: { lang: Lang }) {
  const listRef = useRef<HTMLOListElement>(null);
  // The fill follows a reading line a little above the screen's middle.
  const { scrollYProgress } = useScroll({ target: listRef, offset: ["start 0.7", "end 0.7"] });

  return (
    <div className="mx-auto max-w-7xl px-6 pb-24 pt-20 md:px-10 md:pb-32 md:pt-28 stage:hidden">
      <header className="grid items-end gap-6 md:grid-cols-2 md:gap-20">
        <h2 className="heading-display text-4xl text-[var(--ink)] md:text-5xl lg:text-6xl">
          <Heading lang={lang} />
        </h2>
        <p className="max-w-[46ch] leading-[1.75] text-[var(--ink-soft)] md:text-lg">
          {COPY.intro[lang]}
        </p>
      </header>

      <div className="relative mt-14 md:mt-20">
        {/* The thread runs down the numeral column's centre. */}
        <DrawnRule vertical className="absolute bottom-0 left-5 top-0 md:left-8" />
        <motion.span
          aria-hidden="true"
          className="absolute bottom-0 left-5 top-0 w-px origin-top bg-[var(--accent-2)] motion-reduce:!transform-none md:left-8"
          style={{ scaleY: scrollYProgress }}
        />
        <ol ref={listRef} className="relative space-y-14 md:space-y-20">
          {PROCESS_STEPS.map((step) => (
            <li
              key={step.num}
              className="grid grid-cols-[2.5rem_minmax(0,1fr)] gap-x-5 md:grid-cols-[4rem_minmax(0,1fr)_18rem] md:gap-x-12"
            >
              <span
                aria-hidden="true"
                className="self-start bg-[var(--bg)] py-2 text-center font-serif text-3xl italic leading-none text-[var(--accent-2-text)] md:text-4xl"
              >
                {step.num}
              </span>
              <StepText step={step} lang={lang} title="text-2xl md:text-3xl" className="pt-1" />
              <StepPhoto
                step={step}
                className="col-start-2 mt-6 aspect-[4/3] md:col-start-3 md:row-start-1 md:mt-0"
              />
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}

export function ProcessChapter() {
  const lang = useStore((s) => s.lang);

  return (
    <section id="polku" aria-label={COPY.label[lang]} data-tone="light">
      <Stage lang={lang} />
      <Flow lang={lang} />
    </section>
  );
}
