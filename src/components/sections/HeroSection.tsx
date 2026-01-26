
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
          <div className="text-center lg:text-left order-2 lg:order-1">
            {/* Eyebrow text */}
            <motion.p 
              className="text-primary-foreground/80 font-body text-sm uppercase tracking-[0.3em] mb-6"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              The Media Collective
            </motion.p>

            {/* Main headline */}
            <h1 className="text-5xl md:text-6xl lg:text-7xl leading-[1.1] mb-10">
              <span
                className="font-script text-white animate-fade-in block md:text-7xl lg:text-8xl mb-4"
                style={{
                  animationDelay: "0.1s",
                  textShadow:
                    "0 4px 20px rgba(0, 0, 0, 0.4), 0 8px 40px rgba(0, 0, 0, 0.3), 0 2px 4px rgba(0, 0, 0, 0.2)",
                }}
              >
                Curated Events
              </span>
              <span
                className="text-primary-foreground animate-fade-in font-body text-3xl md:text-4xl lg:text-5xl"
                style={{ animationDelay: "0.2s" }}
              >
                connecting{" "}
              </span>
              <span
                className="animate-fade-in font-body uppercase text-3xl md:text-4xl lg:text-5xl italic text-muted-foreground"
                style={{
                  animationDelay: "0.3s",
                  textShadow:
                    "0 2px 10px rgba(255, 255, 255, 0.6), 0 4px 20px rgba(255, 255, 255, 0.4), 0 0 30px rgba(255, 255, 255, 0.3)",
                }}
              >
                MEDIA, ENTERTAINMENT, AND TECHNOLOGY
              </span>
            </h1>

            {/* Description */}
            <motion.p
              className="text-primary-foreground/70 font-body text-base md:text-lg mb-8 max-w-lg mx-auto lg:mx-0"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              Exclusive networking events for senior executives and innovators across the global media landscape.
            </motion.p>

            {/* CTA */}
            <div className="flex justify-center lg:justify-start">
              <Button
                size="lg"
                className="rounded-full font-body uppercase tracking-wider text-sm bg-primary-foreground text-primary hover:bg-primary-foreground/90 px-8"
                onClick={onRegisterClick}
              >
                Register Your Interest
              </Button>
            </div>
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
