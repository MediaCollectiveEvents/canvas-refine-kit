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
      {["eventDiscovery", "upcomingEventsIntro", "getInvolved", "whoAttends", "testimonials"].flatMap(type => visible.filter(section => section.type === type).map(render))}
      <section className="site-gutter site-surface-dark pt-8 pb-12 md:pt-12 md:pb-[72px]">
        <div className="site-container grid min-w-0 items-center gap-8 text-[#f7f3eb] lg:grid-cols-12 lg:gap-10">
          <div className="min-w-0 lg:col-span-8">
            <h2 className="site-heading !font-medium">See what’s coming up</h2>
            <p className="mt-4 max-w-xl text-base leading-relaxed text-slate-300">Explore upcoming events or register your interest for future gatherings.</p>
          </div>
          <div className="flex min-w-0 flex-col items-start gap-6 sm:flex-row sm:items-center lg:col-span-4 lg:flex-col lg:items-end">
            <Button asChild variant="brand" size="lg" className="w-full min-w-0 whitespace-normal sm:w-auto focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#35C5BB]">
              <a href="#events-for-you">See what’s on <span aria-hidden="true">→</span></a>
            </Button>
            <Button type="button" variant="textcta" size="text" onClick={onRegister} className="focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#35C5BB]">Register interest</Button>
          </div>
        </div>
      </section>
      {visible.filter(section => !["eventDiscovery", "getInvolved", "eventInterests", "aboutIntro", "upcomingEventsIntro", "whoAttends", "testimonials", "joinCommunity"].includes(section.type)).map(render)}
      {visible.filter(section => section.type === "joinCommunity").map(render)}
    </>
  );
}
