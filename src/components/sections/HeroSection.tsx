
import { Button } from "@/components/ui/button";
import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import heroPeople from "@/assets/hero-people.png";

interface HeroSectionProps {
  onRegisterClick?: () => void;
}

const HeroSection = ({ onRegisterClick }: HeroSectionProps) => {
  const sectionRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end start"],
  });

  // Parallax effect - image moves slower than scroll
  const y = useTransform(scrollYProgress, [0, 1], [0, 200]);
  const scale = useTransform(scrollYProgress, [0, 1], [1.3, 1.1]);

  return (
    <section
      ref={sectionRef}
      className="min-h-screen flex items-center relative overflow-hidden bg-primary"
    >
      <div className="container mx-auto px-6 md:px-8 lg:px-12 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 items-center gap-8 lg:gap-4 pt-40 lg:pt-32 pb-24">
          {/* Text content - left side */}
          <div className="text-center lg:text-left order-2 lg:order-1 space-y-8">
            {/* Eyebrow text */}
            <motion.p 
              className="text-primary-foreground/80 font-body text-xs md:text-sm uppercase tracking-[0.3em]"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              The Media Collective
            </motion.p>

            {/* Main headline - restructured for better flow */}
            <div className="space-y-4">
              <motion.h1
                className="font-script text-5xl md:text-7xl lg:text-8xl text-white pr-2"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
                style={{
                  textShadow:
                    "0 4px 20px rgba(0, 0, 0, 0.4), 0 8px 40px rgba(0, 0, 0, 0.3)",
                }}
              >
                Curated Events
              </motion.h1>
              
              <motion.p
                className="font-body text-2xl md:text-3xl lg:text-4xl text-primary-foreground"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                connecting
              </motion.p>
              
              <motion.p
                className="font-body text-xl md:text-2xl lg:text-3xl uppercase italic tracking-wide"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
              >
                <span className="text-[hsl(var(--icon-lime))]">Media</span>
                <span className="text-primary-foreground/60">, </span>
                <span className="text-[hsl(var(--icon-cyan))]">Entertainment</span>
                <span className="text-primary-foreground/60">, and </span>
                <span className="text-[hsl(var(--icon-red))]">Technology</span>
              </motion.p>
            </div>

            {/* Description */}
            <motion.p
              className="text-primary-foreground/70 font-body text-base md:text-lg max-w-md mx-auto lg:mx-0 leading-relaxed"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              Exclusive networking events for senior executives and innovators across the global media landscape.
            </motion.p>

            {/* CTA */}
            <motion.div 
              className="flex justify-center lg:justify-start pt-2"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.5 }}
            >
              <Button
                size="lg"
                className="bg-primary-foreground text-primary hover:bg-primary-foreground/90 px-8 py-6 text-base font-body uppercase tracking-wider"
                onClick={onRegisterClick}
              >
                Register Your Interest
              </Button>
            </motion.div>
          </div>

          {/* People illustration - right side with parallax */}
          <motion.div
            className="w-full flex justify-center lg:justify-end order-1 lg:order-2"
            style={{ y, scale }}
          >
            <img
              src={heroPeople}
              alt="People networking at events"
              className="w-full max-w-md lg:max-w-none lg:w-[110%] h-auto drop-shadow-2xl"
            />
          </motion.div>
        </div>
      </div>

      {/* Scroll indicator */}
      <motion.div 
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1, y: [0, 8, 0] }}
        transition={{ 
          opacity: { delay: 1, duration: 0.5 },
          y: { delay: 1, duration: 1.5, repeat: Infinity, ease: "easeInOut" }
        }}
      >
        <div className="w-6 h-10 border-2 border-primary-foreground/50 rounded-full flex justify-center pt-2">
          <div className="w-1 h-2 bg-primary-foreground rounded-full" />
        </div>
      </motion.div>
    </section>
  );
};

export default HeroSection;
``
