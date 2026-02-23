// src/components/sections/AboutPageRenderer.tsx
import PageSection from "@/components/shared/PageSection";
import PageCTA from "@/components/shared/PageCTA";

import AboutOverviewSection from "@/components/sections/AboutOverviewSection";
import OurStorySection from "@/components/sections/OurStorySection";
import MissionValuesSection from "@/components/sections/MissionValuesSection";

type Base = { id?: string; hidden?: boolean };

type AboutIntro = Base & {
  type: "aboutIntro";
  title: string;
  accentWord?: string;
  body: string;
  cta?: { label: string };
};

type Story = Base & {
  type: "story";
  title: string;
  accentWord?: string;
  body: string;
};

type MissionValues = Base & {
  type: "missionValues";
  title: string;
  accentWord: string;
  description: string;
  values: any[];
};

type JoinUs = Base & {
  type: "joinUs";
  title: string;
  accentWord?: string;
  body: string;
  cta?: { label: string; url?: string };
};

type AboutSection = AboutIntro | Story | MissionValues | JoinUs;

export interface AboutPageRendererProps {
  sections: AboutSection[];
  onRegister: () => void;
}

const AboutPageRenderer = ({
  sections,
  onRegister,
}: AboutPageRendererProps) => {
  return (
    <>
      {sections
        .filter((s) => !s.hidden)
        .map((section) => {
          const key = section.id ?? section.type;

          switch (section.type) {
            case "aboutIntro":
              return (
                <PageSection key={key} variant="default">
                  <AboutOverviewSection
                    title={section.title}
                    accentWord={section.accentWord}
                    body={section.body}
                    ctaLabel={section.cta?.label}
                    onRegisterClick={onRegister}
                  />
                </PageSection>
              );

            case "story":
              return (
                <PageSection key={key} variant="default">
                  <OurStorySection
                    title={section.title}
                    accentWord={section.accentWord}
                    body={section.body}
                  />
                </PageSection>
              );

            case "missionValues":
              return (
                <PageSection key={key} variant="darker">
                  <MissionValuesSection section={section} />
                </PageSection>
              );

            case "joinUs":
              return (
                <PageSection key={key} variant="accent">
                  <PageCTA onClick={onRegister} />
                </PageSection>
              );

            default:
              return null;
          }
        })}
    </>
  );
};

export default AboutPageRenderer;
