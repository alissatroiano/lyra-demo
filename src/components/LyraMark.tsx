import React from "react";

/**
 * The Lyra asterism, drawn to its real shape: Vega at the top with the
 * small parallelogram of Beta, Gamma, Delta and Zeta hanging below it.
 * Vega is the brightest star in the constellation and one of the stars
 * navigators actually steer by, so it carries the accent and it is the
 * only element that moves.
 *
 * Sizes are set by the `className` on the root svg.
 */
export const LyraMark: React.FC<{ className?: string; showLines?: boolean }> = ({
  className = "w-24 h-24",
  showLines = true,
}) => (
  <svg
    viewBox="0 0 100 100"
    className={className}
    role="img"
    aria-label="The constellation Lyra"
    fill="none"
  >
    {showLines && (
      <g
        stroke="currentColor"
        strokeWidth="1"
        strokeLinecap="round"
        className="text-teal-brand/35"
      >
        {/* Vega down to the parallelogram */}
        <path d="M52 18 L38 42" />
        {/* the parallelogram: Zeta - Gamma - Beta - Delta - Zeta */}
        <path d="M38 42 L66 37 L74 66 L46 72 Z" />
        {/* the short spur to Epsilon, the double-double */}
        <path d="M52 18 L70 22" />
      </g>
    )}

    {/* Vega — first magnitude, the anchor */}
    <g className="animate-twinkle">
      <circle cx="52" cy="18" r="7" className="fill-teal-brand/20" />
      <circle cx="52" cy="18" r="3.6" className="fill-teal-brand" />
    </g>

    {/* Epsilon */}
    <circle cx="70" cy="22" r="1.7" className="fill-gold-brand" />

    {/* the parallelogram stars, at their rough relative magnitudes */}
    <circle cx="38" cy="42" r="2.4" className="fill-gold-brand" />
    <circle cx="66" cy="37" r="2" className="fill-gold-brand/90" />
    <circle cx="74" cy="66" r="2.2" className="fill-gold-brand/90" />
    <circle cx="46" cy="72" r="1.9" className="fill-gold-brand/80" />
  </svg>
);

export default LyraMark;
