import { useEffect, useMemo } from "react";
import { useLoader } from "@react-three/fiber";
import * as THREE from "three";

type Options = { anisotropy?: number; colorSpace?: THREE.ColorSpace };

/* Safari before 17 and Firefox before 98 ignore createImageBitmap's
   options, so their bitmaps would draw upside down. Those browsers decode
   through an image element instead, as three's GLTFLoader does. Fixed for
   the page's life, so every render calls the same hooks. */
const DECODE_TO_BITMAP = (() => {
  if (typeof createImageBitmap === "undefined" || typeof navigator === "undefined") return false;
  const ua = navigator.userAgent;
  if (/^((?!chrome|android).)*safari/i.test(ua)) return Number(ua.match(/Version\/(\d+)/)?.[1]) >= 17;
  const firefox = ua.match(/Firefox\/(\d+)\./);
  return !firefox || Number(firefox[1]) >= 98;
})();

/* WebGL ignores flipY and premultiplyAlpha for bitmaps, so the bitmap is
   flipped at decode and keeps straight alpha, as an image would. R3F
   shares one ImageBitmapLoader and reads its options only after the
   fetch, so every caller sets the same options. */
function useBitmap(url: string) {
  return useLoader(THREE.ImageBitmapLoader, url, (loader) => {
    loader.setOptions({ imageOrientation: "flipY", premultiplyAlpha: "none" } satisfies ImageBitmapOptions);
  });
}

function useImage(url: string) {
  return useLoader(THREE.ImageLoader, url);
}

const useSource = DECODE_TO_BITMAP ? useBitmap : useImage;

/**
 * A texture for the R3F scenes, decoded off the main thread (fetch +
 * createImageBitmap) wherever the browser honours the decode options.
 *
 * Colour textures default to sRGB, which three decodes to linear when
 * sampled; a raw ShaderMaterial that composites in gamma space passes
 * NoColorSpace to sample the stored values as they are.
 */
export function useBitmapTexture(
  url: string,
  { anisotropy = 1, colorSpace = THREE.SRGBColorSpace }: Options = {},
): THREE.Texture {
  const source = useSource(url);

  const texture = useMemo(() => {
    const t = new THREE.Texture(source);
    // A bitmap was flipped as it decoded; an image flips as it uploads.
    t.flipY = !DECODE_TO_BITMAP;
    t.colorSpace = colorSpace;
    t.anisotropy = anisotropy;
    t.needsUpdate = true;
    return t;
  }, [source, anisotropy, colorSpace]);

  useEffect(() => () => texture.dispose(), [texture]);

  return texture;
}
