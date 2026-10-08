"use client";

/* ════════════════════════════════════════════════════════════════════════
   LEIMU — Tarina values (chapter "Arvot")
   ------------------------------------------------------------------------
   The four things that don't bend, as a numbered ledger on a paper sheet.

   On the stage: screen the sheet pulls up over the materials room; on
   wide screens the heading then holds beside the ledger while it scrolls
   past. Each value's numeral waits as a faint ghost of itself and inks in
   as its row comes into view, echoing the process chapter's thread; each
   title inks in as it is read, as the story's quotes do; the hairlines
   between the rows draw in. Nothing here is pinned: after three pinned
   chapters, the page reads on at its own pace.
   ════════════════════════════════════════════════════════════════════════ */

import { useRef } from "react";
import { useInView } from "framer-motion";
import { useStore } from "@/context/store";
import { coverVars } from "@/lib/timeline";
import { VIEWPORT_NEAR } from "@/lib/motionVariants";
import { DrawnRule } from "@/components/DrawnRule";
import { InkWords, useReadProgress } from "@/components/story/Ink";
import { COVER_SVH as MATERIALS_COVER_SVH } from "./MaterialsRoom";

type Lang = "fi" | "en";

/* ── Copy ──────────────────────────────────────────────────────────── */
const COPY = {
  label: { fi: "Arvot", en: "Values" },
};

type Value = {
  num: string;
  tag: Record<Lang, string>;
  title: Record<Lang, string>;
  desc: Record<Lang, string>;
};

const VALUES: Value[] = [
  {
    num: "01",
    tag: { fi: "EKO", en: "ECO" },
    title: { fi: "Ekologisuus", en: "Ecological" },
    desc: {
      fi: "Soijavaha, sheabutter, puuvillasydän, ainoastaan luonnollisia, uusiutuvia raaka-aineita. Ympäristö kiittää.",
      en: "Soy wax, shea butter, cotton wick, only natural, renewable materials. The environment thanks you.",
    },
  },
  {
    num: "02",
    tag: { fi: "EETTINEN", en: "ETHICAL" },
    title: { fi: "Eettisyys", en: "Ethical" },
    desc: {
      fi: "Vastuullisesti hankitut aineet. Ei eläinkokeita. Ei hämärää alkuperää. Läpinäkyvä toimitusketju.",
      en: "Responsibly sourced materials. No animal testing. No murky origins. Transparent supply chain.",
    },
  },
  {
    num: "03",
    tag: { fi: "KÄSITYÖ", en: "CRAFT" },
    title: { fi: "Käsityö", en: "Handcraft" },
    desc: {
      fi: "Yksi kynttilä kerrallaan. Ei massatuotantoa, vain käsi, vaha ja huolellisuus.",
      en: "One candle at a time. No mass production, just hand, wax, and care.",
    },
  },
  {
    num: "04",
    tag: { fi: "LUKSUS", en: "LUXURY" },
    title: { fi: "Saavutettava luksus", en: "Accessible luxury" },
    desc: {
      // A no-break space keeps the price on one line, as in lib/scents.
      fi: "Kohtuuhintainen, mutta tinkimätön laatu. 9\u00a0€, ja jokainen euro on perusteltu.",
      en: "Affordable but uncompromising quality. 9\u00a0€, and every euro is justified.",
    },
  },
];

function Heading({ lang }: { lang: Lang }) {
  return lang === "fi" ? (
    <>
      Neljä asiaa, jotka eivät <em>jousta.</em>
    </>
  ) : (
    <>
      Four things that don’t <em>bend.</em>
    </>
  );
}

/* The list numbers the values for screen readers, so the numerals are
   decorative. The inked numeral fades in over its ghost: opacity only,
   once, and CSS runs it. The title inks with the scroll instead, and
   screen readers get it whole. */
function ValueRow({ value, lang, last }: { value: Value; lang: Lang; last: boolean }) {
  const ref = useRef<HTMLLIElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const inked = useInView(ref, VIEWPORT_NEAR);
  const read = useReadProgress(titleRef);

  return (
    <li
      ref={ref}
      className="relative grid grid-cols-[3rem_minmax(0,1fr)] gap-x-5 py-9 md:grid-cols-[5.5rem_minmax(0,1fr)] md:gap-x-8 md:py-12"
    >
      <DrawnRule className="absolute inset-x-0 top-0" />
      {last && <DrawnRule className="absolute inset-x-0 bottom-0" />}
      <span
        aria-hidden="true"
        className="relative self-start font-serif text-4xl italic leading-none text-[var(--line)] md:text-6xl"
      >
        {value.num}
        <span
          className={`absolute left-0 top-0 text-[var(--accent-2-text)] transition-opacity duration-1000 ease-out motion-reduce:transition-none ${inked ? "opacity-100" : "opacity-0"}`}
        >
          {value.num}
        </span>
      </span>
      <div>
        <p className="tag-mono text-[var(--accent-2-text)]">{value.tag[lang]}</p>
        <h3 ref={titleRef} className="heading-display mt-3 text-3xl text-[var(--ink)] md:text-4xl">
          <InkWords text={value.title[lang]} p={read} emLast />
        </h3>
        <p className="mt-4 max-w-[52ch] leading-[1.7] text-[var(--ink-soft)] md:text-lg">
          {value.desc[lang]}
        </p>
      </div>
    </li>
  );
}

export function ValuesLedger() {
  const lang = useStore((s) => s.lang);

  // The sheet pulls up over the dark room, whose own tone marks the edge,
  // so it needs neither the seam nor the shadow the paper sheets cast.
  return (
    <section
      id="arvot"
      aria-label={COPY.label[lang]}
      data-tone="light"
      className="relative z-10 bg-[var(--bg)] stage:-mt-[var(--cover)]"
      style={coverVars(MATERIALS_COVER_SVH)}
    >
      <div className="mx-auto grid max-w-7xl gap-12 px-6 py-24 md:px-10 md:py-32 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-20">
        <h2 className="heading-display text-4xl text-[var(--ink)] md:text-5xl lg:sticky lg:top-28 lg:self-start lg:text-6xl">
          <Heading lang={lang} />
        </h2>
        <ol>
          {VALUES.map((value, i) => (
            <ValueRow key={value.num} value={value} lang={lang} last={i === VALUES.length - 1} />
          ))}
        </ol>
      </div>
    </section>
  );
}
