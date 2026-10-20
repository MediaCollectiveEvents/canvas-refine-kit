import ContextualText from "@/components/shared/ContextualText";
import { COMMUNITY_CONTEXT_LINKS } from "@/lib/contextualLinks";
import ClosingCTA from "@/components/shared/ClosingCTA";
import { getOrganisations, getOrganisationById } from "@/lib/organisations";
import { contentImage } from "@/lib/contentImages";
// src/components/sections/PartnersPageRenderer.tsx
import { useReducedMotion } from "framer-motion";
import React, { useState } from "react";
import OurEventsSection from "./OurEventsSection";
import AuthorityStrip from "./AuthorityStrip";

import PageSection from "@/components/shared/PageSection";
import OrganisationsRepresentedSection from "@/components/shared/OrganisationsRepresentedSection";
import { Button } from "@/components/ui/button";


interface BaseSection {
  id?: string;
  type: string;
  hidden?: boolean;
  eyebrow?: string;
  heading?: string;
  body?: string;
  blocks?: { title: string; description?: string }[];
  cta?: { label: string; url: string };
}

interface PartnersPageRendererProps {
  sections?: BaseSection[];
  onRegister: () => void;
}

const currentSponsors = getOrganisations();

// Optical sizing compensates for whitespace already present in the source files.
// CMS order/content and the original artwork remain unchanged.
const logoScale: Record<string, number> = {
  "BroadView Software": 1.6, "Convergent IDS": 1.75, "DCe Agency": 1.7,
  "Giant Worldwide": 1.3, "Invenio LSI": 1.2, "LucidLink": 1.6,
  "Matrix": 1.85, "Mr MXF": 1.1, "Rarecrew": 1.7, "RSG Media": 1.35,
  "UHD Alliance": 1.7, "UIC Digital": 1.6, "UTO Solutions": 1.2,
  "Wagada Digital": 1.6, "Caretta Research": 0.9, "decodeTV": 0.9,
  "Fabric": 1.55, "FOO Engine": 1.35, "G&L": 0.9,
  "Markham Digital Media": 1.1, "modula media": 1.5, "NetActuate": 0.9,
  "Norsk": 1.1, "realitech": 1.5, "Red5": 0.9, "Rightsline": 1.6,
  "Testronic": 1.6,
};

function JourneyHeading({ step, title, description, className = "mb-10" }: { step?: string; title?: string; description?: string; className?: string }) {
  return (
    <div className={`${className} max-w-2xl`}>
      {step && (title ? <p className="mb-3 site-eyebrow text-[#9bd3c8]">{step}</p> : <h2 className="mb-3 site-eyebrow text-[#9bd3c8]">{step}</h2>)}
      {title && <h2 className="site-heading text-[#f7f3eb]">{title}</h2>}
      {description && <p className="font-body mt-4 text-base leading-[1.6] text-slate-300">{description}</p>}
    </div>
  );
}

export default function PartnersPageRenderer({ sections }: PartnersPageRendererProps) {
  const reducedMotion = useReducedMotion();
  const [logosPaused, setLogosPaused] = useState(false);
  if (!Array.isArray(sections)) return null;
  const visibleSections = sections.filter(section => !section.hidden);
  return (
    <>
      {visibleSections.map(section => {
        switch (section.type) {
          case "authorityStrip":
            return <AuthorityStrip key={section.id ?? section.type} section={section as React.ComponentProps<typeof AuthorityStrip>["section"]} />;
          case "partnerProcess":
            return <PageSection key={section.id ?? section.type} id={section.id} className="site-section-compact border-b border-white/10 bg-background">
              <JourneyHeading step={section.eyebrow} title={section.heading} />
              <ol className="max-w-4xl divide-y divide-white/10 text-[#f7f3eb]">
                {section.blocks?.map((step, index) => <li key={step.title} className="grid grid-cols-[auto_minmax(0,1fr)] gap-x-4 gap-y-2 py-5 first:pt-0 last:pb-0 md:grid-cols-[2rem_minmax(0,18rem)_minmax(0,1fr)] md:gap-x-6">
                  <p aria-hidden="true" className="font-display text-xl font-semibold text-[#8FC7C1]">{index + 1}</p>
                  <h3 className="font-display text-xl font-medium"><span className="sr-only">Step {index + 1}: </span>{step.title}</h3>
                  <p className="max-w-[65ch] font-body text-base leading-relaxed text-slate-300 col-start-2 md:col-start-auto">{step.description}</p>
                </li>)}
              </ol>
            </PageSection>;
          case "ourEvents":
            return <OurEventsSection presentation="editorial" key={section.id ?? section.type} section={section as React.ComponentProps<typeof OurEventsSection>["section"]} />;
          case "organisationsRepresented":
            return <OrganisationsRepresentedSection key={section.id ?? section.type} section={section as React.ComponentProps<typeof OrganisationsRepresentedSection>["section"]} />;
          case "partnersLogos":
            return (
              <PageSection key={section.id ?? section.type} id="partner-community" className="scroll-mt-28 border-b border-white/10 bg-background">
                <JourneyHeading step="THE PARTNER COMMUNITY" title="In good company." description={section.body} />
                <div tabIndex={0} role="region" aria-label="Partner logos" aria-keyshortcuts="Space" aria-description={reducedMotion ? undefined : logosPaused ? "Logo movement paused. Press Space to resume." : "Press Space to pause logo movement."}
                  onKeyDown={event => { if (!reducedMotion && event.target === event.currentTarget && event.key === " ") { event.preventDefault(); setLogosPaused(value => !value); } }} className="group overflow-hidden rounded-2xl focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#35C5BB]">
                  {/* Equal-width sequences keep the existing half-track animation seamless. */}
                  <div style={{ animationDuration: "53.333333s", animationPlayState: logosPaused ? "paused" : undefined }} className="flex w-max motion-safe:animate-scroll group-hover:[animation-play-state:paused] group-focus-within:[animation-play-state:paused] motion-reduce:w-full motion-reduce:animate-none">
                    {[false, true].map(duplicate => (
                      <ul key={String(duplicate)} aria-hidden={duplicate || undefined}
                        className={`flex shrink-0 gap-3 pr-3 ${duplicate ? "motion-reduce:hidden" : "motion-reduce:grid motion-reduce:w-full motion-reduce:grid-cols-2 motion-reduce:pr-0 sm:motion-reduce:grid-cols-3 lg:motion-reduce:grid-cols-7"}`}>
                        {currentSponsors.map(sponsor => (
                          <li key={sponsor.src} id={!duplicate && sponsor.id && getOrganisationById(sponsor.id) ? `organisation-${sponsor.id}` : undefined} className="flex h-[7.8rem] w-[14.3rem] shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-white p-4 motion-reduce:w-auto">
                            <img src={contentImage(sponsor.src)} alt={duplicate ? "" : sponsor.alt || sponsor.name || "Organisation logo"} loading="eager" className="h-[5.2rem] w-full object-contain" style={{ transform: `scale(${logoScale[sponsor.name ?? ""] ?? 1})` }} />
                          </li>
                        ))}
                      </ul>
                    ))}
                  </div>
                </div>

                <div className="mt-8 space-y-8">
                  {currentSponsors.filter(organisation => organisation.description || organisation.contribution || organisation.website).map(organisation => (
                    <div key={organisation.src}>
                      <h3 className="text-lg font-medium">{organisation.name || organisation.alt}</h3>
                      {organisation.description && <p className="mt-2 text-base text-white/75">{organisation.description}</p>}
                      {organisation.contribution && <p className="mt-2 text-base text-white/75">{organisation.contribution}</p>}
                      {organisation.website && <a href={organisation.website} target="_blank" rel="noopener noreferrer" className="site-secondary-action mt-2">Visit website ↗</a>}
                    </div>
                  ))}
                </div>
              </PageSection>
            );
          case "partnersBenefits":
            return (
              <PageSection key={section.id ?? section.type} id="partner-objectives" className="site-section-compact scroll-mt-28 border-b border-white/10 bg-background">
                <JourneyHeading step={section.eyebrow} title={section.heading} description={section.body} />
                <div className="grid gap-x-10 gap-y-6 md:grid-cols-2 md:grid-flow-col md:grid-rows-3">
                  {(section.blocks ?? []).map(benefit => (
                    <div key={benefit.title} className="min-w-0 border-t border-white/10 pt-4">

                      <h3 className="mb-3 text-lg font-medium text-primary">{benefit.title}</h3>
                      {benefit.description && <p className="text-base leading-[1.6] text-slate-300">{benefit.description}</p>}
                    </div>
                  ))}
                </div>
              </PageSection>
            );
          case "partnersTiers":
            return (
              <PageSection key={section.id ?? section.type} id="partner-formats" className="site-section-compact scroll-mt-28 border-b border-white/10 bg-background">
                <JourneyHeading step={section.eyebrow} title={section.heading} description={section.body} className="mb-10 !max-w-none" />
                <div className="grid gap-8 md:grid-cols-3">
                  {(section.blocks ?? []).map(block => (
                    <article key={block.title} className="min-w-0 border-t border-white/10 pt-6">
                      <h3 className="font-display text-2xl font-light text-[#f7f3eb]">{block.title}</h3>
                      {block.description?.includes("\n") ? <ul className="mt-3 list-disc space-y-2 pl-4 text-base leading-relaxed text-slate-300 md:mt-4">
                        {block.description.split("\n").filter(Boolean).map(item => <li key={item}><ContextualText text={item} links={COMMUNITY_CONTEXT_LINKS} /></li>)}
                      </ul> : <p className="mt-3 text-base md:mt-4 leading-relaxed text-slate-300"><ContextualText text={block.description ?? ""} links={COMMUNITY_CONTEXT_LINKS} /></p>}
                    </article>
                  ))}
                </div>

              </PageSection>
            );
          case "joinUs":
            return (
              <ClosingCTA key={section.id ?? section.type} id="partner-conversation" eyebrow={section.eyebrow} heading={section.heading} headingClassName="!text-[25.6px] !leading-[37.5px] md:!leading-10"
                action={section.cta && <Button variant="brand" size="lg" asChild><a href={section.cta.url}>{section.cta.label}</a></Button>} />
            );
          default:
            return null;
        }
      })}
    </>
  );
}
