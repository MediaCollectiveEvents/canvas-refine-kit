import { ReactNode } from "react";
import { motion } from "framer-motion";

/**
 * Backwards-compatible variant API:
 *
 * OLD (existing across your site):
 *   "clean" | "tint" | "glow" | "glass"
 *
 * NEW (unified design system):
 *   "light" | "dark" | "transparent"
 *
 * Both will now work.
 */
type SectionVariant =
  | "clean"
  | "tint"
  | "glow"
  | "glass"
  | "light"
  | "dark"
  | "transparent";

type PaddingSize = "regular" | "lux";

interface SectionWrapperProps {
  children: ReactNode;
  className?: string;
  variant?: SectionVariant;
  noise?: boolean;
  grid?: boolean;
  padding?: PaddingSize;
  withFades?: boolean;
  align?: "left" | "center";
}

export default function SectionWrapper({
  children,
  className = "",
  variant = "clean",     // we now SUPPORT "clean"
  noise = false,
  grid = false,
  padding = "lux",
  withFades = false,      // defaults OFF for clean layout
  align = "left",
}: SectionWrapperProps) {
  // Unified vertical spacing
  const paddingClasses =
    padding === "lux"
      ? "py-24 md:py-32"
      : "py-16 md:py-24";

  // Unified horizontal max-width container
  const containerClass = `
    max-w-6xl
    mx-auto
    px-6 md:px-10
    ${align === "center" ? "text-center" : "text-left"}
  `;

  // Backwards + new variant mapping
  const bgClass =
    variant === "light" || variant === "clean"
      ? "bg-[#ECEFF1]"
      : variant === "dark"
      ? "bg-[#0B1117]"
      : variant === "transparent"
      ? "bg-transparent"
      : variant === "tint"
      ? "bg-white/5"
      : variant === "glass"
      ? "backdrop-blur-xl bg-white/10 border border-white/10"
      : variant === "glow"
      ? "bg-[#0B1117]"
      : "bg-[#ECEFF1]";

  return (
    <section
      className={`
        relative
        overflow-visible
        ${paddingClasses}
        ${bgClass}
        ${className}
      `}
    >
      {/* Optional noise */}
      {noise && (
        <div
          className="absolute inset-0 opacity-[0.04] mix-blend-overlay pointer-events-none"
          style={{ backgroundImage: "url('/noise.png')" }}
        />
      )}

      {/* Optional grid overlay */}
      {grid && (
        <div
          className="absolute inset-0 opacity-[0.06] pointer-events-none"
          style={{
            backgroundImage:
              "linear-gradient(to right, rgba(255,255,255,0.04) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.04) 1px, transparent 1px)",
            backgroundSize: "32px 32px",
          }}
        />
      )}

      {/* Optional fades */}
      {withFades && (
        <>
          <div className="absolute top-0 inset-x-0 h-32 bg-gradient-to-b from-black/30 to-transparent pointer-events-none" />
          <div className="absolute bottom-0 inset-x-0 h-32 bg-gradient-to-t from-black/30 to-transparent pointer-events-none" />
        </>
      )}

      {/* Animated content */}
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.25 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="relative z-10"
      >
        <div className={containerClass}>{children}</div>
      </motion.div>
    </section>
  );
}