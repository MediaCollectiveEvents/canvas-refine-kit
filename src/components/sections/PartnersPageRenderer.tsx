import React from "react";
import PageSection from "@/components/shared/PageSection";
import PartnersIntro from "@/components/sections/PartnersIntro";
import PartnersGrid from "@/components/sections/PartnersGrid";

interface PartnersIntroSection {
  id: string;
  type: "partnersIntro";
  hidden?: boolean;
  eyebrow?: string;
  title: string;
  accentWord?: string;
  text: string;
}

interface PartnersGridSection {
  id: string;
  type: "partnersGrid";
  hidden?: boolean;
  items: {
    name: string;
    logo: string;
    url?: string;
    tier?: string;
    description?: string;
  }[];
}

type PartnersSection = PartnersIntroSection | PartnersGridSection;

interface PartnersPageRendererProps {
  sections: PartnersSection[];
}

const PartnersPageRenderer: React.FC<PartnersPageRendererProps> = ({
  sections,
}) => {
  const visibleSections = sections.filter((section) => !section.hidden);

  return (
    <>
      {visibleSections.map((section) => {
        switch (section.type) {
          case "partnersIntro":
            return (
              <PageSection key={section.id}>
                <PartnersIntro
                  eyebrow={section.eyebrow}
                  title={section.title}
                  accentWord={section.accentWord}
                  text={section.text}
                />
              </PageSection>
            );

          case "partnersGrid":
            return (
              <PageSection key={section.id}>
                <PartnersGrid items={section.items} />
              </PageSection>
            );

          default:
            return null;
        }
      })}
    </>
  );
};

export default PartnersPageRenderer;
