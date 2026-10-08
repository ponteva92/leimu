/* Media queries shared by the Tailwind config and client code. This file
   has no imports and no "use client", so tailwind.config.ts can load it
   with a plain relative import. */

/** Where scroll stages pin: motion allowed, and a viewport wide and tall
    enough to hold a stage's copy beside its picture. Tailwind's `stage:`
    variant and `useStaged()` both read this one string, so the CSS layout
    and the scroll choreography always agree. Elsewhere chapters run in
    normal flow. */
export const STAGE_QUERY =
  "(prefers-reduced-motion: no-preference) and (min-width: 1024px) and (min-height: 720px), " +
  "(prefers-reduced-motion: no-preference) and (min-width: 1280px) and (min-height: 640px)";
