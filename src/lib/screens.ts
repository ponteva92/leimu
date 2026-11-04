/* Media queries shared by the Tailwind config and client code. This file
   has no imports and no "use client", so tailwind.config.ts can load it
   with a plain relative import. */

/** CSS and React select the same storytelling layout. Compact geometry
    changes composition; only reduced motion selects the flow version. */
export const STAGE_QUERY = "(prefers-reduced-motion: no-preference)";

/** The complement of the original desktop stage geometry, including a
    phone rotated to landscape and wide but short browser windows. */
export const COMPACT_STAGE_QUERY =
  "(max-width: 1023px), (max-width: 1279px) and (max-height: 719px), (max-height: 639px)";
