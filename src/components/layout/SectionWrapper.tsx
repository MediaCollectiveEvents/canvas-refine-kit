import { ReactNode } from "react";
import { motion } from "framer-motion";

interface SectionWrapperProps {
  children: ReactNode;
  className?: string;
}

export default function SectionWrapper({
  children,
  className = "",
}: SectionWrapperProps) {
  return (
    <section className={`relative py-20 md:py-28 ${className}`}>
      {/* Soft top fade */}
      <div className="absolute top-0 left-0 right-0 h-16 pointer-events-none bg-gradient-to-b from-background to-transparent" />

      {/* Content reveal */}
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.25 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        {children}
      </motion.div>

      {/* Soft bottom fade */}
      <div className="absolute bottom-0 left-0 right-0 h-16 pointer-events-none bg-gradient-to-t from-background to-transparent" />
    </section>
  );
}
