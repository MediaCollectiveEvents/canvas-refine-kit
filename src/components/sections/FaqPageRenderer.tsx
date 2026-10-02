import React from "react";
import PageSection from "@/components/shared/PageSection";
import { Button } from "@/components/ui/button";
import FAQSection from "@/components/sections/FAQSection"; // 👈 IMPORTANT

interface FaqPageSection {
  id?: string;
  type: string;
  hidden?: boolean;
  variant?: "default" | "darker" | "accent";
  // Allow arbitrary CMS-driven fields
  title?: string;
  accentWord?: string;
  description?: string;
  buttonLabel?: string;
}

interface FaqPageRendererProps {
  sections: FaqPageSection[] | undefined;
  faqs: { question: string; answer: string }[];
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

          switch (section.type) {
            case "faqSection":
              return (
                <PageSection key={key} id={section.id} className="bg-none bg-[#101d24] py-12 md:py-16">
                  <FAQSection
                    presentation="editorial"
                    faqs={faqs}
                    title={section.title}
                    description={section.description}
                  />
                </PageSection>
              );

            case "cta":
              return (
                <PageSection key={key} id={section.id} className="border-t border-white/10 bg-none bg-[#172b31] py-12 md:py-16">
                  <div className="grid items-start gap-8 lg:grid-cols-12">
                    <div className="lg:col-span-8">
                      <h2 className="font-display text-[30px] font-light leading-tight text-white md:text-4xl">
                        {section.title ?? "Ready to"}{" "}{section.accentWord ?? "Join Us?"}
                      </h2>
                      <p className="mt-5 max-w-2xl text-base leading-[1.8] text-slate-300">
                        {section.description ?? "Be part of the next generation of media industry connections. Our events are free, invite-only, and designed for high-value networking."}
                      </p>
                    </div>
                    <div className="lg:col-span-4 lg:justify-self-end">
                      <Button variant="brand" size="lg" onClick={onCtaClick}>
                        {section.buttonLabel ?? "Register Your Interest"}
                      </Button>
                    </div>
                  </div>
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
