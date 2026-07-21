/**
 * D5: fixed-position noise-texture overlay at low opacity. Adds film-grain
 * depth to the flat-black background. Pure CSS with an inline SVG data URI
 * so there's no external asset load and no runtime cost after paint.
 *
 * Kept as a Server Component (no client-side behavior). Renders once in
 * root layout at z-50 so it sits above content but below any modal / tooltip
 * layers we might add later. pointer-events: none guarantees zero interaction
 * interference.
 */
const NOISE_SVG =
  "data:image/svg+xml;utf8," +
  encodeURIComponent(
    `<svg xmlns='http://www.w3.org/2000/svg' width='200' height='200'>` +
      `<filter id='n'>` +
      `<feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/>` +
      `<feColorMatrix values='0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 0.5 0'/>` +
      `</filter>` +
      `<rect width='100%' height='100%' filter='url(%23n)'/>` +
      `</svg>`,
  );

export function GrainOverlay() {
  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 z-50 opacity-[0.035] mix-blend-overlay"
      style={{
        backgroundImage: `url("${NOISE_SVG}")`,
        backgroundSize: "200px 200px",
      }}
    />
  );
}
