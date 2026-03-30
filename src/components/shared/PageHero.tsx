import { motion, useScroll, useTransform, MotionValue } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ScrollIndicator } from "@/components/shared/ScrollIndicator";
import settings from "@/content/settings.json";

type Theme = "dark" | "light";
type Variant = "image" | "solid";
type MobileCropMode = "cover" | "contain";
type ImagePosition = "top" | "center" | "bottom";

interface PageHeroProps {
  eyebrow?: string;
  title: string;
  description?: string;

  primaryCtaText?: string;
  primaryCtaHref?: string;
  onPrimaryClick?: () => void;

  backgroundImage?: string;
  image?: string;
  imageKey?: string;

  variant?: Variant;
  overlayStrength?: number;
  theme?: Theme;

  mobileCrop?: MobileCropMode;
  imagePosition?: ImagePosition;
  imageOffset?: number;

  // Per-page font colours (optional, overrides heroDefaults)
  eyebrowColor?: string;
  titleColor?: string;
  textColor?: string;

  // ⭐ Per-page glow controls (optional, override heroDefaults)
  backdropStrength?: number;
  backdropColor?: string; // "r,g,b"
  backdropSize?: number;
}

function inDecapPreviewIframe(): boolean {
  if (typeof document !== "undefined") {
    return (
      document.body?.classList?.contains("nc-app-iframe-root") ||
      typeof (window as any).CMS !== "undefined"
    );
  }
  return false;
}

export default function PageHero(props: PageHeroProps) {
  const isPreview = inDecapPreviewIframe();

  // Load universal defaults from settings.json
  const heroDefaults = (settings as any).heroDefaults || {};
  const palette = (settings as any).palette || {};

  const {
    eyebrow,
    title,
    description,
    primaryCtaText,
    primaryCtaHref,
    onPrimaryClick,
    backgroundImage,
    image,
    imageKey, // kept for future use if needed
    variant = "image",
    overlayStrength = heroDefaults.overlayStrength ?? 0.5,
    theme = "dark",
    mobileCrop = "cover",
    imagePosition = "center",
    imageOffset = 0,

    // Resolve per-page or universal hero colours
    eyebrowColor = heroDefaults.eyebrowColor ?? "white",
    titleColor = heroDefaults.titleColor ?? "white",
    textColor = heroDefaults.textColor ?? "white",

    // Per-page glow overrides (may be undefined)
    backdropStrength,
    backdropColor,
    backdropSize,
  } = props;

  // -----------------------------
  // RESOLVE GLOW VALUES
  // -----------------------------
  // If a per-page value is provided, use it.
  // Otherwise fall back to Site Settings → Hero Defaults.
  const effectiveBackdropStrength =
    backdropStrength ?? heroDefaults.backdropStrength ?? 0.6;

  const effectiveBackdropColor =
    backdropColor ?? heroDefaults.backdropColor ?? "15,23,42";

  const effectiveBackdropSize =
    backdropSize ?? heroDefaults.backdropSize ?? 1;

  // Clamp sensitive ranges
  const clampedOverlay = Math.min(Math.max(overlayStrength, 0), 1);
  const clampedBackdrop = Math.min(Math.max(effectiveBackdropStrength, 0), 1);

  // Boost glow so it has more visible range
  const boostedBackdrop = Math.min(clampedBackdrop * 2.5, 1);

  let y: MotionValue<number> | 0 = 0;
  if (!isPreview) {
    const { scrollY } = useScroll();
    const baseY = useTransform(scrollY, [0, 500], [0, 140]);
    y = useTransform(baseY, (value) => value + imageOffset);
  }

  // -----------------------------
  // BACKGROUND IMAGE RESOLUTION
  // -----------------------------
  // Priority:
  // 1. Explicit `image` from CMS (hero.image in JSON)
  // 2. Optional `backgroundImage` override from callers
  const resolvedBackgroundImage = image || backgroundImage || undefined;

  const positionClass =
    imagePosition === "top"
      ? "bg-top"
      : imagePosition === "bottom"
      ? "bg-bottom"
      : "bg-center";

  const backgroundClasses =
    mobileCrop === "contain"
      ? `bg-contain bg-no-repeat ${positionClass} sm:bg-cover`
      : `bg-cover ${positionClass}`;

  const hasClickCta = !!(primaryCtaText && onPrimaryClick);
  const hasLinkCta = !!(primaryCtaText && primaryCtaHref);

  // ------- FONT COLOUR RESOLVER -------
  function resolveFontClass(color: string): string {
    switch (color) {
      case "white":
        return "text-white";
      case "black":
        return "text-black";
      case "teal":
        // Brand primary: #36e0c6
        return "text-[#36e0c6]";
      case "cyan":
        return "text-[#22d3ee]";
      case "darkgrey":
        return "text-slate-300";
      case "primary":
        // Same as teal: brand primary
        return "text-[#36e0c6]";
      default:
        if (color.startsWith("#")) return `text-[${color}]`;
        return "text-white";
    }
  }

  const eyebrowClass = resolveFontClass(eyebrowColor);
  const titleClass = resolveFontClass(titleColor);
  const descriptionClass = resolveFontClass(textColor);

  return (
    <header
      className={`
        relative w-full
        min-h-[520px] sm:min-h-[640px] lg:min-h-[700px]
        flex items-center justify-center
        overflow-hidden
        bg-[var(--background-dark)]
      `}
    >
      {/* BACKGROUND IMAGE */}
      {variant === "image" && resolvedBackgroundImage && (
        <motion.div
          className={`absolute inset-0 will-change-transform ${backgroundClasses}`}
          style={{
            backgroundImage: `url(${resolvedBackgroundImage})`,
            ...(isPreview ? {} : { y }),
          }}
          aria-hidden="true"
        />
      )}

      {/* UNIVERSAL DARK OVERLAY + FLARES + LIGHTENING */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Dark vignette behind text */}
        <div
          className="absolute inset-0"
          style={{
            background: `
              radial-gradient(
                circle at 50% 40%,
                rgba(15,23,42,0.9) 0%,
                rgba(15,23,42,0.65) 45%,
                rgba(15,23,42,0.25) 75%,
                rgba(15,23,42,0) 100%
              )
            `,
          }}
        />

        {/* Warm flares (static highlight) */}
        <div
          className="absolute inset-0 opacity-[0.24]"
          style={{
            background: `
              radial-gradient(circle at 8% 72%, rgba(255,196,160,0.6), transparent 40%),
              radial-gradient(circle at 90% 60%, rgba(255,160,215,0.55), transparent 42%),
              radial-gradient(circle at 15% 20%, rgba(255,190,160,0.42), transparent 48%)
            `,
            mixBlendMode: "screen",
          }}
        />

        {/* LIGHTENING LAYER – this is the "sheen" you control with overlayStrength */}
        {clampedOverlay > 0 && (
          <div
            className="absolute inset-0 pointer-events-none mix-blend-screen"
            style={{
              backgroundColor: `rgba(255,255,255,${clampedOverlay})`,
            }}
          />
        )}
      </div>

      {/* ELLIPTICAL GLOW – BOOSTED + COLOUR-CONTROLLED */}
      <div
        aria-hidden="true"
        className="absolute left-1/2 top-[50%] -translate-x-1/2 pointer-events-none"
        style={{
          width: `${86 * effectiveBackdropSize}vw`,
          maxWidth: `${1200 * effectiveBackdropSize}px`,
          height: `${260 * effectiveBackdropSize}px`,
          background: `
            radial-gradient(
              ellipse at center,
              rgba(${effectiveBackdropColor},0) 0%,
              rgba(${effectiveBackdropColor},${boostedBackdrop}) 30%,
              rgba(${effectiveBackdropColor},${Math.min(
                boostedBackdrop * 0.7,
                1
              )}) 55%,
              rgba(${effectiveBackdropColor},${Math.min(
                boostedBackdrop * 0.4,
                1
              )}) 75%,
              rgba(${effectiveBackdropColor},0) 100%
            )
          `,
          filter: "blur(40px)",
        }}
      />

      {/* HERO CONTENT */}
      <motion.div
        initial={{ opacity: 0, y: 32 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: "easeOut" }}
        className="
          relative z-10 mx-auto w-full
          max-w-[1280px]
          px-4 sm:px-6 lg:px-8 xl:px-12
          pt-28 pb-20
        "
      >
        <div className="max-w-3xl mx-auto text-center px-6 sm:px-8 lg:px-10">
          {/* EYEBROW */}
          {eyebrow && (
            <p
              className={`
                ${eyebrowClass}
                font-body font-medium
                uppercase tracking-[0.38em]
                text-[0.70rem] sm:text-[0.78rem] md:text-[0.85rem]
                mb-7 opacity-80
              `}
            >
              {eyebrow}
            </p>
          )}

          {/* TITLE */}
          <h1
            className={`
              font-satisfy
              ${titleClass}
              text-5xl sm:text-6xl md:text-7xl lg:text-[5rem]
              tracking-tight leading-[1.02]
              drop-shadow-[0_0_40px_rgba(0,0,0,0.9)]
              mb-10
            `}
          >
            {title}
          </h1>

          {/* DESCRIPTION */}
          {description && (
            <p
              className={`
                ${descriptionClass}
                opacity-90 font-body
                text-[1.2rem] md:text-[1.3rem]
                leading-[1.62]
                max-w-[720px]
                mx-auto
                mb-12
              `}
            >
              {description}
            </p>
          )}

          {/* CTA */}
          {(hasClickCta || hasLinkCta) && (
            <div className="flex justify-center gap-4">
              {hasClickCta && (
                <Button
                  size="lg"
                  onClick={onPrimaryClick}
                  className="
                    rounded-full px-8 py-3
                    bg-primary text-black
                    shadow-lg shadow-primary/40
                    hover:bg-primary/90 hover:scale-[1.06]
                  "
                >
                  {primaryCtaText}
                </Button>
              )}
              {hasLinkCta && (
                <Button
                  asChild
                  size="lg"
                  variant="outline"
                  className="
                    rounded-full px-8 py-3
                    border-primary/60 text-primary
                    bg-black/40 hover:bg-primary/10 hover:scale-[1.03]
                  "
                >
                  <a href={primaryCtaHref}>{primaryCtaText}</a>
                </Button>
              )}
            </div>
          )}
        </div>
      </motion.div>

      <ScrollIndicator />
    </header>
  );
}