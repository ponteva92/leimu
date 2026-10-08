"use client";

import { MotionConfig } from "framer-motion";

/* Visitors who ask their OS for reduced motion get framer's entrances,
   hovers and presses without the movement: transforms jump to their end
   state and only the opacity fades play. Motion values bound straight to
   the scroll don't pass through here, so each of those checks the
   preference itself (usePinned, useReducedMotion). */
export function MotionProvider({ children }: { children: React.ReactNode }) {
  return <MotionConfig reducedMotion="user">{children}</MotionConfig>;
}
