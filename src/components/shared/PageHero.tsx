import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";

interface PageHeroProps {
  eyebrow?: string;
  title: string;
  description?: string;

  primaryCtaText?: string;
  onPrimaryClick?: () => void;

  secondaryCtaText?: string;
  secondaryCtaHref?: string;

  backgroundImage?: string;
  variant?: "image" | "solid";
}

export default function PageHero({
  eyebrow,
  title,
  description,
  primaryCtaText,
  onPrimaryClick,
  secondaryCtaText,
  secondaryCtaHref,
  backgroundImage,
  variant = "image",
}: PageHeroProps) {
  return (
    <header className="relative w-full min-h-[70vh] md:min-h-[80vh] flex items-center justify-center text-center overflow-hidden">
      {/* Background Image */}
      {variant === "image" && backgroundImage && (
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${backgroundImage})` }}
        />
      )}

      {/* Dark overlay */}
      <div className="absolute inset-0 bg-black/50" />

      {/* Content */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative z-10 mx-auto w-full max-w-[1280px] px-4 sm:px-6 lg:px-10 xl:px-16"
      >
        <div className="max-w-3xl mx-auto">
          {eyebrow && (
            <p className="text-primary font-body tracking-widest uppercase mb-4 text-sm md:text-base">
              {eyebrow}
            </p>
          )}

          {/* Tighter mobile line-height, looser desktop; slightly smaller desktop size for harmony */}
          <h1 className="font-satisfy text-4xl sm:text-5xl md:text-6xl lg:text-7xl text-white mb-6 leading-[1.15] md:leading-[1.2]">
            {title}
          </h1>

          {description && (
            <p className="text-primary font-body text-base sm:text-lg md:text-xl max-w-xl mx-auto mb-10 leading-relaxed">
              {description}
            </p>
          )}

          {/* CTA Buttons Row */}
          {(primaryCtaText || secondaryCtaText) && (
            <div className="flex flex-wrap justify-center gap-4 mt-2">
              {primaryCtaText && onPrimaryClick && (
                <Button
                  size="lg"
                  className="rounded-full px-8 py-3 bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg"
                  onClick={onPrimaryClick}
                >
                  {primaryCtaText}
                </Button>
              )}

              {secondaryCtaText && secondaryCtaHref && (
                <Button
                  asChild
                  size="lg"
                  variant="outline"
                  className="rounded-full px-8 py-3 border-primary/60 text-primary hover:bg-primary/10 bg-black/40"
                >
                  <a href={secondaryCtaHref}>{secondaryCtaText}</a>
                </Button>
              )}
            </div>
          )}
        </div>
      </motion.div>
    </header>
  );
}
