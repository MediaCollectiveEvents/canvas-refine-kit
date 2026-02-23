import React from "react";
import SectionHeader from "@/components/shared/SectionHeader";
import faq from "@/content/faq.json";

type FAQItem = {
  question: string;
  answer: string;
};

interface FAQSectionProps {
  faqs?: FAQItem[];
  title?: string;
  description?: string;
}

/**
 * FAQSection
 *
 * - If `faqs` prop is provided (from FaqPageRenderer), it uses that.
 * - Otherwise it falls back to faq.json (current behaviour).
 * - Header title/description can be driven by props, with sensible defaults.
 */
const FAQSection: React.FC<FAQSectionProps> = ({
  faqs,
  title,
  description,
}) => {
  // Determine source of FAQ items:
  // 1) `faqs` prop from FaqPageRenderer
  // 2) fallback to faq.json (either { items: [...] } or an array)
  const items: FAQItem[] = (faqs ??
    (Array.isArray(faq) ? faq : ((faq as any).items ?? []))) as FAQItem[];

  // If there are no FAQs defined yet, don't render the section
  if (!items.length) return null;

  const headerTitle = title || "Frequently Asked Questions";
  const headerDescription = description || "";

  return (
    <section
      id="faq"
      className="w-full py-16 md:py-24 border-t border-[#1f2933]"
    >
      <div className="max-w-5xl mx-auto px-4 md:px-6 flex flex-col gap-10">
        {/* Reuse your standard section header */}
        <SectionHeader
          title={headerTitle}
          accentWord="Questions"
          description={headerDescription}
        />

        <div className="grid gap-6 md:gap-8">
          {items.map((item, index) => (
            <div
              key={index}
              className="rounded-xl border border-[#1f2933] bg-[#05070b]/70 px-5 py-4 md:px-6 md:py-5"
            >
              <h3 className="text-lg md:text-xl font-semibold text-foreground mb-2">
                {item.question}
              </h3>
              <p className="text-sm md:text-base text-muted-foreground leading-relaxed">
                {item.answer}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FAQSection;
