import React from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Calendar, User, ArrowRight } from "lucide-react";

import PageSection from "@/components/shared/PageSection";
import SectionDivider from "@/components/shared/SectionDivider";
import PageCTA from "@/components/shared/PageCTA";

import type { BlogPost } from "@/content/blogPosts";

interface BlogPageSection {
  id?: string;
  type: string;
  hidden?: boolean;
  variant?: "default" | "darker" | "accent";
  // Allow arbitrary fields coming from CMS JSON
  [key: string]: any;
}

export interface BlogPageRendererProps {
  sections: BlogPageSection[] | undefined;
  posts: BlogPost[];
  onCtaClick?: () => void;
}

const BlogPageRenderer: React.FC<BlogPageRendererProps> = ({
  sections,
  posts,
  onCtaClick,
}) => {
  const safeSections: BlogPageSection[] = Array.isArray(sections)
    ? sections
    : [];

  return (
    <>
      {safeSections
        .filter((section) => !section.hidden)
        .map((section, index) => {
          const key = section.id ?? `${section.type}-${index}`;
          const variant = section.variant ?? "default";

          switch (section.type) {
            case "postsGrid": {
              const linkLabel: string = section.linkLabel || "Read More";
              const authorLabel: string | undefined = section.authorLabel;

              return (
                <PageSection key={key} variant={variant} id={section.id}>
                  <div className="container mx-auto max-w-6xl">
                    {(section.title || section.description) && (
                      <div className="mb-8 max-w-2xl">
                        {section.title && (
                          <h2 className="font-display text-2xl md:text-3xl text-foreground mb-2">
                            {section.title}
                          </h2>
                        )}
                        {section.description && (
                          <p className="text-muted-foreground">
                            {section.description}
                          </p>
                        )}
                      </div>
                    )}

                    <div className="grid md:grid-cols-2 gap-8">
                      {posts.map((post, postIndex) => (
                        <motion.article
                          key={post.slug}
                          initial={{ opacity: 0, y: 30 }}
                          whileInView={{ opacity: 1, y: 0 }}
                          viewport={{ once: true }}
                          transition={{
                            duration: 0.5,
                            delay: postIndex * 0.1,
                          }}
                          className="group bg-card rounded-2xl overflow-hidden border border-border hover:border-[hsl(var(--icon-cyan))] transition-all duration-300 hover:shadow-lg"
                        >
                          <Link
                            to={`/blog/${post.slug}`}
                            className="block h-full"
                          >
                            {post.image && (
                              <div className="aspect-video overflow-hidden">
                                <img
                                  src={post.image}
                                  alt={post.title}
                                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                />
                              </div>
                            )}

                            <div className="p-6">
                              {post.category && (
                                <span className="inline-block px-3 py-1 bg-[hsl(var(--icon-cyan)/0.1)] text-[hsl(var(--icon-cyan))] text-xs font-medium rounded-full mb-4">
                                  {post.category}
                                </span>
                              )}

                              <h3 className="font-display text-xl md:text-2xl text-foreground mb-3 group-hover:text-[hsl(var(--icon-cyan))] transition-colors">
                                {post.title}
                              </h3>

                              {post.excerpt && (
                                <p className="text-muted-foreground mb-4 line-clamp-2">
                                  {post.excerpt}
                                </p>
                              )}

                              <div className="flex items-center justify-between text-sm text-muted-foreground">
                                <div className="flex items-center gap-4">
                                  {authorLabel && (
                                    <span className="flex items-center gap-1">
                                      <User className="w-4 h-4" />
                                      {authorLabel}
                                    </span>
                                  )}

                                  {post.date && (
                                    <span className="flex items-center gap-1">
                                      <Calendar className="w-4 h-4" />
                                      {new Date(post.date).toLocaleDateString(
                                        undefined,
                                        {
                                          year: "numeric",
                                          month: "short",
                                          day: "numeric",
                                        },
                                      )}
                                    </span>
                                  )}
                                </div>

                                <span className="flex items-center gap-1 text-[hsl(var(--icon-cyan))] opacity-0 group-hover:opacity-100 transition-opacity">
                                  {linkLabel}
                                  <ArrowRight className="w-4 h-4" />
                                </span>
                              </div>
                            </div>
                          </Link>
                        </motion.article>
                      ))}
                    </div>
                  </div>
                </PageSection>
              );
            }

            case "divider": {
              const spacingClass =
                section.spacing === "large"
                  ? "py-12"
                  : section.spacing === "small"
                    ? "py-4"
                    : "py-8";

              return (
                <PageSection key={key} variant={variant} id={section.id}>
                  <SectionDivider
                    variant={section.style ?? "triple"}
                    className={spacingClass}
                  />
                </PageSection>
              );
            }

            case "cta": {
              return (
                <PageSection key={key} variant={variant} id={section.id}>
                  <PageCTA
                    title={section.title}
                    accentWord={section.accentWord}
                    description={section.description}
                    buttonLabel={section.buttonLabel}
                    onClick={onCtaClick}
                  />
                </PageSection>
              );
            }

            default:
              console.warn("[BlogPageRenderer] Unknown section type:", section);
              return null;
          }
        })}
    </>
  );
};

export default BlogPageRenderer;
