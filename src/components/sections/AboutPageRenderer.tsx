// src/components/sections/AboutPageRenderer.tsx
import PageSection from "@/components/shared/PageSection";
import PageCTA from "@/components/shared/PageCTA";

import AboutOverviewSection from "@/components/sections/AboutOverviewSection";
import OurStorySection from "@/components/sections/OurStorySection";
import MissionValuesSection from "@/components/sections/MissionValuesSection";

/**
 * Types for each section variant on the About page.
 * These should mirror the structure in src/content/about.json.
 */

type AboutIntroSection = {
  id?: string;
  type: "aboutIntro";
  title: string;
  accentWord?: string;
  body: string;
  cta?: {
    label: string;
  };
};

type StorySection = {
  id?: string;
  type: "story";
  title: string;
  accentWord?: string;
  body: string;
};

type MissionValuesSectionData = {
  id?: string;
  type: "missionValues";
  title: string;
  accentWord: string;
  description: string;
  // This matches the ValueItem[] inside MissionValuesSection
  values: {
    icon: "users" | "heart" | "star";
    title: string;
    description: string;
    color: string;
    bgColor: string;
  }[];
};

type JoinUsSection = {
  id?: string;
  type: "joinUs";
  // Later you can add optional fields here if you want to drive CTA text from JSON
};

type AboutSection =
  | AboutIntroSection
  | StorySection
  | MissionValuesSectionData
  | JoinUsSection;

interface AboutPageRendererProps {
  sections: AboutSection[] | undefined;
  onRegister: () => void;
}

/**
 * Renders About page sections in the order defined by about.json.
 */
const AboutPageRenderer = ({
  sections,
  onRegister,
}: AboutPageRendererProps) => {
  if (!sections || sections.length === 0) return null;

  return (
    <>
      {sections.map((section) => {
        const key = section.id ?? section.type;

        switch (section.type) {
          case "aboutIntro":
            return (
              <AboutOverviewSection
                key={key}
                title={section.title}
                accentWord={section.accentWord}
                body={section.body}
                onRegisterClick={onRegister}
                ctaLabel={section.cta?.label}
              />
            );

          case "story":
            return (
              <OurStorySection
                key={key}
                title={section.title}
                accentWord={section.accentWord}
                body={section.body}
              />
            );

          case "missionValues":
            return (
              <PageSection key={key} variant="darker">
                {/* Type is now exactly what MissionValuesSection expects */}
                <MissionValuesSection section={section} />
              </PageSection>
            );

          case "joinUs":
            return (
              <PageSection key={key} variant="accent" className="py-20">
                {/* For now this uses the shared CTA component.
                    You can make this JSON-driven later if you like. */}
                <PageCTA onClick={onRegister} />
              </PageSection>
            );

          default:
            console.warn(
              `Unknown About section type: ${(section as any).type}`,
            );
            return null;
        }
      })}
    </>
  );
};

export default AboutPageRenderer;
