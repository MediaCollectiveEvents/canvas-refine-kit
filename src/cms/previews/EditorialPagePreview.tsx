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
    <PageHero presentation="business" editorialCoherence homepageTextAlignment eyebrow={hero?.eyebrow} title={hero?.title ?? ""}
      description={hero?.description} image={hero?.image} primaryCtaText={primary?.label}
      primaryCtaHref={primary?.url === "/register" ? undefined : primary?.url} onPrimaryClick={primary?.url === "/register" ? noop : undefined} />
    <PartnersPageRenderer sections={sections as ComponentProps<typeof PartnersPageRenderer>["sections"]} onRegister={noop} />
  </PreviewLayout>;
}

export function FaqPreview({ entry }: { entry: PreviewEntry }) {
  const { hero, sections } = readPreviewData<PageData>(entry);
  return <PreviewLayout route="/faq">
    <PageHero {...hero} title={hero?.title ?? ""} presentation="business" editorialCoherence />
    <FaqPageRenderer sections={sections as ComponentProps<typeof FaqPageRenderer>["sections"]} faqs={faqData} onCtaClick={noop} />
  </PreviewLayout>;
}
