import { motion } from "framer-motion";
import SectionHeader from "@/components/shared/SectionHeader";
import about from "@/content/about.json";

const AboutSection = () => {
  return (
    <section
      id="about"
      className="py-24 md:py-32 bg-gradient-to-b from-background via-secondary/20 to-background relative overflow-hidden"
    >
      {/* Background decoration */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
      </div>
      <div className="container mx-auto px-6 relative z-10">
        <div className="max-w-3xl mx-auto text-center">
          {/* Unified Section Header */}
          <SectionHeader title={about.title} accentWord={about.accent} />

          <motion.div
            className="space-y-6 text-muted-foreground font-body text-lg leading-relaxed"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <div dangerouslySetInnerHTML={{ __html: about.intro }} />
            {about.body && (
              <div dangerouslySetInnerHTML={{ __html: about.body }} />
            )}
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default AboutSection;
