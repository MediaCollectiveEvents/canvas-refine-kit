import React from "react";
import OurEventsSection from "./OurEventsSection";
import AuthorityStrip from "./AuthorityStrip";
import OrganisationsRepresentedSection from "../shared/OrganisationsRepresentedSection";

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
      case "authorityStrip": return <AuthorityStrip key={key} section={section as React.ComponentProps<typeof AuthorityStrip>["section"]} />;
      case "ourEvents": return <OurEventsSection key={key} section={section as React.ComponentProps<typeof OurEventsSection>["section"]} />;
      case "organisationsRepresented": return <OrganisationsRepresentedSection key={key} section={section as React.ComponentProps<typeof OrganisationsRepresentedSection>["section"]} />;
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
      {["aboutIntro", "upcomingEventsIntro", "whoAttends", "authorityStrip", "organisationsRepresented", "ourEvents", "partners", "eventDiscovery", "getInvolved", "testimonials"].flatMap(type => visible.filter(section => section.type === type).map(render))}
      {visible.filter(section => !["eventDiscovery", "getInvolved", "aboutIntro", "upcomingEventsIntro", "whoAttends", "testimonials", "partners", "organisationsRepresented", "ourEvents", "authorityStrip", "joinCommunity"].includes(section.type)).map(render)}
      {visible.filter(section => section.type === "joinCommunity").map(render)}
    </>
  );
}
