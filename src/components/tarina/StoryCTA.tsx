"use client";

/* ════════════════════════════════════════════════════════════════════════
   LEIMU — Tarina closing call ("Liity tarinaan")
   ------------------------------------------------------------------------
   The page's last word, on the warmer paper. An amber rule draws down
   from the top edge, then the kicker, heading, line and the two pills
   rise in one stagger. The pills lean toward a mouse pointer on the site's
   button spring; under reduced motion they stay put.
   ════════════════════════════════════════════════════════════════════════ */

import type { PointerEvent, ReactNode } from "react";
import Link from "next/link";
import { motion, useMotionValue, useSpring } from "framer-motion";
import { ArrowRight } from "@phosphor-icons/react";
import { useStore } from "@/context/store";
import { REDUCE_QUERY, useMediaQuery } from "@/lib/pin";
import {
  EASE_PREMIUM, EASE_SPRING_MAGNETIC, VIEWPORT_NEAR,
  fadeUpItem, headingCinematic, staggerCinematic,
} from "@/lib/motionVariants";

type Lang = "fi" | "en";

const MotionLink = motion.create(Link);

/* ── Copy ──────────────────────────────────────────────────────────── */
const COPY = {
  kicker: { fi: "Liity tarinaan", en: "Join the story" },
  body: {
    fi: "Jokainen tilaus on hetki, joka rakentaa LEIMUa eteenpäin. Kiitos että olet osa sitä.",
    en: "Every order is a moment that builds LEIMU forward. Thank you for being part of it.",
  },
  scents: { fi: "Tutustu tuoksuihin", en: "Explore scents" },
  contact: { fi: "Ota yhteyttä", en: "Get in touch" },
};

function Heading({ lang }: { lang: Lang }) {
  return lang === "fi" ? (
    <>
      Pienen liekin <em>iso</em> tarina.
    </>
  ) : (
    <>
      A small flame’s <em>big</em> story.
    </>
  );
}

/* ── Magnetic pill ─────────────────────────────────────────────────────
   The site's pill: the ink one leads, the outline one follows. The pull
   rides the same spring as the hover and press scale
   (EASE_SPRING_MAGNETIC), and it measures from the pill's resting centre,
   so the pull doesn't feed back on itself.                               */
const PULL = { stiffness: 180, damping: 22, mass: 0.8 };
/** How far the pill leans, as a share of the pointer's offset. */
const STRENGTH = 0.3;

const PILL =
  "group relative inline-flex items-center justify-center gap-2 rounded-full px-7 py-3.5 font-sans text-[13px] font-medium uppercase tracking-[0.08em] transition-colors duration-300 focus-visible:rounded-full";
const PRIMARY = "bg-[var(--ink)] text-[var(--bg)] hover:bg-[var(--accent-2-strong)]";
const OUTLINE =
  "border border-[var(--field-border)] text-[var(--ink)] hover:border-[var(--accent-2)]";

function MagneticCTA({ children, href, onClick, primary = false }: {
  children: ReactNode;
  href?: string;
  onClick?: () => void;
  primary?: boolean;
}) {
  const setCursorType = useStore((s) => s.setCursorType);
  const still = useMediaQuery(REDUCE_QUERY);
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const x = useSpring(mx, PULL);
  const y = useSpring(my, PULL);

  // Touch has no hover to lean toward, and a tap would leave the pill
  // pulled aside, so only a mouse pulls.
  const pull = (e: PointerEvent<HTMLElement>) => {
    if (still || e.pointerType !== "mouse") return;
    const r = e.currentTarget.getBoundingClientRect();
    mx.set((e.clientX - (r.left + r.width / 2 - x.get())) * STRENGTH);
    my.set((e.clientY - (r.top + r.height / 2 - y.get())) * STRENGTH);
  };
  const release = () => {
    mx.set(0);
    my.set(0);
    setCursorType("default");
  };

  const props = {
    className: `${PILL} ${primary ? PRIMARY : OUTLINE}`,
    style: { x, y },
    whileHover: { scale: 1.03 },
    whileTap: { scale: 0.97 },
    transition: EASE_SPRING_MAGNETIC,
    onPointerEnter: () => setCursorType("pointer"),
    onPointerMove: pull,
    onPointerLeave: release,
  };
  // The glow sits on its own layer and fades in, so only opacity animates.
  const body = (
    <>
      <span
        aria-hidden="true"
        className="pointer-events-none absolute -inset-px rounded-full opacity-0 shadow-glow transition-opacity duration-300 group-hover:opacity-100"
      />
      {children}
    </>
  );

  return href ? (
    <MotionLink href={href} {...props}>
      {body}
    </MotionLink>
  ) : (
    <motion.button type="button" onClick={onClick} {...props}>
      {body}
    </motion.button>
  );
}

export function StoryCTA() {
  const lang = useStore((s) => s.lang);
  const openContact = useStore((s) => s.openContact);

  return (
    <section className="relative overflow-hidden bg-[var(--bg-2)] px-6 py-32 text-center md:px-10">
      <div aria-hidden="true" className="absolute inset-x-0 top-0 flex justify-center">
        <motion.span
          className="block h-[72px] w-px origin-top bg-[var(--accent-2)] motion-reduce:!transform-none"
          initial={{ scaleY: 0 }}
          whileInView={{ scaleY: 1 }}
          viewport={VIEWPORT_NEAR}
          transition={{ duration: 1.1, ease: EASE_PREMIUM }}
        />
      </div>

      <motion.div
        className="mx-auto max-w-2xl pt-10"
        variants={staggerCinematic}
        initial="hidden"
        whileInView="visible"
        viewport={VIEWPORT_NEAR}
      >
        <motion.p variants={fadeUpItem} className="tag-mono mb-6">
          {COPY.kicker[lang]}
        </motion.p>
        <motion.h2
          variants={headingCinematic}
          className="heading-display mb-6 text-4xl text-[var(--ink)] md:text-5xl lg:text-6xl"
        >
          <Heading lang={lang} />
        </motion.h2>
        <motion.p
          variants={fadeUpItem}
          className="mx-auto mb-10 max-w-[46ch] leading-[1.7] text-[var(--ink-soft)] md:text-lg"
        >
          {COPY.body[lang]}
        </motion.p>
        <motion.div variants={fadeUpItem} className="flex flex-wrap justify-center gap-4">
          <MagneticCTA href="/tuotteet" primary>
            {COPY.scents[lang]}
            <ArrowRight size={13} weight="light" aria-hidden="true" />
          </MagneticCTA>
          <MagneticCTA onClick={openContact}>{COPY.contact[lang]}</MagneticCTA>
        </motion.div>
      </motion.div>
    </section>
  );
}
