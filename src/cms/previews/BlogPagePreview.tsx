import { MemoryRouter } from "react-router-dom";
import PageHero from "@/components/shared/PageHero";
import BlogPageRenderer, { type BlogPageRendererProps } from "@/components/sections/BlogPageRenderer";
import { getArticles } from "@/lib/articles";
import type { PreviewEntry } from "./HomepagePreview";

type PageData = {
  hero?: { title?: string; eyebrow?: string; description?: string; image?: string; cta?: { label?: string; url?: string } };
  sections?: BlogPageRendererProps["sections"];
};

export default function BlogPagePreview({ entry }: { entry: PreviewEntry }) {
  const value = entry.getIn(["data"]);
  const raw = value && typeof value === "object" && "toJS" in value && typeof value.toJS === "function" ? value.toJS() : value;
  const data = (raw || {}) as PageData;
  return <MemoryRouter><main className="min-h-screen bg-background">
    <PageHero presentation="business" title={data.hero?.title ?? ""} eyebrow={data.hero?.eyebrow} description={data.hero?.description} image={data.hero?.image} primaryCtaText={data.hero?.cta?.label} primaryCtaHref={data.hero?.cta?.url} />
    <BlogPageRenderer sections={data.sections ?? []} posts={getArticles()} />
  </main></MemoryRouter>;
}
