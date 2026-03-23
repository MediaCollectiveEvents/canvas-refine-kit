import type { FC } from "react";

interface SeedlingMotifProps {
  className?: string;
}

const SeedlingMotif: FC<SeedlingMotifProps> = ({ className = "" }) => {
  return (
    <svg
      viewBox="0 0 948 631.5"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <path
        fill="none"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
        d="
          PASTE YOUR FULL PATH *HERE*
        "
      />
    </svg>
  );
};

export default SeedlingMotif;
