/* ════════════════════════════════════════════════════════════════════════
   LEIMU — Portrait photo
   ------------------------------------------------------------------------
   The founder photo, server-rendered, so the frame is never empty while
   LivingPortrait's chunk loads. The picture serves the very file the canvas
   samples, so the canvas's fetch only revalidates the cached copy; there
   the photo also takes the plane's overscan, so the two frame the face
   alike and the canvas fade reads as a warming, not a zoom. The literal
   scale-[1.2] matches PORTRAIT_OVERSCAN on every input method, so the
   canvas can fade in over its placeholder without a framing jump.
   ════════════════════════════════════════════════════════════════════════ */

import { getImageProps } from "next/image";

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
    className: "object-cover scale-[1.2]",
  });

  return (
    <picture>
      <source srcSet={PORTRAIT_SRC} />
      <img {...props} alt="" />
    </picture>
  );
}
