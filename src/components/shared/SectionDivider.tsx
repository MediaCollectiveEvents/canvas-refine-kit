import React from "react";

interface SectionDividerProps {
  className?: string;
}

export default function SectionDivider({
  className = "",
}: SectionDividerProps) {
  return (
    <div
      className={["relative h-[6px] z-10", className].join(" ")}
      aria-hidden="true"
    >
      <div className="absolute inset-x-0 top-0 h-[3px] bg-white/22" />
      <div className="absolute inset-x-0 top-[3px] h-[2px] bg-white/10" />
      <div className="absolute inset-x-0 top-[5px] h-px bg-[#36e0c6]/35" />
    </div>
  );
}