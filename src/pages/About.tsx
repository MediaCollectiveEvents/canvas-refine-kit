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
import FAQSection from "@/components/sections/FAQSection";
import { Button } from "@/components/ui/button";
import EventRegistrationForm from "@/components/EventRegistrationForm";
import PageHero from "@/components/shared/PageHero";
import SectionDivider from "@/components/shared/SectionDivider";
import SectionHeader from "@/components/shared/SectionHeader";
import heroImage from "@/assets/hero-placeholder.jpg";
import PageCTA from "@/components/shared/PageCTA";

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
      <PageHero
        eyebrow="Our Community"
        title="Our Story"
        description="Born during a time of remote work and limited in-person interaction, The Media Collective was created to reconnect the industry."
        variant="image"
        backgroundImage={heroImage}
      />

      {/* Gradient Divider */}
      <SectionDivider gradient />

      <main className="pt-16 lg:pt-20">
        {/* Who Attends */}
        <WhoAttendsSection />

        <SectionDivider />

        {/* Mission & Values */}
        <section className="py-24 md:py-32 bg-gradient-to-b from-background via-secondary/20 to-background relative overflow-hidden px-6">
          <div className="container mx-auto text-center max-w-4xl mb-16">
            <SectionHeader
              title="Our "
              accentWord="Mission & Values"
              description="Our mission is simple: create opportunities for companies of all sizes to connect, exchange ideas, and explore new possibilities."
            />
          </div>

          <div className="grid md:grid-cols-3 gap-12 max-w-6xl mx-auto px-6">
            {values.map((value, index) => (
              <motion.div
                key={value.title}
                className="text-center"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <div
                  className={`w-16 h-16 rounded-full ${value.bgColor} flex items-center justify-center mx-auto mb-6`}
                >
                  <value.icon className={`w-8 h-8 ${value.color}`} />
                </div>

                <h3 className="font-display text-xl mb-4">{value.title}</h3>
                <p className="text-muted-foreground font-body text-sm leading-relaxed">
                  {value.description}
                </p>
              </motion.div>
            ))}
          </div>
        </section>

        <SectionDivider />

        {/* Event Formats */}
        <section className="py-24 md:py-32 bg-gradient-to-b from-background via-secondary/20 to-background relative overflow-hidden px-6">
          <div className="container mx-auto max-w-6xl text-center">
            <SectionHeader
              title="Event "
              accentWord="Formats"
              description="Our events are designed to be enjoyable and productive, offering a mix of networking opportunities:"
            />

            <div className="grid md:grid-cols-3 gap-12 max-w-6xl mx-auto">
              {eventFormats.map((format, index) => (
                <motion.div
                  key={format.title}
                  className="text-center"
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <div
                    className={`w-16 h-16 rounded-full ${format.bgColor} flex items-center justify-center mx-auto mb-6`}
                  >
                    <format.icon className={`w-8 h-8 ${format.color}`} />
                  </div>

                  <h3 className="font-display text-xl mb-4">{format.title}</h3>
                  <p className="text-muted-foreground font-body text-sm leading-relaxed">
                    {format.description}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        <SectionDivider />

        {/* Testimonials */}
        <TestimonialsSection />

        {/* FAQ */}
        <FAQSection />

        {/* Single Divider before CTA */}
        <SectionDivider className="py-12" />

        {/* CTA */}
        <PageCTA onClick={() => setIsFormOpen(true)} />
      </main>

      <Footer />
    </div>
  );
};

export default About;
