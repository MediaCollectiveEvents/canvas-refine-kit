import { getOrganisations, getRelatedArticles, getOrganisationById } from "@/lib/organisations";
import { contentImage } from "@/lib/contentImages";
import posts from "@/content/blogPosts.json";
// src/components/sections/PartnersPageRenderer.tsx
import React, { useState } from "react";
import ContactForm from "@/components/ContactForm";

import PageSection from "@/components/shared/PageSection";
import { Button } from "@/components/ui/button";


// Sponsor logo imports (your original list)

interface BaseSection {
  id?: string;
  type: string;
  hidden?: boolean;
}

interface PartnersPageRendererProps {
  sections?: BaseSection[];
  onRegister: () => void;
}

// ===== CONTENT ARRAYS FROM ORIGINAL Partners.tsx =====

const currentSponsors = getOrganisations();

const benefits = [
  {
    title: "Who you can connect with",
    description: "Our community spans broadcast, streaming, studios, content and media technology, including founders and senior decision-makers across technology, content, operations and commercial strategy. Each event audience is curated for relevance.",
  },
  {
    title: "Less work to bring people together",
    description: "Work with us on the purpose, audience and format. The agreed scope can include invitations, communications and event delivery, reducing the organising effort for your team. Final guest and programme curation remains with The Media Collective.",
  },
  {
    title: "Shared commitment",
    description: "Supporting an existing gathering can share the cost and operational commitment of bringing people together. Contributions, recognition and programme involvement are agreed individually; particular guests, meetings or speaking roles are not guaranteed.",
  },
];

const sponsorshipTiers = [
  {
    name: "Strategic Partner",
    description: "Build relationships through relevant, carefully curated gatherings, with purpose and participation agreed together.",
    features: [
      "Programme contribution subject to audience relevance and agreement",
      "Branding across promotion, communications and venue signage",
    ],
    highlighted: false,
    accentColor: "lime" as const,
  },
  {
    name: "Industry Sponsor",
    description: "Help make a gathering possible through sponsorship, hosting or practical support.",
    features: [
      "Contribution and recognition agreed for the event",
      "Branding across promotion, communications and venue signage",
    ],
    highlighted: true,
    accentColor: "cyan" as const,
  },
  {
    name: "Custom Event",
    description: "Develop a gathering around a relevant audience, subject and format.",
    features: [
      "Programme themes and format developed together",
      "Audience curated around relevance and community fit",
      "Event logistics and content creation managed by The Media Collective",
      "Branding and venue requirements agreed together",
      "Programme participation agreed for the event",
    ],
    highlighted: false,
    accentColor: "red" as const,
  },
];

const sectionLinks: Record<string, { label: string; anchor: string }> = {
  partnersLogos: { label: "Partner community", anchor: "partner-community" },
  partnersBenefits: { label: "Audience and delivery", anchor: "partner-objectives" },
  partnersTiers: { label: "Ways to participate", anchor: "partner-formats" },
  joinUs: { label: "Contact us", anchor: "partner-conversation" },
};

function JourneyHeading({ step, title, description }: { step: string; title: string; description: string }) {
  return (
    <div className="mb-10 max-w-2xl">
      <p className="mb-3 site-eyebrow text-[#9bd3c8]">{step}</p>
      <h2 className="site-heading text-[#f7f3eb]">{title}</h2>
      <p className="mt-4 text-base leading-[1.6] text-slate-300">{description}</p>
    </div>
  );
}

export default function PartnersPageRenderer({ sections }: PartnersPageRendererProps) {
  const [contactOpen, setContactOpen] = useState(false);
  if (!Array.isArray(sections)) return null;
  const visibleSections = sections.filter(section => !section.hidden);
  return (
    <>
      <ContactForm open={contactOpen} onOpenChange={setContactOpen} />
      <nav aria-label="Partnership guide" className="border-y border-white/15 bg-[#101d24] px-6 py-5">
        <div className="mx-auto flex max-w-6xl flex-wrap gap-x-8 gap-y-4">
          {visibleSections.map(section => {
            const link = sectionLinks[section.type];
            if (section.type === "joinUs" && link) return <button key={section.id ?? section.type} type="button" onClick={() => setContactOpen(true)} className="font-display text-xs font-medium text-slate-200 underline-offset-4 hover:text-white hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary">{link.label}</button>;
            return link ? <a key={section.id ?? section.type} href={`#${link.anchor}`} className="text-xs font-medium text-slate-200 underline-offset-4 hover:text-white hover:underline">{link.label}</a> : null;
          })}
        </div>
      </nav>
      {visibleSections.map(section => {
        switch (section.type) {
          case "partnersLogos":
            return (
              <PageSection key={section.id ?? section.type} id="partner-community" className="scroll-mt-28 border-b border-white/10 site-surface-dark">
                <JourneyHeading step="The partner community" title="In good company." description="Our events are made possible with the support of these media and technology companies." />
                <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-7">
                  {currentSponsors.map(sponsor => (
                    <li key={sponsor.src} id={sponsor.id && getOrganisationById(sponsor.id) ? `organisation-${sponsor.id}` : undefined} className="flex h-24 items-center justify-center rounded-sm bg-white p-3">
                      <img src={contentImage(sponsor.src)} alt={sponsor.alt || sponsor.name || "Organisation logo"} loading="lazy" className="h-16 w-full object-contain" />
                    </li>
                  ))}
                </ul>
                <div className="mt-8 space-y-8">
                  {currentSponsors.filter(organisation => organisation.description || organisation.contribution || organisation.website || (organisation.id && getRelatedArticles(organisation.id, posts.posts).length)).map(organisation => (
                    <div key={organisation.src}>
                      <h3 className="text-lg font-medium">{organisation.name || organisation.alt}</h3>
                      {organisation.description && <p className="mt-2 text-sm text-white/75">{organisation.description}</p>}
                      {organisation.contribution && <p className="mt-2 text-sm text-white/75">{organisation.contribution}</p>}
                      {organisation.website && <a href={organisation.website} target="_blank" rel="noopener noreferrer" className="font-display mt-2 inline-block text-sm underline">Visit website ↗</a>}
                      {organisation.id && getRelatedArticles(organisation.id, posts.posts).map(article => <p key={article.slug} className="mt-2"><a className="text-sm underline" href={`/blog/${article.slug}`}>{article.title}</a></p>)}
                    </div>
                  ))}
                </div>
              </PageSection>
            );
          case "partnersBenefits":
            return (
              <PageSection key={section.id ?? section.type} id="partner-objectives" className="scroll-mt-28 border-b border-white/10 site-surface-dark">
                <JourneyHeading step="Audience and delivery" title="Develop a programme together." description="A trusted setting for relationship building, with shared commitment and less organising effort for your team." />
                <div className="grid gap-8 md:grid-cols-3">
                  {benefits.map(benefit => (
                    <div key={benefit.title} className="border-t border-[#9bd3c8]/40 pt-6">

                      <h3 className="mb-3 text-lg font-medium text-white">{benefit.title}</h3>
                      <p className="max-w-sm text-base leading-[1.6] text-slate-300">{benefit.description}</p>
                    </div>
                  ))}
                </div>
              </PageSection>
            );
          case "partnersTiers":
            return (
              <PageSection key={section.id ?? section.type} id="partner-formats" className="scroll-mt-28 border-b border-white/10 site-surface-dark">
                <JourneyHeading step="Ways to participate" title="Explore ways to take part." description="Explore the formats below. Programme participation, branding and scope are agreed for each event. Any sharing of guest information requires explicit consent." />
                <div className="grid gap-4 md:grid-cols-3">
                  {sponsorshipTiers.map(tier => (
                    <article key={tier.name} className="min-w-0 border-t border-[#8FC7C1]/30 pt-6">
                      <p className="font-display mb-4 text-[11px] font-medium uppercase tracking-[0.12em] text-[#9bd3c8]">{tier.name === "Strategic Partner" ? "Contribute to the programme" : tier.name === "Industry Sponsor" ? "Support the event" : "Develop a bespoke experience"}</p>
                      <h3 className="font-display text-3xl font-light text-[#f7f3eb]">{tier.name}</h3>
                      <p className="mt-3 text-base md:mt-4 md:min-h-[6rem] leading-relaxed text-slate-300">{tier.description}</p>
                      <p className="mb-3 mt-4 border-t border-white/15 pt-3 md:mb-4 md:mt-6 md:pt-5 font-display text-xs font-medium text-white">Partnership scope</p>
                      <ul className="space-y-2.5 md:space-y-4">
                        {tier.features.map(feature => <li key={feature} className="text-base leading-relaxed text-slate-300">{feature}</li>)}
                      </ul>
                    </article>
                  ))}
                </div>

              </PageSection>
            );
          case "joinUs":
            return (
              <PageSection key={section.id ?? section.type} id="partner-conversation" className="scroll-mt-28 site-surface-emphasis">
                <div className="max-w-2xl">
                  <div>
                    <JourneyHeading step="Partner with us" title="Discuss a partnership." description="Tell us about the gathering you have in mind. We’ll follow up to discuss the possibilities." />
                    <Button variant="brand" size="lg" onClick={() => setContactOpen(true)}>Discuss a partnership</Button>
                  </div>
                </div>
              </PageSection>
            );
          default:
            return null;
        }
      })}
    </>
  );
}
