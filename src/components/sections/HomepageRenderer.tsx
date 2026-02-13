import React from "react";

import { AboutIntroSection } from "./AboutIntroSection";
import WhoAttendsSection from "./WhoAttendsSection";
import UpcomingEventsIntroSection from "./UpcomingEventsIntroSection";
import TestimonialsSection from "./TestimonialsSection";
import ForBrandsSection from "./ForBrandsSection";
import JoinCommunitySection from "./JoinCommunitySection";
import NewHereSection from "./NewHereSection";

interface HomepageRendererProps {
  sections: any[];
  onRegister?: () => void;
}

export function HomepageRenderer({
  sections,
  onRegister,
}: HomepageRendererProps) {
  const safeSections = Array.isArray(sections) ? sections : [];

  return (
    <>
      {safeSections.map((section, i) => {
        switch (section.type) {
          case "aboutIntro":
            return <AboutIntroSection key={i} section={section} />;

          case "whoAttends":
            return <WhoAttendsSection key={i} section={section} />;

          case "upcomingEventsIntro":
            return (
              <UpcomingEventsIntroSection
                key={i}
                section={section}
                onRegister={onRegister}
              />
            );

          case "testimonials":
            return <TestimonialsSection key={i} />;

          case "joinCommunity":
            return (
              <JoinCommunitySection
                key={i}
                section={section}
                onRegisterClick={onRegister}
              />
            );

          case "newHere":
            return (
              <NewHereSection
                key={i}
                section={section}
                onRegisterClick={onRegister}
              />
            );

          case "forBrands":
            return <ForBrandsSection key={i} section={section} />;

          default:
            return null;
        }
      })}
    </>
  );
}
