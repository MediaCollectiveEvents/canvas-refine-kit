import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import heroPeople from "@/assets/hero-people.png";
interface HeroSectionProps {
  onRegisterClick?: () => void;
}
const HeroSection = ({
  onRegisterClick
}: HeroSectionProps) => {
  const sectionRef = useRef<HTMLElement>(null);
  const {
    scrollYProgress
  } = useScroll({
    target: sectionRef,
    offset: ["start start", "end start"]
  });

  // Parallax effect - image moves slower than scroll
  const y = useTransform(scrollYProgress, [0, 1], [0, 200]);
  const scale = useTransform(scrollYProgress, [0, 1], [1.3, 1.1]);
  return <section ref={sectionRef} className="min-h-[85vh] flex items-center relative overflow-hidden bg-primary">
      <div className="container mx-auto px-8 md:px-12 lg:px-16 relative z-10">
        <div className="flex flex-col lg:flex-row items-center lg:items-center gap-1.5 lg:gap-2 pt-32 lg:pt-36 pb-24 lg:pb-28">
          {/* Text content - left side */}
          <div className="lg:w-[45%] text-center lg:text-left lg:pl-8">
            {/* Eyebrow text */}
            <p className="text-primary-foreground/80 font-body text-sm uppercase tracking-[0.3em] mb-12 animate-fade-in"> </p>

            {/* Main headline */}
            <h1 className="text-5xl md:text-6xl lg:text-7xl leading-[1.1] mb-10">
            <span className="text-white animate-fade-in font-script not-italic block text-6xl md:text-7xl lg:text-8xl mb-4 font-normal" style={{
              animationDelay: "0.1s",
              fontFamily: "'Playlist Script', cursive",
              textShadow: "0 2px 8px rgba(0, 0, 0, 0.3)"
            }}>
              Curated Events
              </span>
              <span className="text-primary-foreground animate-fade-in font-body text-3xl md:text-4xl lg:text-5xl" style={{
              animationDelay: "0.2s"
            }}>
                for{" "}
              </span>
              <span className="animate-fade-in font-body uppercase md:text-4xl lg:text-5xl text-3xl" style={{
              animationDelay: "0.3s",
              color: "hsl(35 65% 35%)"
            }}> MEDIA & ENTERTAINMENT INNOVATORS</span>
            </h1>

            {/* Subheadline */}
            <p className="text-primary-foreground/80 font-body text-lg max-w-xl mb-12 animate-fade-in leading-relaxed text-center mx-0 md:text-3xl" style={{
            animationDelay: "0.5s"
          }}>Connect, engage, and enjoy great company.</p>

            {/* CTA Buttons */}
            <motion.div className="flex flex-col sm:flex-row gap-5 justify-center lg:justify-start" initial={{
            opacity: 0,
            y: 20
          }} animate={{
            opacity: 1,
            y: 0
          }} transition={{
            delay: 0.6,
            duration: 0.5
          }}>
              <motion.div whileHover={{
              scale: 1.05
            }} whileTap={{
              scale: 0.98
            }}>
                <Button size="lg" onClick={onRegisterClick} className="bg-muted text-primary hover:bg-muted/80 font-body uppercase tracking-wider text-sm px-10 py-7 shadow-lg hover:shadow-xl transition-all duration-300 border border-border">
                  Join Us at the Next Event
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Button>
              </motion.div>
            </motion.div>
          </div>

          {/* People illustration - right side with parallax */}
          <motion.div className="lg:w-[55%] w-full origin-center lg:ml-8" style={{
          y,
          scale
        }}>
            <img src={heroPeople} alt="People networking at events" className="w-full h-auto" />
          </motion.div>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 animate-bounce">
        <div className="w-6 h-10 border-2 border-primary-foreground/50 rounded-full flex justify-center pt-2">
          <div className="w-1 h-2 bg-primary-foreground rounded-full" />
        </div>
      </div>
    </section>;
};
export default HeroSection;