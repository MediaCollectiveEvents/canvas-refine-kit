import React from "react";
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";
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
  compact?: boolean;
  expandable?: boolean;
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
  compact = false,
  expandable = false,
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
      <div className={editorial ? compact ? "flex max-w-3xl flex-col gap-6" : "flex flex-col gap-8" : "max-w-5xl mx-auto px-4 md:px-6 flex flex-col gap-10"}>
        {/* Reuse your standard section header */}
        {editorial ? <div>
          <h2 className="site-heading text-white">{headerTitle}</h2>
          {headerDescription && <p className="mt-5 max-w-2xl text-base leading-[1.6] text-slate-300">{headerDescription}</p>}
        </div> : <SectionHeader
          title={headerTitle}
          accentWord="Questions"
          description={headerDescription}
        />}

        {expandable ? <Accordion type="single" collapsible className="w-full motion-reduce:[&_*]:transition-none motion-reduce:[&_[data-state=open]]:animate-none motion-reduce:[&_[data-state=closed]]:animate-none">
          {items.map((item, index) => <AccordionItem key={item.question} value={`question-${index}`} className="border-white/10 last:border-0">
            <AccordionTrigger className="gap-4 text-left text-lg font-medium leading-snug text-white hover:no-underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#35C5BB]">{item.question}</AccordionTrigger>
            <AccordionContent>
              <p className="max-w-[70ch] text-base leading-[1.7] text-slate-300">{item.answer.includes("\n\n") ? item.answer.split(/\n\s*\n/).map((paragraph, paragraphIndex) => <span key={paragraphIndex} className="mb-4 block last:mb-0">{paragraph}</span>) : item.answer}</p>
            </AccordionContent>
          </AccordionItem>)}
        </Accordion> : <div className={editorial ? "grid gap-0" : "grid gap-6 md:gap-8"}>
          {items.map((item, index) => (
            <div
              key={index}
              className={editorial ? compact ? "border-b border-white/10 py-4 first:pt-0 last:border-0 last:pb-0" : "border-b border-white/10 py-6 last:border-0" : "rounded-xl border border-[#1f2933] bg-[#05070b]/70 px-5 py-4 md:px-6 md:py-5"}
            >
              <h3 className={editorial ? compact ? "mb-2 text-lg font-medium text-white" : "mb-3 text-lg font-medium text-white" : "text-lg md:text-xl font-semibold text-foreground mb-2"}>
                {item.question}
              </h3>
              <p className={editorial ? "max-w-[70ch] text-base leading-[1.7] text-slate-300" : "text-sm md:text-base text-muted-foreground leading-relaxed"}>
                {item.answer.includes("\n\n") ? item.answer.split(/\n\s*\n/).map((paragraph, paragraphIndex) => <span key={paragraphIndex} className="mb-4 block last:mb-0">{paragraph}</span>) : item.answer}
              </p>
            </div>
          ))}
        </div>}
      </div>
    </section>
  );
};

export default FAQSection;
