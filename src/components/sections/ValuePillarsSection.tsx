
import { Users, Lightbulb, Megaphone } from "lucide-react";
import { motion } from "framer-motion";
import SectionHeader from "@/components/shared/SectionHeader";

const pillars = [
  {
    icon: Users,
    title: "Grow Your Network",
    description:
      "Connect with industry leaders and decision-makers from the world's leading media companies. Build relationships that accelerate your career and business.",
    color: "text-[hsl(var(--icon-lime))]",
    bgColor: "bg-[hsl(var(--icon-lime)/0.1)]",
    hoverBgColor: "group-hover:bg-[hsl(var(--icon-lime)/0.2)]",
  },
  {
    icon: Lightbulb,
    title: "Keep Informed",
    description:
      "Stay ahead of industry trends with exclusive insights from thought leaders. Access knowledge that shapes the future of media and entertainment.",
    color: "text-[hsl(var(--icon-cyan))]",
    bgColor: "bg-[hsl(var(--icon-cyan)/0.1)]",
    hoverBgColor: "group-hover:bg-[hsl(var(--icon-cyan)/0.2)]",
  },
  {
    icon: Megaphone,
    title: "Share Your Vision",
    description:
      "Platform your ideas and innovations to an engaged audience of media professionals. Showcase your expertise and influence the industry conversation.",
    color: "text-[hsl(var(--icon-red))]",
    bgColor: "bg-[hsl(var(--icon-red)/0.1)]",
    hoverBgColor: "group-hover:bg-[hsl(var(--icon-red)/0.2)]",
  },
];

interface ValuePillarsSectionProps {
  onRegisterClick?: () => void;
}

const ValuePillarsSection = ({ onRegisterClick }: ValuePillarsSectionProps) => {
  return (
    <section className="py-24 md:py-32 bg-gradient-to-b from-background via-secondary/20 to-background relative overflow-hidden">
      {/* Background Decoration */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-64 h-64 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto px-6 relative z-10">
        {/* Section Header */}
        <SectionHeader
          title="Why "
          accentWord="Attend"
        />

        {/* Pillars Grid */}
        <div className="grid md:grid-cols-3 gap-8">
          {pillars.map((pillar, index) => (
            <motion.div
              key={pillar.title}
              className="group bg-background border border-border rounded-2xl p-8 hover:border-primary/50 transition-all duration-300 hover:-translate-y-1 flex flex-col items-center"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              {/* Icon */}
              <div
                className={`w-16 h-16 rounded-full ${pillar.bgColor} ${pillar.hoverBgColor} flex items-center justify-center mb-6 transition-colors mx-auto`}
              >
                <pillar.icon className={`w-8 h-8 ${pillar.color}`} />
              </div>

              {/* Title */}
              <h3 className="font-display text-2xl mb-4 group-hover:text-primary transition-colors text-center">
                {pillar.title}
              </h3>

              {/* Description */}
              <p className="text-muted-foreground font-body leading-relaxed text-center">
                {pillar.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ValuePillarsSection;
