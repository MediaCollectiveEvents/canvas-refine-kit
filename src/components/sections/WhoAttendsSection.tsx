
import { motion } from "framer-motion";
import { Cpu, Clapperboard, Wifi } from "lucide-react";

const stats = [
  {
    icon: Cpu,
    title: "The Top 3",
    subtitle: "Global Tech Giants",
    color: "text-[hsl(var(--icon-lime))]",
    bgColor: "bg-[hsl(var(--icon-lime)/0.1)]",
  },
  {
    icon: Clapperboard,
    title: "The Major 5",
    subtitle: "Hollywood Studios",
    color: "text-[hsl(var(--icon-cyan))]",
    bgColor: "bg-[hsl(var(--icon-cyan)/0.1)]",
  },
  {
    icon: Wifi,
    title: "The Leading 8",
    subtitle: "Streaming Platforms",
    color: "text-[hsl(var(--icon-red))]",
    bgColor: "bg-[hsl(var(--icon-red)/0.1)]",
  },
];

const WhoAttendsSection = () => {
  return (
    <section className="py-24 md:py-32 relative">
      <div className="container mx-auto px-6 text-center max-w-6xl">

        {/* Updated section header */}
        <motion.h2
          className="font-display text-4xl md:text-5xl mb-6 leading-tight"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          Who <span className="text-primary italic">Attends</span>
        </motion.h2>

        <p className="text-muted-foreground font-body text-lg mb-4">
          Over 300 companies across media, entertainment and technology have attended our events.
        </p>

        <p className="text-muted-foreground font-body text-lg mb-12">
          Our events are free, invite-only and curated for a maximum of 120 guests,
          attracting industry leaders and innovators. This includes over 
          100 board-level executives and 34 startup founders.
        </p>

        <hr className="border-border mb-12" />

        <div className="grid md:grid-cols-3 gap-12">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="text-center p-8 bg-card rounded-2xl border border-border"
            >
              <div
                className={`w-16 h-16 rounded-full ${stat.bgColor} flex items-center justify-center mx-auto mb-5`}
              >
                <stat.icon className={`w-8 h-8 ${stat.color}`} />
              </div>

              <h3 className="font-display text-xl mb-2">{stat.title}</h3>

              <p className="text-muted-foreground font-body text-sm uppercase tracking-wide">
                {stat.subtitle}
              </p>
            </motion.div>
          ))}
        </div>

      </div>
    </section>
  );
};

export default WhoAttendsSection;
``
