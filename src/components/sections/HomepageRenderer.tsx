import React from "react";

import { AboutIntroSection } from "./AboutIntroSection";
import WhoAttendsSection from "./WhoAttendsSection";
import TestimonialsSection from "./TestimonialsSection";
import ForBrandsSection from "./ForBrandsSection";
import JoinCommunitySection from "./JoinCommunitySection";
import NewHereSection from "./NewHereSection";
// Note: UpcomingEventsIntroSection is no longer used here

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
            // CMS-driven About Intro section
            return <AboutIntroSection key={i} section={section} />;

          case "whoAttends":
            // CMS-driven Who Attends section
            return <WhoAttendsSection key={i} section={section} />;

          case "upcomingEventsIntro":
            // We now let EventsSection handle the Upcoming Events UI,
            // so we skip rendering the intro block here.
            return null;

          case "testimonials":
            // Existing carousel with hard-coded testimonials array
            return <TestimonialsSection key={i} />;

          case "joinCommunity":
            // CMS-driven Join Community section
            return (
              <JoinCommunitySection
                key={i}
                section={section}
                onRegisterClick={onRegister}
              />
            );

          case "newHere":
            // CMS-driven New Here section
            return (
              <NewHereSection
                key={i}
                section={section}
                onRegisterClick={onRegister}
              />
            );

          case "forBrands":
            // CMS-driven For Brands & Partners section
            return <ForBrandsSection key={i} section={section} />;

          default:
            // Skip unimplemented or unknown types (e.g. partners for now)
            return null;
        }
      })}
    </>
  );
}
