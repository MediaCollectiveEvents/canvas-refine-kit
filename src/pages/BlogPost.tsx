import { useMemo } from "react";
import { useParams, Link } from "react-router-dom";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import PageHero from "@/components/shared/PageHero";
import SectionDivider from "@/components/shared/SectionDivider";
import PageCTA from "@/components/shared/PageCTA";
import heroImage from "@/assets/hero-placeholder.jpg";
import blogPostsData from "@/content/blog.json";
import { Calendar, User, ArrowLeft } from "lucide-react";

interface BlogPost {
  id: number;
  title: string;
  slug: string;
  excerpt: string;
  heroImage: string;
  category: string;
  date: string;
  author: {
    name: string;
  };
  // Optional if you later add full body content:
  body?: string;
}

const normalisedPosts: BlogPost[] = (blogPostsData as any[]).map(
  (post, index) => ({
    id: post.id ?? index + 1,
    title: post.title,
    slug: post.slug,
    excerpt: post.excerpt,
    heroImage: post.heroImage,
    category: post.category,
    date: post.date,
    author: {
      name: post.author?.name ?? "The Media Collective",
    },
    body: post.body ?? "",
  }),
);

export default function BlogPost() {
  const { slug } = useParams<{ slug: string }>();

  const post = useMemo(
    () => normalisedPosts.find((p) => p.slug === slug),
    [slug],
  );

  // Simple "not found" state
  if (!post) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="py-24 md:py-32 px-6">
          <div className="container mx-auto max-w-3xl text-center space-y-6">
            <h1 className="text-3xl md:text-4xl font-bold text-foreground">
              Blog post not found
            </h1>
            <p className="text-muted-foreground">
              We couldn't find the article you were looking for.
            </p>
            <Link
              to="/blog"
              className="inline-flex items-center px-6 py-3 rounded-full bg-primary text-primary-foreground font-medium hover:opacity-90 transition"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Blog
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const formattedDate = new Date(post.date).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main>
        {/* Hero */}
        <PageHero
          eyebrow={post.category}
          title={post.title}
          description={post.excerpt}
          variant="image"
          backgroundImage={post.heroImage || heroImage}
        />

        {/* Article body */}
        <section className="py-16 md:py-24 px-6">
          <div className="container mx-auto max-w-3xl space-y-8">
            <div className="flex items-center gap-6 text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                <User className="h-4 w-4" />
                {post.author.name}
              </span>
              <span className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                {formattedDate}
              </span>
            </div>

            {/* If you later add `body` to blog.json, render it here */}
            {post.body ? (
              <article className="prose prose-invert max-w-none">
                {/* For now it's plain text; later we can use markdown rendering */}
                <p>{post.body}</p>
              </article>
            ) : (
              <article className="prose prose-invert max-w-none">
                <p>
                  Full article content will go here. For now, this article is
                  using the excerpt as a summary – you can add a `body` field to
                  blog.json for richer content.
                </p>
              </article>
            )}

            <div>
              <Link
                to="/blog"
                className="inline-flex items-center text-[hsl(var(--icon-cyan))] hover:underline"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to all articles
              </Link>
            </div>
          </div>
        </section>

        <SectionDivider variant="triple" className="py-12" />

        {/* CTA */}
        <PageCTA
          title="Want to stay informed?"
          description="Join our community and get exclusive access to industry insights, event updates, and networking opportunities."
          buttonLabel="Register Interest"
        />
      </main>

      <Footer />
    </div>
  );
}
