import SectionWrapper from "../layout/SectionWrapper";
import SectionTitle from "../layout/SectionTitle";

interface AboutIntroSectionProps {
  section: { heading?: string; body?: string };
}

export default function AboutIntroSection({ section }: AboutIntroSectionProps) {
  const paragraphs = section.body?.split("\n\n").map(text => text.trim()).filter(Boolean) ?? [];
  return (
    <SectionWrapper variant="light" padding="lux" className="!pt-12 !pb-6 md:!pt-[60px] md:!pb-[60px] lg:!pt-[72px] lg:!pb-[72px]">
      <div className="grid gap-8 lg:grid-cols-12 lg:gap-10">
        <div className="lg:col-span-4"><span aria-hidden="true" className="mb-5 block h-px w-12 bg-[#27CDBA]" /><SectionTitle align="left" tone="dark" disableEmphasis className="!text-[30px] md:!text-4xl">{section.heading || "What we do"}</SectionTitle></div>
        <div className="max-w-3xl lg:col-span-8">
          {paragraphs.map((paragraph, index) => <p key={paragraph} className={index === 0 ? "font-body text-xl font-normal leading-relaxed text-slate-800 md:text-2xl" : "mt-5 max-w-2xl text-base leading-relaxed text-slate-600"}>{paragraph}</p>)}
        </div>
      </div>
    </SectionWrapper>
  );
}
