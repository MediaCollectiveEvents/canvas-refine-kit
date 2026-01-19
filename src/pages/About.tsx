import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

const About = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-40 lg:pt-48">
        <section className="py-24 md:py-32 relative">
          <div className="container mx-auto px-6">
            {/* Header */}
            <div className="text-center mb-16">
              <p className="text-primary font-body text-sm uppercase tracking-[0.3em] mb-4">
                About Us
              </p>
              <h1 className="font-display text-4xl md:text-5xl lg:text-6xl mb-6 leading-tight">
                Our <span className="text-primary italic">Story</span>
              </h1>
              <p className="text-muted-foreground font-body text-lg leading-relaxed max-w-3xl mx-auto">
                The Media Collective began during a time when lockdowns prevented in-person interaction. The absence of face-to-face connection highlighted to us the importance of coming together. Remote work changed how we collaborate, but it reinforced the need to meet, share ideas, and build real connections. That's why we created The Media Collective.
              </p>
            </div>

            {/* Mission */}
            <div className="grid lg:grid-cols-2 gap-16 items-start mb-20">
              <div>
                <h2 className="font-display text-3xl md:text-4xl mb-6">
                  Our <span className="text-primary italic">Mission</span>
                </h2>
                <p className="text-muted-foreground font-body text-lg leading-relaxed">
                  We create opportunities for companies of all sizes, with a focus on innovators, to connect, exchange ideas, and explore new possibilities.
                </p>
              </div>

              {/* Ethos */}
              <div>
                <h2 className="font-display text-3xl md:text-4xl mb-6">
                  Our <span className="text-primary italic">Ethos</span>
                </h2>
                <ul className="space-y-4 text-muted-foreground font-body text-lg leading-relaxed">
                  <li>
                    <span className="text-foreground font-semibold">Community First:</span> Encouraging genuine connections and shared learning.
                  </li>
                  <li>
                    <span className="text-foreground font-semibold">Inclusivity and Balance:</span> Bringing together a mix of voices and perspectives for well-rounded conversations.
                  </li>
                  <li>
                    <span className="text-foreground font-semibold">Quality Over Quantity:</span> Limited numbers and curated participants for impact.
                  </li>
                </ul>
              </div>
            </div>

            {/* Approach */}
            <div className="mb-20">
              <h2 className="font-display text-3xl md:text-4xl mb-6 text-center">
                Our <span className="text-primary italic">Approach</span>
              </h2>
              <p className="text-muted-foreground font-body text-lg leading-relaxed text-center max-w-3xl mx-auto">
                Progress happens through collaboration and fresh thinking. Our events spark practical discussions that lead to innovation and partnerships.
              </p>
            </div>

            {/* Team Experience */}
            <div className="mb-20">
              <h2 className="font-display text-3xl md:text-4xl mb-6 text-center">
                By the Industry, <span className="text-primary italic">For the Industry</span>
              </h2>
              <p className="text-muted-foreground font-body text-lg leading-relaxed text-center max-w-3xl mx-auto">
                Our team brings decades of combined experience across membership organisations, sales, marketing, PR, media technology, and strategy. We understand the industry because we've lived it—and we're committed to creating meaningful connections that drive real results.
              </p>
            </div>

            {/* Focus */}
            <div>
              <h2 className="font-display text-3xl md:text-4xl mb-10 text-center">
                Our <span className="text-primary italic">Focus</span>
              </h2>
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
                <div className="bg-card rounded-2xl border border-border p-6">
                  <h3 className="font-display text-xl mb-3 text-primary">Curated Experiences</h3>
                  <p className="text-muted-foreground font-body text-sm leading-relaxed">
                    Planned for relevance and value.
                  </p>
                </div>
                <div className="bg-card rounded-2xl border border-border p-6">
                  <h3 className="font-display text-xl mb-3 text-primary">Convenient Locations</h3>
                  <p className="text-muted-foreground font-body text-sm leading-relaxed">
                    Great venues that make participation easy.
                  </p>
                </div>
                <div className="bg-card rounded-2xl border border-border p-6">
                  <h3 className="font-display text-xl mb-3 text-primary">Networking That Works</h3>
                  <p className="text-muted-foreground font-body text-sm leading-relaxed">
                    Smaller groups for stronger connections and easy catch-ups with peers.
                  </p>
                </div>
                <div className="bg-card rounded-2xl border border-border p-6">
                  <h3 className="font-display text-xl mb-3 text-primary">Innovation at the Core</h3>
                  <p className="text-muted-foreground font-body text-sm leading-relaxed">
                    Exploring new concepts, applications, and paths.
                  </p>
                </div>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-8 mt-20 pt-12 border-t border-border max-w-2xl mx-auto">
              <div className="text-center">
                <p className="font-display text-4xl text-primary mb-2">500+</p>
                <p className="text-muted-foreground font-body text-sm uppercase tracking-wider">Executives</p>
              </div>
              <div className="text-center">
                <p className="font-display text-4xl text-primary mb-2">50+</p>
                <p className="text-muted-foreground font-body text-sm uppercase tracking-wider">Events</p>
              </div>
              <div className="text-center">
                <p className="font-display text-4xl text-primary mb-2">25+</p>
                <p className="text-muted-foreground font-body text-sm uppercase tracking-wider">Countries</p>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default About;