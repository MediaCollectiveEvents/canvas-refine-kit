// src/components/sections/BlogPageRenderer.tsx
import React from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Calendar, User, ArrowRight } from "lucide-react";

import PageSection from "@/components/shared/PageSection";
import SectionDivider from "@/components/shared/SectionDivider";
import PageCTA from "@/components/shared/PageCTA";

// Matches the shape of objects in src/content/blogPosts.json
type BlogPost = {
  slug: string;
  title: string;
  category: string;
  excerpt: string;
  date: string;
  image?: string; // CMS uploaded hero image for the post
};

interface BlogPageRendererProps {
  sections: any[];
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
        const variant = section.variant ?? "default";

        switch (section.type) {
          case "postsGrid":
            return (
              <PageSection key={key} variant={variant}>
                <div className="container mx-auto max-w-6xl">
                  <h2 className="font-display text-3xl md:text-4xl mb-8 text-center">
                    {section.title ?? "Latest"}{" "}
                    <span className="text-primary">
                      {section.accentWord ?? "Articles"}
                    </span>
                  </h2>

                  <div className="grid md:grid-cols-3 gap-10">
                    {posts.map((post) => (
                      <article
                        key={post.slug}
                        className="bg-card/60 border border-border/80 rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-shadow duration-300"
                      >
                        {post.image && (
                          <div className="h-48 overflow-hidden">
                            <img
                              src={post.image}
                              alt={post.title}
                              className="h-full w-full object-cover transition-transform duration-500 hover:scale-105"
                            />
                          </div>
                        )}

                        <div className="p-6 flex flex-col gap-4">
                          <div className="flex items-center justify-between text-xs uppercase tracking-wide text-muted-foreground">
                            <span>{post.category}</span>
                            <div className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              <span>{post.date}</span>
                            </div>
                          </div>

                          <Link to={`/blog/${post.slug}`}>
                            <h3 className="font-display text-xl mb-2 hover:text-primary transition-colors">
                              {post.title}
                            </h3>
                          </Link>

                          <p className="text-muted-foreground text-sm leading-relaxed">
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

                <SectionDivider variant="triple" className="mt-16" />
              </PageSection>
            );

          case "divider":
            return (
              <PageSection key={key} variant={variant}>
                <SectionDivider variant="triple" />
              </PageSection>
            );

          case "cta":
            return (
              <PageSection key={key} variant={variant}>
                <PageCTA
                  title={section.title}
                  accentWord={section.accentWord}
                  description={section.description}
                  buttonLabel={section.buttonLabel}
                  onClick={() => {
                    if (section.url) window.location.href = section.url;
                  }}
                />
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
