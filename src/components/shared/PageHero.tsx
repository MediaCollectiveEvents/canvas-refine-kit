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

  const resolvedBackgroundImage =
    backgroundImage ||
    image ||
    (imageKey ? `/path/to/images/${imageKey}.jpg` : undefined);

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

  return (
    <header
      className={`
        relative w-full
        min-h-[520px] sm:min-h-[640px] lg:min-h-[700px]
        flex items-center justify-center
        overflow-hidden
        bg-[#0F172A]
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

      {/* EXISTING HERO OVERLAY */}
      <div className="absolute inset-0 pointer-events-none">
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
      </div>

      {/* ⭐ ELLIPTICAL CINEMATIC BACKDROP */}
      <div
        aria-hidden="true"
        className="
          absolute
          left-1/2
          top-[22%]
          -translate-x-1/2
          w-[92vw] max-w-[1300px]
          h-[380px]
          pointer-events-none
        "
        style={{
          background: `
            radial-gradient(
              ellipse at center,
              rgba(0,0,0,0.85) 0%,
              rgba(0,0,0,0.75) 28%,
              rgba(0,0,0,0.55) 55%,
              rgba(0,0,0,0.32) 75%,
              rgba(0,0,0,0.0) 100%
            )
          `,
          filter: "blur(32px)",
        }}
      />

      {/* ⭐ LOWER ELLIPTICAL UNDERGLOW */}
      <div
        aria-hidden="true"
        className="
          absolute
          left-1/2
          top-[46%]
          -translate-x-1/2
          w-[88vw] max-w-[1200px]
          h-[260px]
          pointer-events-none
        "
        style={{
          background: `
            radial-gradient(
              ellipse at center,
              rgba(0,0,0,0.58) 0%,
              rgba(0,0,0,0.38) 50%,
              rgba(0,0,0,0) 100%
            )
          `,
          filter: "blur(28px)",
        }}
      />

      {/* CONTENT */}
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
        <div className="max-w-3xl mx-auto text-center">

          {/* EYEBROW */}
          {eyebrow && (
            <p
              className="
                text-white/50
                font-body font-medium
                uppercase tracking-[0.38em]
                text-[0.70rem] sm:text-[0.78rem] md:text-[0.85rem]
                mb-7
              "
            >
              {eyebrow}
            </p>
          )}

          {/* HEADLINE */}
          <h1
            className="
              font-satisfy
              text-white
              text-5xl sm:text-6xl md:text-7xl lg:text-[5rem]
              tracking-tight leading-[1.02]
              drop-shadow-[0_0_60px_rgba(0,0,0,0.95)]
              mb-10
            "
          >
            {title}
          </h1>

          {/* SUBHEADING */}
          {description && (
            <p
              className="
                text-white/90
                font-body
                text-[1.2rem] md:text-[1.3rem]
                leading-[1.62]
                max-w-[720px]
                mx-auto
                mb-12
              "
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