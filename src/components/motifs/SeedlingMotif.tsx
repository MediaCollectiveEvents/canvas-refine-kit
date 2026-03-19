import type { FC } from "react";

interface SeedlingMotifProps {
  className?: string; // control size/colour with Tailwind
}

/**
 * Teal, watermark-style seedling motif.
 * Uses currentColor so colour/opacity are controlled from the parent.
 */
const SeedlingMotif: FC<SeedlingMotifProps> = ({ className = "" }) => {
  return (
    <svg
      viewBox="0 0 400 220"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      stroke="currentColor"
      strokeWidth={3}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
      focusable="false"
    >
      {/* Ground line */}
      <path d="M5 190 C 80 150, 200 230, 395 185" />

      {/* Seed */}
      <path d="M200 185 C 175 175, 155 155, 150 135 C 145 120, 150 105, 170 100 C 195 95, 210 110, 212 130 C 214 150, 210 165, 200 185 Z" />

      {/* Stem */}
      <path d="M205 145 C 220 120, 230 100, 235 80 C 240 60, 245 40, 242 25" />

      {/* Lower leaf */}
      <path d="M198 130 C 175 105, 155 95, 135 96 C 120 97, 110 106, 108 118 C 106 131, 115 143, 130 148 C 150 155, 172 148, 190 138" />

      {/* Upper leaf */}
      <path d="M236 93 C 252 78, 268 70, 284 69 C 298 68, 309 73, 314 83 C 320 95, 316 109, 304 118 C 292 127, 275 130, 260 127 C 248 125, 240 120, 234 113" />
    </svg>
  );
};

export default SeedlingMotif;