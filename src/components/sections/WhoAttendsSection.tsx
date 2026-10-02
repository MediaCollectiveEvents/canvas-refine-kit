import SectionWrapper from "../layout/SectionWrapper";
import SectionTitle from "../layout/SectionTitle";

interface WhoAttendsSectionProps {
  section?: {
    heading?: string;
    statistics?: { companies?: string; boardLevel?: string; founders?: string };
    highlights?: { title?: string; subtitle?: string; icon?: string }[];
  };
}

export default function WhoAttendsSection({ section = {} }: WhoAttendsSectionProps) {
  const highlights = (section.highlights ?? []).filter(item => item.title || item.subtitle);

  return (
    <SectionWrapper variant="light" align="left" padding="lux" className="!bg-[#eef4f2] text-slate-900 !py-10 md:!py-[60px] lg:!py-[72px]">
      <div className="grid gap-6 lg:grid-cols-12 lg:gap-8">
        <div className="lg:col-span-4">
          <p className="mb-3 text-xs font-normal uppercase tracking-[0.12em] text-slate-500">Audience credentials</p>
          <SectionTitle align="left" tone="dark" disableEmphasis className="!text-[30px] md:!text-4xl">{section.heading || "Who attends"}</SectionTitle>
          <p className="max-w-sm text-base leading-relaxed text-slate-600">A cross-section of the media and technology industry.</p>
        </div>
        <div className="grid content-start gap-6 sm:grid-cols-3 lg:col-span-8">
          {highlights.map((item, index) => <div key={index}>
            <h3 className="font-body text-xl font-normal leading-snug md:text-2xl">{item.title}</h3>
            <p className="mt-2 text-sm text-slate-600">{item.subtitle}</p>
          </div>)}
        </div>
      </div>
    </SectionWrapper>
  );
}
