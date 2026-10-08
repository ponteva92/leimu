"use client";

/* ════════════════════════════════════════════════════════════════════════
   LEIMU — Dialog shell
   ------------------------------------------------------------------------
   One frame for every modal (scent card, contact, privacy):
   · portalled to <body>, so a transformed or sticky ancestor can never
     trap the fixed overlay or sink it under the header
   · the overlay itself scrolls (data-lenis-prevent), so a tall panel on a
     short viewport stays reachable while the page behind is locked
   · scroll lock, Escape, focus trap and focus return via useModal
   The scrim fades on its own element: an ancestor with opacity < 1 would
   become the backdrop root and the blur would pop in only at the end.
   ════════════════════════════════════════════════════════════════════════ */

import { useEffect, useRef, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion, useIsPresent, type Variants } from "framer-motion";
import { useModal } from "@/lib/useModal";
import { EASE_IN_EXPO, EASE_PREMIUM } from "@/lib/motionVariants";

const scrim: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.25 } },
  exit: { opacity: 0, transition: { duration: 0.2 } },
};

/** Default panel motion: a short rise on the house curve, a crisp ease-in exit. */
export const panelRise: Variants = {
  hidden: { opacity: 0, y: 24, scale: 0.97 },
  visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.3, ease: EASE_PREMIUM } },
  exit: { opacity: 0, y: 12, scale: 0.97, transition: { duration: 0.18, ease: EASE_IN_EXPO } },
};

type DialogProps = {
  open: boolean;
  onClose: () => void;
  /** Accessible name announced when the dialog opens. */
  label: string;
  /** Scrim colour and blur. Glass panels need the darker scrim. */
  backdropClassName?: string;
  panelClassName: string;
  panelVariants?: Variants;
  children: ReactNode;
};

export function Dialog({ open, ...frame }: DialogProps) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return null;

  return createPortal(
    <AnimatePresence>{open && <DialogFrame key="dialog" {...frame} />}</AnimatePresence>,
    document.body,
  );
}

function DialogFrame({
  onClose,
  label,
  backdropClassName = "bg-[rgba(20,17,13,0.55)] backdrop-blur-md",
  panelClassName,
  panelVariants = panelRise,
  children,
}: Omit<DialogProps, "open">) {
  const panelRef = useRef<HTMLDivElement>(null);
  const pressedOutside = useRef(false);
  // Closed as soon as the exit starts: unlock the page and hand focus back
  // without waiting for the fade.
  const isPresent = useIsPresent();
  useModal({ active: isPresent, onClose, panelRef });

  return (
    <motion.div
      data-lenis-prevent
      className="fixed inset-0 z-[var(--z-modal)] overflow-y-auto overscroll-contain"
      initial="hidden"
      animate="visible"
      exit="exit"
    >
      <motion.div aria-hidden="true" variants={scrim} className={`fixed inset-0 ${backdropClassName}`} />

      {/* min-h-full centres a short panel and lets a tall one scroll.
          A press that starts and ends outside the panel closes; a text
          selection dragged out of the panel does not. */}
      <div
        className="relative flex min-h-full items-center justify-center p-4 md:p-8"
        onPointerDown={(e) => {
          pressedOutside.current = e.target === e.currentTarget;
        }}
        onClick={(e) => {
          if (pressedOutside.current && e.target === e.currentTarget) onClose();
        }}
      >
        <motion.div
          ref={panelRef}
          role="dialog"
          aria-modal="true"
          aria-label={label}
          tabIndex={-1}
          variants={panelVariants}
          className={`relative w-full focus:outline-none ${panelClassName}`}
        >
          {children}
        </motion.div>
      </div>
    </motion.div>
  );
}
