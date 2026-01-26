import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface SectionHeaderProps {
  eyebrow?: string;
  title: string;
  accentWord: string;
  description?: string;
  className?: string;
}

const SectionHeader = ({
  eyebrow,
  title,
  accentWord,
  description,
  className,
}: SectionHeaderProps) => {
  // Split title around the accent word for styling
  const parts = title.split(accentWord);
  
  return (
    <motion.div
      className={cn("text-center mb-16", className)}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6 }}
    >
      {eyebrow && (
        <p className="text-primary font-body text-sm uppercase tracking-[0.3em] mb-4">
          {eyebrow}
        </p>
      )}
      
      <h2 className="font-display text-4xl md:text-5xl text-foreground mb-6 leading-tight">
        {parts[0]}
        <span className="text-primary italic">{accentWord}</span>
        {parts[1] || ""}
      </h2>
      
      {description && (
        <p className="text-muted-foreground font-body text-lg max-w-2xl mx-auto">
          {description}
        </p>
      )}
    </motion.div>
  );
};

export default SectionHeader;
