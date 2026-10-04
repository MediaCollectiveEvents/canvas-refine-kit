import React from "react";
import { Button } from "../ui/button";

import EventDiscoverySection from "./EventDiscoverySection";
import GetInvolvedSection from "./GetInvolvedSection";
import AboutIntroSection from "./AboutIntroSection";
import WhoAttendsSection from "./WhoAttendsSection";
import TestimonialsSection from "./TestimonialsSection";
import ForBrandsSection from "./ForBrandsSection";
import JoinCommunitySection from "./JoinCommunitySection";
import NewHereSection from "./NewHereSection";
import EventsSection from "./EventsSection";
import PartnersSection from "./PartnersSection";

export interface HomepageSection {
  id?: string;
  type: string;
  hidden?: boolean;
  backgroundStyle?: "dark" | "light" | "transparent" | "custom";
  customBackground?: string | null;
  underHeader?: boolean;
  imageAspect?: string;
  imageFit?: string;
  imagePadding?: boolean;
  [key: string]: unknown;
}

interface HomepageRendererProps {
  sections: HomepageSection[] | undefined;
  onRegister?: () => void;
}

export default function HomepageRenderer({ sections, onRegister }: HomepageRendererProps) {
  const visible = (Array.isArray(sections) ? sections : []).filter(section => section && !section.hidden);
  const audience = visible.find(section => section.type === "whoAttends") as React.ComponentProps<typeof WhoAttendsSection>["section"];
  const voices = visible.find(section => section.type === "testimonials") as React.ComponentProps<typeof TestimonialsSection>["section"];
  const statement = Object.values(audience?.statistics ?? {}).find(value => typeof value === "string" && /[a-z0-9]/i.test(value));
  const quote = voices?.items?.find(item => typeof item !== "string" && item.quote && item.quote.length < 100);
  function render(section: HomepageSection) {
    const key = section.id ?? section.type;
    switch (section.type) {
      case "eventDiscovery": return <EventDiscoverySection key={key} section={section as unknown as React.ComponentProps<typeof EventDiscoverySection>["section"]} onRegister={onRegister} />;
      case "getInvolved": return <GetInvolvedSection key={key} section={section as unknown as React.ComponentProps<typeof GetInvolvedSection>["section"]} />;
      case "aboutIntro": return <AboutIntroSection key={key} section={section as React.ComponentProps<typeof AboutIntroSection>["section"]} />;
      case "upcomingEventsIntro": return <EventsSection key={key} section={section as React.ComponentProps<typeof EventsSection>["section"]} onRegisterClick={onRegister} />;
      case "whoAttends": return <WhoAttendsSection key={key} section={section as React.ComponentProps<typeof WhoAttendsSection>["section"]} />;
      case "testimonials": return <TestimonialsSection key={key} section={section as React.ComponentProps<typeof TestimonialsSection>["section"]} />;
      case "joinCommunity": return <JoinCommunitySection key={key} section={section as React.ComponentProps<typeof JoinCommunitySection>["section"]} onRegisterClick={onRegister} />;
      case "newHere": return <NewHereSection key={key} section={section as React.ComponentProps<typeof NewHereSection>["section"]} onRegisterClick={onRegister} />;
      case "forBrands": return <ForBrandsSection key={key} section={section as React.ComponentProps<typeof ForBrandsSection>["section"]} />;
      case "partners": return <PartnersSection key={key} section={section as React.ComponentProps<typeof PartnersSection>["section"]} />;
      default: return null;
    }
  }
  return (
    <>
      {["eventDiscovery", "getInvolved"].flatMap(type => visible.filter(section => section.type === type).map(render))}
      {(statement || quote) && <section aria-label="Community proof" className="site-gutter bg-[#f7f7f7] py-7 text-slate-700">
        <div className="site-container flex flex-col justify-between gap-4 text-sm md:flex-row md:gap-12">
          {statement && <p>{statement}</p>}
          {quote && typeof quote !== "string" && <p><span className="font-body font-normal">“{quote.quote}”</span><span className="mt-1 block text-xs text-slate-500">{quote.name}{quote.company ? ` — ${quote.company}` : ""}</span></p>}
        </div>
      </section>}
      {["aboutIntro", "upcomingEventsIntro", "whoAttends", "testimonials"].flatMap(type => visible.filter(section => section.type === type).map(render))}
      <section className="site-gutter bg-[#f7f7f7] pt-8 pb-12 md:pt-12 md:pb-[72px]">
        <div className="site-container grid items-center gap-8 rounded-3xl border border-[#27CDBA]/50 site-surface-dark min-w-0 px-5 py-7 text-white lg:grid-cols-12 lg:gap-10 md:px-8 md:py-10">
          <div className="min-w-0 lg:col-span-8"><p className="mb-3 site-eyebrow text-[#9bd3c8]">For media and technology brands</p><h2 className="site-heading">Partner with The Media Collective.</h2><p className="mt-4 max-w-xl text-base leading-relaxed text-slate-300">Explore sponsorship, co-hosting and custom events, with opportunities developed collaboratively for each gathering.</p></div>
          <Button asChild variant="brand" size="lg" className="w-full min-w-0 whitespace-normal sm:w-auto lg:col-span-4 lg:justify-self-end"><a href="/partners">Explore partnerships <span aria-hidden="true">→</span></a></Button>
        </div>
      </section>
      {visible.filter(section => !["eventDiscovery", "getInvolved", "aboutIntro", "upcomingEventsIntro", "whoAttends", "testimonials", "joinCommunity"].includes(section.type)).map(render)}
      {visible.filter(section => section.type === "joinCommunity").map(render)}
    </>
  );
}
