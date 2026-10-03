import { getOrganisations, getRelatedArticles, getOrganisationById } from "@/lib/organisations";
import { contentImage } from "@/lib/contentImages";
import posts from "@/content/blogPosts.json";
// src/components/sections/PartnersPageRenderer.tsx
import React from "react";

import PageSection from "@/components/shared/PageSection";
import { Button } from "@/components/ui/button";
import { ArrowRight, Users, Eye, Mic, Check } from "lucide-react";

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
    icon: Users,
    title: "Who you can connect with",
    description: "Our community spans broadcast, streaming, studios, content and media technology, including founders and senior decision-makers across technology, content, operations and commercial strategy. Each event audience is curated for relevance.",
  },
  {
    icon: Mic,
    title: "How we create the programme",
    description: "The Media Collective manages event logistics, content creation and audience curation. Programme themes and format are developed collaboratively.",
  },
  {
    icon: Eye,
    title: "What your partnership can include",
    description: "Partnerships may include programme participation and branding across event promotion, communications and the venue. Inclusions are agreed for each event.",
  },
];

const sponsorshipTiers = [
  {
    name: "Strategic Partner",
    description: "Contribute to the programme, with any featured speaking role, topic and format agreed together.",
    features: [
      "Featured speaking role subject to event fit and agreement",
      "Branding across promotion, communications and venue signage",
    ],
    highlighted: false,
    accentColor: "lime" as const,
  },
  {
    name: "Industry Sponsor",
    description: "Support the event, with opportunities to participate in audience-led discussions agreed for the programme.",
    features: [
      "Participation in audience-led discussions, subject to agreement",
      "Branding across promotion, communications and venue signage",
    ],
    highlighted: true,
    accentColor: "cyan" as const,
  },
  {
    name: "Custom Event",
    description: "Develop a bespoke event with The Media Collective, only where it is a good fit for the community. Scope and deliverables are agreed collaboratively.",
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
  joinUs: { label: "Start a conversation", anchor: "partner-conversation" },
};

function JourneyHeading({ step, title, description }: { step: string; title: string; description: string }) {
  return (
    <div className="mb-10 max-w-2xl">
      <p className="mb-3 text-xs font-medium uppercase tracking-[0.16em] text-[#9bd3c8]">{step}</p>
      <h2 className="font-display text-3xl font-light leading-tight text-[#f7f3eb] md:text-4xl">{title}</h2>
      <p className="mt-4 text-sm leading-[1.8] text-slate-300">{description}</p>
    </div>
  );
}

export default function PartnersPageRenderer({ sections, onRegister }: PartnersPageRendererProps) {
  if (!Array.isArray(sections)) return null;
  const visibleSections = sections.filter(section => !section.hidden);
  return (
    <>
      <nav aria-label="Partnership guide" className="border-y border-white/15 bg-[#101d24] px-6 py-5">
        <div className="mx-auto flex max-w-6xl flex-wrap gap-x-8 gap-y-4">
          {visibleSections.map(section => {
            const link = sectionLinks[section.type];
            return link ? <a key={section.id ?? section.type} href={`#${link.anchor}`} className="text-xs font-medium text-slate-200 underline-offset-4 hover:text-white hover:underline">{link.label} <span aria-hidden="true">↗</span></a> : null;
          })}
        </div>
      </nav>
      {visibleSections.map(section => {
        switch (section.type) {
          case "partnersLogos":
            return (
              <PageSection key={section.id ?? section.type} id="partner-community" className="scroll-mt-28 border-b border-white/10 bg-none bg-[#101d24] py-16 md:py-20">
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
                      {organisation.website && <a href={organisation.website} target="_blank" rel="noopener noreferrer" className="mt-2 inline-block text-sm underline">Visit website ↗</a>}
                      {organisation.id && getRelatedArticles(organisation.id, posts.posts).map(article => <p key={article.slug} className="mt-2"><a className="text-sm underline" href={`/blog/${article.slug}`}>{article.title}</a></p>)}
                    </div>
                  ))}
                </div>
              </PageSection>
            );
          case "partnersBenefits":
            return (
              <PageSection key={section.id ?? section.type} id="partner-objectives" className="scroll-mt-28 border-b border-white/10 bg-none bg-[#101d24] py-16 md:py-20">
                <JourneyHeading step="Audience and delivery" title="Develop a programme together." description="We develop the programme together, considering the audience, subject and format." />
                <div className="grid gap-8 md:grid-cols-3">
                  {benefits.map(benefit => (
                    <div key={benefit.title} className="border-t border-[#9bd3c8]/40 pt-6">
                      <benefit.icon aria-hidden="true" className="mb-5 h-6 w-6 text-[#9bd3c8]" />
                      <h3 className="mb-3 text-lg font-medium text-white">{benefit.title}</h3>
                      <p className="max-w-sm text-sm leading-[1.8] text-slate-300">{benefit.description}</p>
                    </div>
                  ))}
                </div>
              </PageSection>
            );
          case "partnersTiers":
            return (
              <PageSection key={section.id ?? section.type} id="partner-formats" className="scroll-mt-28 border-b border-white/10 bg-none bg-[#101d24] py-16 md:py-20">
                <JourneyHeading step="Ways to participate" title="Explore ways to take part." description="Partnership opportunities vary by event. These formats outline possible ways to participate; scope and inclusions are agreed directly. Any sharing of guest information remains subject to explicit consent and our privacy policy." />
                <div className="grid gap-4 md:grid-cols-3">
                  {sponsorshipTiers.map(tier => (
                    <article key={tier.name} className="rounded-lg border border-white/20 bg-white/[0.03] p-6 lg:p-8">
                      <p className="mb-4 text-[11px] font-medium uppercase tracking-[0.12em] text-[#9bd3c8]">{tier.name === "Strategic Partner" ? "Contribute to the programme" : tier.name === "Industry Sponsor" ? "Support the event" : "Develop a bespoke experience"}</p>
                      <h3 className="font-display text-3xl font-light text-[#f7f3eb]">{tier.name}</h3>
                      <p className="mt-3 text-sm md:mt-4 md:min-h-[4.5rem] leading-relaxed text-slate-300">{tier.description}</p>
                      <p className="mb-3 mt-4 border-t border-white/15 pt-3 md:mb-4 md:mt-6 md:pt-5 text-xs font-medium text-white">Partnership scope</p>
                      <ul className="space-y-2.5 md:space-y-4">
                        {tier.features.map(feature => <li key={feature} className="flex items-start gap-3 text-sm leading-relaxed text-slate-300"><Check aria-hidden="true" className="mt-1 h-3.5 w-3.5 shrink-0 text-[#9bd3c8]" />{feature}</li>)}
                      </ul>
                    </article>
                  ))}
                </div>
                <div className="mt-8 flex flex-col items-start justify-between gap-6 border-t border-white/15 pt-6 sm:flex-row sm:items-center">
                  <p className="max-w-xl text-sm leading-relaxed text-slate-300">Tell us about the gathering you have in mind.</p>
                  <Button variant="brand" size="lg" onClick={onRegister} className="shrink-0">Discuss a partnership <ArrowRight aria-hidden="true" className="ml-3 h-4 w-4" /></Button>
                </div>
              </PageSection>
            );
          case "joinUs":
            return (
              <PageSection key={section.id ?? section.type} id="partner-conversation" className="scroll-mt-28 bg-none bg-[#172b31] py-16 md:py-20">
                <div className="max-w-2xl">
                  <div>
                    <JourneyHeading step="Start a conversation" title="Discuss a partnership." description="Tell us about the gathering you have in mind. We’ll follow up to discuss the possibilities." />
                    <Button variant="brand" size="lg" onClick={onRegister}>Discuss a partnership</Button>
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
