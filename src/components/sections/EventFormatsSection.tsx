import { motion } from "framer-motion";
  Coffee,
  Wine,
  Clapperboard,
  Presentation,
  Laptop,
  Rocket,
} from "lucide-react";
import SectionHeader from "@/components/shared/SectionHeader";

const eventFormats = [
  // TOP ROW — keep the current visual order
  {
    icon: Coffee,
    title: "Networking Breakfasts",
    description:
      "Start the day with industry peers over coffee and conversation.",
    color: "text-[hsl(var(--icon-lime))]",
    bgColor: "bg-[hsl(var(--icon-lime)/0.1)]",
  },
  {
    icon: Clapperboard,
    title: "Film Screenings",
    description: "Exclusive previews and discussions with industry leaders.",
    color: "text-[hsl(var(--icon-red))]",
    bgColor: "bg-[hsl(var(--icon-red)/0.1)]",
  },
  {
    icon: Wine,
    title: "Drinks Receptions",
    description: "Relaxed evening networking in premium venues.",
    color: "text-[hsl(var(--icon-cyan))]",
    bgColor: "bg-[hsl(var(--icon-cyan)/0.1)]",
  },

  // BOTTOM ROW — three distinct, balanced colours (no repetition)
  {
    icon: Presentation,
    title: "Conference Reviews",
    description:
      "In-person mini summits with curated discussions and insights.",
    color: "text-amber-400",
    bgColor: "bg-amber-400/10",
  },
  {
    icon: Laptop,
    title: "Webinars",
    description: "Virtual knowledge sharing and interactive sessions.",
    color: "text-sky-400",
    bgColor: "bg-sky-400/10",
  },
  {
    icon: Rocket,
    title: "Bespoke Events",
    description: "Tailored experiences designed for your brand objectives.",
    color: "text-fuchsia-400",
    bgColor: "bg-fuchsia-400/10",
  },
];

const EventFormatsSection = () => {
  return (
    <section className="py-24 md:py-32 bg-gradient-to-b from-background via-secondary/20 to-background relative overflow-hidden px-6">
      <div className="container mx-auto max-w-6xl text-center">
        <SectionHeader
          title="Event "
          accentWord="Formats"
          description="Our events are designed to be enjoyable and productive, offering a mix of networking opportunities:"
        />

        <div className="grid md:grid-cols-3 gap-12 max-w-6xl mx-auto mt-16">
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
  );
};

export default EventFormatsSection;
``;
