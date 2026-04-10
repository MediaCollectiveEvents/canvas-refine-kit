import React from "react";

interface SectionTransitionProps {
  from?: string;
  to?: string;
  height?: number;
}

const SectionTransition: React.FC<SectionTransitionProps> = ({
  from = "var(--background-dark)",
  to = "var(--background-light)",
  height = 88,
}) => {
  return (
    <div
      aria-hidden="true"
      className="relative w-full overflow-hidden pointer-events-none"
      style={{
        height: `${height}px`,
        background: `linear-gradient(to bottom, ${from} 0%, ${to} 100%)`,
      }}
    >
      <div
        className="absolute inset-0"
        style={{
          background: `repeating-linear-gradient(
            to bottom,
            rgba(255,255,255,0.08) 0px,
            rgba(255,255,255,0.08) 2px,
            transparent 2px,
            transparent 16px
          )`,
          opacity: 0.25,
        }}
      />

      <div
        className="absolute inset-0"
        style={{
          background: `linear-gradient(
            to bottom,
            rgba(255,255,255,0.10) 0%,
            rgba(255,255,255,0.04) 28%,
            rgba(255,255,255,0) 65%
          )`,
        }}
      />
    </div>
  );
};

export default SectionTransition;