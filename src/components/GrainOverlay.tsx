/**
 * GrainOverlay — a single, whole-site organic grain layer.
 *
 * Rendered once at the root of <body>. It floats above all content
 * (pointer-events:none, mix-blend-overlay, whisper-low opacity) so a
 * seamless paper/linen tooth unifies the entire site. All styling lives
 * in `.grain-overlay` (globals.css) to keep the SVG data-URI escaping sane.
 */
export function GrainOverlay() {
  return <div className="grain-overlay" aria-hidden="true" />;
}
