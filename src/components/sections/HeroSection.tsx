
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
      className="min-h-[85vh] flex items-center relative overflow-hidden bg-primary"
    >
      <div className="container mx-auto px-8 md:px-12 lg:px-16 relative z-10">
        <div className="flex flex-col lg:flex-row items-center gap-1.5 lg:gap-2 pt-32 lg:pt-36 pb-24 lg:pb-28">
          {/* Text content - left side */}
          <div className="lg:w-[45%] text-center lg:text-left lg:pl-8">
            {/* Eyebrow text */}
            <p className="text-primary-foreground/80 font-body text-sm uppercase tracking-[0.3em] mb-12">
              &nbsp;
            </p>

            {/* Main headline */}
            <h1 className="text-5xl md:text-6xl lg:text-7xl leading-[1.1] mb-10">
              <span
                className="font-satisfy text-white animate-fade-in block md:text-7xl lg:text-8xl mb-4"
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
                className="animate-fade-in font-body uppercase text-3xl md:text-4xl lg:text-5xl italic"
                style={{
                  animationDelay: "0.3s",
                  color: "#6b7280",
                  textShadow:
                    "0 2px 10px rgba(255, 255, 255, 0.6), 0 4px 20px rgba(255, 255, 255, 0.4), 0 0 30px rgba(255, 255, 255, 0.3)",
                }}
              >
                MEDIA, ENTERTAINMENT, AND TECHNOLOGY
              </span>
            </h1>

            {/* CTA */}
            <div className="flex justify-center lg:justify-start">
              <Button
                size="lg"
                className="bg-primary-foreground text-primary hover:bg-primary-foreground/90 px-8 py-4 text-base"
                onClick={onRegisterClick}
              >
                Register Your Interest
              </Button>
            </div>
          </div>

          {/* People illustration - right side with parallax */}
          <motion.div
            className="lg:w-[55%] w-full origin-center lg:ml-8"
            style={{ y, scale }}
          >
            <img
              src={heroPeople}
              alt="People networking at events"
              className="w-full h-auto"
            />
          </motion.div>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 animate-bounce">
        <div className="w-6 h-10 border-2 border-primary-foreground/50 rounded-full flex justify-center pt-2">
          <div className="w-1 h-2 bg-primary-foreground rounded-full" />
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
``
