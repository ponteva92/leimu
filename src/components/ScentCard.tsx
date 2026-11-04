"use client";

import Image from "next/image";
import { useRef, type CSSProperties } from "react";
import { motion, useInView, useMotionValue, useSpring, type MotionValue } from "framer-motion";
import { ArrowUpRight } from "@phosphor-icons/react";
import { PIN_QUERY, useMediaQuery } from "@/lib/pin";
import type { Scent } from "@/types";
import type { Span } from "@/lib/timeline";
import { notesLine } from "@/lib/scents";
import { fadeUpItem } from "@/lib/motionVariants";
import { WipeStill } from "@/components/story/WipeStill";

/** A botanical cabinet: a full specimen beside four compact scent entries.
 * Artwork moves independently of the reading surface and the scroll wipe. */
export function ScentCard({ scent, lang, onSelect, featured = false, index = 0, reveal, eager = false }: {
  scent: Scent;
  lang: "fi" | "en";
  onSelect: (s: Scent) => void;
  featured?: boolean;
  index?: number;
  reveal?: { p: MotionValue<number>; at: Span };
  eager?: boolean;
}) {
  const name = lang === "fi" ? scent.name : scent.nameEn;
  const notes = notesLine(lang === "fi" ? scent.profile : scent.profileEn);
  const ref = useRef<HTMLButtonElement>(null);
  const compact = useMediaQuery("(max-width: 767px)");
  const touch = useMediaQuery("(hover: none), (pointer: coarse)");
  const motionAllowed = useMediaQuery(PIN_QUERY);
  const centered = useInView(ref, { margin: "-25% 0px -35% 0px" });
  // A phone reads one compact entry at a time. Its artwork is available as
  // soon as the card appears, without a second scroll to uncover it.
  const cardReveal = compact ? undefined : reveal;
  const pointerX = useMotionValue(0);
  const pointerY = useMotionValue(0);
  const x = useSpring(pointerX, { stiffness: 180, damping: 24 });
  const y = useSpring(pointerY, { stiffness: 180, damping: 24 });

  const specimen = (
    <div className="scent-specimen">
      <span className="scent-specimen-ring" aria-hidden="true" />
      <motion.div className="scent-specimen-art" style={motionAllowed ? { x, y } : undefined}>
        <Image src={scent.image} alt="" fill loading={eager ? "eager" : "lazy"}
          className="scent-photo" sizes={featured ? "(max-width: 767px) 160px, 320px" : "(max-width: 767px) 120px, 160px"} />
      </motion.div>
      <span className="scent-specimen-number" aria-hidden="true">0{index + 1}</span>
    </div>
  );

  return (
    <motion.button ref={ref} type="button" variants={fadeUpItem}
      className="scent-card group"
      data-featured={featured ? "true" : undefined}
      data-touch-active={touch && centered && motionAllowed}
      style={{ "--scent-tone": scent.ambientColor } as CSSProperties}
      aria-label={`${name}. ${notes}. ${scent.price}. ${lang === "fi" ? "Tutustu tuoksuun" : "Explore the scent"}.`}
      whileTap={motionAllowed ? { scale: 0.985 } : undefined}
      onPointerMove={(event) => {
        if (touch || !motionAllowed) return;
        const box = event.currentTarget.getBoundingClientRect();
        pointerX.set(((event.clientX - box.left) / box.width - 0.5) * 14);
        pointerY.set(((event.clientY - box.top) / box.height - 0.5) * 10);
      }}
      onPointerLeave={() => { pointerX.set(0); pointerY.set(0); }}
      onClick={() => onSelect(scent)}
    >
      <div className="scent-image-frame">
        {cardReveal ? <WipeStill p={cardReveal.p} arrive={cardReveal.at}>{specimen}</WipeStill> : specimen}
      </div>
      <div className="scent-caption">
        {featured && <span className="scent-featured-label">{lang === "fi" ? "Studion valinta" : "From the studio"}</span>}
        <span className="scent-caption-top"><span className="scent-name">{name}</span><span className="scent-price">{scent.price}</span></span>
        <span className="scent-notes">{notes}</span>
        <span className="scent-action"><span>{lang === "fi" ? "Tutustu" : "Discover"}</span><span className="scent-arrow"><ArrowUpRight size={17} weight="light" aria-hidden="true" /></span></span>
      </div>
    </motion.button>
  );
}
