// src/components/sections/HomepageRenderer.tsx

import React from "react";

import AboutIntroSection from "./AboutIntroSection";
import WhoAttendsSection from "./WhoAttendsSection";
import TestimonialsSection from "./TestimonialsSection";
import ForBrandsSection from "./ForBrandsSection";
import JoinCommunitySection from "./JoinCommunitySection";
import NewHereSection from "./NewHereSection";
import EventsSection from "./EventsSection";
import PartnersSection from "./PartnersSection";

interface HomepageSection {
  id?: string;
  type: string;
  hidden?: boolean;
  [key: string]: any;
}

interface HomepageRendererProps {
  sections: HomepageSection[] | undefined;
  onRegister?: () => void;
}

export default function HomepageRenderer({
  sections,
  onRegister,
}: HomepageRendererProps) {
  const safeSections: HomepageSection[] = Array.isArray(sections)
    ? sections
    : [];

  return (
    <>
      {safeSections
        // Skip hidden sections
        .filter((section) => !section?.hidden)
        .map((section, index) => {
          const key = section.id ?? `${section.type}-${index}`;

          switch (section.type) {
            case "aboutIntro":
              return (
                <AboutIntroSection
                  key={key}
                  section={section as any}
                />
              );

            case "whoAttends":
              return (
                <WhoAttendsSection
                  key={key}
                  section={section as any}
                />
              );

            case "upcomingEventsIntro":
              return (
                <EventsSection
                  key={key}
                  section={section as any}
                  onRegisterClick={onRegister ?? (() => {})}
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
              return <TestimonialsSection key={key} />;

            case "joinCommunity":
              return (
                <JoinCommunitySection
                  key={key}
                  section={section as any}
                  onRegisterClick={onRegister}
                />
              );

            case "newHere":
              return (
                <NewHereSection
                  key={key}
                  section={section as any}
                  onRegisterClick={onRegister}
                />
              );

            case "forBrands":
              return <ForBrandsSection key={key} section={section as any} />;

            case "partners":
              return <PartnersSection key={key} section={section as any} />;

            default:
              console.warn("[HomepageRenderer] Unknown section:", section.type);
              return null;
          }
        })}
    </>
  );
}