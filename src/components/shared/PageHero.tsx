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
  // Parallax motion for background image
  const { scrollY } = useScroll();
  const y = useTransform(scrollY, [0, 500], [0, 140]);

  // Keyframes for colour‑cycling glows (teal + cyan tones)
  const titleGlowKeyframes = [
    "radial-gradient(circle, rgba(54,224,198,0.28) 0%, transparent 70%)",
    "radial-gradient(circle, rgba(120,180,255,0.24) 0%, transparent 70%)",
    "radial-gradient(circle, rgba(54,224,198,0.28) 0%, transparent 70%)",
  ];

  const ctaGlowKeyframes = [
    "radial-gradient(circle, rgba(54,224,198,0.30) 0%, transparent 80%)",
    "radial-gradient(circle, rgba(120,180,255,0.26) 0%, transparent 80%)",
    "radial-gradient(circle, rgba(54,224,198,0.30) 0%, transparent 80%)",
  ];

  return (
    <header className="relative w-full min-h-[70vh] md:min-h-[80vh] flex items-center justify-center text-center overflow-hidden">
      {/* PARALLAX BACKGROUND IMAGE */}
      {variant === "image" && backgroundImage && (
        <motion.div
          className="absolute inset-0 bg-cover bg-center will-change-transform"
          style={{ backgroundImage: `url(${backgroundImage})`, y }}
        />
      )}

      {/* CINEMATIC COLOUR OVERLAY */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Tall soft vignette for contrast */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/90 via-black/70 to-transparent" />
        {/* Teal + cyan ambient bloom */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(54,224,198,0.18)_0%,_rgba(120,180,255,0.12)_40%,_transparent_80%)] opacity-80 mix-blend-screen" />
        {/* Subtle brand wash */}
        <div className="absolute inset-0 bg-primary/5 mix-blend-soft-light" />
      </div>

      {/* FULL HEIGHT BOTTOM GRADIENT WIPE INTO PAGE BACKGROUND */}
      <div className="absolute inset-0 pointer-events-none bg-gradient-to-b from-transparent via-background/40 to-background" />

      {/* CONTENT */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: "easeOut" }}
        className="relative z-10 mx-auto w-full max-w-[1280px] px-4 sm:px-6 lg:px-10 xl:px-16"
      >
        <div className="max-w-3xl mx-auto">
          {/* Eyebrow */}
          {eyebrow && (
            <p className="text-primary font-body tracking-widest uppercase mb-6 text-sm md:text-base">
              {eyebrow}
            </p>
          )}

          {/* TITLE + ANIMATED GLOW + LIGHT SWEEP */}
          <div className="relative flex justify-center">
            {/* Animated glow behind title */}
            <motion.div
              animate={{ background: titleGlowKeyframes }}
              transition={{
                duration: 8,
                repeat: Infinity,
                repeatType: "mirror",
              }}
              className="
                absolute
                left-1/2 top-1/2
                -translate-x-1/2 -translate-y-1/2
                -inset-x-[40vw] -inset-y-[16vh]
                -z-10
                blur-[140px]
                opacity-90
                pointer-events-none
              "
            />

            {/* Subtle light sweep across title */}
            <motion.div
              animate={{ x: ["-150%", "150%"] }}
              transition={{
                duration: 7,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              className="
                absolute top-0 h-full w-[50%]
                bg-gradient-to-r from-transparent via-white/10 to-transparent
                blur-2xl
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

          {/* Description */}
          {description && (
            <p className="text-primary font-body text-base sm:text-lg md:text-xl leading-relaxed max-w-xl mx-auto mb-12">
              {description}
            </p>
          )}

          {/* CTA BUTTONS + ANIMATED GLOW POOL */}
          {(primaryCtaText || secondaryCtaText) && (
            <div className="relative flex flex-wrap justify-center gap-4 mt-4">
              {/* Animated glow pool beneath CTAs */}
              <motion.div
                animate={{ background: ctaGlowKeyframes }}
                transition={{
                  duration: 10,
                  repeat: Infinity,
                  repeatType: "mirror",
                }}
                className="
                  absolute
                  left-1/2 top-1/2
                  -translate-x-1/2 -translate-y-1/2
                  -inset-x-[30vw] -inset-y-12
                  -z-10
                  blur-[120px]
                  opacity-80
                  pointer-events-none
                "
              />

              {/* PRIMARY CTA */}
              {primaryCtaText && onPrimaryClick && (
                <Button
                  size="lg"
                  onClick={onPrimaryClick}
                  className="
                    rounded-full px-8 py-3
                    bg-primary text-black
                    shadow-lg shadow-primary/40
                    hover:bg-primary/90
                    hover:shadow-[0_0_40px_rgba(54,224,198,0.75)]
                    transition-transform duration-200 ease-out
                    hover:scale-[1.06]
                  "
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
                  "
                >
                  <a href={secondaryCtaHref}>{secondaryCtaText}</a>
                </Button>
              )}
            </div>
          )}
        </div>
      </motion.div>

      {/* CYAN / TEAL NEON LINE AT BOTTOM */}
      <div
        className="
          absolute bottom-0 left-0 right-0
          h-[3px]
          bg-gradient-to-r from-primary via-cyan-400 to-primary
        "
      />
    </header>
  );
}
