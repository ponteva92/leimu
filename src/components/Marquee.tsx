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

export function Marquee({ tone = "light" }: { tone?: "light" | "dark" }) {
  const { lang } = useStore();
  const items = lang === "fi" ? ITEMS_FI : ITEMS_EN;
  const repeated = [...items, ...items, ...items, ...items];
  const dark = tone === "dark";

  return (
    <div
      className="relative overflow-hidden border-b"
      style={{
        height: "32px",
        backgroundColor: dark ? "rgba(22, 20, 15, 0.72)" : "var(--bg-2)",
        borderColor: dark ? "rgba(242, 236, 223, 0.10)" : "var(--line)",
        backdropFilter: dark ? "blur(20px)" : undefined,
        WebkitBackdropFilter: dark ? "blur(20px)" : undefined,
        transition: "background-color 0.5s cubic-bezier(0.22,1,0.36,1), border-color 0.5s cubic-bezier(0.22,1,0.36,1)",
      }}
      aria-hidden="true"
    >
      <div className="flex items-center h-full animate-marquee whitespace-nowrap will-change-transform">
        {repeated.map((item, i) => (
          <span
            key={i}
            className="tag-mono text-[9px] flex items-center gap-4"
            style={{ color: dark ? "rgba(242, 236, 223, 0.72)" : undefined }}
          >
            <span>{item}</span>
            <span
              className="mx-2"
              style={{ color: dark ? "rgba(216, 148, 86, 0.45)" : "var(--line)" }}
            >
              {DOT}
            </span>
          </span>
        ))}
      </div>
    </div>
  );
}
