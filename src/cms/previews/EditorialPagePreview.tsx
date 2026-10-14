import type { ComponentProps } from "react";
import PageHero from "@/components/shared/PageHero";
import AboutPageRenderer from "@/components/sections/AboutPageRenderer";
import FaqPageRenderer from "@/components/sections/FaqPageRenderer";
import PartnersPageRenderer from "@/components/sections/PartnersPageRenderer";
import faqData from "@/content/faq.json";
import PreviewLayout from "./PreviewLayout";
import { readPreviewData, type PreviewEntry } from "./previewData";

type Hero = ComponentProps<typeof PageHero> & {
  cta?: { label?: string; url?: string };
  primaryCta?: { label?: string; url?: string };
};
type PageData = { hero?: Hero; sections?: unknown[] };
const noop = () => {};

export function AboutPreview({ entry }: { entry: PreviewEntry }) {
  const { hero, sections } = readPreviewData<PageData>(entry);
  return <PreviewLayout route="/about">
    <PageHero presentation="business" editorialCoherence eyebrow={hero?.eyebrow} title={hero?.title ?? ""}
      description={hero?.description} image={hero?.image} primaryCtaText={hero?.cta?.label} onPrimaryClick={hero?.cta?.label ? noop : undefined} />
    <AboutPageRenderer sections={(sections ?? []) as ComponentProps<typeof AboutPageRenderer>["sections"]} onRegister={noop} />
  </PreviewLayout>;
}

export function PartnersPreview({ entry }: { entry: PreviewEntry }) {
  const { hero, sections } = readPreviewData<PageData>(entry);
  const primary = hero?.primaryCta ?? hero?.cta;
  return <PreviewLayout route="/partners">
    <PageHero presentation="public" eyebrow={hero?.eyebrow} title={hero?.title ?? ""}
      description={hero?.description} descriptionClassName="!text-[#9bd3c8]" image={hero?.image} primaryCtaText={primary?.label}
      primaryCtaHref={primary?.url === "/register" ? undefined : primary?.url} onPrimaryClick={primary?.url === "/register" ? noop : undefined} />
    <PartnersPageRenderer sections={sections as ComponentProps<typeof PartnersPageRenderer>["sections"]} onRegister={noop} />
  </PreviewLayout>;
}

export function FaqPreview({ entry }: { entry: PreviewEntry }) {
  const { hero, sections } = readPreviewData<PageData>(entry);
  return <PreviewLayout route="/faq">
    <PageHero {...hero} title={hero?.title ?? ""} presentation="business" editorialCoherence className="!min-h-0 sm:!min-h-0 lg:!min-h-0 lg:!pb-40" titleSizeClassName="text-[28px] md:text-4xl" titleClassName="!max-w-2xl" descriptionClassName="mb-0 sm:mb-10 max-w-3xl font-body text-base leading-[1.6] text-slate-200 md:text-lg" />
    <FaqPageRenderer sections={sections as ComponentProps<typeof FaqPageRenderer>["sections"]} faqs={faqData} onCtaClick={noop} />
  </PreviewLayout>;
}
