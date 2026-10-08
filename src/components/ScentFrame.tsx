"use client";

import type { ReactNode } from "react";

/** Paper mount so a black cut-out reads as a specimen, not a hole. */
export function PaperWell({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={`paper-well overflow-hidden ${className}`.trim()}>
      {children}
    </div>
  );
}

/** Solid field for type that must sit near photography. */
export function CaptionPlaque({
  children,
  className = "",
  pad = "px-4 py-3",
  tone = "ink",
}: {
  children: ReactNode;
  className?: string;
  /** Padding utilities. Kept out of className: two padding utilities on
      one element resolve by stylesheet order, not by the order written. */
  pad?: string;
  tone?: "ink" | "paper";
}) {
  return (
    <div
      className={[
        "rounded-[var(--radius-sm)]",
        pad,
        tone === "ink"
          ? "bg-[var(--plaque)] text-[var(--on-dark)]"
          : "bg-[var(--bg)] text-[var(--ink)] ring-1 ring-[var(--line)]",
        className,
      ].join(" ")}
    >
      {children}
    </div>
  );
}
