import React from "react";

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
  [key: string]: any;
}

interface HomepageRendererProps {
  sections: HomepageSection[] | undefined;
  onRegister?: () => void;
}

const getBackgroundClasses = (section: HomepageSection): string => {
  switch (section.backgroundStyle) {
    case "dark":
      return "bg-[var(--background-dark)]";
    case "light":
      return "bg-[var(--background-light)]";
    case "transparent":
      return "bg-transparent";
    case "custom":
      return "";
    default:
      return "bg-transparent";
  }
};

export default function HomepageRenderer({
  sections,
  onRegister,
}: HomepageRendererProps) {
  const safeSections: HomepageSection[] = Array.isArray(sections) ? sections : [];

  return (
    <>
      {safeSections
        .filter((section) => !section?.hidden)
        .map((section, index) => {
          const key = section.id ?? `${section.type}-${index}`;
          const bgClasses = getBackgroundClasses(section);

          const style =
            section.backgroundStyle === "custom" && section.customBackground
              ? { backgroundColor: section.customBackground }
              : undefined;

          switch (section.type) {
            case "aboutIntro":
              return (
                <section key={key} className={`w-full ${bgClasses}`} style={style}>
                  <AboutIntroSection section={section as any} />
                </section>
              );

            case "whoAttends":
              return (
                <section key={key} className={`w-full ${bgClasses}`} style={style}>
                  <WhoAttendsSection section={section as any} />
                </section>
              );

            case "upcomingEventsIntro":
              return (
                <section key={key} className={`w-full ${bgClasses}`} style={style}>
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
                </section>
              );

            case "testimonials":
              return (
                <section key={key} className={`w-full ${bgClasses}`} style={style}>
                  <TestimonialsSection section={section as any} />
                </section>
              );

            case "joinCommunity":
              return (
                <section key={key} className={`w-full ${bgClasses}`} style={style}>
                  <JoinCommunitySection
                    section={section as any}
                    onRegisterClick={onRegister}
                  />
                </section>
              );

            case "newHere":
              return (
                <section key={key} className={`w-full ${bgClasses}`} style={style}>
                  <NewHereSection
                    section={section as any}
                    onRegisterClick={onRegister}
                  />
                </section>
              );

            case "forBrands":
              return (
                <section key={key} className={`w-full ${bgClasses}`} style={style}>
                  <ForBrandsSection section={section as any} />
                </section>
              );

            case "partners":
              return (
                <section key={key} className={`w-full ${bgClasses}`} style={style}>
                  <PartnersSection section={section as any} />
                </section>
              );

            default:
              console.warn("[HomepageRenderer] Unknown section:", section.type);
              return null;
          }
        })}
    </>
  );
}