// src/pages/Blog.tsx
import React from "react";

import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import PageHero from "@/components/shared/PageHero";

import BlogPageRenderer from "@/components/sections/BlogPageRenderer";
import blogPage from "@/content/blogPage.json";
import blogPostsJSON from "@/content/blogPosts.json";

type BlogPost = {
  slug: string;
  title: string;
  category: string;
  date: string;
  excerpt: string;
  image?: string;
  body?: string;
};

const Blog: React.FC = () => {
  const { hero, sections } = blogPage as any;
  const posts: BlogPost[] = (blogPostsJSON as any).posts || [];

  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Match header clearance with other pages */}
      <main className="pt-[160px] sm:pt-[180px] lg:pt-[200px]">
        <PageHero
          eyebrow={hero?.eyebrow}
          title={hero?.title}
          description={hero?.description}
          // Unified hero image & controls from CMS
          image={hero?.image}
          theme={hero?.theme ?? "dark"}
          overlayStrength={hero?.overlayStrength ?? 0.5}
          mobileCrop={hero?.mobileCrop}
          imagePosition={hero?.imagePosition}
          imageOffset={hero?.imageOffset}
          // Single CTA – optional
          primaryCtaText={hero?.cta?.label}
          primaryCtaHref={hero?.cta?.url}
        />

        <BlogPageRenderer sections={sections} posts={posts} />
      </main>

      <Footer />
    </div>
  );
};

export default Blog;
