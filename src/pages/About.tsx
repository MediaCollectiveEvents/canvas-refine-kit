import { useState } from "react";
import { motion } from "framer-motion";
import { Users, Heart, Star } from "lucide-react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import WhoAttendsSection from "@/components/sections/WhoAttendsSection";
import TestimonialsSection from "@/components/sections/TestimonialsSection";
import { Button } from "@/components/ui/button";
import EventRegistrationForm from "@/components/EventRegistrationForm";

const values = [
  {
    icon: Users,
    title: "Community First",
    description: "Encouraging genuine connections and shared learning.",
    color: "text-[hsl(var(--icon-lime))]",
    bgColor: "bg-[hsl(var(--icon-lime)/0.1)]",
  },
  {
    icon: Heart,
    title: "Inclusivity & Balance",
    description: "Bringing together a mix of voices and perspectives.",
    color: "text-[hsl(var(--icon-magenta))]",
    bgColor: "bg-[hsl(var(--icon-magenta)/0.1)]",
  },
  {
    icon: Star,
    title: "Quality Over Quantity",
    description: "Curated guestlists for comfortable, relaxed environments.",
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
      
      <main className="pt-40 lg:pt-48">
        {/* 1. Our Story */}
        <section className="py-24 md:py-32 relative">
          <div className="container mx-auto px-6">
            <div className="text-center max-w-4xl mx-auto">
              <motion.p
                className="text-primary font-body text-sm uppercase tracking-[0.3em] mb-4"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
              >
                About Us
              </motion.p>
              <motion.h1
                className="font-display text-4xl md:text-5xl lg:text-6xl mb-8 leading-tight"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
              >
                Our <span className="text-primary italic">Story</span>
              </motion.h1>
              <motion.p
                className="text-muted-foreground font-body text-lg leading-relaxed"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                The Media Collective began during a time when lockdowns prevented in-person interaction. 
                The absence of face-to-face connection highlighted to us the importance of coming together. 
                Remote work changed how we collaborate, but it reinforced the need to meet, share ideas, 
                and build real connections. That's why we created The Media Collective.
              </motion.p>
            </div>
          </div>
        </section>

        {/* 2. Who Attends (moved up for credibility) */}
        <WhoAttendsSection />

        {/* 3. Mission & Values (merged) */}
        <section className="py-24 md:py-32 relative">
          <div className="container mx-auto px-6">
            <div className="text-center max-w-4xl mx-auto mb-16">
              <motion.h2
                className="font-display text-4xl md:text-5xl mb-8 leading-tight"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
              >
                Our <span className="text-primary italic">Mission & Values</span>
              </motion.h2>
              <motion.p
                className="text-muted-foreground font-body text-lg leading-relaxed"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.1 }}
              >
                We create opportunities for companies of all sizes to connect, exchange ideas, 
                and explore new possibilities. Progress happens through collaboration and fresh thinking.
              </motion.p>
            </div>

            {/* Values Grid */}
            <motion.div
              className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              {values.map((value, index) => (
                <motion.div
                  key={value.title}
                  className="text-center p-8 bg-card rounded-2xl border border-border"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: 0.3 + index * 0.1 }}
                >
                  <div className={`w-16 h-16 rounded-full ${value.bgColor} flex items-center justify-center mx-auto mb-5`}>
                    <value.icon className={`w-8 h-8 ${value.color}`} />
                  </div>
                  <h3 className="font-display text-xl mb-3">{value.title}</h3>
                  <p className="text-muted-foreground font-body text-sm leading-relaxed">
                    {value.description}
                  </p>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* 4. Our Focus */}
        <section className="py-24 md:py-32 relative bg-muted/30">
          <div className="container mx-auto px-6">
            <motion.h2
              className="font-display text-4xl md:text-5xl mb-12 leading-tight text-center"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              Our <span className="text-primary italic">Focus</span>
            </motion.h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
              {[
                { title: "Curated Experiences", desc: "Planned for relevance and value." },
                { title: "Convenient Locations", desc: "Great venues that make participation easy." },
                { title: "Networking That Works", desc: "Smaller groups for stronger connections." },
                { title: "Innovation at the Core", desc: "Exploring new concepts and paths." },
              ].map((item, index) => (
                <motion.div
                  key={item.title}
                  className="bg-card rounded-2xl border border-border p-6 text-center"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <h3 className="font-display text-lg mb-2 text-primary">{item.title}</h3>
                  <p className="text-muted-foreground font-body text-sm leading-relaxed">
                    {item.desc}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* 5. Testimonials */}
        <TestimonialsSection />

        {/* 7. CTA Banner */}
        <section className="py-24 md:py-32 relative">
          <div className="container mx-auto px-6">
            <motion.div
              className="max-w-4xl mx-auto text-center bg-gradient-to-br from-primary/10 via-background to-primary/5 rounded-3xl border border-primary/20 p-12 md:p-16"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="font-display text-3xl md:text-4xl lg:text-5xl mb-6 leading-tight">
                Ready to <span className="text-primary italic">Join Us</span>?
              </h2>
              <p className="text-muted-foreground font-body text-lg leading-relaxed mb-8 max-w-2xl mx-auto">
                Be part of the next generation of media industry connections. 
                Our events are free, invite-only, and designed for meaningful networking.
              </p>
              <Button
                size="lg"
                className="bg-primary text-primary-foreground hover:bg-primary/90 px-8 py-6 text-base"
                onClick={() => setIsFormOpen(true)}
              >
                Register Your Interest
              </Button>
            </motion.div>
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  );
};

export default About;
