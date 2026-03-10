// src/components/layout/SectionWrapper.tsx
import { ReactNode, useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";

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
  variant = "clean",
  noise = false,
  grid = false,
  padding = "lux",
  withFades = false,
  align = "left",
}: SectionWrapperProps) {

  const ref = useRef(null);

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start 85%", "start 40%"], // triggers later, more visible
  });

  // C3 transition: 30px upwards + fade
  const y = useTransform(scrollYProgress, [0, 1], [30, 0]);
  const opacity = useTransform(scrollYProgress, [0, 1], [0.7, 1]);

  const paddingClasses =
    padding === "lux" ? "py-24 md:py-32" : "py-16 md:py-24";

  const containerClass = `
    max-w-6xl mx-auto
    px-6 md:px-10
    ${align === "center" ? "text-center" : "text-left"}
  `;

  const bgClass =
    variant === "light" || variant === "clean"
      ? "bg-[#f7f7f7]"
      : variant === "dark"
      ? "bg-[#0b111a]"
      : "bg-transparent";

  return (
    <section
      ref={ref}
      className={`
        relative overflow-visible
        ${paddingClasses}
        ${bgClass}
        ${className}
      `}
    >
      <motion.div style={{ y, opacity }} className="relative z-10">
        <div className={containerClass}>{children}</div>
      </motion.div>
    </section>
  );
}