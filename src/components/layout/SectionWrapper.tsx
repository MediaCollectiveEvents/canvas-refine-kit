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
    offset: ["start 85%", "start 40%"],
  });

  const y = useTransform(scrollYProgress, [0, 1], [24, 0]);
  const opacity = useTransform(scrollYProgress, [0, 1], [0.78, 1]);

  const paddingClasses =
    padding === "lux"
      ? "site-section"
      : "site-gutter py-12 md:py-16";

  const containerClass = `
    site-container
    ${align === "center" ? "text-center" : "text-left"}
  `;

  const bgClass =
    variant === "light" || variant === "clean"
      ? "bg-[#f7f7f7]"
      : variant === "dark"
        ? "site-surface-dark"
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