import { motion } from "framer-motion";
import { Rocket, Clapperboard, Tv } from "lucide-react";
const WhoAttendsSection = () => {
  const statColumns = [{
    icon: Rocket,
    number: "The Top 3",
    label: "Global Tech Giants",
    color: "text-amber-500",
    bgColor: "bg-amber-500/10"
  }, {
    icon: Clapperboard,
    number: "The Major 5",
    label: "Hollywood Studios",
    color: "text-rose-500",
    bgColor: "bg-rose-500/10"
  }, {
    icon: Tv,
    number: "The Leading 8",
    label: "Streaming Platforms",
    color: "text-emerald-500",
    bgColor: "bg-emerald-500/10"
  }];
  return <section className="py-24 relative bg-muted/30 md:py-[80px]">
      <div className="container mx-auto px-6">
        <div className="max-w-4xl mx-auto lg:mx-0">
          {/* Headline - matching About Us typography, left aligned */}
          <motion.h2 className="font-display text-4xl md:text-5xl lg:text-6xl mb-10 leading-tight mx-[24px]" initial={{
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
            Who{" "}
            <span className="text-primary italic">Attends</span>
          </motion.h2>

          {/* Body Copy - left aligned */}
          <motion.div className="space-y-6 text-muted-foreground font-body text-lg leading-relaxed max-w-3xl mb-16 mx-[24px]" initial={{
          opacity: 0,
          y: 20
        }} whileInView={{
          opacity: 1,
          y: 0
        }} viewport={{
          once: true
        }} transition={{
          duration: 0.6,
          delay: 0.1
        }}>
            <p>
              Over 300 companies across media, entertainment and technology have attended our events.
            </p>
            <p>Our events are free, invite‑only and curated for a maximum of 120 guests, attracting industry leaders and innovators. This includes over 100 board‑level executives and 34 startup founders to date.</p>
            
          </motion.div>

          {/* Stat Columns - Premium 3-column layout, centered content */}
          <motion.div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 pt-12 border-t border-border" initial={{
          opacity: 0,
          y: 20
        }} whileInView={{
          opacity: 1,
          y: 0
        }} viewport={{
          once: true
        }} transition={{
          duration: 0.6,
          delay: 0.2
        }}>
            {statColumns.map((stat, index) => <motion.div key={stat.label} className="flex flex-col items-center text-center p-4" initial={{
            opacity: 0,
            y: 20
          }} whileInView={{
            opacity: 1,
            y: 0
          }} viewport={{
            once: true
          }} transition={{
            duration: 0.5,
            delay: 0.3 + index * 0.1
          }}>
                <div className={`w-20 h-20 rounded-full ${stat.bgColor} flex items-center justify-center mb-5`}>
                  <stat.icon className={`w-10 h-10 ${stat.color}`} />
                </div>
                <p className="font-display text-2xl md:text-3xl text-foreground mb-2 tracking-tight">
                  {stat.number}
                </p>
                <p className="text-muted-foreground font-body text-sm uppercase tracking-wider">
                  {stat.label}
                </p>
              </motion.div>)}
          </motion.div>
        </div>
      </div>
    </section>;
};
export default WhoAttendsSection;