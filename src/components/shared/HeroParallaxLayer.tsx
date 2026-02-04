import React from "react";
import {
  motion,
  useTransform,
  useReducedMotion,
  MotionValue,
} from "framer-motion";

export type LayerSettings = {
  visible?: boolean;
  opacity?: number;
  ySpeed?: number;
  blur?: number;
  scale?: number;
};

interface HeroParallaxLayerProps {
  src: string;
  settings?: LayerSettings;
  scrollYProgress: MotionValue<number>;
  isBackground?: boolean;
}

const HeroParallaxLayer: React.FC<HeroParallaxLayerProps> = ({
  src,
  settings,
  scrollYProgress,
  isBackground = false,
}) => {
  const reduceMotion = useReducedMotion();

  // If settings missing or explicitly invisible, skip render entirely
  if (!settings?.visible) return null;

  const opacity = settings.opacity ?? 1;
  const ySpeed = settings.ySpeed ?? 0;
  const blur = settings.blur ?? 0;
  const scale = settings.scale ?? 1;

  const y = useTransform(
    scrollYProgress,
    [0, 1],
    reduceMotion ? [0, 0] : [0, ySpeed * 50],
  );

  return (
    <motion.img
      src={src}
      alt=""
      aria-hidden="true"
      decoding="async"
      // Above-the-fold hero: prefer eager to avoid visible pop
      loading={isBackground ? "eager" : "eager"}
      style={{
        opacity,
        y,
        scale,
        ...(blur > 0 ? { filter: `blur(${blur}px)` } : null),
      }}
      className="absolute -inset-[6%] w-[112%] h-[112%] object-cover will-change-transform"
    />
  );
};

export default HeroParallaxLayer;
