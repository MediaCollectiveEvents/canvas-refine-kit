import { motion } from "framer-motion";

export function ScrollIndicator({ onClick }: { onClick?: () => void }) {
  const Wrapper: React.ElementType = onClick ? motion.button : motion.div;

  return (
    <Wrapper
      onClick={onClick}
      type={onClick ? "button" : undefined}
      className={`
        absolute bottom-4 left-1/2 -translate-x-1/2
        hidden md:flex
        flex-col items-center
        ${onClick ? "cursor-pointer" : "pointer-events-none"}
      `}
      aria-hidden={!onClick}
    >
      <div className="relative flex flex-col items-center gap-[3px]">

        {/* Top chevron */}
        <motion.div
          initial={{ opacity: 0.3, y: 0 }}
          animate={{ opacity: [0.3, 1, 0.3], y: [0, 5, 0] }}
          transition={{ duration: 2.2, repeat: Infinity, delay: 0 }}
        >
          <Chevron />
        </motion.div>

        {/* Middle chevron */}
        <motion.div
          initial={{ opacity: 0.25, y: 0 }}
          animate={{ opacity: [0.25, 0.85, 0.25], y: [0, 5, 0] }}
          transition={{ duration: 2.2, repeat: Infinity, delay: 0.25 }}
        >
          <Chevron dimmed />
        </motion.div>

        {/* Bottom chevron */}
        <motion.div
          initial={{ opacity: 0.2, y: 0 }}
          animate={{ opacity: [0.2, 0.6, 0.2], y: [0, 5, 0] }}
          transition={{ duration: 2.2, repeat: Infinity, delay: 0.5 }}
        >
          <Chevron dimmed moreDim />
        </motion.div>

      </div>
    </Wrapper>
  );
}

/* Chevron glyph */
function Chevron({
  dimmed,
  moreDim,
}: {
  dimmed?: boolean;
  moreDim?: boolean;
}) {
  const base = "rgb(56, 232, 255)"; // cyan
  const opacity = moreDim ? 0.35 : dimmed ? 0.55 : 0.9;

  return (
    <svg
      width="30"
      height="18"
      viewBox="0 0 24 14"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="drop-shadow-[0_0_6px_rgba(56,232,255,0.85)]"
    >
      <path
        d="M2 2L12 12L22 2"
        stroke={base}
        strokeWidth={3}
        strokeLinecap="round"
        strokeLinejoin="round"
        style={{ opacity }}
      />
    </svg>
  );
}