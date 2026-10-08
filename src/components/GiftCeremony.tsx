"use client";

/**
 * GiftCeremony — "Sinetöity viesti" (The Sealed Letter)
 *
 * The brand's two physical signatures are the same Finnish word: the flame
 * (leimu) and the wax seal (leima). This section closes that loop with the
 * black thank-you envelope and its golden LEIMU seal.
 *
 * Two layouts share one copy deck (all in the house framer-motion + Lenis
 * vocabulary — no new deps):
 *
 * Flow (default; also the home chapter's fallback)
 *   • The envelope floats on a gentle scroll-parallax under a warm spotlight.
 *   • A gold band crosses the panel on entrance and again on each hover, the
 *     same band that crosses the seal in the home chapter.
 *   • Copy reveals with the shared stagger variants.
 *   • Reduced-motion: parallax + shimmer collapse to a clean fade. GPU-only
 *     transforms (translate/scale/opacity); the parallax layer is promoted
 *     only while it moves.
 *
 * Chapter (`chapter`, home only; where the `stage` screen matches)
 *   • A 250svh track pins a 100svh stage. The paper dims to a dark room while
 *     the envelope rises from a tilt and glides from centre into its column.
 *   • The copy then arrives line by line, the seal's one shimmer lands late,
 *     and the CTA comes last.
 *   • The final stretch is the cover: the stage recedes as the quote wall
 *     sheet rises over it. The nav holds dark glass while the room is under it.
 *
 * Reusable + bilingual: the gift-card copy lives here once (single source of
 * truth) and both Etusivu and Tuotteet render it. `ctaHref` tailors the CTA
 * per page; pass `null` to omit it (e.g. when already on the products page).
 */

import { useEffect, useRef, type CSSProperties, type FocusEvent } from "react";
import Link from "next/link";
import Image, { getImageProps } from "next/image";
import {
  easeInOut,
  motion,
  useInView,
  useMotionValue,
  useScroll,
  useTransform,
  useReducedMotion,
  type MotionValue,
} from "framer-motion";
import { ArrowRight } from "@phosphor-icons/react";
import { useStore } from "@/context/store";
import { scrollToTarget } from "@/lib/scroll";
import { coverStart, mid, trackVars, type Span } from "@/lib/timeline";
import {
  headingReveal,
  fadeUpItem,
  staggerContainer,
  VIEWPORT_NEAR,
} from "@/lib/motionVariants";
import { RULE_ON_DARK } from "@/components/DrawnRule";
import { Arrive, useArrive } from "@/components/story/Arrive";
import { useCoverRecede, useDarkStageSync, useWillChange } from "@/components/story/hooks";

type Lang = "fi" | "en";

interface GiftCeremonyProps {
  /** CTA target. `undefined` → default order link; `null` → no CTA. */
  ctaHref?: string | null;
  className?: string;
  /** Home only: pin as a scroll chapter where the `stage` screen matches. */
  chapter?: boolean;
}

const COPY = {
  chapter: { fi: "Sinetti", en: "Seal" },
  eyebrow: { fi: "Jokaiseen tilaukseen", en: "With every order" },
  // Heading is split so the accent word routes through the Cormorant italic.
  headingLead: { fi: "Sinetöity viesti,", en: "A sealed message," },
  headingAccent: { fi: "kultaisella musteella.", en: "in gold ink." },
  // Verbatim brand copy, paragraphed at sentence boundaries for legibility.
  body: {
    fi: [
      "Jokaiseen LEIMU Candles -tilaukseen tulee mukaan musta kiitoskortti, joka sisältää sinun omavalintaisen viestin. Viesti on käsinkirjoitettu kultaisella musteella, ja se sinetöidään upealla LEIMUn logolla varustetulla kultaisella vahasinetillä.",
      "Tämän ansiosta LEIMU Candles sopii täydellisesti esim. pikkujoulu- tai yrityslahjaksi. Voit myös hemmotella itseäsi ylellisellä kokemuksella, jolloin voimme kirjoittaa sinulle yllätysviestin!",
      "LEIMU Candles on ylellinen elämys lahjansaajalle, jollaista muut kynttilät eivät tarjoa, oli saajana sitten läheinen tai sinä itse. Mieleenpainuva lahja, koska sinä olet sen ansainnut.",
    ],
    en: [
      "Every LEIMU Candles order arrives with a black thank-you card carrying a message of your choosing. It is handwritten in gold ink and closed with a golden wax seal pressed with the LEIMU mark.",
      "That makes LEIMU Candles a flawless gift for a Christmas party or a corporate occasion. Or treat yourself to the indulgence, and let us write you a surprise message.",
      "LEIMU Candles is a luxurious experience for whoever receives it, the kind ordinary candles never offer, whether that's someone close to you, or you. An unforgettable gift, because you have earned it.",
    ],
  },
  details: [
    { fi: "Käsinkirjoitettu", en: "Handwritten" },
    { fi: "Kultainen vahasinetti", en: "Gold wax seal" },
    { fi: "Oma viestisi", en: "Your own words" },
  ],
  cta: { fi: "Tee tilaus", en: "Order yours" },
  alt: {
    fi: "Musta kirjekuori, jonka sulkee kultainen LEIMU Candles -vahasinetti",
    en: "Black envelope closed with a golden LEIMU Candles wax seal",
  },
} as const;

const KORTTI_SRC = "/images/kortti.png";

/* ── Chapter timeline ──────────────────────────────────────────────────
   The track's height and the quote wall sheet's pull-up in HomeClient
   read these through CSS variables, so the classes can't drift from the
   timeline (see lib/timeline). Windows are fractions of the pinned
   scroll; the cover runs from COVER_START to the end.                    */
const TRACK_SVH = 250;
export const COVER_SVH = 40;
const COVER_START = coverStart(TRACK_SVH, COVER_SVH);

const ROOM: Span = [0, 0.16]; // the paper dims to a dark room
const GLOW: Span = [0.06, 0.24]; // the spotlight warms behind the envelope
const LIFT: Span = [0, 0.26]; // the envelope rises from its tilt
const GLIDE: Span = [0.08, 0.3]; // ...and glides from centre into its column
const EYEBROW: Span = [0.22, 0.3];
const LEAD: Span = [0.25, 0.33];
const ACCENT: Span = [0.29, 0.37];
const BODY: Span[] = [
  [0.36, 0.44],
  [0.42, 0.5],
  [0.48, 0.56],
];
const RULE: Span = [0.53, 0.61];
const DETAILS: Span = [0.54, 0.6];
const SHIMMER: Span = [0.58, 0.68]; // the seal's one shimmer
const CTA: Span = [0.64, 0.7];
/** Where keyboard focus parks the CTA: fully arrived, not yet covered. */
const CTA_REST = (CTA[1] + COVER_START) / 2;

/* The shimmer is masked to the envelope's own alpha, so it never lights
   the room. A small optimised copy of the envelope is enough for a mask. */
const KORTTI_MASK = getImageProps({ src: KORTTI_SRC, width: 320, height: 235, alt: "" }).props.src;

/* The envelope's shadows are baked into images: kortti.png's alpha, padded
   by `pad` source pixels a side, blurred, and stored at quarter size. A
   drop-shadow filter would blur again on every raster of the moving
   envelope. The image is laid over the envelope's box (920 × 676 source
   pixels) and dropped by `drop` source pixels. */
function bakedShadow(src: string, pad: number, drop: number, opacity: number): CSSProperties {
  const side = `${(-pad / 920) * 100}%`;
  return {
    left: side,
    right: side,
    top: `${((drop - pad) / 676) * 100}%`,
    bottom: `${((-drop - pad) / 676) * 100}%`,
    opacity,
    backgroundImage: `url(${src})`,
    backgroundSize: "100% 100%",
  };
}

// drop-shadow(0 28px 36px rgba(26,24,20,0.38)) at the 540px envelope the
// chapter shows from xl.
const STAGE_SHADOW = bakedShadow("/images/kortti-shadow.webp", 96, 47.7, 0.38);
// drop-shadow(0 34px 52px rgba(0,0,0,0.55)) at the flow's 472px envelope.
const FLOW_SHADOW = bakedShadow("/images/kortti-shadow-soft.webp", 156, 66.3, 0.55);

/* ── Flow layout (products page; the home chapter's fallback) ──────── */
function Flow({ lang, ctaHref }: { lang: Lang; ctaHref: string | null }) {
  const reduce = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const envRef = useRef<HTMLDivElement>(null);

  /* Scroll-parallax for the floating envelope (disabled under reduced motion). */
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const envY = useTransform(scrollYProgress, [0, 1], ["7%", "-7%"]);
  // The envelope drifts the whole time the panel is on screen.
  useWillChange(scrollYProgress, reduce ? [] : [[0, 1]], [envRef]);

  return (
    <div ref={ref} className="grid md:grid-cols-2 gap-12 lg:gap-16 items-center">
      {/* ── Envelope spotlight panel ─────────────────────────────── */}
      <motion.div
        className="group relative order-1 md:order-none"
        initial="rest"
        whileHover="hover"
        whileInView="sweep"
        viewport={{ once: true, margin: "-120px 0px" }}
      >
        <div
          className="relative isolate overflow-hidden rounded-3xl border border-[var(--line)] shadow-e4"
          style={{
            aspectRatio: "5 / 4",
            background:
              "radial-gradient(120% 90% at 50% 38%, #2a2620 0%, #1d1a15 45%, #14110d 100%)",
          }}
        >
          {/* Warm spotlight behind the seal */}
          <div
            aria-hidden="true"
            className="absolute inset-0 pointer-events-none"
            style={{
              background:
                "radial-gradient(circle at 50% 42%, rgba(212,169,106,0.26) 0%, rgba(212,169,106,0.08) 38%, transparent 62%)",
            }}
          />

          {/* The floating envelope (parallax + a touch of lift on hover).
              CSS stills the parallax under reduced motion, so the server's
              markup already suits every reader. */}
          <motion.div
            ref={envRef}
            className="absolute inset-0 flex items-center justify-center p-8 sm:p-12 [container-type:size] motion-reduce:!transform-none"
            style={{ y: envY }}
          >
            {/* The envelope's own box, as large as the padding allows, so
                the baked shadow can be laid against it. */}
            <motion.div
              className="relative aspect-[920/676] w-full supports-[width:1cqh]:w-[min(100%,100cqh*920/676)]"
              variants={{
                rest: { scale: 1, y: 0 },
                hover: { scale: 1.025, y: -6 },
              }}
              transition={{ type: "spring", stiffness: 200, damping: 24 }}
            >
              <div aria-hidden="true" className="pointer-events-none absolute" style={FLOW_SHADOW} />
              <Image
                src={KORTTI_SRC}
                alt={COPY.alt[lang]}
                fill
                className="object-contain"
                sizes="(max-width: 768px) 90vw, 45vw"
              />
            </motion.div>
          </motion.div>

          {/* A strip of three gold bands crosses the panel from right to left
              on entrance and again on each hover: a faint pass as it fades in,
              a full pass, and a faint pass as it fades out. Its offsets, in
              strip widths, start and end with every band outside the panel, so
              settling back to the swept state after a hover never shows it.
              Only transform and opacity animate, on the compositor,
              and the panel's isolate keeps the screen blend inside the panel. */}
          <motion.div
            aria-hidden="true"
            className="pointer-events-none absolute inset-y-0 left-[-260%] w-[780%] mix-blend-screen"
            style={{
              background:
                "linear-gradient(108deg, transparent 42%, rgba(255,222,140,0.45) 50%, rgba(212,169,106,0.18) 55%, transparent 64%) 0 0 / calc(100% / 3) 100%",
            }}
            variants={{
              rest: { transform: "translateX(32.8205%)", opacity: 0, transition: { duration: 0 } },
              sweep: reduce ? { opacity: 0 } : { transform: "translateX(-57.1795%)", opacity: [null, 1, 1, 0] },
              hover: reduce
                ? { opacity: 0 }
                : { transform: ["translateX(32.8205%)", "translateX(-57.1795%)"], opacity: [0, 1, 1, 0] },
            }}
            transition={{ duration: 1.2, ease: "easeInOut" }}
          />

          {/* Inner vignette for depth */}
          <div
            aria-hidden="true"
            className="absolute inset-0 pointer-events-none rounded-3xl"
            style={{ boxShadow: "inset 0 0 90px 24px rgba(0,0,0,0.45)" }}
          />

        </div>
      </motion.div>

      {/* ── Copy ─────────────────────────────────────────────────── */}
      <motion.div
        variants={staggerContainer}
        initial="hidden"
        whileInView="visible"
        viewport={VIEWPORT_NEAR}
      >
        <motion.p variants={fadeUpItem} className="tag-mono text-[var(--accent-2-strong)] mb-3">
          {COPY.eyebrow[lang]}
        </motion.p>

        <motion.h2
          variants={headingReveal}
          className="heading-display text-5xl md:text-6xl text-[var(--ink)] mb-8"
        >
          {COPY.headingLead[lang]}
          <br />
          <em>{COPY.headingAccent[lang]}</em>
        </motion.h2>

        <div className="space-y-5 text-[var(--ink-soft)] leading-relaxed">
          {COPY.body[lang].map((para, i) => (
            <motion.p
              key={i}
              variants={fadeUpItem}
              className={i === 0 ? "text-lg text-[var(--ink)]" : ""}
            >
              {para}
            </motion.p>
          ))}
        </div>

        {/* Detail row — echoes the craft-stat rhythm elsewhere on the site */}
        <motion.div
          variants={fadeUpItem}
          className="mt-9 flex flex-wrap gap-x-8 gap-y-4 pt-6 border-t border-[var(--line)]"
        >
          {COPY.details.map((d) => (
            <span
              key={d.fi}
              className="tag-mono"
            >
              {d[lang]}
            </span>
          ))}
        </motion.div>

        {ctaHref && (
          <motion.div variants={fadeUpItem} className="mt-10">
            <Link
              href={ctaHref}
              className="inline-flex items-center gap-2 px-7 py-3.5 bg-[var(--ink)] text-[var(--bg)] font-sans font-medium text-[13px] tracking-[0.08em] uppercase rounded-full hover:bg-[var(--accent-2-strong)] transition-colors duration-200"
            >
              {COPY.cta[lang]}
              <ArrowRight size={13} weight="light" aria-hidden="true" />
            </Link>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}

/* ── Chapter pieces ────────────────────────────────────────────────── */

/* A gold band crosses the envelope once as the chapter scrolls past it,
   and back again on the way up. */
function Shimmer({ p, near }: { p: MotionValue<number>; near: boolean }) {
  const x = useTransform(p, SHIMMER, ["-100%", "100%"], { ease: easeInOut });
  const mask = `url("${KORTTI_MASK}")`;

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 overflow-hidden mix-blend-screen"
      style={
        // The band waits off-frame until long after the chapter is near.
        near
          ? {
              WebkitMaskImage: mask,
              maskImage: mask,
              WebkitMaskSize: "100% 100%",
              maskSize: "100% 100%",
              WebkitMaskRepeat: "no-repeat",
              maskRepeat: "no-repeat",
            }
          : undefined
      }
    >
      <motion.div
        className="absolute inset-0"
        style={{
          x,
          background:
            "linear-gradient(108deg, transparent 38%, rgba(255,222,140,0.5) 50%, rgba(212,169,106,0.2) 56%, transparent 66%)",
        }}
      />
    </div>
  );
}

/* ── Pinned chapter (home) ─────────────────────────────────────────── */
function Stage({ lang, ctaHref }: { lang: Lang; ctaHref: string | null }) {
  const trackRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);
  const colRef = useRef<HTMLDivElement>(null);

  const { scrollYProgress: p } = useScroll({
    target: trackRef,
    offset: ["start start", "end end"],
  });
  // Fetch the shimmer's mask as the track nears, like a lazy image.
  const near = useInView(trackRef, { once: true, margin: "100% 0px" });

  const room = useTransform(p, ROOM, [0, 1]);
  const glow = useTransform(p, GLOW, [0, 1]);
  const tilt = useTransform(p, LIFT, [26, 0], { ease: easeInOut });
  const turn = useTransform(p, LIFT, [-4, 0], { ease: easeInOut });
  const lift = useTransform(p, LIFT, [0.88, 1], { ease: easeInOut });
  const glide = useTransform(p, GLIDE, [0, 1], { ease: easeInOut });
  // How far the envelope's column sits from the stage's centre line.
  const shift = useMotionValue(0);
  const x = useTransform([glide, shift], ([g, s]: number[]) => (1 - g) * s);
  const rule = useTransform(p, RULE, [0, 1], { ease: easeInOut });
  const recede = useCoverRecede(p, COVER_START);

  const leadRef = useRef<HTMLSpanElement>(null);
  const accentRef = useRef<HTMLSpanElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);
  const leadIn = useArrive(p, LEAD, leadRef);
  const accentIn = useArrive(p, ACCENT, accentRef);
  const ctaIn = useArrive(p, CTA, ctaRef);
  const ctaPointer = useTransform(ctaIn.opacity, (o) => (o > 0.5 ? "auto" : "none"));

  // The bar holds dark glass from halfway through the room's fade until
  // the quote wall sheet reaches it.
  useDarkStageSync(trackRef, { stageRef, from: mid(ROOM, 0.5), cover: COVER_SVH });
  // The room and the glow only fade; the envelope turns and scales as it lifts.
  const roomRef = useRef<HTMLDivElement>(null);
  const glowRef = useRef<HTMLDivElement>(null);
  const envRef = useRef<HTMLDivElement>(null);
  useWillChange(p, [ROOM], [roomRef], "opacity");
  useWillChange(p, [GLOW], [glowRef], "opacity");
  useWillChange(p, [LIFT], [envRef]);
  useWillChange(p, [GLIDE], [colRef]);
  useWillChange(p, [[COVER_START, 1]], [gridRef]);

  useEffect(() => {
    const grid = gridRef.current;
    const col = colRef.current;
    if (!grid || !col) return;
    // Layout boxes ignore transforms, so the glide and recede don't feed back.
    const measure = () => shift.set(grid.offsetWidth / 2 - (col.offsetLeft + col.offsetWidth / 2));
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(grid);
    observer.observe(col);
    return () => observer.disconnect();
  }, [shift]);

  /* Keyboard focus can reach the CTA before it arrives or after the next
     sheet covers it. Glide to where it rests in full view. The browser's
     own scroll-into-view runs after this handler, so start on the next
     frame, from wherever that leaves the page. */
  const parkCta = (e: FocusEvent<HTMLAnchorElement>) => {
    if (!e.currentTarget.matches(":focus-visible")) return;
    const at = p.get();
    if (at >= CTA[1] && at <= COVER_START) return;
    requestAnimationFrame(() => {
      const track = trackRef.current;
      const stage = stageRef.current;
      if (!track || !stage) return;
      scrollToTarget(track, { offset: CTA_REST * (track.offsetHeight - stage.offsetHeight) });
    });
  };

  return (
    <div
      ref={trackRef}
      data-pin-rest={CTA_REST}
      className="relative hidden stage:block stage:h-[var(--track)]"
      style={trackVars(TRACK_SVH)}
    >
      {/* The stage reports the room's tone to the chapter rail. */}
      <div
        ref={stageRef}
        data-tone="light"
        className="sticky top-0 isolate flex h-[100svh] items-center overflow-hidden pb-6 pt-16"
      >
        {/* The room. Everything under the copy stays at #16130f or darker,
            which keeps the amber eyebrow at AAA. */}
        <motion.div
          ref={roomRef}
          aria-hidden="true"
          className="absolute inset-0"
          style={{
            opacity: room,
            background: "radial-gradient(120% 100% at 30% 50%, #16130f 55%, #0f0d0a 100%)",
          }}
        />

        <motion.div
          ref={gridRef}
          className="relative mx-auto grid w-full max-w-7xl origin-top grid-cols-[0.8fr_1.2fr] items-center gap-12 px-10 xl:grid-cols-[0.95fr_1.05fr] xl:gap-16"
          style={{ scale: recede }}
        >
          <motion.div ref={colRef} className="relative" style={{ x }}>
            <div className="relative">
              <motion.div
                ref={glowRef}
                aria-hidden="true"
                className="pointer-events-none absolute -inset-[20%]"
                style={{
                  opacity: glow,
                  background:
                    "radial-gradient(closest-side, rgba(212,169,106,0.26), rgba(212,169,106,0.08) 60%, transparent)",
                }}
              />
              {/* Promoted only while it lifts. Without the hint, Chrome
                  would redraw the envelope at every step of the scale. */}
              <motion.div
                ref={envRef}
                className="relative"
                style={{ rotateX: tilt, rotate: turn, scale: lift, transformPerspective: 1400 }}
              >
                <div className="relative aspect-[920/676] w-full">
                  <div aria-hidden="true" className="pointer-events-none absolute" style={STAGE_SHADOW} />
                  <Image
                    src={KORTTI_SRC}
                    alt={COPY.alt[lang]}
                    fill
                    className="object-contain"
                    sizes="(min-width: 1440px) 600px, 45vw"
                  />
                  <Shimmer p={p} near={near} />
                </div>
              </motion.div>
            </div>

            <div className="relative mt-8">
              <motion.div
                aria-hidden="true"
                className={`h-px origin-left ${RULE_ON_DARK}`}
                style={{ scaleX: rule }}
              />
              <Arrive p={p} at={DETAILS}>
                <ul className="flex flex-wrap gap-x-8 gap-y-3 pt-5">
                  {COPY.details.map((d) => (
                    <li key={d.fi} className="tag-mono text-[var(--on-dark)]">
                      {d[lang]}
                    </li>
                  ))}
                </ul>
              </Arrive>
            </div>
          </motion.div>

          <div className="max-w-[40rem]">
            <Arrive p={p} at={EYEBROW}>
              <p className="tag-mono mb-3 text-[var(--accent-2-on-dark)]">{COPY.eyebrow[lang]}</p>
            </Arrive>

            <h2 className="heading-display mb-[3svh] text-[clamp(2.25rem,6.4svh,3.75rem)] text-[var(--on-dark)]">
              <motion.span ref={leadRef} className="block" style={leadIn}>
                {COPY.headingLead[lang]}
              </motion.span>{" "}
              <motion.span ref={accentRef} className="block" style={accentIn}>
                <em>{COPY.headingAccent[lang]}</em>
              </motion.span>
            </h2>

            <div className="space-y-[1.8svh] text-[clamp(0.875rem,2.2svh,1rem)] leading-relaxed text-[var(--on-dark-soft)]">
              {COPY.body[lang].map((para, i) => (
                <Arrive key={i} p={p} at={BODY[i]}>
                  <p className={i === 0 ? "text-[var(--on-dark)]" : undefined}>{para}</p>
                </Arrive>
              ))}
            </div>

            {ctaHref && (
              <motion.div ref={ctaRef} className="mt-[3.6svh]" style={{ ...ctaIn, pointerEvents: ctaPointer }}>
                <Link
                  href={ctaHref}
                  onFocus={parkCta}
                  className="inline-flex items-center gap-2 px-7 py-3.5 bg-[var(--on-dark)] text-[var(--ink)] font-sans font-medium text-[13px] tracking-[0.08em] uppercase rounded-full hover:bg-[var(--accent-2-on-dark)] transition-colors duration-200"
                >
                  {COPY.cta[lang]}
                  <ArrowRight size={13} weight="light" aria-hidden="true" />
                </Link>
              </motion.div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}

export function GiftCeremony({
  ctaHref = "/tuotteet#configurator",
  className = "",
  chapter = false,
}: GiftCeremonyProps) {
  const lang = useStore((s) => s.lang);

  if (!chapter) {
    return (
      <section className={`py-24 px-6 md:px-10 max-w-7xl mx-auto ${className}`}>
        <Flow lang={lang} ctaHref={ctaHref} />
      </section>
    );
  }

  return (
    <section id="sinetti" aria-label={COPY.chapter[lang]} className={className || undefined}>
      <Stage lang={lang} ctaHref={ctaHref} />
      <div className="mx-auto max-w-7xl px-6 py-24 md:px-10 stage:hidden">
        <Flow lang={lang} ctaHref={ctaHref} />
      </div>
    </section>
  );
}
