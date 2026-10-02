import React from "react";
import HomepageRenderer from "../../components/sections/HomepageRenderer";
import PartnersPageRenderer from "../../components/sections/PartnersPageRenderer";
import PageHero from "../../components/shared/PageHero";

export interface PreviewEntry {
  getIn(path: string[]): { toJS(): unknown } | unknown;
}

type Hero = React.ComponentProps<typeof PageHero> & {
  cta?: { label: string; url?: string };
  primaryCta?: { label: string; url?: string };
  secondaryCta?: { label: string; url?: string };
};

type PageData = {
  hero?: Hero;
  sections?: React.ComponentProps<typeof HomepageRenderer>["sections"];
};

function readPage(entry: PreviewEntry): PageData {
  const value = entry.getIn(["data"]);
  const raw = value && typeof value === "object" && "toJS" in value && typeof value.toJS === "function"
    ? value.toJS() : value;
  const data = (raw || {}) as PageData & { content?: PageData; homepage?: PageData };
  return data.hero || data.sections ? data : data.content || data.homepage || data;
}

const noop = () => {};

export function PartnersPreview({ entry }: { entry: PreviewEntry }) {
  const { hero, sections } = readPage(entry);
  const primary = hero?.primaryCta ?? hero?.cta;
  return (
    <div className="min-h-screen text-white bg-[var(--background-dark)]">
      <PageHero presentation="business" title={hero?.title ?? ""} eyebrow={hero?.eyebrow}
        description={hero?.description} image={hero?.image}
        primaryCtaText={primary?.label} primaryCtaHref={primary?.url === "/register" ? undefined : primary?.url}
        onPrimaryClick={primary?.url === "/register" ? noop : undefined} />
      <PartnersPageRenderer sections={sections} onRegister={noop} />
    </div>
  );
}

export default function HomepagePreview({ entry }: { entry: PreviewEntry }) {
  const { hero, sections } = readPage(entry);
  return (
    <div className="min-h-screen text-white bg-[var(--background-dark)]">
      <PageHero presentation="editorial" title={hero?.title ?? ""} eyebrow={hero?.eyebrow ?? hero?.subtitle}
        description={hero?.description} image={hero?.image}
        primaryCtaText={hero?.primaryCta?.label}
        primaryCtaHref={hero?.primaryCta?.url === "/register" ? undefined : hero?.primaryCta?.url}
        onPrimaryClick={hero?.primaryCta?.url === "/register" ? noop : undefined}
 />
      <HomepageRenderer sections={sections} onRegister={noop} />
    </div>
  );
}
