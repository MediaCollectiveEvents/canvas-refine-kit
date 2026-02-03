import { useMemo, useState } from "react";
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

const Blog = () => {
  const [isFormOpen, setIsFormOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main>
        {/* Hero Section */}
        <PageHero
          eyebrow="Insights & Updates"
          title="The Blog"
          description="Stay informed with the latest industry insights, event recaps, and community updates from The Media Collective."
          variant="primary"
        />

        {/* Blog Posts Grid */}
        <section className="py-24 md:py-32 px-6 bg-gradient-to-b from-background via-secondary/20 to-background relative overflow-hidden">
          {normalisedPosts.map((post) => (
            <article key={post.id}>
              <div className="flex items-center gap-6 text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  <User className="h-4 w-4" />
                  {post.author.name}
                </span>
                <span className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  {new Date(post.date).toLocaleDateString(undefined, {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  })}
                </span>
              </div>

              <h2 className="text-2xl md:text-3xl font-bold text-foreground">
                {post.title}
              </h2>

              <p className="text-muted-foreground">{post.excerpt}</p>

              <div>
                <Link
                  to="/blog"
                  className="inline-flex items-center text-[hsl(var(--icon-cyan))] hover:underline"
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to all articles
                </Link>
              </div>
            </article>
          ))}
        </section>

        {/* Decorative Divider */}
        <SectionDivider className="py-12" />

        {/* CTA Section */}
        <PageCTA
          title="Want to stay"
          accentWord="Informed?"
          description="Join our community and get exclusive access to industry insights, event updates, and networking opportunities."
          buttonLabel="Register Interest"
          onClick={() => setIsFormOpen(true)}
        />
      </main>

      <Footer />
    </div>
  );
};

export default Blog;
