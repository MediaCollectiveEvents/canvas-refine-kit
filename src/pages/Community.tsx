import { communitySeo } from "@/lib/pageSeo";
import { useState } from "react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { ContactForm } from "@/components/shared/LazyEnquiryForms";
import PageHero from "@/components/shared/PageHero";
import PageSection from "@/components/shared/PageSection";
import OrganisationsRepresentedSection from "@/components/shared/OrganisationsRepresentedSection";
import FAQSection from "@/components/sections/FAQSection";
import Seo from "@/components/shared/Seo";
import { Button } from "@/components/ui/button";
import communityContent from "@/content/community.json";
import { AUDIENCE_SNAPSHOT_ID, parseAudienceSnapshot } from "@/lib/audienceSnapshot";

type CommunityContent = Omit<typeof communityContent, "sections"> & {
  sections: ((typeof communityContent.sections)[number] & { buttonLabel?: string })[];
};

export default function Community({ content = communityContent }: { content?: CommunityContent }) {
  const [contactOpen, setContactOpen] = useState(false);
  return <div className="min-h-screen bg-background">
    <Seo {...communitySeo(content)} />
    <Header />
    <ContactForm open={contactOpen} onOpenChange={setContactOpen} />
    <main className="site-header-clearance">
      <PageHero {...content.hero} presentation="public" className="max-sm:!pb-[calc(60vw-1.82rem)]" descriptionClassName="!text-[#9bd3c8]" image="/uploads/website-hero-community.png" />
      {content.sections.map(section => {
        if (section.type === "editorial" && section.id === AUDIENCE_SNAPSHOT_ID) {
          const parsed = parseAudienceSnapshot(section.heading);
          const stats = parsed.issues.length
            ? parseAudienceSnapshot(communityContent.sections.find(item => item.id === AUDIENCE_SNAPSHOT_ID)?.heading).stats
            : parsed.stats;
          return <PageSection key={section.id} id={section.id} className="border-b border-white/10">
          <h2 className="site-eyebrow mb-8 text-[#8FC7C1]">{section.eyebrow}</h2>
          <dl className="grid md:grid-cols-3 md:gap-x-8">
            {stats.map(({ value, label }) => {
              return <div key={label} className="grid min-w-0 grid-cols-[112px_minmax(0,1fr)] items-center gap-x-5 border-t border-white/10 py-5 first:border-t-0 md:flex md:flex-col md:items-start md:gap-3 md:border-0 md:py-0">
                <dt className="order-2 font-body text-base font-medium leading-[1.4] text-[#f7f3eb] md:text-xl">{label}</dt>
                <dd className="order-1 flex items-end font-display text-[48px] font-medium leading-none text-[#35C5BB] md:text-[64px]">{value}</dd>
              </div>;
            })}
          </dl>
          <p className="mt-6 max-w-3xl font-body text-sm leading-[1.6] text-white/65">{section.body}</p>
        </PageSection>; }
        if (section.type === "editorial") return <OrganisationsRepresentedSection key={section.id} section={section} compact={section.id === "curated-attendance"} />;
        if (section.type === "organisations") return <PageSection key={section.id} id={section.id} className="border-b border-white/10">
          <h2 className="site-eyebrow mb-4 text-[#8FC7C1]">{section.eyebrow}</h2>
          <ul className="w-full font-body text-base leading-8 text-[#f7f3eb]">
            {[...(section.organisations ?? [])].sort((a, b) => a.localeCompare(b, "en-GB", { sensitivity: "base" })).map((name, index, names) => <li key={name} className="inline-block">{name}{index < names.length - 1 && <span aria-hidden="true" className="mx-2 text-[#8FC7C1]/60">·</span>}</li>)}
          </ul>
          <p className="mt-6 font-body text-base leading-relaxed text-white/75">{section.body}</p>
        </PageSection>;
        if (section.type === "faq") return <PageSection key={section.id} id={section.id} className="border-b border-white/10">
          <FAQSection expandable compact presentation="editorial" title={section.eyebrow} faqs={section.faqs} />
        </PageSection>;
        if (section.type === "cta") return <PageSection key={section.id} id={section.id}>
          <h2 className="site-heading text-[#f7f3eb]">{section.heading}</h2>
          <p className="mt-5 max-w-[65ch] font-body text-base leading-relaxed text-white/75 md:text-lg">{section.body}</p>
          <Button variant="brand" size="lg" className="mt-6" onClick={() => setContactOpen(true)}>{section.buttonLabel}</Button>
        </PageSection>;
        return null;
      })}
    </main>
    <Footer />
  </div>;
}
