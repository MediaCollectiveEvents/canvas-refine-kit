
const AboutSection = () => {
  return (
    <section
      id="about"
      className="py-24 md:py-32 relative"
    >
      <div className="container mx-auto px-6">
        <div className="max-w-3xl mx-auto text-center">
          
          {/* Unified Section Header */}
          <h2 className="font-display text-4xl md:text-5xl mb-8 leading-tight">
            About <span className="text-primary italic">Us</span>
          </h2>

          <div className="space-y-6 text-muted-foreground font-body text-lg leading-relaxed">
            <p>
              We bring together a community of senior executives, innovators and
              thought leaders from across the global media landscape.
              <br />
              <br />
              Our exclusive events provide a welcoming environment to connect,
              catch up and expand your network.
              <br />
              <br />
              From relaxed breakfast events to lively networking receptions,
              exclusive screenings, talks and panel discussions, each event is
              carefully curated to ensure great company, diversity and lively
              discussion.
            </p>
          </div>

        </div>
      </div>
    </section>
  );
};

export default AboutSection;
``
