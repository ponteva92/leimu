"use client";

import { useStore } from "@/context/store";

const ITEMS_FI = [
  "Käsintehty",
  "Pieni erä",
  "Soijavaha",
  "Sheabutter",
  "Ekologinen",
  "Puuvillasydän",
  "Bambukansi",
  "Suomessa valmistettu",
];

const ITEMS_EN = [
  "Handmade",
  "Small batch",
  "Soy wax",
  "Shea butter",
  "Ecological",
  "Cotton wick",
  "Bamboo lid",
  "Made in Finland",
];

const DOT = "•";

export function Marquee() {
  const { lang } = useStore();
  const items = lang === "fi" ? ITEMS_FI : ITEMS_EN;
  // Duplicate for seamless loop
  const repeated = [...items, ...items, ...items, ...items];

  return (
    <div
      className="relative overflow-hidden border-b border-[var(--line)] bg-[var(--bg-2)]"
      style={{ height: "32px" }}
      aria-hidden="true"
    >
      <div className="flex items-center h-full animate-marquee whitespace-nowrap will-change-transform">
        {repeated.map((item, i) => (
          <span
            key={i}
            className="tag-mono text-[9px] flex items-center gap-4"
          >
            <span>{item}</span>
            <span className="text-[var(--line)] mx-2">{DOT}</span>
          </span>
        ))}
      </div>
    </div>
  );
}
