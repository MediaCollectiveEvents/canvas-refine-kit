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

  /**
   * Controls overlay intensity; 0=off, 1=heaviest.
   * Suggested values: 0 | 0.25 | 0.5 | 0.75 | 1
   * Default is 0.75 (for dark theme).
   */
  overlayStrength?: 0 | 0.25 | 0.5 | 0.75 | 1;

  /**
   * Visual theme for the hero:
   * - "dark": darkened bg, light text (existing look)
   * - "light": light bg, dark text
   */
  theme?: "dark" | "light";
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
  overlayStrength = 0.75,
  theme = "dark",
}: PageHeroProps) {
  // Parallax motion for background image
  const { scrollY } = useScroll();
  const y = useTransform(scrollY, [0, 500], [0, 140]);

  const isLight = theme === "light";

  // ---- Overlay recipes (dark vs light) ----
  const s = overlayStrength;

  // Dark theme overlays (existing behavior, driven by s)
  const darkVignetteClass =
    s >= 0.9
      ? "from-black/80 via-black/60"
      : s >= 0.75
        ? "from-black/60 via-black/40"
        : s >= 0.5
          ? "from-black/45 via-black/30"
          : s >= 0.25
            ? "from-black/30 via-black/20"
            : "from-black/10 via-black/10";

  const darkBloomOpacity =
    s >= 0.9
      ? "opacity-80"
      : s >= 0.75
        ? "opacity-60"
        : s >= 0.5
          ? "opacity-50"
          : s >= 0.25
            ? "opacity-40"
            : "opacity-30";

  const darkBrandWashClass =
    s >= 0.9
      ? "bg-primary/5"
      : s >= 0.75
        ? "bg-primary/3"
        : s >= 0.5
          ? "bg-primary/2"
          : s >= 0.25
            ? "bg-primary/1"
            : "bg-transparent";

  // Light theme overlays (very subtle, no black vignette)
  const lightBloomOpacity = "opacity-40"; // subtle by default
  const lightBloomGradient =
    "radial-gradient(circle at 50% 45%, rgba(255,255,255,0.65) 0%, rgba(245,248,255,0.45) 30%, rgba(0,0,0,0) 70%)";
  const lightTintClass = "bg-white/40 mix-blend-lighten"; // gentle lift for darker photos

  // Typography by theme
  const titleClass = isLight
    ? "text-zinc-900 drop-shadow-[0_0_16px_rgba(255,255,255,0.5)]"
    : "text-white drop-shadow-[0_0_40px_rgba(0,0,0,0.8)]";

  const descClass = isLight ? "text-zinc-700" : "text-primary";
  const eyebrowClass = isLight ? "text-zinc-600" : "text-primary";

  // CTA styles (primary stays brand-forward; secondary adapts to theme)
  const secondaryButtonClass = isLight
    ? "border-zinc/20 text-zinc-900 bg-white/60 hover:bg-zinc-100"
    : "border-primary/60 text-primary bg-black/40 hover:bg-primary/10";

  // Keyframes for colour‑cycling glows (kept; softened automatically by light bg)
  const titleGlowKeyframes = [
    isLight
      ? "radial-gradient(circle, rgba(255,255,255,0.55) 0%, transparent 70%)"
      : "radial-gradient(circle, rgba(54,224,198,0.28) 0%, transparent 70%)",
    isLight
      ? "radial-gradient(circle, rgba(250,252,255,0.45) 0%, transparent 70%)"
      : "radial-gradient(circle, rgba(120,180,255,0.24) 0%, transparent 70%)",
    isLight
      ? "radial-gradient(circle, rgba(255,255,255,0.55) 0%, transparent 70%)"
      : "radial-gradient(circle, rgba(54,224,198,0.28) 0%, transparent 70%)",
  ];

  const ctaGlowKeyframes = [
    isLight
      ? "radial-gradient(circle, rgba(255,255,255,0.55) 0%, transparent 80%)"
      : "radial-gradient(circle, rgba(54,224,198,0.30) 0%, transparent 80%)",
    isLight
      ? "radial-gradient(circle, rgba(245,248,255,0.45) 0%, transparent 80%)"
      : "radial-gradient(circle, rgba(120,180,255,0.26) 0%, transparent 80%)",
    isLight
      ? "radial-gradient(circle, rgba(255,255,255,0.55) 0%, transparent 80%)"
      : "radial-gradient(circle, rgba(54,224,198,0.30) 0%, transparent 80%)",
  ];

  return (
    <header
      className={`relative w-full min-h-[70vh] md:min-h-[80vh] flex items-center justify-center text-center overflow-hidden ${
        isLight ? "bg-white" : ""
      }`}
    >
      {/* PARALLAX BACKGROUND IMAGE */}
      {variant === "image" && backgroundImage && (
        <motion.div
          className="absolute inset-0 bg-cover bg-center will-change-transform"
          style={{
            backgroundImage: `url(${backgroundImage})`,
            y,
            // Slight lift for light theme
            filter: isLight ? "brightness(1.06) contrast(1.02)" : undefined,
          }}
          aria-hidden="true"
        />
      )}

      {/* THEME OVERLAYS */}
      {isLight ? (
        // LIGHT THEME OVERLAYS
        <div
          className="absolute inset-0 pointer-events-none"
          aria-hidden="true"
        >
          {/* No black vignette in light mode */}
          {/* Gentle bright bloom */}
          <div
            className={`absolute inset-0 ${lightBloomOpacity} mix-blend-screen`}
            style={{ background: lightBloomGradient }}
          />
          {/* Very soft white tint to lift darker images */}
          <div className={`absolute inset-0 ${lightTintClass}`} />
        </div>
      ) : (
        // DARK THEME OVERLAYS (original behavior)
        <div
          className="absolute inset-0 pointer-events-none"
          aria-hidden="true"
        >
          {/* Tall soft vignette for contrast */}
          <div
            className={`absolute inset-0 bg-gradient-to-b ${darkVignetteClass} to-transparent`}
          />
          {/* Teal + cyan ambient bloom */}
          <div
            className={`absolute inset-0 ${darkBloomOpacity} mix-blend-screen`}
            style={{
              background:
                "radial-gradient(circle at center, rgba(54,224,198,0.14) 0%, rgba(120,180,255,0.08) 40%, rgba(0,0,0,0) 80%)",
            }}
          />
          {/* Subtle brand wash */}
          <div
            className={`absolute inset-0 ${darkBrandWashClass} mix-blend-soft-light`}
          />
        </div>
      )}

      {/* GRADIENT WIPE INTO PAGE BACKGROUND */}
      <div
        className="absolute inset-0 pointer-events-none bg-gradient-to-b from-transparent via-background/40 to-background"
        aria-hidden="true"
      />

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
            <p
              className={`${eyebrowClass} font-body tracking-widest uppercase mb-6 text-sm md:text-base`}
            >
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
              className={`
                absolute
                left-1/2 top-1/2
                -translate-x-1/2 -translate-y-1/2
                -inset-x-[40vw] -inset-y-[16vh]
                -z-10
                blur-[140px]
                ${isLight ? "opacity-70" : "opacity-90"}
                pointer-events-none
              `}
              aria-hidden="true"
            />

            {/* Subtle light sweep across title */}
            <motion.div
              animate={{ x: ["-150%", "150%"] }}
              transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
              className={`
                absolute top-0 h-full w-[50%]
                bg-gradient-to-r from-transparent ${isLight ? "via-black/5" : "via-white/10"} to-transparent
                blur-2xl
                pointer-events-none
              `}
              aria-hidden="true"
            />

            <h1
              className={`
                font-satisfy
                text-4xl sm:text-5xl md:text-6xl lg:text-7xl
                ${titleClass}
                leading-[1.13] md:leading-[1.18]
                mt-4 mb-10 md:mb-12
              `}
            >
              {title}
            </h1>
          </div>

          {/* Description */}
          {description && (
            <p
              className={`
                ${descClass}
                font-body text-base sm:text-lg md:text-xl
                leading-relaxed max-w-xl mx-auto mb-12
              `}
            >
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
                className={`
                  absolute
                  left-1/2 top-1/2
                  -translate-x-1/2 -translate-y-1/2
                  -inset-x-[30vw] -inset-y-12
                  -z-10
                  blur-[120px]
                  ${isLight ? "opacity-60" : "opacity-80"}
                  pointer-events-none
                `}
                aria-hidden="true"
              />

              {/* PRIMARY CTA */}
              {primaryCtaText && onPrimaryClick && (
                <Button
                  size="lg"
                  onClick={onPrimaryClick}
                  className={`
                    rounded-full px-8 py-3
                    bg-primary text-black
                    shadow-lg ${isLight ? "shadow-primary/30" : "shadow-primary/40"}
                    hover:bg-primary/90
                    hover:shadow-[0_0_40px_rgba(54,224,198,0.65)]
                    transition-transform duration-200 ease-out
                    hover:scale-[1.06]
                  `}
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
                  className={`
                    rounded-full px-8 py-3
                    ${secondaryButtonClass}
                    transition-transform duration-200 ease-out
                    hover:scale-[1.03]
                  `}
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
        aria-hidden="true"
      />
    </header>
  );
}
