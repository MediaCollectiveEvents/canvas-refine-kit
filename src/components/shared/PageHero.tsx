import { motion, useScroll, useTransform, MotionValue } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ScrollIndicator } from "@/components/shared/ScrollIndicator";
import HeroEffects from "@/components/shared/HeroEffects";
import settings from "@/content/settings.json";

type Theme = "dark" | "light";
type Variant = "image" | "solid";
type MobileCropMode = "cover" | "contain";
type ImagePosition = "top" | "center" | "bottom";

interface PageHeroProps {
  eyebrow?: string;
  subtitle?: string;
  title: string;
  description?: string;

  primaryCtaText?: string;
  primaryCtaHref?: string;
  onPrimaryClick?: () => void;

  secondaryCtaText?: string;
  secondaryCtaHref?: string;
  onSecondaryClick?: () => void;

  backgroundImage?: string;
  image?: string;

  variant?: Variant;
  overlayStrength?: number;
  theme?: Theme;

  mobileCrop?: MobileCropMode;
  imagePosition?: ImagePosition;
  imageOffset?: number;

  eyebrowColor?: string;
  titleColor?: string;
  textColor?: string;

  backdropStrength?: number;
  backdropColor?: string;
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

function resolveFontClass(color?: string, fallback = "text-white"): string {
  switch (color) {
    case "white":
      return "text-white";
    case "black":
      return "text-black";
    case "teal":
    case "primary":
      return "text-[#36e0c6]";
    case "cyan":
      return "text-[#7EEDE0]";
    case "darkgrey":
      return "text-slate-700";
    default:
      return fallback;
  }
}

export default function PageHero(props: PageHeroProps) {
  const isPreview = inDecapPreviewIframe();

  const heroDefaults = (settings as any).heroDefaults || {};
  const palette = (settings as any).palette || {};

  const {
    eyebrow,
    subtitle,
    title,
    description,

    primaryCtaText,
    primaryCtaHref,
    onPrimaryClick,

    secondaryCtaText,
    secondaryCtaHref,
    onSecondaryClick,

    backgroundImage,
    image,

    variant = "image",
    overlayStrength = heroDefaults.overlayStrength ?? 0.5,
    theme = "dark",

    mobileCrop = "cover",
    imagePosition = "center",
    imageOffset = 0,

    eyebrowColor = heroDefaults.eyebrowColor,
    titleColor = heroDefaults.titleColor,
    textColor = heroDefaults.textColor,

    backdropStrength,
    backdropColor,
    backdropSize,
  } = props;

  const isLight = theme === "light";
  const resolvedBackgroundImage = image || backgroundImage || undefined;

  let y: MotionValue<number> | 0 = 0;
  if (!isPreview) {
    const { scrollY } = useScroll();
    const baseY = useTransform(scrollY, [0, 500], [0, 140]);
    y = useTransform(baseY, (value) => value + imageOffset);
  }

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

  const eyebrowText = eyebrow ?? subtitle;

  const showPrimary = !!(primaryCtaText && (primaryCtaHref || onPrimaryClick));
  const showSecondary = !!(
    secondaryCtaText &&
    (secondaryCtaHref || onSecondaryClick)
  );

  const effectiveBackdropStrength =
    backdropStrength ?? heroDefaults.backdropStrength ?? 0.6;
  const effectiveBackdropColor =
    backdropColor ?? heroDefaults.backdropColor ?? "15,23,42";
  const effectiveBackdropSize =
    backdropSize ?? heroDefaults.backdropSize ?? 1;

  const boostedBackdrop = Math.min(effectiveBackdropStrength * 1.15, 1);

  const solidBackgroundColor =
    theme === "light"
      ? palette.backgroundLight ?? "var(--background-light)"
      : palette.backgroundDark ?? "var(--background-dark)";

  const eyebrowClass = resolveFontClass(
    eyebrowColor,
    isLight ? "text-[#7EEDE0]" : "text-white/80"
  );

  const titleClass = resolveFontClass(
    titleColor,
    isLight ? "text-[#F6FBFF]" : "text-white"
  );

  const descriptionClass = resolveFontClass(
    textColor,
    isLight ? "text-white/88" : "text-white/90"
  );

  return (
    <header
      className="
        relative w-full
        min-h-[500px] sm:min-h-[580px] lg:min-h-[640px] xl:min-h-[680px]
        flex items-center justify-center
        overflow-hidden
        bg-[var(--background-dark)]
      "
      style={
        variant === "solid"
          ? { backgroundColor: solidBackgroundColor }
          : undefined
      }
    >
      {variant === "image" && resolvedBackgroundImage && (
        <motion.div
          className={`absolute inset-0 ${backgroundClasses}`}
          style={{
            backgroundImage: `url(${resolvedBackgroundImage})`,
            ...(isPreview ? {} : { y }),
          }}
          aria-hidden="true"
        />
      )}

      <div className="absolute inset-0 pointer-events-none">
        {!isLight && (
          <>
            <div
              className="absolute inset-0"
              style={{
                background: `
                  radial-gradient(
                    circle at 50% 38%,
                    rgba(15,23,42,0.92) 0%,
                    rgba(15,23,42,0.68) 42%,
                    rgba(15,23,42,0.26) 74%,
                    rgba(15,23,42,0) 100%
                  )
                `,
              }}
            />

            <div
              className="absolute inset-0 opacity-[0.22]"
              style={{
                background: `
                  radial-gradient(circle at 8% 72%, rgba(255,196,160,0.6), transparent 40%),
                  radial-gradient(circle at 90% 60%, rgba(255,160,215,0.55), transparent 42%),
                  radial-gradient(circle at 15% 20%, rgba(255,190,160,0.42), transparent 48%)
                `,
                mixBlendMode: "screen",
              }}
            />

            <HeroEffects lighten={overlayStrength} />
          </>
        )}

        {isLight && (
          <>
            <div
              className="absolute inset-0"
              style={{
                background: `
                  radial-gradient(
                    circle at 50% 42%,
                    rgba(255,255,255,0.34) 0%,
                    rgba(255,255,255,0.2) 34%,
                    rgba(255,255,255,0.08) 60%,
                    rgba(255,255,255,0) 100%
                  )
                `,
              }}
            />

            <div
              className="absolute inset-0"
              style={{
                background: `
                  linear-gradient(
                    to bottom,
                    rgba(10,18,35,0.16) 0%,
                    rgba(10,18,35,0.08) 14%,
                    rgba(255,255,255,0) 32%,
                    rgba(255,255,255,0) 70%,
                    rgba(10,18,35,0.06) 100%
                  )
                `,
              }}
            />

            <div
              className="absolute inset-0 opacity-[0.12]"
              style={{
                background: `
                  radial-gradient(circle at 82% 30%, rgba(255,255,255,0.55), transparent 28%),
                  radial-gradient(circle at 18% 65%, rgba(255,255,255,0.28), transparent 26%),
                  radial-gradient(circle at 50% 52%, rgba(255,255,255,0.16), transparent 40%)
                `,
                mixBlendMode: "screen",
              }}
            />
          </>
        )}
      </div>

      <div
        aria-hidden="true"
        className="absolute left-1/2 top-[48%] -translate-x-1/2 pointer-events-none"
        style={{
          width: `${84 * effectiveBackdropSize}vw`,
          maxWidth: `${1180 * effectiveBackdropSize}px`,
          height: `${240 * effectiveBackdropSize}px`,
          background: isLight
            ? `
              radial-gradient(
                ellipse at center,
                rgba(255,255,255,0) 0%,
                rgba(255,255,255,0.18) 30%,
                rgba(255,255,255,0.12) 55%,
                rgba(255,255,255,0.06) 75%,
                rgba(255,255,255,0) 100%
              )
            `
            : `
              radial-gradient(
                ellipse at center,
                rgba(${effectiveBackdropColor},0) 0%,
                rgba(${effectiveBackdropColor},${boostedBackdrop}) 30%,
                rgba(${effectiveBackdropColor},${Math.min(boostedBackdrop * 0.7, 1)}) 55%,
                rgba(${effectiveBackdropColor},${Math.min(boostedBackdrop * 0.4, 1)}) 75%,
                rgba(${effectiveBackdropColor},0) 100%
              )
            `,
          filter: "blur(40px)",
        }}
      />

      <motion.div
        initial={{ opacity: 0, y: 28 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
        className="
          relative z-10 w-full
          max-w-[1240px]
          px-4 sm:px-6 lg:px-8 xl:px-10
          pt-16 sm:pt-20 lg:pt-16
          pb-16 sm:pb-20 lg:pb-16
        "
      >
        <div className="max-w-[820px] mx-auto text-center px-4 sm:px-6 lg:px-8">
          {eyebrowText && (
            <p
              className={`
                font-body font-medium uppercase
                tracking-[0.24em] sm:tracking-[0.32em] md:tracking-[0.36em]
                text-[0.68rem] sm:text-[0.75rem] md:text-[0.82rem]
                mb-5 sm:mb-6
                ${eyebrowClass}
              `}
            >
              {eyebrowText}
            </p>
          )}

          <h1
            className={`
              font-satisfy
              text-[3.45rem] sm:text-[4.1rem] md:text-[4.8rem] lg:text-[5.2rem]
              tracking-tight leading-[0.98]
              mb-6 sm:mb-7 lg:mb-8
              ${titleClass}
              ${
                isLight
                  ? "drop-shadow-[0_8px_28px_rgba(10,18,35,0.34)]"
                  : "drop-shadow-[0_0_40px_rgba(0,0,0,0.9)]"
              }
            `}
          >
            {title}
          </h1>

          {description && (
            <p
              className={`
                font-body
                text-[1.05rem] sm:text-[1.12rem] md:text-[1.22rem] lg:text-[1.28rem]
                leading-[1.6]
                max-w-[680px]
                mx-auto
                mb-8 sm:mb-10 lg:mb-11
                ${descriptionClass}
                ${
                  isLight
                    ? "drop-shadow-[0_4px_18px_rgba(10,18,35,0.22)]"
                    : ""
                }
              `}
            >
              {description}
            </p>
          )}

          {(showPrimary || showSecondary) && (
            <div className="flex flex-col sm:flex-row flex-wrap justify-center items-center gap-3 sm:gap-4">
              {showPrimary && (
                <Button
                  size="lg"
                  onClick={onPrimaryClick}
                  className="
                    min-w-[240px] sm:min-w-0
                    rounded-full
                    px-7 sm:px-8
                    py-3
                    bg-primary text-black
                    shadow-[0_10px_28px_rgba(54,224,198,0.28)]
                    hover:bg-primary/92 hover:scale-[1.03]
                    transition-all duration-200
                  "
                >
                  {primaryCtaText}
                </Button>
              )}

              {showSecondary && (
                <Button
                  size="lg"
                  variant="outline"
                  onClick={onSecondaryClick}
                  className={`
                    min-w-[240px] sm:min-w-0
                    rounded-full
                    px-7 sm:px-8
                    py-3
                    transition-all duration-200
                    ${
                      isLight
                        ? "border-white/55 text-white bg-white/8 hover:bg-white/14 hover:scale-[1.02]"
                        : "border-primary/55 text-primary bg-black/28 hover:bg-primary/10 hover:scale-[1.02]"
                    }
                  `}
                >
                  {secondaryCtaText}
                </Button>
              )}
            </div>
          )}
        </div>
      </motion.div>

      <div className="absolute bottom-4 sm:bottom-5 lg:bottom-6 left-1/2 -translate-x-1/2">
        <ScrollIndicator />
      </div>
    </header>
  );
}