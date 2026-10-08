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

  const numeralSizes: Record<string, string> = {
    "300+": "text-[56px] md:text-[80px]",
    "3": "text-[56px] md:text-[80px]",
    "5": "text-[68px] md:text-[96px]",
    "8": "text-[80px] md:text-[112px]",
  };

  return (
    <SectionWrapper variant="dark" align="left" padding="lux" animateOnScroll={false} className="!bg-[#101d24] text-[#f7f3eb]">
      <div className="relative">
        <div>
          <p className="mb-4 site-eyebrow text-[#8FC7C1]">OUR COMMUNITY</p>
          <h2 className="site-heading !font-medium text-[#f7f3eb]">{section.heading || "In The Room"}</h2>
          <p className="mt-5 text-base leading-[1.5] text-[#f7f3eb]/75">{section.styleTitle?.sub || "Connecting broadcasters, studios and streaming platforms with the technology companies shaping the future of media."}</p>
        </div>
          <div ref={credentialRow} className="mt-6 grid sm:grid-cols-2 lg:grid-cols-4">
            {[{ title: "300+", subtitle: "Companies represented" }, ...highlights].map((item, index) => {
              const title = index === 0 ? ["300+", "", "300+"] : item.title?.match(/^(.*)\s+(\d+)$/);
              return <div key={index} data-audience-credential className="min-w-0 border-t border-[#8FC7C1]/20 py-6 first:border-t-0 sm:border-t-0 sm:border-l sm:px-6 sm:first:border-l-0 sm:first:pl-0 sm:last:pr-0">
                <h3 aria-label={item.title} className="font-display font-medium">
                  {title && <span className={`flex h-[96px] items-end text-[#35C5BB] leading-none md:h-[132px] ${numeralSizes[title[2]] || "text-[56px] md:text-[80px]"}`}>
                    {/* The shared largest-size strut aligns text baselines, including font descent. */}
                    <span className="flex items-baseline leading-none">
                      <span aria-hidden="true" className="w-0 text-[80px] leading-none md:text-[112px]">{"\u200B"}</span>
                      {title[1] && <span className="mr-2 inline-flex -translate-y-[0.62em]">
                        <span className="whitespace-nowrap text-xs font-bold leading-none text-[#f7f3eb]/55">{title[1]}</span>
                      </span>}
                      <span data-audience-numeral className="m-0 inline-block leading-none">{title[2]}</span>
                    </span>
                  </span>}
                  {!title && <span className="text-xs font-normal text-[#f7f3eb]/55">{item.title}</span>}
                </h3>
                <p className="mt-5 min-h-12 font-body text-xl font-semibold leading-[1.3] text-[#f7f3eb] md:text-2xl">{item.subtitle}</p>
              </div>;
            })}
          </div>
          <p className="mt-3 font-body text-sm text-[#f7f3eb]/65">These figures reflect companies represented at our past events, not a guaranteed audience for any individual gathering.</p>
      </div>
    </SectionWrapper>
  );
}
