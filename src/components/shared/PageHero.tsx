import { motion, useScroll, useTransform, MotionValue } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ScrollIndicator } from "@/components/shared/ScrollIndicator";

type Variant = "image" | "solid";

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
  } = props;

  const resolvedBackgroundImage = image || backgroundImage || undefined;
  const eyebrowText = eyebrow ?? subtitle;

  let y: MotionValue<number> | 0 = 0;

  if (!isPreview) {
    const { scrollY } = useScroll();
    y = useTransform(scrollY, [0, 500], [0, 120]);
  }

  function handleClick(href?: string, click?: () => void) {
    if (click) return click();
    if (href) window.location.href = href;
  }

  return (
    <header className="relative w-full min-h-[560px] flex items-center justify-center overflow-hidden bg-transparent">
      {variant === "image" && resolvedBackgroundImage && (
        <motion.div
          className="absolute -inset-x-1 -top-1 -bottom-2 bg-cover bg-no-repeat"
          style={{
            backgroundImage: `url(${resolvedBackgroundImage})`,
            backgroundPosition: "center calc(100% + 80px)",
            ...(isPreview ? {} : { y }),
          }}
          aria-hidden="true"
        />
      )}

      {variant === "solid" && (
        <div
          className="absolute inset-0 bg-[var(--background-dark)]"
          aria-hidden="true"
        />
      )}

      <div className="absolute inset-0 pointer-events-none">
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(to bottom, rgba(255,255,255,0.18) 0%, rgba(255,255,255,0.05) 42%, rgba(255,255,255,0) 72%)",
          }}
        />
        <div
          className="absolute left-1/2 top-[44%] -translate-x-1/2 -translate-y-1/2"
          style={{
            width: "min(980px, 82vw)",
            height: "min(360px, 38vw)",
            background:
              "radial-gradient(ellipse at center, rgba(255,255,255,0.42) 0%, rgba(255,255,255,0.22) 28%, rgba(255,255,255,0.08) 55%, rgba(255,255,255,0.02) 72%, rgba(255,255,255,0) 88%)",
            filter: "blur(14px)",
          }}
        />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 26 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative z-10 w-full max-w-[1200px] px-6 text-center"
      >
        {eyebrowText && (
          <p className="uppercase tracking-[0.18em] text-[0.9rem] text-[#2E6294] mb-3 font-medium">
            {eyebrowText}
          </p>
        )}

        <h1
          className="
            font-satisfy
            text-[3.2rem]
            sm:text-[4.4rem]
            md:text-[5rem]
            lg:text-[5.4rem]
            leading-[0.98]
            text-[#2E6294]
            mb-5
          "
          style={{
            textShadow: "0 2px 6px rgba(0,0,0,0.08)",
          }}
        >
          {title}
        </h1>

        {description && (
          <p className="text-[1.12rem] text-[#2a4763] max-w-[570px] mx-auto leading-[1.6] mb-12">
            {description}
          </p>
        )}

        {(primaryCtaText || secondaryCtaText) && (
          <div className="flex flex-col sm:flex-row gap-5 justify-center">
            {primaryCtaText && (
              <Button
                size="lg"
                onClick={() => handleClick(primaryCtaHref, onPrimaryClick)}
                className="
                  min-w-[270px]
                  rounded-full
                  px-10
                  py-3.5
                  font-semibold
                  text-white
                  border border-white/55
                  bg-[rgba(28,72,118,0.88)]
                  backdrop-blur-lg
                  shadow-[0_18px_40px_rgba(0,0,0,0.28)]
                  hover:bg-[rgba(28,72,118,0.96)]
                  hover:border-white/70
                  hover:-translate-y-[1px]
                  hover:shadow-[0_22px_48px_rgba(0,0,0,0.34)]
                  transition-all duration-200
                "
              >
                {primaryCtaText}
              </Button>
            )}

            {secondaryCtaText && (
              <Button
                size="lg"
                onClick={() => handleClick(secondaryCtaHref, onSecondaryClick)}
                className="
                  min-w-[270px]
                  rounded-full
                  px-10
                  py-3.5
                  font-semibold
                  text-white
                  border border-white/55
                  bg-[rgba(28,72,118,0.88)]
                  backdrop-blur-lg
                  shadow-[0_18px_40px_rgba(0,0,0,0.28)]
                  hover:bg-[rgba(28,72,118,0.96)]
                  hover:border-white/70
                  hover:-translate-y-[1px]
                  hover:shadow-[0_22px_48px_rgba(0,0,0,0.34)]
                  transition-all duration-200
                "
              >
                {secondaryCtaText}
              </Button>
            )}
          </div>
        )}
      </motion.div>

      <div className="absolute bottom-6 left-1/2 -translate-x-1/2">
        <ScrollIndicator />
      </div>
    </header>
  );
}