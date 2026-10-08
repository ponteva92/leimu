"use client";

/* A still that wipes up into its frame. Arriving, its mask opens upward
   through the frame while the image inside drifts against it, settling
   from a slight zoom when given one. With a `leave` window it gives way to
   the next still: it drifts up and, given a shade, dims under it. Later
   stills paint above earlier ones. The frame clips; the still fills it. */

import { useRef, type ReactNode } from "react";
import { easeInOut, easeOut, motion, useTransform, type MotionValue } from "framer-motion";
import type { Span } from "@/lib/timeline";
import { useWillChange } from "./hooks";

const NEVER: Span = [2, 3];

export function WipeStill({ p, arrive, leave, zoom, shade, children }: {
  p: MotionValue<number>;
  arrive: Span;
  leave?: Span;
  /** Starting scale of the image, settling to 1 as it arrives. */
  zoom?: number;
  /** Darkness of the dim as it leaves, 0–1. */
  shade?: number;
  children: ReactNode;
}) {
  const maskRef = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);
  const dimRef = useRef<HTMLDivElement>(null);
  const maskY = useTransform(
    p,
    leave ? [...arrive, ...leave] : arrive,
    leave ? ["100%", "0%", "0%", "-16%"] : ["100%", "0%"],
    { ease: easeInOut },
  );
  const innerY = useTransform(p, arrive, ["-85%", "0%"], { ease: easeInOut });
  const scale = useTransform(p, arrive, [zoom ?? 1, 1], { ease: easeOut });
  const dim = useTransform(p, leave ?? NEVER, [0, shade ?? 0], { ease: easeInOut });
  useWillChange(p, [arrive, leave], [maskRef, innerRef]);
  useWillChange(p, [shade ? leave : undefined], [dimRef], "opacity");

  return (
    <motion.div ref={maskRef} className="absolute inset-0 overflow-hidden" style={{ y: maskY }}>
      <motion.div
        ref={innerRef}
        className="absolute inset-0"
        style={zoom ? { y: innerY, scale } : { y: innerY }}
      >
        {children}
      </motion.div>
      {shade ? (
        <motion.div
          ref={dimRef}
          aria-hidden="true"
          className="absolute inset-0 bg-[var(--ink)]"
          style={{ opacity: dim }}
        />
      ) : null}
    </motion.div>
  );
}
