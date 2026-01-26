
import { useState } from "react";
import { motion } from "framer-motion";
import {
  Users,
  Heart,
  Star,
  Coffee,
  Wine,
  Clapperboard,
  Laptop,
  Rocket,
  Presentation,
} from "lucide-react";

import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import WhoAttendsSection from "@/components/sections/WhoAttendsSection";
import TestimonialsSection from "@/components/sections/TestimonialsSection";
import { Button } from "@/components/ui/button";
import EventRegistrationForm from "@/components/EventRegistrationForm";
import heroImage from "@/assets/hero-placeholder.jpg";

const values = [
  {
    icon: Users,
    title: "Community First",
    description: "Encouraging connections and shared learning.",
    color: "text-[hsl(var(--icon-lime))]",
    bgColor: "bg-[hsl(var(--icon-lime)/0.1)]",
  },
  {
    icon: Heart,
    title: "Inclusivity & Balance",
    description: "Bringing together a mix of voices and perspectives.",
    color: "text-[hsl(var(--icon-cyan))]",
    bgColor: "bg-[hsl(var(--icon-cyan)/0.1)]",
  },
  {
    icon: Star,
    title: "Quality Over Quantity",
    description: "Curated guest lists for relaxed, high-value networking.",
    color: "text-[hsl(var(--icon-red))]",
    bgColor: "bg-[hsl(var(--icon-red)/0.1)]",
  },
];

const eventFormats = [
  {
    icon: Coffee,
    title: "Networking Breakfasts",
    description:
      "Start the day with industry peers over coffee and conversation.",
    color: "text-[hsl(var(--icon-lime))]",
    bgColor: "bg-[hsl(var(--icon-lime)/0.1)]",
  },
  {
    icon: Wine,
    title: "Drinks Receptions",
    description: "Relaxed evening networking in premium venues.",
    color: "text-[hsl(var(--icon-cyan))]",
    bgColor: "bg-[hsl(var(--icon-cyan)/0.1)]",
  },
  {
    icon: Clapperboard,
    title: "Film Screenings",
    description: "Exclusive previews and discussions with industry leaders.",
    color: "text-[hsl(var(--icon-red))]",
    bgColor: "bg-[hsl(var(--icon-red)/0.1)]",
  },
  {
    icon: Presentation,
    title: "Conference Reviews",
    description:
      "In-person mini summits with curated discussions and insights.",
    color: "text-[hsl(var(--icon-lime))]",
    bgColor: "bg-[hsl(var(--icon-lime)/0.1)]",
  },
  {
    icon: Laptop,
    title: "Webinars",
    description: "Virtual knowledge sharing and interactive sessions.",
    color: "text-[hsl(var(--icon-cyan))]",
    bgColor: "bg-[hsl(var(--icon-cyan)/0.1)]",
  },
  {
    icon: Rocket,
    title: "Bespoke Events",
    description: "Tailored experiences designed for your brand objectives.",
    color: "text-[hsl(var(--icon-red))]",
    bgColor: "bg-[hsl(var(--icon-red)/0.1)]",
  },
];

const About = () => {
  const [isFormOpen, setIsFormOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <EventRegistrationForm open={isFormOpen} onOpenChange={setIsFormOpen} />

      {/* Hero Section */}
      <section
        className="relative bg-cover bg-center text-white min-h-[70vh] flex items-center justify-center"
        style={{ backgroundImage: `url(${heroImage})` }}
      >
        <div className="absolute inset-0 bg-black/60" />
        <div className="relative z-10 text-center px-6 py-16 md:py-24">
          <motion.p
            className="text-white/80 font-body text-sm uppercase tracking-[0.3em] mb-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            Our Community
          </motion.p>
          
          <motion.h1
            className="font-script text-5xl md:text-6xl lg:text-7xl mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            Our Story
          </motion.h1>

          <motion.p
            className="text-lg md:text-xl max-w-3xl mx-auto font-body text-white/80"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            Born during a time of remote work and limited in-person interaction,
            The Media Collective was created to reconnect the industry. We bring
            together leaders and innovators in a welcoming environment that
            promotes relationship-building and encourages collaboration.
          </motion.p>
        </div>
      </section>

      {/* Decorative Divider after Hero */}
      <div className="relative h-24 bg-gradient-to-b from-black/60 to-background overflow-hidden">
        <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
      </div>

      <main className="pt-16 lg:pt-20">
        {/* Who Attends */}
        <WhoAttendsSection />

        {/* Decorative Divider */}
        <div className="relative py-8">
          <div className="absolute inset-x-0 top-1/2 h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent" />
          <div className="flex justify-center">
            <div className="w-3 h-3 rounded-full bg-primary/60 ring-4 ring-primary/20" />
          </div>
        </div>

        {/* Mission & Values */}
        <section className="py-24 md:py-32 relative">
          <div className="container mx-auto px-6 text-center max-w-4xl mb-16">
            <h2 className="font-display text-4xl md:text-5xl mb-6 leading-tight">
              Our <span className="text-primary italic">Mission & Values</span>
            </h2>

            <p className="text-muted-foreground font-body text-lg leading-relaxed">
              Our mission is simple: create opportunities for companies of all
              sizes to connect, exchange ideas, and explore new possibilities.
              We value inclusivity, collaboration, and quality over quantity.
            </p>
          </div>

          {/* Values Grid */}
          <div className="grid md:grid-cols-3 gap-12 max-w-6xl mx-auto">
            {values.map((value) => (
              <div key={value.title} className="text-center">
                <div
                  className={`w-16 h-16 rounded-full ${value.bgColor} flex items-center justify-center mx-auto mb-6`}
                >
                  <value.icon className={`w-8 h-8 ${value.color}`} />
                </div>

                <h3 className="font-display text-xl mb-4">{value.title}</h3>

                <p className="text-muted-foreground font-body text-sm leading-relaxed">
                  {value.description}
                </p>
              </div>
            ))}
          </div>
      </section>

        {/* Decorative Divider */}
        <div className="relative py-8">
          <div className="absolute inset-x-0 top-1/2 h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent" />
          <div className="flex justify-center gap-2">
            <div className="w-2 h-2 rounded-full bg-[hsl(var(--icon-lime))]" />
            <div className="w-2 h-2 rounded-full bg-[hsl(var(--icon-cyan))]" />
            <div className="w-2 h-2 rounded-full bg-[hsl(var(--icon-red))]" />
          </div>
        </div>

        {/* Event Formats */}
        <section className="py-24 md:py-32 bg-gradient-to-br from-muted/30 via-background to-muted/10">
          <div className="container mx-auto px-6 max-w-6xl text-center">
            <h2 className="font-display text-4xl md:text-5xl mb-6 leading-tight">
              Event <span className="text-primary italic">Formats</span>
            </h2>

            <p className="text-muted-foreground font-body text-lg mb-16">
              Our events are designed to be enjoyable and productive, offering a
              mix of networking opportunities:
            </p>

            <div className="grid md:grid-cols-3 gap-12 max-w-6xl mx-auto">
              {eventFormats.map((format) => (
                <div key={format.title} className="text-center">
                  <div className={`w-16 h-16 rounded-full ${format.bgColor} flex items-center justify-center mx-auto mb-6`}>
                    <format.icon className={`w-8 h-8 ${format.color}`} />
                  </div>

                  <h3 className="font-display text-xl mb-4">{format.title}</h3>

                  <p className="text-muted-foreground font-body text-sm leading-relaxed">
                    {format.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Decorative Divider */}
        <div className="relative py-8">
          <div className="absolute inset-x-0 top-1/2 h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent" />
          <div className="flex justify-center">
            <div className="w-3 h-3 rounded-full bg-primary/60 ring-4 ring-primary/20" />
          </div>
        </div>

        {/* Testimonials */}
        <TestimonialsSection />

        {/* Decorative Divider */}
        <div className="relative py-12">
          <div className="absolute inset-x-0 top-1/2 h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent" />
          <div className="flex justify-center gap-2">
            <div className="w-2 h-2 rounded-full bg-[hsl(var(--icon-lime))]" />
            <div className="w-2 h-2 rounded-full bg-[hsl(var(--icon-cyan))]" />
            <div className="w-2 h-2 rounded-full bg-[hsl(var(--icon-red))]" />
          </div>
        </div>

        {/* CTA */}
        <section className="py-24 md:py-32 relative bg-gradient-to-b from-background via-muted/20 to-background">
          <div className="container mx-auto px-6">
            <div className="max-w-4xl mx-auto text-center bg-gradient-to-br from-primary/10 via-background to-primary/5 rounded-3xl border border-primary/20 p-16 md:p-20">
              <h2 className="font-display text-4xl md:text-5xl lg:text-6xl mb-8 leading-tight">
                Ready to <span className="text-primary">Join Us?</span>
              </h2>

              <p className="text-muted-foreground font-body text-lg leading-relaxed mb-10 max-w-2xl mx-auto">
                Be part of the next generation of media industry connections.
                Our events are free, invite‑only, and designed for high‑value
                networking.
              </p>

              <Button
                size="lg"
                className="bg-primary text-primary-foreground hover:bg-primary/90 px-10 py-6 text-base"
                onClick={() => setIsFormOpen(true)}
              >
                Register Your Interest
              </Button>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default About;
