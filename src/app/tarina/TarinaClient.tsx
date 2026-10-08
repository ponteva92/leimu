"use client";

import { useRef } from "react";
import { coverVars } from "@/lib/timeline";
import { ChapterRail, type Chapter } from "@/components/story/ChapterRail";
import { OriginChapter, COVER_SVH as ORIGIN_COVER_SVH } from "@/components/tarina/OriginChapter";
import { ProcessChapter } from "@/components/tarina/ProcessChapter";
import { MaterialsRoom } from "@/components/tarina/MaterialsRoom";
import { ValuesLedger } from "@/components/tarina/ValuesLedger";
import { StoryCTA } from "@/components/tarina/StoryCTA";

const CHAPTERS: Chapter[] = [
  { id: "alku", label: { fi: "Alku", en: "Origin" } },
  { id: "polku", label: { fi: "Polku", en: "Process" } },
  { id: "aineet", label: { fi: "Aineet", en: "Materials" } },
  { id: "arvot", label: { fi: "Arvot", en: "Values" } },
];

/* ─── Page ──────────────────────────────────────────────────────────
   On large screens (the `stage` screen) the origin pins beside the
   founder's portrait, then this opaque, higher-z sheet rises over it.
   Inside the sheet the process row pins and travels, the dark materials
   room rises over its last stretch and pins in turn, and the values
   sheet rises over the room. Smaller screens and reduced motion keep
   everything in normal flow. Each surface marks its tone (data-tone) for
   the chapter rail. */
export function TarinaClient() {
  const sheetRef = useRef<HTMLDivElement>(null);

  return (
    <>
      <OriginChapter />
      <ChapterRail chapters={CHAPTERS} startRef={sheetRef} />
      {/* The pull-up is OriginChapter's COVER_SVH. */}
      <div
        ref={sheetRef}
        data-tone="light"
        className="relative z-10 bg-[var(--bg)] stage:-mt-[var(--cover)] stage:shadow-[0_-24px_70px_-18px_rgba(26,24,20,0.2)]"
        style={coverVars(ORIGIN_COVER_SVH)}
      >
        <div aria-hidden="true" className="sheet-seam hidden stage:block" />
        <ProcessChapter />
        <MaterialsRoom />
        <ValuesLedger />
        <StoryCTA />
      </div>
    </>
  );
}
