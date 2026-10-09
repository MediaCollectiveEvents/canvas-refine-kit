import React from "react";

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
      case "getInvolved": return <GetInvolvedSection key={key} section={section as unknown as React.ComponentProps<typeof GetInvolvedSection>["section"]} onRegister={onRegister} />;
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
      {["aboutIntro", "upcomingEventsIntro", "eventDiscovery", "getInvolved", "whoAttends", "testimonials"].flatMap(type => visible.filter(section => section.type === type).map(render))}
      {visible.filter(section => !["eventDiscovery", "getInvolved", "aboutIntro", "upcomingEventsIntro", "whoAttends", "testimonials", "joinCommunity"].includes(section.type)).map(render)}
      {visible.filter(section => section.type === "joinCommunity").map(render)}
    </>
  );
}
