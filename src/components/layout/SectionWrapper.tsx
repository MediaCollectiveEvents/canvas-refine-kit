import { ReactNode } from "react";
import { motion } from "framer-motion";
import { useSectionStyleDefaults } from "@/lib/SectionStyleProvider";

type SectionVariant = "clean" | "tint" | "glow";

interface SectionWrapperProps {
  children: ReactNode;
  className?: string;
  variant?: SectionVariant;
  noise?: boolean;
  grid?: boolean;
  padding?: "regular" | "lux";
  withFades?: boolean;
}

export default function SectionWrapper({
  children,
  className = "",
  variant,
  noise,
  grid,
  padding,
  withFades,
}: SectionWrapperProps) {
  const defaults = useSectionStyleDefaults();

  const effVariant: SectionVariant =
    (variant as SectionVariant) ??
    (defaults.styleWrapper.variant as SectionVariant) ??
    "clean";

  const effNoise = noise ?? defaults.styleWrapper.noise ?? false;
  const effGrid = grid ?? defaults.styleWrapper.grid ?? false;
  const effPadding =
    padding ?? (defaults.styleWrapper.padding as "regular" | "lux") ?? "lux";
  const effFades = withFades ?? defaults.styleWrapper.withFades ?? true;

  const paddingClasses =
    effPadding === "lux" ? "py-28 md:py-36 lg:py-44" : "py-20 md:py-28";

  return (
    <section className={`relative ${paddingClasses} ${className}`}>
      {/* Variant backgrounds */}
      {effVariant === "tint" && (
        <div
          className="absolute inset-0 bg-white/[0.03] backdrop-blur-[1px]"
          aria-hidden="true"
        />
      )}

      {effVariant === "glow" && (
        <div
          className="absolute inset-0 pointer-events-none"
          aria-hidden="true"
        >
          <div className="absolute -top-[10%] left-1/4 w-[42rem] h-[42rem] bg-primary/10 blur-[160px]" />
          <div className="absolute -bottom-[12%] right-1/5 w-[34rem] h-[34rem] bg-cyan-400/10 blur-[180px]" />
        </div>
      )}

      {/* Optional micro textures */}
      {effNoise && (
        <div
          className="absolute inset-0 opacity-[0.03] pointer-events-none"
          style={{ backgroundImage: "url('/noise.png')" }}
          aria-hidden="true"
        />
      )}

      {effGrid && (
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

      {/* Soft fades */}
      {effFades && (
        <>
          <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-background/60 to-transparent pointer-events-none" />
          <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background/60 to-transparent pointer-events-none" />
        </>
      )}

      {/* Content reveal + inner max-width container */}
      <motion.div
        initial={{ opacity: 0, y: 24 }}
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
