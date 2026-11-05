import homepageContent from "@/content/homepage.json";
import { heroBackground } from "@/lib/heroImages";
import { motion, useScroll, useTransform, useReducedMotion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ScrollIndicator } from "@/components/shared/ScrollIndicator";
import MobileHeroArtwork from "@/components/shared/MobileHeroArtwork";

type Variant = "image" | "solid";

interface PageHeroProps {
  className?: string;
  contentClassName?: string;
  artworkClassName?: string;
  eyebrow?: string;
  subtitle?: string;
  title: string;
  identity?: boolean;
  fadeArtwork?: boolean;
  titleSizeClassName?: string;
  titleClassName?: string;
  description?: string;
  descriptionClassName?: string;

  primaryCtaText?: string;
  primaryCtaClassName?: string;
  primaryCtaHref?: string;
  onPrimaryClick?: () => void;

  secondaryCtaText?: string;
  secondaryCtaHref?: string;
  onSecondaryClick?: () => void;
  equalCtas?: boolean;
  showCtas?: boolean;
  editorialCoherence?: boolean;
  homepageTextAlignment?: boolean;
  compactMobile?: boolean;
  compactDesktop?: boolean;
  homepageDesktopComposition?: boolean;

  imageOverlayClassName?: string;
  imageParallax?: boolean;
  backgroundImage?: string;
  image?: string;
  mobileArtworkPath?: string;

  variant?: Variant;
  presentation?: "classic" | "business" | "editorial" | "public";
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
  const reducedMotion = useReducedMotion();

  const {
    className = "",
    contentClassName = "",
    artworkClassName = "",
    eyebrow,
    subtitle,
    title,
    titleSizeClassName,
    titleClassName = "",
    description,
    descriptionClassName,
    primaryCtaText,
    primaryCtaClassName = "",
    primaryCtaHref,
    secondaryCtaText,
    secondaryCtaHref,
    onSecondaryClick,
    equalCtas = false,
    showCtas = false,
    editorialCoherence = false,
    homepageTextAlignment = false,
    compactMobile = false,
    compactDesktop = false,
    homepageDesktopComposition = false,
    presentation = "classic",
    onPrimaryClick,
    imageParallax = true,
    imageOverlayClassName,
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

  if (presentation === "public") {
    const identity = props.identity ?? false;
    const fadeArtwork = props.fadeArtwork ?? true;
    // Keep artwork in its own grid cell so long headings and CTAs never overlap it.
    const trimHomeArtwork = resolvedBackgroundImage === "/uploads/website-hero-home.png";
    return <header className={`site-gutter overflow-hidden bg-[#101d24] py-8 sm:py-12 ${className}`}>
      <div className="site-container grid items-center gap-6 md:grid-cols-2 md:gap-10">
        <div className={`min-w-0 py-4 text-left ${contentClassName}`}>
          {eyebrowText && <p className="mb-6 flex items-center gap-4 site-eyebrow text-[#9bd3c8]"><span aria-hidden="true" className="h-px w-10 shrink-0 bg-current" />{eyebrowText}</p>}
          <h1 className={`site-page-h1 mb-5 max-w-2xl text-balance font-display font-light leading-[1.12] tracking-[-0.035em] text-[#f7f3eb] ${identity ? "text-[32px] sm:text-[40px] lg:text-5xl" : "text-[26px] sm:text-[32px] lg:text-4xl"}`}>{identity && title === homepageContent.hero.title ? <>{title.slice(0, title.lastIndexOf(" "))}{" "}<br />{title.slice(title.lastIndexOf(" ") + 1)}</> : title}</h1>
          {description && <p className={`${identity ? "max-w-3xl text-[#9bd3c8]" : "max-w-xl text-[#f7f3eb]"} font-body text-base leading-relaxed ${descriptionClassName ?? ""}`}>{description.split("\n").map((line, index) => <span key={index} className={`block ${identity && (index > 0 || line === "INSIGHTS. CONVERSATIONS. CONNECTIONS.") ? "uppercase tracking-[0.08em]" : ""}`}>{line}</span>)}</p>}
          {showCtas && (primaryCtaText || secondaryCtaText) && <div className="mt-6 flex flex-wrap items-center gap-4">
            {primaryCtaText && <Button size="lg" variant="brand" className="h-12 w-full font-semibold sm:w-auto" asChild={!!primaryCtaHref && !onPrimaryClick} onClick={onPrimaryClick}>{primaryCtaHref && !onPrimaryClick ? <a href={primaryCtaHref}>{primaryCtaText}</a> : primaryCtaText}</Button>}
            {secondaryCtaText && secondaryCtaHref && <a href={secondaryCtaHref} className="site-secondary-action text-[#9bd3c8]">{secondaryCtaText}</a>}
          </div>}
        </div>
        {resolvedBackgroundImage && <>
          <div aria-hidden="true" className={`relative hidden min-w-0 overflow-hidden sm:block md:order-first ${trimHomeArtwork ? "aspect-[3233/1214]" : "aspect-video"}`} style={fadeArtwork ? { maskImage: "linear-gradient(to right, black 80%, transparent 100%)", WebkitMaskImage: "linear-gradient(to right, black 80%, transparent 100%)" } : undefined}>
            <div className={trimHomeArtwork ? "absolute left-[-11.35%] top-[-66.8%] h-[166.8%] w-[111.35%] bg-contain bg-no-repeat" : "absolute inset-0 bg-contain bg-left bg-no-repeat"} style={{ backgroundImage: heroBackground(resolvedBackgroundImage) }} />
          </div>
          <div className="relative aspect-[1080/656] min-w-0 overflow-hidden sm:hidden [&_picture_img]:absolute [&_picture_img]:top-[-105.8%] [&_picture_img]:!h-auto [&_picture_img]:w-full" style={fadeArtwork ? { maskImage: "linear-gradient(to right, black 80%, transparent 100%)", WebkitMaskImage: "linear-gradient(to right, black 80%, transparent 100%)" } : undefined}>
            <MobileHeroArtwork path={props.mobileArtworkPath} />
          </div>
        </>}

      </div>
    </header>;
  }

  if (isEditorial) {
    return (
      <header className="site-gutter bg-[#f7f7f7] py-12 text-slate-900 md:py-16">
        <div className="site-container grid items-center gap-8 lg:grid-cols-12 lg:gap-10">
          <div className="min-w-0 lg:col-span-6">
            {eyebrowText && <p className="mb-5 site-eyebrow text-slate-500">{eyebrowText}</p>}
            <h1 className="site-page-h1 max-w-[16ch] font-display text-[40px] font-light leading-[1.08] tracking-tight md:text-[64px]">{title}</h1>
            {description && <p className="mt-6 max-w-[48ch] font-body text-base leading-relaxed text-slate-600">{description}</p>}
            {showCtas && primaryCtaText && <Button size="lg" variant="brand" className="mt-8" asChild={!!primaryCtaHref && !onPrimaryClick} onClick={onPrimaryClick}>
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
    <header className={`site-gutter relative flex w-full ${compactDesktop ? "items-start" : homepageTextAlignment ? "items-start sm:items-center" : editorialCoherence ? "items-start" : "items-center"} justify-center overflow-hidden ${homepageDesktopComposition ? "bg-[#101d24]" : "bg-transparent"} ${homepageDesktopComposition ? "lg:!items-center lg:!min-h-0 lg:h-[clamp(480px,calc(100svh-270px),660px)] lg:!pb-16" : ""} ${isEditorial ? "pt-8 pb-8 md:pb-10" : variant === "image" && resolvedBackgroundImage ? compactDesktop ? "pt-8 pb-[90vw] sm:pb-8" : "pt-8 pb-[90vw] sm:pb-16" : "pt-8 pb-16"} ${compactDesktop ? "min-h-0 sm:min-h-[440px] lg:min-h-[480px]" : homepageTextAlignment ? "min-h-0 sm:min-h-[560px] lg:min-h-[660px]" : isEditorial ? "min-h-[520px] lg:min-h-[580px]" : editorialCoherence ? "min-h-[560px] lg:min-h-[620px]" : isModern ? "min-h-[560px] lg:min-h-[660px]" : "min-h-[720px] lg:min-h-[780px]"} ${className}`}>
      {variant === "image" && resolvedBackgroundImage && (
        <motion.div
          className={`absolute inset-0 hidden bg-cover bg-no-repeat sm:block ${isEditorial ? "bg-[position:82%_bottom] md:bg-[position:right_bottom]" : ""} ${artworkClassName}`}
          style={{
            backgroundImage: heroBackground(resolvedBackgroundImage),
            ...(homepageDesktopComposition ? {
              maskImage: "linear-gradient(to right, black 80%, transparent 100%)",
              WebkitMaskImage: "linear-gradient(to right, black 80%, transparent 100%)",
            } : {}),
            ...(isEditorial ? {} : { backgroundPosition: "center bottom" }),
            ...(reducedMotion || isPreview || isEditorial || !imageParallax || editorialCoherence ? {} : { y }),
          }}
          aria-hidden="true"
        />
      )}
      {variant === "image" && resolvedBackgroundImage && <MobileHeroArtwork sizes="100vw" path={props.mobileArtworkPath} />}
      {variant === "image" && resolvedBackgroundImage && imageOverlayClassName && <div aria-hidden="true" className={`pointer-events-none absolute inset-0 ${imageOverlayClassName}`} />}

      {variant === "solid" && (
        <div
          className="absolute inset-0 bg-[var(--background-dark)]"
          aria-hidden="true"
        />
      )}

      <motion.div
        initial={reducedMotion ? false : { opacity: 0, y: 26 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: reducedMotion ? 0 : 0.6 }}
        className={`relative z-10 site-container ${homepageDesktopComposition ? "lg:-top-12 lg:min-h-[347px] xl:min-h-[372.4px]" : ""} ${homepageTextAlignment && !compactDesktop ? "sm:min-h-[314px] md:min-h-[347px] xl:min-h-[372.4px]" : ""} ${isModern ? `${isEditorial ? "py-8 md:py-10" : "py-4 sm:py-12"} text-left` : "text-center"} ${contentClassName}`}
      >
        {eyebrowText && (
          <p className={isModern ? (isEditorial ? "font-display mb-7 flex items-center gap-4 text-sm font-normal uppercase tracking-[0.12em] text-white/65" : `${compactMobile ? "mb-4 sm:mb-7" : "mb-7"} flex items-center gap-4 site-eyebrow text-[#9bd3c8]`) : "font-display mb-4 text-[0.9rem] font-medium uppercase tracking-[0.18em] text-[#27CDBA] md:text-[0.95rem]"}>
            {isModern && <span aria-hidden="true" className="h-px w-10 bg-current" />}
            {eyebrowText}
          </p>
        )}

        <h1
          className={isModern
            ? `site-page-h1 ${homepageTextAlignment ? "mb-5 max-w-[10em]" : "mb-7 max-w-[15ch]"} font-display ${titleSizeClassName ?? (editorialCoherence ? compactMobile ? "text-4xl sm:text-[2.75rem] md:text-[3.75rem] xl:text-[4.5rem]" : "text-[2.75rem] md:text-[3.75rem] xl:text-[4.5rem]" : "text-[clamp(2.8rem,6.5vw,5.8rem)]")} leading-[1.06] tracking-[-0.035em] text-[#f7f3eb] font-light ${titleClassName}`
            : "site-page-h1 mb-6 font-satisfy text-[clamp(4.2rem,8.6vw,7.2rem)] leading-[0.96]"}
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
          <p className={descriptionClassName ?? (isModern ? "mb-0 sm:mb-10 max-w-[52ch] text-base leading-[1.8] text-slate-200 md:text-lg" : "mx-auto mb-10 max-w-3xl text-lg leading-relaxed text-[#2A4763] md:text-xl")}>
            {description.includes("\n") ? description.split("\n").map((line, index) => <span key={index} className="block">{line}</span>) : description}
          </p>
        )}

        {showCtas && (primaryCtaText || secondaryCtaText) && (
          <div className={`flex flex-col gap-4 sm:flex-row ${isModern ? "max-w-2xl items-start" : "mx-auto max-w-xl justify-center"}`}>
            {primaryCtaText && (
            <Button
              size="lg"
              variant={isModern ? "brand" : "default"}
              asChild={!!primaryCtaHref && !onPrimaryClick}
              onClick={onPrimaryClick}
              className={isModern ? (equalCtas ? "w-full sm:w-[210px]" : `w-full sm:w-auto ${primaryCtaClassName}`) : `
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
              <Button size={equalCtas ? "lg" : "text"} variant={equalCtas ? "brand" : "textcta"} asChild={!!secondaryCtaHref && !onSecondaryClick}
                onClick={onSecondaryClick}
                className={equalCtas ? "w-full sm:w-[210px]" : "min-h-11 w-full sm:w-auto"}>
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
