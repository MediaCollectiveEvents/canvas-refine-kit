import React from "react";

// Section components
import AboutSection from "../components/sections/AboutSection";
import ValuePillarsSection from "../components/sections/ValuePillarsSection";
import EventFormatsSection from "../components/sections/EventFormatsSection";
import FAQSection from "../components/sections/FAQSection";
import TestimonialsSection from "../components/sections/TestimonialsSection";
import WhoAttendsSection from "../components/sections/WhoAttendsSection";
import MissionValuesSection from "../components/sections/MissionValuesSection";
import EventsSection from "../components/sections/EventsSection";
import HomeIntroSection from "../components/sections/HomeIntroSection";
import TopicsPreviewSection from "../components/sections/TopicsPreviewSection";

// Shared layout
import PageSection from "../components/shared/PageSection";

// ✅ Correct import path for your project structure
// Types folder is `src/ts`, so from `src/lib` we go up one and into `ts`.
import { AnySection } from "../types/Section";

interface SectionRendererProps {
  section?: AnySection;
  sections?: AnySection[];
}

/**
 * SectionRenderer
 *
 * Renders one or many JSON-defined sections by switching on section.type
 * and delegating to the appropriate React component.
 *
 * Usage:
 *  - <SectionRenderer sections={page.sections} />
 *  - <SectionRenderer section={section} />
 */
const SectionRenderer: React.FC<SectionRendererProps> = ({
  section,
  sections,
}) => {
  const sectionList: AnySection[] = sections ?? (section ? [section] : []);

  if (!sectionList.length) return null;

  return (
    <>
      {sectionList.map((sec, index) => {
        const key = (sec as any).id ?? `${sec.type}-${index}`;

        switch (sec.type) {
          // Home / intro
          case "homeIntro":
          case "HomeIntroSection":
            return (sec as any).title && (sec as any).body ? (
              <HomeIntroSection key={key} {...(sec as any)} />
            ) : null;

          // About / story
          case "about":
          case "AboutSection":
            return <AboutSection key={key} {...sec} />;

          // Values / pillars
          case "valuePillars":
          case "ValuePillarsSection":
            return <ValuePillarsSection key={key} {...sec} />;

          // Event formats
          case "eventFormats":
          case "EventFormatsSection":
            return <EventFormatsSection key={key} {...sec} />;

          // FAQs
          case "faq":
          case "FAQSection":
            return <FAQSection key={key} {...sec} />;

          // Testimonials
          case "testimonials":
          case "TestimonialsSection":
            return <TestimonialsSection key={key} {...sec} />;

          // Who attends
          case "whoAttends":
          case "WhoAttendsSection":
            return <WhoAttendsSection key={key} {...sec} />;

          // Mission & values
          case "missionValues":
          case "MissionValuesSection":
            return <MissionValuesSection key={key} {...sec} />;

          // Events listing
          case "events":
          case "EventsSection":
            return <EventsSection key={key} {...sec} onRegisterClick={() => {}} />;

          // Topics preview on homepage
          case "topicsPreview":
            return (sec as any).title ? (
              <TopicsPreviewSection key={key} {...(sec as any)} />
            ) : null;

          // Default fallback – never break if type is unknown
          default:
            return (
              <PageSection key={key}>
                <div className="text-sm text-slate-500">
                  {(sec as any).title ? (
                    <h2 className="text-xl font-semibold mb-2">
                      {(sec as any).title}
                    </h2>
                  ) : null}

                  {(sec as any).body ? (
                    <div
                      className="prose prose-slate"
                      dangerouslySetInnerHTML={{ __html: (sec as any).body }}
                    />
                  ) : (
                    <p>
                      Unknown section type:{" "}
                      <code className="bg-slate-100 px-1 py-0.5 rounded">
                        {sec.type}
                      </code>
                    </p>
                  )}
                </div>
              </PageSection>
            );
        }
      })}
    </>
  );
};

export default SectionRenderer;
