interface HeroEffectsProps {
  lighten?: number; // 0–1 CMS-driven
  tintColor?: string; // optional future use
  tintStrength?: number; // optional future use
}

export default function HeroEffects({
  lighten = 0,
  tintColor,
  tintStrength = 0,
}: HeroEffectsProps) {
  return (
    <>
      {/* LIGHTENING LAYER */}
      {lighten > 0 && (
        <div
          className="absolute inset-0 pointer-events-none mix-blend-screen"
          style={{
            backgroundColor: `rgba(255,255,255,${lighten})`
          }}
        />
      )}

      {/* TINT LAYER (future option – currently off) */}
      {tintColor && tintStrength > 0 && (
        <div
          className="absolute inset-0 pointer-events-none mix-blend-overlay"
          style={{
            backgroundColor: tintColor,
            opacity: tintStrength,
          }}
        />
      )}
    </>
  );
}