import { readFileSync, writeFileSync } from "node:fs";

const p = "src/app/HomeClient.tsx";
let s = readFileSync(p, "utf8");
const before = s.length;

// 1) Remove the dead Hero() + HeroCTAPrimary() block:
//    from the "Hero" section banner comment up to (not including) the
//    "Stats Strip" section banner comment.
const startMarker = "/* ─── Hero ";
const endMarker = "/* ─── Stats Strip";
const startIdx = s.indexOf(startMarker);
const endIdx = s.indexOf(endMarker);
if (startIdx === -1) throw new Error("start marker not found");
if (endIdx === -1) throw new Error("end marker not found");
if (endIdx <= startIdx) throw new Error("markers out of order");
s = s.slice(0, startIdx) + s.slice(endIdx);

// 2) Prune imports that are now unused.
const reactBefore = 'import { useState, useEffect } from "react";';
const reactAfter = 'import { useEffect } from "react";';
if (!s.includes(reactBefore)) throw new Error("react import line not matched");
s = s.replace(reactBefore, reactAfter);

const logoImport = 'import { AnimatedLogo } from "@/components/AnimatedLogo";\n';
if (!s.includes(logoImport)) throw new Error("AnimatedLogo import not matched");
s = s.replace(logoImport, "");

const contactImport = 'import { ContactModal } from "@/components/ContactModal";\n';
if (!s.includes(contactImport)) throw new Error("ContactModal import not matched");
s = s.replace(contactImport, "");

// 3) Sanity assertions.
for (const gone of ["function Hero(", "HeroCTAPrimary", "AnimatedLogo", "ContactModal", "useState"]) {
  if (s.includes(gone)) throw new Error("expected removed token still present: " + gone);
}
for (const keep of ["HeroCandle", "useEffect", "function StatsStrip(", "useScroll", "useSpring"]) {
  if (!s.includes(keep)) throw new Error("expected kept token missing: " + keep);
}

writeFileSync(p, s, "utf8");
console.log("OK: " + before + " -> " + s.length + " chars (" + (before - s.length) + " removed)");
