import { useState } from "react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Calendar, User, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import PageHero from "@/components/shared/PageHero";
import PageCTA from "@/components/shared/PageCTA";
import SectionDivider from "@/components/shared/SectionDivider";
import heroImage from "@/assets/hero-placeholder.jpg";
import { Link } from "react-router-dom";

// ✅ NEW: real blog content from JSON
import blogPostsData from "@/content/blog.json";

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
}

// Normalize JSON → typed array & sort by date (newest first)
const blogPosts: BlogPost[] = (blogPostsData as any[])
  .map((post, index) => ({
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
  }))
  .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

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
          variant="image"
          backgroundImage={heroImage}
        />

        {/* Blog Posts Grid */}
        <section className="py-24 md:py-32 px-6 bg-gradient-to-b from-background via-secondary/20 to-background relative overflow-hidden">
          <div className="container mx-auto max-w-6xl">
            <div className="grid md:grid-cols-2 gap-8">
              {blogPosts.map((post, index) => (
                <motion.article
                  key={post.slug}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="group bg-card rounded-2xl overflow-hidden border border-border hover:border-[hsl(var(--icon-cyan))] transition-all duration-300 hover:shadow-lg"
                >
                  <Link to={`/blog/${post.slug}`} className="block h-full">
                    <div className="aspect-video overflow-hidden">
                      <img
                        src={post.heroImage}
                        alt={post.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    </div>

                    <div className="p-6">
                      <span className="inline-block px-3 py-1 bg-[hsl(var(--icon-cyan)/0.1)] text-[hsl(var(--icon-cyan))] text-xs font-medium rounded-full mb-4">
                        {post.category}
                      </span>

                      <h2 className="font-display text-xl md:text-2xl text-foreground mb-3 group-hover:text-[hsl(var(--icon-cyan))] transition-colors">
                        {post.title}
                      </h2>

                      <p className="text-muted-foreground mb-4 line-clamp-2">
                        {post.excerpt}
                      </p>

                      <div className="flex items-center justify-between text-sm text-muted-foreground">
                        <div className="flex items-center gap-4">
                          <span className="flex items-center gap-1">
                            <User className="w-4 h-4" />
                            {post.author.name}
                          </span>
                          <span className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            {new Date(post.date).toLocaleDateString(undefined, {
                              year: "numeric",
                              month: "short",
                              day: "numeric",
                            })}
                          </span>
                        </div>

                        <span className="flex items-center gap-1 text-[hsl(var(--icon-cyan))] opacity-0 group-hover:opacity-100 transition-opacity">
                          Read More <ArrowRight className="w-4 h-4" />
                        </span>
                      </div>
                    </div>
                  </Link>
                </motion.article>
              ))}
            </div>
          </div>
        </section>

        {/* Decorative Divider */}
        <SectionDivider variant="triple" className="py-12" />

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
