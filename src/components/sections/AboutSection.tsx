const AboutSection = () => {
  return <section id="about" className="py-24 md:py-32 relative">
      <div className="container mx-auto px-6">
        <div className="max-w-3xl mx-auto lg:mx-0">
          <p className="text-primary font-body uppercase tracking-[0.3em] mb-4 font-medium text-left text-2xl">WELCOME TO
 
THE MEDIA COLLECTIVE</p>
          <h2 className="font-display text-4xl md:text-5xl lg:text-6xl mb-6 leading-tight">
            Connecting the{" "}
            <span className="text-primary italic">Media Industry</span>
          </h2>
          <div className="space-y-6 text-muted-foreground font-body text-lg leading-relaxed">
            <p>
              The Media Collective brings together senior executives, innovators, and thought leaders from across the global media landscape. Our exclusive events provide unparalleled opportunities to connect, learn, and collaborate.
            </p>
            <p>
              From intimate breakfast discussions to dynamic networking receptions, each event is carefully curated to create valuable connections and spark transformative conversations.
            </p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-8 mt-12 pt-12 border-t border-border">
            <div>
              <p className="font-display text-4xl text-primary mb-2">500+</p>
              <p className="text-muted-foreground font-body text-sm uppercase tracking-wider">Executives</p>
            </div>
            <div>
              <p className="font-display text-4xl text-primary mb-2">50+</p>
              <p className="text-muted-foreground font-body text-sm uppercase tracking-wider">Events</p>
            </div>
            <div>
              <p className="font-display text-4xl text-primary mb-2">25+</p>
              <p className="text-muted-foreground font-body text-sm uppercase tracking-wider">Countries</p>
            </div>
          </div>
        </div>
      </div>
    </section>;
};
export default AboutSection;