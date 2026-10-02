import ArticleContent from "@/components/shared/ArticleContent";
import ArticleAttribution from "@/components/shared/ArticleAttribution";
import { contentImage } from "@/lib/contentImages";
import type { Article } from "@/lib/contentMetadata";
import Seo from "@/components/shared/Seo";
// src/pages/BlogPost.tsx
import React from "react";
import { useParams, Link } from "react-router-dom";

import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

import blogPostsJSON from "@/content/blogPosts.json";

type BlogPost = Article;

const BlogPostPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();

  const posts: BlogPost[] = blogPostsJSON.posts || [];
  const post = posts.find((p) => p.slug === slug);

  // -----------------------------
  // ❌ Not Found Case
  // -----------------------------
  if (!post) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="pt-20 sm:pt-24 lg:pt-28">
          <div className="container mx-auto max-w-3xl px-6 py-16">
            <h1 className="font-display text-2xl md:text-3xl text-foreground mb-4">
              Post not found
            </h1>
            <p className="text-muted-foreground mb-6">
              We couldn’t find the blog post you were looking for.
            </p>
            <Link
              to="/blog"
              className="text-sm font-medium text-primary hover:underline"
            >
              ← Back to Blog
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // -----------------------------------
  // 🎨 Build Hero Image (imageKey first)
  // -----------------------------------
  const hero = {
    image: post.imageKey
      ? `/images/blog/${post.imageKey}.jpg`
      : contentImage(post.image),
  };

  // -----------------------------------
  // ✔ MAIN RENDER
  // -----------------------------------
  return (
    <div className="min-h-screen bg-background">
      <Seo title={`${post.title} — The Media Collective`} description={post.excerpt} url={`/blog/${post.slug}`} type="article" />
      <Header />

      <main className="bg-[#101d24] pt-[88px] sm:pt-[96px] lg:pt-[104px]">
        <header className="px-6 pt-12 md:pt-16"
          style={hero.image ? {
            backgroundImage: `linear-gradient(90deg, rgba(16,29,36,0.95), rgba(16,29,36,0.85)), url(${hero.image})`,
            backgroundSize: "cover",
            backgroundPosition: "center bottom",
          } : undefined}>
          <div className="container mx-auto max-w-3xl">
            {post.category && <p className="mb-5 text-xs font-medium uppercase tracking-[0.18em] text-[#9bd3c8]">{post.category}</p>}
            <h1 className="font-display text-[40px] font-light leading-[1.1] tracking-tight text-[#f7f3eb] [overflow-wrap:anywhere] md:text-[56px]">{post.title}</h1>
            {post.excerpt && <p className="mt-6 text-base leading-[1.8] text-slate-200 md:text-lg">{post.excerpt}</p>}
            <div className="mt-6 flex flex-wrap items-center justify-between gap-4 text-sm text-slate-300">
              <span>
                {new Date(post.date).toLocaleDateString(undefined, {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                })}
              </span>
              <Link to="/blog" className="text-sm font-medium text-primary hover:underline">← Back to Blog</Link>
            </div>
            <div className="mt-4 [&>div]:text-slate-300"><ArticleAttribution article={post} /></div>
          </div>
        </header>

        <section className="px-6 pb-16 pt-8 md:pb-20 md:pt-10">
          <div className="container mx-auto max-w-3xl [&_.prose]:text-slate-200">
            {/* Post Body */}
            {post.body ? (
              <ArticleContent body={post.body} />
            ) : (
              <p className="text-muted-foreground">
                Full content for this post is coming soon.
              </p>
            )}
          </div>
        </section>

      </main>

      <Footer />
    </div>
  );
};

export default BlogPostPage;
