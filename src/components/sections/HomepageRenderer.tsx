// src/components/sections/HomepageRenderer.tsx
import React from "react";

import { AboutIntroSection } from "./AboutIntroSection";
import WhoAttendsSection from "./WhoAttendsSection";
import TestimonialsSection from "./TestimonialsSection";
import ForBrandsSection from "./ForBrandsSection";
import JoinCommunitySection from "./JoinCommunitySection";
import NewHereSection from "./NewHereSection";
import EventsSection from "./EventsSection";
import PartnersSection from "./PartnersSection";

interface HomepageSection {
  type: string;
  hidden?: boolean;
  // Allow arbitrary fields coming from CMS JSON
  [key: string]: any;
}

interface HomepageRendererProps {
  sections: HomepageSection[] | undefined;
  onRegister?: () => void;
}

function HomepageRenderer({ sections, onRegister }: HomepageRendererProps) {
  const safeSections: HomepageSection[] = Array.isArray(sections)
    ? sections
    : [];

  return (
    <>
      {safeSections
        // Skip sections flagged as hidden in JSON / CMS
        .filter((section) => !section?.hidden)
        .map((section, index) => {
          const key = section.id ?? `${section.type}-${index}`;

          switch (section.type) {
            case "aboutIntro":
              // CMS-driven About Intro section
              return <AboutIntroSection key={key} section={section as any} />;

            case "whoAttends":
              // CMS-driven Who Attends section
              return <WhoAttendsSection key={key} section={section as any} />;

            case "upcomingEventsIntro":
              // Render Upcoming Events block HERE so it reorders with sections
              return (
                <EventsSection
                  key={key}
                  onRegisterClick={onRegister}
                  underHeader={section.underHeader}
                  imageAspect={section.imageAspect ?? "3:2"}
                  imageFit={section.imageFit ?? "contain"}
                  imagePadding={
                    typeof section.imagePadding === "boolean"
                      ? section.imagePadding
                      : true
                  }
                />
              );

            case "testimonials":
              // Carousel with testimonials
              return <TestimonialsSection key={key} />;

            case "joinCommunity":
              // CMS-driven Join Community section
              return (
                <JoinCommunitySection
                  key={key}
                  section={section as any}
                  onRegisterClick={onRegister}
                />
              );

            case "newHere":
              // CMS-driven New Here section
              return (
                <NewHereSection
                  key={key}
                  section={section as any}
                  onRegisterClick={onRegister}
                />
              );

            case "forBrands":
              // CMS-driven For Brands & Partners section
              return <ForBrandsSection key={key} section={section as any} />;

            case "partners":
              // Partners section from CMS
              return <PartnersSection key={key} section={section as any} />;

            default:
              console.warn(
                "[HomepageRenderer] Unknown section type:",
                section.type,
              );
              return null;
          }
        })}
    </>
  );
}

export default HomepageRenderer;
``;
