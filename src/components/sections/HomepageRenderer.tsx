import React from "react";

import AboutIntroSection from "./AboutIntroSection";
import WhoAttendsSection from "./WhoAttendsSection";
import TestimonialsSection from "./TestimonialsSection";
import ForBrandsSection from "./ForBrandsSection";
import JoinCommunitySection from "./JoinCommunitySection";
import NewHereSection from "./NewHereSection";
import EventsSection from "./EventsSection";
import PartnersSection from "./PartnersSection";
import SectionDivider from "../shared/SectionDivider";

export interface HomepageSection {
  id?: string;
  type: string;
  hidden?: boolean;
  backgroundStyle?: "dark" | "light" | "transparent" | "custom";
  customBackground?: string | null;
  [key: string]: any;
}

interface HomepageRendererProps {
  sections: HomepageSection[] | undefined;
  onRegister?: () => void;
}

function renderHomepageSection(
  section: HomepageSection,
  onRegister?: () => void
) {
  switch (section.type) {
    case "aboutIntro":
      return <AboutIntroSection section={section as any} />;

    case "whoAttends":
      return <WhoAttendsSection section={section as any} />;

    case "upcomingEventsIntro":
      return (
        <EventsSection
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
      return <TestimonialsSection section={section as any} />;

    case "joinCommunity":
      return (
        <JoinCommunitySection
          section={section as any}
          onRegisterClick={onRegister}
        />
      );

    case "newHere":
      return (
        <NewHereSection
          section={section as any}
          onRegisterClick={onRegister}
        />
      );

    case "forBrands":
      return <ForBrandsSection section={section as any} />;

    case "partners":
      return <PartnersSection section={section as any} />;

    default:
      console.warn("[HomepageRenderer] Unknown section:", section.type);
      return null;
  }
}

export default function HomepageRenderer({
  sections,
  onRegister,
}: HomepageRendererProps) {
  const visibleSections: HomepageSection[] = Array.isArray(sections)
    ? sections.filter((section) => !section?.hidden)
    : [];

  return (
    <>
      {visibleSections.map((section, index) => {
        const key = section.id ?? `${section.type}-${index}`;
        const renderedSection = renderHomepageSection(section, onRegister);

        if (!renderedSection) return null;

        const showDivider = index < visibleSections.length - 1;

        return (
          <React.Fragment key={key}>
            {renderedSection}
            {showDivider && <SectionDivider />}
          </React.Fragment>
        );
      })}
    </>
  );
}