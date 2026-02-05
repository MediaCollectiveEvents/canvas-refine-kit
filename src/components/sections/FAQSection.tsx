import React from "react";
import SectionHeader from "@/components/shared/SectionHeader";
import faq from "@/content/faq.json";

type FAQItem = {
  question: string;
  answer: string;
};

const FAQSection: React.FC = () => {
  const items = (faq.items ?? []) as FAQItem[];

  // If there are no FAQs defined yet, don't render the section
  if (!items.length) return null;

  return (
    <section
      id="faq"
      className="w-full py-16 md:py-24 border-t border-[#1f2933]"
    >
      <div className="max-w-5xl mx-auto px-4 md:px-6 flex flex-col gap-10">
        {/* Reuse your standard section header */}
        <SectionHeader
          title="Frequently Asked Questions"
          accentWord="Questions"
          align="center"
          description=""
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
