// src/components/sections/AboutPageRenderer.tsx

import React from "react";
import aboutData from "@/content/about.json";
import { loadSections, AnySection } from "@/lib/sections";

// About page section components
import { AboutIntroSection } from "@/components/sections/AboutIntroSection";
import OurStorySection from "@/components/sections/OurStorySection";
import MissionValuesSection from "@/components/sections/MissionValuesSection";
import JoinUsSection from "@/components/sections/JoinUsSection";

// Map section.type -> section component
const ABOUT_SECTION_COMPONENTS: Record<
  string,
  React.ComponentType<{ section: AnySection }>
> = {
  aboutIntro: AboutIntroSection as React.ComponentType<{ section: AnySection }>,
  ourStory: OurStorySection as React.ComponentType<{ section: AnySection }>,
  missionValues: MissionValuesSection as React.ComponentType<{
    section: AnySection;
  }>,
  joinUs: JoinUsSection as React.ComponentType<{ section: AnySection }>,
};

const AboutPageRenderer: React.FC = () => {
  const data = aboutData as { sections?: string[] };

  // Slugs from about.json, e.g. ["aboutIntro", "ourStory", "missionValues", "joinUs"]
  const slugs = (data.sections as string[]) ?? [];

  // Resolve slugs -> shared section JSON objects
  const sections = loadSections(slugs);

  return (
    <section className="px-4 py-12 md:py-16">
      <div className="max-w-5xl mx-auto flex flex-col gap-10">
        {sections.map((section, index) => {
          const Component = ABOUT_SECTION_COMPONENTS[section.type];

          if (!Component) {
            console.warn(
              `[AboutPageRenderer] No component registered for section type "${section.type}".`,
            );
            return null;
          }

          return (
            <Component key={`${section.type}-${index}`} section={section} />
          );
        })}
      </div>
    </section>
  );
};

export default AboutPageRenderer;
