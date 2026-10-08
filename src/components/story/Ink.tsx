"use client";

/* Ink: words that ink in as they are read. Unread words wait as a ghost
   of the ink, never gone. Each word inks over a window a few words wide,
   so the front reads as a soft edge rather than a word-by-word blink.
   Screen readers get the sentence whole, not as separate words. */

import { Fragment, useRef, type RefObject } from "react";
import { motion, useScroll, useTransform, type MotionValue } from "framer-motion";
import type { Span } from "@/lib/timeline";

const GHOST = 0.16;
const FRONT_WORDS = 4;

function InkWord({ p, at, children }: {
  p: MotionValue<number>;
  at: Span;
  children: string;
}) {
  const opacity = useTransform(p, at, [GHOST, 1]);
  // Under reduced motion the stylesheet's !important beats the inline ghost.
  return (
    <motion.span className="motion-reduce:!opacity-100" style={{ opacity }}>
      {children}
    </motion.span>
  );
}

/** `text`, inked word by word as `p` runs across `at`. With `emLast` the
    last word is set in italic: a heading's one italic word, as StepTitle
    sets it. */
export function InkWords({ text, p, at = [0, 1], emLast = false }: {
  text: string;
  p: MotionValue<number>;
  at?: Span;
  emLast?: boolean;
}) {
  const words = text.split(" ");
  const span = Math.min(1, FRONT_WORDS / words.length);
  const [from, to] = at;
  const place = (t: number) => from + t * (to - from);

  return (
    <>
      <span className="sr-only">{text}</span>
      <span aria-hidden="true">
        {words.map((word, i) => {
          const start = (i / Math.max(1, words.length - 1)) * (1 - span);
          const inked = (
            <InkWord p={p} at={[place(start), place(start + span)]}>
              {word}
            </InkWord>
          );
          return (
            <Fragment key={i}>
              {i > 0 && " "}
              {emLast && i === words.length - 1 ? <em>{inked}</em> : inked}
            </Fragment>
          );
        })}
      </span>
    </>
  );
}

/** How far an element in normal flow has been read: from its top near the
    fold until its end passes just above mid-screen. */
export function useReadProgress(ref: RefObject<HTMLElement>) {
  return useScroll({ target: ref, offset: ["start 0.9", "end 0.6"] }).scrollYProgress;
}

/** A quote in normal flow, inked as it is read. */
export function InkQuote({ text, className }: { text: string; className: string }) {
  const ref = useRef<HTMLQuoteElement>(null);
  const read = useReadProgress(ref);

  return (
    <blockquote ref={ref} className={className}>
      <InkWords text={text} p={read} />
    </blockquote>
  );
}
