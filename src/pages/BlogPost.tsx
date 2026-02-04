// src/pages/BlogPost.tsx
import { useState } from "react";
import { useParams, Link } from "react-router-dom";

import PageLayout from "@/components/layout/PageLayout";
import PageHero from "@/components/shared/PageHero";
import SectionDivider from "@/components/shared/SectionDivider";
import PageCTA from "@/components/shared/PageCTA";

import blogData from "@/content/blog.json";
import homeHeroImage from "@/assets/home-hero.png";

import { Calendar, User, ArrowLeft } from "lucide-react";

const BlogPost = () => {
  const { slug } = useParams();
  const [isFormOpen, setIsFormOpen] = useState(false);

  // blog.json has shape: { posts: [...] }
  const posts = (blogData as any).posts || [];
  const post = posts.find((p: any) => p.slug === slug);

  if (!post) {
    return (
      <PageLayout>
        <main className="py-24 px-6 text-center">
          <h1 className="text-3xl font-bold mb-4">Post not found</h1>
          <Link to="/blog" className="text-primary underline">
            Back to all articles
          </Link>
        </main>
      </PageLayout>
    );
  }

  return (
    <PageLayout>
      {/* HERO – same style as homepage, blog list, events, etc. */}
      <PageHero
        eyebrow="INSIGHTS & UPDATES"
        title={post.title}
        description={post.excerpt}
      />

      {/* META + BODY */}
      <section className="max-w-3xl mx-auto px-6 py-12">
        {/* Meta row */}
        <div className="flex items-center gap-6 text-sm text-muted-foreground mb-6">
          <span className="flex items-center gap-1">
            <User className="h-4 w-4" />
            {post.author?.name || "The Media Collective"}
          </span>
          <span className="flex items-center gap-1">
            <Calendar className="h-4 w-4" />
            {post.date
              ? new Date(post.date).toLocaleDateString(undefined, {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                })
              : ""}
          </span>
        </div>

        {/* Body (HTML from blog.json) */}
        {post.body ? (
          <div
            className="prose prose-slate max-w-none"
            dangerouslySetInnerHTML={{ __html: post.body }}
          />
        ) : (
          <p className="text-muted-foreground">
            No article body was provided for this post.
          </p>
        )}

        {/* Back to blog */}
        <div className="mt-12">
          <Link
            to="/blog"
            className="inline-flex items-center text-[hsl(var(--icon-cyan))] hover:underline"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to all articles
          </Link>
        </div>
      </section>

      <SectionDivider className="py-12" />

      <PageCTA
        title="Want to stay"
        accentWord="Informed?"
        description="Join our community and get exclusive access to industry insights, event updates, and networking opportunities."
        buttonLabel="Register Interest"
        onClick={() => setIsFormOpen(true)}
      />
    </PageLayout>
  );
};

export default BlogPost;
