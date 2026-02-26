import { ReactNode } from "react";
import { motion } from "framer-motion";

type SectionVariant = "clean" | "tint" | "glow" | "glass";
type PaddingSize = "regular" | "lux";

interface SectionWrapperProps {
  children: ReactNode;
  className?: string;
  variant?: SectionVariant;
  noise?: boolean;
  grid?: boolean;
  padding?: PaddingSize;
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
    <section
      className={`relative overflow-hidden ${paddingClasses} ${className}`}
    >
      {/* -------------------------------------------------- */}
      {/* Variant Background Layers                          */}
      {/* -------------------------------------------------- */}

      {/* Glass variant */}
      {variant === "glass" && (
        <div
          className="
            absolute inset-0
            bg-gradient-to-b from-white/10 via-white/5 to-transparent
            backdrop-blur-xl
            border border-white/10
            rounded-3xl
          "
        />
      )}

      {/* Tint variant */}
      {variant === "tint" && (
        <div
          className="absolute inset-0 bg-white/[0.03] backdrop-blur-sm"
          aria-hidden="true"
        />
      )}

      {/* Glow variant */}
      {variant === "glow" && (
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-[15%] left-1/3 w-[48rem] h-[48rem] bg-primary/10 blur-[160px]" />
          <div className="absolute -bottom-[20%] right-1/4 w-[40rem] h-[40rem] bg-cyan-400/10 blur-[200px]" />
        </div>
      )}

      {/* -------------------------------------------------- */}
      {/* Optional Noise Layer                                */}
      {/* -------------------------------------------------- */}
      {noise && (
        <div
          className="absolute inset-0 opacity-[0.035] mix-blend-overlay pointer-events-none"
          style={{ backgroundImage: "url('/noise.png')" }}
        />
      )}

      {/* -------------------------------------------------- */}
      {/* Optional Grid Overlay                              */}
      {/* -------------------------------------------------- */}
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

      {/* -------------------------------------------------- */}
      {/* Top & Bottom Fades (Premium Depth)                */}
      {/* -------------------------------------------------- */}
      {withFades && (
        <>
          <div className="absolute top-0 inset-x-0 h-32 bg-gradient-to-b from-black/30 to-transparent pointer-events-none" />
          <div className="absolute bottom-0 inset-x-0 h-32 bg-gradient-to-t from-black/30 to-transparent pointer-events-none" />
        </>
      )}

      {/* -------------------------------------------------- */}
      {/* Content Container + Reveal Animation               */}
      {/* -------------------------------------------------- */}
      <motion.div
        initial={{ opacity: 0, y: 32 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.25 }}
        transition={{ duration: 0.7, ease: "easeOut" }}
        className="relative z-10"
      >
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8">
          {children}
        </div>
      </motion.div>
    </section>
  );
}
