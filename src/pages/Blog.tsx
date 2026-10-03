import { getArticles } from "@/lib/articles";
import Seo from "@/components/shared/Seo";
// src/pages/Blog.tsx
import React from "react";

import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import PageHero from "@/components/shared/PageHero";

import BlogPageRenderer from "@/components/sections/BlogPageRenderer";
import blogPage from "@/content/blogPage.json";


const Blog: React.FC = () => {
  const { hero, sections } = blogPage;
  const posts = getArticles();

  return (
    <div className="min-h-screen bg-background">
      <Seo title={`${hero.title} — The Media Collective`} description={hero.description} />
      <Header />

      {/* Match header clearance with other pages */}
      <main className="pt-[88px] sm:pt-[96px] lg:pt-[104px]">
        <PageHero
          presentation="business"
          eyebrow={hero?.eyebrow}
          title={hero?.title}
          description={hero?.description}
          // Unified hero image & controls from CMS
          image={hero?.image}
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
