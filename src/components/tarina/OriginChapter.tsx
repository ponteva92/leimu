"use client";

/* ════════════════════════════════════════════════════════════════════════
   LEIMU — Tarina origin (chapter "Alku")
   ------------------------------------------------------------------------
   How LEIMU was born, told beside the founder's portrait: the title and
   the founder's particulars, then the story in four beats (the northern
   dark and the flame, the quote, shea butter, the slow way of making).

   Pinned (the stage: screen): a 400svh track holds a 100svh sticky stage.
   The portrait stays on the left, pushing in a touch over the chapter,
   while the story crossfades beside it. The drop cap's frame draws and
   the quote inks in as they arrive, and an amber hairline keeps the
   place. Over the last 40svh the process sheet pulls up over the stage
   while it recedes. Phones use the same sticky story with shorter text
   beats around the portrait. Reduced motion keeps the story in flow.

   The photo is server-rendered in both layouts, so the frame is never
   empty. The living portrait (WebGL) mounts over it only in the layout
   that shows, on every WebGL-capable device. On the stage its loop parks
   once the sheet has covered it.
   ════════════════════════════════════════════════════════════════════════ */

import { useRef, type ReactNode, type RefObject } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import {
  animate, easeInOut, motion, useMotionValue, useTransform, type MotionValue,
} from "framer-motion";
import { useStore } from "@/context/store";
import { useMotionLayout, useStaged } from "@/lib/pin";
import { beatWindows, coverStart, mid, trackVars, type Span } from "@/lib/timeline";
import { EASE_PREMIUM } from "@/lib/motionVariants";
import { LogoMark } from "@/components/LogoMark";
import { CaptionPlaque } from "@/components/ScentFrame";
import { Crossfade } from "@/components/story/Crossfade";
import { InkQuote, InkWords } from "@/components/story/Ink";
import {
  useCoverRecede, useStageShown, useTrackProgress, useWillChange, useWillChangeWhileMoving,
} from "@/components/story/hooks";
import { PortraitPhoto } from "./PortraitPhoto";
import { useStoryWebGL } from "./useStoryWebGL";

/* The photo under it is the placeholder, so the chunk loads with none. */
const LivingPortrait = dynamic(() => import("./LivingPortrait"), {
  ssr: false,
  loading: () => null,
});

type Lang = "fi" | "en";

/* ── Timeline ──────────────────────────────────────────────────────────
   The track's height and the process sheet's pull-up in TarinaClient
   read these through CSS variables (see lib/timeline).                   */
const TRACK_SVH = 400;
/** How far the process sheet pulls up over the stage. */
export const COVER_SVH = 40;
const COVER_START = coverStart(TRACK_SVH, COVER_SVH);
/* Four wipes carry the five beats. The title is in place from the first
   paint; the last beat holds while the cover runs. */
const wipe = beatWindows(4, { head: 0.08, tail: 0.2, fill: 0.55 });

/** A point `t` of the way through the hold that follows wipe `k`. */
const hold = (k: number, t: number) => wipe(k)[1] + (wipe(k + 1)[0] - wipe(k)[1]) * t;
/* The drop cap's frame draws as its beat arrives and is whole midway
   through the hold; the quote inks over its arrival and most of its hold,
   so a reader who stops to read sees both finished. */
const CAP_DRAW: Span = [mid(wipe(0)), hold(0, 0.5)];
const QUOTE_INK: Span = [mid(wipe(1)), hold(1, 0.6)];

/* The hairline fills a fifth per beat, in time with the wipes. */
const FILL_INPUT = [0, 1, 2, 3].flatMap((k) => wipe(k));
const FILL_OUTPUT = [1, 2, 3, 4].flatMap((n) => [n / 5, (n + 1) / 5]);

/* ── Copy ──────────────────────────────────────────────────────────── */
const COPY = {
  label: { fi: "Alku", en: "Origin" },
  kicker: { fi: "Tarinamme · Est. 2024", en: "Our story · Est. 2024" },
  quote: {
    fi: "”Halusin luoda kynttilän, joka olisi enemmän kuin liekki, se olisi tarina.”",
    en: "“I wanted to create a candle that was more than a flame, it would be a story.”",
  },
  cite: "Shane, LEIMU",
};

type Fact = { key: Record<Lang, string>; val: Record<Lang, string> };

/* The founder's particulars, word for word from the earlier page. */
const FACTS: Fact[] = [
  { key: { fi: "Perustaja", en: "Founder" }, val: { fi: "Shane", en: "Shane" } },
  { key: { fi: "Tausta", en: "Background" }, val: { fi: "Sairaanhoitaja", en: "Nurse" } },
  { key: { fi: "Kotoisin", en: "From" }, val: { fi: "Filippiinit", en: "Philippines" } },
  { key: { fi: "Studio", en: "Studio" }, val: { fi: "Oulu, Suomi", en: "Oulu, Suomi" } },
  { key: { fi: "Vuodesta", en: "Since" }, val: { fi: "2024", en: "2024" } },
];

/* The story's marked words: upright amber, which reads on paper. */
const MARK = "font-medium not-italic text-[var(--accent-2-text)]";

type Story = {
  /** The first word, split at its drop cap. */
  opening: { cap: string; word: string; rest: string };
  flame: ReactNode;
  shea: ReactNode;
  cure: ReactNode;
  slow: ReactNode;
};

const STORY: Record<Lang, Story> = {
  fi: {
    opening: {
      cap: "S",
      word: "uomalaiset",
      rest: " rakastavat kynttilöitä. Ne tuovat valoa ja lämpöä silloin, kun aurinko piiloutuu kuukausiksi pohjoisen taakse, ja juuri se ajatus sytytti kipinän.",
    },
    flame: (
      <>
        Filippiineiltä Suomeen muuttanut sairaanhoitaja Shane huomasi,
        että kynttilän liekissä on jotain syvästi inhimillistä. Se ei
        ole vain valoa, se on hetki, jonka ympärille kerääntyä. Ja jos
        liekki on niin tärkeä, eikö myös se, mitä siitä jää huoneeseen,
        ansaitse erityistä huomiota?
      </>
    ),
    shea: (
      <>
        LEIMU syntyi siitä halusta. Se yhdistää kaksi maailmaa:
        skandinaavisen pelkistetyn estetiikan ja Kaakkois-Aasiassa
        rakastetut luonnolliset raaka-aineet, kuten{" "}
        <em className={MARK}>sheabutterin</em>,
        joka tunnetaan kotiseudulla ihon hellijänä ja josta tulee
        LEIMUn salainen ainesosa kynttilänvalmistuksessa.
      </>
    ),
    cure: (
      <>
        Jokainen LEIMU-kynttilä syntyy yksi kerrallaan, käsityönä,
        Oulussa. Vahaa ei kaadeta erissä isoihin altaisiin, vaan
        jokainen purkki täytetään huolella, oikeassa lämpötilassa,
        oikealla rytmillä. Sen jälkeen kynttilät saavat rauhassa{" "}
        <em className={MARK}>cure</em>-vaiheensa, viikon, jonka aikana
        tuoksu kypsyy ja koostumus löytää lopullisen muotonsa.
      </>
    ),
    slow: (
      <>
        Tämä on hidas tapa tehdä asioita. Mutta se on ainoa tapa, jolla
        LEIMU haluaa ne tehdä. Pieni luksus, jonka sinä ansaitset, ja
        jonka takana on ihminen, joka tietää tarkalleen, miten se on
        tehty.
      </>
    ),
  },
  en: {
    opening: {
      cap: "F",
      word: "inns",
      rest: " love candles. They bring light and warmth when the sun hides for months behind the north, and that very thought sparked the flame.",
    },
    flame: (
      <>
        Shane, a nurse who moved from the Philippines to Finland,
        noticed there is something deeply human about a candle’s flame.
        It is not just light, it is a moment to gather around. And if
        the flame matters that much, should not what it leaves in the
        room deserve special attention?
      </>
    ),
    shea: (
      <>
        LEIMU was born from that desire. It bridges two worlds:
        Scandinavian minimalist aesthetics and the natural ingredients
        beloved in Southeast Asia, like{" "}
        <em className={MARK}>shea butter</em>,
        known at home as a skin-nurturing treasure and now LEIMU’s
        secret ingredient in candle making.
      </>
    ),
    cure: (
      <>
        Every LEIMU candle is made one at a time, by hand, in Oulu.
        Wax is not poured in batches into large vats, each jar is
        filled carefully, at the right temperature, with the right
        rhythm. Then the candles quietly undergo their{" "}
        <em className={MARK}>cure</em> phase, a week during which the
        scent matures and the texture finds its final form.
      </>
    ),
    slow: (
      <>
        This is a slow way of doing things. But it is the only way
        LEIMU wants to do them. A small luxury you deserve, made by
        someone who knows exactly how it was crafted.
      </>
    ),
  },
};

/* ── Shared pieces ────────────────────────────────────────────────── */
function Kicker({ lang }: { lang: Lang }) {
  return (
    <div className="flex items-center gap-3">
      <LogoMark />
      <span className="tag-mono">{COPY.kicker[lang]}</span>
    </div>
  );
}

/* The two lines turn up into place from the first paint (.t1 and .t2 in
   globals.css), so the title never waits for script. */
function Title({ lang, className }: { lang: Lang; className: string }) {
  return (
    <h1 data-order-entry className={`heading-display text-[var(--ink)] ${className}`}>
      <span className="t1">
        {lang === "fi" ? <>Kuinka <em>LEIMU</em></> : <>How <em>LEIMU</em></>}
      </span>
      <span className="t2">{lang === "fi" ? "syntyi." : "was born."}</span>
    </h1>
  );
}

function Facts({ lang, className = "" }: { lang: Lang; className?: string }) {
  return (
    <>
    <dl className={className}>
      {FACTS.map(({ key, val }) => (
        <div
          key={key.en}
          className="flex items-baseline justify-between gap-6 border-b border-[var(--line)] py-2.5"
        >
          <dt className="tag-mono">{key[lang]}</dt>
          <dd className="text-sm font-medium text-[var(--ink-soft)]">{val[lang]}</dd>
        </div>
      ))}
    </dl>
    <Link href="/tuotteet#configurator" className="text-link mt-4">{lang === "fi" ? "Valitse oma LEIMU" : "Choose your LEIMU"}<span aria-hidden="true">→</span></Link>
    </>
  );
}

/* The drop cap's hairline frame is four sides that draw clockwise from the
   top left, each scaling along its length, so the frame draws with
   transforms alone. Each side takes its share of the perimeter. */
const SIDES = [
  { x: true, className: "inset-x-0 top-0 h-px origin-left" },
  { x: false, className: "inset-y-0 right-0 w-px origin-top" },
  { x: true, className: "inset-x-0 bottom-0 h-px origin-right" },
  { x: false, className: "inset-y-0 left-0 w-px origin-bottom" },
];
const SIDE_CUTS = [0, 0.21, 0.5, 0.71, 1];

/** The frame, drawn as far as `draw` (0 to 1). */
function FrameSides({ draw, refs }: {
  draw: MotionValue<number>;
  refs?: RefObject<HTMLSpanElement>[];
}) {
  const top = useTransform(draw, [SIDE_CUTS[0], SIDE_CUTS[1]], [0, 1]);
  const right = useTransform(draw, [SIDE_CUTS[1], SIDE_CUTS[2]], [0, 1]);
  const bottom = useTransform(draw, [SIDE_CUTS[2], SIDE_CUTS[3]], [0, 1]);
  const left = useTransform(draw, [SIDE_CUTS[3], SIDE_CUTS[4]], [0, 1]);
  const scales = [top, right, bottom, left];

  return (
    <span className="absolute inset-x-[3px] inset-y-[2px] opacity-30">
      {SIDES.map((side, k) => (
        <motion.span
          key={side.className}
          ref={refs?.[k]}
          className={`absolute bg-[var(--accent-2)] motion-reduce:!transform-none ${side.className}`}
          style={side.x ? { scaleX: scales[k] } : { scaleY: scales[k] }}
        />
      ))}
    </span>
  );
}

/* On the stage the frame draws with the scroll. */
function ScrubbedFrame({ p, at = CAP_DRAW }: { p: MotionValue<number>; at?: Span }) {
  const top = useRef<HTMLSpanElement>(null);
  const right = useRef<HTMLSpanElement>(null);
  const bottom = useRef<HTMLSpanElement>(null);
  const left = useRef<HTMLSpanElement>(null);
  const refs = [top, right, bottom, left];
  const draw = useTransform(p, at, [0, 1]);
  useWillChange(p, [at], refs);
  return <FrameSides draw={draw} refs={refs} />;
}

/* In the flow it draws once, as it comes into view. */
function OnceFrame() {
  const draw = useMotionValue(0);
  return (
    <motion.span
      className="absolute inset-0"
      viewport={{ once: true, margin: "-60px" }}
      onViewportEnter={() => animate(draw, 1, { duration: 1.2, ease: EASE_PREMIUM })}
    >
      <FrameSides draw={draw} />
    </motion.span>
  );
}

/* The letter in its hairline frame. `p` is the stage's progress. */
function DropCap({ letter, p, drawAt }: { letter: string; p?: MotionValue<number>; drawAt?: Span }) {
  return (
    <span aria-hidden="true" className="relative float-left mb-1 mr-3 h-[88px] w-[68px]">
      {p ? <ScrubbedFrame p={p} at={drawAt} /> : <OnceFrame />}
      <svg viewBox="0 0 60 80" className="block h-full w-full">
        <text
          x="30" y="64"
          textAnchor="middle"
          fontFamily="var(--font-serif), serif"
          fontStyle="italic"
          fontSize="64"
          fontWeight="500"
          fill="var(--ink)"
        >
          {letter}
        </text>
      </svg>
    </span>
  );
}

/* The drawn letter is hidden from screen readers, so they get the first
   word whole instead of its tail. */
function Opening({ story, p, drawAt, className }: {
  story: Story;
  p?: MotionValue<number>;
  drawAt?: Span;
  className: string;
}) {
  const { cap, word, rest } = story.opening;
  return (
    <p className={className}>
      <DropCap letter={cap} p={p} drawAt={drawAt} />
      <span className="sr-only">{cap + word}</span>
      <span aria-hidden="true">{word}</span>
      {rest}
    </p>
  );
}

/* The frame: the photo, with the living portrait over it where it mounts,
   a shade at the foot, and the name on a paper plaque (type never sits on
   the photo). `push` scales the pictures only, never the plaque. */
function Portrait({ className, push, pushRef, children }: {
  className: string;
  push?: MotionValue<number>;
  pushRef?: RefObject<HTMLDivElement>;
  children?: ReactNode;
}) {
  return (
    <div
      className={`relative isolate aspect-[3/4] overflow-hidden rounded-[calc(var(--radius-lg)-6px)] ${className}`}
    >
      <motion.div
        ref={pushRef}
        className="absolute inset-0"
        style={push ? { scale: push } : undefined}
      >
        <PortraitPhoto />
        {children}
      </motion.div>
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[rgba(26,24,20,0.55)] via-transparent to-transparent"
      />
      <div className="tarina-portrait-caption-wrapper absolute bottom-4 left-4 right-4">
        <CaptionPlaque tone="paper" className="tarina-portrait-caption">
          <p className="tag-mono mb-0.5">Oulu · Studio</p>
          <p className="font-serif text-lg italic text-[var(--ink)]">LEIMU by Shane</p>
        </CaptionPlaque>
      </div>
    </div>
  );
}

/* ── Pinned stage ──────────────────────────────────────────────────── */
const STAGE_BODY = "text-lg leading-[1.85] text-[var(--ink-soft)]";
/* Beats of different heights share the cell, centred on the portrait. */
const BEAT = "[grid-area:1/1] self-center";

/* On a phone the same story has seven readable beats. Keeping the two
   longer passages in separate cells lets the portrait stay present without
   shrinking body copy or making the reader scroll inside a pinned panel. */
const mobileWipe = beatWindows(6, { head: 0.04, tail: 0.16, fill: 0.48 });

function MobileBeats({ lang, p }: { lang: Lang; p: MotionValue<number> }) {
  const story = STORY[lang];
  const beats = [
    <div key="title">
      <Title lang={lang} className="tarina-origin-title text-5xl" />
      <Facts lang={lang} className="tarina-origin-facts mt-4" />
    </div>,
    <Opening key="opening" story={story} p={p} drawAt={[mid(mobileWipe(0)), mobileWipe(1)[0]]} className="tarina-origin-body text-base leading-relaxed text-[var(--ink-soft)]" />,
    <p key="flame" className="tarina-origin-body text-base leading-relaxed text-[var(--ink-soft)]">{story.flame}</p>,
    <figure key="quote">
      <span aria-hidden="true" className="mb-4 block h-px w-12 bg-[var(--accent-2)]" />
      <blockquote className="tarina-origin-quote font-serif text-3xl font-medium italic leading-tight text-[var(--ink)]">
        <InkWords text={COPY.quote[lang]} p={p} at={[mid(mobileWipe(2)), mobileWipe(3)[0]]} />
      </blockquote>
      <figcaption className="tag-mono mt-4">{COPY.cite}</figcaption>
    </figure>,
    <p key="shea" className="tarina-origin-body text-base leading-relaxed text-[var(--ink-soft)]">{story.shea}</p>,
    <p key="cure" className="tarina-origin-body text-base leading-relaxed text-[var(--ink-soft)]">{story.cure}</p>,
    <p key="slow" className="tarina-origin-body text-base leading-relaxed text-[var(--ink-soft)]">{story.slow}</p>,
  ];
  return (
    <div className="tarina-origin-mobile-beats grid">
      {beats.map((beat, i) => (
        <Crossfade key={i} p={p} arrive={mobileWipe(i - 1)} leave={mobileWipe(i)} className={BEAT}>
          {beat}
        </Crossfade>
      ))}
    </div>
  );
}

function Stage({ lang, canvas }: { lang: Lang; canvas: boolean }) {
  const trackRef = useRef<HTMLDivElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);
  const pushRef = useRef<HTMLDivElement>(null);
  const { p, leave } = useTrackProgress(trackRef, TRACK_SVH);
  const recede = useCoverRecede(p, COVER_START);
  const push = useTransform(p, [0, COVER_START], [1, 1.06]);
  const fill = useTransform(p, FILL_INPUT, FILL_OUTPUT, { ease: easeInOut });
  const mobileFill = useTransform(p, [0, COVER_START], [0, 1]);
  // The push scales up, so it is promoted only while it moves (see hooks).
  useWillChangeWhileMoving(push, [pushRef]);
  useWillChange(p, [[COVER_START, 1]], [gridRef]);
  const active = useStageShown(leave, COVER_SVH);

  const story = STORY[lang];

  return (
    <div
      ref={trackRef}
      data-pin-rest={0}
      className="story-track tarina-origin-track relative hidden stage:block stage:h-[var(--track)]"
      style={trackVars(TRACK_SVH)}
    >
      <div className="story-stage tarina-origin-stage sticky top-0 flex h-[100svh] items-center pb-6 pt-20">
        <motion.div
          ref={gridRef}
          className="tarina-origin-grid mx-auto grid w-full max-w-7xl origin-top grid-cols-[auto_minmax(0,36rem)] items-center justify-center gap-16 px-10 xl:gap-28"
          style={{ scale: recede }}
        >
          {/* The frame's height sets its width through the photo's ratio. */}
          <div className="tarina-origin-visual">
            <div className="tarina-origin-well paper-well">
              <Portrait className="tarina-origin-portrait h-[min(78svh,calc(100svh-11rem))]" push={push} pushRef={pushRef}>
                {canvas && <LivingPortrait active={active} progress={p} />}
              </Portrait>
            </div>
            <div className="tarina-origin-mobile-byline">
              <Kicker lang={lang} />
              <p className="font-serif text-xl italic text-[var(--ink)]">LEIMU by Shane</p>
              <p className="tag-mono">Oulu · Studio</p>
            </div>
          </div>

          <div className="tarina-origin-copy flex flex-col gap-8">
            <Kicker lang={lang} />

            <div className="tarina-origin-desktop-beats grid">
              <Crossfade p={p} arrive={wipe(-1)} leave={wipe(0)} className={BEAT}>
                <Title lang={lang} className="text-6xl xl:text-7xl" />
                <Facts lang={lang} className="mt-10 max-w-xs" />
              </Crossfade>

              <Crossfade p={p} arrive={wipe(0)} leave={wipe(1)} className={BEAT}>
                <div className="space-y-6">
                  <Opening
                    story={story}
                    p={p}
                    className="text-xl leading-[1.75] text-[var(--ink-soft)]"
                  />
                  <p className={STAGE_BODY}>{story.flame}</p>
                </div>
              </Crossfade>

              <Crossfade p={p} arrive={wipe(1)} leave={wipe(2)} className={BEAT}>
                <figure>
                  <span aria-hidden="true" className="mb-8 block h-px w-12 bg-[var(--accent-2)]" />
                  <blockquote className="font-serif text-4xl font-medium italic leading-[1.25] text-[var(--ink)]">
                    <InkWords text={COPY.quote[lang]} p={p} at={QUOTE_INK} />
                  </blockquote>
                  <figcaption className="tag-mono mt-6">{COPY.cite}</figcaption>
                </figure>
              </Crossfade>

              <Crossfade p={p} arrive={wipe(2)} leave={wipe(3)} className={BEAT}>
                <p className={STAGE_BODY}>{story.shea}</p>
              </Crossfade>

              <Crossfade p={p} arrive={wipe(3)} leave={wipe(4)} className={BEAT}>
                <div className="space-y-6">
                  <p className={STAGE_BODY}>{story.cure}</p>
                  <p className={STAGE_BODY}>{story.slow}</p>
                </div>
              </Crossfade>
            </div>

            <MobileBeats lang={lang} p={p} />

            <div aria-hidden="true" className="relative h-px w-full bg-[var(--line)]">
              <motion.div
                className="tarina-origin-desktop-progress absolute inset-0 origin-left bg-[var(--accent-2)]"
                style={{ scaleX: fill }}
              />
              <motion.div className="tarina-origin-mobile-progress absolute inset-0 origin-left bg-[var(--accent-2)]" style={{ scaleX: mobileFill }} />
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

/* ── Reduced-motion flow ──────────────────────────────────────────────
   Readers get the title first, then the portrait, then the story. From
   md the portrait holds a sticky column spanning both rows.              */
const FLOW_BODY = "text-base leading-[1.85] text-[var(--ink-soft)]";

function Flow({ lang, canvas }: { lang: Lang; canvas: boolean }) {
  const story = STORY[lang];

  return (
    <div className="mx-auto grid max-w-7xl items-start gap-12 px-6 pb-24 pt-32 md:grid-cols-[320px_minmax(0,1fr)] md:gap-x-16 md:gap-y-10 md:px-10 md:pt-36 lg:gap-x-24 stage:hidden">
      <header className="flex flex-col gap-2 md:col-start-2 md:row-start-1">
        <Kicker lang={lang} />
        <Title lang={lang} className="text-5xl md:text-6xl lg:text-7xl" />
      </header>

      <div className="flex flex-col gap-6 md:sticky md:top-24 md:col-start-1 md:row-span-2 md:row-start-1">
        <div className="paper-well">
          <Portrait className="w-full">{canvas && <LivingPortrait />}</Portrait>
        </div>
        <Facts lang={lang} />
      </div>

      <div className="max-w-2xl space-y-7 md:col-start-2 md:row-start-2">
        <Opening story={story} className="text-lg leading-[1.85] text-[var(--ink-soft)]" />
        <p className={FLOW_BODY}>{story.flame}</p>

        <figure className="!my-12">
          <span aria-hidden="true" className="mb-7 block h-px w-12 bg-[var(--accent-2)]" />
          <InkQuote
            text={COPY.quote[lang]}
            className="font-serif text-3xl font-medium italic leading-[1.3] text-[var(--ink)] md:text-4xl"
          />
          <figcaption className="tag-mono mt-5">{COPY.cite}</figcaption>
        </figure>

        <p className={FLOW_BODY}>{story.shea}</p>
        <p className={FLOW_BODY}>{story.cure}</p>
        <p className={FLOW_BODY}>{story.slow}</p>
      </div>
    </div>
  );
}

export function OriginChapter() {
  const lang = useStore((s) => s.lang);
  const staged = useStaged();
  const layout = useMotionLayout();
  // Known only after mount, so neither layout mounts the living portrait
  // on the first paint, and the layout that is hidden never mounts it.
  const webgl = useStoryWebGL();

  return (
    <section id="alku" aria-label={COPY.label[lang]} data-tone="light">
      {layout !== false && <Stage lang={lang} canvas={webgl && staged} />}
      {layout !== true && <Flow lang={lang} canvas={webgl && !staged} />}
    </section>
  );
}
