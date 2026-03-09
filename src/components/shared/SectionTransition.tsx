// src/components/shared/SectionTransition.tsx

import React from "react";

interface SectionTransitionProps {
  /**
   * Colour at the TOP of the transition – usually the bottom colour of PageHero.
   * Can be any valid CSS colour: hex, rgb/rgba, hsl, etc.
   *
   * Example for your dark hero:
   *   "rgba(15,23,42,1)"  // tailwind slate-900-ish
   */
  from?: string;

  /**
   * Colour at the BOTTOM of the transition – usually the background
   * of the next section (e.g. AboutIntroSection, EventsSection).
   *
   * Example for your current light sections:
   *   "#ECEFF1" or "#F4F5F6"
   */
  to?: string;

  /**
   * Height of the transition in pixels.
   * 100–160px tends to look nice with your hero.
   */
  height?: number;
}

/**
 * SectionTransition
 *
 * A simple "bridge" gradient between the hero and the next section.
 * It renders a vertical gradient going from `from` → `to`.
 *
 * Usage (e.g. in HomepageRenderer):
 *
 *   <SectionTransition
 *     from="rgba(15,23,42,1)"   // bottom of hero
 *     to="#ECEFF1"              // background of first section
 *   />
 */
const SectionTransition: React.FC<SectionTransitionProps> = ({
  from = "rgba(15,23,42,1)", // default: your dark hero bottom
  to = "#ECEFF1",            // default: your current light background
  height = 140,
}) => {
  return (
    <div
      aria-hidden="true"
      className="w-full pointer-events-none"
      style={{
        height: `${height}px`,
        background: `
          linear-gradient(
            to bottom,
            ${from} 0%,
            ${from} 35%,
            ${to} 100%
          )
        `,
      }}
    />
  );
};

export default SectionTransition;