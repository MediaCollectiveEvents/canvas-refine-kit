import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";

interface PageHeroProps {
  eyebrow?: string;
  title: string;
  description?: string;
  ctaText?: string;
  onCtaClick?: () => void;
  backgroundImage?: string;
  variant?: "image" | "solid";
}

export default function PageHero({
  eyebrow,
  title,
  description,
  ctaText,
  onCtaClick,
  backgroundImage,
  variant = "image",
}: PageHeroProps) {
  return (
    <header className="relative w-full min-h-[60vh] md:min-h-[70vh] flex items-center justify-center text-center overflow-hidden">
      {/* Background Image */}
      {variant === "image" && backgroundImage && (
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${backgroundImage})` }}
        />
      )}

      {/* Overlay */}
      <div className="absolute inset-0 bg-black/50" />

      {/* Content */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative z-10 max-w-3xl mx-auto px-6"
      >
        {eyebrow && (
          <p className="text-primary font-body tracking-widest uppercase mb-4 text-sm">
            {eyebrow}
          </p>
        )}

        <h1 className="font-satisfy text-5xl md:text-7xl text-white mb-6 leading-tight">
          {title}
        </h1>

        {description && (
          <p className="text-primary font-body text-lg md:text-xl max-w-xl mx-auto mb-8">
            {description}
          </p>
        )}

        {ctaText && onCtaClick && (
          <Button
            size="lg"
            className="rounded-full px-8 py-3 bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg"
            onClick={onCtaClick}
          >
            {ctaText}
          </Button>
        )}
      </motion.div>
    </header>
  );
}
