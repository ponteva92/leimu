"use client";

import Image from "next/image";
import { motion, type MotionValue } from "framer-motion";
import type { Scent } from "@/types";
import type { Span } from "@/lib/timeline";
import { notesLine } from "@/lib/scents";
import { CaptionPlaque, PaperWell } from "@/components/ScentFrame";
import { fadeUpItem } from "@/lib/motionVariants";
import { WipeStill } from "@/components/story/WipeStill";

/**
 * Shared scent specimen. Same horizontal grid on home and /tuotteet:
 * one featured plate (2 cols) + four portrait cards. From lg the plate
 * spans two rows beside the portraits; below lg it runs full width above
 * a 2×2 of them. `reveal` ties the entrance to the scroll: the specimen
 * wipes up through its mount while `p` crosses the window `at`, the same
 * wipe the craft film uses.
 */
export function ScentCard({
  scent,
  lang,
  onSelect,
  featured = false,
  reveal,
  eager = false,
}: {
  scent: Scent;
  lang: "fi" | "en";
  onSelect: (s: Scent) => void;
  featured?: boolean;
  reveal?: { p: MotionValue<number>; at: Span };
  /** Load now. The scrubbed wipe clips the photo, and the browser's lazy
      loading doesn't fetch clipped images until they're uncovered. */
  eager?: boolean;
}) {
  const name = lang === "fi" ? scent.name : scent.nameEn;
  const notes = notesLine(lang === "fi" ? scent.profile : scent.profileEn);

  const specimen = (
    <>
      <Image
        src={scent.image}
        alt=""
        fill
        loading={eager ? "eager" : "lazy"}
        className="object-cover transition-transform duration-700 ease-[var(--ease-out)] group-hover:scale-[1.04]"
        sizes={featured ? "(max-width: 1023px) 100vw, 50vw" : "(max-width: 1023px) 50vw, 25vw"}
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{ background: "linear-gradient(180deg, rgba(196,122,58,0.05) 0%, rgba(26,24,20,0.13) 100%)" }}
      />
      <div className="absolute inset-x-3 bottom-3 md:inset-x-4 md:bottom-4">
        <CaptionPlaque pad={featured ? undefined : "px-3 py-2.5"}>
          {featured && (
            <p className="mb-1 font-mono text-[12px] uppercase tracking-[0.16em] text-[var(--on-dark)]">
              {lang === "fi" ? "Valittu" : "Featured"}
            </p>
          )}
          {/* On a phone the portrait cards are too narrow for name, price
              and notes: the price drops under the name and the notes wait
              for the scent card, so the plaque leaves the photo visible. */}
          <span
            className={
              featured
                ? "flex items-baseline justify-between gap-3"
                : "flex flex-col md:flex-row md:items-baseline md:justify-between md:gap-3"
            }
          >
            <span className={`font-serif leading-tight text-[var(--on-dark)] ${featured ? "text-3xl md:text-5xl" : "text-xl"}`}>
              {name}
            </span>
            <span className="flex-shrink-0 font-mono text-sm tabular-nums text-[var(--on-dark)]">
              {scent.price}
            </span>
          </span>
          <span className={`mt-1 text-[13px] leading-snug text-[var(--on-dark)] ${featured ? "block" : "hidden md:block"}`}>
            {notes}
          </span>
        </CaptionPlaque>
      </div>
    </>
  );

  return (
    <motion.button
      type="button"
      variants={fadeUpItem}
      className={[
        "group relative block h-full text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ink)] focus-visible:ring-offset-4 focus-visible:ring-offset-[var(--bg)]",
        featured ? "col-span-2 lg:row-span-2" : "",
      ].join(" ")}
      onClick={() => onSelect(scent)}
      aria-label={`${name}, ${lang === "fi" ? "avaa tuoksukortti" : "open scent card"}`}
    >
      {/* The hover lift is its own layer and only fades in, so the well
          keeps its hairline and nothing but opacity animates. */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 rounded-[var(--radius-lg)] opacity-0 shadow-e2 transition-opacity duration-300 group-hover:opacity-100"
      />
      <PaperWell className="h-full">
        <div
          className={[
            "relative isolate overflow-hidden rounded-[calc(var(--radius-lg)-6px)]",
            featured
              ? "aspect-[4/5] min-h-full md:aspect-[4/3] lg:aspect-auto lg:h-full"
              : "aspect-[4/5]",
          ].join(" ")}
        >
          {reveal ? (
            <WipeStill p={reveal.p} arrive={reveal.at}>
              {specimen}
            </WipeStill>
          ) : (
            specimen
          )}
        </div>
      </PaperWell>
    </motion.button>
  );
}
