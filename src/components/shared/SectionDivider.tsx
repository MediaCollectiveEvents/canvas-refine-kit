import React from "react";

interface SectionDividerProps {
  className?: string;
}

export default function SectionDivider({
  className = "",
}: SectionDividerProps) {
  return (
    <div
      className={["relative h-[10px] -my-px z-10", className].join(" ")}
      aria-hidden="true"
    >
      <div className="absolute inset-x-0 top-0 h-[3px] bg-white/24" />
      <div className="absolute inset-x-0 top-[5px] h-[2px] bg-white/10" />
      <div className="absolute inset-x-0 top-[9px] h-px bg-[#36e0c6]" />
    </div>
  );
}