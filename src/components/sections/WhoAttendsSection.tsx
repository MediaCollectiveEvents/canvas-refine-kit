import { useEffect, useRef } from "react";
import SectionWrapper from "../layout/SectionWrapper";

interface WhoAttendsSectionProps {
  section?: {
    heading?: string;
    styleTitle?: { sub?: string };
    statistics?: { companies?: string; boardLevel?: string; founders?: string };
    highlights?: { title?: string; subtitle?: string; icon?: string }[];
  };
}

export default function WhoAttendsSection({ section = {} }: WhoAttendsSectionProps) {
  const credentialRow = useRef<HTMLDivElement>(null);
  const revealed = useRef(new WeakSet<Element>());
  const highlights = (section.highlights ?? []).filter(item => item.title || item.subtitle);

  useEffect(() => {
    const row = credentialRow.current;
    // Visible HTML is the default; enhancement requires both APIs.
    if (!row || typeof IntersectionObserver === "undefined" || !Element.prototype.animate) return;
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const horizontal = window.matchMedia("(min-width: 640px)");
    let dispose = () => {};

    const setup = () => {
      dispose();
      const numerals = Array.from(row.querySelectorAll<HTMLElement>("[data-audience-numeral]"));
      if (reducedMotion.matches) {
        numerals.forEach(numeral => revealed.current.add(numeral));
        return;
      }
      const animations = new Map<HTMLElement, Animation>();
      numerals.forEach((numeral, index) => {
        if (revealed.current.has(numeral)) return;
        const animation = numeral.animate(
          [{ opacity: 0, transform: "translateY(24px)" }, { opacity: 1, transform: "translateY(0)" }],
          { duration: 1200, delay: horizontal.matches ? index * 250 : 0, easing: "cubic-bezier(0.25, 0.46, 0.45, 0.94)", fill: "both" },
        );
        animation.pause();
        animation.currentTime = 0;
        animations.set(numeral, animation);
      });
      const observer = new IntersectionObserver(entries => {
        entries.forEach(entry => {
          if (!entry.isIntersecting || entry.intersectionRatio < 0.25) return;
          const targets = horizontal.matches ? numerals : Array.from(entry.target.querySelectorAll<HTMLElement>("[data-audience-numeral]"));
          targets.forEach(numeral => {
            const animation = animations.get(numeral);
            if (!animation || revealed.current.has(numeral)) return;
            revealed.current.add(numeral);
            animation.play();
          });
          observer.unobserve(entry.target);
        });
      }, { threshold: 0.25 });
      if (horizontal.matches) observer.observe(row);
      else row.querySelectorAll("[data-audience-credential]").forEach(group => observer.observe(group));
      dispose = () => {
        observer.disconnect();
        animations.forEach(animation => animation.cancel());
      };
    };
    setup();
    horizontal.addEventListener("change", setup);
    reducedMotion.addEventListener("change", setup);
    return () => {
      dispose();
      horizontal.removeEventListener("change", setup);
      reducedMotion.removeEventListener("change", setup);
    };
  }, [section.highlights]);

  const intro = section.styleTitle?.sub || "Connecting broadcasters, studios and streaming platforms with the technology companies shaping the future of media.";

  const numeralSizes: Record<string, string> = {
    "300": "text-[70px] md:text-[96px]",
    "3": "text-[46px] md:text-[66px]",
    "5": "text-[56px] md:text-[74px]",
    "8": "text-[66px] md:text-[88px]",
  };

  return (
    <SectionWrapper variant="transparent" align="left" padding="lux" animateOnScroll={false} className="site-surface-emphasis border-b border-white/10 text-[#f7f3eb]">
      <div className="relative">
        <div className="grid gap-5 lg:grid-cols-12 lg:items-center lg:gap-10">
          <div className="lg:col-span-4">
            <h2 className="site-heading !font-medium text-[#f7f3eb]">{section.heading || "In The Room"}</h2>
          </div>
          <p className="max-w-3xl text-base leading-[1.5] text-[#f7f3eb]/75 lg:col-span-8">{intro.split(/(In 2026)/).map((part, index) => part === "In 2026" ? <strong key={index} className="font-semibold">{part}</strong> : part)}</p>
        </div>
          <div ref={credentialRow} className={`mt-8 grid ${highlights.length === 3 ? "md:grid-cols-3" : "md:grid-cols-2 xl:grid-cols-4"}`}>
            {highlights.map((item, index) => {
              const title = item.title?.match(/^(?:(.*?)\s+)?(\d+)(\+)?$/);
              return <div key={index} data-audience-credential className="group grid min-w-0 grid-cols-[112px_minmax(0,1fr)] items-center gap-x-5 border-t border-[#8FC7C1]/20 py-4 first:border-t-0 md:block md:border-t-0 md:border-l md:px-6 md:py-0 md:first:border-l-0 md:first:pl-0 md:last:pr-0">
                <h3 aria-label={item.title} className="font-display font-medium">
                  {title && <span className={`flex h-20 items-end text-[#35C5BB] leading-none transition-[color,text-shadow] duration-300 lg:group-hover:text-[#9BF8ED] lg:group-hover:[text-shadow:0_0_16px_rgba(53,197,187,0.2)] motion-reduce:transition-none md:h-[104px] ${numeralSizes[title[2]] || "text-[56px] md:text-[80px]"}`}>
                    {/* The shared largest-size strut aligns text baselines, including font descent. */}
                    <span className="flex items-baseline leading-none">
                      <span aria-hidden="true" className="w-0 text-[76px] leading-none md:text-[104px]">{"\u200B"}</span>
                      {title[1] && <span className="mr-2 inline-flex -translate-y-[0.62em]">
                        <span className="whitespace-nowrap text-sm font-bold leading-none text-[#f7f3eb]/55">{title[1]}</span>
                      </span>}
                      <span data-audience-numeral className="m-0 inline-block leading-none">{title[2]}{title[3]}</span>
                    </span>
                  </span>}
                  {!title && <span className="text-sm font-normal text-[#f7f3eb]/55">{item.title}</span>}
                </h3>
                <p className="font-body text-base font-medium leading-[1.4] text-[#f7f3eb] md:mt-3 md:text-xl">{item.subtitle}</p>
              </div>;
            })}
          </div>
      </div>
    </SectionWrapper>
  );
}
