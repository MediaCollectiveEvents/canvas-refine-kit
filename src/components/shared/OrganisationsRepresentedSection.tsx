import PageSection from "./PageSection";

export interface OrganisationsRepresentedContent {
  id?: string;
  eyebrow?: string;
  heading?: string;
  body?: string;
  subheading?: string;
  organisations?: string[];
}

export default function OrganisationsRepresentedSection({ section, compact = false }: { section: OrganisationsRepresentedContent; compact?: boolean }) {
  const paragraphs = section.body?.split(/\n\s*\n/).map(text => text.trim()).filter(Boolean) ?? [];
  return <PageSection id={section.id} className={`border-b border-white/10 bg-background text-[#f7f3eb] ${compact ? "!py-12 md:!py-14" : ""}`}>
    {section.eyebrow && <p className="site-eyebrow mb-4 text-[#8FC7C1]">{section.eyebrow}</p>}
    <div className={compact ? "grid max-w-4xl gap-4 md:grid-cols-[minmax(0,1fr)_minmax(0,2fr)] md:gap-6" : "grid gap-6 lg:grid-cols-12 lg:gap-10"}>
      <h2 className={`site-heading ${compact ? "" : "lg:col-span-4"}`}>{section.heading}</h2>
      <div className={`min-w-0 ${compact ? "space-y-3" : "space-y-5 lg:col-span-8"}`}>
        {section.subheading && <h3 className="font-display text-lg font-medium text-[#f7f3eb]">{section.subheading}</h3>}
        {!!section.organisations?.length && <p className="max-w-[65ch] font-body text-base leading-[1.6] text-[#f7f3eb] md:text-lg">{section.organisations.join(" • ")}</p>}
        {paragraphs.map((paragraph, index) => <p key={index} className={`max-w-[65ch] ${section.id === "community-attendance" ? "lg:max-w-none" : ""} font-body text-base leading-[1.6] md:text-lg ${index === 0 ? "text-[#f7f3eb]" : "text-[#f7f3eb]/75"}`}>{paragraph}</p>)}
      </div>
    </div>
  </PageSection>;
}
