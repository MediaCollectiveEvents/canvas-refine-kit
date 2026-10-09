import { getOrganisations, getOrganisationById } from "@/lib/organisations";
import { contentImage } from "@/lib/contentImages";
// src/components/sections/PartnersPageRenderer.tsx
import { useReducedMotion } from "framer-motion";
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
    description: "Bring your organisation into relevant conversations across broadcast, streaming, studios and media technology. We curate a thoughtful mix of people and can facilitate introductions, with space for guests to make their own connections.",
  },
  {
    title: "Less work to bring people together",
    description: "Agree the purpose, audience and format with us. We can handle invitations, communications and event delivery within the agreed scope, reducing the organising effort for your team.",
  },
  {
    title: "Shared commitment",
    description: "Supporting an existing gathering can share the cost and operational commitment of bringing people together. Contributions, recognition and programme involvement are agreed individually; particular guests, meetings or speaking roles are not guaranteed.",
  },
];

const sponsorshipTiers = [
  {
    name: "Strategic Partner",
    description: "Work with us across a programme of curated gatherings, with a shared purpose and contribution agreed together.",
    features: [
      "Programme contribution subject to audience relevance and agreement",
      "Branding across promotion, communications and venue signage",
    ],
    highlighted: false,
    accentColor: "lime" as const,
  },
  {
    name: "Industry Sponsor",
    description: "Support a specific event through sponsorship, hosting or a practical contribution.",
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
  const reducedMotion = useReducedMotion();
  const [logosPaused, setLogosPaused] = useState(false);
  const [contactOpen, setContactOpen] = useState(false);
  if (!Array.isArray(sections)) return null;
  const visibleSections = sections.filter(section => !section.hidden);
  return (
    <>
      <ContactForm open={contactOpen} onOpenChange={setContactOpen} context="Partnership enquiry: tell us whether you would like to support an event or develop a gathering together." />
      {visibleSections.map(section => {
        switch (section.type) {
          case "partnersLogos":
            return (
              <PageSection key={section.id ?? section.type} id="partner-community" className="scroll-mt-28 border-b border-white/10 site-surface-dark">
                <JourneyHeading step="The partner community" title="In good company." description="Our events are made possible with the support of these media and technology companies." />
                <div tabIndex={0} role="region" aria-label="Partner logos" className="group overflow-hidden focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#35C5BB]">
                  {/* Equal-width sequences keep the existing half-track animation seamless. */}
                  <div style={{ animationDuration: "160s", animationPlayState: logosPaused ? "paused" : undefined }} className="flex w-max motion-safe:animate-scroll group-hover:[animation-play-state:paused] group-focus-within:[animation-play-state:paused] motion-reduce:w-full motion-reduce:animate-none">
                    {[false, true].map(duplicate => (
                      <ul key={String(duplicate)} aria-hidden={duplicate || undefined}
                        className={`flex shrink-0 gap-3 pr-3 ${duplicate ? "motion-reduce:hidden" : "motion-reduce:grid motion-reduce:w-full motion-reduce:grid-cols-2 motion-reduce:pr-0 sm:motion-reduce:grid-cols-3 lg:motion-reduce:grid-cols-7"}`}>
                        {currentSponsors.map(sponsor => (
                          <li key={sponsor.src} id={!duplicate && sponsor.id && getOrganisationById(sponsor.id) ? `organisation-${sponsor.id}` : undefined} className="flex h-24 w-44 shrink-0 items-center justify-center rounded-sm bg-white p-3 motion-reduce:w-auto">
                            <img src={contentImage(sponsor.src)} alt={duplicate ? "" : sponsor.alt || sponsor.name || "Organisation logo"} loading="lazy" className="h-16 w-full object-contain" />
                          </li>
                        ))}
                      </ul>
                    ))}
                  </div>
                </div>
                {!reducedMotion && <button type="button" aria-pressed={logosPaused} onClick={() => setLogosPaused(value => !value)} className="mt-4 inline-flex min-h-11 items-center font-display text-base font-medium text-[#35C5BB] hover:opacity-80 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#35C5BB]">{logosPaused ? "Resume logo movement" : "Pause logo movement"}</button>}
                <div className="mt-8 space-y-8">
                  {currentSponsors.filter(organisation => organisation.description || organisation.contribution || organisation.website).map(organisation => (
                    <div key={organisation.src}>
                      <h3 className="text-lg font-medium">{organisation.name || organisation.alt}</h3>
                      {organisation.description && <p className="mt-2 text-base text-white/75">{organisation.description}</p>}
                      {organisation.contribution && <p className="mt-2 text-base text-white/75">{organisation.contribution}</p>}
                      {organisation.website && <a href={organisation.website} target="_blank" rel="noopener noreferrer" className="font-display mt-2 inline-flex min-h-11 items-center text-base underline">Visit website ↗</a>}
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
                    <div key={benefit.title} className="border-t border-white/10 pt-6">

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
                <JourneyHeading step="Ways to participate" title="Explore ways to take part." description="Support a specific event or develop a tailored partnership. Scope and recognition are agreed together. Final guest and programme curation remains with The Media Collective; introductions and attendance are not guaranteed. Any sharing of guest information requires explicit consent." />
                <div className="grid gap-8 md:grid-cols-3">
                  {sponsorshipTiers.map(tier => (
                    <article key={tier.name} className="min-w-0 border-t border-white/10 pt-6">
                      <p className="font-display mb-4 text-sm font-medium uppercase tracking-[0.12em] text-[#9bd3c8]">{tier.name === "Strategic Partner" ? "Contribute to the programme" : tier.name === "Industry Sponsor" ? "Support the event" : "Develop a bespoke experience"}</p>
                      <h3 className="font-display text-3xl font-light text-[#f7f3eb]">{tier.name}</h3>
                      <p className="mt-3 text-base md:mt-4 md:min-h-[6rem] leading-relaxed text-slate-300">{tier.description}</p>
                      <p className="mb-3 mt-4 border-t border-white/10 pt-3 md:mb-4 md:mt-6 md:pt-5 font-display text-sm font-medium text-white">Partnership scope</p>
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
