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
    <header className="relative flex min-h-[720px] w-full items-center justify-center overflow-hidden bg-transparent pt-8 pb-16 lg:min-h-[780px]">
      {variant === "image" && resolvedBackgroundImage && (
        <motion.div
          className="absolute inset-0 bg-cover bg-no-repeat"
          style={{
            backgroundImage: `url(${resolvedBackgroundImage})`,
            backgroundPosition: "center bottom",
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
          className="absolute left-1/2 top-[42%] -translate-x-1/2 -translate-y-1/2"
          style={{
            width: "min(1040px, 84vw)",
            height: "min(380px, 40vw)",
            background:
              "radial-gradient(ellipse at center, rgba(255,255,255,0.18) 0%, rgba(255,255,255,0.06) 34%, rgba(255,255,255,0.02) 62%, rgba(255,255,255,0) 82%)",
            filter: "blur(14px)",
          }}
        />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 26 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative z-10 w-full max-w-[1280px] px-6 text-center"
      >
        {eyebrowText && (
          <p className="mb-4 text-[0.9rem] font-medium uppercase tracking-[0.18em] text-[#27CDBA] md:text-[0.95rem]">
            {eyebrowText}
          </p>
        )}

        <h1
          className="
            mb-6
            font-satisfy
            text-[clamp(4.2rem,8.6vw,7.2rem)]
            leading-[0.96]
          "
          style={{
            color: "#4A86C5",
            WebkitTextStroke: "1px rgba(35,78,124,0.55)",
            textShadow: `
              0 1px 0 #8FC0F0,
              0 2px 0 #3F79B8,
              0 3px 0 #376EAA,
              0 4px 0 #2F639A,
              0 5px 0 #285887,
              0 6px 0 #224D78,
              0 7px 10px rgba(18,44,75,0.22),
              0 12px 24px rgba(9,24,44,0.16)
            `,
            filter: "drop-shadow(0 2px 8px rgba(18,44,75,0.10))",
          }}
        >
          {title}
        </h1>

        {description && (
          <p className="mx-auto mb-12 max-w-[980px] text-[1.18rem] leading-[1.55] text-[#2A4763] md:text-[1.42rem]">
            {description}
          </p>
        )}

        {primaryCtaText && (
          <div className="flex justify-center">
            <Button
              size="lg"
              onClick={() => handleClick(primaryCtaHref, onPrimaryClick)}
              className="
                min-w-[320px]
                rounded-full
                border
                px-10
                py-4
                text-[1rem]
                font-semibold
                text-white
                backdrop-blur-md
                transition-all duration-200
                hover:-translate-y-[1px]
              "
              style={{
                background:
                  "linear-gradient(180deg, rgba(14,37,64,0.98) 0%, rgba(8,24,44,1) 100%)",
                borderColor: "rgba(39,205,186,0.55)",
                boxShadow:
                  "inset 0 1px 0 rgba(255,255,255,0.10), 0 12px 28px rgba(5,16,32,0.28), 0 0 0 1px rgba(7,18,34,0.22)",
              }}
            >
              {primaryCtaText}
            </Button>
          </div>
        )}
      </motion.div>

      <div className="absolute bottom-6 left-1/2 -translate-x-1/2">
        <ScrollIndicator />
      </div>
    </header>
  );
}