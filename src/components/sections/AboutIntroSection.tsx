import SectionWrapper from "../layout/SectionWrapper";

interface AboutIntroSectionProps {
  section: { heading?: string; body?: string };
}

export default function AboutIntroSection({ section }: AboutIntroSectionProps) {
  const paragraphs = section.body?.split("\n\n").map(text => text.trim()).filter(Boolean) ?? [];
  return (
    <SectionWrapper variant="dark" padding="lux" animateOnScroll={false} className="!pt-12 !pb-0 text-[#f7f3eb] md:!pt-[60px] lg:!pt-[72px]">
      <div className="grid gap-8 border-b border-white/10 pb-12 md:pb-[60px] lg:grid-cols-12 lg:gap-10 lg:pb-[72px]">
        <div className="lg:col-span-4"><h2 className="site-heading !font-medium">{section.heading}</h2></div>
        <div className="max-w-3xl lg:max-w-none lg:col-span-8">
          {paragraphs.map((paragraph, index) => <p key={paragraph} className={`max-w-[65ch] lg:max-w-none font-body leading-[1.5] ${index === 0 ? "text-lg font-semibold text-[#f7f3eb] md:text-xl" : "mt-5 text-base font-normal text-[#f7f3eb]/75 md:text-lg"}`}>{paragraph}</p>)}
        </div>
      </div>
    </SectionWrapper>
  );
}
