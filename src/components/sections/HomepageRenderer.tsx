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
            // Reads heading/body/etc. for About from homepage.json via CMS
            return <AboutIntroSection key={i} section={section} />;

          case "whoAttends":
            // Currently uses its own internal copy (can be CMS-driven later)
            return <WhoAttendsSection key={i} />;

          case "upcomingEventsIntro":
            // Reads heading/description/note/CTAs from homepage.json via CMS
            return (
              <UpcomingEventsIntroSection
                key={i}
                section={section}
                onRegister={onRegister}
              />
            );

          case "testimonials":
            // Uses your existing carousel with hard‑coded testimonials
            return <TestimonialsSection key={i} />;

          case "forBrands":
            // ✅ Fully CMS-driven using the ForBrandsSection.tsx you pasted
            return <ForBrandsSection key={i} section={section} />;

          default:
            // For now, skip other types like "partners", "joinCommunity", "newHere"
            return null;
        }
      })}
    </>
  );
}
