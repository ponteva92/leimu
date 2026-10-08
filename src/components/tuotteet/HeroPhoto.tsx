/* ════════════════════════════════════════════════════════════════════════
   LEIMU — Tuotteet hero photo
   ------------------------------------------------------------------------
   The still-life photograph, server-rendered: the page's largest paint.
   Where the melt canvas will mount (md and up with a fine pointer), the
   picture serves the very file the canvas samples, so the canvas's fetch
   only revalidates the cached copy and the two register pixel for pixel.
   Phones and tablets get the optimised photo. getImageProps adds no
   preload link, but the image sits in the server HTML with high fetch
   priority, so the browser finds it at once.
   ════════════════════════════════════════════════════════════════════════ */

import { getImageProps } from "next/image";
import { FINE_QUERY } from "@/lib/pin";

/** The file the canvas samples, and the picture's source on desktops. */
export const HERO_SRC = "/images/tuotteet-hero-1600.webp";
export const HERO_ASPECT = 1600 / 878;

export function HeroPhoto({ alt }: { alt: string }) {
  const { props } = getImageProps({
    src: "/images/tuotteet-hero.png",
    alt,
    fill: true,
    priority: true,
    sizes: "(max-width: 768px) 100vw, 50vw",
    className: "object-cover",
  });

  return (
    <picture>
      <source media={FINE_QUERY} srcSet={HERO_SRC} type="image/webp" />
      <img {...props} alt={alt} />
    </picture>
  );
}
