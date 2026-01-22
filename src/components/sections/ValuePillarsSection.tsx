import { Users, Lightbulb, Megaphone, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

const pillars = [
  {
    icon: Users,
    title: "Grow Your Network",
    description: "Connect with industry leaders and decision-makers from the world's leading media companies. Build relationships that accelerate your career and business.",
    cta: "Join Community",
    color: "text-[hsl(var(--icon-lime))]",
    bgColor: "bg-[hsl(var(--icon-lime)/0.1)]",
    hoverBgColor: "group-hover:bg-[hsl(var(--icon-lime)/0.2)]",
  },
  {
    icon: Lightbulb,
    title: "Keep Informed",
    description: "Stay ahead of industry trends with exclusive insights from thought leaders. Access knowledge that shapes the future of media and entertainment.",
    cta: "Explore Events",
    color: "text-[hsl(var(--icon-cyan))]",
    bgColor: "bg-[hsl(var(--icon-cyan)/0.1)]",
    hoverBgColor: "group-hover:bg-[hsl(var(--icon-cyan)/0.2)]",
  },
  {
    icon: Megaphone,
    title: "Share Your Vision",
    description: "Platform your ideas and innovations to an engaged audience of media professionals. Showcase your expertise and influence the industry conversation.",
    cta: "Support Our Events",
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
    <section className="py-24 md:py-32 bg-card relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-64 h-64 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto px-6 relative z-10">
        <motion.div className="text-center mb-16" initial={{
          opacity: 0,
          y: 20
        }} whileInView={{
          opacity: 1,
          y: 0
        }} viewport={{
          once: true
        }} transition={{
          duration: 0.6
        }}>
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
            Why <span className="text-gradient font-script pr-2">Attend</span>
          </h2>
        </motion.div>

        {/* Pillars grid */}
        <div className="grid md:grid-cols-3 gap-8">
          {pillars.map((pillar, index) => (
            <div
              key={pillar.title}
              className="group bg-background border border-border rounded-2xl p-8 hover:border-primary/50 transition-all duration-300 hover:-translate-y-1 flex flex-col items-center"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              {/* Icon */}
              <div className={`w-16 h-16 rounded-xl ${pillar.bgColor} flex items-center justify-center mb-6 ${pillar.hoverBgColor} transition-colors mx-auto`}>
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
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};

export default ValuePillarsSection;
