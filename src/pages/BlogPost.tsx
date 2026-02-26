// src/pages/BlogPost.tsx
import React from "react";
import { useParams, Link } from "react-router-dom";

import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import PageHero from "@/components/shared/PageHero";
import SectionDivider from "@/components/shared/SectionDivider";

import blogPostsJSON from "@/content/blogPosts.json";

type BlogPost = {
  slug: string;
  title: string;
  category: string;
  date: string;
  excerpt: string;
  image?: string;
  imageKey?: string;
  body?: string;
};

const BlogPostPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();

  const posts: BlogPost[] = (blogPostsJSON as any).posts || [];
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
      : post.image || "/images/default-hero.jpg",
  };

  // -----------------------------------
  // ✔ MAIN RENDER
  // -----------------------------------
  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="pt-20 sm:pt-24 lg:pt-28">
        {/* Hero */}
        <PageHero
          eyebrow={post.category}
          title={post.title}
          description={post.excerpt}
          variant="image"
          theme="dark"
          backgroundImage={hero.image}
          overlayStrength={0.5}
        />

        {/* Body */}
        <section className="py-12 md:py-16 px-6">
          <div className="container mx-auto max-w-3xl">
            {/* Meta + Back Link */}
            <div className="flex items-center justify-between text-sm text-muted-foreground mb-6">
              <span>
                {new Date(post.date).toLocaleDateString(undefined, {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                })}
              </span>
              <Link
                to="/blog"
                className="text-sm font-medium text-primary hover:underline"
              >
                ← Back to Blog
              </Link>
            </div>

            {/* Post Body */}
            {post.body ? (
              <div className="prose prose-invert max-w-none">
                <p>{post.body}</p>
              </div>
            ) : (
              <p className="text-muted-foreground">
                Full content for this post is coming soon.
              </p>
            )}
          </div>
        </section>

        {/* Divider (fixed variant) */}
        <SectionDivider variant="hairline" className="py-12" />
      </main>

      <Footer />
    </div>
  );
};

export default BlogPostPage;
