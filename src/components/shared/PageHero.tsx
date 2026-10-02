import { motion, useScroll, useTransform } from "framer-motion";
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
  presentation?: "classic" | "business" | "editorial";
}

function inDecapPreviewIframe(): boolean {
  if (typeof document !== "undefined") {
    return (
      document.body?.classList?.contains("nc-app-iframe-root") ||
      typeof Reflect.get(window, "CMS") !== "undefined"
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
    secondaryCtaText,
    secondaryCtaHref,
    onSecondaryClick,
    presentation = "classic",
    onPrimaryClick,
    backgroundImage,
    image,
    variant = "image",
  } = props;

  const resolvedBackgroundImage = image || backgroundImage || undefined;
  const eyebrowText = eyebrow ?? subtitle;
  const isModern = presentation !== "classic";
  const isEditorial = presentation === "editorial";

  const { scrollY } = useScroll();
  const y = useTransform(scrollY, [0, 500], [0, 120]);

  if (isEditorial) {
    return (
      <header className="bg-[#f7f7f7] py-12 text-slate-900 md:py-16">
        <div className="mx-auto grid max-w-7xl items-center gap-8 px-5 sm:px-6 lg:grid-cols-12 lg:gap-10 lg:px-8">
          <div className="min-w-0 lg:col-span-6">
            {eyebrowText && <p className="mb-5 text-xs font-normal uppercase tracking-[0.12em] text-slate-500">{eyebrowText}</p>}
            <h1 className="max-w-[16ch] font-display text-[40px] font-light leading-[1.08] tracking-tight md:text-[64px]">{title}</h1>
            {description && <p className="mt-6 max-w-[48ch] font-body text-base leading-relaxed text-slate-600">{description}</p>}
            {primaryCtaText && <Button size="lg" variant="brand" className="mt-8" asChild={!!primaryCtaHref && !onPrimaryClick} onClick={onPrimaryClick}>
              {primaryCtaHref && !onPrimaryClick ? <a href={primaryCtaHref}>{primaryCtaText}</a> : primaryCtaText}
            </Button>}
          </div>
          {resolvedBackgroundImage && <div className="overflow-hidden lg:col-span-6">
            <img src={resolvedBackgroundImage} alt="" className="aspect-[2/1] w-full object-cover object-[82%_bottom] lg:aspect-[3/2] lg:object-right-bottom" />
          </div>}
        </div>
      </header>
    );
  }

  return (
    <header className={`relative flex w-full items-center justify-center overflow-hidden bg-transparent ${isEditorial ? "pt-8 pb-8 md:pb-10" : "pt-8 pb-16"} ${isEditorial ? "min-h-[520px] lg:min-h-[580px]" : isModern ? "min-h-[560px] lg:min-h-[660px]" : "min-h-[720px] lg:min-h-[780px]"}`}>
      {variant === "image" && resolvedBackgroundImage && (
        <motion.div
          className={`absolute inset-0 bg-cover bg-no-repeat ${isEditorial ? "bg-[position:82%_bottom] md:bg-[position:right_bottom]" : ""}`}
          style={{
            backgroundImage: `url(${resolvedBackgroundImage})`,
            ...(isEditorial ? {} : { backgroundPosition: "center bottom" }),
            ...(isPreview || isEditorial ? {} : { y }),
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

      {isModern && <div aria-hidden="true" className={`absolute inset-0 bg-gradient-to-r ${isEditorial ? "from-[#101d24]/95 via-[#101d24]/80 to-[#101d24]/50" : "from-[#101d24]/95 via-[#101d24]/85 to-[#101d24]/75"}`} />}

      {!isModern && <div className="absolute inset-0 pointer-events-none">
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
      </div>}

      <motion.div
        initial={{ opacity: 0, y: 26 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className={`relative z-10 mx-auto w-full max-w-7xl px-5 sm:px-6 lg:px-8 ${isModern ? `${isEditorial ? "py-8 md:py-10" : "py-12"} text-left` : "text-center"}`}
      >
        {eyebrowText && (
          <p className={isModern ? (isEditorial ? "mb-7 flex items-center gap-4 text-[0.6875rem] font-normal uppercase tracking-[0.12em] text-white/65" : "mb-7 flex items-center gap-4 text-xs font-medium uppercase tracking-[0.18em] text-[#9bd3c8]") : "mb-4 text-[0.9rem] font-medium uppercase tracking-[0.18em] text-[#27CDBA] md:text-[0.95rem]"}>
            {isModern && <span aria-hidden="true" className="h-px w-10 bg-current" />}
            {eyebrowText}
          </p>
        )}

        <h1
          className={isModern
            ? `mb-7 max-w-[15ch] font-display text-[clamp(2.8rem,6.5vw,5.8rem)] leading-[1.06] tracking-[-0.035em] text-[#f7f3eb] font-light`
            : "mb-6 font-satisfy text-[clamp(4.2rem,8.6vw,7.2rem)] leading-[0.96]"}
          style={isModern ? undefined : {
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
          <p className={isModern ? "mb-10 max-w-[52ch] text-base leading-[1.8] text-slate-200 md:text-lg" : "mx-auto mb-10 max-w-3xl text-lg leading-relaxed text-[#2A4763] md:text-xl"}>
            {description}
          </p>
        )}

        {(primaryCtaText || secondaryCtaText) && (
          <div className={`flex flex-col gap-4 sm:flex-row ${isModern ? "max-w-2xl items-start" : "mx-auto max-w-xl justify-center"}`}>
            {primaryCtaText && (
            <Button
              size="lg"
              variant={isModern ? "brand" : "default"}
              asChild={!!primaryCtaHref && !onPrimaryClick}
              onClick={onPrimaryClick}
              className={isModern ? "w-full sm:w-auto" : `
                w-full sm:w-auto sm:min-w-[240px]
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
              `}
              style={isModern ? undefined : {
                background:
                  "linear-gradient(180deg, rgba(14,37,64,0.98) 0%, rgba(8,24,44,1) 100%)",
                borderColor: "rgba(39,205,186,0.55)",
                boxShadow:
                  "inset 0 1px 0 rgba(255,255,255,0.10), 0 12px 28px rgba(5,16,32,0.28), 0 0 0 1px rgba(7,18,34,0.22)",
              }}
            >
              {primaryCtaHref && !onPrimaryClick ? <a href={primaryCtaHref}>{primaryCtaText}</a> : primaryCtaText}
            </Button>
            )}
            {secondaryCtaText && (
              <Button size="text" variant="textcta" asChild={!!secondaryCtaHref && !onSecondaryClick}
                onClick={onSecondaryClick}
                className="min-h-11 w-full sm:w-auto">
                {secondaryCtaHref && !onSecondaryClick ? <a href={secondaryCtaHref}>{secondaryCtaText}</a> : secondaryCtaText}
              </Button>
            )}
          </div>
        )}
      </motion.div>

      {!isModern && <div className="absolute bottom-6 left-1/2 -translate-x-1/2">
        <ScrollIndicator />
      </div>}
    </header>
  );
}
