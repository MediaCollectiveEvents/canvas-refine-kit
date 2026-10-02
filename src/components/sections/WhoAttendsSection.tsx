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
  const statements = Object.values(section.statistics ?? {}).filter(
    (value): value is string => typeof value === "string" && /[a-z0-9]/i.test(value)
  );
  const highlights = (section.highlights ?? []).filter(item => item.title || item.subtitle);

  return (
    <SectionWrapper variant="transparent" align="left" padding="lux" className="text-slate-900">
      <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.16em] text-teal-700">Audience credentials</p>
          <SectionTitle align="left" tone="dark" disableEmphasis>
            {section.heading || "Who attends"}
          </SectionTitle>
        </div>
        <p className="max-w-xs text-sm leading-relaxed text-slate-600">A cross-section of the media and technology industry.</p>
      </div>
      <div className="grid gap-4 md:grid-cols-4">
        {statements.length > 0 && (
          <div className="flex flex-col justify-center rounded-lg border border-[#cbd8d3] bg-[#e7eeea] p-7 md:col-span-2 md:row-span-2 md:p-10">
            <p className="mb-5 text-xs uppercase tracking-[0.16em] text-teal-800">Across our events</p>
            {statements.map((statement, index) => (
              <p key={index} className="mb-3 max-w-[32ch] font-display text-2xl font-light leading-snug text-slate-900 last:mb-0 md:text-4xl">{statement}</p>
            ))}
          </div>
        )}
        {highlights.map((item, index) => (
          <div key={index} className={`flex min-h-[140px] md:min-h-[180px] flex-col justify-between rounded-lg border border-slate-200 bg-white/70 p-5 md:p-7 ${index === 0 ? "md:col-span-2" : ""}`}>
            <span aria-hidden="true" className="mb-3 h-px md:mb-7 w-8 bg-teal-700" />
            <div>
              <h3 className="font-display text-3xl font-light leading-tight text-slate-900">{item.title}</h3>
              <p className="mt-3 text-sm leading-relaxed text-slate-600">{item.subtitle}</p>
            </div>
          </div>
        ))}
      </div>
    </SectionWrapper>
  );
}
