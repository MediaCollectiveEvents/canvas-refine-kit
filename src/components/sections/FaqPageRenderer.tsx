import React from "react";
import PageSection from "@/components/shared/PageSection";
import PageCTA from "@/components/shared/PageCTA";
import FAQSection from "@/components/sections/FAQSection"; // 👈 IMPORTANT

interface FaqPageSection {
  id?: string;
  type: string;
  hidden?: boolean;
  variant?: "default" | "darker" | "accent";
  // Allow arbitrary CMS-driven fields
  [key: string]: any;
}

interface FaqPageRendererProps {
  sections: FaqPageSection[] | undefined;
  faqs: any[];
  onCtaClick?: () => void;
}

const FaqPageRenderer: React.FC<FaqPageRendererProps> = ({
  sections,
  faqs,
  onCtaClick,
}) => {
  const safeSections: FaqPageSection[] = Array.isArray(sections)
    ? sections
    : [];

  return (
    <>
      {safeSections
        .filter((section) => !section.hidden)
        .map((section, index) => {
          const key = section.id ?? `${section.type}-${index}`;
          const variant = section.variant ?? "default";

          switch (section.type) {
            case "faqSection":
              return (
                <PageSection key={key} variant={variant} id={section.id}>
                  <FAQSection
                    faqs={faqs}
                    title={section.title}
                    description={section.description}
                  />
                </PageSection>
              );

            case "cta":
              return (
                <PageSection key={key} variant={variant} id={section.id}>
                  <PageCTA
                    title={section.title}
                    accentWord={section.accentWord}
                    description={section.description}
                    buttonLabel={section.buttonLabel}
                    onClick={onCtaClick}
                  />
                </PageSection>
              );

            default:
              console.warn("[FaqPageRenderer] Unknown section:", section);
              return null;
          }
        })}
    </>
  );
};

export default FaqPageRenderer;
