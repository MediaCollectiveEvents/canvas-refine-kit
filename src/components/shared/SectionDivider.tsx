import React from "react";

type DividerVariant = "hairline" | "muted" | "postHero";

interface SectionDividerProps {
  variant?: DividerVariant;
  className?: string;
}

/**
 * Minimal section divider that avoids adding visible "bands".
 * - “hairline”: 1px gradient line; no padding; has -mt-px to kiss previous block.
 * - “muted”: 1px line with a touch more contrast (use sparingly).
 * - “postHero”: a short vertical gradient band to transition out of a hero (not for normal sections).
 */
export default function SectionDivider({
  variant = "hairline",
  className = "",
}: SectionDividerProps) {
  if (variant === "postHero") {
    return (
      <div
        className={[
          "relative h-16 overflow-hidden",
          // gentle vertical fade out of a hero
          "bg-gradient-to-b from-white/[0.06] via-white/[0.02] to-transparent",
          className,
        ].join(" ")}
        aria-hidden="true"
      >
        {/* hairline at the end so it still reads crisp */}
        <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-white/15 to-transparent" />
      </div>
    );
  }

  // common 1px lines (no padding, no extra height)
  const lineBase = "h-px bg-gradient-to-r from-transparent to-transparent";
  const lineClass =
    variant === "muted"
      ? `${lineBase} via-white/18`
      : `${lineBase} via-white/12`; // hairline (default)

  return (
    <div
      className={[
        // pull the line up by 1px to avoid hairline gaps caused by adjacent borders/fades
        "relative -mt-px",
        className,
      ].join(" ")}
      aria-hidden="true"
    >
      <div className={lineClass} />
    </div>
  );
}
