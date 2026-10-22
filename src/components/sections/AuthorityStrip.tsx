import PageSection from "../shared/PageSection";

interface AuthorityContent {
  id?: string;
  eyebrow?: string;
  heading?: string;
  body?: string;
  metrics?: { value: string; label: string }[];
  sectors?: string[];
  locations?: string[];
}

export default function AuthorityStrip({ section }: { section: AuthorityContent }) {
  const itemCount = (section.metrics?.length ?? 0) + Number(!!section.sectors?.length) + Number(!!section.locations?.length);
  if (!itemCount && !section.eyebrow?.trim() && !section.heading?.trim() && !section.body?.trim()) return null;
  return <PageSection id={section.id} className={`border-b border-white/10 ${section.eyebrow ? "" : "!py-8 md:!py-10"}`}>
    {section.eyebrow && (section.heading
      ? <p className="site-eyebrow mb-4 text-[#8FC7C1]">{section.eyebrow}</p>
      : <h2 className="site-eyebrow mb-8 text-[#8FC7C1]">{section.eyebrow}</h2>)}
    {section.heading && <h2 className="site-heading text-[#f7f3eb]">{section.heading}</h2>}
    {section.body?.trim() && <p className={`${section.heading ? "mt-4 " : ""}max-w-[65ch] whitespace-pre-line font-body text-base leading-[1.6] text-white/75 md:text-lg`}>{section.body.trim()}</p>}
    {itemCount > 0 && <dl className={`${section.heading || section.body ? "mt-8 " : ""}grid gap-8 text-[#f7f3eb] sm:grid-cols-2 ${itemCount === 3 ? "lg:grid-cols-3" : "lg:grid-cols-4"}`}>
      {(section.metrics ?? []).map(metric => <div key={metric.label} className="flex flex-col">
        <dt className="order-2 mt-3 font-body text-sm text-white/75">{metric.label}</dt>
        <dd className="order-1 font-display text-4xl font-semibold leading-tight text-[#8FC7C1] md:text-5xl">{metric.value}</dd>
      </div>)}
      {[{ label: "Industry sectors", values: section.sectors }, { label: "Locations", values: section.locations }].filter(group => group.values?.length).map(group => <div key={group.label}>
        <dt className="sr-only">{group.label}</dt>
        <dd className="space-y-1 font-display text-xl leading-snug">{group.values?.map(value => <span key={value} className="block">{value}</span>)}</dd>
      </div>)}
    </dl>}
  </PageSection>;
}
