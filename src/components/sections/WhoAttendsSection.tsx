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

  const statementParts = section.statistics?.companies?.split(/(300)/) ?? [];
  const numeralSizes: Record<string, string> = {
    "3": "text-[44px] md:text-[64px]",
    "5": "text-[56px] md:text-[80px]",
    "8": "text-[68px] md:text-[96px]",
  };

  return (
    <SectionWrapper variant="dark" align="left" padding="lux" animateOnScroll={false} className="site-surface-emphasis text-[#f7f3eb]">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 hidden overflow-hidden lg:block">
        <div className="absolute -right-96 -top-96 h-[560px] w-[560px] rounded-full border border-[#8FC7C1]/[0.07]" />
      </div>
      <div className="relative grid items-start gap-10 lg:grid-cols-12 lg:gap-12">
        <div className="lg:col-span-4">
          <p className="mb-4 site-eyebrow text-[#8FC7C1]">OUR COMMUNITY</p>
          <h2 className="site-heading !font-medium text-[#f7f3eb]">{section.heading || "In The Room"}</h2>
          <p className="mt-5 max-w-[40ch] text-sm leading-[1.5] text-[#f7f3eb]/75">{section.styleTitle?.sub || "Connecting broadcasters, studios and streaming platforms with the technology companies shaping the future of media."}</p>
        </div>
        <div className="min-w-0 lg:col-span-8">
          {statementParts.length > 0 && <p className="max-w-2xl font-body text-2xl font-light leading-relaxed text-[#f7f3eb] md:text-[28px]">
            {statementParts.map((part, index) => part === "300" ? <span key={index} className="font-medium text-[#35C5BB]">{part}</span> : part)}
          </p>}
          <div aria-hidden="true" className="relative mb-9 mt-6 hidden grid-cols-3 gap-8 sm:grid">
            <div className="absolute inset-x-[calc(16.666%_-_10.667px)] top-1/2 -translate-y-1/2 h-px bg-[#8FC7C1]/20" />
            {[0, 1, 2].map(node => <span key={node} className="relative mx-auto h-1.5 w-1.5 rounded-full bg-[#8FC7C1]/20" />)}
          </div>
          <div ref={credentialRow} className="mt-8 grid gap-8 sm:mt-0 sm:grid-cols-3 sm:gap-8">
            {highlights.map((item, index) => {
              const title = item.title?.match(/^(.*)\s+(\d+)$/);
              return <div key={index} data-audience-credential>
                <div aria-hidden="true" className="mb-5 h-0.5 w-12 bg-[#35C5BB]" />
                <h3 aria-label={item.title} className="font-display font-medium">
                  <span className="block text-base leading-6 text-[#f7f3eb]">{title ? title[1] : item.title}</span>
                  {title && <span className={`flex h-[78px] items-end text-[#35C5BB] leading-none md:h-[106px] ${numeralSizes[title[2]] || "text-[44px] md:text-[64px]"}`}>
                    {/* The shared largest-size strut aligns text baselines, including font descent. */}
                    <span className="flex items-baseline leading-none">
                      <span aria-hidden="true" className="w-0 text-[68px] leading-none md:text-[96px]">{"\u200B"}</span>
                      <span data-audience-numeral className="relative -left-[0.04em] m-0 inline-block leading-none">{title[2]}</span>
                    </span>
                  </span>}
                </h3>
                <p className="mt-6 min-h-12 text-sm leading-6 text-[#f7f3eb]/75">{item.subtitle}</p>
              </div>;
            })}
          </div>
        </div>
      </div>
    </SectionWrapper>
  );
}
