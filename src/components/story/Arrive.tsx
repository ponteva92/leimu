"use client";

import { useRef, type ReactNode, type RefObject } from "react";
import { easeOut, motion, useTransform, type MotionValue } from "framer-motion";
import type { Span } from "@/lib/timeline";
import { useWillChange } from "./hooks";

/** Rises into place over its scroll window, then stays. `ref` is the
    element it styles, promoted while it moves (see useWillChange). */
export function useArrive(p: MotionValue<number>, at: Span, ref: RefObject<HTMLElement>) {
  const opacity = useTransform(p, at, [0, 1]);
  const y = useTransform(p, at, [24, 0], { ease: easeOut });
  useWillChange(p, [at], [ref], "transform, opacity");
  return { opacity, y };
}

export function Arrive({ p, at, children }: {
  p: MotionValue<number>;
  at: Span;
  children: ReactNode;
}) {
  const ref = useRef<HTMLDivElement>(null);
  return (
    <motion.div ref={ref} style={useArrive(p, at, ref)}>
      {children}
    </motion.div>
  );
}
