import { motion } from "framer-motion";
import { Users, Heart, Star } from "lucide-react";
import SectionHeader from "@/components/shared/SectionHeader";

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

const MissionValuesSection = () => {
  return (
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
  );
};

export default MissionValuesSection;
