import { ReactNode } from "react";
import { motion } from "framer-motion";

interface SectionWrapperProps {
  children: ReactNode;
  className?: string;
  showDivider?: boolean;
}

export default function SectionWrapper({
  children,
  className = "",
  showDivider = false,
}: SectionWrapperProps) {
  return (
    <section className={`relative py-20 md:py-28 ${className}`}>
      {/* Top fade */}
      <div className="pointer-events-none absolute top-0 left-0 right-0 h-16 bg-gradient-to-b from-background to-transparent" />

      {/* Animated reveal */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.3 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        {children}
      </motion.div>

      {/* Bottom fade */}
      <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-background to-transparent" />

      {/* Section divider */}
      {showDivider && (
        <div className="mt-16 flex justify-center items-center w-full">
          <div className="flex-1 h-px bg-white/10" />
          <motion.div
            className="w-3 h-3 rounded-full bg-cyan-400 mx-4 shadow-[0_0_10px_#22d3ee]"
            animate={{ scale: [1, 1.4, 1], opacity: [0.7, 1, 0.7] }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
          <div className="flex-1 h-px bg-white/10" />
        </div>
      )}
    </section>
  );
}
