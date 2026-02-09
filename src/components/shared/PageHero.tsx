import React, { useRef } from "react";
import { useScroll } from "framer-motion";
import HeroParallaxLayer, { LayerSettings } from "./HeroParallaxLayer";
import heroPresetsJson from "@/content/heroPresets.json";

type HeroPresetKey =
  | "home"
  | "about"
  | "events"
  | "partners"
  | "blog"
  | "contact";

type HeroPreset = {
  name: string;
  layers: {
    bg?: LayerSettings;
    back?: LayerSettings;
    mid?: LayerSettings;
    front?: LayerSettings;
  };
  vignetteStrength?: number;
};

type HeroPresets = Record<HeroPresetKey, HeroPreset>;
const heroPresets = heroPresetsJson as HeroPresets;

interface PageHeroProps {
  heroPreset: HeroPresetKey;
  eyebrow?: string;
  title: string;
  description?: string;
  className?: string;
}

const LAYER_PATHS = {
  bg: "/hero/layers/bg.png",
  back: "/hero/layers/back.png",
  mid: "/hero/layers/mid.png",
  front: "/hero/layers/front.png",
};

const PageHero: React.FC<PageHeroProps> = ({
  heroPreset,
  eyebrow,
  title,
  description,
  className = "",
}) => {
  // Safe preset lookup with fallback to "home"
  const preset: HeroPreset = heroPresets[heroPreset] ?? heroPresets.home;
  const layers = preset.layers ?? {};

  // Keep this subtle; presets can override
  const vignetteStrength = preset.vignetteStrength ?? 0.18;

  const ref = useRef<HTMLDivElement | null>(null);

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });

  return (
    <div ref={ref} className={`relative h-[70vh] overflow-hidden ${className}`}>
      {/* Parallax layers */}
      {layers.bg && (
        <HeroParallaxLayer
          src={LAYER_PATHS.bg}
          settings={layers.bg}
          scrollYProgress={scrollYProgress}
          isBackground
        />
      )}

      {layers.back && (
        <HeroParallaxLayer
          src={LAYER_PATHS.back}
          settings={layers.back}
          scrollYProgress={scrollYProgress}
        />
      )}

      {layers.mid && (
        <HeroParallaxLayer
          src={LAYER_PATHS.mid}
          settings={layers.mid}
          scrollYProgress={scrollYProgress}
        />
      )}

      {layers.front && (
        <HeroParallaxLayer
          src={LAYER_PATHS.front}
          settings={layers.front}
          scrollYProgress={scrollYProgress}
        />
      )}

      {/* ✅ Very light readability vignette (no grey wash, no “miserable” look) */}
      {vignetteStrength > 0 && (
        <div
          className="absolute inset-0 pointer-events-none z-10"
          style={{
            background: `radial-gradient(ellipse at center,
              rgba(0,0,0,${vignetteStrength}) 0%,
              rgba(0,0,0,0.10) 45%,
              rgba(0,0,0,0) 75%)`,
          }}
        />
      )}

      {/* ✅ Text overlay (this is what got broken) */}
      <div className="relative z-20 h-full flex flex-col items-center justify-center text-center px-6">
        {eyebrow && (
          <p className="uppercase tracking-widest text-primary mb-2">
            {eyebrow}
          </p>
        )}

        <h1 className="font-satisfy text-5xl md:text-7xl text-white">
          {title}
        </h1>

        {description && (
          <p className="mt-4 text-primary text-lg md:text-xl max-w-2xl">
            {description}
          </p>
        )}
      </div>
    </div>
  );
};

export default PageHero;
