import { formatArticleDate, sortArticles } from "@/lib/articles";
import ArticleAttribution from "@/components/shared/ArticleAttribution";
import { contentImage } from "@/lib/contentImages";
import type { Article } from "@/lib/contentMetadata";
// src/components/sections/BlogPageRenderer.tsx
import React from "react";
import { useState } from "react";
import { Link } from "react-router-dom";
import { Calendar, ArrowRight } from "lucide-react";

import PageSection from "@/components/shared/PageSection";
import { Button } from "@/components/ui/button";

// Keep failed assets out of the layout in development as well as production.
function ArticleImage({ post }: { post: Article }) {
  const src = contentImage(post.image);
  const [loaded, setLoaded] = useState(false);
  const [failed, setFailed] = useState(false);
  if (!src || failed) return null;
  return (
    <img
      src={src}
      alt={post.title}
      onLoad={() => setLoaded(true)}
      onError={() => setFailed(true)}
      className={loaded ? "mb-6 aspect-[3/2] w-full object-cover" : "hidden"}
    />
  );
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
                <div>
                  <h2 className="mb-10 font-display text-[30px] font-light leading-tight text-white md:text-4xl">
                    {section.title ?? "Latest articles"}
                    {section.accentWord && <> {section.accentWord}</>}
                  </h2>

                  <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-3">
                    {sortArticles(posts).map((post) => (
                      <article
                        key={post.slug}
                        className="min-w-0"
                      >
                        <ArticleImage key={post.image} post={post} />

                        <div className="flex flex-col gap-4">
                          <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-xs uppercase tracking-[0.12em] text-white/60">
                            <span>{post.category}</span>
                            <div className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              <span>{formatArticleDate(post.date)}</span>
                            </div>
                          </div>

                          <Link to={`/blog/${post.slug}`}>
                            <h3 className="font-display text-2xl font-light leading-snug text-white transition-colors hover:text-primary">
                              {post.title}
                            </h3>
                          </Link>

                          <ArticleAttribution article={post} />
                          <p className="text-base leading-[1.8] text-slate-300">
                            {post.excerpt}
                          </p>

                          <div className="mt-2">
                            <Link
                              to={`/blog/${post.slug}`}
                              className="inline-flex items-center text-primary font-medium hover:underline"
                            >
                              Read More
                              <ArrowRight className="ml-1 h-4 w-4" />
                            </Link>
                          </div>
                        </div>
                      </article>
                    ))}
                  </div>
                </div>

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
