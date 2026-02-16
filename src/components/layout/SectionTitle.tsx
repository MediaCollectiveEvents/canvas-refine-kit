// src/components/layout/SectionTitle.tsx
import { ReactNode } from "react";
import { useSectionStyleDefaults } from "@/lib/SectionStyleProvider";

type Align = "center" | "left" | "right";
type Tone = "default" | "muted";

interface SectionTitleProps {
  children: ReactNode;
  sub?: string;
  eyebrow?: string;
  align?: Align;
  tone?: Tone;
  disableEmphasis?: boolean;
}

export default function SectionTitle({
  children,
  sub,
  eyebrow,
  align,
  tone,
  disableEmphasis,
}: SectionTitleProps) {
  const defaults = useSectionStyleDefaults();
  const effectiveAlign: Align =
    align ?? (defaults.styleTitle.align as Align) ?? "center";
  const effectiveTone: Tone =
    tone ?? (defaults.styleTitle.tone as Tone) ?? "default";
  const effectiveDisable =
    disableEmphasis ?? defaults.styleTitle.disableEmphasis ?? false;
  const effectiveEyebrow = eyebrow ?? defaults.styleTitle.eyebrow ?? "";
  const effectiveSub = sub ?? defaults.styleTitle.sub ?? "";

  const isString = typeof children === "string";
  let first: ReactNode = children;
  let second: string | undefined;

  if (isString) {
    const words = (children as string).trim().split(/\s+/);
    first = words[0] ?? "";
    second = words.slice(1).join(" ");
  }

  const wrapAlign =
    effectiveAlign === "left"
      ? "text-left"
      : effectiveAlign === "right"
        ? "text-right"
        : "text-center";

  const titleColor = effectiveTone === "muted" ? "text-white/90" : "text-white";
  const subColor = "text-white/60";
  const eyebrowColor = "text-white/50";

  return (
    <div className={`${wrapAlign} mb-10`}>
      {effectiveEyebrow && (
        <p
          className={`${eyebrowColor} font-body text-[11px] sm:text-xs uppercase tracking-[0.22em] mb-2`}
        >
          {effectiveEyebrow}
        </p>
      )}

      <h2
        className={[
          "font-sans font-light",
          titleColor,
          "text-4xl md:text-5xl lg:text-6xl",
          "tracking-tight leading-tight",
        ].join(" ")}
      >
        {isString ? (
          <>
            {first}{" "}
            {second &&
              (effectiveDisable ? (
                <span>{second}</span>
              ) : (
                <span className="italic text-primary/70">{second}</span>
              ))}
          </>
        ) : (
          children
        )}
      </h2>

      {effectiveSub && (
        <p
          className={`${subColor} font-body text-sm uppercase tracking-[0.18em] mt-3`}
        >
          {effectiveSub}
        </p>
      )}
    </div>
  );
}
