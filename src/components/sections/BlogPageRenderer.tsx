import { formatArticleDate, sortArticles } from "@/lib/articles";
import ArticleAttribution from "@/components/shared/ArticleAttribution";
import { contentImage } from "@/lib/contentImages";
import type { Article } from "@/lib/contentMetadata";
// src/components/sections/BlogPageRenderer.tsx
import React from "react";
import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { getTopicById } from "@/lib/taxonomy";

import PageSection from "@/components/shared/PageSection";
import { Button } from "@/components/ui/button";

function ArticleImage({ post, featured = false }: { post: Article; featured?: boolean }) {
  const src = contentImage(post.image);
  const [failed, setFailed] = useState(false);
  if (!src || failed) return null;
  return <img src={src} alt="" onError={() => setFailed(true)} loading={featured ? "eager" : "lazy"}
    className={featured ? "aspect-square w-full object-contain bg-[#08111f]" : "aspect-[3/2] w-full object-cover bg-[#08111f]"} />;
}

function ArticleCard({ post, featured = false }: { post: Article; featured?: boolean }) {
  return <article className={featured ? "grid gap-7 border-y border-white/15 py-7 md:grid-cols-[minmax(0,2fr)_minmax(0,3fr)] md:items-center md:gap-12 md:py-10" : "min-w-0 border-t border-white/15 pt-5"}>
    <Link to={`/insights/${post.slug}`} aria-label={post.title} className="block"><ArticleImage key={post.image} post={post} featured={featured} /></Link>
    <div className="space-y-4">
      <p className="font-display text-xs uppercase tracking-[0.12em] text-[#9bd3c8]">{[post.series, post.category].filter(Boolean).join(" · ")}</p>
      <h3 className={featured ? "font-display text-3xl font-light leading-tight text-white md:text-4xl" : "font-display text-2xl font-light leading-snug text-white"}><Link to={`/insights/${post.slug}`} className="hover:text-primary">{post.title}</Link></h3>
      <p className="text-sm text-slate-400">{formatArticleDate(post.date)}</p>
      <ArticleAttribution article={post} />
      <p className="text-base leading-[1.8] text-slate-300">{post.excerpt}</p>
      <Link to={`/insights/${post.slug}`} className="font-display inline-flex min-h-11 items-center gap-2 font-medium text-primary hover:underline">Read article <ArrowRight size={16} aria-hidden="true" /></Link>
    </div>
  </article>;
}

function EditorialLibrary({ posts, title, description }: { posts: Article[]; title: string; description?: string }) {
  const [category, setCategory] = useState("");
  const [topic, setTopic] = useState("");
  const [series, setSeries] = useState("");
  const sorted = sortArticles(posts);
  const categories = [...new Set(sorted.map(p => p.category).filter(Boolean))].sort();
  const seriesOptions = [...new Set(sorted.flatMap(p => p.series ? [p.series] : []))].sort();
  const topics = [...new Set(sorted.flatMap(p => p.topics ?? []))].flatMap(id => { const value = getTopicById(id); return value?.active ? [value] : []; }).sort((a,b) => a.label.localeCompare(b.label));
  const filtered = sorted.filter(p => (!category || p.category === category) && (!topic || p.topics?.includes(topic)) && (!series || p.series === series));
  const active = Boolean(category || topic || series);
  const featured = active ? undefined : sorted.find(p => p.featured) ?? sorted[0];
  const rest = filtered.filter(p => p.slug !== featured?.slug);
  const selectClass = "min-h-11 w-full rounded-md border border-white/20 bg-[#101d24] px-3 text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary";
  return <div className="space-y-10">
    {featured && <section aria-label="Featured article">
      <h2 className="mb-4 font-display text-sm uppercase tracking-[0.16em] text-[#9bd3c8]">Featured insight</h2>
      <ArticleCard post={featured} featured />
    </section>}
    <section aria-label="Browse insights">
      <h2 className="font-display text-3xl font-light text-white md:text-4xl">{title}</h2>
      {description && <p className="mt-3 text-slate-300">{description}</p>}
      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        <label className="space-y-2 text-sm text-slate-300"><span>Category</span><select className={selectClass} value={category} onChange={e => setCategory(e.target.value)}><option value="">All categories</option>{categories.map(c => <option key={c}>{c}</option>)}</select></label>
        <label className="space-y-2 text-sm text-slate-300"><span>Topic</span><select className={selectClass} value={topic} onChange={e => setTopic(e.target.value)}><option value="">All topics</option>{topics.map(t => <option key={t.id} value={t.id}>{t.label}</option>)}</select></label>
        <label className="space-y-2 text-sm text-slate-300"><span>Editorial series</span><select className={selectClass} value={series} onChange={e => setSeries(e.target.value)}><option value="">All series</option>{seriesOptions.map(s => <option key={s}>{s}</option>)}</select></label>
      </div>
      <div className="my-6 flex flex-wrap items-center justify-between gap-4 text-sm text-slate-400"><span role="status">{filtered.length} {filtered.length === 1 ? "article" : "articles"}{featured ? " including the featured insight" : ""}</span>{active && <button type="button" className="min-h-11 text-primary hover:underline" onClick={() => { setCategory(""); setTopic(""); setSeries(""); }}>Clear filters</button>}</div>
      {rest.length ? <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-3">{rest.map(p => <ArticleCard key={p.slug} post={p} />)}</div> : <p className="text-slate-300">{filtered.length ? "The featured insight is shown above." : "No articles match these filters."}</p>}
    </section>
  </div>;
}

// Matches the shape of objects in src/content/blogPosts.json
type BlogPost = Article;

export interface BlogPageRendererProps {
  sections: {
    id?: string;
    type: string;
    hidden?: boolean;
    variant?: string;
    title?: string;
    accentWord?: string;
    description?: string;
    buttonLabel?: string;
    url?: string;
  }[];
  posts: BlogPost[];
}

const BlogPageRenderer: React.FC<BlogPageRendererProps> = ({
  sections,
  posts,
}) => {
  const visibleSections = sections.filter((s) => !s.hidden);

  return (
    <>
      {visibleSections.map((section, index) => {
        const key = section.id ?? `${section.type}-${index}`;


        switch (section.type) {
          case "postsGrid":
            return (
              <PageSection key={key} className="site-surface-dark">
                <EditorialLibrary posts={posts} title={section.title ?? "Latest insights"} description={section.description} />
              </PageSection>
            );

          case "divider":
            // The closing section supplies one subtle boundary without a spacer.
            return null;

          case "cta":
            return (
              <PageSection key={key} className="border-t border-white/10 bg-none bg-[#172b31] py-12 md:py-16">
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
                    <Button variant="brand" size="lg" onClick={() => {
                      if (section.url) window.location.href = section.url;
                    }}>
                      {section.buttonLabel ?? "Register Your Interest"}
                    </Button>
                  </div>
                </div>
              </PageSection>
            );

          default:
            console.warn(
              "[BlogPageRenderer] Unknown section type:",
              section.type,
            );
            return null;
        }
      })}
    </>
  );
};

export default BlogPageRenderer;
