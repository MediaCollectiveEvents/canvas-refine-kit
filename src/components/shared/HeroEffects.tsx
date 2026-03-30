interface HeroEffectsProps {
  lighten?: number;
  tintColor?: string;
  tintStrength?: number;
}

export default function HeroEffects({
  lighten = 0,
  tintColor,
  tintStrength = 0,
}: HeroEffectsProps) {
  return (
    <>
      {lighten > 0 && (
        <div
          className="absolute inset-0 pointer-events-none mix-blend-screen"
          style={{
            backgroundColor: `rgba(255,255,255,${lighten})`,
          }}
        />
      )}

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