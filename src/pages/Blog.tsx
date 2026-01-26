
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Calendar, User, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import PageHero from "@/components/shared/PageHero";
import SectionDivider from "@/components/shared/SectionDivider";
import heroImage from "@/assets/hero-placeholder.jpg";

const blogPosts = [
  {
    id: 1,
    title: "The Future of Media & Entertainment: Trends to Watch in 2025",
    excerpt:
      "Explore the emerging trends shaping the media landscape, from AI-driven content creation to immersive experiences that are redefining audience engagement.",
    author: "The Media Collective",
    date: "January 10, 2025",
    category: "Industry Insights",
    image:
      "https://images.unsplash.com/photo-1485846234645-a62644f84728?w=800&h=500&fit=crop",
  },
  {
    id: 2,
    title: "Networking Tips for Media Professionals",
    excerpt:
      "Learn how to make the most of industry events and build meaningful connections that can advance your career in media and entertainment.",
    author: "The Media Collective",
    date: "January 5, 2025",
    category: "Career Growth",
    image:
      "https://images.unsplash.com/photo-1515187029135-18ee286d815b?w=800&h=500&fit=crop",
  },
  {
    id: 3,
    title: "Highlights from Our Latest NAB Review Event",
    excerpt:
      "A recap of the insights shared at our exclusive NAB review gathering, featuring key takeaways from industry leaders and innovators.",
    author: "The Media Collective",
    date: "December 28, 2024",
    category: "Event Recaps",
    image:
      "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&h=500&fit=crop",
  },
  {
    id: 4,
    title: "Building Authentic Relationships in the Media Industry",
    excerpt:
      "Why genuine connections matter more than ever in today's fast-paced media environment, and how to cultivate them effectively.",
    author: "The Media Collective",
    date: "December 20, 2024",
    category: "Community",
    image:
      "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800&h=500&fit=crop",
  },
];

const Blog = () => {
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

        {/* Decorative Divider after Hero */}
        <div className="relative h-24 bg-gradient-to-b from-black/60 to-background overflow-hidden">
          <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
        </div>

        {/* Blog Posts Grid */}
        <section className="py-24 md:py-32 px-6">
          <div className="container mx-auto max-w-6xl">
            <div className="grid md:grid-cols-2 gap-8">
              {blogPosts.map((post, index) => (
                <motion.article
                  key={post.id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="group bg-card rounded-2xl overflow-hidden border border-border hover:border-primary/30 transition-all duration-300 hover:shadow-lg"
                >
                  <div className="aspect-video overflow-hidden">
                    <img
                      src={post.image}
                      alt={post.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>

                  <div className="p-6">
                    <span className="inline-block px-3 py-1 bg-primary/10 text-primary text-xs font-medium rounded-full mb-4">
                      {post.category}
                    </span>

                    <h2 className="font-display text-xl md:text-2xl text-foreground mb-3 group-hover:text-primary transition-colors">
                      {post.title}
                    </h2>

                    <p className="text-muted-foreground mb-4 line-clamp-2">
                      {post.excerpt}
                    </p>

                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                      <div className="flex items-center gap-4">
                        <span className="flex items-center gap-1">
                          <User className="w-4 h-4" />
                          {post.author}
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          {post.date}
                        </span>
                      </div>

                      <span className="flex items-center gap-1 text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                        Read More <ArrowRight className="w-4 h-4" />
                      </span>
                    </div>
                  </div>
                </motion.article>
              ))}
            </div>
          </div>
        </section>

        {/* Decorative Divider */}
        <SectionDivider variant="triple" className="py-12" />

        {/* CTA Section */}
        <section className="py-24 md:py-32 px-6 bg-gradient-to-b from-background via-muted/20 to-background">
          <div className="container mx-auto max-w-4xl text-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              <h2 className="font-display text-4xl md:text-5xl text-foreground mb-6 leading-tight">
                Want to stay <span className="text-primary italic">informed?</span>
              </h2>
              <p className="text-muted-foreground font-body text-lg mb-8 max-w-xl mx-auto">
                Join our community and get exclusive access to industry insights, event updates, and networking opportunities.
              </p>
              <Button
                size="lg"
                className="rounded-full font-body uppercase tracking-wider text-sm bg-primary text-primary-foreground hover:bg-primary/90 px-8"
              >
                Register Interest
              </Button>
            </motion.div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Blog;
