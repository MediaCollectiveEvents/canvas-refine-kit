import { motion } from "framer-motion";

export function ScrollIndicator({ onClick }: { onClick: () => void }) {
  return (
    <motion.button
      onClick={onClick}
      className="
        absolute bottom-10 left-1/2 -translate-x-1/2
        flex flex-col items-center
        text-cyan-400
        hover:text-white transition
      "
      animate={{ y: [0, 8, 0], opacity: [0.8, 1, 0.8] }}
      transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
    >
      <div
        className="
          w-7 h-7 rounded-full border border-cyan-400/40
          flex items-center justify-center
          shadow-[0_0_8px_rgba(34,211,238,0.5)]
        "
      >
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
        >
          <path d="M6 9l6 6 6-6" />
        </svg>
      </div>
      <span className="mt-2 text-xs tracking-wider text-white/60">Scroll</span>
    </motion.button>
  );
}
