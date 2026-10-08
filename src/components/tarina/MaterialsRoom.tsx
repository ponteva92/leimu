"use client";

/* ════════════════════════════════════════════════════════════════════════
   LEIMU — Tarina materials (chapter "Aineet")
   ------------------------------------------------------------------------
   What goes into a LEIMU, kept as a ledger in a dark room: four
   materials, each with its figure.

   Pinned (the stage: screen): the room pulls up over the process stage
   with its heading and the first material, then pins on a 260svh track
   while the other three arrive in turn. Each row's hairline draws as it
   rises, and its figure counts up once it has arrived. Over the last
   40svh the values sheet pulls up over the room while the ledger
   recedes. The bar is dark glass while the room sits under it.

   Smaller screens and reduced motion get the same ledger in normal flow,
   its figures counting as they scroll into view.

   Behind both, melted wax catches dim light (LiquidDark, WebGL) on
   md-and-up screens with a fine pointer; elsewhere the room is plain ink.
   The canvas mounts only in the layout that shows, so phones never load
   it, and on the stage its loop parks once the values sheet has covered
   the room.
   ════════════════════════════════════════════════════════════════════════ */

import { useEffect, useRef, useState, type ReactNode } from "react";
import dynamic from "next/dynamic";
import { motion, useMotionValueEvent, useTransform, type MotionValue } from "framer-motion";
import { useStore } from "@/context/store";
import { FINE_QUERY, useMediaQuery, useStaged } from "@/lib/pin";
import { beatWindows, coverStart, coverVars, mid, trackVars } from "@/lib/timeline";
import { DrawnRule, RULE_ON_DARK } from "@/components/DrawnRule";
import { Arrive } from "@/components/story/Arrive";
import { CountUp } from "@/components/story/CountUp";
import {
  useCoverRecede, useDarkStageSync, useStageShown, useTrackProgress, useWillChange,
} from "@/components/story/hooks";
import { COVER_SVH as PROCESS_COVER_SVH } from "./ProcessChapter";

/* The room is plain ink until the chunk loads, so it loads with none. */
const LiquidDark = dynamic(() => import("./LiquidDark"), {
  ssr: false,
  loading: () => null,
});

type Lang = "fi" | "en";

/* ── Timeline ──────────────────────────────────────────────────────────
   The track's height and the values sheet's pull-up (ValuesLedger) read
   these through CSS variables (see lib/timeline).                        */
const TRACK_SVH = 260;
/** How far the values sheet pulls up over the room. */
export const COVER_SVH = 40;
const COVER_START = coverStart(TRACK_SVH, COVER_SVH);
/* The first row rises with the room; the other three arrive in turn while
   it holds, and the last holds while the cover runs. */
const arrive = beatWindows(3, { head: 0.04, tail: 0.32, fill: 0.85 });
const rowAt = (i: number) => arrive(i - 1);
/** Where the chapter rail parks the room: every row in place. */
const REST = arrive(2)[1];

/* ── Copy ──────────────────────────────────────────────────────────── */
const COPY = {
  label: { fi: "Aineet", en: "Materials" },
};

type Material = {
  id: string;
  name: Record<Lang, ReactNode>;
  desc: Record<Lang, string>;
  /** The figure counts up to `value`; the unit stays small beside it. */
  value: number;
  prefix?: string;
  suffix?: string;
  unit?: Record<Lang, string>;
  label: Record<Lang, string>;
};

const PERCENT = { fi: "%", en: "%" };

const MATERIALS: Material[] = [
  {
    id: "soy",
    name: { fi: <>Soija<em>vaha</em></>, en: <>Soy <em>wax</em></> },
    desc: {
      fi: "100% luonnollinen, uusiutuva soijavaha. Palaa pehmeästi, kauemmin ja puhtaammin kuin parafiini, ei mustaa nokea, ei kemikaalipäästöjä.",
      en: "100% natural, renewable soy wax. Burns softly, longer and cleaner than paraffin, no black soot, no chemical emissions.",
    },
    value: 100,
    unit: PERCENT,
    label: { fi: "Luonnollinen", en: "Natural" },
  },
  {
    id: "shea",
    name: { fi: <>Shea<em>butter</em></>, en: <>Shea <em>butter</em></> },
    desc: {
      fi: "Kaakkois-Aasian klassikko, joka antaa kynttilälle samettisen koostumuksen ja varmistaa puhtaan, tasaisen liekin.",
      en: "A Southeast Asian classic that gives the candle a velvety texture and ensures a clean, steady flame.",
    },
    value: 10,
    prefix: "~",
    unit: PERCENT,
    label: { fi: "Reseptistä", en: "Of recipe" },
  },
  {
    id: "wick",
    name: { fi: <><em>Puuvilla</em>sydän</>, en: <><em>Cotton</em> wick</> },
    desc: {
      fi: "100% puuvilla, ei lyijyä, ei sinkkiä. Tasainen, hiljainen liekki joka palaa loppuun asti, vain valoa, ei kemikaaleja.",
      en: "100% cotton, no lead, no zinc. Steady, quiet flame that burns to the end, only light, no chemicals.",
    },
    value: 0,
    unit: { fi: " kem.", en: " chem." },
    label: { fi: "Puhdas liekki", en: "Clean flame" },
  },
  {
    id: "oils",
    name: { fi: <>Aromi<em>öljyt</em></>, en: <>Fragrance <em>oils</em></> },
    desc: {
      fi: "Jokainen aromi valittu huolella, eko-ystävällinen, myrkytön, ja tarpeeksi hieno kestämään koko cure-vaiheen laadun menetystä.",
      en: "Every fragrance carefully selected, eco-friendly, non-toxic, refined enough to endure the full cure phase without quality loss.",
    },
    value: 5,
    suffix: "+",
    label: { fi: "Tuoksua", en: "Scents" },
  },
];

/* ── Shared pieces ────────────────────────────────────────────────── */
function Heading({ lang }: { lang: Lang }) {
  return lang === "fi" ? (
    <>
      Vain <em>parasta</em>, ei kompromisseja.
    </>
  ) : (
    <>
      Only the <em>best</em>, no compromises.
    </>
  );
}

/* One ledger row: the name, its description below, and the figure in a
   column of its own. On phones the figure sits beside the name. */
function Row({ m, lang, run, title, className }: {
  m: Material;
  lang: Lang;
  /** Starts the count on the stage; the flow counts on scrolling in. */
  run?: boolean;
  /** The name's size. */
  title: string;
  /** The row's padding. */
  className: string;
}) {
  return (
    <div
      className={`grid grid-cols-[minmax(0,1fr)_auto] items-start gap-x-6 md:grid-cols-[minmax(0,1fr)_8rem] md:gap-x-8 ${className}`}
    >
      <h3 className={`heading-display text-[var(--on-dark)] ${title}`}>{m.name[lang]}</h3>
      <div className="text-right md:row-span-2">
        <p className="font-mono text-2xl leading-none text-[var(--accent-2-on-dark)] md:text-3xl">
          <CountUp value={m.value} prefix={m.prefix} suffix={m.suffix} run={run} />
          {m.unit && <span className="text-base">{m.unit[lang]}</span>}
        </p>
        <p className="tag-mono mt-3 text-[var(--on-dark-soft)]">{m.label[lang]}</p>
      </div>
      <p className="col-span-2 mt-3 max-w-[62ch] leading-relaxed text-[var(--on-dark-soft)] md:col-span-1 md:mt-2">
        {m.desc[lang]}
      </p>
    </div>
  );
}

/** True from the moment p first reaches `at`, and ever after, so a figure
    counts once rather than on every pass. */
function useLatch(p: MotionValue<number>, at: number) {
  const past = useTransform(p, (v) => v >= at);
  const [latched, setLatched] = useState(false);
  useMotionValueEvent(past, "change", (v) => {
    if (v) setLatched(true);
  });
  // A page reloaded partway down starts past it.
  useEffect(() => {
    if (past.get()) setLatched(true);
  }, [past]);
  return latched;
}

/* ── Pinned stage ──────────────────────────────────────────────────── */
const STAGE_RULE = `absolute inset-x-0 h-px origin-left ${RULE_ON_DARK}`;

function StageRow({ m, index, lang, p }: {
  m: Material;
  index: number;
  lang: Lang;
  p: MotionValue<number>;
}) {
  const ruleRef = useRef<HTMLSpanElement>(null);
  const endRef = useRef<HTMLSpanElement>(null);
  const at = rowAt(index);
  // The row's hairline draws as the row rises.
  const draw = useTransform(p, at, [0, 1]);
  useWillChange(p, [at], [ruleRef, endRef]);
  const arrived = useLatch(p, mid(at));
  const last = index === MATERIALS.length - 1;

  return (
    <li className="relative">
      <motion.span
        ref={ruleRef}
        aria-hidden="true"
        className={`${STAGE_RULE} top-0`}
        style={{ scaleX: draw }}
      />
      {last && (
        <motion.span
          ref={endRef}
          aria-hidden="true"
          className={`${STAGE_RULE} bottom-0`}
          style={{ scaleX: draw }}
        />
      )}
      <Arrive p={p} at={at}>
        {/* The first row is in place before the stage pins, so its figure
            counts on scrolling into view like the flow's. */}
        <Row
          m={m}
          lang={lang}
          run={index === 0 ? undefined : arrived}
          title="text-2xl"
          className="py-4 [@media(max-height:719px)]:py-3"
        />
      </Arrive>
    </li>
  );
}

function Stage({ lang, canvas }: { lang: Lang; canvas: boolean }) {
  const trackRef = useRef<HTMLDivElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);
  const { p, leave } = useTrackProgress(trackRef, TRACK_SVH);
  const recede = useCoverRecede(p, COVER_START);
  useWillChange(p, [[COVER_START, 1]], [gridRef]);
  const active = useStageShown(leave, COVER_SVH);

  return (
    <div
      ref={trackRef}
      data-pin-rest={REST}
      className="relative hidden stage:block stage:h-[var(--track)]"
      style={trackVars(TRACK_SVH)}
    >
      <div className="sticky top-0 flex h-[100svh] items-center pb-6 pt-20">
        {canvas && <LiquidDark active={active} />}
        <motion.div
          ref={gridRef}
          className="relative mx-auto grid w-full max-w-7xl origin-top grid-cols-[minmax(0,20rem)_minmax(0,1fr)] items-center gap-12 px-10 xl:grid-cols-[minmax(0,22rem)_minmax(0,1fr)] xl:gap-20"
          style={{ scale: recede }}
        >
          <h2 className="heading-display text-5xl text-[var(--on-dark)]">
            <Heading lang={lang} />
          </h2>
          <ul>
            {MATERIALS.map((m, i) => (
              <StageRow key={m.id} m={m} index={i} lang={lang} p={p} />
            ))}
          </ul>
        </motion.div>
      </div>
    </div>
  );
}

/* ── Flow fallback (smaller screens, reduced motion) ───────────────────
   The heading stays beside the ledger on wide screens while it scrolls. */
function Flow({ lang, canvas }: { lang: Lang; canvas: boolean }) {
  return (
    <div className="relative stage:hidden">
      {canvas && <LiquidDark />}
      <div className="relative mx-auto grid max-w-7xl gap-12 px-6 py-24 md:px-10 md:py-32 lg:grid-cols-[minmax(0,20rem)_minmax(0,1fr)] lg:gap-16">
        <h2 className="heading-display text-4xl text-[var(--on-dark)] md:text-5xl lg:sticky lg:top-28 lg:self-start">
          <Heading lang={lang} />
        </h2>
        <ul>
          {MATERIALS.map((m, i) => (
            <li key={m.id} className="relative">
              <DrawnRule onDark className="absolute inset-x-0 top-0" />
              {i === MATERIALS.length - 1 && <DrawnRule onDark className="absolute inset-x-0 bottom-0" />}
              <Row m={m} lang={lang} title="text-2xl md:text-3xl" className="py-6 md:py-8" />
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export function MaterialsRoom() {
  const lang = useStore((s) => s.lang);
  const staged = useStaged();
  const roomRef = useRef<HTMLElement>(null);
  // Known only after mount, so neither layout mounts the canvas on the
  // first paint, and the layout that is hidden never mounts it.
  const fine = useMediaQuery(FINE_QUERY);
  // One sync for both layouts, so they never contend for the bar: the
  // section is the track on the stage and the ledger in the flow. Only the
  // stage has the values sheet pulling up over it.
  useDarkStageSync(roomRef, { cover: staged ? COVER_SVH : 0 });

  // The room pulls up over the process stage, casting a soft shadow onto
  // it. Its dark edge needs no seam.
  return (
    <section
      ref={roomRef}
      id="aineet"
      aria-label={COPY.label[lang]}
      data-tone="dark"
      className="relative z-10 bg-[var(--ink)] stage:-mt-[var(--cover)] stage:shadow-[0_-24px_70px_-18px_rgba(26,24,20,0.2)]"
      style={coverVars(PROCESS_COVER_SVH)}
    >
      <Stage lang={lang} canvas={fine && staged} />
      <Flow lang={lang} canvas={fine && !staged} />
    </section>
  );
}
