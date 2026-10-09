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
  const defaults = useSectionStyleDefaults();

  const st = defaults.styleTitle;

  const finalAlign: Align = align ?? st.align;

  const titleColor =
    tone === "dark"
      ? "text-[#0F172A]"
      : tone === "muted"
      ? "text-white/90"
      : "text-white";

  const eyebrowColor =
    tone === "dark" ? "text-slate-500" : "text-[#9bd3c8]";

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
          className={`${eyebrowColor} mb-2 site-eyebrow`}
        >
          {eyebrow}
        </p>
      )}

      <h2
        className={[
          "site-heading",
          titleColor,
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
          className={`${subColor} mt-3 max-w-[48ch] font-body text-base leading-[1.6]`}
        >
          {sub}
        </p>
      )}
    </div>
  );
}