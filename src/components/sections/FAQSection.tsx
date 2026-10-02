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
  presentation?: "classic" | "editorial";
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
  presentation = "classic",
}) => {
  // Determine source of FAQ items:
  // 1) `faqs` prop from FaqPageRenderer
  // 2) fallback to faq.json (either { items: [...] } or an array)
  const items: FAQItem[] = (faqs ??
    (Array.isArray(faq) ? faq : ((faq as unknown as { items?: FAQItem[] }).items ?? []))) as FAQItem[];

  // If there are no FAQs defined yet, don't render the section
  if (!items.length) return null;

  const headerTitle = title || "Frequently Asked Questions";
  const headerDescription = description || "";

  const editorial = presentation === "editorial";

  return (
    <section
      id="faq"
      className={editorial ? "w-full" : "w-full py-16 md:py-24 border-t border-[#1f2933]"}
    >
      <div className={editorial ? "flex flex-col gap-8" : "max-w-5xl mx-auto px-4 md:px-6 flex flex-col gap-10"}>
        {/* Reuse your standard section header */}
        {editorial ? <div>
          <h2 className="font-display text-[30px] font-light leading-tight text-white md:text-4xl">{headerTitle}</h2>
          {headerDescription && <p className="mt-5 max-w-2xl text-base leading-[1.8] text-slate-300">{headerDescription}</p>}
        </div> : <SectionHeader
          title={headerTitle}
          accentWord="Questions"
          description={headerDescription}
        />}

        <div className={editorial ? "grid gap-0" : "grid gap-6 md:gap-8"}>
          {items.map((item, index) => (
            <div
              key={index}
              className={editorial ? "border-b border-white/10 py-6 last:border-0" : "rounded-xl border border-[#1f2933] bg-[#05070b]/70 px-5 py-4 md:px-6 md:py-5"}
            >
              <h3 className={editorial ? "mb-3 text-lg font-medium text-white" : "text-lg md:text-xl font-semibold text-foreground mb-2"}>
                {item.question}
              </h3>
              <p className={editorial ? "max-w-4xl text-base leading-[1.8] text-slate-300" : "text-sm md:text-base text-muted-foreground leading-relaxed"}>
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
