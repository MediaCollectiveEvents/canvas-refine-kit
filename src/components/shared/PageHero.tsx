import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface PageHeroProps {
  eyebrow: string;
  title: string;
  description: string;
  variant?: "primary" | "image" | "muted";
  backgroundImage?: string;
  className?: string;
  ctaText?: string;
  onCtaClick?: () => void;
}

const PageHero = ({
  eyebrow,
  title,
  description,
  variant = "primary",
  backgroundImage,
  className,
  ctaText,
  onCtaClick,
}: PageHeroProps) => {
  const baseClasses = "pt-40 pb-16 px-6 relative";

  const variantClasses = {
    primary: "bg-primary",
    image: "bg-cover bg-center min-h-[70vh] flex items-center justify-center",
    muted: "bg-muted",
  };

  const textColorClasses = {
    primary: {
      eyebrow: "text-[hsl(var(--icon-lime))]",
      title: "text-white",
      description: "text-white/80",
    },
    image: {
      eyebrow: "text-white/80",
      title: "text-white",
      description: "text-white/80",
    },
    muted: {
      eyebrow: "text-primary",
      title: "text-foreground",
      description: "text-muted-foreground",
    },
  };

  const colors = textColorClasses[variant];

  return (
    <section
      className={cn(baseClasses, variantClasses[variant], className)}
      style={variant === "image" && backgroundImage ? { backgroundImage: `url(${backgroundImage})` } : undefined}
    >
      {/* Overlay for image variant */}
      {variant === "image" && <div className="absolute inset-0 bg-black/60" />}

      <div className="container mx-auto max-w-6xl relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center"
        >
          <motion.p
            className={cn(
              "font-body text-sm uppercase tracking-[0.3em] mb-6",
              colors.eyebrow
            )}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            {eyebrow}
          </motion.p>

          <motion.h1
            className={cn("font-script text-6xl md:text-8xl mb-6", colors.title)}
            style={{ textShadow: "0 4px 12px rgba(0, 0, 0, 0.35)" }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            {title}
          </motion.h1>

          <motion.p
            className={cn(
              "font-body text-lg max-w-2xl mx-auto",
              colors.description
            )}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            {description}
          </motion.p>

          {ctaText && onCtaClick && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="mt-8"
            >
              <Button
                size="lg"
                className="rounded-full font-body uppercase tracking-wider text-sm bg-primary-foreground text-primary hover:bg-primary-foreground/90 px-8"
                onClick={onCtaClick}
              >
                {ctaText}
              </Button>
            </motion.div>
          )}
        </motion.div>
      </div>
    </section>
  );
};

export default PageHero;
