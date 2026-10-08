/* ════════════════════════════════════════════════════════════════════════
   LEIMU — Portrait photo
   ------------------------------------------------------------------------
   The founder photo, server-rendered, so the frame is never empty while
   LivingPortrait's chunk loads. Where the canvas will mount (md and up
   with a fine pointer), the picture serves the very file the canvas
   samples, so the canvas's fetch only revalidates the cached copy; there
   the photo also takes the plane's overscan, so the two frame the face
   alike and the canvas fade reads as a warming, not a zoom. The literal
   media variant and scale-[1.2] match FINE_QUERY in lib/pin and
   PORTRAIT_OVERSCAN. Phones and tablets get the optimised photo.
   ════════════════════════════════════════════════════════════════════════ */

import { getImageProps } from "next/image";
import { FINE_QUERY } from "@/lib/pin";

export const PORTRAIT_SRC = "/images/ivs-portrait-web.jpg";
/** The plane overscans its frame, so the gentle tilt never shows an edge. */
export const PORTRAIT_OVERSCAN = 1.2;
/* One sizes string for both layouts, so the browser fetches one file. */
const PORTRAIT_SIZES = "(min-width: 1024px) 34vw, (min-width: 768px) 320px, 100vw";

export function PortraitPhoto() {
  const { props } = getImageProps({
    src: PORTRAIT_SRC,
    alt: "",
    fill: true,
    priority: true,
    sizes: PORTRAIT_SIZES,
    className: "object-cover [@media(min-width:768px)_and_(pointer:fine)]:scale-[1.2]",
  });

  return (
    <picture>
      <source media={FINE_QUERY} srcSet={PORTRAIT_SRC} />
      <img {...props} alt="" />
    </picture>
  );
}
