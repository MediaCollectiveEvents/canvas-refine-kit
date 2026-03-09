// src/components/layout/SectionTitle.tsx

import { ReactNode } from "react";
import { useSectionStyleDefaults } from "../../lib/SectionStyleProvider";

type Align = "center" | "left" | "right";
type Tone = "default" | "muted" | "dark";

interface SectionTitleProps {
  children: ReactNode;
  sub?: string;
  eyebrow?: string;
  align?: Align;
  tone?: Tone;
  disableEmphasis?: boolean;
  className?: string;
}

export default function SectionTitle({
  children,
  sub,
  eyebrow,
  align,
  tone = "default",
  disableEmphasis,
  className = "",
}: SectionTitleProps) {
  let defaults: any = {
    styleTitle: {
      align: "center",
      tone: "default",
      disableEmphasis: false,
      eyebrow: "",
      sub: "",
      size: "2rem",
      sizeSm: "2.2rem",
      sizeMd: "2.35rem",
      lineHeight: "1.15",
      weight: "300",
      accentWeight: "400"
    }
  };

  try {
    const ctx = useSectionStyleDefaults();
    if (ctx) defaults = ctx;
  } catch {}

  const st = defaults.styleTitle;

  const finalAlign: Align = align ?? st.align;

  // NEW: tone system
  const titleColor =
    tone === "dark"
      ? "text-[#0F172A]"
      : tone === "muted"
      ? "text-white/90"
      : "text-white";

  const eyebrowColor =
    tone === "dark" ? "text-[#475569]" : "text-white/50";

  const subColor =
    tone === "dark" ? "text-[#64748B]" : "text-white/60";

  const wrapAlign =
    finalAlign === "left"
      ? "text-left"
      : finalAlign === "right"
      ? "text-right"
      : "text-center";

  const accentColor =
    tone === "dark" ? "text-[#27CDBA]" : "text-primary/70";

  // split words if string
  const isString = typeof children === "string";
  let first: ReactNode = children;
  let second: string | undefined;

  if (isString) {
    const words = children.trim().split(/\s+/);
    first = words[0] ?? "";
    second = words.slice(1).join(" ");
  }

  return (
    <div className={`${wrapAlign} mb-10`}>
      {eyebrow && (
        <p
          className={`${eyebrowColor} font-body text-[11px] uppercase tracking-[0.22em] mb-2`}
        >
          {eyebrow}
        </p>
      )}

      <h2
        className={[
          `font-[Montserrat]`,
          titleColor,
          `font-[${st.weight}]`,
          `text-[${st.size}] sm:text-[${st.sizeSm}] md:text-[${st.sizeMd}]`,
          `leading-[${st.lineHeight}] tracking-tight`,
          className,
        ].join(" ")}
      >
        {isString ? (
          <>
            {first}{" "}
            {second &&
              (disableEmphasis ? (
                <span>{second}</span>
              ) : (
                <span className={`${accentColor} font-[${st.accentWeight}]`}>
                  {second}
                </span>
              ))}
          </>
        ) : (
          children
        )}
      </h2>

      {sub && (
        <p
          className={`${subColor} font-body text-sm uppercase tracking-[0.18em] mt-3`}
        >
          {sub}
        </p>
      )}
    </div>
  );
}
