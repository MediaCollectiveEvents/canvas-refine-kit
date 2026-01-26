
import { motion } from "framer-motion";
import SectionHeader from "@/components/shared/SectionHeader";

const AboutSection = () => {
  return (
    <section
      id="about"
      className="py-24 md:py-32 relative"
    >
      <div className="container mx-auto px-6">
        <div className="max-w-3xl mx-auto text-center">
          
          {/* Unified Section Header */}
          <SectionHeader
            title="About "
            accentWord="Us"
          />

          <motion.div
            className="space-y-6 text-muted-foreground font-body text-lg leading-relaxed"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
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
          </motion.div>

        </div>
      </div>
    </section>
  );
};

export default AboutSection;
