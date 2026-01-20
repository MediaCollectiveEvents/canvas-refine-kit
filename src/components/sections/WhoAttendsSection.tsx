import { motion } from "framer-motion";
import { Rocket, Clapperboard, Tv } from "lucide-react";

const WhoAttendsSection = () => {
  const statColumns = [
    {
      icon: Rocket,
      number: "The Top 3",
      label: "Global Tech Giants",
    },
    {
      icon: Clapperboard,
      number: "The Major 5",
      label: "Hollywood Studios",
    },
    {
      icon: Tv,
      number: "The Leading 8",
      label: "Streaming Platforms",
    },
  ];

  return (
    <section className="py-24 md:py-32 relative bg-muted/30">
      <div className="container mx-auto px-6">
        <div className="max-w-4xl mx-auto text-center">
          {/* Headline - matching About Us typography */}
          <motion.h2
            className="font-display text-4xl md:text-5xl lg:text-6xl mb-10 leading-tight uppercase tracking-wide"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            Who{" "}
            <span className="text-primary italic normal-case">Attends</span>
          </motion.h2>

          {/* Body Copy */}
          <motion.div
            className="space-y-6 text-muted-foreground font-body text-lg leading-relaxed max-w-3xl mx-auto mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <p>
              Over 300 companies across media, entertainment and technology have attended our events.
            </p>
            <p>
              Our events are free, invite‑only and curated for a maximum of 120 guests, attracting industry leaders and innovators.
            </p>
            <p>
              This includes over <span className="text-foreground font-medium">100 board‑level executives</span> and <span className="text-foreground font-medium">34 startup founders</span> to date.
            </p>
            <p className="text-sm text-muted-foreground/70">
              <a href="https://wingding.tv" target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors underline underline-offset-2">wingding.tv</a>
              {" · "}
              <a href="https://thewrap.com" target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors underline underline-offset-2">thewrap.com</a>
            </p>
          </motion.div>

          {/* Stat Columns - Premium 3-column layout */}
          <motion.div
            className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12 pt-12 border-t border-border"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            {statColumns.map((stat, index) => (
              <motion.div
                key={stat.label}
                className="flex flex-col items-center text-center p-6"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.3 + index * 0.1 }}
              >
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-6">
                  <stat.icon className="w-8 h-8 text-primary" />
                </div>
                <p className="font-display text-3xl md:text-4xl text-primary mb-3 tracking-tight">
                  {stat.number}
                </p>
                <p className="text-muted-foreground font-body text-sm uppercase tracking-wider">
                  {stat.label}
                </p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default WhoAttendsSection;
