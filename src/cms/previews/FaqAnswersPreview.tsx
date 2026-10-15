import faqPage from "@/content/faqPage.json";
import FaqPageRenderer from "@/components/sections/FaqPageRenderer";
import PageHero from "@/components/shared/PageHero";
import PreviewLayout from "./PreviewLayout";
import { readPreviewData, type PreviewEntry } from "./previewData";
import type { ComponentProps } from "react";
import type { FaqAnswer } from "../faqRootArray";

export default function FaqAnswersPreview({ entry }: { entry: PreviewEntry }) {
  const draft = readPreviewData<{ faqs?: FaqAnswer[] }>(entry);
  return <PreviewLayout route="/faq">
    <PageHero {...(faqPage.hero as ComponentProps<typeof PageHero>)} presentation="business" editorialCoherence
      className="!min-h-0 sm:!min-h-0 lg:!min-h-0 lg:!pb-40" titleSizeClassName="text-[28px] md:text-4xl"
      titleClassName="!max-w-2xl" descriptionClassName="mb-0 sm:mb-10 max-w-3xl font-body text-base leading-[1.6] text-slate-200 md:text-lg" />
    <FaqPageRenderer sections={faqPage.sections as ComponentProps<typeof FaqPageRenderer>["sections"]}
      faqs={draft.faqs ?? []} onCtaClick={() => {}} />
  </PreviewLayout>;
}
