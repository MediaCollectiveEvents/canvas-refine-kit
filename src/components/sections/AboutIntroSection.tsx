import SectionWrapper from "../layout/SectionWrapper";

interface AboutIntroSectionProps {
  section: { heading?: string; body?: string };
}

export default function AboutIntroSection({ section }: AboutIntroSectionProps) {
  const paragraphs = section.body?.split("\n\n").map(text => text.trim()).filter(Boolean) ?? [];
  return (
    <SectionWrapper variant="dark" padding="lux" animateOnScroll={false} className="!py-12 text-[#f7f3eb] md:!py-[60px] lg:!py-[72px]">
      <div className="grid gap-8 lg:grid-cols-12 lg:gap-10">
        <div className="lg:col-span-4"><h2 className="site-heading !font-medium">{section.heading}</h2></div>
        <div className="max-w-3xl lg:col-span-8">
          {paragraphs.map((paragraph, index) => <p key={paragraph} className={`max-w-[65ch] font-body text-base leading-[1.5] text-[#f7f3eb]/75 md:text-lg ${index === 0 ? "" : "mt-5"}`}>{paragraph}</p>)}
        </div>
      </div>
    </SectionWrapper>
  );
}
