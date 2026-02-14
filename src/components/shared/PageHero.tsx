import { motion, useScroll, useTransform } from "framer-motion";
import { Button } from "@/components/ui/button";

interface PageHeroProps {
  eyebrow?: string;
  title: string;
  description?: string;

  // Primary CTA (modal open)
  primaryCtaText?: string;
  onPrimaryClick?: () => void;

  // Secondary CTA (standard link)
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
  // Parallax scroll motion: background moves slightly on scroll
  const { scrollY } = useScroll();
  const y = useTransform(scrollY, [0, 500], [0, 120]);

  return (
    <header className="relative w-full min-h-[70vh] md:min-h-[80vh] flex items-center justify-center text-center overflow-hidden">
      {/* PARALLAX BACKGROUND IMAGE */}
      {variant === "image" && backgroundImage && (
        <motion.div
          className="absolute inset-0 bg-cover bg-center will-change-transform"
          style={{
            backgroundImage: `url(${backgroundImage})`,
            y,
          }}
        />
      )}

      {/* CINEMATIC OVERLAY */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Top vignette for text contrast */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/85 via-black/55 to-black/30" />

        {/* Turquoise ambient bloom at bottom */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom,_rgba(54,224,198,0.22),_transparent_70%)] opacity-80" />

        {/* Soft brand colour wash */}
        <div className="absolute inset-0 bg-primary/10 mix-blend-soft-light" />
      </div>

      {/* TRUE BOTTOM FADE (NO BOX) */}
      <div className="absolute inset-0 pointer-events-none bg-gradient-to-b from-transparent via-transparent to-background/96" />

      {/* CONTENT */}
      <motion.div
        initial={{ opacity: 0, y: 25 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: "easeOut" }}
        className="relative z-10 mx-auto w-full max-w-[1280px] px-4 sm:px-6 lg:px-10 xl:px-16"
      >
        <div className="max-w-3xl mx-auto">
          {/* EYEBROW */}
          {eyebrow && (
            <p className="text-primary font-body tracking-widest uppercase mb-5 text-sm md:text-base">
              {eyebrow}
            </p>
          )}

          {/* TITLE WRAPPER WITH WIDE RADIAL GLOW */}
          <div className="relative flex justify-center">
            {/* This glow is much wider than the title itself */}
            <div
              className="
                absolute
                left-1/2 top-1/2
                -translate-x-1/2 -translate-y-1/2
                w-[260%] max-w-[1100px]
                h-[220%]
                -z-10
                bg-[radial-gradient(circle,_rgba(54,224,198,0.28)_0%,_transparent_70%)]
                blur-3xl
                opacity-80
                pointer-events-none
              "
            />

            <h1
              className="
                font-satisfy
                text-4xl sm:text-5xl md:text-6xl lg:text-7xl
                text-white
                leading-[1.13] md:leading-[1.18]
                mt-4 mb-10 md:mb-12
                drop-shadow-[0_0_40px_rgba(0,0,0,0.8)]
              "
            >
              {title}
            </h1>
          </div>

          {/* DESCRIPTION */}
          {description && (
            <p className="text-primary font-body text-base sm:text-lg md:text-xl leading-relaxed max-w-xl mx-auto mb-12">
              {description}
            </p>
          )}

          {/* CTA BUTTONS ROW */}
          {(primaryCtaText || secondaryCtaText) && (
            <div className="flex flex-wrap justify-center gap-4 mt-4">
              {/* PRIMARY CTA – soft glow + hover animation */}
              {primaryCtaText && onPrimaryClick && (
                <Button
                  size="lg"
                  className="
                    rounded-full px-8 py-3
                    bg-primary text-black
                    shadow-lg shadow-primary/40
                    hover:bg-primary/90
                    hover:shadow-[0_0_40px_rgba(54,224,198,0.75)]
                    transition-transform duration-200 ease-out
                    hover:scale-[1.06]
                  "
                  onClick={onPrimaryClick}
                >
                  {primaryCtaText}
                </Button>
              )}

              {/* SECONDARY CTA */}
              {secondaryCtaText && secondaryCtaHref && (
                <Button
                  asChild
                  size="lg"
                  variant="outline"
                  className="
                    rounded-full px-8 py-3
                    border-primary/60 text-primary
                    bg-black/40 hover:bg-primary/10
                    transition-transform duration-200 ease-out
                    hover:scale-[1.03]
                    hover:border-primary
                  "
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
