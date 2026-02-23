import { motion } from "framer-motion";
import { Users, Heart, Star } from "lucide-react";
import SectionHeader from "@/components/shared/SectionHeader";

type IconKey = "users" | "heart" | "star";

interface ValueItem {
  icon: IconKey;
  title: string;
  description: string;
  color: string;
  bgColor: string;
}

interface MissionValuesSectionProps {
  section: {
    type: "missionValues";
    title: string;
    accentWord: string;
    description: string;
    values: ValueItem[];
  };
}

const iconMap: Record<
  IconKey,
  React.ComponentType<React.SVGProps<SVGSVGElement>>
> = {
  users: Users,
  heart: Heart,
  star: Star,
};

const MissionValuesSection = ({ section }: MissionValuesSectionProps) => {
  const { title, accentWord, description, values } = section;

  return (
    <section className="py-24 md:py-32 bg-gradient-to-b from-background via-secondary/20 to-background relative overflow-hidden px-6">
      <div className="container mx-auto text-center max-w-4xl mb-16">
        <SectionHeader
          title={title}
          accentWord={accentWord}
          description={description}
        />
      </div>

      <div className="grid md:grid-cols-3 gap-12 max-w-6xl mx-auto px-6">
        {values.map((value, index) => {
          const IconComponent = iconMap[value.icon] ?? Users;

          return (
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
                <IconComponent className={`w-8 h-8 ${value.color}`} />
              </div>

              <h3 className="font-display text-xl mb-4">{value.title}</h3>
              <p className="text-muted-foreground font-body text-sm leading-relaxed">
                {value.description}
              </p>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
};

export default MissionValuesSection;
