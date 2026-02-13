import React from "react";

import { AboutIntroSection } from "./AboutIntroSection";
import WhoAttendsSection from "./WhoAttendsSection";
import UpcomingEventsIntroSection from "./UpcomingEventsIntroSection";
import TestimonialsSection from "./TestimonialsSection";
import ForBrandsSection from "./ForBrandsSection";

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
            // Reads content from homepage.json → CMS
            return <AboutIntroSection key={i} section={section} />;

          case "whoAttends":
            // Uses its own internal copy for now
            return <WhoAttendsSection key={i} />;

          case "upcomingEventsIntro":
            // Reads heading/description/note/ctas from homepage.json → CMS
            return (
              <UpcomingEventsIntroSection
                key={i}
                section={section}
                onRegister={onRegister}
              />
            );

          case "testimonials":
            // Uses your existing carousel (hard-coded testimonials array)
            return <TestimonialsSection key={i} />;

          case "forBrands":
            // ✅ Fully CMS-driven using ForBrandsSection.tsx
            return <ForBrandsSection key={i} section={section} />;

          default:
            // Skip unimplemented types like "partners", "joinCommunity", "newHere"
            return null;
        }
      })}
    </>
  );
}
