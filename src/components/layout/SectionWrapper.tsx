import { ReactNode } from "react";
import { motion } from "framer-motion";

type SectionVariant = "clean" | "tint" | "glow";

interface SectionWrapperProps {
  children: ReactNode;
  className?: string;

  /**
   * Visual mood for the section background:
   * - clean: neutral (default)
   * - tint: very subtle surface tint
   * - glow: soft ambient glows (primary/cyan blend)
   */
  variant?: SectionVariant;

  /**
   * Optional micro textures to add premium "surface" feel.
   * Keep these subtle (default off).
   */
  noise?: boolean; // ultra-soft noise layer
  grid?: boolean; // faint 32px micro-grid

  /**
   * Controls vertical rhythm. Apple-like spaciousness by default.
   * If you need tighter sections on mobile, override via className.
   */
  padding?: "regular" | "lux"; // lux = bigger paddings

  /**
   * If you need to disable the top/bottom fades for adjacency.
   */
  withFades?: boolean;
}

export default function SectionWrapper({
  children,
  className = "",
  variant = "clean",
  noise = false,
  grid = false,
  padding = "lux",
  withFades = true,
}: SectionWrapperProps) {
  const paddingClasses =
    padding === "lux" ? "py-28 md:py-36 lg:py-44" : "py-20 md:py-28";

  return (
    <section className={`relative ${paddingClasses} ${className}`}>
      {/* Variant backgrounds */}
      {variant === "tint" && (
        <div
          className="absolute inset-0 bg-white/[0.03] backdrop-blur-[1px]"
          aria-hidden="true"
        />
      )}

      {variant === "glow" && (
        <div
          className="absolute inset-0 pointer-events-none"
          aria-hidden="true"
        >
          {/* Top/left primary hue glow */}
          <div className="absolute -top-[10%] left-1/4 w-[42rem] h-[42rem] bg-primary/10 blur-[160px]" />
          {/* Bottom/right cyan complement */}
          <div className="absolute -bottom-[12%] right-1/5 w-[34rem] h-[34rem] bg-cyan-400/10 blur-[180px]" />
        </div>
      )}

      {/* Optional micro textures (very subtle) */}
      {noise && (
        <div
          className="absolute inset-0 opacity-[0.03] pointer-events-none"
          style={{ backgroundImage: "url('/noise.png')" }}
          aria-hidden="true"
        />
      )}

      {grid && (
        <div
          className="absolute inset-0 opacity-[0.06] pointer-events-none"
          style={{
            backgroundImage:
              "linear-gradient(to right, rgba(255,255,255,0.04) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.04) 1px, transparent 1px)",
            backgroundSize: "32px 32px",
          }}
          aria-hidden="true"
        />
      )}

      {/* Soft section fades (top/bottom) */}
      {withFades && (
        <>
          <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-background/60 to-transparent pointer-events-none" />
          <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background/60 to-transparent pointer-events-none" />
        </>
      )}

      {/* Content with gentle in-view reveal */}
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.25 }}
        transition={{ duration: 0.7, ease: "easeOut" }}
        className="relative z-10"
      >
        {children}
      </motion.div>
    </section>
  );
}
