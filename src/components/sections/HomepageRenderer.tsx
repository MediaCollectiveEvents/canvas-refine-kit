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

const SectionTopTransition = () => {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-x-0 top-0 z-10"
    >
      <div className="flex flex-col gap-[2px]">
        <div className="h-px w-full bg-[#55E6D9]/90" />
        <div className="h-px w-full bg-[#55E6D9]/65" />
        <div className="h-px w-full bg-[#55E6D9]/40" />
        <div className="h-px w-full bg-[#55E6D9]/20" />
      </div>
    </div>
  );
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

          const showTransition = index > 0;

          switch (section.type) {
            case "aboutIntro":
              return (
                <section
                  key={key}
                  className={`relative w-full ${bgClasses}`}
                  style={style}
                >
                  {showTransition && <SectionTopTransition />}
                  <AboutIntroSection section={section as any} />
                </section>
              );

            case "whoAttends":
              return (
                <section
                  key={key}
                  className={`relative w-full ${bgClasses}`}
                  style={style}
                >
                  {showTransition && <SectionTopTransition />}
                  <WhoAttendsSection section={section as any} />
                </section>
              );

            case "upcomingEventsIntro":
              return (
                <section
                  key={key}
                  className={`relative w-full ${bgClasses}`}
                  style={style}
                >
                  {showTransition && <SectionTopTransition />}
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
                <section
                  key={key}
                  className={`relative w-full ${bgClasses}`}
                  style={style}
                >
                  {showTransition && <SectionTopTransition />}
                  <TestimonialsSection section={section as any} />
                </section>
              );

            case "joinCommunity":
              return (
                <section
                  key={key}
                  className={`relative w-full ${bgClasses}`}
                  style={style}
                >
                  {showTransition && <SectionTopTransition />}
                  <JoinCommunitySection
                    section={section as any}
                    onRegisterClick={onRegister}
                  />
                </section>
              );

            case "newHere":
              return (
                <section
                  key={key}
                  className={`relative w-full ${bgClasses}`}
                  style={style}
                >
                  {showTransition && <SectionTopTransition />}
                  <NewHereSection
                    section={section as any}
                    onRegisterClick={onRegister}
                  />
                </section>
              );

            case "forBrands":
              return (
                <section
                  key={key}
                  className={`relative w-full ${bgClasses}`}
                  style={style}
                >
                  {showTransition && <SectionTopTransition />}
                  <ForBrandsSection section={section as any} />
                </section>
              );

            case "partners":
              return (
                <section
                  key={key}
                  className={`relative w-full ${bgClasses}`}
                  style={style}
                >
                  {showTransition && <SectionTopTransition />}
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