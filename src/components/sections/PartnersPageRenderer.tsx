// src/components/sections/PartnersPageRenderer.tsx
import React from "react";

import PageSection from "@/components/shared/PageSection";
import { Button } from "@/components/ui/button";
import { ArrowRight, Users, Eye, Mic, Check } from "lucide-react";

// Sponsor logo imports (your original list)
import giantWorldwideLogo from "@/assets/sponsors/giant-worldwide.png";
import mrMxfLogo from "@/assets/sponsors/mr-mxf.png";
import invenioLsiLogo from "@/assets/sponsors/invenio-lsi.png";
import matrixLogo from "@/assets/sponsors/matrix.png";
import lucidlinkLogo from "@/assets/sponsors/lucidlink.png";
import utoSolutionsLogo from "@/assets/sponsors/uto-solutions.png";
import broadviewSoftwareLogo from "@/assets/sponsors/broadview-software.png";
import convergentIdsLogo from "@/assets/sponsors/convergent-ids.png";
import wagadaDigitalLogo from "@/assets/sponsors/wagada-digital.png";
import uhdAllianceLogo from "@/assets/sponsors/uhd-alliance.png";
import rarecrewLogo from "@/assets/sponsors/rarecrew.png";
import dceAgencyLogo from "@/assets/sponsors/dce-agency.png";
import uicDigitalLogo from "@/assets/sponsors/uic-digital.png";
import rsgMediaLogo from "@/assets/sponsors/rsg-media.png";

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

const currentSponsors = [
  { name: "BroadView Software", logo: broadviewSoftwareLogo },
  { name: "Convergent IDS", logo: convergentIdsLogo },
  { name: "DCe Agency", logo: dceAgencyLogo },
  { name: "Giant Worldwide", logo: giantWorldwideLogo },
  { name: "Invenio LSI", logo: invenioLsiLogo },
  { name: "LucidLink", logo: lucidlinkLogo },
  { name: "Matrix", logo: matrixLogo },
  { name: "Mr MXF", logo: mrMxfLogo },
  { name: "Rarecrew", logo: rarecrewLogo },
  { name: "RSG Media", logo: rsgMediaLogo },
  { name: "UHD Alliance", logo: uhdAllianceLogo },
  { name: "UIC Digital", logo: uicDigitalLogo },
  { name: "UTO Solutions", logo: utoSolutionsLogo },
  { name: "Wagada Digital", logo: wagadaDigitalLogo },
];

const benefits = [
  {
    icon: Users,
    title: "Who you can connect with",
    description: "Our community spans broadcast, streaming, studios, content and media technology, including founders and senior decision-makers across technology, content, operations and commercial strategy. Each event audience is curated for relevance.",
  },
  {
    icon: Mic,
    title: "How we create the programme",
    description: "The Media Collective manages event logistics, content creation and audience curation. Partners bring their vision, brand assets and ideal customer profile. Programme themes and format are developed collaboratively.",
  },
  {
    icon: Eye,
    title: "What your partnership can include",
    description: "Agreed scope may include branding across promotion and communications, digital signage and venue branding, an Eventbrite logo, profile and guest link where applicable, and category exclusivity where agreed.",
  },
];

const sponsorshipTiers = [
  {
    name: "Strategic Partner",
    description: "OFF AIR package example: help shape the programme and contribute a featured perspective, with topic and format agreed together.",
    features: [
      "Featured speaking role subject to event fit and agreement",
      "Up to 20 guest places in this example package",
      "Prominent branding across promotion, communications and venue signage",
      "Eventbrite logo, profile and guest link where applicable",
      "Category exclusivity where agreed",
      "Registration and attendance updates, subject to guest permissions",
    ],
    highlighted: false,
    accentColor: "lime" as const,
  },
  {
    name: "Industry Sponsor",
    description: "OFF AIR package example: support the event and participate in audience-led discussions, without an automatic speaking slot.",
    features: [
      "Participation in audience-led discussions",
      "Up to 10 guest places in this example package",
      "Branding across promotion, communications and venue signage",
      "Eventbrite logo, profile and guest link where applicable",
      "Category exclusivity where agreed",
      "Registration and attendance updates, subject to guest permissions",
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
      "Partner vision, brand assets and ideal customer profile",
      "Event logistics and content creation managed by The Media Collective",
      "Branding and venue requirements agreed together",
      "Guest allocations and programme participation agreed for the event",
    ],
    highlighted: false,
    accentColor: "red" as const,
  },
];

const sectionLinks: Record<string, { label: string; anchor: string }> = {
  partnersLogos: { label: "Partner community", anchor: "partner-community" },
  partnersBenefits: { label: "Audience and delivery", anchor: "partner-objectives" },
  partnersTiers: { label: "Compare formats", anchor: "partner-formats" },
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
                    <li key={sponsor.name} className="flex h-24 items-center justify-center rounded-sm bg-white p-3">
                      <img src={sponsor.logo} alt={sponsor.name} loading="lazy" className="h-16 w-full object-contain" />
                    </li>
                  ))}
                </ul>
              </PageSection>
            );
          case "partnersBenefits":
            return (
              <PageSection key={section.id ?? section.type} id="partner-objectives" className="scroll-mt-28 border-b border-white/10 bg-none bg-[#101d24] py-16 md:py-20">
                <JourneyHeading step="Audience and delivery" title="Turn your vision into a shared programme." description="Connect with relevant industry decision-makers through a programme developed with The Media Collective. Start with the audience, shape the conversation together and agree the delivery scope." />
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
                <JourneyHeading step="Compare the formats" title="Choose how you want to take part." description="Standard partnership packages exist, and custom packages may be considered. The Strategic Partner and Industry Sponsor cards illustrate the OFF AIR proposal package model; guest allocations and inclusions are confirmed for each event. Registration and attendance updates may include guest names, roles, companies and LinkedIn URLs where available and where registration permissions allow. Sharing remains subject to explicit consent and our privacy policy." />
                <div className="grid gap-4 md:grid-cols-3">
                  {sponsorshipTiers.map(tier => (
                    <article key={tier.name} className="rounded-lg border border-white/20 bg-white/[0.03] p-6 lg:p-8">
                      <p className="mb-4 text-[11px] font-medium uppercase tracking-[0.12em] text-[#9bd3c8]">{tier.name === "Strategic Partner" ? "Example: help shape the programme" : tier.name === "Industry Sponsor" ? "Example: join the discussion" : "Develop a bespoke experience"}</p>
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
                  <p className="max-w-xl text-sm leading-relaxed text-slate-300">Have a format in mind? Tell us your audience, objectives and timing so we can discuss the right scope.</p>
                  <Button variant="brand" size="lg" onClick={onRegister} className="shrink-0">Discuss a partnership <ArrowRight aria-hidden="true" className="ml-3 h-4 w-4" /></Button>
                </div>
              </PageSection>
            );
          case "joinUs":
            return (
              <PageSection key={section.id ?? section.type} id="partner-conversation" className="scroll-mt-28 bg-none bg-[#172b31] py-16 md:py-20">
                <div className="grid gap-10 md:grid-cols-[1.5fr_1fr] md:items-start">
                  <div>
                    <JourneyHeading step="Start a conversation" title="Bring us your brief." description="Tell us who you want to connect with and what you want to achieve. The Media Collective will make contact and arrange an introductory call within 3 working days." />
                    <Button variant="brand" size="lg" onClick={onRegister}>Discuss a partnership</Button>
                  </div>
                  <div className="border-l border-white/20 pl-6">
                    <h3 className="mb-5 text-sm font-semibold text-white">Useful to have in mind</h3>
                    <ul className="space-y-4 text-sm leading-relaxed text-slate-300">
                      <li>Your ideal customer profile</li>
                      <li>Your vision, business goal and brand assets</li>
                      <li>Your preferred event format and timing</li>
                    </ul>
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
