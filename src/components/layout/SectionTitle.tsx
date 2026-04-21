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
      lineHeight: "1.12",
      weight: "300",
      accentWeight: "400",
    },
  };

  try {
    const ctx = useSectionStyleDefaults();
    if (ctx) defaults = ctx;
  } catch {}

  const st = defaults.styleTitle;

  const finalAlign: Align = align ?? st.align;

  const titleColor =
    tone === "dark"
      ? "text-[#0F172A]"
      : tone === "muted"
      ? "text-white/90"
      : "text-white";

  const eyebrowColor =
    tone === "dark" ? "text-[#475569]" : "text-white/55";

  const subColor =
    tone === "dark" ? "text-[#64748B]" : "text-white/70";

  const wrapAlign =
    finalAlign === "left"
      ? "text-left"
      : finalAlign === "right"
      ? "text-right"
      : "text-center";

  const accentColor =
    tone === "dark" ? "text-[#27CDBA]" : "text-primary/70";

  const isString = typeof children === "string";
  let first: ReactNode = children;
  let second: string | undefined;

  if (isString) {
    const words = children.trim().split(/\s+/);
    first = words[0] ?? "";
    second = words.slice(1).join(" ");
  }

  const weightStyle = { fontWeight: Number(st.weight) || 300 };
  const accentWeightStyle = { fontWeight: Number(st.accentWeight) || 400 };

  return (
    <div className={`${wrapAlign} mb-6 md:mb-8`}>
      {eyebrow && (
        <p
          className={`${eyebrowColor} mb-2 font-body text-[0.82rem] uppercase tracking-[0.18em]`}
        >
          {eyebrow}
        </p>
      )}

      <h2
        className={[
          "font-[Montserrat]",
          titleColor,
          "text-[2rem] sm:text-[2.2rem] md:text-[2.35rem]",
          "leading-[1.12] tracking-tight",
          className,
        ].join(" ")}
        style={weightStyle}
      >
        {isString ? (
          <>
            {first}{" "}
            {second &&
              (disableEmphasis ? (
                <span>{second}</span>
              ) : (
                <span className={accentColor} style={accentWeightStyle}>
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
          className={`${subColor} mt-3 max-w-[48ch] font-body text-[0.98rem] leading-[1.6]`}
        >
          {sub}
        </p>
      )}
    </div>
  );
}