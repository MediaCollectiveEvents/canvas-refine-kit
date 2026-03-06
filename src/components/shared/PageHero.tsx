// src/components/shared/PageHero.tsx

import { motion, useScroll, useTransform, MotionValue } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ScrollIndicator } from "@/components/shared/ScrollIndicator";

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
  const {
    eyebrow,
    title,
    description,
    primaryCtaText,
    primaryCtaHref,
    onPrimaryClick,
    backgroundImage,
    image,
    imageKey,
    variant = "image",
    overlayStrength = 0.75,
    theme = "dark",
    mobileCrop = "cover",
    imagePosition = "center",
    imageOffset = 0,
  } = props;

  const isPreview = inDecapPreviewIframe();

  let y: MotionValue<number> | 0 = 0;
  if (!isPreview) {
    const { scrollY } = useScroll();
    const baseY = useTransform(scrollY, [0, 500], [0, 140]);
    y = useTransform(baseY, (value) => value + imageOffset);
  }

  const isLight = theme === "light";

  const resolvedBackgroundImage =
    backgroundImage ||
    image ||
    (imageKey ? `/path/to/images/${imageKey}.jpg` : undefined);

  const s = overlayStrength !== undefined ? Number(overlayStrength) || 0 : 0.75;

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

  const titleClass = isLight
    ? "text-zinc-900 drop-shadow-[0_0_16px_rgba(255,255,255,0.5)]"
    : "text-white drop-shadow-[0_0_40px_rgba(0,0,0,0.8)]";

  const descClass = isLight ? "text-zinc-700" : "text-primary";
  const eyebrowClass = isLight ? "text-zinc-600" : "text-primary";

  return (
    <header
      className={`
        relative w-full
        min-h-[420px] sm:min-h-[560px] lg:min-h-[600px]
        flex items-center justify-center
        overflow-hidden
        ${isLight ? "bg-white" : "bg-background"}
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

      {/* OVERLAYS */}
      {isLight ? (
        /* unchanged light mode */
        <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
          <div
            className="absolute inset-0 opacity-40 mix-blend-screen"
            style={{
              background:
                "radial-gradient(circle at 50% 45%, rgba(255,255,255,0.65) 0%, rgba(245,248,255,0.45) 30%, rgba(0,0,0,0) 70%)",
            }}
          />
          <div className="absolute inset-0 bg-white/40 mix-blend-lighten" />
        </div>
      ) : (
        <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
          {/* Top/bottom vignette */}
          <div
            className={`absolute inset-0 bg-gradient-to-b ${darkVignetteClass} to-transparent`}
          />

          {/* ⭐ Blue‑tinged dark centre radial filter */}
          <div
            className="absolute inset-0 opacity-90"
            style={{
              background: `
                radial-gradient(circle at center,
                  rgba(15,23,42,1.0) 0%,      /* PURE universal blue centre */
                  rgba(15,23,42,0.88) 32%,    /* richer blue middle */
                  rgba(15,23,42,0.55) 60%,    /* soft falloff */
                  rgba(15,23,42,0) 100%       /* fade to transparent */
                )
              `,
              mixBlendMode: "multiply",
            }}
          />

          {/* Subtle brand wash */}
          <div
            className={`absolute inset-0 ${darkBrandWashClass} mix-blend-soft-light`}
          />
        </div>
      )}

      {/* CONTENT */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: "easeOut" }}
        className="
          relative z-10 mx-auto w-full
          max-w-[1280px]
          px-4 sm:px-6 lg:px-8 xl:px-12
          py-10 sm:py-12
        "
      >
        <div className="max-w-3xl mx-auto text-center">
          {eyebrow && (
            <p
              className={`
                ${eyebrowClass}
                font-body tracking-widest uppercase mb-6
                text-sm md:text-base
              `}
            >
              {eyebrow}
            </p>
          )}

          <h1
            className={`
              font-satisfy
              text-4xl sm:text-5xl md:text-6xl lg:text-7xl
              ${titleClass}
              leading-[1.13] md:leading-[1.18]
              mt-2 mb-8 md:mb-10
            `}
          >
            {title}
          </h1>

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

          {primaryCtaText && (hasClickCta || hasLinkCta) && (
            <div className="relative flex flex-wrap justify-center gap-4 mt-4">
              {hasClickCta && (
                <Button
                  size="lg"
                  onClick={onPrimaryClick}
                  className="rounded-full px-8 py-3 bg-primary text-black shadow-lg shadow-primary/40 hover:bg-primary/90 hover:scale-[1.06]"
                >
                  {primaryCtaText}
                </Button>
              )}

              {!hasClickCta && hasLinkCta && (
                <Button
                  asChild
                  size="lg"
                  variant="outline"
                  className="rounded-full px-8 py-3 border-primary/60 text-primary bg-black/40 hover:bg-primary/10 hover:scale-[1.03]"
                >
                  <a href={primaryCtaHref}>{primaryCtaText}</a>
                </Button>
              )}
            </div>
          )}
        </div>
      </motion.div>

      <ScrollIndicator />

      <div
        className="absolute bottom-0 left-0 right-0 h-px bg-zinc-300/15"
        aria-hidden="true"
      />
    </header>
  );
}