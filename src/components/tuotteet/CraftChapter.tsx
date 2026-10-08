"use client";

/* ════════════════════════════════════════════════════════════════════════
   LEIMU — Tuotteet craft film (chapter "Käsityö")
   ------------------------------------------------------------------------
   The studio film of a candle being made, beside the three facts of how
   LEIMU works: one jar at a time, a week's cure, all of it by hand.

   Pinned (the stage: screen): a 300svh track holds a 100svh sticky stage.
   The film stays put on the left while the facts crossfade beside it,
   each with the paragraph it stands for, and an amber hairline keeps the
   place. Over the last 40svh the gift sheet pulls up over the stage while
   it recedes. Smaller screens and reduced motion get the same content in
   normal flow.

   The film loads a viewport ahead and plays only while it can be seen.
   Under reduced motion it holds its first frame until the reader presses
   play, and a press on its control holds on both layouts.
   ════════════════════════════════════════════════════════════════════════ */

import { useEffect, useRef, useState, type ReactNode, type RefObject } from "react";
import Image from "next/image";
import {
  easeInOut, easeOut, motion, useInView, useMotionValueEvent, useTransform,
  type MotionValue,
} from "framer-motion";
import { Pause, Play } from "@phosphor-icons/react";
import { useStore } from "@/context/store";
import { REDUCE_QUERY, useMediaQuery } from "@/lib/pin";
import { beatWindows, coverStart, trackVars } from "@/lib/timeline";
import {
  fadeUpItem, headingCinematic, staggerCinematic, VIEWPORT_NEAR,
} from "@/lib/motionVariants";
import { DrawnRule } from "@/components/DrawnRule";
import { Crossfade } from "@/components/story/Crossfade";
import { useCoverRecede, useStageShown, useTrackProgress, useWillChange } from "@/components/story/hooks";

type Lang = "fi" | "en";

/* ── Timeline ──────────────────────────────────────────────────────────
   The track's height and the gift sheet's pull-up in GiftChapter read
   these through CSS variables (see lib/timeline).                        */
const TRACK_SVH = 300;
/** How far the gift sheet pulls up over the stage. */
export const COVER_SVH = 40;
const COVER_START = coverStart(TRACK_SVH, COVER_SVH);
/* Two wipes carry the three facts. The first fact is already in place;
   the last holds while the cover runs. */
const wipe = beatWindows(2, { head: 0.1, tail: 0.3, fill: 0.6 });

/* The hairline fills a third per fact, in time with the wipes. */
const FILL_INPUT = [...wipe(0), ...wipe(1)];
const FILL_OUTPUT = [1 / 3, 2 / 3, 2 / 3, 1];

const FILM_SRC = "/images/Valmistus.mp4";
const POSTER_SRC = "/images/valmistus-poster.webp";

const COPY = {
  tag: { fi: "Käsityö", en: "Craft" },
  film: {
    fi: "LEIMU-kynttilän valmistus Oulun studiolla",
    en: "A LEIMU candle being made in the Oulu studio",
  },
  pause: { fi: "Keskeytä video", en: "Pause video" },
  play: { fi: "Toista video", en: "Play video" },
};

type Fact = { value: string; label: string; body: ReactNode };

const FACTS: Record<Lang, Fact[]> = {
  fi: [
    {
      value: "1",
      label: "kerrallaan",
      body: (
        <>
          Jokainen LEIMU syntyy käsin, ei linjastolla, ei erissä, vaan yksi
          purkki kerrallaan. Vaha sulatetaan oikeassa lämpötilassa,
          tuoksuöljyt sekoitetaan huolella ja sydän asetetaan tarkalleen
          keskelle.
        </>
      ),
    },
    {
      value: "7 pv",
      label: "cure-vaihe",
      body: (
        <>
          Sen jälkeen alkaa hiljaisin vaihe:{" "}
          <span className="font-medium text-[var(--ink)]">cure</span>. Viikko
          pimeässä, rauhassa, jonka aikana tuoksu kypsyy ja vaha löytää
          lopullisen muotonsa.
        </>
      ),
    },
    {
      value: "100%",
      label: "käsityö",
      body: (
        <>
          Tämä on hidas tapa tehdä kynttilöitä.{" "}
          <em className="font-medium not-italic text-[var(--ink)]">
            Ainoa tapa, jolla LEIMU haluaa ne tehdä.
          </em>
        </>
      ),
    },
  ],
  en: [
    {
      value: "1",
      label: "at a time",
      body: (
        <>
          Every LEIMU is made by hand: not on a production line, not in bulk,
          but one jar at a time. We melt the wax at just the right
          temperature, blend the fragrance oils with care and set the wick
          exactly in the centre.
        </>
      ),
    },
    {
      value: "7 days",
      label: "cure",
      body: (
        <>
          Then the quietest stage begins:{" "}
          <span className="font-medium text-[var(--ink)]">the cure</span>. A
          week in the dark, undisturbed, while the scent matures and the wax
          settles into its final form.
        </>
      ),
    },
    {
      value: "100%",
      label: "handmade",
      body: (
        <>
          This is a slow way to make candles.{" "}
          <em className="font-medium not-italic text-[var(--ink)]">
            The only way LEIMU wants to make them.
          </em>
        </>
      ),
    },
  ],
};

/* ── Shared pieces ────────────────────────────────────────────────── */
function CraftHeading({ lang }: { lang: Lang }) {
  return lang === "fi" ? (
    <>Käsityötä,<br /><em>hetki</em> kerrallaan.</>
  ) : (
    <>Handcrafted,<br />one <em>moment</em> at a time.</>
  );
}

/* A fact in the ledger's type: mono figure over its label, as on home. */
function Figure({ fact }: { fact: Fact }) {
  return (
    <div className="flex flex-col gap-1.5">
      <p className="font-mono text-2xl tracking-tight tabular-nums text-[var(--ink)] md:text-3xl">
        {fact.value}
      </p>
      <p className="tag-mono">{fact.label}</p>
    </div>
  );
}

/** Whether the film should play, and the reader's press on its control. */
type Playback = { play: boolean; setPlay: (play: boolean) => void };

/* ── Film ──────────────────────────────────────────────────────────────
   The poster is the first paint and stays under the video, which shows
   nothing until its first frame has loaded. The source is set a viewport
   ahead, and the film plays only while it can be seen: in view and, on
   the stage, not yet under the gift sheet (an observer can't tell that a
   covered box is hidden). The layout that is display: none never
   intersects, so its copy never loads.                                   */
function CraftFilm({
  lang, playback, sizes, className = "", active = true, parked = false, settle, settleRef,
}: {
  lang: Lang;
  playback: Playback;
  sizes: string;
  className?: string;
  active?: boolean;
  /** True while the next sheet may cover the control: it leaves the tab
      order, so keyboard focus never lands on it out of sight. */
  parked?: boolean;
  settle?: MotionValue<number>;
  settleRef?: RefObject<HTMLDivElement>;
}) {
  const frameRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const near = useInView(frameRef, { once: true, margin: "100% 0px" });
  const inView = useInView(frameRef);
  const { play, setPlay } = playback;
  const playing = play && inView && active;

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !near) return;
    if (!playing) {
      video.pause();
      return;
    }
    video.muted = true;
    video.play().catch((error: unknown) => {
      // The browser refused to autoplay (a battery saver, say). Offer the
      // play control instead, since a press is allowed to start it.
      if (error instanceof DOMException && error.name === "NotAllowedError") setPlay(false);
    });
  }, [playing, near, setPlay]);

  return (
    <div
      ref={frameRef}
      className={`relative isolate aspect-[9/16] overflow-hidden rounded-[calc(var(--radius-lg)-6px)] ${className}`}
    >
      <motion.div
        ref={settleRef}
        className="absolute inset-0"
        style={settle ? { scale: settle } : undefined}
      >
        <Image src={POSTER_SRC} alt="" fill sizes={sizes} className="object-cover" />
        <video
          ref={videoRef}
          src={near ? FILM_SRC : undefined}
          muted
          loop
          playsInline
          preload={play ? "auto" : "none"}
          aria-label={COPY.film[lang]}
          className="absolute inset-0 h-full w-full object-cover"
        />
      </motion.div>

      <div className="absolute inset-x-4 bottom-4 z-10 flex items-center justify-between gap-3">
        <span className="caption-plaque px-3 py-2 font-mono text-[12px] uppercase tracking-[0.16em]">
          Oulu · Studio
        </span>
        <button
          type="button"
          onClick={() => setPlay(!play)}
          tabIndex={parked ? -1 : undefined}
          aria-label={play ? COPY.pause[lang] : COPY.play[lang]}
          className="caption-plaque grid h-11 w-11 flex-shrink-0 place-items-center rounded-full p-0 transition-[background-color,transform] duration-base ease-[var(--ease-out)] hover:bg-[var(--ink-soft)] focus-visible:rounded-full active:scale-95"
        >
          {play ? (
            <Pause size={16} weight="fill" aria-hidden="true" />
          ) : (
            <Play size={16} weight="fill" aria-hidden="true" />
          )}
        </button>
      </div>
    </div>
  );
}

/* ── Pinned stage ──────────────────────────────────────────────────── */
function Stage({ lang, playback }: { lang: Lang; playback: Playback }) {
  const trackRef = useRef<HTMLDivElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);
  const settleRef = useRef<HTMLDivElement>(null);
  const { approach, p, leave } = useTrackProgress(trackRef, TRACK_SVH);
  // The stage's approach, before it pins: the film settles in.
  const settle = useTransform(approach, [0, 1], [1.08, 1], { ease: easeOut });
  const recede = useCoverRecede(p, COVER_START);
  const fill = useTransform(p, FILL_INPUT, FILL_OUTPUT, { ease: easeInOut });
  useWillChange(approach, [[0, 1]], [settleRef]);
  useWillChange(p, [[COVER_START, 1]], [gridRef]);

  // Once the gift sheet starts to pull up, the film's control is parked.
  const covering = useTransform(p, (v) => v > COVER_START);
  const [parked, setParked] = useState(false);
  useMotionValueEvent(covering, "change", setParked);

  // After the track ends, the stage rides up under the gift sheet. The
  // film plays only while some of it still shows.
  const active = useStageShown(leave, COVER_SVH);

  return (
    <div
      ref={trackRef}
      data-pin-rest={0}
      className="relative hidden stage:block stage:h-[var(--track)]"
      style={trackVars(TRACK_SVH)}
    >
      <div className="sticky top-0 flex h-[100svh] items-center pb-6 pt-20">
        <motion.div
          ref={gridRef}
          className="mx-auto grid w-full max-w-7xl origin-top grid-cols-[auto_minmax(0,36rem)] items-center justify-center gap-16 px-10 xl:gap-28"
          style={{ scale: recede }}
        >
          {/* The frame's height sets its width through the film's ratio. */}
          <div className="paper-well">
            <CraftFilm
              lang={lang}
              playback={playback}
              sizes="44vh"
              className="h-[min(78svh,calc(100svh-11rem))]"
              active={active}
              parked={parked}
              settle={settle}
              settleRef={settleRef}
            />
          </div>

          <motion.div
            className="flex flex-col gap-8"
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
              className="heading-display text-5xl text-[var(--ink)] xl:text-6xl"
            >
              <CraftHeading lang={lang} />
            </motion.h2>

            <motion.div variants={fadeUpItem} className="grid">
              {FACTS[lang].map((fact, k) => (
                <Crossfade key={fact.value} p={p} arrive={wipe(k - 1)} leave={wipe(k)}>
                  <Figure fact={fact} />
                  <p className="mt-5 max-w-[46ch] leading-relaxed text-[var(--ink-soft)]">
                    {fact.body}
                  </p>
                </Crossfade>
              ))}
            </motion.div>

            <motion.div
              variants={fadeUpItem}
              aria-hidden="true"
              className="relative h-px w-full bg-[var(--line)]"
            >
              <motion.div
                className="absolute inset-0 origin-left bg-[var(--accent-2)]"
                style={{ scaleX: fill }}
              />
            </motion.div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}

/* ── Flow fallback (smaller screens, reduced motion) ───────────────── */
function Flow({ lang, playback }: { lang: Lang; playback: Playback }) {
  const facts = FACTS[lang];

  return (
    <div className="mx-auto max-w-7xl px-6 py-24 md:px-10 stage:hidden">
      <div className="grid items-center gap-12 md:grid-cols-2 md:gap-20">
        <div className="paper-well mx-auto w-full max-w-[340px] md:mx-0">
          <CraftFilm lang={lang} playback={playback} sizes="340px" />
        </div>

        <motion.div
          className="flex flex-col gap-7"
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
            className="heading-display text-4xl text-[var(--ink)] md:text-5xl"
          >
            <CraftHeading lang={lang} />
          </motion.h2>
          <motion.div
            variants={fadeUpItem}
            className="max-w-[65ch] space-y-4 leading-relaxed text-[var(--ink-soft)]"
          >
            {facts.map((fact) => (
              <p key={fact.value}>{fact.body}</p>
            ))}
          </motion.div>
          <motion.div
            variants={fadeUpItem}
            className="flex flex-wrap gap-x-10 gap-y-6 border-t border-[var(--line)] pt-6"
          >
            {facts.map((fact) => (
              <Figure key={fact.value} fact={fact} />
            ))}
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}

export function CraftChapter() {
  const lang = useStore((s) => s.lang);
  const reduce = useMediaQuery(REDUCE_QUERY);
  // Once the reader presses the control, their choice wins over the
  // motion preference.
  const [choice, setChoice] = useState<boolean | null>(null);
  const playback: Playback = { play: choice ?? !reduce, setPlay: setChoice };

  return (
    <section id="kasityo" aria-label={COPY.tag[lang]}>
      <div className="mx-auto max-w-7xl px-6 md:px-10">
        <DrawnRule />
      </div>
      <Stage lang={lang} playback={playback} />
      <Flow lang={lang} playback={playback} />
    </section>
  );
}
