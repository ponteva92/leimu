/* ════════════════════════════════════════════════════════════════════════
   LEIMU — Tuotteet hero photo
   ------------------------------------------------------------------------
   The still-life photograph, server-rendered: the page's largest paint.
   The picture serves the very file the melt canvas samples, so its fetch
   only revalidates the cached copy and the two register pixel for pixel.
   Both use the same compressed image on phones and desktops. getImageProps
   adds no preload link, but the image sits in the server HTML with high fetch
   priority, so the browser finds it at once.
   ════════════════════════════════════════════════════════════════════════ */

import { getImageProps } from "next/image";

/** One compressed source for the immediate photograph and the canvas. */
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
      <source srcSet={HERO_SRC} type="image/webp" />
      <img {...props} alt={alt} />
    </picture>
  );
}
